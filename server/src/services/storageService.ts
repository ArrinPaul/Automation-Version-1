import { createClient } from '@supabase/supabase-js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const isE2ETestMode = process.env.NODE_ENV !== 'production' || process.env.E2E_TEST_MODE === 'true';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
  region: process.env.AWS_REGION
});

export const uploadToSupabase = async (bucket: string, path: string, file: Buffer, contentType: string) => {
  if (isE2ETestMode) {
    return `https://e2e.test/supabase/${bucket}/${path}`;
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true
  });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};

export const uploadToS3 = async (path: string, file: Buffer, contentType: string) => {
  if (isE2ETestMode) {
    return `https://e2e.test/s3/${path}`;
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: path,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const result = await s3.send(new PutObjectCommand(params as any));
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME!;

  if (result.$metadata.httpStatusCode && result.$metadata.httpStatusCode >= 400) {
    throw new Error('S3 upload failed');
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
};
