'use client';

import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ContextLayers.module.css';

type ContextLayersProps = Readonly<{
  active: boolean;
}>;

type ContextPhase =
  | 'armed'
  | 'question'
  | 'target'
  | 'magnify'
  | 'connector'
  | 'response'
  | 'streaming'
  | 'complete';

const reply = 'Open Preview in the right dock. That panel holds the playback controls.';
const replyChunks = reply.match(/\S+\s*/g) ?? [reply];

const phaseOrder: Record<ContextPhase, number> = {
  armed: 0,
  question: 1,
  target: 2,
  magnify: 3,
  connector: 4,
  response: 5,
  streaming: 6,
  complete: 7
};

export function ContextLayers({ active }: ContextLayersProps) {
  const reducedMotion = useReducedMotion();
  const [isCompact, setIsCompact] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<ContextPhase>('complete');
  const [run, setRun] = useState(0);
  const [visibleReply, setVisibleReply] = useState(reply);
  const sectionRef = useRef<HTMLElement>(null);
  const phaseRef = useRef<ContextPhase>(phase);
  const visibleRef = useRef(false);
  const playedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const update = () => setIsCompact(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const begin = useCallback(() => {
    setVisibleReply('');
    setRun((current) => current + 1);
    setPhase('question');
  }, []);

  const advance = useCallback((from: ContextPhase, to: ContextPhase) => {
    if (phaseRef.current === from && visibleRef.current) setPhase(to);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !active) return;

    if (reducedMotion) {
      playedRef.current = true;
      setVisibleReply(reply);
      setPhase('complete');
      return;
    }

    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        setVisible(entry.isIntersecting);

        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          begin();
          return;
        }

        if (!entry.isIntersecting && phaseRef.current !== 'complete') {
          playedRef.current = false;
          setVisibleReply('');
          setPhase('armed');
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [active, begin, reducedMotion]);

  useEffect(() => {
    if (phase !== 'streaming') return;

    let chunk = 0;
    let timer = 0;

    const streamNext = () => {
      chunk += 1;
      setVisibleReply(replyChunks.slice(0, chunk).join(''));

      if (chunk < replyChunks.length) {
        const pause = replyChunks[chunk - 1]?.includes('.') ? 80 : 42;
        timer = window.setTimeout(streamNext, pause);
        return;
      }

      setPhase('complete');
    };

    timer = window.setTimeout(streamNext, 28);
    return () => window.clearTimeout(timer);
  }, [phase, run]);

  const showQuestion = phaseOrder[phase] >= phaseOrder.question;
  const showSource = phaseOrder[phase] >= phaseOrder.target;
  const showMagnify = phaseOrder[phase] >= phaseOrder.magnify;
  const showConnector = phaseOrder[phase] >= phaseOrder.connector;
  const showResponse = phaseOrder[phase] >= phaseOrder.response;
  const replay = () => {
    playedRef.current = true;
    visibleRef.current = true;
    begin();
  };

  return (
    <section
      ref={sectionRef}
      id="understand"
      className={styles.context}
      aria-labelledby="understand-title"
      data-context-active={active}
      data-context-phase={phase}
      data-context-visible={visible}
      data-context-dock-clear={visible && showResponse}
    >
      <div className={styles.heading}>
        <h2 id="understand-title">Kairo sees what you mean.</h2>
        <p>
          Ask out loud or point on-screen. Kairo connects your question to the exact place you
          mean.
        </p>
      </div>

      <div className={styles.stage} aria-label="Kairo understands an After Effects question">
        {showQuestion ? (
          <motion.div
            key={`question-${run}`}
            className={styles.question}
            initial={reducedMotion || phase === 'complete' ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onAnimationComplete={() => advance('question', 'target')}
          >
            <span>You ask</span>
            <p>“Where are the preview controls?”</p>
          </motion.div>
        ) : null}

        <figure className={styles.mediaArtifact}>
          <div className={styles.mediaFrame}>
            <img
              className={styles.workspaceImage}
              src="/understand/after-effects-workspace.webp"
              alt="After Effects motion study with timeline layers and Preview controls in the right dock"
              width="2400"
              height="1394"
            />
            <img
              className={styles.previewImage}
              src="/understand/after-effects-preview.webp"
              alt=""
              width="620"
              height="1100"
              aria-hidden="true"
              data-emphasized={showMagnify}
            />
            <div className={styles.focusField} aria-hidden="true" data-visible={showMagnify} />
            {showSource ? (
              <motion.span
                key={`source-${run}`}
                className={styles.sourceSelection}
                data-context-source
                initial={
                  reducedMotion || phase === 'complete' ? false : { opacity: 0, scale: 0.96 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: isCompact ? 0.01 : 0.18,
                        ease: [0.23, 1, 0.32, 1]
                      }
                }
                onAnimationComplete={() => advance('target', 'magnify')}
                aria-hidden="true"
              />
            ) : null}
            {showMagnify ? (
              <svg
                className={styles.zoomConnector}
                viewBox="0 0 900 356"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  key={`zoom-connector-${run}`}
                  d="M577 28C610 28 630 22 667 22"
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reducedMotion || phase === 'complete'
                      ? false
                      : { opacity: 0 }
                  }
                  animate={{ opacity: 1 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.12, ease: [0.23, 1, 0.32, 1] }
                  }
                />
              </svg>
            ) : null}
            {showMagnify ? (
              <svg
                className={styles.mobileZoomConnector}
                data-mobile-zoom-connector
                viewBox="0 0 350 350"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  key={`mobile-zoom-connector-${run}`}
                  d="M327 18C350 72 238 148 217 204"
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reducedMotion || phase === 'complete'
                      ? false
                      : { opacity: 0 }
                  }
                  animate={{ opacity: 1 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.12, ease: [0.23, 1, 0.32, 1] }
                  }
                />
              </svg>
            ) : null}
            {showMagnify ? (
              <motion.span
                key={`target-${run}`}
                className={styles.targetSelection}
                data-context-enlargement
                initial={
                  reducedMotion || phase === 'complete'
                    ? false
                    : { opacity: 0, scale: 0.985 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: isCompact ? 0.16 : 0.2,
                        delay: isCompact ? 0 : 0.06,
                        ease: [0.23, 1, 0.32, 1]
                      }
                }
                onAnimationComplete={() => advance('magnify', 'connector')}
                aria-hidden="true"
              />
            ) : null}
          </div>
          <figcaption>after-effects.aep</figcaption>
        </figure>

        {showConnector ? (
          <svg
            className={styles.connector}
            viewBox="0 0 1000 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.path
              key={`connector-${run}`}
              d="M680 100C720 112 674 286 720 300"
              vectorEffect="non-scaling-stroke"
              initial={reducedMotion || phase === 'complete' ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.77, 0, 0.175, 1] }}
              onAnimationComplete={() => advance('connector', 'response')}
            />
          </svg>
        ) : null}

        {showResponse ? (
          <motion.aside
            key={`response-${run}`}
            className={styles.response}
            initial={reducedMotion || phase === 'complete' ? false : { opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
            onAnimationComplete={() => advance('response', 'streaming')}
            aria-hidden="true"
          >
            <div className={styles.responseHead}>
              <span aria-hidden="true">k</span>
              <b>Kairo sees After Effects</b>
            </div>
            <div className={styles.reply}>
              <p className={styles.replyStream}>{visibleReply}</p>
            </div>
          </motion.aside>
        ) : null}

        {!reducedMotion ? (
          <button
            type="button"
            className={styles.replay}
            disabled={phase !== 'complete'}
            onClick={replay}
          >
            {phase === 'complete' ? (
              <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
            ) : null}
            <span aria-live="polite">
              {phase === 'complete' ? 'Replay explanation' : 'Playing explanation'}
            </span>
          </button>
        ) : null}
      </div>

      <p className={styles.screenReaderSummary}>
        You ask, “Where are the preview controls?” Kairo sees the After Effects workspace and
        answers, “{reply}”
      </p>
    </section>
  );
}
