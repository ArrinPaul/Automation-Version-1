import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { AppError } from '../middleware/errorHandler';
import { announcementRepository } from '../repositories/announcementRepository';

export const getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.OR = [{ societyId: null }, { societyId: req.user.societyId }];
    }

    const announcements = await announcementRepository.findAll(where);
    return res.json(announcements);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch announcements', 500));
  }
};

export const getAnnouncementById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const announcement = await announcementRepository.findById(req.params.id as string);
    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }
    return res.json(announcement);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch announcement', 500));
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload = {
      ...req.body,
      senderId: req.user!.id
    };
    const announcement = await announcementRepository.create(payload);
    return res.status(201).json(announcement);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create announcement', 500));
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const announcement = await announcementRepository.update(req.params.id as string, req.body);
    return res.json(announcement);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update announcement', 500));
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await announcementRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete announcement', 500));
  }
};
