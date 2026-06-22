import type { NotchPayload, NotchState } from '../notch/types';
import type { TutorResponse } from '../core/types';

export type ActivationState = NotchState;

export type ActivationEvent =
  | { type: 'shortcut_pressed' }
  | { type: 'capture_complete' }
  | { type: 'capture_failed' }
  | { type: 'thinking_started' }
  | { type: 'response_ready' }
  | { type: 'dismissed' };

export function reduceActivationState(
  state: ActivationState,
  event: ActivationEvent
): ActivationState {
  if (event.type === 'shortcut_pressed') {
    return 'listening';
  }

  if (event.type === 'capture_complete' && state === 'listening') {
    return 'captured';
  }

  if (event.type === 'thinking_started') {
    return 'thinking';
  }

  if (event.type === 'response_ready' && state === 'thinking') {
    return 'showing_step';
  }

  if (event.type === 'dismissed' || event.type === 'capture_failed') {
    return 'idle';
  }

  return state;
}

export function activationStateToNotchPayload(state: ActivationState): NotchPayload {
  const payloads: Record<ActivationState, NotchPayload> = {
    idle: {
      state: 'idle',
      layout: 'compact',
      title: 'Kairo is ready',
      detail: 'Press the shortcut to start'
    },
    listening: {
      state: 'listening',
      layout: 'compact',
      title: 'Kairo is listening',
      detail: 'Capturing the current screen'
    },
    captured: {
      state: 'captured',
      layout: 'prompt',
      title: 'Screen captured',
      detail: 'Ready for a question'
    },
    thinking: {
      state: 'thinking',
      layout: 'compact',
      title: 'Kairo is thinking',
      detail: 'Preparing the next step'
    },
    showing_step: {
      state: 'showing_step',
      layout: 'answer',
      title: 'Step is ready',
      detail: 'Showing guidance on screen'
    }
  };

  return payloads[state];
}

export function tutorResponseToNotchPayload(response: TutorResponse): NotchPayload {
  return {
    state: 'showing_step',
    layout: 'answer',
    title: 'Kairo answered',
    detail: response.screenText || response.voiceText
  };
}
