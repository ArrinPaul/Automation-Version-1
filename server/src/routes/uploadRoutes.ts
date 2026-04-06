import express from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadFile } from '../services/googleDriveService';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Allow all authenticated users except 'Viewer' to upload files (transactions, events, etc)
router.post('/', authMiddleware, roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Pass parentFolderId if sent by the client, else it will default to rootFolder in .env
    const parentFolderId = req.body.parentFolderId;

    const driveInfo = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      parentFolderId
    );

    res.status(200).json({
      success: true,
      data: {
        fileId: driveInfo.id,
        webViewLink: driveInfo.webViewLink,
        webContentLink: driveInfo.webContentLink,
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'File upload failed' 
    });
  }
});

export default router;
