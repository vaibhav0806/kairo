import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { activationStateToNotchPayload } from '../activation/activationState';
import { loadBrowserEnv } from '../config/env';
import type { UserAnnotation } from '../core/types';
import { createNativeBridge } from '../native/nativeBridge';
import { createAnnotationStartPayload, type NotchAnnotationTool } from './annotationActions';
import { buildAudioDataUrl } from './audioPlayback';
import { subscribeToNotchPayload } from './notchEvents';
import { askTutorFromNotch } from './notchTutor';
import {
  isNotchDismissKey,
  isNotchPromptVisible,
  waitForNotchPaint
} from './prompt';
import type { NotchPayload } from './types';
import {
  blobToBase64,
  selectAudioMimeType,
  voiceStatusCopy,
  type VoiceCaptureState
} from './voiceRecorder';

const defaultPayload: NotchPayload = {
  state: 'idle',
  layout: 'compact',
  title: 'Kairo is ready',
  detail: 'Press the shortcut to start'
};

const annotationTools: Array<{ label: string; icon: string; tool: NotchAnnotationTool }> = [
  { label: 'Pen', icon: '✎', tool: 'pen' },
  { label: 'Rectangle', icon: '□', tool: 'rectangle' },
  { label: 'Circle', icon: '○', tool: 'circle' },
  { label: 'Highlight', icon: '◐', tool: 'highlight' },
  { label: 'Underline', icon: '_', tool: 'underline' }
];

function promptPlaceholder(payload: NotchPayload) {
  return payload.state === 'showing_step' ? 'Ask a follow-up' : 'Ask about this screen';
}

function annotationCountText(count: number) {
  if (count === 0) {
    return 'No marks';
  }

  return `${count} mark${count === 1 ? '' : 's'}`;
}

export function NotchApp() {
  const [payload, setPayload] = useState<NotchPayload>(defaultPayload);
  const [query, setQuery] = useState('');
  const [annotations, setAnnotations] = useState<UserAnnotation[]>([]);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<NotchAnnotationTool | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceCaptureState, setVoiceCaptureState] = useState<VoiceCaptureState>('idle');
  const isSubmittingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceCancelledRef = useRef(false);
  const nativeBridge = useMemo(() => createNativeBridge(), []);
  const env = loadBrowserEnv();
  const isPromptVisible =
    isNotchPromptVisible(payload) || voiceCaptureState === 'recording' || voiceCaptureState === 'error';
  const canUsePrompt = isPromptVisible && !isSubmitting && payload.state !== 'thinking';
  const canUseVoice =
    voiceCaptureState === 'recording' ||
    (isPromptVisible && !isSubmitting && payload.state !== 'thinking' && voiceCaptureState !== 'transcribing');

  const stopVoiceTracks = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const stopAnswerPlayback = useCallback(() => {
    if (!answerAudioRef.current) {
      return;
    }

    answerAudioRef.current.pause();
    answerAudioRef.current.src = '';
    answerAudioRef.current = null;
  }, []);

  const playAnswerAudio = useCallback(
    async (text: string) => {
      stopAnswerPlayback();
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      try {
        const result = await nativeBridge.synthesizeSpeech({ text: trimmedText });
        const audioUrl = buildAudioDataUrl(result);
        if (!audioUrl) {
          return;
        }

        const audio = new Audio(audioUrl);
        answerAudioRef.current = audio;
        await audio.play();
      } catch {
        // Speech playback is best-effort; the answer should remain visible if audio fails.
      }
    },
    [nativeBridge, stopAnswerPlayback]
  );

  const submitQuery = useCallback(
    async (nextQuery: string) => {
      const trimmedQuery = nextQuery.trim();
      if (!trimmedQuery || isSubmittingRef.current) {
        return;
      }

      const thinkingPayload = activationStateToNotchPayload('thinking');
      stopAnswerPlayback();
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setVoiceCaptureState('idle');
      setPayload(thinkingPayload);
      setQuery('');
      void nativeBridge.showNotch(thinkingPayload);
      await waitForNotchPaint();

      try {
        const answerPayload = await askTutorFromNotch({
          query: trimmedQuery,
          nativeBridge,
          aiProvider: env.aiProvider,
          defaultSkill: env.defaultSkill,
          annotations
        });

        setPayload(answerPayload);
        setQuery('');
        setAnnotations([]);
        setActiveAnnotationTool(null);
        void nativeBridge.showNotch(answerPayload);
        void playAnswerAudio(answerPayload.detail);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [annotations, env.aiProvider, env.defaultSkill, nativeBridge, playAnswerAudio, stopAnswerPlayback]
  );

  const startAnnotation = useCallback((tool: NotchAnnotationTool) => {
    setActiveAnnotationTool(tool);
    void emit('annotation:start', createAnnotationStartPayload(tool));
  }, []);

  const finishAnnotation = useCallback(() => {
    setActiveAnnotationTool(null);
    void emit('annotation:finish', {});
  }, []);

  const undoAnnotation = useCallback(() => {
    void emit('annotation:undo', {});
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setActiveAnnotationTool(null);
    void emit('annotation:clear', {});
  }, []);

  const hideNotch = useCallback(() => {
    stopAnswerPlayback();
    voiceCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    stopVoiceTracks();
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setVoiceCaptureState('idle');
    setPayload(defaultPayload);
    setQuery('');
    setAnnotations([]);
    setActiveAnnotationTool(null);
    void nativeBridge.hideOverlay();
    void nativeBridge.hideNotch();
  }, [nativeBridge, stopAnswerPlayback, stopVoiceTracks]);

  const setVoicePayload = useCallback(
    (state: VoiceCaptureState) => {
      const copy = voiceStatusCopy(state);
      const nextPayload: NotchPayload = {
        state: state === 'transcribing' ? 'thinking' : state === 'recording' ? 'listening' : 'captured',
        layout: state === 'transcribing' || state === 'recording' ? 'compact' : 'prompt',
        title: copy.title,
        detail: copy.detail
      };
      setPayload(nextPayload);
      void nativeBridge.showNotch(nextPayload);
    },
    [nativeBridge]
  );

  const startVoiceCapture = useCallback(async () => {
    stopAnswerPlayback();
    if (!globalThis.navigator?.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
      setVoiceCaptureState('error');
      setVoicePayload('error');
      return;
    }

    try {
      const stream = await globalThis.navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = selectAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      voiceCancelledRef.current = false;
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const wasCancelled = voiceCancelledRef.current;
        const chunks = audioChunksRef.current;
        const recordingMimeType = recorder.mimeType || mimeType || 'audio/webm';
        mediaRecorderRef.current = null;
        stopVoiceTracks();
        audioChunksRef.current = [];

        if (wasCancelled) {
          setVoiceCaptureState('idle');
          return;
        }

        void (async () => {
          if (chunks.length === 0) {
            setVoiceCaptureState('error');
            setVoicePayload('error');
            return;
          }

          setVoiceCaptureState('transcribing');
          setVoicePayload('transcribing');
          try {
            const audioBase64 = await blobToBase64(new Blob(chunks, { type: recordingMimeType }));
            const result = await nativeBridge.transcribeAudio({
              audioBase64,
              mimeType: recordingMimeType,
              filename: `kairo-voice.${recordingMimeType.includes('webm') ? 'webm' : 'wav'}`
            });
            const transcript = result.text.trim();
            if (!transcript) {
              setVoiceCaptureState('error');
              setVoicePayload('error');
              return;
            }

            setQuery(transcript);
            await submitQuery(transcript);
          } catch {
            setVoiceCaptureState('error');
            setVoicePayload('error');
          }
        })();
      };

      recorder.start();
      setVoiceCaptureState('recording');
      setVoicePayload('recording');
    } catch {
      stopVoiceTracks();
      setVoiceCaptureState('error');
      setVoicePayload('error');
    }
  }, [nativeBridge, setVoicePayload, stopAnswerPlayback, stopVoiceTracks, submitQuery]);

  const toggleVoiceCapture = useCallback(() => {
    if (voiceCaptureState === 'recording') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    void startVoiceCapture();
  }, [startVoiceCapture, voiceCaptureState]);

  useEffect(() => {
    document.documentElement.classList.add('notch-document');
    document.body.classList.add('notch-document');

    return () => {
      document.documentElement.classList.remove('notch-document');
      document.body.classList.remove('notch-document');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unlisten: (() => void) | undefined;

    void subscribeToNotchPayload({
      listen,
      readCurrentPayload: () => nativeBridge.getCurrentNotchPayload(),
      onPayload: (nextPayload) => {
        if (isMounted) {
          if (nextPayload.state === 'captured') {
            isSubmittingRef.current = false;
            setQuery('');
            setIsSubmitting(false);
            setVoiceCaptureState('idle');
          }
          if (nextPayload.state === 'listening') {
            isSubmittingRef.current = false;
            setAnnotations([]);
            setActiveAnnotationTool(null);
            setIsSubmitting(false);
            setVoiceCaptureState('idle');
          }
          setPayload(nextPayload);
        }
      }
    })
      .then((nextUnlisten) => {
        unlisten = nextUnlisten;
      })
      .catch(() => {
        // Browser preview and tests run without the Tauri event bus.
      });

    return () => {
      isMounted = false;
      unlisten?.();
    };
  }, [nativeBridge]);

  useEffect(() => {
    let isMounted = true;
    const unlisteners: Array<() => void> = [];

    void Promise.all([
      listen<UserAnnotation>('annotation:add', (event) => {
        if (!isMounted) {
          return;
        }

        setAnnotations((currentAnnotations) => [...currentAnnotations, event.payload]);
      }),
      listen<UserAnnotation[]>('annotation:sync', (event) => {
        if (!isMounted) {
          return;
        }

        setAnnotations(event.payload);
      }),
      listen('annotation:done', () => {
        if (!isMounted) {
          return;
        }

        const capturedPayload = activationStateToNotchPayload('captured');
        isSubmittingRef.current = false;
        setActiveAnnotationTool(null);
        setPayload(capturedPayload);
        setIsSubmitting(false);
        void nativeBridge.showNotch(capturedPayload);
      }),
      listen('voice:start', () => {
        if (!isMounted || isSubmittingRef.current) {
          return;
        }

        void startVoiceCapture();
      })
    ])
      .then((nextUnlisteners) => {
        unlisteners.push(...nextUnlisteners);
      })
      .catch(() => {
        // Browser preview and tests run without the Tauri event bus.
      });

    return () => {
      isMounted = false;
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [nativeBridge, startVoiceCapture]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isNotchDismissKey(event.key)) {
        return;
      }

      event.preventDefault();
      hideNotch();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hideNotch]);

  return (
    <main className="notch-shell" aria-label="Kairo assistant status">
      <section
        aria-busy={isSubmitting || payload.state === 'thinking'}
        className="notch-card"
        data-busy={isSubmitting ? 'true' : 'false'}
        data-layout={payload.layout}
        data-state={payload.state}
        data-voice-state={voiceCaptureState}
      >
        <header className="notch-header">
          <div className="notch-orb" aria-hidden="true" />
          <div className="notch-copy">
            <strong>{payload.title}</strong>
            <span>{payload.detail}</span>
          </div>
          <button
            aria-label="Hide Kairo"
            className="notch-close"
            type="button"
            onClick={hideNotch}
          >
            x
          </button>
        </header>

        <div className="notch-body">
          <form
            className="notch-prompt"
            data-visible={isPromptVisible ? 'true' : 'false'}
            onSubmit={(event) => {
              event.preventDefault();
              if (isSubmittingRef.current) {
                return;
              }

              submitQuery(query).catch(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
              });
            }}
          >
            <input
              aria-label="Ask Kairo"
              autoFocus
              disabled={!canUsePrompt}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={promptPlaceholder(payload)}
              value={query}
            />
            <button
              aria-label={voiceCaptureState === 'recording' ? 'Stop voice input' : 'Start voice input'}
              className="notch-voice-button"
              data-recording={voiceCaptureState === 'recording' ? 'true' : 'false'}
              disabled={!canUseVoice}
              type="button"
              onClick={toggleVoiceCapture}
            >
              <span aria-hidden="true" className="notch-voice-icon" />
            </button>
            <button disabled={!canUsePrompt} type="submit">
              Ask
            </button>
          </form>

          <div className="notch-tool-row" aria-label="Annotation tools" role="toolbar">
            <span className="notch-tool-count" aria-live="polite">
              {annotationCountText(annotations.length)}
            </span>
            <div className="notch-tools">
              {annotationTools.map((option) => (
                <button
                  aria-label={`${option.label} annotation tool`}
                  aria-pressed={activeAnnotationTool === option.tool}
                  disabled={isSubmitting}
                  key={option.tool}
                  type="button"
                  onClick={() => startAnnotation(option.tool)}
                >
                  <span aria-hidden="true">{option.icon}</span>
                </button>
              ))}
              <button
                aria-label="Undo last annotation"
                disabled={isSubmitting || annotations.length === 0}
                type="button"
                onClick={undoAnnotation}
              >
                <span aria-hidden="true">↶</span>
              </button>
              <button
                aria-label="Clear annotations"
                disabled={isSubmitting || annotations.length === 0}
                type="button"
                onClick={clearAnnotations}
              >
                <span aria-hidden="true">×</span>
              </button>
              <button
                aria-label="Finish annotations"
                className="notch-tool-done"
                disabled={isSubmitting || (!activeAnnotationTool && annotations.length === 0)}
                type="button"
                onClick={finishAnnotation}
              >
                <span aria-hidden="true">✓</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
