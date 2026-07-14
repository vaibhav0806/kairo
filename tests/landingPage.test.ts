// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';

class IntersectionObserverHarness {
  static instances: IntersectionObserverHarness[] = [];

  constructor(private callback: IntersectionObserverCallback) {
    IntersectionObserverHarness.instances.push(this);
  }

  observe = vi.fn();
  disconnect = vi.fn();

  trigger(target: Element, isIntersecting: boolean) {
    this.callback(
      [{ target, isIntersecting }] as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
  }
}

let prefersReducedMotion = false;
const motionPreferenceListeners = new Set<(event: MediaQueryListEvent) => void>();

function setReducedMotion(matches: boolean) {
  prefersReducedMotion = matches;
  const event = { matches, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent;
  motionPreferenceListeners.forEach((listener) => listener(event));
}

function observerFor(target: Element): IntersectionObserverHarness {
  const observer = IntersectionObserverHarness.instances.find((instance) => (
    instance.observe.mock.calls.some(([observedTarget]) => observedTarget === target)
  ));
  if (!observer) throw new Error('No observer found for target');
  return observer;
}

beforeEach(() => {
  IntersectionObserverHarness.instances = [];
  prefersReducedMotion = false;
  motionPreferenceListeners.clear();

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: IntersectionObserverHarness
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      get matches() {
        return prefersReducedMotion;
      },
      addEventListener: vi.fn((eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') motionPreferenceListeners.add(listener);
      }),
      removeEventListener: vi.fn((eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') motionPreferenceListeners.delete(listener);
      })
    }))
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('landing page', () => {
  test('validates the local preview email field', () => {
    expect(validateWaitlistEmail('')).toBe('Enter your email address.');
    expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
  });

  test('renders the approved field-notes chapters in order', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const markers = [
      'id="top"',
      'id="how-it-works"',
      'id="tools"',
      'id="practice"',
      'id="trust"',
      'id="access"',
      '<footer'
    ];
    const positions = markers.map((marker) => html.indexOf(marker));

    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('data-field-notes="true"');
    expect(html).toContain('and any desktop tool you are learning');
  });

  test('shows one anchored scene through the complete learning loop', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    expect(html.match(/data-learning-workspace=/g)).toHaveLength(1);
    expect([...html.matchAll(/data-lesson-chapter="([^"]+)"/g)].map((match) => match[1]))
      .toEqual(['ask', 'point', 'try', 'checked']);
    ['Ask', 'Point', 'Try', 'Check'].forEach((label) => expect(html).toContain(label));
    expect(html).toContain('data-active-chapter="0"');
    expect(html).toContain('data-workspace-state="ask"');
  });

  test('keeps the lesson workspace in sync with the reading line', () => {
    const frames: FrameRequestCallback[] = [];
    const chapterTops = [400, 650, 1200, 1700];

    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1400);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const top = chapterTops[Number(this.dataset.chapterIndex)] ?? 0;
      return {
        bottom: top + 200,
        height: 200,
        left: 0,
        right: 100,
        top,
        width: 100,
        x: 0,
        y: top,
        toJSON: () => undefined
      };
    });

    const { container, unmount } = render(createElement(LandingPage));

    act(() => frames.shift()?.(0));
    expect(container.querySelector('[data-active-chapter]')?.getAttribute('data-active-chapter')).toBe('0');
    expect(container.querySelector('[data-learning-workspace]')?.getAttribute('data-workspace-state')).toBe('ask');

    chapterTops.splice(0, chapterTops.length, -1200, -700, -100, 650);
    act(() => window.dispatchEvent(new Event('scroll')));
    act(() => frames.shift()?.(16));

    expect(container.querySelector('[data-active-chapter]')?.getAttribute('data-active-chapter')).toBe('3');
    expect(container.querySelector('[data-learning-workspace]')?.getAttribute('data-workspace-state')).toBe('checked');

    act(() => window.dispatchEvent(new Event('scroll')));
    unmount();
    expect(cancelFrame).toHaveBeenCalled();

    const scheduledFrames = frames.length;
    ['scroll', 'resize', 'hashchange', 'pageshow'].forEach((eventName) => {
      window.dispatchEvent(new Event(eventName));
    });
    expect(frames).toHaveLength(scheduledFrames);
  });

  test('reveals a visual chapter once it enters the viewport', () => {
    const { container } = render(createElement(LandingPage));
    const page = container.querySelector<HTMLElement>('[data-field-notes]');
    const chapter = container.querySelector<HTMLElement>('#tools');

    expect(page?.dataset.motionReady).toBe('true');
    expect(page?.dataset.pageVisible).toBe('true');
    expect(page?.dataset.reducedMotion).toBe('false');
    expect(chapter?.dataset.revealed).toBeUndefined();

    act(() => observerFor(chapter as HTMLElement).trigger(chapter as HTMLElement, true));
    expect(chapter?.dataset.revealed).toBe('true');

    act(() => observerFor(chapter as HTMLElement).trigger(chapter as HTMLElement, false));
    expect(chapter?.dataset.revealed).toBe('true');
  });

  test('stops ambient motion when a photographic stage leaves the viewport', () => {
    const { container } = render(createElement(LandingPage));
    const stage = container.querySelector<HTMLElement>('[data-ambient-stage]');

    expect(stage).toBeTruthy();
    act(() => observerFor(stage as HTMLElement).trigger(stage as HTMLElement, true));
    expect(stage?.dataset.ambientActive).toBe('true');

    act(() => observerFor(stage as HTMLElement).trigger(stage as HTMLElement, false));
    expect(stage?.dataset.ambientActive).toBe('false');
  });

  test('keeps every chapter visible when reduced motion is enabled', () => {
    const { container } = render(createElement(LandingPage));
    const page = container.querySelector<HTMLElement>('[data-field-notes]');

    act(() => setReducedMotion(true));

    expect(page?.dataset.motionReady).toBeUndefined();
    expect(page?.dataset.reducedMotion).toBe('true');
    ['top', 'how-it-works', 'tools', 'practice', 'trust', 'access'].forEach((id) => {
      expect(container.querySelector(`#${id}`)).toBeTruthy();
    });
    expect(container.querySelectorAll('[data-reveal]')).toHaveLength(6);
  });

  test('provides complete reduced motion and pointer fallbacks', () => {
    const pageCss = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const heroCss = readFileSync('src/landing/Hero.module.css', 'utf8');
    const sequenceCss = readFileSync('src/landing/LearningSequence.module.css', 'utf8');

    expect(pageCss).toMatch(/\[data-motion-ready='true'\]\s+\[data-reveal\]:not\(\[data-revealed='true'\]\)/);
    expect(pageCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none\s*!important;[\s\S]*clip-path:\s*none\s*!important;/);
    expect(heroCss).toMatch(/@media\s*\(hover:\s*none\)/);
    expect(sequenceCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*position:\s*static;/);
  });

  test('reveals every visual chapter when the observer is unavailable', () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: undefined
    });

    const { container } = render(createElement(LandingPage));
    const chapters = [...container.querySelectorAll<HTMLElement>('[data-reveal]')];

    expect(chapters).toHaveLength(6);
    chapters.forEach((chapter) => expect(chapter.dataset.revealed).toBe('true'));
  });

  test('tracks page visibility and keeps native controls available', () => {
    const { container } = render(createElement(LandingPage));
    const page = container.querySelector<HTMLElement>('[data-field-notes]');

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(page?.dataset.pageVisible).toBe('false');
    expect(screen.getByRole('button', { name: 'Pause lesson' }).getAttribute('type')).toBe('button');
    expect(screen.getByLabelText('Email address').getAttribute('type')).toBe('email');
    expect(screen.getByRole('button', { name: 'Join the alpha' }).getAttribute('type')).toBe('submit');
  });

  test('gives the wordmark a full-height touch target', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).toMatch(/\.wordmark\s*\{[^}]*display:\s*inline-flex;/s);
  });

  test('leads with an editorial hero inside a tactile product scene', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('data-hero-environment="true"');
    expect(html).toContain('data-hero-stage="true"');
    expect(html).toContain('kairo-blender-preview.webp');
    expect(html).toContain('field-notes/field-hero.webp');
    expect(html).toContain('Pause lesson');
    expect(html).not.toContain('Blender skill active');
  });

  test('ships optimized local tactile photography with visible credits', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    ['field-hero.webp', 'field-hero-mobile.webp', 'meadow-edge.webp', 'sketches.webp', 'workbench.webp'].forEach((name) => {
      const image = readFileSync(`public/field-notes/${name}`);
      expect(image.toString('ascii', 0, 4)).toBe('RIFF');
      expect(image.toString('ascii', 8, 12)).toBe('WEBP');
      expect(image.byteLength).toBeLessThan(900_000);
    });
    expect(html).toContain('Pexels');
  });

  test('keeps hero credit links compact with full-height touch targets', () => {
    const css = readFileSync('src/landing/Hero.module.css', 'utf8');
    const creditLink = css.match(/\.credits a\s*\{([^}]*)\}/s)?.[1] ?? '';

    expect(creditLink).toMatch(/display:\s*inline-flex;/);
    expect(creditLink).toMatch(/min-height:\s*44px;/);
    expect(creditLink).toMatch(/align-items:\s*center;/);
  });

  test('uses neutral shadows for decorative hero layers', () => {
    const css = readFileSync('src/landing/Hero.module.css', 'utf8');
    const fieldPhoto = css.match(/\.fieldPhoto\s*\{([^}]*)\}/s)?.[1] ?? '';
    const productWindows = [...css.matchAll(/\.productWindow\s*\{([^}]*)\}/gs)]
      .map((match) => match[1]);

    expect(fieldPhoto).toMatch(/box-shadow:[^;]*var\(--paper-cool\)/);
    expect(fieldPhoto).not.toMatch(/box-shadow:[^;]*var\(--(?:coral|violet)\)/);
    expect(productWindows).toHaveLength(2);
    productWindows.forEach((productWindow) => {
      expect(productWindow).toMatch(/box-shadow:[^;]*var\(--ink\)/);
      expect(productWindow).not.toMatch(/box-shadow:[^;]*var\(--(?:coral|violet)\)/);
    });
  });

  test('keeps the stacked hero inside the mobile viewport', () => {
    const css = readFileSync('src/landing/Hero.module.css', 'utf8');

    expect(css).toMatch(/\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
  });

  test('uses the high-resolution Blender capture', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const image = readFileSync('public/kairo-blender-preview.webp');
    const dimensions = image.readUInt32LE(21);

    expect(html).toContain('kairo-blender-preview.webp');
    expect(image.toString('ascii', 0, 4)).toBe('RIFF');
    expect(image.toString('ascii', 8, 16)).toBe('WEBPVP8L');
    expect((dimensions & 0x3fff) + 1).toBeGreaterThanOrEqual(1698);
    expect(((dimensions >>> 14) & 0x3fff) + 1).toBeGreaterThanOrEqual(1054);
    expect(image.byteLength).toBeLessThan(1_500_000);
  });

  test('shows Kairo across multiple tools in one visual composition', () => {
    render(createElement(LandingPage));
    const region = screen.getByRole('region', { name: 'Learn across your tools' });

    ['Blender', 'Figma', 'VS Code', 'Photoshop'].forEach((tool) => {
      expect(within(region).getByText(tool)).toBeTruthy();
    });
    expect(region.querySelectorAll('[data-tool-print]')).toHaveLength(4);
    expect(region.querySelectorAll('[data-tool-focus]')).toHaveLength(4);
    expect(region.querySelector('img[src*="kairo-blender-preview.webp"]')).toBeTruthy();
    expect(region.querySelector('[data-tool-connector]')?.getAttribute('aria-hidden')).toBe('true');
    expect(within(region).getByRole('link', { name: 'Karol D' }).getAttribute('href')).toContain('/1111692/');
  });

  test('shows three concise practice moments in one environment', () => {
    render(createElement(LandingPage));
    const region = screen.getByRole('region', { name: 'Ask, try, learn' });
    const panels = within(region).getAllByRole('article');

    expect(panels).toHaveLength(3);
    expect(panels.map((panel) => panel.querySelector('h3')?.textContent)).toEqual(['Ask', 'Try', 'Learn']);
    expect(panels.map((panel) => panel.querySelector('p')?.textContent)).toEqual([
      'Say what is confusing or point straight at it.',
      'Follow one clear move while Kairo stays with you.',
      'See what changed, then keep going with confidence.'
    ]);
    const workbench = region.querySelectorAll('img[src*="field-notes/workbench.webp"]');
    expect(workbench).toHaveLength(1);
    expect(workbench[0]?.getAttribute('loading')).toBe('lazy');
    expect(within(region).getByRole('link', { name: 'Michael Burrows' }).getAttribute('href')).toContain('/7147730/');
  });

  test('states the three control promises without unsupported claims', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Starts only when you ask');
    expect(html).toContain('Pause anytime');
    expect(html).toContain('Points, never clicks');
    expect(html).toContain('AI can get things wrong');
    expect(html).not.toMatch(/military-grade|zero data retention|SOC 2/i);

    render(createElement(LandingPage));
    const trust = screen.getByRole('region', { name: 'You stay in control.' });

    expect(within(trust).getAllByRole('article')).toHaveLength(3);
    expect(within(trust).queryAllByRole('button')).toHaveLength(0);
    expect(trust.querySelector('[aria-roledescription="carousel"], [data-carousel]')).toBeNull();
  });

  test('renders one local-only waitlist field and a structured footer', () => {
    render(createElement(LandingPage));

    const waitlist = screen.getByRole('region', { name: 'Learn what you want to make.' });
    const submitButtons = waitlist.querySelectorAll('button[type="submit"]');
    const css = readFileSync('src/landing/TrustWaitlist.module.css', 'utf8');

    expect(within(waitlist).getAllByLabelText('Email address')).toHaveLength(1);
    expect(submitButtons).toHaveLength(1);
    expect(within(waitlist).getByRole('button', { name: 'Join the alpha' })).toBe(submitButtons[0]);
    expect(css).toMatch(/\.waitlist\s*\{[^}]*background:\s*var\(--paper\);/s);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    expect(screen.getByRole('contentinfo').querySelector('[data-footer-wordmark]')?.textContent).toBe('kairo');
  });
});
