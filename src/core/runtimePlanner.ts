import { createMockTutorPlanner } from './mockTutor';
import type { TutorPlannerAdapter, TutorTurnInput } from './orchestrator';
import type { TutorRequest, TutorResponse } from './types';
import { parseTutorPlannerResponse } from '../server/providers/tutorPlanner';

export type RuntimeTutorProvider = 'mock' | 'openrouter';

export type NativeTutorTurnRunner = {
  runTutorTurn(input: TutorTurnInput): Promise<string>;
};

export type MockTutorPlanner = Pick<ReturnType<typeof createMockTutorPlanner>, 'planNextStep'>;

function toMockRequest(input: TutorTurnInput): TutorRequest {
  return {
    ...input.activeApp,
    userQuery: input.userQuery,
    annotations: input.annotations
  };
}

function providerFailureResponse(input: TutorTurnInput, error: unknown): TutorResponse {
  const message =
    error instanceof Error ? error.message : 'The native provider command failed unexpectedly.';

  return {
    mode: 'stuck_help',
    skillSlug: input.skill.slug,
    voiceText: 'The AI provider is unavailable. Check provider configuration before continuing.',
    screenText:
      'Kairo could not reach the configured AI provider. Check the local provider env values and rebuild or relaunch the app.',
    visualTargets: [],
    expectedNextState: 'provider_configuration_required',
    providerMetadata: {
      confidenceState: 'low',
      warnings: [message]
    }
  };
}

export function createRuntimeTutorPlanner({
  aiProvider,
  nativeBridge,
  mockPlanner
}: {
  aiProvider: RuntimeTutorProvider;
  nativeBridge: NativeTutorTurnRunner;
  mockPlanner: MockTutorPlanner;
}): TutorPlannerAdapter {
  return async (input) => {
    if (aiProvider === 'openrouter') {
      try {
        const rawProviderResponse = await nativeBridge.runTutorTurn(input);
        return parseTutorPlannerResponse(rawProviderResponse, input);
      } catch (error) {
        return providerFailureResponse(input, error);
      }
    }

    return mockPlanner.planNextStep(toMockRequest(input));
  };
}
