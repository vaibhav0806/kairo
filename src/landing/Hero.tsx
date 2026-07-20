'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { WorkspacePrototype } from './violet-thread/WorkspacePrototype';
import styles from './Hero.module.css';

type WorkspaceTarget = 'creator' | 'afterEffects' | 'blender' | 'figma' | 'davinci';

type ActivationTrigger = 'initial' | 'pointer' | 'keyboard';

type HeroActivation = {
  id: number;
  target: WorkspaceTarget;
  trigger: ActivationTrigger;
};

type Connector = {
  sequenceId: number;
  target: WorkspaceTarget;
  path: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  response: { x: number; y: number };
};

const kairoReplies: Record<WorkspaceTarget, { label: string; reply: string }> = {
  creator: {
    label: 'Editing desk',
    reply: 'That clip is still in your files. Import it first, then place it on the timeline.',
  },
  afterEffects: {
    label: 'After Effects',
    reply: 'That snap comes from the easing. Open the graph editor and soften this handle.',
  },
  blender: {
    label: 'Blender',
    reply: 'The bevel is fine. Apply the object scale first and the shading artifact should clear.',
  },
  figma: {
    label: 'Figma',
    reply: 'This card wraps because its parent frame is fixed. Switch the width to hug contents.',
  },
  davinci: {
    label: 'DaVinci',
    reply: 'This correction is being bypassed. Connect the blue output to the next node here.',
  },
};

const spring = { type: 'spring' as const, stiffness: 118, damping: 18, mass: 0.9 };

function useStreamedReply(
  text: string,
  reduceMotion: boolean | null,
  reveal: boolean,
  shouldStream: boolean,
  sequenceId: number
) {
  const streamRef = useRef<HTMLSpanElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamReply = Boolean(shouldStream && !reduceMotion);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;

    if (!reveal) {
      stream.textContent = '';
      setIsStreaming(false);
      return;
    }

    if (!streamReply) {
      stream.textContent = text;
      setIsStreaming(false);
      return;
    }

    const startsAt = window.performance.now() + 40;
    const charactersPerSecond = 64;
    let timer = 0;
    let revealed = -1;

    stream.textContent = '';
    setIsStreaming(true);

    const tick = () => {
      const now = window.performance.now();
      const elapsed = Math.max(0, now - startsAt);
      const next = Math.min(text.length, Math.floor((elapsed * charactersPerSecond) / 1000));

      if (next !== revealed) {
        revealed = next;
        stream.textContent = text.slice(0, next);
      }

      if (next < text.length) {
        timer = window.setTimeout(tick, 32);
      } else {
        setIsStreaming(false);
      }
    };

    timer = window.setTimeout(tick, 40);
    return () => window.clearTimeout(timer);
  }, [reveal, sequenceId, streamReply, text]);

  return {
    initialValue: reveal && !streamReply ? text : '',
    isStreaming,
    streamRef,
  };
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [activation, setActivation] = useState<HeroActivation>({
    id: 0,
    target: 'creator',
    trigger: 'initial',
  });
  const [arrivedSequenceId, setArrivedSequenceId] = useState<number | null>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [connector, setConnector] = useState<Connector | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const creatorVideoRef = useRef<HTMLVideoElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Partial<Record<WorkspaceTarget, HTMLSpanElement | null>>>({});
  const sequenceIdRef = useRef(0);
  const activeTarget = activation.target;
  const activeReply = kairoReplies[activeTarget];
  const animateSequence = !reduceMotion && activation.trigger !== 'keyboard';
  const connectorArrived = !animateSequence || arrivedSequenceId === activation.id;
  const streamedReply = useStreamedReply(
    activeReply.reply,
    reduceMotion,
    connectorArrived,
    animateSequence && isHeroVisible,
    activation.id
  );

  const selectTarget = (target: WorkspaceTarget, clickDetail: number) => {
    const id = sequenceIdRef.current + 1;
    sequenceIdRef.current = id;
    setArrivedSequenceId(null);
    setConnector(null);
    setActivation({
      id,
      target,
      trigger: clickDetail > 0 ? 'pointer' : 'keyboard',
    });
  };

  const entrance = (delay: number) => ({
    initial: reduceMotion ? false : { y: 24, scale: 0.96 },
    animate: { y: 0, scale: 1 },
    transition: reduceMotion ? { duration: 0 } : { ...spring, delay },
  });

  const connectorDelay = activation.trigger === 'initial' ? 0.6 : 0.16;
  const currentConnector = connector?.sequenceId === activation.id
    && connector.target === activeTarget
    ? connector
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = creatorVideoRef.current;
    if (!video) return;

    if (activeTarget !== 'creator' || !isHeroVisible || reduceMotion) {
      video.pause();
      return;
    }

    const playAttempt = video.play();
    playAttempt?.catch(() => undefined);
  }, [activeTarget, isHeroVisible, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const copy = copyRef.current;
    const target = targetRefs.current[activeTarget];
    const note = noteRef.current;

    if (!canvas || !copy || !target || !note) return;

    const measure = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const noteRect = note.getBoundingClientRect();

      if (!canvasRect.width || !noteRect.width) return;

      if (!targetRect.width) {
        setConnector(null);
        if (activeTarget !== 'creator') {
          const id = sequenceIdRef.current + 1;
          sequenceIdRef.current = id;
          setActivation({ id, target: 'creator', trigger: 'keyboard' });
        }
        return;
      }

      const targetCenter = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      };
      const noteCenter = {
        x: noteRect.left + noteRect.width / 2,
        y: noteRect.top + noteRect.height / 2,
      };
      const dx = noteCenter.x - targetCenter.x;
      const dy = noteCenter.y - targetCenter.y;
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const start = horizontal
        ? {
            x: (dx > 0 ? targetRect.right : targetRect.left) - canvasRect.left,
            y: targetCenter.y - canvasRect.top,
          }
        : {
            x: targetCenter.x - canvasRect.left,
            y: (dy > 0 ? targetRect.bottom : targetRect.top) - canvasRect.top,
          };
      let end = horizontal
        ? {
            x: (dx > 0 ? noteRect.left : noteRect.right) - canvasRect.left,
            y: noteCenter.y - canvasRect.top,
          }
        : {
            x: noteCenter.x - canvasRect.left,
            y: (dy > 0 ? noteRect.top : noteRect.bottom) - canvasRect.top,
          };
      let path = '';
      const isTablet = canvasRect.width >= 701 && canvasRect.width <= 1060;

      if (isTablet) {
        const copyCenterY = copyRect.top + copyRect.height / 2;
        const routeAbove = targetCenter.y <= copyCenterY;
        const routeY = routeAbove
          ? Math.max(32, copyRect.top - canvasRect.top - 34)
          : Math.min(canvasRect.height - 32, copyRect.bottom - canvasRect.top + 34);
        end = {
          x: noteRect.right - canvasRect.left,
          y: noteCenter.y - canvasRect.top,
        };
        const edgeX = Math.min(canvasRect.width - 14, end.x + 28);
        const startLead = Math.min(72, Math.max(28, Math.abs(edgeX - start.x) * 0.12));
        const startDirection = edgeX >= start.x ? 1 : -1;

        path = `M ${start.x} ${start.y} C ${start.x + startDirection * startLead} ${start.y}, ${start.x + startDirection * startLead} ${routeY}, ${start.x + startDirection * startLead * 2} ${routeY} C ${edgeX - 72} ${routeY}, ${edgeX} ${routeY}, ${edgeX} ${routeY + (end.y - routeY) * 0.72} Q ${edgeX} ${end.y}, ${end.x} ${end.y}`;
      } else {
        const routeY = start.y < canvasRect.height / 2
          ? Math.max(36, Math.min(start.y, end.y) - 74)
          : Math.min(canvasRect.height - 36, Math.max(start.y, end.y) + 86);
        const direction = dx >= 0 ? 1 : -1;
        const lead = Math.min(96, Math.abs(dx) * 0.18);
        const firstTurnX = start.x + direction * lead;
        const routeX = end.x - direction * 52;
        const verticalDirection = end.y >= routeY ? 1 : -1;
        const approachY = end.y - verticalDirection * Math.min(64, Math.abs(end.y - routeY) * 0.3);
        path = horizontal
          ? `M ${start.x} ${start.y} C ${firstTurnX} ${start.y}, ${firstTurnX} ${routeY}, ${firstTurnX + direction * lead} ${routeY} C ${routeX - direction * lead} ${routeY}, ${routeX} ${routeY}, ${routeX} ${approachY} Q ${routeX} ${end.y}, ${end.x} ${end.y}`
          : `M ${start.x} ${start.y} C ${start.x} ${start.y + dy * 0.38}, ${end.x} ${end.y - dy * 0.38}, ${end.x} ${end.y}`;
      }

      const response = {
        x: noteCenter.x - canvasRect.left,
        y: noteCenter.y - canvasRect.top,
      };
      setConnector((current) => (
        current?.path === path && current.sequenceId === activation.id
          ? current
          : {
              sequenceId: activation.id,
              target: activeTarget,
              path,
              start,
              end,
              response,
            }
      ));
    };

    const frame = window.requestAnimationFrame(measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

    observer?.observe(canvas);
    observer?.observe(copy);
    observer?.observe(target);
    observer?.observe(note);
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activation.id, activeTarget]);

  return (
    <section id="top" className={styles.hero} aria-labelledby="landing-title">
      <div id="hero-intro" ref={canvasRef} className={styles.introCanvas} data-hero-intro>
        <div className={styles.dotField} aria-hidden="true" />

        <div ref={copyRef} className={styles.copy}>
          <motion.p className={styles.kicker} {...entrance(0.04)}>
            an ai sidekick that shows you how
          </motion.p>
          <motion.h1 id="landing-title" aria-label="Stuck? Point at it." {...entrance(0.12)}>
            <span>Stuck?</span>{' '}
            <span className={styles.pointLine} data-text="Point at it.">
              Point at it.
            </span>
          </motion.h1>
          <motion.p className={styles.intro} {...entrance(0.24)}>
            Ask out loud or point on-screen. Kairo sees the problem and guides your next move.
          </motion.p>
          <motion.a
            id="hero-access-cta"
            className={styles.primaryAction}
            href="#access"
            {...entrance(0.34)}
            whileHover={reduceMotion ? undefined : {
              transform: 'translate(2px, 2px)',
              transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
            }}
            whileTap={reduceMotion ? undefined : {
              transform: 'translate(5px, 5px) scale(0.98)',
              transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] },
            }}
          >
            Request alpha access
            <span aria-hidden="true">↗</span>
          </motion.a>
        </div>

        <div
          className={styles.workspace}
          data-active-target={activeTarget}
          data-hero-visible={isHeroVisible}
          data-sequence-id={activation.id}
          data-sequence-phase={
            !animateSequence ? 'complete' : connectorArrived ? 'responding' : 'connecting'
          }
          data-connector-arrived={connectorArrived}
          data-annotation-source={activeTarget}
          data-annotation-target="kairo-response"
          aria-label="Creator workspaces Kairo can understand"
        >
          {currentConnector ? (
            <>
              <motion.div
                key={`focus-origin-${activeTarget}`}
                className={styles.focusField}
                style={{ left: currentConnector.start.x, top: currentConnector.start.y }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                aria-hidden="true"
              />
              {connectorArrived ? (
                <motion.div
                  key={`focus-response-${activeTarget}`}
                  className={`${styles.focusField} ${styles.responseFocusField}`}
                  style={{ left: currentConnector.response.x, top: currentConnector.response.y }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 0.62, scale: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.42,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  aria-hidden="true"
                />
              ) : null}
            </>
          ) : null}

          <div
            className={`${styles.mediaSlot} ${styles.creatorSlot}`}
            data-active={activeTarget === 'creator'}
            data-artifact="creator"
          >
            <span
              ref={(element) => { targetRefs.current.creator = element; }}
              className={styles.mediaAnchor}
              data-connector-anchor="creator"
              aria-hidden="true"
            />
            <motion.div className={styles.mediaArtifact} {...entrance(0.38)}>
              <button
                type="button"
                className={styles.mediaFrame}
                data-active={activeTarget === 'creator'}
                data-muted={activeTarget !== 'creator'}
                onClick={(event) => selectTarget('creator', event.detail)}
                aria-label="Ask Kairo about the editing desk"
                aria-pressed={activeTarget === 'creator'}
              >
                <video
                  ref={creatorVideoRef}
                  className={styles.media}
                  poster="/hero/creator-editing-poster.webp"
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                >
                  <source src="/hero/creator-editing.mp4" type="video/mp4" />
                </video>
                <span className={styles.artifactHoverHint} aria-hidden="true">Ask Kairo ↗</span>
              </button>
              <span className={styles.fileName}>editing-desk.mov</span>
            </motion.div>
          </div>

          <div
            className={`${styles.mediaSlot} ${styles.afterEffectsSlot}`}
            data-active={activeTarget === 'afterEffects'}
            data-artifact="afterEffects"
          >
            <span
              ref={(element) => { targetRefs.current.afterEffects = element; }}
              className={styles.mediaAnchor}
              data-connector-anchor="afterEffects"
              aria-hidden="true"
            />
            <motion.div className={styles.mediaArtifact} {...entrance(0.46)}>
              <button
                type="button"
                className={styles.mediaFrame}
                data-active={activeTarget === 'afterEffects'}
                data-muted={activeTarget !== 'afterEffects'}
                onClick={(event) => selectTarget('afterEffects', event.detail)}
                aria-label="Ask Kairo about the After Effects workspace"
                aria-pressed={activeTarget === 'afterEffects'}
              >
                <img
                  className={styles.media}
                  src="/hero/after-effects-workspace.webp"
                  alt="After Effects timeline and panel workspace"
                />
                <span className={styles.artifactHoverHint} aria-hidden="true">Ask Kairo ↗</span>
              </button>
              <span className={styles.fileName}>after-effects.aep</span>
            </motion.div>
          </div>

          <div
            className={`${styles.mediaSlot} ${styles.blenderSlot}`}
            data-active={activeTarget === 'blender'}
            data-artifact="blender"
          >
            <span
              ref={(element) => { targetRefs.current.blender = element; }}
              className={styles.mediaAnchor}
              data-connector-anchor="blender"
              aria-hidden="true"
            />
            <motion.div className={styles.mediaArtifact} {...entrance(0.54)}>
              <button
                type="button"
                className={styles.mediaFrame}
                data-active={activeTarget === 'blender'}
                data-muted={activeTarget !== 'blender'}
                onClick={(event) => selectTarget('blender', event.detail)}
                aria-label="Ask Kairo about the Blender viewport"
                aria-pressed={activeTarget === 'blender'}
              >
                <img
                  className={styles.media}
                  src="/hero/blender-viewport.webp"
                  alt="Blender viewport with a beveled object selected and non-uniform scale visible"
                />
                <span className={styles.artifactHoverHint} aria-hidden="true">Ask Kairo ↗</span>
              </button>
              <span className={styles.fileName}>first-scene.blend</span>
            </motion.div>
          </div>

          <div
            className={`${styles.mediaSlot} ${styles.figmaSlot}`}
            data-active={activeTarget === 'figma'}
            data-artifact="figma"
          >
            <span
              ref={(element) => { targetRefs.current.figma = element; }}
              className={styles.mediaAnchor}
              data-connector-anchor="figma"
              aria-hidden="true"
            />
            <motion.div className={styles.mediaArtifact} {...entrance(0.62)}>
              <button
                type="button"
                className={styles.mediaFrame}
                data-active={activeTarget === 'figma'}
                data-muted={activeTarget !== 'figma'}
                onClick={(event) => selectTarget('figma', event.detail)}
                aria-label="Ask Kairo about the Figma layout"
                aria-pressed={activeTarget === 'figma'}
              >
                <img
                  className={styles.media}
                  src="/hero/figma-layout.webp"
                  alt="Figma Auto Layout component with a long label wrapping at a fixed width"
                />
                <span className={styles.artifactHoverHint} aria-hidden="true">Ask Kairo ↗</span>
              </button>
              <span className={styles.fileName}>dashboard.fig</span>
            </motion.div>
          </div>

          <div
            className={`${styles.mediaSlot} ${styles.davinciSlot}`}
            data-active={activeTarget === 'davinci'}
            data-artifact="davinci"
          >
            <span
              ref={(element) => { targetRefs.current.davinci = element; }}
              className={styles.mediaAnchor}
              data-connector-anchor="davinci"
              aria-hidden="true"
            />
            <motion.div className={styles.mediaArtifact} {...entrance(0.7)}>
              <button
                type="button"
                className={styles.mediaFrame}
                data-active={activeTarget === 'davinci'}
                data-muted={activeTarget !== 'davinci'}
                onClick={(event) => selectTarget('davinci', event.detail)}
                aria-label="Ask Kairo about the DaVinci node graph"
                aria-pressed={activeTarget === 'davinci'}
              >
                <img
                  className={styles.media}
                  src="/hero/davinci-nodes.webp"
                  alt="DaVinci Resolve color nodes connected in a graph"
                />
                <span className={styles.artifactHoverHint} aria-hidden="true">Ask Kairo ↗</span>
              </button>
              <span className={styles.fileName}>grade-v4.drp</span>
            </motion.div>
          </div>

          <div
            ref={noteRef}
            className={styles.kairoNoteSlot}
            data-connector-anchor="kairo-response"
          >
            <motion.aside
              className={styles.kairoNote}
              aria-label="Kairo response"
              style={{ rotate: 1.1 }}
              {...entrance(0.82)}
            >
              <div className={styles.noteHead}>
                <span className={styles.kairoGlyph} aria-hidden="true">k</span>
                <span>Kairo sees {activeReply.label}</span>
                <span key={activeTarget} className={styles.listening} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <p
                key={activeTarget}
                className={styles.replyText}
                data-streaming-reply={activeTarget}
              >
                <span className={styles.screenReaderReply} aria-live="polite" aria-atomic="true">
                  {activeReply.reply}
                </span>
                <span
                  ref={streamedReply.streamRef}
                  className={styles.replyStream}
                  data-reply-stream
                  aria-hidden="true"
                >
                  {streamedReply.initialValue}
                </span>
                {streamedReply.isStreaming ? (
                  <span className={styles.replyCaret} aria-hidden="true" />
                ) : null}
              </p>
              <span className={styles.noteHint} aria-hidden="true">
                <span className={styles.pointerHint}>Click another workspace</span>
                <span className={styles.touchHint}>Tap another workspace</span>
              </span>
            </motion.aside>
          </div>

          {currentConnector ? (
            <svg
              className={styles.inkSignal}
              data-connector-target={currentConnector.target}
              aria-hidden="true"
            >
              <motion.circle
                key={`origin-${activeTarget}-${activation.id}`}
                className={styles.connectorOrigin}
                cx={currentConnector.start.x}
                cy={currentConnector.start.y}
                r="4"
                initial={animateSequence ? { opacity: 0, scale: 0.92 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: animateSequence ? 0.16 : 0,
                  delay: animateSequence ? connectorDelay : 0,
                }}
              />
              <motion.path
                key={`path-${activeTarget}-${activation.id}`}
                d={currentConnector.path}
                initial={animateSequence ? { pathLength: 0, opacity: 0 } : false}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  strokeOpacity: animateSequence ? [0, 0.92, 0.64] : 0.64,
                }}
                transition={{
                  duration: animateSequence ? 0.4 : 0,
                  delay: animateSequence ? connectorDelay : 0,
                  ease: [0.77, 0, 0.175, 1],
                }}
                onAnimationComplete={() => {
                  if (!animateSequence) return;
                  if (sequenceIdRef.current === activation.id) {
                    setArrivedSequenceId(activation.id);
                  }
                }}
              />
              <motion.circle
                key={`dot-${activeTarget}-${activation.id}`}
                cx={currentConnector.end.x}
                cy={currentConnector.end.y}
                r="5"
                initial={animateSequence ? { opacity: 0, scale: 0.92 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...spring,
                  delay: animateSequence ? connectorDelay + 0.35 : 0,
                }}
              />
            </svg>
          ) : null}
        </div>
      </div>

      <div className={styles.lessonContinuation}>
        <WorkspacePrototype />
      </div>
    </section>
  );
}
