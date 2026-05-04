import { Response, NextFunction } from 'express';
import { societyRepository } from '../repositories/societyRepository';
import { AuthRequest, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { Role, SocietyType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { transactionRepository } from '../repositories/transactionRepository';

const isSuperAdmin = (req: AuthRequest) => SUPER_ADMIN_ROLES.includes(req.user!.role);

/**
 * Validates amount as a positive decimal.
 */
const positiveDecimal = z.union([z.number(), z.string()])
  .refine((val) => {
    const num = typeof val === 'string' ? Number.parseFloat(val) : val;
    return !Number.isNaN(num) && num >= 0;
  }, { message: 'Amount must be a non-negative number' })
  .transform((val) => new Decimal(typeof val === 'string' ? val : val.toString()));

const societySchema = z.object({
  societyKey: z.string().min(1, 'Society key is required').max(50),
  name: z.string().min(1, 'Society name is required').max(255),
  shortName: z.string().min(1, 'Short name is required').max(50),
  type: z.nativeEnum(SocietyType),
  budget: positiveDecimal,
  balance: positiveDecimal.optional(),
  logoUrl: z.string().url('Invalid logo URL format').optional().or(z.literal('')),
  advisorSigUrl: z.string().url('Invalid advisor signature URL format').optional().or(z.literal('')),
  ieeePortalUrl: z.string().url('Invalid IEEE portal URL format').optional().or(z.literal('')),
  bangaloreSectionUrl: z.string().url('Invalid Bangalore section URL format').optional().or(z.literal('')),
});

const societyUpdateSchema = societySchema.partial();

export const getSocieties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (!isSuperAdmin(req) && req.user?.societyId) {
      where.id = req.user.societyId;
    }
    const societies = await societyRepository.findAll(where);
    return res.status(200).json({
      success: true,
      data: societies,
      count: societies.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch societies';
    return next(new AppError(errorMessage, 500));
  }
};

export const createSociety = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = societySchema.parse(req.body);
    const society = await societyRepository.create(validatedData);
    return res.status(201).json({
      success: true,
      data: society,
      message: 'Society created successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to create society';
    return next(new AppError(errorMessage, 500));
  }
};

export const getSocietyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = (req.params.societyId ?? req.params.id) as string;

  if (!id) {
    return next(new AppError('Society ID is required', 400));
  }

  try {
    const society = await societyRepository.findById(id);
    if (!society) {
      return next(new AppError('Society not found', 404));
    }
    return res.status(200).json({
      success: true,
      data: society,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch society';
    return next(new AppError(errorMessage, 500));
  }
};

export const updateSociety = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = (req.params.societyId ?? req.params.id) as string;

  if (!id) {
    return next(new AppError('Society ID is required', 400));
  }

  try {
    const validatedData = societyUpdateSchema.parse(req.body);
    const society = await societyRepository.update(id, validatedData);
    return res.status(200).json({
      success: true,
      data: society,
      message: 'Society updated successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to update society';
    return next(new AppError(errorMessage, 500));
  }
};

export const getSocietyBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = (req.params.societyId ?? req.params.id) as string;

  if (!id) {
    return next(new AppError('Society ID is required', 400));
  }

  if (!req.user?.id) {
    return next(new AppError('User not authenticated', 401));
  }

  if (req.user.role === Role.MEMBER) {
    return next(new AppError('Members are not permitted to access financial data routes.', 403));
  }

  if (!isSuperAdmin(req) && req.user.societyId !== id) {
    return next(new AppError('You do not have access to view this society balance', 403));
  }

  try {
    const balance = await transactionRepository.getBalanceBySociety(id);

    return res.status(200).json({
      success: true,
      data: {
        societyId: id,
        balance: balance || new Decimal('0.00'),
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch society balance';
    return next(new AppError(errorMessage, 500));
  }
};
