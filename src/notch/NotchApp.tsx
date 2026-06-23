import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { activationStateToNotchPayload } from '../activation/activationState';
import { loadBrowserEnv } from '../config/env';
import type { UserAnnotation } from '../core/types';
import { createNativeBridge } from '../native/nativeBridge';
import { subscribeToNotchPayload } from './notchEvents';
import { askTutorFromNotch } from './notchTutor';
import {
  isNotchDismissKey,
  isNotchPromptVisible,
  submitNotchPrompt,
  waitForNotchPaint
} from './prompt';
import type { NotchPayload } from './types';

const defaultPayload: NotchPayload = {
  state: 'idle',
  layout: 'compact',
  title: 'Kairo is ready',
  detail: 'Press the shortcut to start'
};

export function NotchApp() {
  const [payload, setPayload] = useState<NotchPayload>(defaultPayload);
  const [query, setQuery] = useState('');
  const [annotations, setAnnotations] = useState<UserAnnotation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const nativeBridge = useMemo(() => createNativeBridge(), []);
  const env = loadBrowserEnv();
  const isPromptVisible = isNotchPromptVisible(payload);

  const hideNotch = useCallback(() => {
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setPayload(defaultPayload);
    setQuery('');
    setAnnotations([]);
    void nativeBridge.hideOverlay();
    void nativeBridge.hideNotch();
  }, [nativeBridge]);

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
          }
          if (nextPayload.state === 'listening') {
            isSubmittingRef.current = false;
            setAnnotations([]);
            setIsSubmitting(false);
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
      listen('annotation:done', () => {
        if (!isMounted) {
          return;
        }

        const capturedPayload = activationStateToNotchPayload('captured');
        isSubmittingRef.current = false;
        setPayload(capturedPayload);
        setIsSubmitting(false);
        void nativeBridge.showNotch(capturedPayload);
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
  }, [nativeBridge]);

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
      <div
        aria-busy={isSubmitting || payload.state === 'thinking'}
        className="notch-card"
        data-busy={isSubmitting ? 'true' : 'false'}
        data-layout={payload.layout}
        data-state={payload.state}
      >
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
        {isPromptVisible ? (
          <form
            className="notch-prompt"
            onSubmit={(event) => {
              event.preventDefault();
              if (isSubmittingRef.current) {
                return;
              }

              void submitNotchPrompt(query, async (askPayload) => {
                const thinkingPayload = activationStateToNotchPayload('thinking');
                isSubmittingRef.current = true;
                setIsSubmitting(true);
                setPayload(thinkingPayload);
                setQuery('');
                void nativeBridge.showNotch(thinkingPayload);
                await waitForNotchPaint();

                try {
                  const answerPayload = await askTutorFromNotch({
                    query: askPayload.query,
                    nativeBridge,
                    aiProvider: env.aiProvider,
                    defaultSkill: env.defaultSkill,
                    annotations
                  });

                  setPayload(answerPayload);
                  setQuery('');
                  setAnnotations([]);
                  void nativeBridge.showNotch(answerPayload);
                } finally {
                  isSubmittingRef.current = false;
                  setIsSubmitting(false);
                }
              }).catch(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
              });
            }}
          >
            <input
              aria-label="Ask Kairo"
              autoFocus
              disabled={isSubmitting}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about this screen"
              value={query}
            />
            <button disabled={isSubmitting} type="submit">
              Ask
            </button>
            <button
              className="notch-secondary"
              disabled={isSubmitting}
              type="button"
              onClick={() => {
                void emit('annotation:start', {});
              }}
            >
              Annotate
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
