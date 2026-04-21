import { Request, Response } from 'express';
import { generateFinancialAudit } from '../services/geminiService';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';

const prisma = new PrismaClient();

export const getAudit = async (req: AuthRequest, res: Response) => {
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
  } catch (err) {
    res.status(500).json({ error: 'Audit generation failed' });
  }
};
