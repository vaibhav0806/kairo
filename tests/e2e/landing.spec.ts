import { expect, test as base, type Page } from '@playwright/test';

const title = 'Kairo — Learn by doing';
const description = 'Ask Kairo about what is on your screen and get one clear next step while you learn.';

const assetPaths = [
  '/favicon.svg',
  '/kairo-blender-preview.webp',
  '/field-notes/field-hero.webp',
  '/field-notes/field-hero-mobile.webp',
  '/field-notes/sketches.webp',
  '/field-notes/workbench.webp',
  '/field-notes/trust-rock.webp',
  '/field-notes/footer-wildflower.webp'
] as const;

const sectionContracts = [
  { selector: '[data-hero-environment]', heading: 'Turn stuck into your next move.' },
  { selector: '#how-it-works', heading: 'See a lesson from start to finish.' },
  { selector: '#tools', heading: 'Learn across your tools' },
  { selector: '#practice', heading: 'Keep making. Keep learning.' },
  { selector: '#trust', heading: 'You stay in control.' },
  { selector: '#access', heading: 'Learn what you want to make.' }
] as const;

const viewports = [
  { name: 'desktop', width: 1440, height: 900, documentHeight: 9069 },
  { name: 'tablet', width: 1024, height: 768, documentHeight: 7903 },
  { name: 'mobile', width: 390, height: 844, documentHeight: 7520 }
] as const;

const test = base.extend<{ browserErrors: void }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
    });

    await use();

    expect(errors, 'the page must not emit uncaught errors or console errors').toEqual([]);
  }, { auto: true }]
});

async function gotoLanding(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

test('renders the exact landing metadata, navigation, sections, and footer', async ({ page }) => {
  await gotoLanding(page);

  await expect(page).toHaveTitle(title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);

  const favicon = page.locator('link[rel~="icon"]');
  await expect(favicon).toHaveAttribute('href', /\/favicon\.svg(?:\?.*)?$/);
  expect(new URL(await favicon.getAttribute('href') ?? '', page.url()).pathname).toBe('/favicon.svg');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Turn stuck into your next move.');
  await expect(page.getByRole('link', { name: 'Kairo home' })).toHaveAttribute('href', '#top');

  const navigation = page.getByRole('navigation', { name: 'Landing page' });
  const navLinks = navigation.getByRole('link');
  await expect(navLinks).toHaveCount(3);
  await expect(navLinks.nth(0)).toHaveAttribute('aria-label', 'How it works');
  await expect(navLinks.nth(0)).toHaveAttribute('href', '#how-it-works');
  await expect(navLinks.nth(1)).toHaveAttribute('aria-label', 'Tools');
  await expect(navLinks.nth(1)).toHaveAttribute('href', '#tools');
  await expect(navLinks.nth(2)).toHaveAttribute('aria-label', 'Trust');
  await expect(navLinks.nth(2)).toHaveAttribute('href', '#trust');
  await expect(page.getByRole('link', { name: /Join the alpha/ })).toHaveAttribute('href', '#access');

  const orderedSections = await page.locator('main > section').evaluateAll((sections) => sections.map((section) =>
    section.hasAttribute('data-hero-environment') ? '[data-hero-environment]' : `#${section.id}`
  ));
  expect(orderedSections).toEqual(sectionContracts.map(({ selector }) => selector));

  for (const { selector, heading } of sectionContracts) {
    await expect(page.locator(selector).getByRole('heading').first()).toHaveText(heading);
  }

  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Learn by doing.');
  await expect(footer.locator('[data-footer-wordmark]')).toHaveText('kairo');
  await expect(footer.locator('[data-footer-wildflower]')).toHaveAttribute('src', '/field-notes/footer-wildflower.webp');
});

test('serves every public image and renders only same-origin root-relative asset URLs', async ({ page }) => {
  const assetResponses: Array<{ path: string; status: number }> = [];
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if ((assetPaths as readonly string[]).includes(path)) {
      assetResponses.push({ path, status: response.status() });
    }
  });

  await gotoLanding(page);

  const renderedAssetUrls = await page.locator('img, source').evaluateAll((elements) => elements.flatMap((element) => {
    const values = [element.getAttribute('src'), element.getAttribute('srcset')];
    return values.flatMap((value) => value?.split(',').map((candidate) => candidate.trim().split(/\s+/)[0] ?? '') ?? []).filter(Boolean);
  }));
  const expectedRenderedAssets = assetPaths.filter((path) => path !== '/favicon.svg');
  expect([...new Set(renderedAssetUrls)].sort()).toEqual([...expectedRenderedAssets].sort());

  for (const assetUrl of renderedAssetUrls) {
    expect(assetUrl.startsWith('/')).toBe(true);
    expect(assetUrl.startsWith('//')).toBe(false);
    expect(new URL(assetUrl, page.url()).origin).toBe(new URL(page.url()).origin);
  }

  for (const path of assetPaths) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
    const expectedType = path.endsWith('.svg') ? 'image/svg+xml' : 'image/webp';
    expect(response.headers()['content-type'], path).toContain(expectedType);
  }

  expect(assetResponses.every(({ status }) => status === 200)).toBe(true);
});

test('hydrates the hero and tool carousel controls', async ({ page }) => {
  await gotoLanding(page);

  const hero = page.locator('[data-hero-environment]');
  await expect(hero).toHaveAttribute('data-demo-paused', 'false');
  await page.getByRole('button', { name: 'Pause lesson' }).click();
  await expect(hero).toHaveAttribute('data-demo-paused', 'true');
  await page.getByRole('button', { name: 'Play lesson' }).click();
  await expect(hero).toHaveAttribute('data-demo-paused', 'false');

  const tools = page.locator('#tools');
  const figmaTab = tools.getByRole('tab', { name: /Figma/ });
  await figmaTab.click();
  await expect(figmaTab).toHaveAttribute('aria-selected', 'true');
  await expect(tools.locator('#tool-panel-figma')).toHaveAttribute('aria-hidden', 'false');
  await expect(tools.getByRole('button', { name: 'Play tool carousel' })).toBeVisible();
  await tools.getByRole('button', { name: 'Play tool carousel' }).click();
  await expect(tools.getByRole('button', { name: 'Pause tool carousel' })).toBeVisible();
});

test('loads a cold waitlist hash and validates without mutating remote state', async ({ page }) => {
  const mutationRequests: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) {
      mutationRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await gotoLanding(page, '/#access');
  const waitlist = page.locator('#access');
  await expect(waitlist).toBeInViewport();

  const input = page.getByLabel('Email address');
  await input.fill('learner@');
  await page.getByRole('button', { name: 'Join the alpha' }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(waitlist.getByRole('alert')).toHaveText('Enter a valid email address.');

  await input.fill('  learner@example.com  ');
  await page.getByRole('button', { name: 'Join the alpha' }).click();
  const success = page.getByRole('status');
  await expect(success).toBeFocused();
  await expect(success).toContainText('Preview complete. Your email was not submitted or stored.');
  await expect(success).toContainText('learner@example.com');
  expect(mutationRequests).toEqual([]);
});

for (const viewport of viewports) {
  test(`${viewport.name} viewport retains every section without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoLanding(page);

    const geometry = await page.evaluate(() => ({
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      rootClientWidth: document.documentElement.clientWidth,
      rootScrollWidth: document.documentElement.scrollWidth
    }));
    expect(geometry.rootScrollWidth).toBeLessThanOrEqual(geometry.rootClientWidth);
    expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(geometry.bodyClientWidth);

    for (const { selector, heading } of sectionContracts) {
      await expect(page.locator(selector)).toBeAttached();
      await expect(page.locator(selector).getByRole('heading').first()).toHaveText(heading);
    }
  });
}

async function captureStableScreenshot(page: Page, viewport: { name: string; width: number; height: number; documentHeight: number }) {
  await page.setViewportSize(viewport);
  await gotoLanding(page);

  const hero = page.locator('[data-hero-environment]');
  await hero.locator('[data-hero-stage] figcaption button').evaluate((button: HTMLButtonElement) => button.click());
  await expect(hero).toHaveAttribute('data-demo-paused', 'true');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await hero.evaluate((environment) => {
    for (const animation of environment.getAnimations({ subtree: true })) {
      animation.currentTime = 0;
      animation.pause();
    }
  });

  const tools = page.locator('#tools');
  const blenderTab = tools.getByRole('tab', { name: /Blender/ });
  await blenderTab.evaluate((button: HTMLButtonElement) => button.click());
  await expect(blenderTab).toHaveAttribute('aria-selected', 'true');
  await expect(tools.locator('#tool-panel-blender')).toHaveAttribute('aria-hidden', 'false');
  await expect(tools.getByRole('button', { name: 'Play tool carousel' })).toBeVisible();
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      caret-color: transparent !important;
      transition: none !important;
    }
    html { scroll-behavior: auto !important; }
  ` });

  await page.evaluate(async () => {
    const revealTargets = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-tool-reveal]')];
    for (const target of revealTargets) {
      target.scrollIntoView({ block: 'center' });
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-tool-reveal]')]
    .every((target) => target.dataset.revealed === 'true'));
  await page.waitForFunction(() => [...document.images].every((image) => image.complete), undefined, { timeout: 5_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, 0);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });

  const documentDimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight
  }));
  expect(documentDimensions).toEqual({ width: viewport.width, height: viewport.documentHeight });

  await page.screenshot({
    path: `/tmp/kairo-next-${viewport.name}-stable.png`,
    fullPage: true,
    animations: 'disabled'
  });
}

for (const viewport of viewports) {
  test(`captures deterministic ${viewport.name} screenshot`, async ({ page }) => {
    test.setTimeout(60_000);
    await captureStableScreenshot(page, viewport);
  });
}
