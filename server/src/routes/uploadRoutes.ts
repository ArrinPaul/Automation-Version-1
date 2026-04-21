import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { uploadFile, uploadMiddleware } from '../controllers/uploadController';

const router = Router();

router.post('/', verifyToken, uploadMiddleware, uploadFile);

export default router;
