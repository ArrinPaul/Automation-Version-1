import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';
import { login, register, changeRole, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);

// Only Management can register new users or change roles
router.post('/register', verifyToken, requireRole([Role.MANAGEMENT]), register);
router.patch('/change-role', verifyToken, requireRole([Role.MANAGEMENT]), changeRole);

export default router;
