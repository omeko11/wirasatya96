import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const s3Region = process.env.MINIO_REGION || 'us-east-1';
const accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretAccessKey = process.env.MINIO_SECRET_KEY || 'minioadmin_ws96_secure';

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: s3Region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKETS = {
  AVATARS: process.env.BUCKET_AVATARS || 'wirasatya-avatars',
  POSTS: process.env.BUCKET_POSTS || 'wirasatya-posts',
  DOCUMENTS: process.env.BUCKET_DOCUMENTS || 'wirasatya-documents',
};

/**
 * Upload buffer to MinIO bucket
 */
export async function uploadToMinio(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  // Return accessible URL
  const publicBaseUrl = process.env.MINIO_PUBLIC_URL || s3Endpoint;
  return `${publicBaseUrl}/${bucket}/${key}`;
}

/**
 * Generate Presigned Download URL for private documents (e.g. TR Kapolri, Bukti Kas)
 */
export async function getPresignedDownloadUrl(
  bucket: string,
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
