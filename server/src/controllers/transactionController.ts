import { Response, NextFunction } from 'express';
import { transactionRepository } from '../repositories/transactionRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { z } from 'zod';
import { Role, TransactionType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  category: z.string(),
  description: z.string(),
  date: z.string().transform(str => new Date(str)),
  societyId: z.string().uuid(),
  receiptUrl: z.string().optional(),
});

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Strict isolation: Faculty Advisor and Society OB receive 403 on this endpoint
  if (req.user?.role === Role.FACULTY_ADVISOR || req.user?.role === Role.SOCIETY_OB) {
    return res.status(403).json({ error: 'Forbidden: Financial transaction details restricted to Management' });
  }

  const where: any = {};
  if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
    where.societyId = req.user.societyId;
  }

  try {
    const transactions = await transactionRepository.findAll(where);
    res.json(transactions);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch transactions', 500));
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const transaction = await transactionRepository.create({
      ...validatedData,
      createdById: req.user!.id,
    });
    res.status(201).json(transaction);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return next(new AppError(JSON.stringify(err.errors), 400));
    }
    return next(new AppError(err?.message || 'Failed to create transaction', 500));
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const validatedData = transactionSchema.partial().parse(req.body);
    const transaction = await transactionRepository.update(id, validatedData);
    res.json(transaction);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return next(new AppError(JSON.stringify(err.errors), 400));
    }
    return next(new AppError(err?.message || 'Failed to update transaction', 500));
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    await transactionRepository.delete(id);
    res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete transaction', 500));
  }
};

export const approveTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const transaction = await transactionRepository.approve(id, req.user!.id);
    res.json(transaction);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to approve transaction', 500));
  }
};
