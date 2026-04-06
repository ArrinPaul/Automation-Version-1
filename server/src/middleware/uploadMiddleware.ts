import multer from 'multer';

// Use memory storage so we can stream the Buffer directly to Google Drive without hitting the disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});
