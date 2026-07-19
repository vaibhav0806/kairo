import { AlphaInvitation } from './AlphaInvitation';
import { FooterMark } from './FooterMark';
import { Hero } from './Hero';
import { GuidedLesson } from './violet-thread/GuidedLesson';
import { ToolTravel } from './violet-thread/ToolTravel';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#understand">How Kairo sees</a>
          <a href="#learn">Guided lesson</a>
          <a href="#travel">Creative tools</a>
        </nav>
        <a className={styles.headerCta} href="#access">Request alpha access</a>
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
