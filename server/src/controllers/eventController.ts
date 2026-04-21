import { Response, NextFunction } from 'express';
import { eventRepository } from '../repositories/eventRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const where: any = {};
  if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
    where.societyId = req.user.societyId;
  }
  try {
    const events = await eventRepository.findAll(where);
    res.json(events);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to fetch events', 500));
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepository.create(req.body);
    res.status(201).json(event);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to create event', 500));
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const event = await eventRepository.update(id, req.body);
    res.json(event);
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to update event', 500));
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    await eventRepository.delete(id);
    res.status(204).send();
  } catch (err: any) {
    return next(new AppError(err?.message || 'Failed to delete event', 500));
  }
};
