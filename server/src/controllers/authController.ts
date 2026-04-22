import { Request, Response, NextFunction } from 'express';
import { Prisma, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import { userRepository } from '../repositories/userRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const writeAuditLog = async (
  userId: string,
  action: string,
  resource: string,
  details?: Prisma.InputJsonValue
) => {
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

const roleSchema = z.enum(['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER']);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: roleSchema,
  societyId: z.string().uuid().nullable().optional(),
});

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: roleSchema,
  societyId: z.string().uuid().nullable().optional(),
});

const logAuthFailure = (action: string, error: unknown, metadata?: Record<string, unknown>) => {
  logger.warn({ action, status: 'failed', error, ...metadata }, 'Authentication flow failed');
};

const toAppError = (error: unknown, fallbackMessage: string, fallbackStatusCode = 500) => {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(fallbackMessage, fallbackStatusCode);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      return next(new AppError('Invalid login payload', 400));
    }

    const { email, password } = parseResult.data;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logAuthFailure('login', authError, { email });
      return next(new AppError(authError.message, 401));
    }

    if (!authData.user || !authData.session) {
      logAuthFailure('login', 'missing auth data', { email });
      return next(new AppError('Authentication failed', 401));
    }

    const user = await userRepository.findByIdWithSociety(authData.user.id);

    if (!user) {
      logAuthFailure('login', 'profile missing', { email, authUserId: authData.user.id });
      return next(new AppError('User profile not found', 404));
    }

    const { error: syncError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        role: user.role,
        societyId: user.societyId,
        name: user.name,
      },
    });

    if (syncError) {
      logger.warn({ userId: user.id, error: syncError }, 'Failed to sync auth metadata during login');
    }

    logger.info({
      actorId: user.id,
      resource: 'auth',
      action: 'login',
      status: 'success',
      email,
    });

    await writeAuditLog(user.id, 'LOGIN', 'AUTH', { email });

    res.json({
      session: authData.session,
      user: user,
    });
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

  if (!parseResult.success) {
    return next(new AppError('Invalid register payload', 400));
  }

  const { email, password, name, role, societyId } = parseResult.data;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, societyId, name }
    });

    if (authError) return next(new AppError(authError.message, 400));

    // 2. Create user profile in Prisma
    const newUser = await userRepository.createWithExternalId({
      id: authData.user.id,
      email,
      name,
      role: role as Role,
      societyId: societyId || null,
    });

    logger.info({
      actorId: req.user?.id,
      resource: 'user',
      action: 'register',
      status: 'success',
      targetUserId: newUser.id,
      targetRole: role,
    });

    if (req.user?.id) {
      await writeAuditLog(req.user.id, 'REGISTER_USER', 'USER', {
        targetUserId: newUser.id,
        email,
        role,
        societyId: societyId || null,
      });
    }

    res.status(201).json(newUser);
  } catch (err: unknown) {
    logger.warn({ actorId: req.user?.id, error: err, email }, 'Failed to register user');
    next(toAppError(err, 'Failed to register user'));
  }
};

export const changeRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parseResult = changeRoleSchema.safeParse(req.body);

  if (!parseResult.success) {
    return next(new AppError('Invalid role change payload', 400));
  }

  const { userId, newRole, societyId } = parseResult.data;

  try {
    // Update Supabase metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole, societyId }
    });

    if (authError) return next(new AppError(authError.message, 400));

    // Update Prisma
    const updatedUser = await userRepository.updateRoleAndSociety(userId, newRole as Role, societyId || null);

    logger.info({
      actorId: req.user?.id,
      resource: 'user',
      action: 'change_role',
      status: 'success',
      targetUserId: userId,
      targetRole: newRole,
    });

    if (req.user?.id) {
      await writeAuditLog(req.user.id, 'CHANGE_ROLE', 'USER', {
        targetUserId: userId,
        newRole,
        societyId: societyId || null,
      });
    }

    res.json(updatedUser);
  } catch (err: unknown) {
    logger.warn({ actorId: req.user?.id, error: err, targetUserId: userId }, 'Failed to change user role');
    next(toAppError(err, 'Failed to change user role'));
  }
};
