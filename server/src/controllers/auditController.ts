import { Response, NextFunction } from 'express';
import { generateFinancialAudit } from '../services/geminiService';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { auditLogRepository } from '../repositories/auditLogRepository';

const prisma = new PrismaClient();

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

const getRequestedSocietyId = (req: AuthRequest) => {
  return typeof req.query.societyId === 'string' ? req.query.societyId : undefined;
};

const resolveAuditScope = (req: AuthRequest) => {
  const requestedSocietyId = getRequestedSocietyId(req);
  const isSuperAdmin = SUPER_ADMIN_ROLES.includes(req.user!.role);
  const targetSocietyId = isSuperAdmin ? requestedSocietyId : req.user?.societyId ?? undefined;

  if (!isSuperAdmin && !targetSocietyId) {
    throw new AppError('Forbidden: Society access required for audit generation', 403);
  }

  if (!isSuperAdmin && targetSocietyId && targetSocietyId !== req.user?.societyId) {
    throw new AppError('Forbidden: You do not have access to this society audit', 403);
  }

  return {
    targetSocietyId,
  };
};

const summarizeTransactions = (
  transactions: Array<{
    date: Date;
    amount: unknown;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    status: string;
  }>
) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

  const approvedCount = transactions.filter((transaction) => transaction.status === 'APPROVED').length;
  const pendingCount = transactions.filter((transaction) => transaction.status === 'PENDING').length;

  return {
    totalIncome,
    totalExpense,
    approvedCount,
    pendingCount,
    netFlow: totalIncome - totalExpense,
  };
};

const countWords = (content: string) => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

export const getAudit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const { targetSocietyId } = resolveAuditScope(req);

    const where = targetSocietyId ? { societyId: targetSocietyId } : {};

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
      select: {
        date: true,
        amount: true,
        type: true,
        category: true,
        status: true,
      },
    });

    const society = targetSocietyId
      ? await prisma.society.findUnique({
          where: { id: targetSocietyId },
          select: {
            id: true,
            name: true,
            shortName: true,
            balance: true,
          },
        })
      : null;

    if (targetSocietyId && !society) {
      return next(new AppError('Society not found for audit generation', 404));
    }

    const transactionSummary = summarizeTransactions(transactions);

    const inferredBalance = targetSocietyId
      ? toAmountNumber(society?.balance)
      : transactionSummary.netFlow;

    const auditText = await generateFinancialAudit({
      scope: targetSocietyId ? 'SOCIETY' : 'GLOBAL',
      institution: 'IEEE Student Branch Christ University',
      generatedAt: new Date().toISOString(),
      societyName: society?.shortName ?? society?.name,
      balance: inferredBalance,
      currency: 'INR',
      transactionSummary: {
        totalTransactions: transactions.length,
        totalIncome: transactionSummary.totalIncome,
        totalExpense: transactionSummary.totalExpense,
        netFlow: transactionSummary.netFlow,
        approvedCount: transactionSummary.approvedCount,
        pendingCount: transactionSummary.pendingCount,
        latestTransactionDate: transactions[0]?.date.toISOString(),
      },
      recentTransactions: transactions.slice(0, 12).map((transaction) => ({
        date: transaction.date.toISOString(),
        type: transaction.type,
        category: transaction.category,
        amount: toAmountNumber(transaction.amount),
        status: transaction.status,
      })),
    });

    const wordCount = countWords(auditText);

    return res.status(200).json({
      success: true,
      data: {
        analysis: auditText,
        generatedAt: new Date().toISOString(),
        scope: targetSocietyId ? 'SOCIETY' : 'GLOBAL',
        societyId: targetSocietyId ?? null,
        societyName: society?.name ?? null,
        wordCount,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return next(err);
    }

    const errorMessage = err instanceof Error ? err.message : 'Audit generation failed';
    return next(new AppError(errorMessage, 500));
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await auditLogRepository.findAll();
    return res.json(logs);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    return next(new AppError(errorMessage, 500));
  }
};
