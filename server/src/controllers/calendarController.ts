import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CalendarEvent, UserRole } from '../models';

export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { societyId, status, month, year } = req.query;
    let filter: any = {};

    if (user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) {
      filter.societyId = user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }
    if (status) filter.status = status;

    // Month/year filtering
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const events = await CalendarEvent.find(filter).sort({ date: 1 }).populate('createdBy', 'name');
    res.status(200).json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch calendar events' });
  }
};

export const createCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== req.body.societyId) {
      res.status(403).json({ success: false, error: 'Cannot create event for another society' }); return;
    }
    const event = await CalendarEvent.create({ ...req.body, createdBy: user._id });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!event) { res.status(404).json({ success: false, error: 'Calendar event not found' }); return; }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update calendar event' });
  }
};

export const deleteCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) { res.status(404).json({ success: false, error: 'Calendar event not found' }); return; }
    res.status(200).json({ success: true, message: 'Calendar event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete calendar event' });
  }
};
