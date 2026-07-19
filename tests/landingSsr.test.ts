// @vitest-environment node

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

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

  test('includes approved product and waitlist copy with one h1', () => {
    const html = renderToString(createElement(LandingPage));

    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html).toContain('Stuck? Point at it.');
    expect(html).toContain('You don’t have to explain the whole screen.');
    expect(html).toContain('Circle, underline, and draw so both sides mean the same exact thing.');
    expect(html).toContain('We’ll use your email only to contact you about Kairo early access.');
    expect(html).not.toContain('Take over the task');
  });

  test('does not render legacy photographic assets', () => {
    const html = renderToString(createElement(LandingPage));
    const assetUrls = collectAssetUrls(html);

    expect(assetUrls).toEqual([]);
    expect(html).not.toContain('/field-notes/');
    expect(html).not.toContain('/kairo-blender-preview.webp');
  });
});
