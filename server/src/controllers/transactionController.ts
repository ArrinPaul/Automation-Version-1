import { Response, NextFunction } from 'express';
import { transactionRepository } from '../repositories/transactionRepository';
import { AuthRequest, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { z } from 'zod';
import { Prisma, TransactionType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

const positiveDecimal = z.union([z.number(), z.string()])
  .refine((val) => { const num = typeof val === 'string' ? Number.parseFloat(val) : val; return !Number.isNaN(num) && num > 0; }, { message: 'Amount must be a positive number' })
  .transform((val) => new Decimal(typeof val === 'string' ? val : val.toString()));

const isoDate = z.string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: 'Invalid date format. Use ISO 8601' })
  .transform(str => new Date(str));

const transactionSchema = z.object({
  amount: positiveDecimal,
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  date: isoDate,
  societyId: z.string().uuid('Invalid society ID format'),
  receiptUrl: z.string().url().optional().or(z.literal('')),
});

const transactionUpdateSchema = transactionSchema.partial();

const isSuperAdmin = (req: AuthRequest) => SUPER_ADMIN_ROLES.includes(req.user!.role);

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: Prisma.TransactionWhereInput = {};
    if (!isSuperAdmin(req) && req.user?.societyId) where.societyId = req.user.societyId;
    const transactions = await transactionRepository.findAll(where);
    return res.status(200).json({ success: true, data: transactions, count: transactions.length });
  } catch (err) {
    return next(new AppError(err instanceof Error ? err.message : 'Failed to fetch transactions', 500));
  }
};

export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requestedSocietyId = req.params.id ?? req.query.societyId;
    const societyId = typeof requestedSocietyId === 'string' ? requestedSocietyId : undefined;
    if (!societyId) return next(new AppError('Society ID is required', 400));
    if (!req.user?.id) return next(new AppError('User not authenticated', 401));
    if (!isSuperAdmin(req) && req.user.societyId !== societyId) return next(new AppError('You do not have access to view this society balance', 403));
    const balance = await transactionRepository.getBalanceBySociety(societyId);
    return res.status(200).json({ success: true, data: { societyId, balance: balance || new Decimal('0.00') } });
  } catch (err) {
    return next(new AppError(err instanceof Error ? err.message : 'Failed to fetch balance', 500));
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return next(new AppError('User not authenticated', 401));
    const validatedData = transactionSchema.parse(req.body);
    const transaction = await transactionRepository.create({
      amount: validatedData.amount, type: validatedData.type, category: validatedData.category,
      description: validatedData.description, date: validatedData.date, societyId: validatedData.societyId,
      receiptUrl: validatedData.receiptUrl || null, createdById: req.user.id,
    });
    return res.status(201).json({ success: true, data: transaction, message: 'Transaction created successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(JSON.stringify(err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))), 400));
    return next(new AppError(err instanceof Error ? err.message : 'Failed to create transaction', 500));
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  if (!id) return next(new AppError('Transaction ID is required', 400));
  try {
    const validatedData = transactionUpdateSchema.parse(req.body);
    if (!req.user?.id) return next(new AppError('User not authenticated', 401));
    if (!isSuperAdmin(req)) {
      const existing = await transactionRepository.findById(id);
      if (!existing) return next(new AppError('Transaction not found', 404));
      if (existing.societyId !== req.user.societyId) return next(new AppError('Forbidden: You do not have access to this transaction', 403));
      if (validatedData.societyId && validatedData.societyId !== req.user.societyId) return next(new AppError('Forbidden: Cannot reassign transaction to another society', 403));
    }
    const transaction = await transactionRepository.update(id, validatedData);
    return res.status(200).json({ success: true, data: transaction, message: 'Transaction updated successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(JSON.stringify(err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))), 400));
    return next(new AppError(err instanceof Error ? err.message : 'Failed to update transaction', 500));
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  if (!id) return next(new AppError('Transaction ID is required', 400));
  try {
    await transactionRepository.delete(id);
    return res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    return next(new AppError(err instanceof Error ? err.message : 'Failed to delete transaction', 500));
  }
};

export const approveTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  if (!id) return next(new AppError('Transaction ID is required', 400));
  if (!req.user?.id) return next(new AppError('User not authenticated', 401));
  try {
    const transaction = await transactionRepository.approve(id, req.user.id);
    return res.status(200).json({ success: true, data: transaction, message: 'Transaction approved successfully' });
  } catch (err) {
    return next(new AppError(err instanceof Error ? err.message : 'Failed to approve transaction', 500));
  }
};
