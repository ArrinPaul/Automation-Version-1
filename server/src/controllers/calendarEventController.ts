import { NextFunction, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { calendarEventRepository } from '../repositories/calendarEventRepository';
import { AppError } from '../middleware/errorHandler';

const hasSocietyAccess = (req: AuthRequest, societyId?: string | null) => {
  if (req.user?.role === Role.MANAGEMENT) return true;
  return !!req.user?.societyId && req.user.societyId === societyId;
};

export const getCalendarEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};

    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }

    const events = await calendarEventRepository.findAll(where);
    return res.json(events);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch calendar events', 500));
  }
};

export const getCalendarEventById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const calendarEvent = await calendarEventRepository.findById(req.params.id as string);
    if (!calendarEvent) return next(new AppError('Calendar event not found', 404));

    if (!hasSocietyAccess(req, calendarEvent.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this calendar event', 403));
    }

    return res.json(calendarEvent);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch calendar event', 500));
  }
};

export const createCalendarEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bodySocietyId = req.body?.societyId as string | undefined;

    if (!bodySocietyId) {
      return next(new AppError('societyId is required', 400));
    }

    if (!hasSocietyAccess(req, bodySocietyId)) {
      return next(new AppError('Forbidden: You do not have access to this society', 403));
    }

    const calendarEvent = await calendarEventRepository.create(req.body);
    return res.status(201).json(calendarEvent);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create calendar event', 500));
  }
};

export const updateCalendarEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await calendarEventRepository.findById(req.params.id as string);
    if (!existing) return next(new AppError('Calendar event not found', 404));

    if (!hasSocietyAccess(req, existing.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this calendar event', 403));
    }

    if (req.body?.societyId && !hasSocietyAccess(req, req.body.societyId as string)) {
      return next(new AppError('Forbidden: You do not have access to target society', 403));
    }

    const calendarEvent = await calendarEventRepository.update(req.params.id as string, req.body);
    return res.json(calendarEvent);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update calendar event', 500));
  }
};

export const deleteCalendarEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await calendarEventRepository.findById(req.params.id as string);
    if (!existing) return next(new AppError('Calendar event not found', 404));

    if (!hasSocietyAccess(req, existing.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this calendar event', 403));
    }

    await calendarEventRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete calendar event', 500));
  }
};
