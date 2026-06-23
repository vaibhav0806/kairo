export type VoiceCaptureState = 'idle' | 'recording' | 'transcribing' | 'error';

const preferredAudioMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav'
];

export function selectAudioMimeType(
  mediaRecorder: Pick<typeof MediaRecorder, 'isTypeSupported'> | undefined = globalThis.MediaRecorder
) {
  if (!mediaRecorder?.isTypeSupported) {
    return '';
  }

  return preferredAudioMimeTypes.find((mimeType) => mediaRecorder.isTypeSupported(mimeType)) ?? '';
}

export function voiceStatusCopy(state: VoiceCaptureState) {
  if (state === 'recording') {
    return {
      title: 'Kairo is listening',
      detail: 'Speak now'
    };
  }

  if (state === 'transcribing') {
    return {
      title: 'Kairo is transcribing',
      detail: 'Turning voice into text'
    };
  }

  if (state === 'error') {
    return {
      title: 'Voice unavailable',
      detail: 'Check microphone access and try again'
    };
  }

  return {
    title: 'Screen captured',
    detail: 'Ready for a question'
  };
}

export async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return globalThis.btoa(binary);
}
