import { describe, expect, test } from 'vitest';
import {
  activationStateToNotchPayload,
  tutorResponseToNotchPayload,
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

  test('maps tutor responses to visible notch answer copy', () => {
    expect(
      tutorResponseToNotchPayload({
        mode: 'stuck_help',
        skillSlug: 'browser',
        voiceText: 'You are on the OpenRouter page. Ask me what to inspect next.',
        screenText: 'You are on the OpenRouter page.',
        visualTargets: [],
        expectedNextState: 'user_clarifies_goal'
      })
    ).toEqual({
      state: 'showing_step',
      title: 'Kairo answered',
      detail: 'You are on the OpenRouter page.'
    });
  });
});
