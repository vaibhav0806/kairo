import { WorkspacePrototype } from './violet-thread/WorkspacePrototype';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.copy}>
        <div>
          <p className={styles.eyebrow}>Kairo / a tutor that can see where you’re stuck</p>
          <h1 id="landing-title">Stuck? Point at it.</h1>
        </div>
        <div className={styles.introBlock}>
          <p className={styles.intro}>
            Learn After Effects, DaVinci, Blender, or Figma while you work. Ask out loud, point
            on-screen, and let Kairo guide the next move—not do it for you.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#access">
              Request alpha access
            </a>
            <a className={styles.secondaryAction} href="#understand">
              Follow the lesson <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
      <WorkspacePrototype />
    </section>
  );
}
