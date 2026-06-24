import { describe, expect, test } from 'vitest';
import {
  createAnnotationStartPayload,
  normalizeAnnotationStartPayload
} from '../src/notch/annotationActions';

describe('notch annotation actions', () => {
  test('builds a typed annotation start payload', () => {
    expect(createAnnotationStartPayload('erase')).toEqual({ tool: 'erase' });
  });

  test('defaults missing annotation start payloads to pen', () => {
    expect(normalizeAnnotationStartPayload(undefined)).toEqual({ tool: 'pen' });
    expect(normalizeAnnotationStartPayload({})).toEqual({ tool: 'pen' });
  });
});
