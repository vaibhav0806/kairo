'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HeroTarget, HeroTargetId, StrokePoint } from './heroInk';
import { recognizeHeroTarget, strokeToSvgPath } from './heroInk';
import { DIRECT_SPRING, SURFACE_SPRING } from './motion';
import styles from './HeroCanvas.module.css';

type HeroState = 'idle' | 'drawing' | 'responding';

const VIEWBOX_WIDTH = 760;
const VIEWBOX_HEIGHT = 680;

const targets: readonly HeroTarget[] = [
  { id: 'layers', x: 58, y: 112, width: 264, height: 224 },
  { id: 'nodes', x: 408, y: 126, width: 286, height: 248 },
  { id: 'timeline', x: 76, y: 438, width: 548, height: 142 }
];

const reactions = {
  timeline: 'That jump is in the easing. Let’s smooth the stop.',
  layers: 'This layer is driving the motion you’re seeing.',
  nodes: 'The signal breaks here. Follow this connection first.'
} as const;

function loopAround(target: HeroTarget): StrokePoint[] {
  const padding = 18;
  const left = target.x - padding;
  const top = target.y - padding;
  const right = target.x + target.width + padding;
  const bottom = target.y + target.height + padding;
  const middleX = (left + right) / 2;
  const middleY = (top + bottom) / 2;

  return [
    [left, middleY],
    [left + 10, top + 10],
    [middleX, top],
    [right - 10, top + 10],
    [right, middleY],
    [right - 10, bottom - 10],
    [middleX, bottom],
    [left + 10, bottom - 10],
    [left, middleY]
  ];
}

function pointInViewBox(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  surface: HTMLDivElement
): StrokePoint {
  const bounds = surface.getBoundingClientRect();
  const width = bounds.width || VIEWBOX_WIDTH;
  const height = bounds.height || VIEWBOX_HEIGHT;

  return [
    ((event.clientX - bounds.left) / width) * VIEWBOX_WIDTH,
    ((event.clientY - bounds.top) / height) * VIEWBOX_HEIGHT,
    event instanceof PointerEvent ? event.pressure : 0.5
  ];
}

export function HeroCanvas() {
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const activePointsRef = useRef<StrokePoint[]>([]);
  const activePointerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idlePlayedRef = useRef(false);
  const [heroState, setHeroState] = useState<HeroState>('idle');
  const [activeTarget, setActiveTarget] = useState<HeroTargetId | null>(null);
  const [completedStroke, setCompletedStroke] = useState<StrokePoint[]>([]);
  const [drawEnabled, setDrawEnabled] = useState(false);

  const completedPath = useMemo(() => strokeToSvgPath(completedStroke), [completedStroke]);

  const cancelIdle = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || reduceMotion) return undefined;

    let inView = false;

    const scheduleIdleStroke = () => {
      cancelIdle();
      if (idlePlayedRef.current || !inView || document.hidden) return;

      idleTimerRef.current = setTimeout(() => {
        setCompletedStroke([
          [238, 74],
          [292, 82],
          [348, 78],
          [404, 84],
          [458, 76]
        ]);
        idlePlayedRef.current = true;
        idleTimerRef.current = null;
      }, 1800);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      scheduleIdleStroke();
    }, { threshold: 0.2 });
    const handleVisibility = () => scheduleIdleStroke();

    observer.observe(surface);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelIdle();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [cancelIdle, reduceMotion]);

  const activateTarget = useCallback(
    (targetId: HeroTargetId) => {
      cancelIdle();
      idlePlayedRef.current = true;
      const target = targets.find(({ id }) => id === targetId);
      setCompletedStroke(target ? loopAround(target) : []);
      setActiveTarget(targetId);
      setHeroState('responding');
    },
    [cancelIdle]
  );

  const clearResponse = useCallback(() => {
    cancelIdle();
    activePointsRef.current = [];
    if (activePathRef.current) activePathRef.current.setAttribute('d', '');
    setCompletedStroke([]);
    setActiveTarget(null);
    setHeroState('idle');
  }, [cancelIdle]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button')) return;
    if (event.pointerType === 'touch' && !drawEnabled) return;

    cancelIdle();
    idlePlayedRef.current = true;
    activePointerRef.current = event.pointerId;
    activePointsRef.current = [pointInViewBox(event.nativeEvent, event.currentTarget)];
    setCompletedStroke([]);
    setActiveTarget(null);
    setHeroState('drawing');
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (drawEnabled) event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return;
    if (drawEnabled) event.preventDefault();

    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
    activePointsRef.current.push(
      ...coalesced.map((sample) => pointInViewBox(sample, event.currentTarget))
    );
    activePathRef.current?.setAttribute('d', strokeToSvgPath(activePointsRef.current));
  };

  const finishDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return;

    const points = [...activePointsRef.current];
    const targetId = recognizeHeroTarget(points, targets);
    activePointerRef.current = null;
    activePointsRef.current = [];
    activePathRef.current?.setAttribute('d', '');
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setCompletedStroke(points);
    setActiveTarget(targetId);
    setHeroState(targetId ? 'responding' : 'idle');
  };

  const cancelDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;
    activePointsRef.current = [];
    activePathRef.current?.setAttribute('d', '');
    setHeroState('idle');
  };

  return (
    <div
      ref={surfaceRef}
      className={styles.canvas}
      data-hero-state={heroState}
      data-draw-enabled={drawEnabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrawing}
      onPointerCancel={cancelDrawing}
    >
      <div className={styles.prompt}>
        <span aria-hidden="true">↳</span> Circle what has you stuck
      </div>

      <motion.button
        type="button"
        className={`${styles.target} ${styles.layers}`}
        aria-label="Ask Kairo about the layers"
        data-hero-target="layers"
        animate={{
          transform: activeTarget === 'layers' ? 'translateY(-8px) rotate(-2deg)' : 'translateY(0px) rotate(-2deg)'
        }}
        transition={SURFACE_SPRING}
        onClick={() => activateTarget('layers')}
      >
        <span className={styles.fragmentLabel}>Layers</span>
        <span className={styles.layerRow}><i className={styles.violetSwatch} />Headline</span>
        <span className={styles.layerRow}><i className={styles.coralSwatch} />Shape 02</span>
        <span className={styles.layerRow}><i className={styles.limeSwatch} />Background</span>
      </motion.button>

      <motion.button
        type="button"
        className={`${styles.target} ${styles.nodes}`}
        aria-label="Ask Kairo about the nodes"
        data-hero-target="nodes"
        animate={{
          transform: activeTarget === 'nodes' ? 'translateY(-8px) rotate(1.5deg)' : 'translateY(0px) rotate(1.5deg)'
        }}
        transition={SURFACE_SPRING}
        onClick={() => activateTarget('nodes')}
      >
        <span className={styles.fragmentLabel}>Signal flow</span>
        <svg viewBox="0 0 240 150" aria-hidden="true">
          <path d="M54 48C92 48 88 108 126 108S160 56 198 56" />
          <circle cx="48" cy="48" r="18" />
          <circle cx="126" cy="108" r="18" />
          <circle cx="204" cy="56" r="18" />
        </svg>
        <span className={styles.nodeLabels} aria-hidden="true"><i>Input</i><i>Mix</i><i>View</i></span>
      </motion.button>

      <motion.button
        type="button"
        className={`${styles.target} ${styles.timeline}`}
        aria-label="Ask Kairo about the timeline"
        data-hero-target="timeline"
        animate={{
          transform: activeTarget === 'timeline' ? 'translateY(-8px) rotate(-1deg)' : 'translateY(0px) rotate(-1deg)'
        }}
        transition={SURFACE_SPRING}
        onClick={() => activateTarget('timeline')}
      >
        <span className={styles.timelineHead}><b>00:08:12</b><i>Timeline</i></span>
        <span className={styles.timelineTrack} aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
          <b /><em /><strong />
        </span>
      </motion.button>

      <svg className={styles.inkLayer} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true">
        <path ref={activePathRef} className={styles.ink} />
        <motion.path
          className={styles.ink}
          d={completedPath}
          initial={false}
          animate={{ opacity: completedPath ? 1 : 0 }}
          transition={DIRECT_SPRING}
        />
      </svg>

      {activeTarget ? (
        <motion.div
          key={activeTarget}
          className={styles.response}
          role="status"
          initial={{ opacity: 0, transform: 'translateY(14px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={DIRECT_SPRING}
        >
          <span>Kairo noticed</span>
          <p>{reactions[activeTarget]}</p>
        </motion.div>
      ) : null}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.drawToggle}
          aria-pressed={drawEnabled}
          onClick={() => {
            cancelIdle();
            setDrawEnabled((enabled) => !enabled);
          }}
        >
          <span aria-hidden="true">✎</span> {drawEnabled ? 'Drawing on' : 'Draw to ask'}
        </button>
        {completedStroke.length > 0 || activeTarget ? (
          <button type="button" className={styles.clearButton} onClick={clearResponse}>
            Clear Kairo drawing
          </button>
        ) : null}
      </div>
    </div>
  );
}
