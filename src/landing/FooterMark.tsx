'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import styles from './ControlMoment.module.css';

export function FooterMark() {
  const reducedMotion = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const complete = Boolean(reducedMotion) || drawn;

  return (
    <button
      type="button"
      className={styles.footerMark}
      aria-label="Draw Kairo footer mark"
      onClick={() => setDrawn(true)}
    >
      <span className={styles.footerWordmark}>
        kairo
        <svg viewBox="0 0 420 170" aria-hidden="true">
          <motion.path
            d="M34 88C42 26 160 12 270 26c104 13 142 82 78 120-68 40-235 26-291-25-33-30-4-74 45-88"
            initial={false}
            animate={{ pathLength: complete ? 1 : 0, opacity: complete ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </span>
      {complete ? <span className={styles.footerPhrase}>go make something.</span> : null}
    </button>
  );
}
