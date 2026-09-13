import path from 'node:path';
import dotenv from 'dotenv';

// Load apps/api/.env when present. Values already in process.env win, so a real
// deployment's platform-injected secrets are never overwritten by a stray file.
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const PLACEHOLDER_SESSION_SECRETS = new Set([
  'dev-only-insecure-placeholder-change-me',
  'change-me',
  'secret',
]);

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable ${name}. Copy apps/api/.env.example to apps/api/.env and fill it in.`,
    );
  }
  return value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) throw new Error(`Environment variable ${name} must be an integer, got "${raw}".`);
  return parsed;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const sessionSecret = required('SESSION_SECRET');
if (isProduction && PLACEHOLDER_SESSION_SECRETS.has(sessionSecret)) {
  throw new Error('SESSION_SECRET is still the development placeholder. Set a real random secret in production.');
}

export const env = {
  nodeEnv,
  isProduction,
  isTest,
  isDevelopment: !isProduction && !isTest,
  port: int('PORT', 4000),
  databaseUrl: required('DATABASE_URL'),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  session: {
    secret: sessionSecret,
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'ma.sid',
    // Admin sessions are deliberately shorter-lived than company sessions.
    companyTtlMinutes: int('SESSION_TTL_COMPANY_MINUTES', 480),
    adminTtlMinutes: int('SESSION_TTL_ADMIN_MINUTES', 60),
  },
  authRateLimit: {
    windowMinutes: int('AUTH_RATE_LIMIT_WINDOW_MINUTES', 15),
    maxAttempts: int('AUTH_RATE_LIMIT_MAX_ATTEMPTS', 5),
  },
} as const;
