import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient, Role } from '@prisma/client';
import { AppError } from './errorHandler';
import { env } from '../config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
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

/** Roles that have global (cross-society) read/write access */
export const SUPER_ADMIN_ROLES: Role[] = [Role.SB_FACULTY, Role.SB_OB];

/** Roles that can approve transactions */
export const APPROVER_ROLES: Role[] = [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY];

/** Roles that can create transactions */
export const TRANSACTION_CREATE_ROLES: Role[] = [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR];

/** Roles that can manage society operations (events, projects, calendar, announcements) */
export const SOCIETY_OPS_ROLES: Role[] = [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR, Role.SOCIETY_OB];

/** Roles that can manage users (provision, delete, change roles) */
export const USER_MGMT_ROLES: Role[] = [Role.SB_FACULTY];

const applyE2ETestUser = (req: AuthRequest) => {
  if (process.env.NODE_ENV === 'production' && process.env.E2E_TEST_MODE !== 'true') return false;
  const testRole = req.headers['x-e2e-user-role'];
  if (typeof testRole !== 'string' || !isRole(testRole)) return false;
  req.user = {
    id: typeof req.headers['x-e2e-user-id'] === 'string' ? req.headers['x-e2e-user-id'] : 'e2e-user-id',
    email: typeof req.headers['x-e2e-user-email'] === 'string' ? req.headers['x-e2e-user-email'] : 'e2e-user@ieee.test',
    role: testRole,
    societyId: typeof req.headers['x-e2e-society-id'] === 'string' ? req.headers['x-e2e-society-id'] : null,
  };
  return true;
};

export const verifyToken = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (applyE2ETestUser(req)) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next(new AppError('Missing or invalid authorization header', 401));

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return next(new AppError('Unauthorized', 401));

    const metadataRole = user.user_metadata?.role;
    const metadataSocietyId = user.user_metadata?.societyId;

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, societyId: true, email: true },
    });

    const resolvedRole = isRole(metadataRole) ? metadataRole : profile?.role;
    const resolvedSocietyId = typeof metadataSocietyId === 'string' ? metadataSocietyId : profile?.societyId;

    if (!resolvedRole) return next(new AppError('Unauthorized: role not configured', 401));

    req.user = {
      id: user.id,
      email: user.email ?? profile?.email ?? '',
      role: resolvedRole,
      societyId: resolvedSocietyId,
    };

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid token';
    return next(new AppError(message, 401));
  }
};
