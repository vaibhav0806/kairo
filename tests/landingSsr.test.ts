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
    expect(html).toContain('Guidance that waits for you.');
    expect(html).toContain('Different tools. The same way of getting unstuck.');
    expect(html).toContain('What have you been meaning to learn?');
    expect(html).toContain('Kairo combines what you say, what it sees, and where you point');
    expect(html).toContain('Kairo gives one move, watches you try it, and checks the result');
    for (const tool of ['After Effects', 'DaVinci Resolve', 'Blender', 'Figma']) {
      expect(html).toContain(tool);
    }
    for (const note of [
      'finally understand nodes',
      'learn motion curves properly',
      'stop guessing in Blender',
      'get comfortable in Figma'
    ]) expect(html).toContain(note);
    expect(html).toContain('We’ll use your email only to contact you about Kairo early access.');
    expect(html).not.toContain('Take over the task');
  });

  test('renders the approved creator assets without legacy photography', () => {
    const html = renderToString(createElement(LandingPage));
    const assetUrls = collectAssetUrls(html);

    expect(assetUrls).toEqual([
      '/hero/after-effects-workspace.webp',
      '/hero/blender-viewport.webp',
      '/hero/creator-editing.mp4',
      '/hero/davinci-nodes.webp',
      '/hero/figma-layout.webp'
    ]);
    expect(html).not.toContain('/field-notes/');
    expect(html).not.toContain('/kairo-blender-preview.webp');
  });
});
