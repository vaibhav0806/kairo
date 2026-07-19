// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AlphaInvitation } from '../src/landing/AlphaInvitation';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => installBrowserEnvironment());

describe('AlphaInvitation', () => {
  test('renders the Begin question and learner notes', () => {
    render(createElement(AlphaInvitation));
    expect(screen.getByRole('heading', { name: 'What have you been meaning to learn?' })).toBeTruthy();
    for (const note of [
      'finally understand nodes',
      'learn motion curves properly',
      'stop guessing in Blender',
      'get comfortable in Figma'
    ]) expect(screen.getByText(note)).toBeTruthy();
    expect(document.querySelector('[data-thread-profile="invitation"]')).toBeTruthy();
  });

  test('completes the invitation Thread after a successful request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    render(createElement(AlphaInvitation));
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'learner@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Request alpha access' }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('You’re on the list. Go make something.');
    expect(document.querySelector('[data-thread-profile="invitation"]')?.getAttribute('data-thread-state'))
      .toBe('verify');
    expect(document.activeElement).toBe(status);
  });
});
