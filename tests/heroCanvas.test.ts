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
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Stuck? Point at it.');
    expect(screen.getByText(/Ask out loud or point on-screen/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Request alpha access' }).getAttribute('href')).toBe(
      '#access'
    );
  });

  test('moves Kairo guidance between authentic creator workspaces', () => {
    render(createElement(Hero));
    const pointLine = document.querySelector('[data-text="Point at it."]');
    const creator = screen.getByRole('button', { name: 'Ask Kairo about the editing desk' });
    const figma = screen.getByRole('button', { name: 'Ask Kairo about the Figma layout' });
    const annotation = document.querySelector('[data-annotation-source]');

    expect(creator.getAttribute('aria-pressed')).toBe('true');
    expect(figma.getAttribute('aria-pressed')).toBe('false');
    expect(annotation?.getAttribute('data-annotation-source')).toBe('creator');
    expect(annotation?.getAttribute('data-annotation-target')).toBe('kairo-response');

    fireEvent.click(figma);

    expect(creator.getAttribute('aria-pressed')).toBe('false');
    expect(figma.getAttribute('aria-pressed')).toBe('true');
    expect(annotation?.getAttribute('data-annotation-source')).toBe('figma');
    const response = screen.getByLabelText('Kairo response');
    expect(response.textContent).toContain('parent frame is fixed');
    expect(document.querySelector('[data-streaming-reply="figma"]')).toBeTruthy();
    expect(screen.getByText('Kairo sees Figma')).toBeTruthy();
    expect(document.querySelector('[data-text="Point at it."]')).toBe(pointLine);
  });

  test('provides pointer and touch instructions for choosing another workspace', () => {
    render(createElement(Hero));

    expect(screen.getByText('Click another workspace')).toBeTruthy();
    expect(screen.getByText('Tap another workspace')).toBeTruthy();
  });

  test('uses honest filename captions for creator media', () => {
    render(createElement(Hero));
    expect(screen.queryByText(/^live$/i)).toBeNull();

    for (const filename of [
      'editing-desk.mov',
      'after-effects.aep',
      'first-scene.blend',
      'dashboard.fig',
      'grade-v4.drp',
    ]) {
      expect(screen.getByText(filename).closest('button')).toBeNull();
    }
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
