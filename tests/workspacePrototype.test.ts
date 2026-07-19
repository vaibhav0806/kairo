// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { NoticeLesson } from '../src/landing/violet-thread/NoticeLesson';
import { VioletThread } from '../src/landing/violet-thread/VioletThread';
import { WorkspacePrototype } from '../src/landing/violet-thread/WorkspacePrototype';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => installBrowserEnvironment());

describe('Violet Thread prototype', () => {
  test('renders a semantic path for each instructional state', () => {
    const { rerender } = render(createElement(VioletThread, { state: 'notice' }));
    const thread = document.querySelector('[data-violet-thread]');
    expect(thread?.getAttribute('data-thread-state')).toBe('notice');
    expect(thread?.querySelector('path')?.getAttribute('d')).toBeTruthy();

    rerender(createElement(VioletThread, { state: 'verify' }));
    expect(thread?.getAttribute('data-thread-state')).toBe('verify');
    expect(thread?.getAttribute('data-thread-verified')).toBe('true');
  });

  test('renders the selected Thread profile', () => {
    render(createElement(VioletThread, { state: 'guide', profile: 'lesson' }));

    expect(document.querySelector('[data-thread-profile="lesson"]')).toBeTruthy();
  });

  test('lets the learner select, adjust, and verify the abrupt stop', () => {
    vi.useFakeTimers();
    const onVerified = vi.fn();
    render(createElement(NoticeLesson, { onVerified }));

    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('That stop feels wrong, doesn’t it?')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
    act(() => vi.advanceTimersByTime(160));
    expect(screen.getByText('Give the stop more room. Pull this handle left.')).toBeTruthy();

    const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
    fireEvent.change(handle, { target: { value: '72' } });
    expect(document.querySelector('[data-notice-phase="waiting"]')).toBeTruthy();
    fireEvent.pointerUp(handle);

    expect(screen.getByRole('status').textContent).toContain('Result verified');
    expect(onVerified).toHaveBeenCalledTimes(1);
  });

  test('keeps an incorrect handle position in the waiting state', () => {
    vi.useFakeTimers();
    render(createElement(NoticeLesson, { onVerified: vi.fn() }));
    fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
    act(() => vi.advanceTimersByTime(160));
    const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
    fireEvent.change(handle, { target: { value: '45' } });
    fireEvent.pointerUp(handle);

    expect(document.querySelector('[data-notice-phase="waiting"]')).toBeTruthy();
    expect(screen.getByText('Kairo is waiting for your adjustment.')).toBeTruthy();
  });

  test('offers freehand pointing without hiding the accessible target', () => {
    render(createElement(NoticeLesson, { onVerified: vi.fn() }));

    const drawToggle = screen.getByRole('button', { name: 'Draw to point' });
    expect(drawToggle.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(drawToggle);

    expect(screen.getByRole('button', { name: 'Drawing on' }).getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-notice-drawing="true"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Select the abrupt stop' })).toBeTruthy();
  });

  test('renders the completed instructional state when reduced motion is requested', () => {
    installBrowserEnvironment({ reducedMotion: true });
    const onVerified = vi.fn();
    render(createElement(NoticeLesson, { onVerified }));

    expect(document.querySelector('[data-notice-phase="verified"]')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Result verified');
    expect(onVerified).toHaveBeenCalledTimes(1);
  });

  test('carries verified context into the next chapter', () => {
    vi.useFakeTimers();
    render(createElement(WorkspacePrototype));

    fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
    act(() => vi.advanceTimersByTime(160));
    const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
    fireEvent.change(handle, { target: { value: '72' } });
    fireEvent.pointerUp(handle);
    expect(document.querySelector('[data-workspace-phase="verified"]')).toBeTruthy();

    act(() => vi.advanceTimersByTime(420));
    expect(document.querySelector('[data-thread-state="travel"]')).toBeTruthy();
    act(() => vi.advanceTimersByTime(560));

    expect(document.querySelector('[data-workspace-phase="understand"]')).toBeTruthy();
    expect(document.querySelector('[data-context-active="true"]')).toBeTruthy();
    expect(screen.getByText('What Kairo understood')).toBeTruthy();
  });
});
