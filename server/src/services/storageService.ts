import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const uploadToSupabase = async (bucket: string, path: string, file: Buffer, contentType: string) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true
  });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};

export const uploadToS3 = async (path: string, file: Buffer, contentType: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: path,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};
