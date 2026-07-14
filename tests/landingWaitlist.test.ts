// @vitest-environment jsdom

import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  });
});

afterEach(cleanup);

describe('landing waitlist preview', () => {
  test('lets the learner pause and resume the hero demonstration', () => {
    const { container } = render(createElement(LandingPage));

    const pause = screen.getByRole('button', { name: 'Pause lesson' });
    expect(pause.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('[data-demo-paused="false"]')).toBeTruthy();

    fireEvent.click(pause);
    const play = screen.getByRole('button', { name: 'Play lesson' });
    expect(play.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('[data-demo-paused="true"]')).toBeTruthy();

    fireEvent.click(play);
    expect(screen.getByRole('button', { name: 'Pause lesson' })).toBeTruthy();
    expect(container.querySelector('[data-demo-paused="false"]')).toBeTruthy();
  });

  test('keeps and focuses invalid input with accessible error state', () => {
    render(createElement(LandingPage));
    const input = screen.getByLabelText('Email address') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'learner@' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join the alpha' }));

    expect(input.value).toBe('learner@');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('waitlist-error waitlist-note');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Enter a valid email address.');
    expect(alert.className).not.toBe('');
    expect(document.getElementById('waitlist-note')?.className).not.toBe('');
    expect(document.activeElement).toBe(input);
  });

  test('shows the trimmed email and honest local-only disclosure after valid submission', () => {
    render(createElement(LandingPage));

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: ' learner@example.com ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Join the alpha' }));

    expect(screen.queryByLabelText('Email address')).toBeNull();
    expect(screen.getByText('You are on the preview list.')).toBeTruthy();
    expect(screen.getByText('learner@example.com')).toBeTruthy();
    expect(screen.getByText('Nothing was sent or stored.')).toBeTruthy();
  });

});
