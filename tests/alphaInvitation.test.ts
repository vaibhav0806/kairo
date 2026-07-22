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
  test('renders the open-source invitation and real repository link', () => {
    render(createElement(AlphaInvitation));
    expect(screen.getByRole('heading', { name: 'Learn by doing. Built in the open.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Open source on GitHub/i }).getAttribute('href')).toBe(
      'https://github.com/vaibhav0806/kairo-tutor'
    );
    expect(screen.getByText(/the exact place you get stuck/i)).toBeTruthy();
  });

  test('completes the invitation after a successful request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    render(createElement(AlphaInvitation));
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'learner@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Request alpha access' }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('You’re on the list. Go make something.');
    expect(document.getElementById('access')?.getAttribute('data-invitation-complete')).toBe('true');
    expect(document.activeElement).toBe(status);
  });
});
