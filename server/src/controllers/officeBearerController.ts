import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { officeBearerRepository } from '../repositories/officeBearerRepository';

export const getOfficeBearers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const officeBearers = await officeBearerRepository.findAll(where);
    return res.json(officeBearers);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch office bearers', 500));
  }
};

export const getOfficeBearerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const officeBearer = await officeBearerRepository.findById(req.params.id as string);
    if (!officeBearer) {
      return next(new AppError('Office bearer not found', 404));
    }
    return res.json(officeBearer);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch office bearer', 500));
  }
};

export const createOfficeBearer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const officeBearer = await officeBearerRepository.create(req.body);
    return res.status(201).json(officeBearer);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create office bearer', 500));
  }
};

export const updateOfficeBearer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const officeBearer = await officeBearerRepository.update(req.params.id as string, req.body);
    return res.json(officeBearer);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update office bearer', 500));
  }
};

export const deleteOfficeBearer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await officeBearerRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete office bearer', 500));
  }
};
