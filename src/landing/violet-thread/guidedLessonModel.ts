export type GuidedPhase = 'guide' | 'waiting' | 'verified';

export type GuidedLessonState = Readonly<{
  phase: GuidedPhase;
  maskEdge: number;
}>;

export type GuidedLessonEvent =
  | Readonly<{ type: 'MASK_CHANGED'; value: number }>
  | Readonly<{ type: 'MASK_COMMITTED'; value: number }>
  | Readonly<{ type: 'MASK_CANCELLED' }>
  | Readonly<{ type: 'SHOW_STATIC_STORYBOARD' }>
  | Readonly<{ type: 'RESET' }>;

export const GUIDED_MASK_MIN = 0;
export const GUIDED_MASK_MAX = 100;
export const GUIDED_TARGET_MIN = 64;
export const GUIDED_TARGET_MAX = 72;

export const GUIDED_INITIAL_STATE: GuidedLessonState = {
  phase: 'guide',
  maskEdge: 38
};

function clampMaskEdge(value: number) {
  return Math.min(GUIDED_MASK_MAX, Math.max(GUIDED_MASK_MIN, value));
}

function isVerifiedMaskEdge(value: number) {
  return value >= GUIDED_TARGET_MIN && value <= GUIDED_TARGET_MAX;
}

export function guidedLessonReducer(
  state: GuidedLessonState,
  event: GuidedLessonEvent
): GuidedLessonState {
  if (event.type === 'RESET') return GUIDED_INITIAL_STATE;
  if (event.type === 'SHOW_STATIC_STORYBOARD') return { phase: 'verified', maskEdge: 68 };
  if (event.type === 'MASK_CHANGED' && state.phase !== 'verified') {
    return { phase: 'waiting', maskEdge: clampMaskEdge(event.value) };
  }
  if (event.type === 'MASK_COMMITTED' && state.phase !== 'verified') {
    const maskEdge = clampMaskEdge(event.value);
    return { phase: isVerifiedMaskEdge(maskEdge) ? 'verified' : 'waiting', maskEdge };
  }
  if (event.type === 'MASK_CANCELLED' && state.phase === 'waiting') return state;
  return state;
}
