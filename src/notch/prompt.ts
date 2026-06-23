import type { NotchPayload } from './types';
import type { VoiceCaptureState } from './voiceRecorder';

export type NotchAskPayload = {
  query: string;
};

export type EmitNotchAsk = (payload: NotchAskPayload) => Promise<void>;

export function isNotchPromptVisible(payload: NotchPayload) {
  return payload.state === 'captured' || payload.state === 'showing_step';
}

export type NotchInteractionState = {
  promptVisible: boolean;
  canUsePrompt: boolean;
  canSubmitText: boolean;
  canUseVoice: boolean;
  canAnnotate: boolean;
  submitMode: 'text' | 'voice';
  promptDisabledReason: 'busy' | 'voice-recording' | 'hidden' | null;
};

export function getNotchInteractionState({
  payload,
  voiceState,
  isSubmitting
}: {
  payload: NotchPayload;
  voiceState: VoiceCaptureState;
  isSubmitting: boolean;
}): NotchInteractionState {
  const isRecording = voiceState === 'recording';
  const isBusy = isSubmitting || payload.state === 'thinking' || voiceState === 'transcribing';
  const promptVisible = isNotchPromptVisible(payload) || isRecording || voiceState === 'error';
  const canUsePrompt = promptVisible && !isBusy && !isRecording;
  const canUseVoice = isRecording || (promptVisible && !isBusy);
  const canAnnotate =
    !isBusy && !isRecording && (payload.state === 'captured' || payload.state === 'showing_step');

  let promptDisabledReason: NotchInteractionState['promptDisabledReason'] = null;
  if (isBusy) {
    promptDisabledReason = 'busy';
  } else if (isRecording) {
    promptDisabledReason = 'voice-recording';
  } else if (!promptVisible) {
    promptDisabledReason = 'hidden';
  }

  return {
    promptVisible,
    canUsePrompt,
    canSubmitText: canUsePrompt,
    canUseVoice,
    canAnnotate,
    submitMode: isRecording ? 'voice' : 'text',
    promptDisabledReason
  };
}

export function isNotchDismissKey(key: string) {
  return key === 'Escape';
}

export function buildNotchAskPayload(query: string): NotchAskPayload {
  return {
    query: query.trim()
  };
}

export async function submitNotchPrompt(query: string, emitAsk: EmitNotchAsk) {
  const payload = buildNotchAskPayload(query);
  if (!payload.query) {
    return;
  }

  await emitAsk(payload);
}

export function waitForNotchPaint() {
  return new Promise<void>((resolve) => {
    if (typeof globalThis.requestAnimationFrame === 'function') {
      globalThis.requestAnimationFrame(() => resolve());
      return;
    }

    globalThis.setTimeout(resolve, 0);
  });
}
