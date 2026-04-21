import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  logger.error('❌ Invalid environment variables:', envParse.error.format());
  process.exit(1);
}

export const env = envParse.data;
