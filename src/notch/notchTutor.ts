import { activationStateToNotchPayload, tutorResponseToNotchPayload } from '../activation/activationState';
import { createMockTutorPlanner } from '../core/mockTutor';
import { createTutorOrchestrator } from '../core/orchestrator';
import { createRuntimeTutorPlanner, type RuntimeTutorProvider } from '../core/runtimePlanner';
import { createTutorRuntimeErrorResponse } from '../core/tutorErrors';
import type { UserAnnotation } from '../core/types';
import type { NativeBridge } from '../native/nativeBridge';
import type { NotchPayload } from './types';

export type AskTutorFromNotchOptions = {
  query: string;
  nativeBridge: NativeBridge;
  aiProvider: RuntimeTutorProvider;
  defaultSkill: string;
  annotations?: UserAnnotation[];
};

export async function askTutorFromNotch({
  query,
  nativeBridge,
  aiProvider,
  defaultSkill,
  annotations = []
}: AskTutorFromNotchOptions): Promise<NotchPayload> {
  try {
    const mockPlanner = createMockTutorPlanner();
    const planner = createRuntimeTutorPlanner({
      aiProvider,
      nativeBridge,
      mockPlanner
    });
    const orchestrator = createTutorOrchestrator({ planner });
    const screenCapture = await nativeBridge.captureScreen();
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

    if (annotations.length > 0 && screenCapture.displayBounds) {
      await nativeBridge.showOverlay({
        mode: 'annotation_preview',
        displayBounds: screenCapture.displayBounds,
        targets: [],
        annotations
      });
    } else if (response.visualTargets.length > 0 && screenCapture.displayBounds) {
      await nativeBridge.showOverlay({
        displayBounds: screenCapture.displayBounds,
        targets: response.visualTargets
      });
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
