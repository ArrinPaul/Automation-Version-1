import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { Role } from '@prisma/client';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction
} from '../controllers/transactionController';

const router = Router();

router.use(verifyToken);

router.get('/', getTransactions);

router.post('/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createTransaction
);

router.patch('/:id/approve',
  requireRole([Role.MANAGEMENT]),
  approveTransaction
);

router.put('/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateTransaction
);

router.delete('/:id',
  requireRole([Role.MANAGEMENT]),
  deleteTransaction
);

export default router;
