import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const isTestMode = process.env.NODE_ENV === 'test';

const runtimeEnv = isTestMode
  ? {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ieee_test',
      SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key',
      FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      PORT: process.env.PORT ?? '5000',
      NODE_ENV: 'test',
    }
  : process.env;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

const envParse = envSchema.safeParse(runtimeEnv);

if (!envParse.success) {
  logger.error({
    message: '❌ Invalid environment variables',
    issues: envParse.error.format(),
  });
  process.exit(1);
}

export const env = envParse.data;
