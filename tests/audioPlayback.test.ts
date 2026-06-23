import { describe, expect, test } from 'vitest';
import { buildAudioDataUrl } from '../src/notch/audioPlayback';

describe('buildAudioDataUrl', () => {
  test('builds a browser-playable audio data URL from native synthesis output', () => {
    expect(
      buildAudioDataUrl({
        audioBase64: 'UklGRg==',
        mimeType: 'audio/wav',
        provider: 'sarvam'
      })
    ).toBe('data:audio/wav;base64,UklGRg==');
  });

  test('returns an empty URL when native synthesis is intentionally silent', () => {
    expect(
      buildAudioDataUrl({
        audioBase64: '',
        mimeType: 'audio/mpeg',
        provider: 'mock'
      })
    ).toBe('');
  });
});
