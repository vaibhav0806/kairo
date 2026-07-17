// @vitest-environment node

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

const expectedAssetUrls = [
  '/kairo-blender-preview.webp',
  '/field-notes/field-hero.webp',
  '/field-notes/field-hero-mobile.webp',
  '/field-notes/sketches.webp',
  '/field-notes/workbench.webp',
  '/field-notes/trust-rock.webp',
  '/field-notes/footer-wildflower.webp'
].sort();

function collectAssetUrls(html: string): string[] {
  const urls = [...html.matchAll(/\b(?:src|srcSet)="([^"]+)"/gi)].flatMap((match) =>
    (match[1] ?? '').split(',').map((candidate) => candidate.trim().split(/\s+/)[0] ?? '')
  );

  return [...new Set(urls)].filter(Boolean).sort();
}

describe('landing server rendering', () => {
  test('renders the landing page without browser globals', () => {
    expect(globalThis).not.toHaveProperty('window');
    expect(globalThis).not.toHaveProperty('document');

    expect(() => renderToString(createElement(LandingPage))).not.toThrow();
  });

  test('includes the complete page and waitlist privacy copy', () => {
    const html = renderToString(createElement(LandingPage));

    expect(html).toContain('data-field-notes="true"');
    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html).toContain('We’ll use your email only to contact you about Kairo early access.');
  });

  test('uses the exact root-relative public asset set', () => {
    const html = renderToString(createElement(LandingPage));
    const assetUrls = collectAssetUrls(html);

    expect(assetUrls).toEqual(expectedAssetUrls);
    expect(assetUrls.join('\n')).not.toMatch(/undefined|import\.meta|\.\/field-notes/);
  });
});
