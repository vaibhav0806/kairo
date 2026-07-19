import { VioletThread } from './VioletThread';
import styles from './ContextLayers.module.css';

type ContextLayersProps = Readonly<{
  active: boolean;
}>;

export function ContextLayers({ active }: ContextLayersProps) {
  return (
    <section
      id="understand"
      className={styles.context}
      aria-labelledby="understand-title"
      data-context-active={active}
    >
      <div className={styles.heading}>
        <p>Chapter 02 / Understand</p>
        <h2 id="understand-title">You don’t have to explain the whole screen.</h2>
        <span>
          Kairo combines what you say, what it sees, and where you point—then teaches from the
          same place you’re already working.
        </span>
      </div>

      <div className={styles.layers} aria-label="The context Kairo uses">
        <VioletThread
          state={active ? 'guide' : 'wait'}
          profile="context"
          className={styles.contextThread}
          label="Kairo connects the shared context"
        />
        <article className={`${styles.layer} ${styles.said}`}>
          <span className={styles.number}>01</span>
          <p>What you said</p>
          <blockquote>“Why does this stop feel wrong?”</blockquote>
          <i aria-hidden="true">voice / live</i>
        </article>

        <article className={`${styles.layer} ${styles.visible}`}>
          <span className={styles.number}>02</span>
          <p>What is visible</p>
          <div className={styles.miniEditor} aria-hidden="true">
            <span>Speed graph</span>
            <svg viewBox="0 0 220 100">
              <path d="M10 82H210M20 12V88" />
              <path d="M20 82C74 82 104 28 198 22" />
              <circle cx="198" cy="22" r="4" />
            </svg>
          </div>
        </article>

        <article className={`${styles.layer} ${styles.pointed}`}>
          <span className={styles.number}>03</span>
          <p>What you pointed at</p>
          <div className={styles.pointMark} aria-hidden="true">
            <span>outgoing handle</span>
            <svg viewBox="0 0 220 110">
              <path d="M34 60C44 14 170 8 194 48C216 86 130 108 58 92C8 82 8 44 44 28" />
            </svg>
          </div>
        </article>

        <article className={`${styles.layer} ${styles.understood}`}>
          <span className={styles.number}>04</span>
          <p>What Kairo understood</p>
          <strong>The final keyframe loses speed too abruptly.</strong>
          <small>Ready to guide the next move</small>
        </article>
      </div>
    </section>
  );
}
