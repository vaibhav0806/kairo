import { useEffect, useRef } from 'react';
import { Hero } from './Hero';
import { LearningSequence } from './LearningSequence';
import { VisualField } from './VisualField';
import { TrustWaitlist, validateWaitlistEmail } from './TrustWaitlist';
import styles from './LandingPage.module.css';

export { validateWaitlistEmail };

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (
      !page
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)
    ) return undefined;

    page.dataset.motionReady = 'true';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) (entry.target as HTMLElement).dataset.revealed = 'true';
      });
    }, { threshold: 0.14 });
    page.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef} className={styles.page} data-field-notes>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#how-it-works">How it works</a>
          <a href="#tools">Tools</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className={styles.headerCta} href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
      </header>
      <main id="top">
        <Hero />
        <LearningSequence />
        <VisualField />
        <TrustWaitlist />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <p>Learn by doing.</p>
          <nav aria-label="Footer">
            <a href="#top"><span>01</span> Home</a>
            <a href="#how-it-works"><span>02</span> How it works</a>
            <a href="#access"><span>03</span> Join the alpha</a>
          </nav>
        </div>
        <strong data-footer-wordmark aria-label="Kairo">kairo</strong>
      </footer>
    </div>
  );
}
