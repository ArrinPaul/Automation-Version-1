import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { filterFinancialData } from '../middleware/filterFinancialData';
import { Role } from '@prisma/client';
import { getSocieties, getSocietyById, updateSociety } from '../controllers/societyController';

const router = Router();

router.get('/', verifyToken, filterFinancialData, getSocieties);

router.get('/:id',
  verifyToken,
  requireSocietyAccess(),
  filterFinancialData,
  getSocietyById
);

router.put('/:id',
  verifyToken,
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  updateSociety
);

export default router;
