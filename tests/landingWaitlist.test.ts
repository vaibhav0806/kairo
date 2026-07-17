// @vitest-environment jsdom

import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('landing waitlist', () => {
  test('discloses how submitted addresses are used', () => {
    render(createElement(LandingPage));
    const input = screen.getByLabelText('Email address');
    const note = screen.getByText('We’ll use your email only to contact you about Kairo early access.');

    expect(note.id).toBe('waitlist-note');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(note.id);
  });

  test('lets the learner pause and resume the hero demonstration', () => {
    const { container } = render(createElement(LandingPage));

    const pause = screen.getByRole('button', { name: 'Pause lesson' });
    expect(pause.hasAttribute('aria-pressed')).toBe(false);
    expect(container.querySelector('[data-demo-paused="false"]')).toBeTruthy();

    fireEvent.click(pause);
    const play = screen.getByRole('button', { name: 'Play lesson' });
    expect(play.hasAttribute('aria-pressed')).toBe(false);
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

  test('posts a normalized address once and waits for success before replacing the form', async () => {
    const response = deferred<{ ok: boolean }>();
    const fetchMock = vi.fn(() => response.promise);
    vi.stubGlobal('fetch', fetchMock);
    render(createElement(LandingPage));

    const input = screen.getByLabelText('Email address') as HTMLInputElement;
    const button = screen.getByRole('button', { name: 'Join the alpha' }) as HTMLButtonElement;
    const form = input.closest('form') as HTMLFormElement;

    fireEvent.change(input, {
      target: { value: ' learner@example.com ' }
    });
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledWith('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'learner@example.com' })
    });
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledOnce();

    await act(async () => response.resolve({ ok: true }));

    expect(screen.queryByLabelText('Email address')).toBeNull();
    const status = screen.getByRole('status');

    expect(status.textContent).toContain('You’re on the list.');
    expect(status.getAttribute('tabindex')).toBe('-1');
    expect(screen.getByText('learner@example.com')).toBeTruthy();
    expect(document.activeElement).toBe(status);
  });

  test('keeps and refocuses the address after a failed response so submission can be retried', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(createElement(LandingPage));

    const input = screen.getByLabelText('Email address') as HTMLInputElement;
    const button = screen.getByRole('button', { name: 'Join the alpha' }) as HTMLButtonElement;
    fireEvent.change(input, { target: { value: 'learner@example.com' } });
    fireEvent.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Something went wrong. Please try again.');
    expect(input.value).toBe('learner@example.com');
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    expect(document.activeElement).toBe(input);

    fireEvent.click(button);
    expect(await screen.findByRole('status')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
