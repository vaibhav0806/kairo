import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('LandingPage CSS Module selectors', () => {
  test('keeps content visible by default and limits reduced-motion overrides', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

    expect(css).not.toMatch(/\[data-reveal\].*opacity:\s*0/s);
    expect(css).not.toContain('clip-path: inset');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  test('keeps mobile navigation available', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
    const mobileRules = css.match(/@media \(max-width: 760px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

    expect(mobileRules).toContain('.header nav');
    expect(mobileRules).toContain('overflow-x: auto');
    expect(mobileRules).not.toContain('display: none');
  });
});
