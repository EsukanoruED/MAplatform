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

test('6. creating a request persists it and surfaces it across the portal', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  const summary = page.getByRole('region', { name: 'Request summary' });
  const openTile = summary.getByText('Open requests').locator('xpath=../..');
  await expect(openTile).toBeVisible();
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

  // Submitting takes you straight to the request that was just filed.
  await expect(page).toHaveURL(/\/portal\/requests\/[0-9a-f-]{36}$/);
  await expect(page.getByText('Created by the Playwright end-to-end test.')).toBeVisible();

  // It opens SUBMITTED, with an audit trail already written for it.
  const timeline = page.getByRole('list', { name: 'Status history' });
  await expect(timeline.getByRole('listitem')).toHaveCount(1);
  await expect(timeline).toContainText('Submitted');

  // It is in the request queue, with its real status and type.
  await page.goto('/portal/requests');
  const queue = page.getByRole('table');
  await expect(queue).toBeVisible();
  // Scoped to the table: "Submitted" is also a hidden <option> in the filter.
  await expect(queue.getByText('Submitted', { exact: true }).first()).toBeVisible();
  await expect(queue).toContainText('Checkup');

  // And the dashboard's open-request tile, which aggregates server-side, moved.
  await page.goto('/portal');
  await expect(openTile).toContainText(String(before + 1));
});

test('6b. the request detail screen shows the persisted status timeline', async ({ page }) => {
  await signIn(page, COMPANY_A);

  await page.goto('/portal/requests');
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('table').locator('tbody tr').first().click();

  // The timeline is rendered from RequestStatusEvent rows, not a fixed step list.
  const timeline = page.getByRole('list', { name: 'Status history' });
  await expect(timeline).toBeVisible();
  await expect(timeline.getByRole('listitem').first()).toBeVisible();
});

test('7. a second company never sees the first company\'s workers or requests', async ({ page }) => {
  // Company A's roster and queue.
  await signIn(page, COMPANY_A);
  await page.goto('/portal/workers');
  await expect(page.getByRole('table')).toBeVisible();
  expect(await page.getByRole('table').innerText()).toContain('A. Al-Harbi');

  // Sign out, sign in as Company B.
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/portal\/login$/);

  await signIn(page, COMPANY_B);

  // None of Company A's workers may appear anywhere in Company B's portal.
  for (const route of ['/portal', '/portal/workers', '/portal/requests', '/portal/certificates']) {
    await page.goto(route);
    const body = await page.locator('body').innerText();
    expect(body, `leak on ${route}`).not.toContain('A. Al-Harbi');
    expect(body, `leak on ${route}`).not.toContain('R. Menon');
    expect(body, `leak on ${route}`).not.toContain('S. Okonkwo');
  }

  await page.goto('/portal/workers');
  await expect(page.getByRole('table')).toContainText('M. Haddad'); // B's own worker
});

test('9. a company user is refused the Medical Alliance staff console', async ({ page }) => {
  await signIn(page, COMPANY_A);

  // The admin guard sends a signed-in company user back to their own portal.
  await page.goto('/admin/requests');
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // And the API refuses directly, which is the control that actually matters.
  const response = await page.request.get('/api/admin/requests');
  expect(response.status()).toBe(401);
});

test('10. employees can be registered and searched', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await page.goto('/portal/workers');

  const unique = `E2E-${Date.now()}`;
  await page.getByRole('button', { name: 'Register worker' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Full name').fill('E2E Test Worker');
  await dialog.getByLabel(/National ID/).fill(unique);
  await dialog.getByLabel('Job title').fill('Inspector');
  await dialog.getByRole('button', { name: /Register worker/ }).click();

  // Registering navigates straight to the new worker's record.
  await expect(page.getByRole('heading', { name: 'E2E Test Worker' })).toBeVisible();
  await expect(page.getByText(unique)).toBeVisible();

  // And the roster search finds them, server-side.
  await page.goto('/portal/workers');
  await page.getByLabel('Search').fill('E2E Test Worker');
  await expect(page.getByRole('table')).toContainText('E2E Test Worker');
});

test('8. sign out ends the session and re-protects the portal', async ({ page }) => {
  await signIn(page, COMPANY_A);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/portal\/login$/);

  await page.goto('/portal');
  await expect(page).toHaveURL(/\/portal\/login$/);
});
