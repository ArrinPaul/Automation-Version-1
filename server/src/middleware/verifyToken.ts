import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';
import { AppError } from './errorHandler';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const prisma = new PrismaClient();

const isRole = (value: unknown): value is Role => {
  return typeof value === 'string' && Object.values(Role).includes(value as Role);
};

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    societyId?: string | null;
  };
}

export const verifyToken = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid authorization header', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Unauthorized', 401));
    }

    const metadataRole = user.user_metadata?.role;
    const metadataSocietyId = user.user_metadata?.societyId;

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, societyId: true, email: true }
    });

    const resolvedRole = isRole(metadataRole) ? metadataRole : profile?.role;
    const resolvedSocietyId = typeof metadataSocietyId === 'string' ? metadataSocietyId : profile?.societyId;

    if (!resolvedRole) {
      return next(new AppError('Unauthorized: role not configured', 401));
    }

    req.user = {
      id: user.id,
      email: user.email ?? profile?.email ?? '',
      role: resolvedRole,
      societyId: resolvedSocietyId,
    };

    next();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Invalid token', 401));
  }
};
