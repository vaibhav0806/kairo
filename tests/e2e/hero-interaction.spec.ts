import { expect, test } from '@playwright/test';

test('keeps keyboard target selection equivalent to drawing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Kairo about the layers' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('driving the motion');
});

test('recognizes a pointer loop around the timeline', async ({ page }) => {
  await page.goto('/');
  const timeline = page.getByRole('button', { name: 'Ask Kairo about the timeline' });
  await timeline.scrollIntoViewIfNeeded();
  const box = await timeline.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const points = [
    [box.x - 12, box.y + box.height / 2],
    [box.x, box.y - 12],
    [box.x + box.width / 2, box.y - 18],
    [box.x + box.width + 12, box.y],
    [box.x + box.width + 18, box.y + box.height / 2],
    [box.x + box.width + 8, box.y + box.height + 12],
    [box.x + box.width / 2, box.y + box.height + 18],
    [box.x - 8, box.y + box.height + 12],
    [box.x - 12, box.y + box.height / 2]
  ];
  await page.mouse.move(points[0]?.[0] ?? 0, points[0]?.[1] ?? 0);
  await page.mouse.down();
  for (const [x, y] of points.slice(1)) await page.mouse.move(x, y, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByRole('status')).toContainText('easing');
});

test.describe('touch hero', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true
  });

  test('keeps vertical scrolling available outside the drawing region', async ({ page }) => {
    await page.goto('/');
    await page.locator('#product-moments').scrollIntoViewIfNeeded();
    await expect(page.locator('#product-moments')).toBeInViewport();
  });
});
