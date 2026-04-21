import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { Role } from '@prisma/client';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = Router();

router.use(verifyToken);

router.get('/', getEvents);
router.post('/', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), requireSocietyAccess(), createEvent);
router.put('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), requireSocietyAccess(), updateEvent);
router.delete('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]), requireSocietyAccess(), deleteEvent);

export default router;
