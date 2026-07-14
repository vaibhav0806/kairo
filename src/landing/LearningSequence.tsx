import styles from './LearningSequence.module.css';

const chapters = [
  ['ask', 'Ask'],
  ['point', 'Point'],
  ['try', 'Try'],
  ['checked', 'Check']
] as const;

export function LearningSequence() {
  return (
    <section id="how-it-works" className={styles.sequence} aria-labelledby="sequence-title" data-reveal>
      <h2 id="sequence-title">One move at a time.</h2>
      <div data-learning-workspace data-workspace-state="ask">Kairo stays with the work.</div>
      <ol>
        {chapters.map(([id, label], index) => (
          <li key={id} data-lesson-chapter={id} data-chapter-index={index}>{label}</li>
        ))}
      </ol>
    </section>
  );
}
