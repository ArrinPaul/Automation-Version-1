import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return next(new AppError(error.message, 401));

    const user = await prisma.user.findUnique({
      where: { email },
      include: { society: true }
    });

    if (!user) return next(new AppError('User profile not found', 404));

    logger.info(`User logged in: ${email}`);

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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { society: true }
    });
    
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
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role: role as Role,
        societyId,
      },
    });

    logger.info(`New user registered: ${email} with role ${role}`);

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
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole as Role,
        societyId: societyId || null,
      },
    });

    logger.info(`User ${userId} role changed to ${newRole}`);

    res.json(updatedUser);
  } catch (err: any) {
    next(err);
  }
};
