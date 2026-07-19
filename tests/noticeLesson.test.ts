import { describe, expect, test } from 'vitest';
import {
  INITIAL_NOTICE_STATE,
  NOTICE_HANDLE_MAX,
  NOTICE_HANDLE_MIN,
  NOTICE_HANDLE_TARGET_MAX,
  NOTICE_HANDLE_TARGET_MIN,
  isNoticeHandleVerified,
  noticeLessonReducer,
  threadStateForNoticePhase
} from '../src/landing/violet-thread/noticeLessonModel';

describe('notice lesson model', () => {
  test('advances only through learner-controlled phases', () => {
    const noticed = noticeLessonReducer(INITIAL_NOTICE_STATE, { type: 'PREVIEW_FINISHED' });
    const attached = noticeLessonReducer(noticed, { type: 'TARGET_SELECTED' });
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const waiting = noticeLessonReducer(guiding, { type: 'HANDLE_CHANGED', value: 58 });
    const verified = noticeLessonReducer(waiting, { type: 'HANDLE_COMMITTED', value: 72 });

    expect([noticed.phase, attached.phase, guiding.phase, waiting.phase, verified.phase]).toEqual([
      'noticed',
      'attached',
      'guiding',
      'waiting',
      'verified'
    ]);
    expect(verified.handle).toBe(72);
  });

  test('manual selection interrupts the authored opening and cancellation never verifies', () => {
    const attached = noticeLessonReducer(INITIAL_NOTICE_STATE, { type: 'TARGET_SELECTED' });
    const lateOpening = noticeLessonReducer(attached, { type: 'PREVIEW_FINISHED' });
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const waiting = noticeLessonReducer(guiding, { type: 'HANDLE_CHANGED', value: 72 });
    const cancelled = noticeLessonReducer(waiting, { type: 'HANDLE_CANCELLED' });

    expect(attached.phase).toBe('attached');
    expect(lateOpening).toEqual(attached);
    expect(cancelled).toEqual({ phase: 'waiting', handle: 72 });
  });

  test('clamps the handle and refuses verification outside the target range', () => {
    const attached = noticeLessonReducer(
      { ...INITIAL_NOTICE_STATE, phase: 'noticed' },
      { type: 'TARGET_SELECTED' }
    );
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const below = noticeLessonReducer(guiding, { type: 'HANDLE_COMMITTED', value: -30 });
    const above = noticeLessonReducer(guiding, { type: 'HANDLE_COMMITTED', value: 160 });

    expect(below).toEqual({ phase: 'waiting', handle: NOTICE_HANDLE_MIN });
    expect(above).toEqual({ phase: 'waiting', handle: NOTICE_HANDLE_MAX });
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MIN)).toBe(true);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MAX)).toBe(true);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MIN - 1)).toBe(false);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MAX + 1)).toBe(false);
  });

  test('maps lesson phases to the semantic Violet Thread vocabulary', () => {
    expect(threadStateForNoticePhase('preview')).toBe('dormant');
    expect(threadStateForNoticePhase('noticed')).toBe('notice');
    expect(threadStateForNoticePhase('attached')).toBe('attach');
    expect(threadStateForNoticePhase('guiding')).toBe('guide');
    expect(threadStateForNoticePhase('waiting')).toBe('wait');
    expect(threadStateForNoticePhase('verified')).toBe('verify');
  });
});
