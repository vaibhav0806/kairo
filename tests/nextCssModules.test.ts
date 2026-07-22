import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('LandingPage CSS Module selectors', () => {
  test('keeps content visible by default and limits reduced-motion overrides', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).not.toMatch(/\[data-reveal\].*opacity:\s*0/s);
    expect(css).not.toContain('clip-path: inset');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  test('removes phone navigation and keeps tablet navigation inline', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const tabletRules = css.match(/@media \(min-width: 701px\) and \(max-width: 900px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';
    const phoneRules = css.match(/@media \(max-width: 700px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

    expect(tabletRules).toMatch(/\.header\s*{[^}]*grid-template-columns:\s*1fr auto 1fr/s);
    expect(tabletRules).toMatch(/\.header nav\s*{[^}]*justify-self:\s*center/s);
    const tabletNavRule = tabletRules.match(/\.header nav\s*{[^}]*\}/)?.[0] ?? '';
    expect(tabletNavRule).not.toContain('position: fixed');
    expect(tabletNavRule).not.toContain('bottom:');
    expect(phoneRules).toMatch(/\.header nav\s*{[^}]*display:\s*none/s);
    expect(phoneRules).toContain(".headerAction[data-access-visible='true']");
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
    const tabletRules = css.match(/@media \(min-width: 701px\) and \(max-width: 900px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

    expect(css).not.toContain('.header nav a:nth-child');
    expect(css).toContain(".header nav a[data-active='true']");
    expect(tabletRules).toMatch(/\.header nav a\s*{[^}]*min-height:\s*44px/s);
    expect(css).not.toMatch(/\.footer\s*\{/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.githubLink:hover[\s\S]*?transform:\s*none/s);
  });
});
