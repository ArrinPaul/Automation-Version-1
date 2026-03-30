import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, getMe, changePassword } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';

const router = Router();

// Stricter rate limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many auth attempts, try again after 15 minutes' },
});

// Public routes
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.post('/register', authMiddleware, roleMiddleware([UserRole.SUPER_ADMIN]), register);
router.get('/me', authMiddleware, getMe);
router.put('/password', authMiddleware, changePassword);

export default router;
