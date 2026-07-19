import { expect, test } from '@playwright/test';

test('moves from guided practice into tool travel with keyboard parity', async ({ page }) => {
  await page.goto('/#learn');

  const lesson = page.locator('#learn');
  const maskEdge = lesson.getByRole('slider', { name: 'Move the mask edge' });
  await maskEdge.fill('52');
  await maskEdge.dispatchEvent('pointerup');
  await expect(lesson).toHaveAttribute('data-guided-phase', 'waiting');

  await maskEdge.fill('68');
  await maskEdge.dispatchEvent('pointerup');
  await expect(lesson.getByRole('status')).toContainText('Kairo verified the mask edge.');

  const travel = page.locator('#travel');
  const davinci = travel.getByRole('tab', { name: /DaVinci Resolve/ });
  await davinci.click();
  await expect(travel.locator('[data-tool="davinci"]')).toBeVisible();

  await davinci.focus();
  await page.keyboard.press('ArrowRight');
  await expect(travel.locator('[data-tool="blender"]')).toBeVisible();
  await expect(travel).toHaveAttribute('data-tool-selection-instant', 'true');
  const keyboardUnderlineDuration = await travel.getByRole('tab', { name: /Blender/ }).evaluate(
    (button) => getComputedStyle(button, '::after').transitionDuration
  );
  expect(keyboardUnderlineDuration).toBe('0s');

  await page.keyboard.press('End');
  await expect(travel.locator('[data-tool="figma"]')).toBeVisible();
});

test('keeps every chapter within the viewport across target widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 960 });
    await page.goto('/');

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth
    }));
    expect(geometry.scrollWidth, `document overflow at ${width}px`).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.bodyScrollWidth, `body overflow at ${width}px`).toBeLessThanOrEqual(geometry.bodyClientWidth);
  }
});

test('chapter navigation lands on each learning step without trapping scroll', async ({ page }) => {
  await page.goto('/');

  for (const [name, target] of [
    ['How Kairo sees', '#understand'],
    ['Guided lesson', '#learn'],
    ['Creative tools', '#travel']
  ] as const) {
    await page.getByRole('navigation', { name: 'Landing page' }).getByRole('link', { name }).click();
    await expect(page.locator(target)).toBeInViewport();
  }

  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);

  await page.getByRole('link', { name: 'Request alpha access' }).first().click();
  await expect(page.locator('#access')).toBeInViewport();
});
