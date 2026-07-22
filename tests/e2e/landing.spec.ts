import { expect, test } from '@playwright/test';

test('explains Kairo and exposes every chapter', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Kairo — Learn any creative tool');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
  await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  for (const id of ['understand', 'learn', 'travel', 'access']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test('supports manual learning interactions without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  const context = page.locator('#understand');
  await context.scrollIntoViewIfNeeded();
  await expect(context).toHaveAttribute('data-context-phase', 'complete');
  await context.getByRole('button', { name: 'Replay explanation' }).click();
  await expect(context.getByRole('button', { name: 'Playing explanation' })).toBeDisabled();
  await expect(context).toHaveAttribute('data-context-phase', 'complete');

  const workAreaEnd = page.getByRole('slider', {
    name: 'Move the work-area end in After Effects'
  });
  await workAreaEnd.fill('52');
  await workAreaEnd.dispatchEvent('pointerup');
  await expect(page.locator('#learn')).toHaveAttribute('data-guided-phase', 'waiting');
  await expect(page.locator('#learn').getByRole('status')).toHaveCount(0);
  await workAreaEnd.fill('68');
  await workAreaEnd.dispatchEvent('pointerup');
  await expect(page.locator('#learn').getByRole('status')).toContainText('That’s aligned.');

  const travel = page.locator('#travel');
  await travel.getByRole('radio', { name: 'DaVinci Resolve' }).click();
  await expect(travel).toHaveAttribute('data-active-app', 'davinci-resolve');
  await travel.getByRole('radio', { name: 'Blender' }).click();
  await expect(travel).toHaveAttribute('data-active-app', 'blender');
  expect(errors).toEqual([]);
});

test('keeps the guided control inside the timeline and clear of Kairo guidance', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 960 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#learn');

    const lesson = page.locator('#learn');
    await lesson.scrollIntoViewIfNeeded();
    const geometry = await lesson.evaluate((section) => {
      const timeline = section.querySelector('[data-guided-timeline]')?.getBoundingClientRect();
      const response = section.querySelector('[data-guided-response]')?.getBoundingClientRect();
      const slider = section.querySelector('input[type="range"]')?.getBoundingClientRect();

      if (!timeline || !response || !slider) throw new Error('Missing guided lesson geometry');
      return {
        timeline: { top: timeline.top, right: timeline.right, bottom: timeline.bottom, left: timeline.left },
        response: { top: response.top, right: response.right, bottom: response.bottom, left: response.left },
        slider: { top: slider.top, right: slider.right, bottom: slider.bottom, left: slider.left }
      };
    });

    expect(geometry.slider.left).toBeGreaterThanOrEqual(geometry.timeline.left);
    expect(geometry.slider.right).toBeLessThanOrEqual(geometry.timeline.right);
    expect(geometry.slider.top).toBeGreaterThanOrEqual(geometry.timeline.top);
    expect(geometry.slider.bottom).toBeLessThanOrEqual(geometry.timeline.bottom);

    const overlaps = !(
      geometry.response.right <= geometry.timeline.left ||
      geometry.response.left >= geometry.timeline.right ||
      geometry.response.bottom <= geometry.timeline.top ||
      geometry.response.top >= geometry.timeline.bottom
    );
    expect(overlaps).toBe(false);
  }
});

test('completes the untouched guided story while it remains visible on mobile and tablet', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 960 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#learn');

    const lesson = page.locator('#learn');
    await lesson.evaluate((section) => {
      const bounds = section.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + bounds.bottom - window.innerHeight * 0.2,
        behavior: 'instant'
      });
    });

    await expect(lesson).toHaveAttribute('data-guided-phase', 'verified');
    await expect(lesson).toHaveAttribute('data-interaction-owner', 'story');
    await expect(lesson.getByRole('slider')).toHaveValue('68');
    await expect(lesson.getByRole('status')).toContainText('That’s aligned.');
    await expect(lesson).toBeInViewport();
  }
});

test('restarts an auto-completed lesson when the learner takes control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#learn');

  const lesson = page.locator('#learn');
  await lesson.evaluate((section) => {
    const bounds = section.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + bounds.bottom - window.innerHeight * 0.2,
      behavior: 'instant'
    });
  });
  await expect(lesson).toHaveAttribute('data-guided-phase', 'verified');

  const slider = lesson.getByRole('slider', {
    name: 'Move the work-area end in After Effects'
  });
  await slider.focus();

  await expect(lesson).toHaveAttribute('data-guided-phase', 'waiting');
  await expect(lesson).toHaveAttribute('data-interaction-owner', 'learner');
  await expect(slider).toHaveValue('38');
  await expect(lesson.getByRole('status')).toHaveCount(0);

  await slider.fill('68');
  await expect(lesson).toHaveAttribute('data-guided-phase', 'verified');
  await slider.evaluate((control) => (control as HTMLElement).blur());
  await slider.focus();
  await expect(lesson).toHaveAttribute('data-guided-phase', 'verified');
  await expect(slider).toHaveValue('68');
});

test('lets learners replay each guided state on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#learn');

    const lesson = page.locator('#learn');
    await lesson.scrollIntoViewIfNeeded();
    const explain = lesson.getByRole('button', { name: /Explain/ });
    const waiting = lesson.getByRole('button', { name: /Your turn/ });
    const checked = lesson.getByRole('button', { name: /Checked/ });

    await waiting.click();
    await expect(lesson).toHaveAttribute('data-guided-phase', 'waiting');
    await expect(waiting).toHaveAttribute('aria-pressed', 'true');

    await checked.click();
    await expect(lesson).toHaveAttribute('data-guided-phase', 'verified');
    await expect(checked).toHaveAttribute('aria-pressed', 'true');
    await expect(lesson.getByRole('status')).toContainText('That’s aligned.');

    await explain.click();
    await expect(lesson).toHaveAttribute('data-guided-phase', 'guide');
    await expect(explain).toHaveAttribute('aria-pressed', 'true');
    await expect(lesson.locator('[data-guided-step-selection]')).toHaveCount(1);
  }
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
  await expect(page.getByRole('status')).toContainText('You’re on the list. Go make something.');
  await expect(page.getByRole('status')).toBeFocused();
  expect(requests).toHaveLength(1);
});

test('keeps section navigation out of the phone layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const nav = page.locator('nav[aria-label="Landing page"]');
  await expect(nav).toBeHidden();
  for (const id of ['understand', 'learn', 'travel', 'access']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(nav).toBeHidden();
  }
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
  expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(geometry.bodyClientWidth);
});

test('tracks the current section in the desktop navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Landing page' });
  const sections = [
    ['understand', 'How Kairo sees'],
    ['learn', 'Guided lesson'],
    ['travel', 'Creative tools']
  ] as const;

  for (const [id, label] of sections) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'location');
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
  }
});

test('keeps tablet section navigation inline and tappable', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 960 });
  await page.goto('/');

  const header = page.getByRole('banner');
  const nav = page.getByRole('navigation', { name: 'Landing page' });
  await expect(nav).toBeVisible();

  const geometry = await nav.getByRole('link').evaluateAll((links) =>
    links.map((link) => {
      const bounds = link.getBoundingClientRect();
      const headerBounds = link.closest('header')?.getBoundingClientRect();
      return {
        height: bounds.height,
        left: bounds.left,
        right: bounds.right,
        headerTop: headerBounds?.top,
        headerBottom: headerBounds?.bottom,
        top: bounds.top,
        bottom: bounds.bottom
      };
    })
  );

  await expect(header).toBeVisible();
  expect(geometry.every(({ height }) => height >= 44)).toBe(true);
  expect(geometry.every(({ left, right }) => left >= 0 && right <= 768)).toBe(true);
  expect(geometry.every(({ headerTop, headerBottom, top, bottom }) =>
    headerTop !== undefined && headerBottom !== undefined && top >= headerTop && bottom <= headerBottom
  )).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

test('keeps the mobile source-to-zoom story visible without covering the response', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#understand');

  const section = page.locator('#understand');
  await expect(section).toHaveAttribute('data-context-phase', 'complete', { timeout: 5_000 });
  await expect(section.locator('[data-context-source]')).toBeVisible();
  await expect(section.locator('[data-context-enlargement]')).toBeVisible();
  await expect(section.locator('[data-mobile-zoom-connector]')).toBeVisible();

  const nav = page.locator('nav[aria-label="Landing page"]');
  await expect(nav).toBeHidden();

  await page.locator('#learn').scrollIntoViewIfNeeded();
  await expect(nav).toHaveAttribute('data-active-section', 'learn');
  await expect(nav).toBeHidden();

  await page.locator('#travel').scrollIntoViewIfNeeded();
  await expect(nav).toHaveAttribute('data-active-section', 'travel');
  await expect(nav).toBeHidden();
});

test('lets the access form own conversion while it is visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#access');

  const header = page.getByRole('banner');
  const access = page.locator('#access');
  await access.scrollIntoViewIfNeeded();
  await expect(access).toBeInViewport();
  await expect(header.getByRole('link', { name: 'Request alpha access' })).toHaveCount(0);
  await expect(header.getByRole('link', { name: 'Kairo on GitHub' })).toHaveCount(0);
  await expect(access.getByRole('button', { name: 'Request alpha access' })).toBeVisible();
});

test('keeps copy static when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-context-phase="complete"]')).toBeVisible();
  await expect(page.locator('[data-guided-phase="verified"]')).toBeVisible();
  const travel = page.locator('#travel');
  await travel.scrollIntoViewIfNeeded();
  await expect(travel.getByRole('radio')).toHaveCount(28);
  await expect(travel).toHaveAttribute('data-active-app', 'after-effects');
  await expect(travel.locator('[data-infinite-app-field]')).toHaveAttribute('data-field-motion', 'reduced');
  await travel.getByRole('radio', { name: 'Blender' }).click();
  await expect(travel).toHaveAttribute('data-active-app', 'blender');
  await expect(page.getByRole('heading', { name: 'Learn by doing. Built in the open.' })).toBeVisible();
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps the complete learning journey readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
    await expect(page.getByText('Kairo sees what you mean.')).toBeVisible();
    await expect(page.getByText('You make the move.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kairo goes where you create.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learn by doing. Built in the open.' })).toBeVisible();
    await expect(page.getByText('Open Preview in the right dock. That panel holds the playback controls.').first()).toBeVisible();
    const travel = page.locator('#travel');
    await expect(travel.getByRole('radio')).toHaveCount(28);
    for (const tool of ['After Effects', 'DaVinci Resolve', 'Blender', 'Figma', 'VS Code', 'Grafana', 'Notion', 'Google Sheets', 'AutoCAD']) {
      await expect(travel.getByRole('radio', { name: tool })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  });
});
