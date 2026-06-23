import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { activationStateToNotchPayload } from '../activation/activationState';
import { loadBrowserEnv } from '../config/env';
import type { UserAnnotation } from '../core/types';
import { createNativeBridge } from '../native/nativeBridge';
import { createAnnotationStartPayload, type NotchAnnotationTool } from './annotationActions';
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

const annotationTools: Array<{ label: string; tool: NotchAnnotationTool }> = [
  { label: 'Pen', tool: 'pen' },
  { label: 'Box', tool: 'rectangle' },
  { label: 'Circle', tool: 'circle' },
  { label: 'Glow', tool: 'highlight' },
  { label: 'Line', tool: 'underline' }
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const nativeBridge = useMemo(() => createNativeBridge(), []);
  const env = loadBrowserEnv();
  const isPromptVisible = isNotchPromptVisible(payload);
  const canUsePrompt = isPromptVisible && !isSubmitting && payload.state !== 'thinking';

  const startAnnotation = useCallback((tool: NotchAnnotationTool) => {
    void emit('annotation:start', createAnnotationStartPayload(tool));
  }, []);

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
      <section
        aria-busy={isSubmitting || payload.state === 'thinking'}
        className="notch-card"
        data-busy={isSubmitting ? 'true' : 'false'}
        data-layout={payload.layout}
        data-state={payload.state}
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
              disabled={!canUsePrompt}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={promptPlaceholder(payload)}
              value={query}
            />
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
                  disabled={isSubmitting}
                  key={option.tool}
                  type="button"
                  onClick={() => startAnnotation(option.tool)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
