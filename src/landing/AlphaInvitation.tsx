import { WaitlistForm } from './WaitlistForm';
import styles from './AlphaInvitation.module.css';

export function AlphaInvitation() {
  return (
    <section id="access" className={styles.access} aria-labelledby="access-title">
      <div className={styles.copy}>
        <p>Early access</p>
        <h2 id="access-title">Bring the thing you’ve been meaning to learn.</h2>
        <span>
          Kairo is early, and we’re building it with creative learners. Your alpha feedback will
          help decide which tools Kairo learns deeply first.
        </span>
      </div>
      <div className={styles.formShell}>
        <div className={styles.founderNote}>
          <span>From the founder</span>
          <p>Tell me what you’re learning and where you get stuck. That’s what we’ll build around.</p>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
}
