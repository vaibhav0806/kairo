export type NoticePhase =
  | 'preview'
  | 'noticed'
  | 'attached'
  | 'guiding'
  | 'waiting'
  | 'verified';

import type { VioletThreadState } from './threadTypes';

export type NoticeState = Readonly<{
  phase: NoticePhase;
  handle: number;
}>;

export type NoticeEvent =
  | Readonly<{ type: 'PREVIEW_FINISHED' }>
  | Readonly<{ type: 'TARGET_SELECTED' }>
  | Readonly<{ type: 'GUIDANCE_READY' }>
  | Readonly<{ type: 'HANDLE_CHANGED'; value: number }>
  | Readonly<{ type: 'HANDLE_COMMITTED'; value: number }>
  | Readonly<{ type: 'HANDLE_CANCELLED' }>
  | Readonly<{ type: 'SHOW_STATIC_STORYBOARD' }>
  | Readonly<{ type: 'RESET' }>;

export const NOTICE_HANDLE_MIN = 0;
export const NOTICE_HANDLE_MAX = 100;
export const NOTICE_HANDLE_START = 88;
export const NOTICE_HANDLE_TARGET_MIN = 66;
export const NOTICE_HANDLE_TARGET_MAX = 78;

export const INITIAL_NOTICE_STATE: NoticeState = {
  phase: 'preview',
  handle: NOTICE_HANDLE_START
};

export const STATIC_NOTICE_STATE: NoticeState = {
  phase: 'verified',
  handle: 72
};

function clampNoticeHandle(value: number) {
  return Math.min(NOTICE_HANDLE_MAX, Math.max(NOTICE_HANDLE_MIN, value));
}

export function isNoticeHandleVerified(value: number) {
  return value >= NOTICE_HANDLE_TARGET_MIN && value <= NOTICE_HANDLE_TARGET_MAX;
}

export function noticeLessonReducer(state: NoticeState, event: NoticeEvent): NoticeState {
  if (event.type === 'RESET') return INITIAL_NOTICE_STATE;
  if (event.type === 'SHOW_STATIC_STORYBOARD') return STATIC_NOTICE_STATE;
  if (event.type === 'PREVIEW_FINISHED' && state.phase === 'preview') {
    return { ...state, phase: 'noticed' };
  }
  if (event.type === 'TARGET_SELECTED' && state.phase !== 'verified') {
    return { ...state, phase: 'attached' };
  }
  if (event.type === 'GUIDANCE_READY' && state.phase === 'attached') {
    return { ...state, phase: 'guiding' };
  }
  if (event.type === 'HANDLE_CHANGED' && (state.phase === 'guiding' || state.phase === 'waiting')) {
    return { phase: 'waiting', handle: clampNoticeHandle(event.value) };
  }
  if (event.type === 'HANDLE_COMMITTED' && (state.phase === 'guiding' || state.phase === 'waiting')) {
    const handle = clampNoticeHandle(event.value);
    return { phase: isNoticeHandleVerified(handle) ? 'verified' : 'waiting', handle };
  }
  if (event.type === 'HANDLE_CANCELLED' && state.phase === 'waiting') return state;
  return state;
}

export function threadStateForNoticePhase(phase: NoticePhase): VioletThreadState {
  if (phase === 'preview') return 'dormant';
  if (phase === 'noticed') return 'notice';
  if (phase === 'attached') return 'attach';
  if (phase === 'guiding') return 'guide';
  if (phase === 'waiting') return 'wait';
  return 'verify';
}
