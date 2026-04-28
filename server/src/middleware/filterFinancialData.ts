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
      // Handle standard API response wrappers (e.g., { success: true, data: [...] })
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        const payload = (data as any).data;
        const filteredPayload = Array.isArray(payload)
          ? payload.map((item) => filterSociety(item))
          : filterSociety(payload);

        return originalJson.call(this, { ...data, data: filteredPayload });
      }

      // Handle raw arrays or objects
      const filteredData = Array.isArray(data)
        ? data.map((item) => filterSociety(item))
        : filterSociety(data);

      return originalJson.call(this, filteredData);
    }

    return originalJson.call(this, data);
  };

  next();
};

type FinancialRecord = Record<string, unknown> & {
  budget?: unknown;
  balance?: unknown;
  transactions?: unknown;
};

function filterSociety(society: unknown): unknown {
  if (typeof society === 'object' && society !== null) {
    const typedSociety = society as FinancialRecord;

    // Create a copy to avoid mutating the original object
    const { transactions, budget, ...rest } = typedSociety;

    // Return the rest of the object. Balance is retained if it exists in 'rest'
    return rest;
  }

  return society;
}
