'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { SURFACE_SPRING } from '../motion';
import {
  INITIAL_NOTICE_STATE,
  NOTICE_HANDLE_MAX,
  NOTICE_HANDLE_MIN,
  noticeLessonReducer,
  threadStateForNoticePhase
} from './noticeLessonModel';
import { VioletThread } from './VioletThread';
import styles from './NoticeLesson.module.css';

type NoticeLessonProps = Readonly<{
  onVerified: () => void;
  traveling?: boolean;
}>;

export function NoticeLesson({ onVerified, traveling = false }: NoticeLessonProps) {
  const motionReduced = useReducedMotion();
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [state, dispatch] = useReducer(noticeLessonReducer, INITIAL_NOTICE_STATE);
  const [openingRun, setOpeningRun] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const verifiedRef = useRef(false);
  const reducedMotion = Boolean(motionReduced || systemReducedMotion);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setSystemReducedMotion(query.matches);
    syncPreference();
    query.addEventListener('change', syncPreference);
    return () => query.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: 'SHOW_STATIC_STORYBOARD' });
      return undefined;
    }
    if (!pageVisible) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'PREVIEW_FINISHED' }), 900);
    return () => window.clearTimeout(timer);
  }, [openingRun, pageVisible, reducedMotion]);

  useEffect(() => {
    if (state.phase !== 'attached' || !pageVisible) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'GUIDANCE_READY' }), 160);
    return () => window.clearTimeout(timer);
  }, [pageVisible, state.phase]);

  useEffect(() => {
    if (state.phase !== 'verified' || verifiedRef.current) return;
    verifiedRef.current = true;
    onVerified();
  }, [onVerified, state.phase]);

  const commitHandle = (value: number) => {
    dispatch({ type: 'HANDLE_COMMITTED', value });
  };

  const resetLesson = () => {
    verifiedRef.current = false;
    dispatch({ type: 'RESET' });
    setOpeningRun((run) => run + 1);
  };

  return (
    <div className={styles.lesson} data-notice-phase={state.phase}>
      <div className={styles.editorBar} aria-hidden="true">
        <span>Composition / title-study</span>
        <b>00:08:12</b>
        <em>100%</em>
      </div>

      <div className={styles.toolRail} aria-hidden="true">
        <i>↖</i><i>◇</i><i>⌁</i><i>T</i><i>○</i>
      </div>

      <div className={styles.preview} role="img" aria-label="A title animation with an abrupt stop">
        <span className={styles.frameLabel}>FINAL FRAME / 024</span>
        <motion.strong
          initial={reducedMotion ? false : { transform: 'translateX(-22%)' }}
          animate={{ transform: `translateX(${(state.handle - 72) * 0.6}px)` }}
          transition={reducedMotion || state.phase === 'waiting'
            ? { duration: 0 }
            : { duration: 0.62, ease: [0.2, 0.8, 0.2, 1] }}
        >
          MAKE IT<br />FEEL NATURAL
        </motion.strong>
        <span className={styles.selection} aria-hidden="true"><i /><i /><i /><i /></span>
      </div>

      <div className={styles.graph}>
        <span className={styles.graphLabel}>SPEED GRAPH / OUTGOING</span>
        <span className={styles.graphValue} aria-hidden="true">{state.handle.toString().padStart(3, '0')}</span>
        <svg viewBox="0 0 520 220" aria-hidden="true">
          <path className={styles.gridLine} d="M28 182H492M28 122H492M28 62H492" />
          <path className={styles.axis} d="M42 28V188H496" />
          <motion.path
            className={styles.curve}
            d={`M42 182C${122 + state.handle} 182 ${290 + state.handle} 42 476 42`}
            animate={{ d: `M42 182C${122 + state.handle} 182 ${290 + state.handle} 42 476 42` }}
            transition={reducedMotion || state.phase === 'waiting' ? { duration: 0 } : SURFACE_SPRING}
          />
          <path className={styles.handleLine} d={`M476 42L${382 - state.handle * 0.42} 42`} />
          <circle className={styles.keyframe} cx="476" cy="42" r="6" />
          <circle className={styles.handlePoint} cx={382 - state.handle * 0.42} cy="42" r="7" />
        </svg>

        <button
          type="button"
          className={styles.problemTarget}
          aria-label="Select the abrupt stop"
          onClick={() => dispatch({ type: 'TARGET_SELECTED' })}
        >
          <span aria-hidden="true">problem area</span>
        </button>

        <label className={styles.handleControl}>
          <span>Adjust the outgoing easing handle</span>
          <input
            type="range"
            min={NOTICE_HANDLE_MIN}
            max={NOTICE_HANDLE_MAX}
            step="1"
            value={state.handle}
            disabled={
              state.phase === 'preview' ||
              state.phase === 'noticed' ||
              state.phase === 'attached' ||
              state.phase === 'verified'
            }
            aria-label="Adjust the outgoing easing handle"
            onChange={(event) => dispatch({ type: 'HANDLE_CHANGED', value: Number(event.target.value) })}
            onPointerUp={(event) => commitHandle(Number(event.currentTarget.value))}
            onPointerCancel={() => dispatch({ type: 'HANDLE_CANCELLED' })}
            onKeyUp={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                commitHandle(Number(event.currentTarget.value));
              }
            }}
          />
        </label>
      </div>

      <VioletThread state={traveling ? 'travel' : threadStateForNoticePhase(state.phase)} />

      <div className={styles.kairoNote} aria-live="polite">
        {state.phase === 'noticed' ? <p>That stop feels wrong, doesn’t it?</p> : null}
        {state.phase === 'guiding' ? <p>Give the stop more room. Pull this handle left.</p> : null}
        {state.phase === 'waiting' ? <p>Kairo is waiting for your adjustment.</p> : null}
        {state.phase === 'verified' ? <p role="status">Result verified. That stop has room now.</p> : null}
      </div>

      {state.phase === 'verified' ? (
        <button type="button" className={styles.reset} onClick={resetLesson}>
          Reset lesson
        </button>
      ) : null}
    </div>
  );
}
