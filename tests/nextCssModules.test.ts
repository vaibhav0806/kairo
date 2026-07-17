import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('LandingPage CSS Module selectors', () => {
  const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

  test('scopes the reveal transition through the local page class', () => {
    expect(css).toMatch(/\.page\s+\[data-reveal\]\s*\{\s*transition:/);
  });

  test('scopes the motion-ready hidden state through the local page class', () => {
    expect(css).toMatch(
      /\.page\[data-motion-ready='true'\]\s+\[data-reveal\]:not\(\[data-revealed='true'\]\)\s*\{/
    );
  });

  test('scopes the reduced-motion reveal override through the local page class', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.page\s+\[data-reveal\]\s*\{\s*opacity: 1 !important;/
    );
  });
});
