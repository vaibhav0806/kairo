'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useReducer, useState } from 'react';
import {
  GUIDED_INITIAL_STATE,
  GUIDED_MASK_MAX,
  GUIDED_MASK_MIN,
  guidedLessonReducer
} from './guidedLessonModel';
import { VioletThread } from './VioletThread';
import styles from './GuidedLesson.module.css';

export function GuidedLesson() {
  const motionReduced = useReducedMotion();
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [state, dispatch] = useReducer(guidedLessonReducer, GUIDED_INITIAL_STATE);
  const reducedMotion = Boolean(motionReduced || systemReducedMotion);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setSystemReducedMotion(query.matches);
    syncPreference();
    query.addEventListener('change', syncPreference);
    return () => query.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) dispatch({ type: 'SHOW_STATIC_STORYBOARD' });
  }, [reducedMotion]);

  const commitMaskEdge = (value: number) => {
    dispatch({ type: 'MASK_COMMITTED', value });
  };

  const threadState = state.phase === 'verified' ? 'verify' : state.phase === 'waiting' ? 'wait' : 'guide';

  return (
    <section
      id="learn"
      className={styles.lesson}
      aria-labelledby="learn-title"
      data-guided-phase={state.phase}
    >
      <div className={styles.heading}>
        <p>Chapter 03 / Learn</p>
        <h2 id="learn-title">Guidance that waits for you.</h2>
        <span>
          Kairo gives one move, watches you try it, and checks the result before continuing.
          Your hands stay on the tool.
        </span>
      </div>

      <div className={styles.workspace}>
        <div className={styles.workspaceBar} aria-hidden="true">
          <span>Guided lesson / mask-reveal</span>
          <b>FRAME 018</b>
          <em>{state.maskEdge.toString().padStart(3, '0')}%</em>
        </div>

        <ol className={styles.progress} aria-label="Guided lesson progress">
          <li data-active={state.phase === 'guide'}><span>01</span><b>Guide</b></li>
          <li data-active={state.phase === 'waiting'}><span>02</span><b>Your turn</b></li>
          <li data-active={state.phase === 'verified'}><span>03</span><b>Verified</b></li>
        </ol>

        <div className={styles.canvas} aria-label="A title reveal with an adjustable mask edge">
          <span className={styles.canvasLabel}>TITLE REVEAL / SAFE GUIDE</span>
          <div className={styles.poster} aria-hidden="true">
            <strong>LEAVE<br />ROOM</strong>
            <i className={styles.guideLine} />
            <div
              className={styles.reveal}
              style={{ clipPath: `inset(0 ${100 - state.maskEdge}% 0 0)` }}
            >
              <strong>LEAVE<br />ROOM</strong>
            </div>
            <span
              className={styles.maskEdge}
              style={{ transform: `translateX(${state.maskEdge - 100}%)` }}
            />
          </div>
        </div>

        <div className={styles.instruction} aria-live="polite">
          <span>Kairo / next move</span>
          {state.phase === 'guide' ? <p>Move the mask edge to the final guide.</p> : null}
          {state.phase === 'waiting' ? <p>Kairo is waiting for your move.</p> : null}
          {state.phase === 'verified' ? <p role="status">Kairo verified the mask edge.</p> : null}
        </div>

        <label className={styles.control}>
          <span>Move the mask edge</span>
          <input
            type="range"
            min={GUIDED_MASK_MIN}
            max={GUIDED_MASK_MAX}
            step="1"
            value={state.maskEdge}
            disabled={state.phase === 'verified'}
            aria-label="Move the mask edge"
            onChange={(event) => dispatch({ type: 'MASK_CHANGED', value: Number(event.target.value) })}
            onPointerUp={(event) => commitMaskEdge(Number(event.currentTarget.value))}
            onPointerCancel={() => dispatch({ type: 'MASK_CANCELLED' })}
            onKeyUp={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                commitMaskEdge(Number(event.currentTarget.value));
              }
            }}
          />
        </label>

        <VioletThread
          state={threadState}
          profile="lesson"
          className={styles.thread}
          label="Kairo guides the mask edge"
        />

        {state.phase === 'verified' ? (
          <div className={styles.completed}>
            <a href="#travel">Continue to creative tools</a>
            <button type="button" onClick={() => dispatch({ type: 'RESET' })}>Try again</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
