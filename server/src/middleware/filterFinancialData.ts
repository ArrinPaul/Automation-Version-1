import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

/**
 * Middleware to intercept responses and filter out transaction details
 * for non-management roles, leaving only the balance.
 * Note: It's better to filter at the query level, but this serves as a safety net.
 */
export const filterFinancialData = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === Role.MEMBER) {
    return next(new AppError('Members are not permitted to access financial data routes.', 403));
  }

  const originalJson = res.json;

  res.json = function (data) {
    if (req.user && req.user.role !== Role.MANAGEMENT) {
      const filteredData = Array.isArray(data)
        ? data.map(item => filterSociety(item))
        : filterSociety(data);

      return originalJson.call(this, filteredData);
    }

    return originalJson.call(this, data);
  };

  next();
};

function filterSociety(society: any) {
  if (society?.budget !== undefined && society?.balance !== undefined) {
    const { transactions, budget, ...rest } = society;
    return { ...rest, balance: society.balance };
  }
  return society;
}
