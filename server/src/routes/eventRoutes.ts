import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = Router();

router.use(verifyToken);

// All authenticated users can view events
router.get('/', getEvents);

// SOCIETY_OB and above can create/update events
router.post('/', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), createEvent);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), updateEvent);

// Only super admins and society faculty/chair can delete
router.delete('/:id', requireRole([...SUPER_ADMIN_ROLES, ...SOCIETY_OPS_ROLES.slice(2)]), requireSocietyAccess(), deleteEvent);

export default router;
