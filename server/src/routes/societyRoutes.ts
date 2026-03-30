import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import {
  getSocieties,
  getSociety,
  createSociety,
  updateSociety,
  updateOfficeBearers,
  updateMembers,
  deleteSociety,
} from '../controllers/societyController';

const router = Router();

// All society routes require authentication
router.use(authMiddleware);

// Read — all authenticated users (scoped by controller)
router.get('/', getSocieties);
router.get('/:id', getSociety);

// Create/Delete — Super Admin only
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN]), createSociety);
router.delete('/:id', roleMiddleware([UserRole.SUPER_ADMIN]), deleteSociety);

// Update — Super Admin, SB Treasurer
router.put('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER]), updateSociety);

// Team management — Super Admin, SB Treasurer, Society Admin (scoped in controller)
router.put('/:id/office-bearers', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateOfficeBearers);
router.put('/:id/members', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateMembers);

export default router;
