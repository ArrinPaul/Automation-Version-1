import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  approveTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = Router();

router.use(authMiddleware);

// Read — all authenticated (scoped in controller)
router.get('/', getTransactions);
router.get('/:id', getTransaction);

// Create — Admin, Treasurer, Society Admin
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), createTransaction);

// Update — Creator or Admin (checked in controller)
router.put('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateTransaction);

// Approve — Treasurer / Super Admin only
router.patch('/:id/approve', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER]), approveTransaction);

// Delete — Admin only
router.delete('/:id', roleMiddleware([UserRole.SUPER_ADMIN]), deleteTransaction);

export default router;
