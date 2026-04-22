import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { filterFinancialData } from '../middleware/filterFinancialData';
import { Role } from '@prisma/client';
import { getSocieties, createSociety, getSocietyById, updateSociety } from '../controllers/societyController';

const router = Router();

// GET /api/societies - Fetch all societies (with financial data filtering)
router.get('/', verifyToken, filterFinancialData, getSocieties);

// POST /api/societies - Create new society (MANAGEMENT only)
router.post(
  '/',
  verifyToken,
  requireRole([Role.MANAGEMENT]),
  createSociety
);

// GET /api/societies/:id - Fetch society by ID (with financial data filtering)
router.get(
  '/:id',
  verifyToken,
  requireSocietyAccess(),
  filterFinancialData,
  getSocietyById
);

// PUT /api/societies/:id - Update society (MANAGEMENT, FACULTY_ADVISOR)
router.put(
  '/:id',
  verifyToken,
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  updateSociety
);

export default router;
