import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import {
  getCalendarEvents, getCalendarEventById,
  createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
} from '../controllers/calendarEventController';

const router = Router();

router.use(verifyToken);

router.get('/', getCalendarEvents);
router.get('/:id', getCalendarEventById);

router.post('/', requireRole(SOCIETY_OPS_ROLES), createCalendarEvent);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), updateCalendarEvent);
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), deleteCalendarEvent);

export default router;
