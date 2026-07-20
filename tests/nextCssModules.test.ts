import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('LandingPage CSS Module selectors', () => {
  test('keeps content visible by default and limits reduced-motion overrides', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).not.toMatch(/\[data-reveal\].*opacity:\s*0/s);
    expect(css).not.toContain('clip-path: inset');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  test('keeps mobile navigation available after the hero', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const mobileRules = css.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

    expect(mobileRules).toContain('.header nav');
    expect(mobileRules).toContain('position: fixed');
    expect(mobileRules).toContain('max-width: calc(100vw - 24px)');
    expect(mobileRules).toContain(".header:has(.headerAction[data-hero-visible='true']) nav");
    expect(mobileRules).toContain('pointer-events: none');
    expect(mobileRules).not.toMatch(/\.header nav\s*{[^}]*display:\s*none/s);
  });

  test('defines active-only artifact motion and a dedicated tablet composition', () => {
    const css = readFileSync('src/landing/Hero.module.css', 'utf8');

    expect(css).toContain(".workspace[data-hero-visible='true']");
    expect(css).toContain(".mediaSlot[data-active='true']");
    expect(css).toContain('animation-play-state: paused');
    expect(css).toContain('@media (min-width: 701px) and (max-width: 1060px)');
  });

  test('keeps the navbar action quieter than the hero action', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const headerCtaRule = css.match(/\.headerCta\s*\{[^}]*\}/)?.[0] ?? '';

    expect(headerCtaRule).toContain('min-height: 44px');
    expect(headerCtaRule).not.toContain('box-shadow:');
  });

  test('coordinates the navbar reveal and preserves mobile touch clearance', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const mobileRules = css.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

    expect(css).not.toContain('.header nav a:nth-child');
    expect(css).toContain(".header nav a[data-active='true']");
    expect(mobileRules).toMatch(/\.header nav a\s*{[^}]*min-height:\s*44px/s);
    expect(mobileRules).toMatch(/\.footer\s*{[^}]*padding-bottom:/s);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.githubLink:hover[\s\S]*?transform:\s*none/s);
  });
});
