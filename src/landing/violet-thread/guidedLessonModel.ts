export type GuidedPhase = 'guide' | 'waiting' | 'verified';

export type GuidedLessonState = Readonly<{
  phase: GuidedPhase;
  workAreaEnd: number;
}>;

export type GuidedLessonEvent =
  | Readonly<{ type: 'WORK_AREA_CHANGED'; value: number }>
  | Readonly<{ type: 'WORK_AREA_COMMITTED'; value: number }>
  | Readonly<{ type: 'SCROLL_PHASE_CHANGED'; phase: GuidedPhase }>
  | Readonly<{ type: 'PHASE_SELECTED'; phase: GuidedPhase }>
  | Readonly<{ type: 'SHOW_STATIC_STORYBOARD' }>
  | Readonly<{ type: 'LEARNER_TAKEOVER' }>
  | Readonly<{ type: 'RESET' }>;

export const GUIDED_WORK_AREA_MIN = 24;
export const GUIDED_WORK_AREA_MAX = 84;
export const GUIDED_TARGET_MIN = 64;

export const GUIDED_INITIAL_STATE: GuidedLessonState = {
  phase: 'guide',
  workAreaEnd: 38
};

export function guidedPhaseFromProgress(progress: number): GuidedPhase {
  if (progress < 0.42) return 'guide';
  if (progress < 0.72) return 'waiting';
  return 'verified';
}

const phasePositions: Record<GuidedPhase, number> = {
  guide: 38,
  waiting: 38,
  verified: 68
};

function clampWorkAreaEnd(value: number) {
  return Math.min(GUIDED_WORK_AREA_MAX, Math.max(GUIDED_WORK_AREA_MIN, value));
}

function hasReachedWorkAreaTarget(value: number) {
  return value >= GUIDED_TARGET_MIN;
}

export function formatWorkAreaTimecode(value: number) {
  const frameOffset = Math.round(clampWorkAreaEnd(value) - phasePositions.guide);
  const absoluteFrames = 4 * 30 + 15 + frameOffset;
  const seconds = Math.floor(absoluteFrames / 30);
  const frames = absoluteFrames % 30;

  return `0:00:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

export function guidedLessonReducer(
  state: GuidedLessonState,
  event: GuidedLessonEvent
): GuidedLessonState {
  if (event.type === 'RESET') return GUIDED_INITIAL_STATE;
  if (event.type === 'SHOW_STATIC_STORYBOARD') {
    return { phase: 'verified', workAreaEnd: phasePositions.verified };
  }
  if (event.type === 'LEARNER_TAKEOVER') {
    return { phase: 'waiting', workAreaEnd: phasePositions.waiting };
  }
  if (event.type === 'SCROLL_PHASE_CHANGED' || event.type === 'PHASE_SELECTED') {
    return { phase: event.phase, workAreaEnd: phasePositions[event.phase] };
  }
  if (event.type === 'WORK_AREA_CHANGED') {
    const workAreaEnd = clampWorkAreaEnd(event.value);
    if (state.phase === 'verified' || hasReachedWorkAreaTarget(workAreaEnd)) {
      return { phase: 'verified', workAreaEnd: phasePositions.verified };
    }
    return {
      phase: 'waiting',
      workAreaEnd
    };
  }
  if (event.type === 'WORK_AREA_COMMITTED') {
    const workAreaEnd = clampWorkAreaEnd(event.value);
    if (state.phase === 'verified' || hasReachedWorkAreaTarget(workAreaEnd)) {
      return { phase: 'verified', workAreaEnd: phasePositions.verified };
    }
    return {
      phase: 'waiting',
      workAreaEnd
    };
  }
  return state;
}
