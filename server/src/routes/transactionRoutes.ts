import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { restrictTransactions } from '../middleware/restrictTransactions';
import { Role } from '@prisma/client';
import {
  getTransactions,
  getBalance,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction
} from '../controllers/transactionController';

const router = Router();

router.use(verifyToken);

// IMPORTANT: GET /balance must be declared BEFORE GET / to avoid being caught by wildcard pattern matching
// GET /api/transactions/balance - Fetch aggregated balance for a society (all roles)
router.get('/balance', getBalance);

// GET /api/transactions - Fetch all transaction line items (MANAGEMENT & MEMBER only)
router.get(
  '/',
  restrictTransactions,
  getTransactions
);

// POST /api/transactions - Create new transaction (MANAGEMENT, FACULTY_ADVISOR, SOCIETY_OB)
router.post(
  '/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createTransaction
);

// PATCH /api/transactions/:id/approve - Approve transaction (MANAGEMENT only)
router.patch(
  '/:id/approve',
  requireRole([Role.MANAGEMENT]),
  approveTransaction
);

// PUT /api/transactions/:id - Update transaction (MANAGEMENT, FACULTY_ADVISOR, SOCIETY_OB)
router.put(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateTransaction
);

// DELETE /api/transactions/:id - Delete transaction (MANAGEMENT only)
router.delete(
  '/:id',
  requireRole([Role.MANAGEMENT]),
  deleteTransaction
);

export default router;
