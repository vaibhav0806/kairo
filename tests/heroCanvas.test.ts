// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Hero } from '../src/landing/Hero';
import { HeroCanvas } from '../src/landing/HeroCanvas';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('HeroCanvas', () => {
  test('explains Kairo without requiring interaction', () => {
    render(createElement(Hero));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Learn any creative tool without leaving it.'
    );
    expect(screen.getByText(/Talk to Kairo, show it what you mean/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Request alpha access' }).getAttribute('href')).toBe(
      '#access'
    );
  });

  test('provides a keyboard equivalent for every drawable target', () => {
    render(createElement(HeroCanvas));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Kairo about the timeline' }));
    expect(screen.getByRole('status').textContent).toContain('easing');
    expect(document.querySelector('[data-hero-state="responding"]')).toBeTruthy();
  });

  test('clears a completed response without removing the page copy', () => {
    render(createElement(HeroCanvas));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Kairo about the layers' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear Kairo drawing' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('button', { name: 'Ask Kairo about the layers' })).toBeTruthy();
  });
});
