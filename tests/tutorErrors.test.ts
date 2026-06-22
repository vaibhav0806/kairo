import { describe, expect, test } from 'vitest';
import { createTutorRuntimeErrorResponse } from '../src/core/tutorErrors';

describe('createTutorRuntimeErrorResponse', () => {
  test('turns unexpected tutor runtime failures into visible low-confidence tutor responses', () => {
    const response = createTutorRuntimeErrorResponse({
      skillSlug: 'blender',
      error: new Error('Provider returned error')
    });

    expect(response).toMatchObject({
      mode: 'stuck_help',
      skillSlug: 'blender',
      voiceText: expect.stringContaining('AI provider'),
      screenText: expect.stringContaining('Kairo could not complete the request'),
      expectedNextState: 'provider_configuration_required',
      providerMetadata: {
        confidenceState: 'low',
        warnings: ['Provider returned error']
      }
    });
  });
});
