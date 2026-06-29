import { activationStateToNotchPayload, tutorResponseToNotchPayload } from '../activation/activationState';
import { createMockTutorPlanner } from '../core/mockTutor';
import { createTutorOrchestrator } from '../core/orchestrator';
import { createRuntimeTutorPlanner, type RuntimeTutorProvider } from '../core/runtimePlanner';
import { createTutorRuntimeErrorResponse } from '../core/tutorErrors';
import type { UserAnnotation, VisualTarget } from '../core/types';
import type { NativeBridge, NativeScreenCapture } from '../native/nativeBridge';
import type { NotchPayload } from './types';

// Target kinds the companion cursor flies to (single points). Other kinds are
// area highlights and stay in the overlay.
const POINT_KINDS: ReadonlySet<VisualTarget['kind']> = new Set([
  'pointer',
  'arrow',
  'ghost_cursor'
]);

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

export async function askTutorFromNotch({
  query,
  nativeBridge,
  aiProvider,
  defaultSkill,
  annotations = [],
  screenCapture: providedCapture
}: AskTutorFromNotchOptions): Promise<NotchPayload> {
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
    if (annotations.length > 0 && displayBounds) {
      await nativeBridge.showOverlay({
        mode: 'annotation_preview',
        displayBounds,
        targets: [],
        annotations
      });
    } else if (response.visualTargets.length > 0 && displayBounds) {
      const pointTarget = response.visualTargets.find((target) => POINT_KINDS.has(target.kind));
      const areaTargets = response.visualTargets.filter((target) => !POINT_KINDS.has(target.kind));

      // The companion cursor flies to the primary point-like target; the notch
      // releases it back to the mouse after TTS playback completes (+grace).
      if (pointTarget) {
        await nativeBridge.cursorPoint({
          screenRegion: pointTarget.screenRegion,
          displayBounds
        });
      }

      // Area targets (boxes/underlines/spotlights) still render in the overlay.
      if (areaTargets.length > 0) {
        await nativeBridge.showOverlay({ displayBounds, targets: areaTargets });
      } else {
        await nativeBridge.hideOverlay();
      }
    } else {
      await nativeBridge.hideOverlay();
    }

    return tutorResponseToNotchPayload(response) ?? activationStateToNotchPayload('showing_step');
  } catch (error) {
    const response = createTutorRuntimeErrorResponse({
      skillSlug: defaultSkill,
      error
    });
    return tutorResponseToNotchPayload(response);
  }
}
