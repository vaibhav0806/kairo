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
  test('ends with a quiet legal colophon after the alpha invitation', () => {
    render(createElement(LandingPage));

    const access = document.getElementById('access');
    const main = document.querySelector('main');
    const footer = screen.getByRole('contentinfo');

    expect(document.querySelector('[data-kairo-signature]')).toBeNull();
    expect(main?.lastElementChild).toBe(access);
    expect(footer.textContent).toContain('end of screen.');
    expect(footer.textContent).toContain('© 2026 Kairo');
    expect(within(footer).getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    expect(within(footer).getByRole('link', { name: 'License' }).getAttribute('href')).toBe('/license');
    expect(footer.textContent).not.toContain('Request alpha access');
    expect(within(footer).queryByRole('link', { name: /GitHub/i })).toBeNull();
  });

  test('renders the Living Canvas chapters in order', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    const markers = [
      'id="top"',
      'id="understand"',
      'id="learn"',
      'id="travel"',
      'id="access"'
    ];
    const positions = markers.map((marker) => html.indexOf(marker));

    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('Stuck? Point at it.');
    expect(html).toContain('Kairo sees what you mean.');
    expect(html).toContain('You make the move.');
    expect(html).toContain('Kairo goes where');
    expect(html).toContain('you create.');
    expect(html).toContain('anything else on your screen');
    expect(html).toContain('Learn by doing.');
    expect(html).toContain('Built in the open.');
    expect(html).toContain('Kairo gives one next move, waits while you try it, then checks the result.');
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
    const accessSection = document.getElementById('access');

    if (!heroAction || !accessSection) throw new Error('Missing landing action targets');

    expect(observe).toHaveBeenCalledWith(heroAction);
    expect(observe).toHaveBeenCalledWith(accessSection);
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

    act(() => {
      callbacks.get(accessSection)?.forEach((callback) => callback(
        [{ target: accessSection, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      ));
    });

    await waitFor(() => {
      expect(within(header).queryByRole('link', { name: 'Request alpha access' })).toBeNull();
      expect(within(header).queryByRole('link', { name: 'Kairo on GitHub' })).toBeNull();
    });
  });

  test('marks only the current learning section in the navigation', async () => {
    const callbacks = new Map<Element, IntersectionObserverCallback[]>();

    class IntersectionObserverMock {
      constructor(private callback: IntersectionObserverCallback) {}

      observe = (target: Element) => callbacks.set(
        target,
        [...(callbacks.get(target) ?? []), this.callback]
      );
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
    const access = document.getElementById('access');

    if (!understand || !learn || !access) throw new Error('Missing landing sections');

    act(() => {
      callbacks.get(understand)?.forEach((callback) => callback(
          [{ target: understand, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver
        ));
    });

    expect(
      within(nav).getByRole('link', { name: 'How Kairo sees' }).getAttribute('aria-current')
    ).toBe('location');
    expect(nav.getAttribute('data-active-section')).toBe('understand');

    act(() => {
      callbacks.get(learn)?.forEach((callback) => callback(
          [{ target: learn, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver
        ));
    });

    expect(within(nav).getAllByRole('link').filter((link) => link.hasAttribute('aria-current')))
      .toHaveLength(1);
    expect(
      within(nav).getByRole('link', { name: 'Guided lesson' }).getAttribute('aria-current')
    ).toBe('location');
    expect(nav.getAttribute('data-active-section')).toBe('learn');

    act(() => {
      callbacks.get(access)?.forEach((callback) => callback(
          [{ target: access, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver
        ));
    });

    expect(nav.getAttribute('data-active-section')).toBe('access');
    expect(within(nav).getAllByRole('link').some((link) => link.hasAttribute('aria-current')))
      .toBe(false);

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
