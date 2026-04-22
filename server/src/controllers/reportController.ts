import { NextFunction, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const escapeCsv = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return '';
  }

  const raw = String(value);
  const hardened = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const normalized = hardened.replaceAll('"', '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
};

const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const sanitizeFileToken = (value: string) => {
  const sanitized = value.replaceAll(/[^a-zA-Z0-9-_]/g, '');
  return sanitized.slice(0, 48) || 'global';
};

const toAmountNumber = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toNumber' in value) {
    const maybeDecimal = value as { toNumber: () => number };
    const parsed = maybeDecimal.toNumber();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const downloadFinancialCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (req.user.role !== Role.MANAGEMENT) {
      return next(new AppError('Forbidden: Financial CSV line-item export is restricted to management', 403));
    }

    const requestedSocietyId = typeof req.query.societyId === 'string' ? req.query.societyId : undefined;

    if (requestedSocietyId && !isUuid(requestedSocietyId)) {
      return next(new AppError('Invalid societyId query parameter format', 400));
    }

    const scopedSocietyId = requestedSocietyId;

    const transactions = await prisma.transaction.findMany({
      where: scopedSocietyId ? { societyId: scopedSocietyId } : {},
      include: {
        society: {
          select: {
            id: true,
            shortName: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

    const now = new Date();
    const scopeLabel = scopedSocietyId ? 'SOCIETY' : 'GLOBAL';

    const headerRows = [
      ['Confidential - IEEE Finance Pro Financial Export'],
      ['Institution', 'IEEE Student Branch Christ University'],
      ['Generated At', now.toISOString()],
      ['Scope', scopeLabel],
      ['Summary Total Income', totalIncome.toFixed(2)],
      ['Summary Total Expense', totalExpense.toFixed(2)],
      ['Summary Net Flow', (totalIncome - totalExpense).toFixed(2)],
      [],
      ['Date', 'Society', 'Type', 'Category', 'Description', 'Status', 'Amount (INR)'],
    ];

    const dataRows = transactions.map((transaction) => [
      transaction.date.toISOString(),
      transaction.society.shortName || transaction.society.name,
      transaction.type,
      transaction.category,
      transaction.description,
      transaction.status,
      toAmountNumber(transaction.amount).toFixed(2),
    ]);

    const csvContent = [...headerRows, ...dataRows]
      .map((row) => row.map((column) => escapeCsv(column)).join(','))
      .join('\n');

    const fileSuffix = scopedSocietyId ? `society-${sanitizeFileToken(scopedSocietyId)}` : 'global';
    const filename = `financial-report-${fileSuffix}-${now.toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate financial CSV export';
    return next(new AppError(errorMessage, 500));
  }
};
