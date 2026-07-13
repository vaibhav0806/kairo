import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

describe('landing page', () => {
  test('renders the approved promise at the browser root', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    expect(html).toContain('Learn software by doing.');
    expect(html).toContain('Not watching.');
    expect(html).toContain('First live skill / Blender');
  });
});
