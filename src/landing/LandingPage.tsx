import { AlphaInvitation } from './AlphaInvitation';
import { FooterMark } from './FooterMark';
import { HeaderAction } from './HeaderAction';
import { HeaderNavigation } from './HeaderNavigation';
import { Hero } from './Hero';
import { GuidedLesson } from './violet-thread/GuidedLesson';
import { ToolTravel } from './violet-thread/ToolTravel';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandLockup}>
          <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        </div>
        <HeaderNavigation />
        <HeaderAction />
      </header>
      <main>
        <Hero />
        <GuidedLesson />
        <ToolTravel />
        <AlphaInvitation />
      </main>
      <footer className={styles.footer}>
        <FooterMark />
      </footer>
    </div>
  );
}
