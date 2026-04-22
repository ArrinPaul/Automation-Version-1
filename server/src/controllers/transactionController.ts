import { Response, NextFunction } from 'express';
import { transactionRepository } from '../repositories/transactionRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { z } from 'zod';
import { Role, TransactionType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Validates amount as a positive decimal (handles string or number input).
 * Ensures proper financial precision during request body parsing.
 */
const positiveDecimal = z.union([z.number(), z.string()])
  .refine((val) => {
    const num = typeof val === 'string' ? Number.parseFloat(val) : val;
    return !Number.isNaN(num) && num > 0;
  }, { message: 'Amount must be a positive number' })
  .transform((val) => new Decimal(typeof val === 'string' ? val : val.toString()));

/**
 * Validates dates as ISO 8601 strings, converting to Date objects.
 */
const isoDate = z.string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: 'Invalid date format. Use ISO 8601 (e.g., 2026-04-21T10:00:00Z)' })
  .transform(str => new Date(str));

const transactionSchema = z.object({
  amount: positiveDecimal,
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  date: isoDate,
  societyId: z.string().uuid('Invalid society ID format'),
  receiptUrl: z.string().url('Invalid receipt URL format').optional().or(z.literal('')),
});

const transactionUpdateSchema = transactionSchema.partial();

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const transactions = await transactionRepository.findAll(where);
    return res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return next(new AppError(errorMessage, 500));
  }
};

/**
 * Get aggregated balance for a society (restricted roles use this endpoint).
 * Returns a single Decimal value representing the current balance.
 *
 * All authenticated users can query balance for their own society.
 * MANAGEMENT can query any society balance.
 */
export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { societyId } = req.query;

    if (!societyId || typeof societyId !== 'string') {
      return next(new AppError('Society ID is required as query parameter', 400));
    }

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    // Enforce society access: non-management users can only query their own society
    if (req.user.role !== Role.MANAGEMENT && req.user.societyId !== societyId) {
      return next(
        new AppError('You do not have access to view this society balance', 403)
      );
    }

    const balance = await transactionRepository.getBalanceBySociety(societyId);

    return res.status(200).json({
      success: true,
      data: {
        societyId,
        balance: balance || new Decimal('0.00'),
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
    return next(new AppError(errorMessage, 500));
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const validatedData = transactionSchema.parse(req.body);

    const transaction = await transactionRepository.create({
      amount: validatedData.amount,
      type: validatedData.type,
      category: validatedData.category,
      description: validatedData.description,
      date: validatedData.date,
      societyId: validatedData.societyId,
      receiptUrl: validatedData.receiptUrl || null,
      createdById: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
    return next(new AppError(errorMessage, 500));
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError('Transaction ID is required', 400));
  }

  try {
    const validatedData = transactionUpdateSchema.parse(req.body);

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (req.user.role !== Role.MANAGEMENT) {
      const existingTransaction = await transactionRepository.findById(id);
      if (!existingTransaction) {
        return next(new AppError('Transaction not found', 404));
      }

      if (existingTransaction.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: You do not have access to this transaction', 403));
      }

      if (validatedData.societyId && validatedData.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: Cannot reassign transaction to another society', 403));
      }
    }

    const transaction = await transactionRepository.update(id, validatedData);

    return res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
    return next(new AppError(errorMessage, 500));
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError('Transaction ID is required', 400));
  }

  try {
    await transactionRepository.delete(id);
    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
    return next(new AppError(errorMessage, 500));
  }
};

export const approveTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError('Transaction ID is required', 400));
  }

  if (!req.user?.id) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    const transaction = await transactionRepository.approve(id, req.user.id);
    return res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction approved successfully',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to approve transaction';
    return next(new AppError(errorMessage, 500));
  }
};
