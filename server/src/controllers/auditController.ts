import { Response, NextFunction } from 'express';
import { generateFinancialAudit } from '../services/geminiService';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { auditLogRepository } from '../repositories/auditLogRepository';

const prisma = new PrismaClient();

export const getAudit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isGlobal = req.user?.role === Role.MANAGEMENT;
    const societyId = req.user?.societyId;
    const where = isGlobal ? {} : { id: societyId! };

    const data = await prisma.society.findMany({
      where,
      include: { transactions: { take: 10, orderBy: { date: 'desc' } } }
    });

    const auditText = await generateFinancialAudit(data, isGlobal);
    res.json({ audit: auditText });
  } catch (err: any) {
    return next(new AppError(err?.message || 'Audit generation failed', 500));
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await auditLogRepository.findAll();
    return res.json(logs);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch audit logs', 500));
  }
};
