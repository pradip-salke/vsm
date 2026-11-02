import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().url().refine((value) => value.startsWith('mysql://') || value.startsWith('mysql2://'), 'DATABASE_URL must use the MySQL protocol'),
  SESSION_COOKIE_NAME: z.string().min(1).default('vsmedu_admin_session'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  COOKIE_SECURE: z.stringbool().default(false),
  TRUST_PROXY: z.stringbool().default(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SEED_ADMIN_EMAIL: z.email().default('admin@vsmedu.local'),
  SEED_ADMIN_PASSWORD: z.string().min(12).default('ChangeThisPassword!123'),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production') {
    if (!value.COOKIE_SECURE) ctx.addIssue({ code: 'custom', path: ['COOKIE_SECURE'], message: 'COOKIE_SECURE must be true in production' });
    if (value.SEED_ADMIN_PASSWORD === 'ChangeThisPassword!123') ctx.addIssue({ code: 'custom', path: ['SEED_ADMIN_PASSWORD'], message: 'Set a unique seed password in production' });
    if (![value.API_BASE_URL, value.WEB_ORIGIN, value.ADMIN_ORIGIN].every((url) => url.startsWith('https://'))) ctx.addIssue({ code: 'custom', path: ['API_BASE_URL'], message: 'Production origins must use HTTPS' });
  }
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function parseEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return EnvSchema.parse(input);
}

export const env = parseEnv();
