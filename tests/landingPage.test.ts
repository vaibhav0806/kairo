// @vitest-environment jsdom

import { readFileSync, readdirSync, statSync } from 'node:fs';
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
let stickyLessonMatches = false;
const motionPreferenceListeners = new Set<(event: MediaQueryListEvent) => void>();
const stickyLessonListeners = new Set<(event: MediaQueryListEvent) => void>();

function setReducedMotion(matches: boolean) {
  prefersReducedMotion = matches;
  const event = { matches, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent;
  motionPreferenceListeners.forEach((listener) => listener(event));
  const stickyEvent = {
    matches: stickyLessonMatches && !matches,
    media: '(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)'
  } as MediaQueryListEvent;
  stickyLessonListeners.forEach((listener) => listener(stickyEvent));
}

function setStickyLesson(matches: boolean) {
  stickyLessonMatches = matches;
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
  stickyLessonMatches = false;
  motionPreferenceListeners.clear();
  stickyLessonListeners.clear();

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: IntersectionObserverHarness
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const isStickyLesson = query.includes('min-width: 960px');
      const listeners = isStickyLesson ? stickyLessonListeners : motionPreferenceListeners;
      return {
      get matches() {
        return isStickyLesson ? stickyLessonMatches && !prefersReducedMotion : prefersReducedMotion;
      },
      addEventListener: vi.fn((eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') listeners.add(listener);
      }),
      removeEventListener: vi.fn((eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') listeners.delete(listener);
      })
    }})
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('landing page', () => {
  test('keeps the field-notes system responsive and within its image budget', () => {
    const css = [
      'LandingPage.module.css', 'Hero.module.css', 'LearningSequence.module.css',
      'VisualField.module.css', 'TrustWaitlist.module.css'
    ].map((name) => readFileSync(`src/landing/${name}`, 'utf8')).join('\n').toLowerCase();
    const assets = readdirSync('public/field-notes').map((name) => statSync(`public/field-notes/${name}`).size);

    expect(css).toContain('#ffffff');
    expect(css).toContain('instrument serif');
    expect(css).toContain('@media (min-width: 1180px)');
    expect(css).toContain('@media (min-width: 960px) and (min-height: 720px)');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(Math.max(...assets)).toBeLessThan(900_000);
    expect(assets.reduce((sum, size) => sum + size, 0)).toBeLessThan(5_000_000);
  });

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

  test('keeps the sticky lesson workspace in sync with the reading line', () => {
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

    setStickyLesson(true);

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

  test('does not drive lesson state from scroll in non-sticky fallbacks', () => {
    const frames: FrameRequestCallback[] = [];
    setStickyLesson(false);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });

    const { container } = render(createElement(LandingPage));
    act(() => window.dispatchEvent(new Event('scroll')));

    expect(frames).toHaveLength(0);
    expect(container.querySelector('[data-learning-workspace]')?.getAttribute('data-workspace-state')).toBe('ask');
    expect(container.querySelector('[data-active-chapter]')?.getAttribute('data-sticky-mode')).toBe('false');
    expect(container.querySelectorAll('[data-lesson-chapter][aria-current]')).toHaveLength(0);
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
    expect(container.querySelectorAll('[data-reveal]')).toHaveLength(5);
  });

  test('provides complete reduced motion and pointer fallbacks', () => {
    const pageCss = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const heroCss = readFileSync('src/landing/Hero.module.css', 'utf8');
    const sequenceCss = readFileSync('src/landing/LearningSequence.module.css', 'utf8');
    const visualCss = readFileSync('src/landing/VisualField.module.css', 'utf8');

    expect(pageCss).toMatch(/\[data-motion-ready='true'\]\s+\[data-reveal\]:not\(\[data-revealed='true'\]\)/);
    expect(pageCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none\s*!important;[\s\S]*clip-path:\s*none\s*!important;/);
    expect(heroCss).toMatch(/@media\s*\(hover:\s*none\)/);
    expect(heroCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.instruction\s*\{[^}]*display:\s*(?:grid|block);/);
    expect(heroCss).toMatch(/:global\(\[data-page-visible='false'\]\)\s+\.ambientPhoto\s*\{[^}]*transition:\s*none;/);
    expect(sequenceCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*position:\s*static;/);
    expect(visualCss).toMatch(/:global\(\[data-page-visible='false'\]\)\s+\.ambientPhoto\s*\{[^}]*transition:\s*none;/);
  });

  test('shows one static hero instruction and no dead pause control for reduced motion', () => {
    const heroCss = readFileSync('src/landing/Hero.module.css', 'utf8');
    const mobileRules = heroCss.match(/@media\s*\(max-width:\s*760px\)[\s\S]*?(?=@media\s*\(prefers-reduced-motion:\s*no-preference\))/)?.[0] ?? '';
    const reducedRules = heroCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*$/)?.[0] ?? '';

    expect(heroCss.indexOf(reducedRules)).toBeGreaterThan(heroCss.indexOf(mobileRules));
    expect(mobileRules).toMatch(/\.question,\s*\.annotation,\s*\.target,\s*\.instruction\s*\{[^}]*display:\s*none;/);
    expect(mobileRules).toMatch(/\.productWindow button\s*\{[^}]*display:\s*none;/);
    expect(reducedRules).toMatch(/\.question,\s*\.annotation,\s*\.target\s*\{[^}]*display:\s*none;/);
    expect(reducedRules).toMatch(/\.productWindow button\s*\{[^}]*display:\s*none;/);
    expect(reducedRules).toMatch(/\.instruction\s*\{[^}]*display:\s*(?:grid|block);/);
  });

  test('reveals every visual chapter when the observer is unavailable', () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: undefined
    });

    const { container } = render(createElement(LandingPage));
    const chapters = [...container.querySelectorAll<HTMLElement>('[data-reveal]')];

    expect(chapters).toHaveLength(5);
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

  test('cleans up shared motion observers and listeners', () => {
    const { container, unmount } = render(createElement(LandingPage));
    const revealTarget = container.querySelector<HTMLElement>('#tools');
    const ambientTarget = container.querySelector<HTMLElement>('[data-ambient-stage]');
    const revealObserver = observerFor(revealTarget as HTMLElement);
    const ambientObserver = observerFor(ambientTarget as HTMLElement);

    expect(motionPreferenceListeners.size).toBe(2);
    expect(stickyLessonListeners.size).toBe(1);
    unmount();

    expect(revealObserver.disconnect).toHaveBeenCalledOnce();
    expect(ambientObserver.disconnect).toHaveBeenCalledOnce();
    expect(motionPreferenceListeners.size).toBe(0);
    expect(stickyLessonListeners.size).toBe(0);
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
    const { container } = render(createElement(LandingPage));
    expect(container.querySelector('[data-hero-environment]')?.hasAttribute('data-reveal')).toBe(false);
  });

  test('ships optimized local tactile photography without visible credits', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    ['field-hero.webp', 'field-hero-mobile.webp', 'meadow-edge.webp', 'sketches.webp', 'workbench.webp'].forEach((name) => {
      const image = readFileSync(`public/field-notes/${name}`);
      expect(image.toString('ascii', 0, 4)).toBe('RIFF');
      expect(image.toString('ascii', 8, 12)).toBe('WEBP');
      expect(image.byteLength).toBeLessThan(900_000);
    });
    expect(html).not.toContain('Photography:');
    expect(html).not.toContain('Pexels');
  });

  test('removes unused photography credit styling', () => {
    const css = ['Hero.module.css', 'VisualField.module.css', 'TrustWaitlist.module.css']
      .map((name) => readFileSync(`src/landing/${name}`, 'utf8')).join('\n');

    expect(css).not.toMatch(/\.(?:credits|credit)\b/);
  });

  test('keeps both next-move sentences inline inside constrained cards', () => {
    const { container } = render(createElement(LandingPage));
    const copies = [...container.querySelectorAll<HTMLElement>('[data-instruction-copy]')];
    const heroCss = readFileSync('src/landing/Hero.module.css', 'utf8');
    const sequenceCss = readFileSync('src/landing/LearningSequence.module.css', 'utf8');

    expect(copies).toHaveLength(2);
    copies.forEach((copy) => {
      expect(copy.tagName).toBe('P');
      expect(copy.textContent).toBe('Press I, then choose Location.');
    });
    [heroCss, sequenceCss].forEach((css) => {
      expect(css).toMatch(/\.instruction\s*\{[^}]*min-width:\s*0;[^}]*width:\s*min\(/s);
      expect(css).toMatch(/\.instruction\s*>\s*p\s*\{[^}]*margin:\s*0;/s);
    });
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
  });

  test('renders the trust texture as a lazy local image with a CSS gradient overlay', () => {
    const { container } = render(createElement(LandingPage));
    const image = container.querySelector<HTMLImageElement>('#trust img[src*="trust-rock.webp"]');
    const css = readFileSync('src/landing/TrustWaitlist.module.css', 'utf8');

    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('decoding')).toBe('async');
    expect(image?.getAttribute('width')).toBe('2200');
    expect(image?.getAttribute('height')).toBe('1511');
    expect(css).not.toContain("url('/field-notes/trust-rock.webp')");
    expect(css).toMatch(/\.trust::after\s*\{[^}]*linear-gradient/s);
  });

  test('keeps global scrolling static under reduced motion', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*html\s*\{[^}]*scroll-behavior:\s*auto;/);
  });

  test('does not announce scroll-driven lesson status changes', () => {
    const { container } = render(createElement(LandingPage));
    const workspace = container.querySelector('[data-learning-workspace]');

    expect(workspace?.querySelector('[aria-live]')).toBeNull();
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
