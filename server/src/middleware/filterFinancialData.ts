import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';
import { Role } from '@prisma/client';

/**
 * Middleware to intercept responses and filter out transaction details
 * for non-management roles, leaving only the balance.
 * Note: It's better to filter at the query level, but this serves as a safety net.
 */
export const filterFinancialData = (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (req.user && req.user.role !== Role.MANAGEMENT) {
      // If the data is a society object or list of society objects
      if (Array.isArray(data)) {
        data = data.map(item => filterSociety(item));
      } else {
        data = filterSociety(data);
      }

      // If the data contains transactions, block it completely if not management
      if (data && (data.transactions || (Array.isArray(data) && data.length > 0 && data[0].amount !== undefined))) {
        return res.status(403).json({ error: 'Forbidden: Financial transaction details restricted to Management' });
      }
    }
    return originalJson.call(this, data);
  };

  next();
};

function filterSociety(society: any) {
  if (society?.budget !== undefined && society?.balance !== undefined) {
    // If it's a society object, we might want to hide the budget breakdown or transactions
    const { transactions, budget, ...rest } = society;
    return { ...rest, balance: society.balance }; // Only keep balance
  }
  return society;
}
