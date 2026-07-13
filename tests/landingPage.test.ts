import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';

describe('landing page', () => {
  test('validates the local preview email field', () => {
    expect(validateWaitlistEmail('')).toBe('Enter your email address.');
    expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
  });

  test('renders an accessible request-access form', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    expect(html).toContain('<label for="waitlist-email">Email address</label>');
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="email"');
    expect(html).toContain('aria-live="polite"');
  });

  test('renders the approved learner-first narrative', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Learn software by doing.');
    expect(html).toContain('Not watching.');
    expect(html).toContain('First live skill / Blender');
    expect(html).toContain('Tutorials show their screen. Kairo starts from yours.');
    expect(html).toContain('Talk to Kairo.');
    expect(html).toContain('Circle “this.”');
    expect(html).toContain('The AI points. You act.');
    expect(html).toContain('Kairo checks before moving on.');
    expect(html).toContain('Photoshop');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('AI can make mistakes.');
  });

  test('uses semantic color roles and accessible motion fallbacks', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('#f5f4ef');
    expect(css).toContain('#151515');
    expect(css).toContain('#ff6547');
    expect(css).toContain('#8b79ff');
    expect(css).toContain('#78caaa');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain("[data-motion-ready='true']");
    expect(css).not.toContain('scroll-snap');
    expect(css).not.toContain('linear-gradient');
    expect(css).not.toContain('radial-gradient');
  });

  test('keeps chapter visual details visible when reduced motion is enabled', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const reducedMotionCss = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

    expect(reducedMotionCss).toMatch(
      /\.landingpage\s+\[data-reveal\]\s+\.chaptervisual\s*>\s*\*\s*\{[^}]*opacity:\s*1\s*!important;[^}]*transform:\s*none\s*!important;[^}]*transition:\s*none\s*!important;[^}]*\}/
    );
  });

  test('styles waitlist messages through CSS module classes', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('.waitlisterror');
    expect(css).toContain('.waitlistnote');
    expect(css).not.toContain('#waitlist-error');
    expect(css).not.toContain('#waitlist-note');
  });

  test('keeps mobile product-preview labels readable', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
    const mobileCss = css.slice(css.indexOf('@media (max-width: 760px)'));

    expect(mobileCss).toMatch(/\.learnerask b\s*\{[^}]*font-size:\s*0\.55rem;/);
    expect(mobileCss).toMatch(/\.progressrail\s*\{[^}]*font-size:\s*0\.55rem;/);
    expect(mobileCss).toMatch(/\.kairotarget span\s*\{[^}]*font-size:\s*0\.55rem;/);
  });
});
