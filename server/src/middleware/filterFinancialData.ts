import { Response, NextFunction } from 'express';
import { AuthRequest, SUPER_ADMIN_ROLES } from './verifyToken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

/**
 * Filters financial data (budget, transactions) for non-super-admin roles.
 * MEMBER is blocked entirely. Others see balance but not budget/transactions.
 */
export const filterFinancialData = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === Role.MEMBER) {
    return next(new AppError('Members are not permitted to access financial data routes.', 403));
  }

  const originalJson = res.json;

  res.json = function (data) {
    if (req.user && !SUPER_ADMIN_ROLES.includes(req.user.role)) {
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        const payload = (data as any).data;
        const filteredPayload = Array.isArray(payload)
          ? payload.map((item) => filterSociety(item))
          : filterSociety(payload);
        return originalJson.call(this, { ...data, data: filteredPayload });
      }
      const filteredData = Array.isArray(data)
        ? data.map((item) => filterSociety(item))
        : filterSociety(data);
      return originalJson.call(this, filteredData);
    }
    return originalJson.call(this, data);
  };

  next();
};

type FinancialRecord = Record<string, unknown> & { budget?: unknown; balance?: unknown; transactions?: unknown; };

function filterSociety(society: unknown): unknown {
  if (typeof society === 'object' && society !== null) {
    const typedSociety = society as FinancialRecord;
    const { transactions, budget, ...rest } = typedSociety;
    return rest;
  }
  return society;
}
