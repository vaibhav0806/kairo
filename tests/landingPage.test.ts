// @vitest-environment jsdom

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';
import { validateWaitlistEmail } from '../src/landing/WaitlistForm';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('landing page', () => {
  test('renders the Living Canvas chapters in order', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const markers = [
      'id="top"',
      'id="product-moments"',
      'id="capabilities"',
      'id="tools"',
      'id="control"',
      'id="access"',
      '<footer'
    ];
    const positions = markers.map((marker) => html.indexOf(marker));

    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('Learn any creative tool without leaving it.');
    expect(html).toContain('Your hands stay on the tool.');
    expect(html).not.toContain('data-field-notes');
  });

  test('keeps navigation and the alpha request available', () => {
    render(createElement(LandingPage));
    const nav = screen.getByRole('navigation', { name: 'Landing page' });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual(['How it helps', 'Capabilities', 'Tools']);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Request alpha access' }).getAttribute('href')).toBe(
      '#access'
    );
  });

  test('validates the waitlist email field', () => {
    expect(validateWaitlistEmail('')).toBe('Enter your email address.');
    expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail('.learner@example.com')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail('learn..er@example.com')).toBe('Enter a valid email address.');
    expect(validateWaitlistEmail(`${'a'.repeat(65)}@example.com`)).toBe(
      'Enter a valid email address.'
    );
    expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
  });
});
