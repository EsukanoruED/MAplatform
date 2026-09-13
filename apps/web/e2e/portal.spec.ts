import { expect, test } from '@playwright/test';

/**
 * The Phase 1 acceptance flow, end to end through a real browser:
 * login (valid and invalid), the route guard, authenticated portal access,
 * creating a request, and seeing it reach the dashboard.
 *
 * Credentials come from the committed development seed (apps/api/prisma/seed.ts).
 */
const COMPANY_A = { email: 'ops@northgate-industrial.example', password: 'DemoPassw0rd!' };
const COMPANY_B = { email: 'ops@harbourline-logistics.example', password: 'DemoPassw0rd!' };

async function signIn(page: import('@playwright/test').Page, who: { email: string; password: string }) {
  await page.goto('/portal/login');
  await page.getByLabel('Work email').fill(who.email);
  await page.getByLabel('Password').fill(who.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  // Wait for the session to be established before the caller navigates, or a
  // following goto() races the login and the guard bounces it back.
  await expect(page).toHaveURL(/\/portal(\/|$)/);
  await expect(page).not.toHaveURL(/\/portal\/login/);
}

test('1. login with valid credentials reaches the portal dashboard', async ({ page }) => {
  await signIn(page, COMPANY_A);

  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  // Scoped to the sidebar: the name also appears in the clinic-schedule footer.
  await expect(page.getByRole('complementary').getByText('Dr N. Al-Qahtani')).toBeVisible();
});

test('2. login with invalid credentials shows an inline error and does not navigate', async ({ page }) => {
  await page.goto('/portal/login');
  await page.getByLabel('Work email').fill(COMPANY_A.email);
  await page.getByLabel('Password').fill('definitely-the-wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await expect(page).toHaveURL(/\/portal\/login$/);
  await expect(page.getByRole('heading', { name: 'Occupational health portal' })).toBeVisible();
});

test('3. an unauthenticated visitor is redirected away from every protected route', async ({ page }) => {
  for (const route of ['/portal', '/portal/certificates', '/portal/workers/some-id']) {
    await page.context().clearCookies();
    await page.goto(route);
    await expect(page).toHaveURL(/\/portal\/login$/);
    await expect(page.getByRole('heading', { name: 'Occupational health portal' })).toBeVisible();
  }
});

test('4. an authenticated session survives a reload and can reach every portal route', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // The session lives in an httpOnly cookie, so a reload stays signed in.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.goto('/portal/certificates');
  await expect(page.getByRole('heading', { name: 'Certificates' })).toBeVisible();

  await page.goto('/portal/workers');
  await expect(page.getByRole('heading', { name: 'Workers' })).toBeVisible();
});

test('5. the session cookie is httpOnly and holds no token readable from JavaScript', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === 'ma.sid');
  expect(session, 'the session cookie should be set').toBeDefined();
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe('Lax');

  // Nothing readable from the page: no document.cookie entry, no web storage.
  expect(await page.evaluate(() => document.cookie)).not.toContain('ma.sid');
  expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage)))).toBe('[]');
  expect(await page.evaluate(() => JSON.stringify(Object.entries(sessionStorage)))).toBe('[]');
});

test('6. creating a request persists it and it appears on the dashboard and register', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  const summary = page.getByRole('region', { name: 'Request summary' });
  const openTile = summary.getByText('Open requests').locator('xpath=../..');
  const before = Number((await openTile.innerText()).match(/\d+/)?.[0] ?? '0');

  await page.getByRole('button', { name: 'New examination' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // The worker picker is populated from GET /api/employees, tenant-scoped.
  const worker = dialog.getByLabel('Worker');
  await expect(worker.locator('option')).not.toHaveCount(1);
  await worker.selectOption({ index: 1 });
  await dialog.getByLabel('Examination type').selectOption('CHECKUP');
  await dialog.getByLabel('Notes').fill('Created by the Playwright end-to-end test.');
  await dialog.getByRole('button', { name: /Submit request/ }).click();

  await expect(dialog).toBeHidden();

  // The open-request tile recomputes from the refreshed query.
  await expect(openTile).toContainText(String(before + 1));

  // And the new row is in the certificate register.
  await page.goto('/portal/certificates');
  await expect(page.getByRole('heading', { name: 'Certificates' })).toBeVisible();
  const register = page.getByRole('table');
  await expect(register).toBeVisible();
  // Scoped to the table: "Submitted" is also a hidden <option> in the filter.
  await expect(register.getByText('Submitted', { exact: true }).first()).toBeVisible();
  await expect(register).toContainText('Checkup');
});

test('7. a second company never sees the first company\'s requests', async ({ page }) => {
  // Company A's register.
  await signIn(page, COMPANY_A);
  await page.goto('/portal/certificates');
  await expect(page.getByRole('table')).toBeVisible();
  const aWorkers = await page.getByRole('table').innerText();
  expect(aWorkers).toContain('A. Al-Harbi');

  // Sign out, sign in as Company B.
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/portal\/login$/);

  await signIn(page, COMPANY_B);
  await page.goto('/portal/certificates');
  await expect(page.getByRole('heading', { name: 'Certificates' })).toBeVisible();

  // Company B's register must not contain any of Company A's workers.
  const bBody = await page.locator('body').innerText();
  expect(bBody).not.toContain('A. Al-Harbi');
  expect(bBody).not.toContain('R. Menon');
  expect(bBody).not.toContain('S. Okonkwo');
  expect(bBody).toContain('M. Haddad'); // Company B's own worker
});

test('8. sign out ends the session and re-protects the portal', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/portal\/login$/);

  await page.goto('/portal');
  await expect(page).toHaveURL(/\/portal\/login$/);
});
