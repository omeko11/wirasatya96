import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import jabatanRoutes from './routes/jabatan';
import postRoutes from './routes/posts';
import financeRoutes from './routes/finance';
import kesehatanRoutes from './routes/kesehatan';
import storageRoutes from './routes/storage';
import messageRoutes from './routes/messages';
import { pool } from './config/db';
import { s3Client, BUCKETS } from './config/minio';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Healthcheck & Service Status Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let minioStatus = 'disconnected';

  try {
    const dbRes = await pool.query('SELECT 1 as alive');
    if (dbRes.rows.length > 0) dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  try {
    await s3Client.send(new ListBucketsCommand({}));
    minioStatus = 'connected';
  } catch (err) {
    minioStatus = 'error';
  }

  return res.json({
    status: 'online',
    system: 'Wira Satya 96 Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: dbStatus,
      minio: minioStatus,
    },
    buckets: BUCKETS,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/jabatan', jabatanRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/kesehatan', kesehatanRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GLOBAL-ERROR]', err);
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [WS96-BACKEND] REST API running on port ${PORT}`);
  console.log(`📌 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Architecture: FE (3000) | BE (5000) | DB (5432) | MinIO (9000/9001)`);
  console.log(`=======================================================`);
});

export default app;
