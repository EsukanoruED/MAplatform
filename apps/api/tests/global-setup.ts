import { execFileSync } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';

const apiRoot = path.resolve(__dirname, '..');

/**
 * Runs once before the whole suite: applies the committed migrations to the
 * dedicated test database. The suite never touches the development database —
 * TEST_DATABASE_URL must point somewhere disposable.
 */
export default function globalSetup(): void {
  dotenv.config({ path: path.join(apiRoot, '.env'), quiet: true });

  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env and point it at a disposable database.',
    );
  }
  if (url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must differ from DATABASE_URL — the test suite truncates its database.');
  }

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: apiRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
