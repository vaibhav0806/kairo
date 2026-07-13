// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';

class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  value: IntersectionObserverStub
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })
});

afterEach(() => {
  cleanup();
});

describe('landing page', () => {
  test('validates the local preview email field', () => {
    expect(validateWaitlistEmail('')).toBe('Enter your email address.');
    expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
  });

  test('leads with a concise live-lesson hero', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Help, right where you’re learning');
    expect(html).toContain('Stuck? <span>Show Kairo.</span>');
    expect(html).toContain('Ask out loud or circle the confusing bit.');
    expect(html).toContain('See how it works');
    expect(html).toContain('Pause lesson');
    expect(html).toContain('data-hero-stage="true"');
    expect(html).not.toContain('Learn by doing.');
    expect(html).not.toContain('Blender skill active');
  });

  test('shows the complete ask point try checked lesson loop', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const chapters = ['Ask anything on screen.', 'Kairo shows the next step.', 'You make the move.', 'It checks before moving on.'];
    const positions = chapters.map((chapter) => html.indexOf(chapter));

    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html.match(/data-lesson-chapter=/g)).toHaveLength(4);
    expect(html).toContain('aria-label="How a Kairo lesson works"');
    expect(html).toContain('data-active-chapter="0"');
  });

  test('keeps the lesson workspace in sync with the chapter nearest the reading line', async () => {
    let visibleChapter = 0;
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const index = Number(this.dataset.chapterIndex);
      const top = Number.isInteger(index) ? 320 + (index - visibleChapter) * 520 : 0;
      return {
        top,
        bottom: top + 360,
        left: 0,
        right: 800,
        width: 800,
        height: 360,
        x: 0,
        y: top,
        toJSON: () => ({})
      } as DOMRect;
    });
    const animationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      window.setTimeout(() => callback(0), 0);
      return 1;
    });

    render(createElement(LandingPage));
    visibleChapter = 3;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(document.querySelector('[data-active-chapter]')?.getAttribute('data-active-chapter')).toBe('3');
      expect(document.querySelector('[data-workspace-state]')?.getAttribute('data-workspace-state')).toBe('checked');
    });

    animationFrame.mockRestore();
    rectSpy.mockRestore();
  });

  test('switches among cross-app lesson previews', () => {
    render(createElement(LandingPage));
    const switcher = screen.getByRole('region', { name: 'Help in the app you’re learning' });

    ['Blender', 'Figma', 'DaVinci Resolve', 'Photoshop', 'Any desktop app'].forEach((app) => {
      expect(within(switcher).getByRole('button', { name: `${app} lesson` })).toBeTruthy();
    });
    expect(within(switcher).getByText('What does this control do?')).toBeTruthy();

    fireEvent.click(within(switcher).getByRole('button', { name: 'Figma lesson' }));

    expect(within(switcher).getByText('Why is this spacing uneven?')).toBeTruthy();
    expect(within(switcher).getByText('Select the frame and open Auto layout.')).toBeTruthy();
    expect(within(switcher).getByRole('button', { name: 'Figma lesson' }).getAttribute('aria-pressed')).toBe('true');
  });

  test('previews each trust promise with real buttons', () => {
    render(createElement(LandingPage));
    const consoleRegion = screen.getByRole('region', { name: 'You stay in control' });

    expect(within(consoleRegion).getByText('No lesson runs until you begin one.')).toBeTruthy();
    fireEvent.click(within(consoleRegion).getByRole('button', { name: 'Pause anytime' }));
    expect(within(consoleRegion).getByText('Stop watching and listening with one click.')).toBeTruthy();
    expect(within(consoleRegion).getByText('Lesson paused')).toBeTruthy();
    fireEvent.click(within(consoleRegion).getByRole('button', { name: 'Point, never click' }));
    expect(within(consoleRegion).getByText('Kairo guides the move. You stay in control.')).toBeTruthy();
  });

  test('builds a local-only waitlist receipt', () => {
    render(createElement(LandingPage));
    const builder = screen.getByRole('region', { name: 'What do you want to learn?' });

    expect(within(builder).getByLabelText('Email address')).toBeTruthy();
    fireEvent.click(within(builder).getByRole('button', { name: 'Learn in Figma' }));
    fireEvent.click(within(builder).getByRole('button', { name: 'Finish a project' }));
    fireEvent.click(within(builder).getByRole('button', { name: 'Join the alpha' }));
    expect(within(builder).getByRole('alert').textContent).toBe('Enter your email address.');

    fireEvent.change(within(builder).getByLabelText('Email address'), { target: { value: 'learner@example.com' } });
    fireEvent.click(within(builder).getByRole('button', { name: 'Join the alpha' }));

    expect(within(builder).getByText('Preview complete')).toBeTruthy();
    expect(within(builder).getByText('Figma')).toBeTruthy();
    expect(within(builder).getByText('Finish a project')).toBeTruthy();
    expect(within(builder).getByText('Nothing was sent or stored.')).toBeTruthy();
  });

  test('uses local credited visual assets', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    ['creative-3d.jpg', 'creative-design.jpg', 'creative-edit.jpg', 'creative-layout.jpg'].forEach((filename) => {
      const image = readFileSync(`public/${filename}`);
      expect(html).toContain(filename);
      expect(image.byteLength).toBeGreaterThan(50_000);
      expect(image.toString('hex', 0, 2)).toBe('ffd8');
    });
    expect(html).toContain('Steve A Johnson');
    expect(html).toContain('Tranmautritam');
    expect(html).toContain('Vito Goričan');
    expect(html).toContain('Hanna Pad');
    expect(html).toContain('/ Pexels');
  });

  test('uses the high-resolution Blender capture with cube-aligned overlays', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const image = readFileSync('public/kairo-blender-preview.webp');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const dimensions = image.readUInt32LE(21);

    expect(html).toContain('kairo-blender-preview.webp');
    expect(image.toString('ascii', 0, 4)).toBe('RIFF');
    expect(image.toString('ascii', 8, 16)).toBe('WEBPVP8L');
    expect((dimensions & 0x3fff) + 1).toBeGreaterThanOrEqual(1698);
    expect(((dimensions >>> 14) & 0x3fff) + 1).toBeGreaterThanOrEqual(1054);
    expect(image.byteLength).toBeLessThan(1_500_000);
    expect(html).toContain('Interface capture:');
    expect(css).toMatch(/\.heroViewport\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
    expect(css).toMatch(/\.heroTarget\s*\{[^}]*top:\s*43%;[^}]*left:\s*45\.1%;[^}]*width:\s*10\.7%;[^}]*height:\s*21\.5%;/s);
  });

  test('uses the approved crisp-white semantic palette', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    ['#ffffff', '#f5f7ff', '#111217', '#ff5c45', '#7557ff', '#27c281', '#2477ff', '#ffd84d'].forEach((token) => {
      expect(css).toContain(token);
    });
    ['#fcfcfa', '#f2f1ed'].forEach((oldToken) => expect(css).not.toContain(oldToken));
    expect(css).not.toMatch(/background:\s*var\(--graphite\)/);
  });

  test('gates the hero animation without hiding structural content', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(html).toContain('data-demo-paused="false"');
    expect(source).toContain("page.dataset.demoActive = String(entry.isIntersecting)");
    expect(source).toContain("page.dataset.pageVisible = String(!document.hidden)");
    expect(css).toContain("[data-demo-paused='false']");
    expect(css).toContain("[data-demo-active='true']");
    expect(css).toContain("[data-page-visible='true']");
    expect(css).not.toMatch(/\[data-lesson-chapter\][^{]*\{[^}]*opacity:\s*0;/s);
  });

  test('runs ambient loops only while their product stage is visible', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(html.match(/data-ambient-stage=/g)).toHaveLength(3);
    expect(source).toContain("page.querySelectorAll('[data-ambient-stage]')");
    expect(source).toContain("stage.dataset.ambientActive = String(entry.isIntersecting)");
    expect(css).toContain("[data-ambient-active='true'][data-mode='edit']");
    expect(css).toContain("[data-ambient-active='true'] .builderCardA");
  });

  test('stacks complex scenes and preserves motion fallbacks on small screens', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'));
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

    expect(css).toMatch(/\.lessonworkspace\s*\{[^}]*position:\s*sticky;/s);
    expect(css).toMatch(/\.hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/s);
    expect(css).toMatch(/\.heroviewport\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
    expect(mobile).toMatch(/\.hero\s*\{[^}]*padding:/s);
    expect(mobile).toMatch(/\.lessonfilm\s*\{[^}]*grid-template-columns:\s*1fr;/s);
    expect(mobile).toMatch(/\.apptabs\s*\{[^}]*overflow-x:\s*auto;/s);
    expect(reduced).toContain('animation: none !important');
    expect(reduced).toContain('transition: none !important');
    expect(reduced).toContain('transform: none !important');
  });

  test('renders the Figma example as a recognizable app canvas', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).toContain(".appStage[data-mode='layout'] .appMedia");
    expect(css).toContain(".appStage[data-mode='layout'] .appMedia::before");
    expect(css).toContain(".appStage[data-mode='layout'] .appMedia::after");
  });

  test('uses native controls, visible focus, and concise language', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(source).not.toContain('<div onClick');
    expect(source).not.toContain('<button className={styles.workspaceAction}');
    expect(source).not.toContain('className={styles.lessonWorkspace} aria-live');
    expect(source).not.toContain('data-ambient-stage aria-live');
    expect(html).toMatch(/<label for="waitlist-email">[\s\S]*Email address<\/label>/);
    expect(html).toContain('autoComplete="email"');
    expect(css).toMatch(/\.landingpage :focus-visible\s*\{[^}]*outline:/s);
    expect(css).toContain('min-height: 44px');
    expect(html).not.toContain('screen-native');
    expect(html).not.toContain('product skill');
  });
});
