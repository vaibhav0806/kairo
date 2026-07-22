import { describe, expect, test } from 'vitest';
import {
  GUIDED_INITIAL_STATE,
  formatWorkAreaTimecode,
  guidedPhaseFromProgress,
  guidedLessonReducer
} from '../src/landing/violet-thread/guidedLessonModel';

describe('guided lesson model', () => {
  test('verifies as soon as the learner reaches the target', () => {
    expect(GUIDED_INITIAL_STATE).toEqual({ phase: 'guide', workAreaEnd: 38 });
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'WORK_AREA_CHANGED', value: 68 }))
      .toEqual({ phase: 'verified', workAreaEnd: 68 });
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'WORK_AREA_COMMITTED', value: 52 }).phase)
      .toBe('waiting');
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'WORK_AREA_COMMITTED', value: 68 }).phase)
      .toBe('verified');
  });

  test('snaps an overshoot to the target instead of returning to waiting', () => {
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'WORK_AREA_CHANGED', value: 84 }))
      .toEqual({ phase: 'verified', workAreaEnd: 68 });
  });

  test('renders a completed static storyboard and resets cleanly', () => {
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'SHOW_STATIC_STORYBOARD' }))
      .toEqual({ phase: 'verified', workAreaEnd: 68 });
    expect(guidedLessonReducer({ phase: 'verified', workAreaEnd: 68 }, { type: 'RESET' }))
      .toEqual(GUIDED_INITIAL_STATE);
  });

  test('lets the learner select every story phase directly', () => {
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, {
      type: 'PHASE_SELECTED',
      phase: 'waiting'
    })).toEqual({ phase: 'waiting', workAreaEnd: 38 });
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, {
      type: 'PHASE_SELECTED',
      phase: 'verified'
    })).toEqual({ phase: 'verified', workAreaEnd: 68 });
  });

  test('rearms a story-completed lesson when the learner takes control', () => {
    expect(guidedLessonReducer(
      { phase: 'verified', workAreaEnd: 68 },
      { type: 'LEARNER_TAKEOVER' }
    )).toEqual({ phase: 'waiting', workAreaEnd: 38 });
  });

  test('finishes the untouched demonstration before the pinned section ends', () => {
    expect(guidedPhaseFromProgress(0.41)).toBe('guide');
    expect(guidedPhaseFromProgress(0.42)).toBe('waiting');
    expect(guidedPhaseFromProgress(0.71)).toBe('waiting');
    expect(guidedPhaseFromProgress(0.72)).toBe('verified');
    expect(guidedPhaseFromProgress(1)).toBe('verified');
  });

  test('maps the authentic 30fps timeline positions to timecode', () => {
    expect(formatWorkAreaTimecode(38)).toBe('0:00:04:15');
    expect(formatWorkAreaTimecode(68)).toBe('0:00:05:15');
    expect(formatWorkAreaTimecode(120)).toBe('0:00:06:01');
  });
});
