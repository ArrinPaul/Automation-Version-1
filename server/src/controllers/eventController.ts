import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { EventReport, UserRole } from '../models';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { societyId, type } = req.query;
    let filter: any = {};

    if (user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) {
      filter.societyId = user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }
    if (type) filter.type = type;

    const events = await EventReport.find(filter).sort({ date: -1 }).populate('createdBy', 'name');
    res.status(200).json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};

export const getEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventReport.findById(req.params.id).populate('createdBy', 'name');
    if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== req.body.societyId) {
      res.status(403).json({ success: false, error: 'Cannot create event for another society' }); return;
    }
    const event = await EventReport.create({ ...req.body, createdBy: user._id });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventReport.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventReport.findByIdAndDelete(req.params.id);
    if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
};
