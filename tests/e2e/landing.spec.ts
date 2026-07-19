import { expect, test } from '@playwright/test';

test('explains Kairo and exposes every chapter', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Kairo — Learn any creative tool');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
  await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  for (const id of ['understand', 'product-moments', 'capabilities', 'tools', 'control', 'access']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test('supports manual learning interactions without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  await page.getByRole('button', { name: 'Select the abrupt stop' }).click();
  await expect(page.getByText('Give the stop more room. Pull this handle left.')).toBeVisible();
  const handle = page.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
  await handle.fill('72');
  await handle.dispatchEvent('pointerup');
  await expect(page.getByRole('status')).toContainText('Result verified');
  await expect(page.locator('[data-context-active="true"]')).toBeVisible();
  await page.locator('#product-moments').getByRole('tab', { name: 'Point together' }).click();
  await page.locator('#tools').getByRole('tab', { name: 'DaVinci Resolve' }).click();
  await page.getByRole('button', { name: 'Show the next move' }).click();
  await expect(page.getByText('Now you try it.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('submits one normalized alpha request', async ({ page }) => {
  const requests: Array<{ method: string; body: unknown }> = [];
  let releaseResponse: () => void = () => undefined;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.route(/\/api\/waitlist(?:\?.*)?$/, async (route) => {
    const request = route.request();
    requests.push({ method: request.method(), body: request.postDataJSON() });
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto('/#access');
  const input = page.getByLabel('Email address');
  await input.fill('  Learner@Example.COM  ');
  await page.getByRole('button', { name: 'Request alpha access' }).last().click();

  await expect.poll(() => requests).toEqual([
    { method: 'POST', body: { email: 'learner@example.com' } }
  ]);
  await expect(page.getByRole('status')).toHaveCount(0);
  releaseResponse();
  await expect(page.getByRole('status')).toContainText('You’re on the list.');
  await expect(page.getByRole('status')).toBeFocused();
  expect(requests).toHaveLength(1);
});

test('keeps phone navigation visible without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Landing page' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link')).toHaveCount(3);
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
  expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(geometry.bodyClientWidth);
});

test('keeps copy static when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-notice-phase="verified"]')).toBeVisible();
  await expect(page.locator('[data-context-active="true"]')).toBeVisible();
  await expect(page.locator('[data-moment-response="ask"]')).toHaveCSS('opacity', '1');
  await expect(page.getByText('go make something.')).toBeVisible();
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps the lesson and context explanation readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
    await expect(page.getByText('You don’t have to explain the whole screen.')).toBeVisible();
    await expect(page.getByText('What Kairo understood')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  });
});
