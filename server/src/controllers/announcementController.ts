import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Announcement, UserRole } from '../models';

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let filter: any = {};

    // Viewers see only announcements targeted at ALL or their society
    if (user.role === UserRole.VIEWER) {
      filter.$or = [
        { targetAudience: 'ALL' },
        { targetAudience: 'SOCIETY', societyId: user.societyId },
      ];
    } else if (user.role === UserRole.SOCIETY_ADMIN) {
      filter.$or = [
        { targetAudience: 'ALL' },
        { targetAudience: 'LEADERSHIP' },
        { targetAudience: 'SOCIETY', societyId: user.societyId },
      ];
    }
    // Admins and Treasurers see all

    const announcements = await Announcement.find(filter).sort({ date: -1 }).populate('createdBy', 'name');
    res.status(200).json({ success: true, data: announcements, count: announcements.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const announcement = await Announcement.create({
      ...req.body,
      senderName: user.name,
      createdBy: user._id,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      res.status(404).json({ success: false, error: 'Announcement not found' }); return;
    }

    // Only creator or admin can delete
    const isCreator = announcement.createdBy.toString() === user._id?.toString();
    const isAdmin = user.role === UserRole.SUPER_ADMIN;
    if (!isCreator && !isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' }); return;
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
};
