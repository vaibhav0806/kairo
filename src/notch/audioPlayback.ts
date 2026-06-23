import type { NativeSpeechSynthesisResult } from '../native/nativeBridge';

export function buildAudioDataUrl(result: NativeSpeechSynthesisResult) {
  if (!result.audioBase64.trim()) {
    return '';
  }

  return `data:${result.mimeType || 'audio/mpeg'};base64,${result.audioBase64}`;
}
