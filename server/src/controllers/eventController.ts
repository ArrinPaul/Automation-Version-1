import { Response, NextFunction } from 'express';
import { eventRepository } from '../repositories/eventRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

/**
 * Validates dates as ISO 8601 strings, converting to Date objects.
 */
const isoDate = z.string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: 'Invalid date format. Use ISO 8601 (e.g., 2026-04-21T10:00:00Z)' })
  .transform(str => new Date(str));

const speakerSchema = z.object({
  name: z.string().min(1, 'Speaker name is required').max(255),
  designation: z.string().max(255).optional(),
  organization: z.string().max(255).optional(),
  presentationTitle: z.string().max(500).optional(),
  profile: z.string().url('Invalid speaker profile URL').optional(),
});

const eventSchema = z.object({
  societyId: z.string().uuid('Invalid society ID format'),
  title: z.string().min(1, 'Event title is required').max(255),
  date: isoDate,
  time: z.string().max(10).optional(),
  venue: z.string().max(255).optional(),
  type: z.string().min(1, 'Event type is required').max(100),
  participants: z.number().int().min(0, 'Participants must be non-negative'),
  participantType: z.string().max(100).optional(),
  description: z.string().min(1, 'Description is required').max(1000),
  outcome: z.string().max(1000).optional(),
  highlights: z.string().max(1000).optional(),
  takeaways: z.string().max(1000).optional(),
  followUpPlan: z.string().max(1000).optional(),
  collaboration: z.string().max(500).optional(),
  organizerName: z.string().max(255).optional(),
  organizerDes: z.string().max(255).optional(),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional().default([]),
  speakers: z.array(speakerSchema).optional().default([]),
});

const eventUpdateSchema = eventSchema.partial();

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
      where.societyId = req.user.societyId;
    }
    const events = await eventRepository.findAll(where);
    return res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
    return next(new AppError(errorMessage, 500));
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = eventSchema.parse(req.body);
    const event = await eventRepository.create(validatedData);
    return res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
    return next(new AppError(errorMessage, 500));
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError('Event ID is required', 400));
  }

  try {
    const validatedData = eventUpdateSchema.parse(req.body);

    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (req.user.role !== Role.MANAGEMENT) {
      const existingEvent = await eventRepository.findById(id);
      if (!existingEvent) {
        return next(new AppError('Event not found', 404));
      }

      if (existingEvent.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: You do not have access to this event', 403));
      }

      if (validatedData.societyId && validatedData.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: Cannot reassign event to another society', 403));
      }
    }

    const event = await eventRepository.update(id, validatedData);
    return res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(formattedErrors), 400));
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
    return next(new AppError(errorMessage, 500));
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError('Event ID is required', 400));
  }

  try {
    if (!req.user?.id) {
      return next(new AppError('User not authenticated', 401));
    }

    if (req.user.role !== Role.MANAGEMENT) {
      const existingEvent = await eventRepository.findById(id);
      if (!existingEvent) {
        return next(new AppError('Event not found', 404));
      }

      if (existingEvent.societyId !== req.user.societyId) {
        return next(new AppError('Forbidden: You do not have access to this event', 403));
      }
    }

    await eventRepository.delete(id);
    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
    return next(new AppError(errorMessage, 500));
  }
};
