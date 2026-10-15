import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { uploadToMinio, getPresignedDownloadUrl, BUCKETS } from '../config/minio';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
});

// POST /api/storage/upload (Upload image/document to MinIO S3)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  const targetBucket = (req.body.bucket as string) || BUCKETS.POSTS;

  if (!file) {
    return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const fileKey = `${Date.now()}-${uuidv4()}${ext}`;

  try {
    const fileUrl = await uploadToMinio(targetBucket, fileKey, file.buffer, file.mimetype);

    return res.json({
      success: true,
      data: {
        bucket: targetBucket,
        key: fileKey,
        url: fileUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error) {
    console.error('[STORAGE-UPLOAD-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengunggah file ke MinIO S3 storage' });
  }
});

// GET /api/storage/presigned (Get presigned download URL for private documents)
router.get('/presigned', async (req: Request, res: Response) => {
  const { bucket, key } = req.query;

  if (!bucket || !key) {
    return res.status(400).json({ success: false, message: 'Bucket dan key file wajib diisi' });
  }

  try {
    const presignedUrl = await getPresignedDownloadUrl(bucket as string, key as string);
    return res.json({ success: true, url: presignedUrl });
  } catch (error) {
    console.error('[STORAGE-PRESIGNED-ERROR]', error);
    return res.status(500).json({ success: false, message: 'Gagal men-generate URL akses dokumen' });
  }
});

export default router;
