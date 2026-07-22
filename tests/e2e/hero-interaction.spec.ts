import { expect, test } from '@playwright/test';

test('pauses creator footage when another workspace becomes active', async ({ page }) => {
  await page.goto('/');

  const workspace = page.getByLabel('Creator workspaces Kairo can understand');
  const creatorVideo = page.locator('[data-artifact="creator"] video');

  await expect(workspace).toHaveAttribute('data-hero-visible', 'true');
  await expect(page.locator('[class*="Activity"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Ask Kairo about the After Effects workspace' }).click();
  await expect.poll(() => creatorVideo.evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);

  await page.locator('[data-hero-intro]').evaluate((element) =>
    window.scrollTo({ top: element.getBoundingClientRect().bottom + window.scrollY })
  );
  await expect(workspace).toHaveAttribute('data-hero-visible', 'false');
});

test('keeps the connector on stable workspace anchors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Kairo about the Figma layout' }).click();

  const connector = page.locator('[class*="inkSignal"] path');
  await expect(connector).toHaveAttribute('d', /^M /);
  const before = await connector.getAttribute('d');
  await page.waitForTimeout(350);
  expect(await connector.getAttribute('d')).toBe(before);
});

test('acknowledges a workspace before Kairo streams its reply', async ({ page }) => {
  await page.goto('/');

  const figma = page.getByRole('button', { name: 'Ask Kairo about the Figma layout' });
  const reply = page.locator('[data-reply-stream]');

  await figma.click();
  await expect(figma).toHaveAttribute('aria-pressed', 'true');
  await expect(reply).toHaveText('');
  await page.waitForTimeout(240);
  await expect(reply).toHaveText('');
  await expect.poll(() => reply.textContent(), { timeout: 1_000 }).not.toBe('');
  await expect(reply).toHaveText(
    'This card wraps because its parent frame is fixed. Switch the width to hug contents.',
    { timeout: 3_000 }
  );
});

test.describe('tablet hero composition', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('keeps the response card inset and the Blender artifact secondary', async ({ page }) => {
    await page.goto('/');

    const geometry = await page.evaluate(() => {
      const note = document
        .querySelector('[data-connector-anchor="kairo-response"]')
        ?.getBoundingClientRect();
      const blender = document
        .querySelector('[data-artifact="blender"]')
        ?.getBoundingClientRect();
      if (!note || !blender) return null;

      return {
        noteInset: window.innerWidth - note.right,
        blenderWidth: blender.width,
        blenderHeight: blender.height,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.noteInset).toBeGreaterThanOrEqual(20);
    expect(geometry?.noteInset).toBeLessThanOrEqual(28);
    expect(geometry?.blenderWidth).toBeLessThanOrEqual(270);
    expect(geometry?.blenderHeight).toBeLessThanOrEqual(165);
  });

  test('routes every workspace connector around the central copy', async ({ page }) => {
    await page.goto('/');

    for (const [name, target] of [
      ['Ask Kairo about the editing desk', 'creator'],
      ['Ask Kairo about the After Effects workspace', 'afterEffects'],
      ['Ask Kairo about the Blender viewport', 'blender'],
      ['Ask Kairo about the Figma layout', 'figma'],
      ['Ask Kairo about the DaVinci node graph', 'davinci'],
    ]) {
      await page.getByRole('button', { name }).click();
      await expect(page.locator('[data-connector-target]')).toHaveAttribute(
        'data-connector-target',
        target
      );
      const intersectsCopy = await page.evaluate(() => {
        const canvas = document.querySelector('[data-hero-intro]');
        const copy = document.querySelector('[data-hero-intro] h1')?.parentElement;
        const path = document.querySelector<SVGPathElement>('[class*="inkSignal"] path');
        if (!canvas || !copy || !path) return true;

        const canvasRect = canvas.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        const pathLength = path.getTotalLength();

        for (let index = 0; index <= 100; index += 1) {
          const point = path.getPointAtLength((pathLength * index) / 100);
          const x = point.x + canvasRect.left;
          const y = point.y + canvasRect.top;
          if (
            x > copyRect.left &&
            x < copyRect.right &&
            y > copyRect.top &&
            y < copyRect.bottom
          ) return true;
        }

        return false;
      });

      expect(intersectsCopy).toBe(false);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  });
});

test('gives the alpha CTA physical press feedback without forcing reduced-motion movement', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('#hero-access-cta');
  const box = await cta.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const restingTransform = await cta.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(60);
  const pressedTransform = await cta.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.up();
  expect(pressedTransform).not.toBe(restingTransform);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reducedCta = page.locator('#hero-access-cta');
  const reducedResting = await reducedCta.evaluate((element) => getComputedStyle(element).transform);
  await reducedCta.hover();
  const reducedHover = await reducedCta.evaluate((element) => getComputedStyle(element).transform);
  expect(reducedHover).toBe(reducedResting);
});

test.describe('mobile hero composition', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('keeps the creator workspace close to the CTA without overlap', async ({ page }) => {
    await page.goto('/');
    const spacing = await page.evaluate(() => {
      const cta = document.querySelector('#hero-access-cta')?.getBoundingClientRect();
      const creator = document.querySelector('[data-artifact="creator"]')?.getBoundingClientRect();
      const note = document.querySelector('[data-connector-anchor="kairo-response"]')?.getBoundingClientRect();
      if (!cta || !creator || !note) return null;
      return {
        creatorGap: creator.top - cta.bottom,
        noteGap: note.top - cta.bottom,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(spacing).not.toBeNull();
    expect(spacing?.creatorGap).toBeGreaterThan(70);
    expect(spacing?.creatorGap).toBeLessThan(130);
    expect(spacing?.noteGap).toBeGreaterThan(180);
    expect(spacing?.scrollWidth).toBe(390);
  });

  test('keeps the active creator filename clear of the response card', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);

    const geometry = await page.evaluate(() => {
      const filename = document
        .querySelector('[data-artifact="creator"] [class*="fileName"]')
        ?.getBoundingClientRect();
      const note = document
        .querySelector('[data-connector-anchor="kairo-response"]')
        ?.getBoundingClientRect();
      if (!filename || !note) return null;

      return {
        filenameLeft: filename.left,
        filenameRight: filename.right,
        noteLeft: note.left,
        filenameWidth: filename.width,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.filenameLeft).toBeGreaterThanOrEqual(0);
    expect(geometry?.filenameWidth).toBeGreaterThanOrEqual(114);
    expect(geometry?.filenameRight).toBeLessThanOrEqual(geometry?.noteLeft ?? 0);
    await expect(page.getByText('editing-desk.mov')).toBeVisible();
  });
});

test.describe('desktop hero balance', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the Blender artifact below the headline in visual mass', async ({ page }) => {
    await page.goto('/');
    const blender = page.locator('[data-artifact="blender"]');
    const box = await blender.boundingBox();

    expect(box).not.toBeNull();
    expect(box?.width).toBeLessThanOrEqual(390);
    expect(box?.height).toBeLessThanOrEqual(230);
  });
});

test('supports keyboard workspace selection without delayed motion', async ({ page }) => {
  await page.goto('/');

  const blender = page.getByRole('button', { name: 'Ask Kairo about the Blender viewport' });
  const workspace = page.getByLabel('Creator workspaces Kairo can understand');

  await blender.focus();
  await page.keyboard.press('Enter');

  await expect(blender).toHaveAttribute('aria-pressed', 'true');
  await expect(workspace).toHaveAttribute('data-active-target', 'blender');
  await expect(workspace).toHaveAttribute('data-sequence-phase', 'complete');
  await expect(page.getByLabel('Kairo response')).toContainText(
    'The bevel is fine. Apply the object scale first and the shading artifact should clear.'
  );
});

test.describe('touch hero', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true
  });

  test('supports touch workspace selection and keeps vertical scrolling available', async ({ page }) => {
    await page.goto('/');

    const figma = page.getByRole('button', { name: 'Ask Kairo about the Figma layout' });
    const workspace = page.getByLabel('Creator workspaces Kairo can understand');

    await figma.tap();
    await expect(figma).toHaveAttribute('aria-pressed', 'true');
    await expect(workspace).toHaveAttribute('data-active-target', 'figma');
    await expect(page.getByLabel('Kairo response')).toContainText(
      'This card wraps because its parent frame is fixed. Switch the width to hug contents.',
      { timeout: 3_000 }
    );

    await page.locator('#learn').scrollIntoViewIfNeeded();
    await expect(page.locator('#learn')).toBeInViewport();
  });
});
