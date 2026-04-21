import { Request, Response } from 'express';
import multer from 'multer';
import { uploadToSupabase, uploadToS3 } from '../services/storageService';
import { AuthRequest } from '../middleware/verifyToken';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export const uploadFile = async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { type, societyId } = req.body;
  const file = req.file;

  try {
    let url = '';

    // Logic: small assets to Supabase, large files to S3
    if (type === 'logo' || type === 'signature') {
      const path = `societies/${societyId}/${type}-${Date.now()}.${file.originalname.split('.').pop()}`;
      url = await uploadToSupabase('branding', path, file.buffer, file.mimetype);
    } else {
      // Event images, receipts, etc go to S3
      const path = `${type}/${societyId || 'general'}/${Date.now()}-${file.originalname}`;
      url = await uploadToS3(path, file.buffer, file.mimetype);
    }

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const uploadMiddleware = upload.single('file');
