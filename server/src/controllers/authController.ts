import { Request, Response, NextFunction } from 'express';
import { Prisma, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import { userRepository } from '../repositories/userRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { env } from '../config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const writeAuditLog = async (userId: string, action: string, resource: string, details?: Prisma.InputJsonValue) => {
  try {
    await auditLogRepository.create({ userId, action, resource, details });
  } catch (error) {
    logger.warn({ action, resource, userId, status: 'audit_log_failed', error }, 'Failed to persist audit log');
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const roleSchema = z.enum(['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER']);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: roleSchema,
  societyId: z.string().uuid().nullable().optional(),
});

const registerPublicSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  category: z.enum(['SB_FACULTY', 'SB_OB', 'SOCIETY']),
  position: z.string().min(1),
  societyId: z.string().uuid().optional(),
});

const setupFirstAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  setupKey: z.string().min(1),
});

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: roleSchema,
  societyId: z.string().uuid().nullable().optional(),
});

const logAuthFailure = (action: string, error: unknown, metadata?: Record<string, unknown>) => {
  logger.warn({ action, status: 'failed', error, ...metadata }, 'Authentication flow failed');
};

type LoginUser = NonNullable<Awaited<ReturnType<typeof userRepository.findByIdWithSociety>>>;

const syncLoginSideEffects = (user: LoginUser, email: string) => {
  void supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { role: user.role, societyId: user.societyId, name: user.name },
  }).then(({ error }) => {
    if (error) {
      logger.warn({ userId: user.id, error }, 'Failed to sync auth metadata during login');
    }
  }).catch((error) => {
    logger.warn({ userId: user.id, error }, 'Failed to sync auth metadata during login');
  });

  void writeAuditLog(user.id, 'LOGIN', 'AUTH', { email });
};

const toAppError = (error: unknown, fallbackMessage: string, fallbackStatusCode = 500) => {
  if (error instanceof AppError) return error;
  return new AppError(fallbackMessage, fallbackStatusCode);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) return next(new AppError('Invalid login payload', 400));

    const { email, password } = parseResult.data;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) { logAuthFailure('login', authError, { email }); return next(new AppError(authError.message, 401)); }
    if (!authData.user || !authData.session) { logAuthFailure('login', 'missing auth data', { email }); return next(new AppError('Authentication failed', 401)); }

    const user = await userRepository.findByIdWithSociety(authData.user.id);
    if (!user) { logAuthFailure('login', 'profile missing', { email }); return next(new AppError('User profile not found', 404)); }

    logger.info({ actorId: user.id, resource: 'auth', action: 'login', status: 'success', email });
    syncLoginSideEffects(user, email);

    res.json({ session: authData.session, user });
  } catch (err: unknown) {
    logAuthFailure('login', err);
    next(toAppError(err, 'Login failed'));
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Not authenticated', 401));
  try {
    const user = await userRepository.findByIdWithSociety(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json(user);
  } catch (err: unknown) {
    logger.warn({ actorId: req.user?.id, error: err }, 'Failed to retrieve current user profile');
    next(toAppError(err, 'Failed to retrieve current user profile'));
  }
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) return next(new AppError('Invalid register payload', 400));

  const { email, password, name, role, societyId } = parseResult.data;

  try {
    // Permission checks based on requester's role
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const canRegisterRole = (requesterRole: Role, targetRole: Role): boolean => {
      switch (requesterRole) {
        case Role.SB_FACULTY:
          // SB Faculty can register any role
          return true;
        case Role.SB_OB:
          // SB OB can register SOCIETY_FACULTY and SOCIETY_OB
          return [Role.SOCIETY_FACULTY, Role.SOCIETY_OB].includes(targetRole);
        case Role.SOCIETY_FACULTY:
        case Role.SOCIETY_CHAIR:
          // Society Faculty/Chair can register SOCIETY_OB and MEMBER for their society
          return [Role.SOCIETY_OB, Role.MEMBER].includes(targetRole);
        default:
          return false;
      }
    };

    if (!canRegisterRole(req.user.role, role as Role)) {
      return next(new AppError(`Insufficient permissions to register ${role} role`, 403));
    }

    // For society roles, ensure societyId matches requester's society (if applicable)
    if ([Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR, Role.SOCIETY_OB].includes(role as Role)) {
      if (req.user.role !== Role.SB_FACULTY && req.user.role !== Role.SB_OB) {
        if (!req.user.societyId || req.user.societyId !== societyId) {
          return next(new AppError('Can only register users for your own society', 403));
        }
      }
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role, societyId, name },
    });
    if (authError) return next(new AppError(authError.message, 400));

    const newUser = await userRepository.createWithExternalId({
      id: authData.user.id, email, name, role: role as Role, societyId: societyId || null,
    });

    logger.info({ actorId: req.user?.id, resource: 'user', action: 'register', status: 'success', targetUserId: newUser.id, targetRole: role });
    if (req.user?.id) await writeAuditLog(req.user.id, 'REGISTER_USER', 'USER', { targetUserId: newUser.id, email, role, societyId: societyId || null });

    res.status(201).json(newUser);
  } catch (err: unknown) {
    logger.warn({ actorId: req.user?.id, error: err, email }, 'Failed to register user');
    next(toAppError(err, 'Failed to register user'));
  }
};

export const changeRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parseResult = changeRoleSchema.safeParse(req.body);
  if (!parseResult.success) return next(new AppError('Invalid role change payload', 400));

  const { userId, newRole, societyId } = parseResult.data;

  try {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole, societyId },
    });
    if (authError) return next(new AppError(authError.message, 400));

    const updatedUser = await userRepository.updateRoleAndSociety(userId, newRole as Role, societyId || null);

    logger.info({ actorId: req.user?.id, resource: 'user', action: 'change_role', status: 'success', targetUserId: userId, targetRole: newRole });
    if (req.user?.id) await writeAuditLog(req.user.id, 'CHANGE_ROLE', 'USER', { targetUserId: userId, newRole, societyId: societyId || null });

    res.json(updatedUser);
  } catch (err: unknown) {
    logger.warn({ actorId: req.user?.id, error: err, targetUserId: userId }, 'Failed to change user role');
    next(toAppError(err, 'Failed to change user role'));
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userRepository.findAllWithSociety();
    res.json({ success: true, data: users, count: users.length });
  } catch (err: unknown) {
    next(toAppError(err, 'Failed to retrieve users'));
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId as string;
  if (!userId) return next(new AppError('User ID is required', 400));
  if (userId === req.user?.id) return next(new AppError('Cannot delete your own account', 400));

  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) return next(new AppError(error.message, 400));

    await userRepository.deleteById(userId);
    if (req.user?.id) await writeAuditLog(req.user.id, 'DELETE_USER', 'USER', { targetUserId: userId });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: unknown) {
    next(toAppError(err, 'Failed to delete user'));
  }
};

export const checkInitialized = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingUsers = await userRepository.findAll();
    const isInitialized = existingUsers && existingUsers.length > 0;
    res.json({ initialized: isInitialized, userCount: existingUsers?.length || 0 });
  } catch (err: unknown) {
    logger.warn({ error: err }, 'Failed to check initialization status');
    return res.status(200).json({ initialized: false, userCount: 0, dbError: true });
  }
};

export const setupFirstAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = setupFirstAdminSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn({ error: parseResult.error }, 'Invalid setup payload');
      return next(new AppError('Invalid setup payload', 400));
    }

    const { email, password, name, setupKey } = parseResult.data;

    const existingUsers = await userRepository.findAll();
    if (existingUsers && existingUsers.length > 0) {
      logger.warn({ email, action: 'setupFirstAdmin', status: 'users_already_exist' }, 'Setup attempted but users already exist');
      return next(new AppError('System is already initialized. Use login instead.', 403));
    }

    const expectedSetupKey = env.SETUP_KEY;
    if (!expectedSetupKey || setupKey !== expectedSetupKey) {
      logger.warn({ email, action: 'setupFirstAdmin' }, 'Invalid setup key provided');
      return next(new AppError('Invalid setup key. First-time setup cannot proceed.', 401));
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role: 'SB_FACULTY', societyId: null, name },
    });

    if (authError) {
      logger.warn({ email, error: authError, action: 'setupFirstAdmin' }, 'Supabase user creation failed');
      return next(new AppError(`Failed to create admin: ${authError.message}`, 400));
    }

    const newUser = await userRepository.createWithExternalId({
      id: authData.user.id, email, name, role: 'SB_FACULTY' as Role, societyId: null,
    });

    logger.info({ userId: newUser.id, email, action: 'setupFirstAdmin', status: 'success' }, 'First admin user created successfully');

    const { data: authSession, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
    if (sessionError || !authSession.session) {
      logger.warn({ userId: newUser.id, error: sessionError }, 'Failed to create session after setup');
      return next(new AppError('Setup succeeded but session creation failed', 500));
    }

    res.status(201).json({ message: 'First admin user created successfully', user: newUser, session: authSession.session });
  } catch (err: unknown) {
    logger.warn({ error: err, action: 'setupFirstAdmin' }, 'Unexpected error during first admin setup');
    next(toAppError(err, 'First admin setup failed'));
  }
};

export const registerPublic = async (req: Request, res: Response, next: NextFunction) => {
  const parseResult = registerPublicSchema.safeParse(req.body);
  if (!parseResult.success) return next(new AppError('Invalid registration payload', 400));

  const { email, password, name, category, position, societyId } = parseResult.data;

  try {
    const existingUser = await userRepository.findByEmailWithSociety(email);
    if (existingUser) return next(new AppError('Email already registered', 409));

    // Map category to role: SOCIETY members can register themselves
    // SB_FACULTY and SB_OB require admin approval (should not be available for self-registration)
    let role: Role;
    if (category === 'SOCIETY') {
      // Determine if they're Faculty or OB based on position
      role = position.toLowerCase().includes('faculty') ? Role.SOCIETY_FACULTY : Role.SOCIETY_OB;
    } else if (category === 'SB_FACULTY' || category === 'SB_OB') {
      // These roles should be registered by admins only; reject self-registration
      return next(new AppError('SB Faculty and SB OB roles must be assigned by an administrator', 403));
    } else {
      return next(new AppError('Invalid category', 400));
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role, societyId: societyId || null, name },
    });

    if (authError) return next(new AppError(authError.message, 400));

    const newUser = await userRepository.createWithExternalId({
      id: authData.user.id, email, name, role, societyId: societyId || null,
    });

    logger.info({ resource: 'user', action: 'registerPublic', status: 'success', targetUserId: newUser.id, targetRole: role });
    await writeAuditLog(newUser.id, 'REGISTER_SELF', 'USER', { email, role, category, position });

    // Return user without session; they need to log in separately
    res.status(201).json({ success: true, message: 'Registration successful. Please log in.', user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (err: unknown) {
    logger.warn({ error: err, email }, 'Failed to register user publicly');
    next(toAppError(err, 'Registration failed'));
  }
};
