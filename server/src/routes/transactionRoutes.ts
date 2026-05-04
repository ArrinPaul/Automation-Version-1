import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, APPROVER_ROLES, TRANSACTION_CREATE_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { filterFinancialData } from '../middleware/filterFinancialData';
import { restrictTransactions } from '../middleware/restrictTransactions';
import {
  getTransactions, getBalance, createTransaction,
  updateTransaction, deleteTransaction, approveTransaction
} from '../controllers/transactionController';

const router = Router();

router.use(verifyToken);
router.use(filterFinancialData);

// GET /balance — all roles with society access can see their balance
router.get('/balance', getBalance);

// GET / — super admins only (SB_FACULTY, SB_OB)
router.get('/', restrictTransactions, getTransactions);

// POST / — SB_FACULTY, SB_OB, SOCIETY_FACULTY, SOCIETY_CHAIR can create
router.post('/', requireRole(TRANSACTION_CREATE_ROLES), requireSocietyAccess(), createTransaction);

// PATCH /:id/approve — SB_FACULTY, SB_OB, SOCIETY_FACULTY can approve
router.patch('/:id/approve', requireRole(APPROVER_ROLES), approveTransaction);

// PUT /:id — same as create
router.put('/:id', requireRole(TRANSACTION_CREATE_ROLES), requireSocietyAccess(), updateTransaction);

// DELETE /:id — super admins only
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), deleteTransaction);

export default router;
