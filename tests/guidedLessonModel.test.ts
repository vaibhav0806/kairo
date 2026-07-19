import { describe, expect, test } from 'vitest';
import {
  GUIDED_INITIAL_STATE,
  guidedLessonReducer
} from '../src/landing/violet-thread/guidedLessonModel';

describe('guided lesson model', () => {
  test('waits for a learner change and verifies only a correct release', () => {
    expect(GUIDED_INITIAL_STATE).toEqual({ phase: 'guide', maskEdge: 38 });
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_CHANGED', value: 68 }))
      .toEqual({ phase: 'waiting', maskEdge: 68 });
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_COMMITTED', value: 52 }).phase)
      .toBe('waiting');
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_COMMITTED', value: 68 }).phase)
      .toBe('verified');
  });

  test('renders a completed static storyboard and resets cleanly', () => {
    expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'SHOW_STATIC_STORYBOARD' }))
      .toEqual({ phase: 'verified', maskEdge: 68 });
    expect(guidedLessonReducer({ phase: 'verified', maskEdge: 68 }, { type: 'RESET' }))
      .toEqual(GUIDED_INITIAL_STATE);
  });
});
