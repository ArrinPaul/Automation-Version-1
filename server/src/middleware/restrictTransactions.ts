import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

/**
 * Middleware to restrict access to individual transaction line-items for non-management roles.
 *
 * - FACULTY_ADVISOR and SOCIETY_OB are blocked from viewing transaction details (403 Forbidden).
 * - These roles can only use the getBalance endpoint to view aggregated balance.
 * - MANAGEMENT and MEMBER roles are allowed through.
 */
export const restrictTransactions = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  if (req.user.role !== Role.MANAGEMENT) {
    return next(
      new AppError(
        'Financial transaction details are restricted to Management users. Use /api/transactions/balance to view aggregated balance.',
        403
      )
    );
  }

  next();
};
