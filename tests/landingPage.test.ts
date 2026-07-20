// @vitest-environment jsdom

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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
      'id="understand"',
      'id="learn"',
      'id="travel"',
      'id="access"',
      '<footer'
    ];
    const positions = markers.map((marker) => html.indexOf(marker));

    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('Stuck? Point at it.');
    expect(html).toContain('You don’t have to explain the whole screen.');
    expect(html).toContain('Guidance that waits for you.');
    expect(html).toContain('Different tools. The same way of getting unstuck.');
    expect(html).toContain('What have you been meaning to learn?');
    expect(html).toContain('Your hands stay on the tool.');
    expect(html).not.toContain('id="product-moments"');
    expect(html).not.toContain('id="capabilities"');
    expect(html).not.toContain('data-field-notes');
  });

  test('keeps navigation and the initial GitHub action available', () => {
    render(createElement(LandingPage));
    const nav = screen.getByRole('navigation', { name: 'Landing page' });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual([
      'How Kairo sees',
      'Guided lesson',
      'Creative tools'
    ]);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Kairo on GitHub' }).getAttribute('href')).toBe(
      'https://github.com/vaibhav0806/kairo-tutor'
    );
    expect(within(header).queryByRole('link', { name: 'Request alpha access' })).toBeNull();
  });

  test('replaces GitHub with the alpha action after the hero action leaves view', async () => {
    const callbacks = new Map<Element, IntersectionObserverCallback[]>();
    const observe = vi.fn();

    class IntersectionObserverMock {
      private callback: IntersectionObserverCallback;

      constructor(next: IntersectionObserverCallback) {
        this.callback = next;
      }

      observe = (target: Element) => {
        observe(target);
        callbacks.set(target, [...(callbacks.get(target) ?? []), this.callback]);
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock
    });

    render(createElement(LandingPage));
    const header = screen.getByRole('banner');
    const heroAction = document.getElementById('hero-access-cta');

    if (!heroAction) throw new Error('Missing hero access action');

    expect(observe).toHaveBeenCalledWith(heroAction);
    expect(within(header).getByRole('link', { name: 'Kairo on GitHub' })).toBeTruthy();

    const heroActionCallback = callbacks.get(heroAction)?.[0];
    if (!heroActionCallback) throw new Error('Missing hero action observer');

    act(() => {
      heroActionCallback(
        [{ target: heroAction, isIntersecting: false }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(within(header).queryByRole('link', { name: 'Kairo on GitHub' })).toBeNull();
      const access = within(header).getByRole('link', { name: 'Request alpha access' });

      expect(access.getAttribute('href')).toBe('#access');
      expect(access.querySelector('svg')).toBeTruthy();
      expect(access.textContent).not.toContain('↗');
    });
  });

  test('marks only the current learning section in the navigation', async () => {
    const callbacks = new Map<Element, IntersectionObserverCallback>();

    class IntersectionObserverMock {
      constructor(private callback: IntersectionObserverCallback) {}

      observe = (target: Element) => callbacks.set(target, this.callback);
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock
    });

    render(createElement(LandingPage));
    const nav = screen.getByRole('navigation', { name: 'Landing page' });
    const understand = document.getElementById('understand');
    const learn = document.getElementById('learn');

    if (!understand || !learn) throw new Error('Missing learning sections');

    act(() => {
      callbacks.get(understand)?.(
        [{ target: understand, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(
      within(nav).getByRole('link', { name: 'How Kairo sees' }).getAttribute('aria-current')
    ).toBe('location');

    act(() => {
      callbacks.get(learn)?.(
        [{ target: learn, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(within(nav).getAllByRole('link').filter((link) => link.hasAttribute('aria-current')))
      .toHaveLength(1);
    expect(
      within(nav).getByRole('link', { name: 'Guided lesson' }).getAttribute('aria-current')
    ).toBe('location');
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
