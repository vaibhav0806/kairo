'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SCENE_SPRING } from '../motion';
import type { VioletThreadState } from './noticeLesson';
import styles from './VioletThread.module.css';

const THREAD_PATHS: Record<VioletThreadState, string> = {
  dormant: 'M24 64C24 64 24 64 24 64',
  notice: 'M24 64C138 18 236 32 330 104C370 134 402 142 452 132',
  attach: 'M24 64C138 18 244 32 334 110C370 142 406 152 462 142',
  guide: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  wait: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  verify: 'M24 64C138 18 250 34 334 114C380 158 420 176 486 138',
  travel: 'M24 64C172 20 284 52 382 150C430 198 468 230 520 286'
};

type VioletThreadProps = Readonly<{
  state: VioletThreadState;
  className?: string;
  label?: string;
}>;

export function VioletThread({ state, className, label = 'Kairo guidance' }: VioletThreadProps) {
  const reducedMotion = useReducedMotion();
  const verified = state === 'verify' || state === 'travel';

  return (
    <svg
      className={[styles.thread, className].filter(Boolean).join(' ')}
      viewBox="0 0 544 320"
      role="img"
      aria-label={label}
      data-violet-thread
      data-thread-state={state}
      data-thread-verified={verified}
    >
      <motion.path
        d={THREAD_PATHS[state]}
        initial={reducedMotion ? false : { pathLength: state === 'dormant' ? 0 : 0.08, opacity: 0 }}
        animate={{
          d: THREAD_PATHS[state],
          pathLength: state === 'dormant' ? 0 : 1,
          opacity: state === 'dormant' ? 0 : 1
        }}
        transition={reducedMotion ? { duration: 0 } : SCENE_SPRING}
      />
    </svg>
  );
}
