'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
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

function AskScene({ animate }: { animate: boolean }) {
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
          initial={false}
          animate={{ pathLength: animate ? 1 : 0.16, opacity: animate ? 1 : 0.45 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <motion.div
        className={styles.kairoReply}
        initial={false}
        animate={{
          opacity: animate ? 1 : 0.64,
          transform: animate ? 'translateY(0px)' : 'translateY(12px)'
        }}
        transition={SCENE_SPRING}
      >
        <span>Kairo</span>
        The speed drops all at once here. Pull this handle left to give the stop more room.
      </motion.div>
    </div>
  );
}

function PointScene({ animate }: { animate: boolean }) {
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
          initial={false}
          animate={{ pathLength: animate ? 1 : 0.08, opacity: animate ? 1 : 0.5 }}
          transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <motion.div
        className={styles.anchorNote}
        initial={false}
        animate={{
          opacity: animate ? 1 : 0.62,
          transform: animate ? 'translateY(0px) rotate(-2deg)' : 'translateY(14px) rotate(-2deg)'
        }}
        transition={SCENE_SPRING}
      >
        <span>↳ Kairo sees this region</span>
        This edge is clipped by the frame, not the mask.
      </motion.div>
    </div>
  );
}

function LearnScene({ animate }: { animate: boolean }) {
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
          initial={false}
          animate={{
            transform: animate ? 'translateX(8px)' : 'translateX(0px)',
            borderColor: animate ? '#665cff' : 'rgba(255, 255, 255, 0.16)'
          }}
          transition={SCENE_SPRING}
        >
          <span>02</span><p><b>Adjust the outgoing handle</b><small>Kairo is waiting for you</small></p><i>→</i>
        </motion.li>
        <li>
          <span>03</span><p><b>Preview the result</b><small>Up next</small></p><i>·</i>
        </li>
      </ol>
      <motion.div
        className={styles.verifyNote}
        initial={false}
        animate={{ opacity: animate ? 1 : 0.5 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
  const [replayKey, setReplayKey] = useState(0);
  const [direction, setDirection] = useState(1);
  const activeIndex = moments.findIndex(({ id }) => id === activeId);
  const activeMoment = moments[activeIndex] ?? moments[0];
  const shouldAnimate = !reducedMotion && isInView && playing;

  const selectMoment = (nextId: MomentId) => {
    const nextIndex = moments.findIndex(({ id }) => id === nextId);
    setDirection(nextIndex >= activeIndex ? 1 : -1);
    setActiveId(nextId);
    setPlaying(false);
  };

  const moveSelection = (offset: number) => {
    const nextIndex = (activeIndex + offset + moments.length) % moments.length;
    const nextMoment = moments[nextIndex];
    if (nextMoment) selectMoment(nextMoment.id);
  };

  return (
    <section id="product-moments" className={styles.moments} aria-labelledby="moments-title">
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
                onClick={() => selectMoment(moment.id)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight') moveSelection(1);
                  if (event.key === 'ArrowLeft') moveSelection(-1);
                  if (event.key === 'Home') selectMoment(moments[0].id);
                  if (event.key === 'End') selectMoment(moments[moments.length - 1].id);
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
            initial={reducedMotion ? false : { opacity: 0, transform: `translateX(${direction * 28}px)` }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            transition={SCENE_SPRING}
          >
            {activeId === 'ask' ? <AskScene animate={shouldAnimate} /> : null}
            {activeId === 'point' ? <PointScene animate={shouldAnimate} /> : null}
            {activeId === 'learn' ? <LearnScene animate={shouldAnimate} /> : null}
          </motion.div>
        </figure>
      </div>
    </section>
  );
}
