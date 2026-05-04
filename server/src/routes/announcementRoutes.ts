import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import {
  getAnnouncements, getAnnouncementById, getAnnouncementRecipients,
  createAnnouncement, updateAnnouncement, deleteAnnouncement
} from '../controllers/announcementController';

const router = Router();

router.use(verifyToken);

router.get('/', getAnnouncements);
router.get('/:id/recipients', getAnnouncementRecipients);
router.get('/:id', getAnnouncementById);

router.post('/', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), createAnnouncement);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), updateAnnouncement);
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), requireSocietyAccess(), deleteAnnouncement);

export default router;
