import { Request, Response } from 'express';
import { eventRepository } from '../repositories/eventRepository';
import { AuthRequest } from '../middleware/verifyToken';
import { z } from 'zod';
import { Role } from '@prisma/client';

export const getEvents = async (req: AuthRequest, res: Response) => {
  const where: any = {};
  if (req.user?.role !== Role.MANAGEMENT && req.user?.societyId) {
    where.societyId = req.user.societyId;
  }
  try {
    const events = await eventRepository.findAll(where);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventRepository.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    const event = await eventRepository.update(id, req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await eventRepository.delete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
