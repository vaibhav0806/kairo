'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { SURFACE_SPRING } from './motion';
import styles from './ControlMoment.module.css';

const steps = {
  guide: {
    title: 'Your hands stay on the tool.',
    body: 'Kairo gives one useful move instead of taking the task away.'
  },
  waiting: {
    title: 'Now you try it.',
    body: 'Kairo waits while you make the change yourself.'
  },
  verified: {
    title: 'Result verified',
    body: 'The change worked. Keep going when you are ready.'
  }
} as const;

type ControlState = keyof typeof steps;

export function ControlMoment() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<ControlState>('guide');
  const [instantTransition, setInstantTransition] = useState(false);
  const current = steps[state];
  const nextState = state === 'guide' ? 'waiting' : state === 'waiting' ? 'verified' : 'guide';
  const actionLabel = state === 'guide' ? 'Show the next move' : state === 'waiting' ? 'I tried it' : 'Start again';

  return (
    <section id="control" className={styles.control} aria-labelledby="control-title">
      <div className={styles.stage}>
        <div className={styles.copy}>
          <p>Guidance, not replacement</p>
          <motion.h2
            key={state}
            id="control-title"
            initial={reducedMotion || instantTransition ? false : { opacity: 0, transform: 'translateY(14px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={reducedMotion || instantTransition ? { duration: 0 } : SURFACE_SPRING}
          >
            {current.title}
          </motion.h2>
          <p className={styles.body}>{current.body}</p>
          <button
            type="button"
            onClick={(event) => {
              setInstantTransition(event.detail === 0);
              setState(nextState);
            }}
          >
            {actionLabel}
          </button>
        </div>

        <div className={styles.panel} data-control-state={state} data-instant={instantTransition}>
          <div className={styles.panelBar}>
            <span><i aria-hidden="true" /> Guided practice</span>
            <b>{state === 'verified' ? 'Complete' : 'In progress'}</b>
          </div>
          <div className={styles.canvas} aria-hidden="true">
            <div className={styles.titleBlock}>MOVE<br />SLOW</div>
            <div className={styles.handle}><i /><b /></div>
            <svg viewBox="0 0 420 250"><path d="M54 184C132 184 150 168 214 112s92-50 154-50" /></svg>
          </div>
          <div className={styles.guidance}>
            <span>{state === 'guide' ? 'Next move' : state === 'waiting' ? 'Kairo is waiting' : 'Kairo checked'}</span>
            <p>
              {state === 'guide' ? 'Pull the outgoing handle left.' : state === 'waiting' ? 'Make the change in your tool.' : 'The change worked.'}
            </p>
            <div className={styles.progress} aria-hidden="true"><i /><i /><i /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
