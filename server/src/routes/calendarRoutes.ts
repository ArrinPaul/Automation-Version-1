import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../controllers/calendarController';

const router = Router();
router.use(authMiddleware);

router.get('/', getCalendarEvents);
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), createCalendarEvent);
router.put('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateCalendarEvent);
router.delete('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER]), deleteCalendarEvent);

export default router;
