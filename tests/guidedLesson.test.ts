// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { GuidedLesson } from '../src/landing/violet-thread/GuidedLesson';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: () => undefined,
    matchMedia: () => ({
      add: () => undefined,
      revert: () => undefined
    })
  }
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: () => ({ kill: () => undefined })
  }
}));

afterEach(async () => {
  cleanup();
  await vi.dynamicImportSettled();
});
beforeEach(() => installBrowserEnvironment());

describe('GuidedLesson', () => {
  test('verifies as soon as the learner reaches the target', () => {
    render(createElement(GuidedLesson));
    expect(screen.getByRole('heading', { name: 'You make the move.' })).toBeTruthy();
    expect(screen.getByText('Move the white work-area handle to the violet marker.')).toBeTruthy();

    const timeline = document.querySelector('[data-guided-timeline]');
    if (!(timeline instanceof HTMLElement)) throw new Error('Missing guided timeline');
    const control = within(timeline).getByRole('slider', {
      name: 'Move the work-area end in After Effects'
    });
    expect(document.querySelector('[data-guided-actor="kairo"]')?.contains(control)).toBe(false);
    expect(screen.getAllByText('0:00:04:15').length).toBeGreaterThan(0);
    expect(screen.getByText('0:00:05:15')).toBeTruthy();

    fireEvent.change(control, { target: { value: '52' } });
    fireEvent.pointerUp(control);
    expect(document.querySelector('[data-guided-phase="waiting"]')).toBeTruthy();
    expect(document.querySelector('[data-interaction-owner="learner"]')).toBeTruthy();
    expect(screen.getByText('Drag the white handle to the violet marker.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.change(control, { target: { value: '68' } });
    expect(screen.getByRole('status').textContent).toContain('That’s aligned');
    expect(screen.getAllByText('0:00:05:15')).toHaveLength(2);
  });

  test('commits keyboard adjustments without requiring a pointer', () => {
    render(createElement(GuidedLesson));
    const control = screen.getByRole('slider', {
      name: 'Move the work-area end in After Effects'
    });
    fireEvent.change(control, { target: { value: '68' } });
    fireEvent.keyUp(control, { key: 'Enter' });
    expect(screen.getByRole('status').textContent).toContain('That’s aligned');
  });

  test('lets learners select all three lesson states', () => {
    render(createElement(GuidedLesson));
    const progress = screen.getByRole('list', { name: 'Guided lesson progress' });
    const explain = within(progress).getByRole('button', { name: /Explain/ });
    const waiting = within(progress).getByRole('button', { name: /Your turn/ });
    const checked = within(progress).getByRole('button', { name: /Checked/ });

    fireEvent.click(waiting);
    expect(document.querySelector('[data-guided-phase="waiting"]')).toBeTruthy();
    expect(waiting.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Drag the white handle to the violet marker.')).toBeTruthy();

    fireEvent.click(checked);
    expect(document.querySelector('[data-guided-phase="verified"]')).toBeTruthy();
    expect(checked.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('status').textContent).toContain('That’s aligned');

    fireEvent.click(explain);
    expect(document.querySelector('[data-guided-phase="guide"]')).toBeTruthy();
    expect(explain.getAttribute('aria-pressed')).toBe('true');
  });

  test('keeps one mobile lesson descriptor in sync with the active state', () => {
    render(createElement(GuidedLesson));
    const progress = screen.getByRole('list', { name: 'Guided lesson progress' });
    const descriptor = document.querySelector('[data-guided-mobile-detail]');
    const css = readFileSync('src/landing/violet-thread/GuidedLesson.module.css', 'utf8');
    if (!(descriptor instanceof HTMLElement)) throw new Error('Missing mobile lesson descriptor');

    expect(descriptor.textContent).toBe('Kairo points');
    expect(descriptor.getAttribute('aria-live')).toBe('polite');
    expect(css).toMatch(/\.mobileStepDetail\s*\{[^}]*display:\s*none;/s);
    expect(css).toMatch(/@media \(max-width: 700px\)[\s\S]*?\.mobileStepDetail\s*\{[^}]*display:\s*block;[^}]*min-height:\s*1\.5em;/s);

    fireEvent.click(within(progress).getByRole('button', { name: /Your turn/ }));
    expect(descriptor.textContent).toBe('You adjust');

    fireEvent.click(within(progress).getByRole('button', { name: /Checked/ }));
    expect(descriptor.textContent).toBe('Kairo verifies');
  });

  test('completes and snaps to the target when the learner drags past it', () => {
    render(createElement(GuidedLesson));
    const control = screen.getByRole('slider', {
      name: 'Move the work-area end in After Effects'
    });

    fireEvent.change(control, { target: { value: '84' } });

    expect(screen.getByRole('status').textContent).toContain('That’s aligned');
    expect(control.getAttribute('value')).toBe('68');
  });

  test('shows the verified storyboard for reduced motion', () => {
    installBrowserEnvironment({ reducedMotion: true });
    render(createElement(GuidedLesson));
    expect(document.querySelector('[data-guided-phase="verified"]')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('That’s aligned');
  });

  test('confirms success at the handle without forcing motion', () => {
    const css = readFileSync('src/landing/violet-thread/GuidedLesson.module.css', 'utf8');

    expect(css).toMatch(/\[data-guided-phase='verified'\] \.workAreaEdge\s*\{[^}]*border-right-color:\s*var\(--kairo\)/s);
    expect(css).toMatch(/\[data-guided-phase='verified'\] \.workAreaEdge::after\s*\{[^}]*background:\s*var\(--kairo\)[^}]*animation:\s*handle-confirm 220ms/s);
    expect(css).toContain('@keyframes handle-confirm');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.lesson\[data-guided-phase='verified'\] \.workAreaEdge::after\s*\{[^}]*animation:\s*none/s);
  });
});
