import path from 'node:path';
import dotenv from 'dotenv';

// Runs before every test file's imports, so the app modules that read
// process.env at load time (src/env.ts) see the test configuration.
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

process.env.NODE_ENV = 'test';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set — see apps/api/.env.example.');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.SESSION_SECRET ??= 'test-only-session-secret-not-used-outside-tests';
process.env.LOG_LEVEL ??= 'silent';
