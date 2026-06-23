import { describe, expect, test, vi } from 'vitest';
import {
  buildNotchAskPayload,
  isNotchDismissKey,
  isNotchPromptVisible,
  submitNotchPrompt,
  waitForNotchPaint
} from '../src/notch/prompt';
import type { NotchPayload } from '../src/notch/types';

const capturedPayload: NotchPayload = {
  state: 'captured',
  layout: 'prompt',
  title: 'Screen captured',
  detail: 'Ready for a question'
};

describe('notch prompt behavior', () => {
  test('shows the prompt only after a capture is ready', () => {
    expect(isNotchPromptVisible(capturedPayload)).toBe(true);
    expect(isNotchPromptVisible({ ...capturedPayload, state: 'listening' })).toBe(false);
    expect(isNotchPromptVisible({ ...capturedPayload, state: 'thinking' })).toBe(false);
  });

  test('normalizes prompt submissions before sending them to the app shell', async () => {
    const emitAsk = vi.fn(async () => undefined);

    await submitNotchPrompt('  What should I click next?  ', emitAsk);

    expect(emitAsk).toHaveBeenCalledWith(buildNotchAskPayload('What should I click next?'));
  });

  test('ignores empty prompt submissions', async () => {
    const emitAsk = vi.fn(async () => undefined);

    await submitNotchPrompt('   ', emitAsk);

    expect(emitAsk).not.toHaveBeenCalled();
  });

  test('treats Escape as the notch dismiss key', () => {
    expect(isNotchDismissKey('Escape')).toBe(true);
    expect(isNotchDismissKey('Enter')).toBe(false);
  });

  test('can yield one browser frame before heavier ask work begins', async () => {
    const frame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    vi.stubGlobal('requestAnimationFrame', frame);

    try {
      await waitForNotchPaint();

      expect(frame).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
