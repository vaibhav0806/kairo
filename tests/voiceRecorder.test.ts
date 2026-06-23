import { describe, expect, test } from 'vitest';
import { selectAudioMimeType, voiceStatusCopy } from '../src/notch/voiceRecorder';

describe('voiceRecorder helpers', () => {
  test('selects the first supported audio MIME type', () => {
    const recorder = {
      isTypeSupported: (mimeType: string) => mimeType === 'audio/webm'
    };

    expect(selectAudioMimeType(recorder)).toBe('audio/webm');
  });

  test('falls back to browser default when no candidate is supported', () => {
    const recorder = {
      isTypeSupported: () => false
    };

    expect(selectAudioMimeType(recorder)).toBe('');
  });

  test('describes recording and transcription states', () => {
    expect(voiceStatusCopy('recording')).toEqual({
      title: 'Kairo is listening',
      detail: 'Speak now'
    });
    expect(voiceStatusCopy('transcribing')).toEqual({
      title: 'Kairo is transcribing',
      detail: 'Turning voice into text'
    });
  });
});
