import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController';

const router = Router();

router.use(verifyToken);

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

router.post(
  '/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createAnnouncement
);

router.put(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateAnnouncement
);

router.delete(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  deleteAnnouncement
);

export default router;
