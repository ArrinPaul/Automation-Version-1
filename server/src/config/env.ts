import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';
import logger from './logger';

const dotenvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
];

for (const dotenvPath of dotenvPaths) {
  console.log('[ENV] Attempting to load:', dotenvPath);
  const result = dotenv.config({ path: dotenvPath });
  if (result.error === undefined) {
    console.log('[ENV] Successfully loaded:', dotenvPath);
    break;
  } else {
    console.log('[ENV] File not found or error:', dotenvPath, '-', result.error.message);
  }
}

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

console.log('[ENV] SETUP_KEY configured:', !!process.env.SETUP_KEY);
if (process.env.SETUP_KEY) {
  console.log('[ENV] SETUP_KEY length:', process.env.SETUP_KEY.length);
  console.log('[ENV] SETUP_KEY first 10 chars:', process.env.SETUP_KEY.substring(0, 10) + '...');
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  SETUP_KEY: z.string().min(1).optional(),
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
