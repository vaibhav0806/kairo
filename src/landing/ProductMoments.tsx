'use client';

import { motion, useAnimationControls, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { SCENE_SPRING } from './motion';
import styles from './ProductMoments.module.css';

const moments = [
  {
    id: 'ask',
    number: '01',
    label: 'Ask naturally',
    copy: 'Ask out loud while your hands stay in the creative tool.'
  },
  {
    id: 'point',
    number: '02',
    label: 'Point together',
    copy: 'Circle an exact region. Kairo answers in the same spatial context.'
  },
  {
    id: 'learn',
    number: '03',
    label: 'Keep learning',
    copy: 'Take one next move, let Kairo verify it, then continue.'
  }
] as const;

type MomentId = (typeof moments)[number]['id'];

function AskScene({ run, instant }: { run: boolean; instant: boolean }) {
  const pathControls = useAnimationControls();
  const replyControls = useAnimationControls();

  useEffect(() => {
    if (instant) {
      pathControls.stop();
      replyControls.stop();
      return;
    }
    if (run) {
      void pathControls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
      });
      void replyControls.start({
        opacity: 1,
        transform: 'translateY(0px)',
        transition: SCENE_SPRING
      });
      return;
    }
    pathControls.stop();
    replyControls.stop();
  }, [instant, pathControls, replyControls, run]);

  return (
    <div className={`${styles.scene} ${styles.askScene}`}>
      <div className={styles.contextBar}>
        <span>Current focus</span>
        <b>Motion curve · final keyframe</b>
      </div>
      <div className={styles.voiceQuestion}>
        <span>You</span>
        <p>Why does this stop feel so abrupt?</p>
      </div>
      <svg className={styles.waveform} viewBox="0 0 560 180" aria-hidden="true">
        <motion.path
          d="M20 92h34l14-34 22 72 28-106 28 132 24-84 26 48 24-58 30 70 26-96 30 116 24-64 30 24 22-46 26 76 26-58 28 20h52"
          initial={{ pathLength: 0.16, opacity: 0.45 }}
          animate={instant ? { pathLength: 1, opacity: 1 } : pathControls}
        />
      </svg>
      <motion.div
        data-moment-response="ask"
        className={styles.kairoReply}
        initial={{ opacity: 0.64, transform: 'translateY(12px)' }}
        animate={instant ? { opacity: 1, transform: 'translateY(0px)' } : replyControls}
      >
        <span>Kairo</span>
        The speed drops all at once here. Pull this handle left to give the stop more room.
      </motion.div>
    </div>
  );
}

function PointScene({ run, instant }: { run: boolean; instant: boolean }) {
  const pathControls = useAnimationControls();
  const noteControls = useAnimationControls();

  useEffect(() => {
    if (instant) {
      pathControls.stop();
      noteControls.stop();
      return;
    }
    if (run) {
      void pathControls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.66, ease: [0.22, 1, 0.36, 1] }
      });
      void noteControls.start({
        opacity: 1,
        transform: 'translateY(0px) rotate(-2deg)',
        transition: SCENE_SPRING
      });
      return;
    }
    pathControls.stop();
    noteControls.stop();
  }, [instant, noteControls, pathControls, run]);

  return (
    <div className={`${styles.scene} ${styles.pointScene}`}>
      <div className={styles.artboard} aria-hidden="true">
        <span className={styles.artboardLabel}>Poster / frame 24</span>
        <i className={styles.posterCircle} />
        <strong>MAKE<br />SPACE</strong>
        <em>02—24</em>
      </div>
      <svg className={styles.pointInk} viewBox="0 0 500 440" aria-hidden="true">
        <motion.path
          d="M117 126C161 58 316 54 376 124c62 73 13 194-100 208-108 13-214-54-199-137 7-39 39-67 78-75"
          initial={{ pathLength: 0.08, opacity: 0.5 }}
          animate={instant ? { pathLength: 1, opacity: 1 } : pathControls}
        />
      </svg>
      <motion.div
        className={styles.anchorNote}
        initial={{ opacity: 0.62, transform: 'translateY(14px) rotate(-2deg)' }}
        animate={instant ? { opacity: 1, transform: 'translateY(0px) rotate(-2deg)' } : noteControls}
      >
        <span>↳ Kairo sees this region</span>
        This edge is clipped by the frame, not the mask.
      </motion.div>
    </div>
  );
}

function LearnScene({ run, instant }: { run: boolean; instant: boolean }) {
  const stepControls = useAnimationControls();
  const noteControls = useAnimationControls();

  useEffect(() => {
    if (instant) {
      stepControls.stop();
      noteControls.stop();
      return;
    }
    if (run) {
      void stepControls.start({ transform: 'translateX(8px)', transition: SCENE_SPRING });
      void noteControls.start({
        opacity: 1,
        transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
      });
      return;
    }
    stepControls.stop();
    noteControls.stop();
  }, [instant, noteControls, run, stepControls]);

  return (
    <div className={`${styles.scene} ${styles.learnScene}`}>
      <div className={styles.lessonHeading}>
        <span>Guided lesson</span>
        <p>Build a smooth title reveal</p>
      </div>
      <ol className={styles.lessonSteps}>
        <li className={styles.doneStep}>
          <span>01</span><p><b>Place the first keyframe</b><small>Done</small></p><i>✓</i>
        </li>
        <motion.li
          className={styles.activeStep}
          initial={{ transform: 'translateX(0px)' }}
          animate={instant ? { transform: 'translateX(8px)' } : stepControls}
        >
          <span>02</span><p><b>Adjust the outgoing handle</b><small>Kairo is waiting for you</small></p><i>→</i>
        </motion.li>
        <li>
          <span>03</span><p><b>Preview the result</b><small>Up next</small></p><i>·</i>
        </li>
      </ol>
      <motion.div
        className={styles.verifyNote}
        initial={{ opacity: 0.5 }}
        animate={instant ? { opacity: 1 } : noteControls}
      >
        Kairo won’t move on until you do.
      </motion.div>
    </div>
  );
}

export function ProductMoments() {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(stageRef, { amount: 0.35 });
  const [activeId, setActiveId] = useState<MomentId>('ask');
  const [playing, setPlaying] = useState(true);
  const [prepared, setPrepared] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [direction, setDirection] = useState(1);
  const [instantSelection, setInstantSelection] = useState(false);
  const activeIndex = moments.findIndex(({ id }) => id === activeId);
  const activeMoment = moments[activeIndex] ?? moments[0];
  const instant = Boolean(reducedMotion);
  const runScene = prepared && playing && isInView;

  const selectMoment = (nextId: MomentId, selectInstantly = false) => {
    const nextIndex = moments.findIndex(({ id }) => id === nextId);
    setDirection(nextIndex >= activeIndex ? 1 : -1);
    setInstantSelection(selectInstantly);
    setActiveId(nextId);
    setPrepared(false);
    setPlaying(false);
  };

  const moveSelection = (offset: number) => {
    const nextIndex = (activeIndex + offset + moments.length) % moments.length;
    const nextMoment = moments[nextIndex];
    if (nextMoment) selectMoment(nextMoment.id, true);
  };

  return (
    <section
      id="product-moments"
      className={styles.moments}
      aria-labelledby="moments-title"
      data-instant-selection={instantSelection}
    >
      <div className={styles.layout}>
        <div className={styles.explanation}>
          <p className={styles.eyebrow}>One shared context</p>
          <h2 id="moments-title">Ask less vaguely. Learn more directly.</h2>
          <div className={styles.tabs} role="tablist" aria-label="How Kairo helps">
            {moments.map((moment, index) => (
              <button
                key={moment.id}
                type="button"
                className={styles.tab}
                role="tab"
                id={`moment-tab-${moment.id}`}
                aria-controls="moment-stage"
                aria-selected={activeId === moment.id}
                tabIndex={activeId === moment.id ? 0 : -1}
                onClick={(event) => selectMoment(moment.id, event.detail === 0)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight') moveSelection(1);
                  if (event.key === 'ArrowLeft') moveSelection(-1);
                  if (event.key === 'Home') selectMoment(moments[0].id, true);
                  if (event.key === 'End') selectMoment(moments[moments.length - 1].id, true);
                }}
              >
                <span aria-hidden="true">{moment.number}</span>
                {moment.label}
              </button>
            ))}
          </div>
          <p className={styles.activeCopy}>{activeMoment.copy}</p>
        </div>

        <figure
          ref={stageRef}
          id="moment-stage"
          className={styles.stage}
          data-moment-state={activeId}
          aria-labelledby={`moment-tab-${activeId}`}
        >
          <figcaption className={styles.stageHeader}>
            <span><i aria-hidden="true" /> Kairo · live learning context</span>
            <button
              type="button"
              aria-label={playing ? 'Pause product moment' : 'Replay product moment'}
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                  return;
                }
                setPrepared(true);
                setReplayKey((key) => key + 1);
                setPlaying(true);
              }}
            >
              <span aria-hidden="true">{playing ? 'Ⅱ' : '↻'}</span>
            </button>
          </figcaption>
          <motion.div
            key={`${activeId}-${replayKey}`}
            className={styles.sceneWindow}
            initial={reducedMotion || instantSelection ? false : { opacity: 0, transform: `translateX(${direction * 28}px)` }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            transition={instant || instantSelection ? { duration: 0 } : SCENE_SPRING}
          >
            {activeId === 'ask' ? <AskScene run={runScene} instant={instant} /> : null}
            {activeId === 'point' ? <PointScene run={runScene} instant={instant} /> : null}
            {activeId === 'learn' ? <LearnScene run={runScene} instant={instant} /> : null}
          </motion.div>
        </figure>
      </div>
    </section>
  );
}
