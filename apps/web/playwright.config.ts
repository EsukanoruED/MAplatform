import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Some environments (including Claude Code's remote sandbox) ship a Chromium
 * build that does not match the one this @playwright/test version would download.
 * Point at the pre-installed binary when it is there rather than fetching another.
 */
const PREINSTALLED_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined;

/**
 * End-to-end tests against the real stack: the Vite dev server proxying to the
 * Express API, which talks to PostgreSQL.
 *
 * Prerequisites (see the repository README):
 *   - PostgreSQL running, migrated and seeded (npm run db:migrate && npm run db:seed)
 *   - nothing already bound to :4000 or :5173 (the runner starts both itself)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { ...(executablePath ? { executablePath } : {}) },
      },
    },
  ],
  // Reuse servers that are already running locally; start them otherwise.
  webServer: [
    {
      command: 'npm run dev --workspace=apps/api',
      url: 'http://localhost:4000/health',
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        // The login rate limiter (5 attempts / 15 min per IP+email) is a real
        // protection and stays at its default everywhere else. This suite signs
        // in as the same seeded account in several specs and would trip it, so
        // the E2E server alone is given a higher cap. The limiter's own
        // behaviour is asserted in apps/api/tests/rate-limit.test.ts.
        AUTH_RATE_LIMIT_MAX_ATTEMPTS: '200',
      },
    },
    {
      command: 'npm run dev --workspace=apps/web',
      url: 'http://localhost:5173',
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
