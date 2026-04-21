import { Request, Response, NextFunction } from 'express';
import { Prisma, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return next(new AppError(error.message, 401));

    const user = await userRepository.findByEmailWithSociety(email);

    if (!user) return next(new AppError('User profile not found', 404));

    logger.info({
      actorId: user.id,
      resource: 'auth',
      action: 'login',
      status: 'success',
      email,
    });

    await writeAuditLog(user.id, 'LOGIN', 'AUTH', { email });

    res.json({
      session: data.session,
      user: user,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Not authenticated', 401));

  try {
    const user = await userRepository.findByIdWithSociety(req.user.id);
    
    if (!user) return next(new AppError('User not found', 404));
    
    res.json(user);
  } catch (err: any) {
    next(err);
  }
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password, name, role, societyId } = req.body;

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
  } catch (err: any) {
    next(err);
  }
};

export const changeRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId, newRole, societyId } = req.body;

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
  } catch (err: any) {
    next(err);
  }
};
