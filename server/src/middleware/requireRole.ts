import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};
