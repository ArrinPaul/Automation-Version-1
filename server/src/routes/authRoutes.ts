import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';
import { login, register, changeRole, getCurrentUser, setupFirstAdmin, checkInitialized } from '../controllers/authController';
import { env } from '../config/env';

const router = Router();

// Check if system is initialized (no auth required)
router.get('/check-initialized', checkInitialized);

// Test route to verify setup is reachable and env is loaded
router.get('/setup/test', (req: Request, res: Response) => {
  console.log('[SETUP_TEST] Test endpoint called');
  console.log('[SETUP_TEST] SETUP_KEY exists:', !!env.SETUP_KEY);
  console.log('[SETUP_TEST] SETUP_KEY value (first 10 chars):', env.SETUP_KEY?.substring(0, 10) + '...' || 'NOT SET');
  res.json({
    status: 'setup route reachable',
    setupKeyConfigured: !!env.SETUP_KEY,
    nodeEnv: env.NODE_ENV,
  });
});

router.post('/login', login);
router.post('/setup', setupFirstAdmin);
router.get('/me', verifyToken, getCurrentUser);

// Only Management can register new users or change roles
router.post('/register', verifyToken, requireRole([Role.MANAGEMENT]), register);
router.patch('/change-role', verifyToken, requireRole([Role.MANAGEMENT]), changeRole);

export default router;
