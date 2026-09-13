import { expect, test } from '@playwright/test';

/** The migrated public site renders on real URLs with no console errors. */
test('every public route renders its migrated screen', async ({ page }) => {
  const errors: string[] = [];
  // The app asks GET /api/auth/me on mount to decide whether a visitor is signed
  // in. For a signed-out visitor that legitimately answers 401, and the browser
  // logs every failed resource load, so that one message is not an app error.
  const isExpectedSessionProbe = (text: string) => /401 \(Unauthorized\)/.test(text);
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isExpectedSessionProbe(msg.text())) errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Medical cover, wherever the work is\./ })).toBeVisible();

  await page.getByRole('link', { name: 'Services' }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('heading', { name: 'What Medical Alliance delivers' })).toBeVisible();

  await page.getByRole('link', { name: 'Remote sites' }).first().click();
  await expect(page).toHaveURL(/\/remote-sites$/);
  await expect(page.getByRole('heading', { name: /When the nearest hospital is two hours away/ })).toBeVisible();

  await page.getByRole('link', { name: 'Contact' }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole('heading', { name: /Request a consultation or site assessment/ })).toBeVisible();

  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
});

test('the design system renders from the bundle, not a CDN', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith('http://localhost') && !url.startsWith('data:')) external.push(url);
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Medical cover, wherever the work is\./ })).toBeVisible();

  // No unpkg React/Babel/Lucide, and no Google Fonts: the fonts are self-hosted.
  expect(external, `unexpected external requests: ${external.join(' | ')}`).toEqual([]);
  expect(await page.evaluate(() => 'MedicalAllianceDesignSystem_32f8e4' in window)).toBe(false);
  expect(await page.evaluate(() => 'lucide' in window)).toBe(false);
  expect(await page.evaluate(() => 'Babel' in window)).toBe(false);
});
