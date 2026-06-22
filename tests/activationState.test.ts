import { describe, expect, test } from 'vitest';
import {
  activationStateToNotchPayload,
  reduceActivationState
} from '../src/activation/activationState';

describe('activation state', () => {
  test('moves through shortcut capture and tutor response states', () => {
    expect(reduceActivationState('idle', { type: 'shortcut_pressed' })).toBe('listening');
    expect(reduceActivationState('listening', { type: 'capture_complete' })).toBe('captured');
    expect(reduceActivationState('captured', { type: 'thinking_started' })).toBe('thinking');
    expect(reduceActivationState('thinking', { type: 'response_ready' })).toBe('showing_step');
    expect(reduceActivationState('showing_step', { type: 'dismissed' })).toBe('idle');
  });

  test('maps activation states to notch copy', () => {
    expect(activationStateToNotchPayload('listening')).toMatchObject({
      state: 'listening',
      title: 'Kairo is listening',
      detail: 'Capturing the current screen'
    });
    expect(activationStateToNotchPayload('thinking')).toMatchObject({
      state: 'thinking',
      title: 'Kairo is thinking'
    });
  });
});
