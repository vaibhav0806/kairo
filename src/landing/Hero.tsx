import { HeroCanvas } from './HeroCanvas';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Kairo · your creative learning layer</p>
        <h1 id="landing-title">Learn any creative tool without leaving it.</h1>
        <p className={styles.intro}>
          Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryAction} href="#access">
            Request alpha access
          </a>
          <a className={styles.secondaryAction} href="#product-moments">
            See how Kairo helps <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <HeroCanvas />
    </section>
  );
}
