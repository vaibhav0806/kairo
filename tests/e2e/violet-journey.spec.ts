import { expect, test } from '@playwright/test';

test('moves from guided practice into tool travel with keyboard parity', async ({ page }) => {
  await page.goto('/#learn');

  const lesson = page.locator('#learn');
  const workAreaEnd = lesson.getByRole('slider', {
    name: 'Move the work-area end in After Effects'
  });
  await workAreaEnd.fill('52');
  await workAreaEnd.dispatchEvent('pointerup');
  await expect(lesson).toHaveAttribute('data-guided-phase', 'waiting');

  await workAreaEnd.fill('68');
  await workAreaEnd.dispatchEvent('pointerup');
  await expect(lesson.getByRole('status')).toContainText('That’s aligned.');

  const travel = page.locator('#travel');
  const afterEffects = travel.getByRole('radio', { name: 'After Effects' });
  await afterEffects.click();
  await expect(travel).toHaveAttribute('data-active-app', 'after-effects');

  await afterEffects.focus();
  await page.keyboard.press('ArrowRight');
  await expect(travel).toHaveAttribute('data-active-app', 'vscode');
  await expect(travel.getByRole('radio', { name: 'VS Code' })).toBeFocused();

  await page.keyboard.press('End');
  await expect(travel).toHaveAttribute('data-active-app', 'autocad');
  await expect(travel.getByRole('radio', { name: 'AutoCAD' })).toBeFocused();

  await page.keyboard.press('Home');
  await expect(travel).toHaveAttribute('data-active-app', 'after-effects');
  await expect(afterEffects).toBeFocused();
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

test('keeps the app field playable and scroll-safe on phones', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#travel');
    await page.reload();

    const travel = page.locator('#travel');
    await travel.scrollIntoViewIfNeeded();
    const choices = travel.getByRole('radio');
    const visibleChoices = choices.filter({ visible: true });
    await expect(travel.locator('[role="radio"]')).toHaveCount(28);
    await expect(choices).toHaveCount(20);
    await expect(visibleChoices).toHaveCount(20);
    for (let index = 0; index < 20; index += 1) {
      const bounds = await visibleChoices.nth(index).boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    for (const name of [
      'After Effects',
      'DaVinci Resolve',
      'Blender',
      'Figma',
      'VS Code',
      'Grafana',
      'Notion',
      'Google Sheets'
    ]) {
      const choice = travel.getByRole('radio', { name });
      await expect(choice).toBeVisible();
    }

    const field = travel.locator('[data-infinite-app-field]');
    await page.mouse.move(0, 0);
    await expect(field).toHaveAttribute('data-field-motion', 'running');
    const firstNode = travel.locator('[data-field-node]').first();
    const transformBefore = await firstNode.evaluate((node) => getComputedStyle(node).transform);
    await page.waitForTimeout(500);
    const transformAfter = await firstNode.evaluate((node) => getComputedStyle(node).transform);
    expect(transformAfter).not.toBe(transformBefore);

    await travel.getByRole('radio', { name: 'Grafana' }).click({ force: true });
    await expect(travel).toHaveAttribute('data-active-app', 'grafana');
    await expect(travel.locator('[data-kairo-puck]')).toHaveAttribute('data-active-app', 'grafana');

    const geometry = await travel.evaluate((section) => ({
      clientWidth: section.clientWidth,
      scrollWidth: section.scrollWidth,
      fieldHeight: section.querySelector('[data-infinite-app-field]')?.getBoundingClientRect().height ?? 0
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.fieldHeight).toBeGreaterThanOrEqual(260);
  }
});

test('pauses only the hovered app while the field keeps moving', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#travel');

  const travel = page.locator('#travel');
  await travel.scrollIntoViewIfNeeded();
  const field = travel.locator('[data-infinite-app-field]');
  await expect(field).toHaveAttribute('data-field-motion', 'running');

  const hoveredChoice = travel.getByRole('radio', { name: 'After Effects' });
  const hoveredNode = hoveredChoice.locator('..');
  const movingNode = travel.locator('[data-field-node]').nth(1);
  await hoveredChoice.hover({ force: true });

  await expect(field).toHaveAttribute('data-field-motion', 'running');
  expect(await hoveredNode.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe('paused');
  expect(await movingNode.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe('running');
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
