import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarEventController';

const router = Router();

router.use(verifyToken);

router.get('/', getCalendarEvents);
router.get('/:id', getCalendarEventById);

router.post('/', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), createCalendarEvent);
router.put('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), updateCalendarEvent);
router.delete('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]), deleteCalendarEvent);

export default router;
