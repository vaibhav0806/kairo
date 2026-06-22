import type { TutorResponse } from './types';

export function tutorErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected tutor runtime failure.';
}

export function createTutorRuntimeErrorResponse({
  skillSlug,
  error
}: {
  skillSlug: string;
  error: unknown;
}): TutorResponse {
  return {
    mode: 'stuck_help',
    skillSlug,
    voiceText: 'The AI provider is unavailable. Check provider configuration before continuing.',
    screenText:
      'Kairo could not complete the request. Check the provider model, local env values, and network status.',
    visualTargets: [],
    expectedNextState: 'provider_configuration_required',
    providerMetadata: {
      confidenceState: 'low',
      warnings: [tutorErrorMessage(error)]
    }
  };
}
