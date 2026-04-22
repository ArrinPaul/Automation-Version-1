import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import {
  getSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} from '../controllers/speakerController';

const router = Router();

router.use(verifyToken);

router.get('/', getSpeakers);
router.get('/:id', getSpeakerById);

router.post('/', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), createSpeaker);
router.put('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]), updateSpeaker);
router.delete('/:id', requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]), deleteSpeaker);

export default router;
