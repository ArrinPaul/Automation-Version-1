import { NextFunction, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/verifyToken';
import { speakerRepository } from '../repositories/speakerRepository';
import { eventRepository } from '../repositories/eventRepository';
import { AppError } from '../middleware/errorHandler';

const hasSocietyAccess = (req: AuthRequest, societyId?: string | null) => {
  if (req.user?.role === Role.MANAGEMENT) return true;
  return !!req.user?.societyId && req.user.societyId === societyId;
};

export const getSpeakers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};

    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.event = { societyId: req.user.societyId };
    }

    const speakers = await speakerRepository.findAll(where);
    return res.json(speakers);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch speakers', 500));
  }
};

export const getSpeakerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const speaker = await speakerRepository.findById(req.params.id as string);
    if (!speaker) return next(new AppError('Speaker not found', 404));

    if (!hasSocietyAccess(req, speaker.event?.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this speaker', 403));
    }

    return res.json(speaker);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch speaker', 500));
  }
};

export const createSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = req.body?.eventId as string | undefined;
    if (!eventId) return next(new AppError('eventId is required', 400));

    const event = await eventRepository.findById(eventId);
    if (!event) return next(new AppError('Associated event not found', 404));

    if (!hasSocietyAccess(req, event.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this event', 403));
    }

    const speaker = await speakerRepository.create(req.body);
    return res.status(201).json(speaker);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create speaker', 500));
  }
};

export const updateSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await speakerRepository.findById(req.params.id as string);
    if (!existing) return next(new AppError('Speaker not found', 404));

    if (!hasSocietyAccess(req, existing.event?.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this speaker', 403));
    }

    if (req.body?.eventId) {
      const targetEvent = await eventRepository.findById(req.body.eventId as string);
      if (!targetEvent) return next(new AppError('Target event not found', 404));
      if (!hasSocietyAccess(req, targetEvent.societyId)) {
        return next(new AppError('Forbidden: You do not have access to target event', 403));
      }
    }

    const speaker = await speakerRepository.update(req.params.id as string, req.body);
    return res.json(speaker);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update speaker', 500));
  }
};

export const deleteSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await speakerRepository.findById(req.params.id as string);
    if (!existing) return next(new AppError('Speaker not found', 404));

    if (!hasSocietyAccess(req, existing.event?.societyId)) {
      return next(new AppError('Forbidden: You do not have access to this speaker', 403));
    }

    await speakerRepository.delete(req.params.id as string);
    return res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete speaker', 500));
  }
};
