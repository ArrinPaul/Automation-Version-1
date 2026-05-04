import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { filterFinancialData } from '../middleware/filterFinancialData';
import { Role } from '@prisma/client';
import { getSocieties, createSociety, getSocietyById, getSocietyBalance, updateSociety } from '../controllers/societyController';

const router = Router();

// GET / — all authenticated users (financial data filtered per role)
router.get('/', verifyToken, filterFinancialData, getSocieties);

// POST / — super admins only
router.post('/', verifyToken, requireRole(SUPER_ADMIN_ROLES), createSociety);

// GET /:id/balance — society-scoped roles + super admins
router.get('/:id/balance', verifyToken, requireSocietyAccess(), getSocietyBalance);

// GET /:id — society-scoped + super admins
router.get('/:id', verifyToken, requireSocietyAccess(), filterFinancialData, getSocietyById);

// PUT /:id — SB_FACULTY, SB_OB, SOCIETY_FACULTY can update their society
router.put('/:id', verifyToken, requireRole([Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY]), requireSocietyAccess(), updateSociety);

export default router;
