import { useEffect, useRef } from 'react';
import { Hero } from './Hero';
import { LearningSequence } from './LearningSequence';
import { VisualField } from './VisualField';
import { TrustWaitlist, validateWaitlistEmail } from './TrustWaitlist';
import styles from './LandingPage.module.css';

export { validateWaitlistEmail };

function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}

const navItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Tools', href: '#tools' },
  { label: 'Trust', href: '#trust' },
];

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealTargets = page.querySelectorAll<HTMLElement>('[data-reveal], [data-tool-reveal]');
    const ambientStages = page.querySelectorAll<HTMLElement>('[data-ambient-stage]');

    const syncMotionPreference = () => {
      page.dataset.reducedMotion = String(reducedMotion.matches);
      if (reducedMotion.matches) delete page.dataset.motionReady;
      else page.dataset.motionReady = 'true';
    };
    const syncPageVisibility = () => {
      page.dataset.pageVisible = String(!document.hidden);
    };

    syncMotionPreference();
    syncPageVisibility();
    reducedMotion.addEventListener('change', syncMotionPreference);
    document.addEventListener('visibilitychange', syncPageVisibility);

    let revealObserver: IntersectionObserver | null = null;
    let ambientObserver: IntersectionObserver | null = null;
    const Observer = window.IntersectionObserver;

    if (typeof Observer === 'function') {
      revealObserver = new Observer((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) (entry.target as HTMLElement).dataset.revealed = 'true';
        });
      }, { threshold: 0.14 });
      revealTargets.forEach((element) => revealObserver?.observe(element));

      ambientObserver = new Observer((entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.ambientActive = String(entry.isIntersecting);
        });
      }, { threshold: 0.08 });
      ambientStages.forEach((element) => ambientObserver?.observe(element));
    } else {
      revealTargets.forEach((element) => {
        element.dataset.revealed = 'true';
      });
    }

    return () => {
      revealObserver?.disconnect();
      ambientObserver?.disconnect();
      reducedMotion.removeEventListener('change', syncMotionPreference);
      document.removeEventListener('visibilitychange', syncPageVisibility);
    };
  }, []);

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return undefined;

    let pendingFrame: number | null = window.requestAnimationFrame(() => {
      pendingFrame = null;
      const target = document.getElementById(targetId);
      if (!target) return;

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      root.style.scrollBehavior = previousScrollBehavior;
    });

    return () => {
      if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.page} data-field-notes>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} aria-label={item.label}>
              <span className={styles.navLabelWindow} aria-hidden="true">
                <span className={styles.navLabelTrack}>
                  <span className={styles.navLabel} data-nav-label>{item.label}</span>
                  <span className={styles.navLabel} data-nav-label>{item.label}</span>
                </span>
              </span>
            </a>
          ))}
        </nav>
        <a className={styles.headerCta} href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
      </header>
      <main id="top">
        <Hero />
        <LearningSequence />
        <VisualField />
        <TrustWaitlist />
      </main>
      <footer className={styles.footer} data-ambient-stage>
        <img
          className={styles.footerWildflower}
          data-footer-wildflower
          src={asset('field-notes/footer-wildflower.webp')}
          alt=""
          width="2048"
          height="2048"
          loading="lazy"
          decoding="async"
        />
        <div className={styles.footerTop}>
          <p>Learn by doing.</p>
        </div>
        <strong data-footer-wordmark aria-label="Kairo">kairo</strong>
      </footer>
    </div>
  );
}
