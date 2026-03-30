import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController';

const router = Router();
router.use(authMiddleware);

router.get('/', getAnnouncements);
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), createAnnouncement);
router.delete('/:id', authMiddleware, deleteAnnouncement); // Creator or admin check in controller

export default router;
