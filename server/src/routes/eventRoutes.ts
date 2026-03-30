import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = Router();
router.use(authMiddleware);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), createEvent);
router.put('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateEvent);
router.delete('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER]), deleteEvent);

export default router;
