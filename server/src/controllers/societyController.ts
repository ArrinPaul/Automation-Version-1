import { Response, NextFunction } from 'express';
import { societyRepository } from '../repositories/societyRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export const getSocieties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.id = req.user.societyId;
    }
    const societies = await societyRepository.findAll(where);
    res.json(societies);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch societies', 500));
  }
};

export const getSocietyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const society = await societyRepository.findById(id);
    if (!society) return next(new AppError('Society not found', 404));
    res.json(society);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch society', 500));
  }
};

export const updateSociety = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const society = await societyRepository.update(id, req.body);
    res.json(society);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update society', 500));
  }
};
