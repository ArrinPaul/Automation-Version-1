import { Response, NextFunction } from 'express';
import { AuthRequest, SUPER_ADMIN_ROLES, TRANSACTION_CREATE_ROLES } from './verifyToken';
import { AppError } from './errorHandler';

/**
 * Restricts transaction line-item access to super admins only.
 * SOCIETY_FACULTY and below cannot see individual transaction records — only balance.
 */
export const restrictTransactions = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('User not authenticated', 401));

  if (!SUPER_ADMIN_ROLES.includes(req.user.role)) {
    return next(new AppError(
      'Financial transaction details are restricted to SB_FACULTY and SB_OB. Use /api/transactions/balance to view aggregated balance.',
      403
    ));
  }

  next();
};
