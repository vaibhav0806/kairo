// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { GuidedLesson } from '../src/landing/violet-thread/GuidedLesson';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('GuidedLesson', () => {
  test('requires a correct learner release before verification', () => {
    render(createElement(GuidedLesson));
    expect(screen.getByRole('heading', { name: 'Guidance that waits for you.' })).toBeTruthy();
    expect(screen.getByText('Move the mask edge to the final guide.')).toBeTruthy();

    const control = screen.getByRole('slider', { name: 'Move the mask edge' });
    fireEvent.change(control, { target: { value: '52' } });
    fireEvent.pointerUp(control);
    expect(document.querySelector('[data-guided-phase="waiting"]')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.change(control, { target: { value: '68' } });
    fireEvent.pointerUp(control);
    expect(screen.getByRole('status').textContent).toContain('Kairo verified');
    expect(screen.getByRole('link', { name: 'Continue to creative tools' }).getAttribute('href'))
      .toBe('#travel');
  });

  test('commits keyboard adjustments without requiring a pointer', () => {
    render(createElement(GuidedLesson));
    const control = screen.getByRole('slider', { name: 'Move the mask edge' });
    fireEvent.change(control, { target: { value: '68' } });
    fireEvent.keyUp(control, { key: 'Enter' });
    expect(screen.getByRole('status').textContent).toContain('Kairo verified');
  });

  test('shows the verified storyboard for reduced motion', () => {
    installBrowserEnvironment({ reducedMotion: true });
    render(createElement(GuidedLesson));
    expect(document.querySelector('[data-guided-phase="verified"]')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Kairo verified');
  });
});
