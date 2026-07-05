import { activationStateToNotchPayload, tutorResponseToNotchPayload } from '../activation/activationState';
import { createMockTutorPlanner } from '../core/mockTutor';
import { createTutorOrchestrator } from '../core/orchestrator';
import { createRuntimeTutorPlanner, type RuntimeTutorProvider } from '../core/runtimePlanner';
import { createTutorRuntimeErrorResponse } from '../core/tutorErrors';
import type { TutorStep, UserAnnotation } from '../core/types';
import type {
  NativeBridge,
  NativeContextBaseline,
  NativeScreenCapture
} from '../native/nativeBridge';
import { routeVisualTargets } from '../overlay/targetRouting';
import type { NotchPayload } from './types';

export type AskTutorFromNotchOptions = {
  query: string;
  nativeBridge: NativeBridge;
  aiProvider: RuntimeTutorProvider;
  defaultSkill: string;
  annotations?: UserAnnotation[];
  // Screenshot captured at voice-start; reused here so the ask doesn't wait on a
  // fresh capture. Falls back to capturing now (e.g. typed input, no voice).
  screenCapture?: NativeScreenCapture | null;
};

export type AskTutorResult = {
  payload: NotchPayload;
  // The answer's steps (1 for a direct answer, more for a walkthrough). The notch
  // executor plays each step's `say` and reveals `revealStep(step)` as it starts.
  steps: TutorStep[];
  // Reveal ONE step's targets (box + companion cursor), or the annotation preview /
  // nothing when the step has no box. Called per step, exactly when its TTS starts.
  revealStep: (step: TutorStep) => Promise<void>;
  // Shows the first/only step's visuals. Deferred so the notch reveals exactly when
  // TTS begins. Used by the direct (no-screen) path and as a single-step fallback.
  revealVisuals: () => Promise<void>;
  // The app the guidance points at, used to arm the context watcher. null when the
  // answer has no on-screen target to protect from going stale.
  context: NativeContextBaseline | null;
};

export async function askTutorFromNotch({
  query,
  nativeBridge,
  aiProvider,
  defaultSkill,
  annotations = [],
  screenCapture: providedCapture
}: AskTutorFromNotchOptions): Promise<AskTutorResult> {
  try {
    const mockPlanner = createMockTutorPlanner();
    const planner = createRuntimeTutorPlanner({
      aiProvider,
      nativeBridge,
      mockPlanner
    });
    const orchestrator = createTutorOrchestrator({ planner });
    // Use the fast voice-start screenshot when there are no annotations. If the
    // user drew with the pen, those marks were added AFTER that capture, so
    // re-capture now (at ask time) to include them in what the tutor sees.
    const screenCapture =
      annotations.length === 0 && providedCapture?.captured
        ? providedCapture
        : await nativeBridge.captureScreen();
    const activeApp = screenCapture.activeApp ?? (await nativeBridge.getActiveApp());
    const response = await orchestrator.runTextTurn({
      request: {
        activeApp: activeApp.activeApp,
        bundleId: activeApp.bundleId,
        windowTitle: activeApp.windowTitle,
        userQuery: query,
        annotations
      },
      screenCapture,
      skillSlug: defaultSkill
    });

    const displayBounds = screenCapture.displayBounds;
    const steps = response.steps ?? [];
    const anyTargets =
      Boolean(displayBounds) &&
      (steps.some((step) => step.visualTargets.length > 0) ||
        response.visualTargets.length > 0);

    // Reveal ONE step's visuals: its box + cursor, else the user's annotation
    // preview, else nothing. Built now, run later (on that step's TTS start) so the
    // box/cursor never appear before the step is spoken.
    const revealStep = async (step: TutorStep) => {
      if (step.visualTargets.length > 0 && displayBounds) {
        await routeVisualTargets(nativeBridge, step.visualTargets, displayBounds);
      } else if (annotations.length > 0 && displayBounds) {
        await nativeBridge.showOverlay({
          mode: 'annotation_preview',
          displayBounds,
          targets: [],
          annotations
        });
      } else {
        await nativeBridge.hideOverlay();
      }
    };

    // Single-step / direct fallback: reveal the first step, or top-level targets for
    // mock/legacy responses that don't use steps.
    const revealVisuals = async () => {
      if (steps.length > 0) {
        await revealStep(steps[0]);
        return;
      }
      if (response.visualTargets.length > 0 && displayBounds) {
        await routeVisualTargets(nativeBridge, response.visualTargets, displayBounds);
      } else if (annotations.length > 0 && displayBounds) {
        await nativeBridge.showOverlay({
          mode: 'annotation_preview',
          displayBounds,
          targets: [],
          annotations
        });
      } else {
        await nativeBridge.hideOverlay();
      }
    };

    return {
      payload:
        tutorResponseToNotchPayload(response) ?? activationStateToNotchPayload('showing_step'),
      steps,
      revealStep,
      revealVisuals,
      context: anyTargets
        ? { bundleId: activeApp.bundleId, windowTitle: activeApp.windowTitle }
        : null
    };
  } catch (error) {
    const response = createTutorRuntimeErrorResponse({
      skillSlug: defaultSkill,
      error
    });
    const hideOnly = async () => {
      await nativeBridge.hideOverlay();
    };
    return {
      payload: tutorResponseToNotchPayload(response),
      steps: response.steps ?? [],
      revealStep: hideOnly,
      revealVisuals: hideOnly,
      context: null
    };
  }
}
