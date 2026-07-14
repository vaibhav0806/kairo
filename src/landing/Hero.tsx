import { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';

function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => {
      if (reducedMotion.matches) delete hero.dataset.motionReady;
      else hero.dataset.motionReady = 'true';
    };
    const syncPageVisibility = () => {
      hero.dataset.pageVisible = String(!document.hidden);
    };

    syncMotionPreference();
    syncPageVisibility();
    reducedMotion.addEventListener('change', syncMotionPreference);
    document.addEventListener('visibilitychange', syncPageVisibility);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry) hero.dataset.demoActive = String(entry.isIntersecting);
      }, { threshold: 0.08 });
      const stage = hero.querySelector('[data-hero-stage]');
      if (stage) observer.observe(stage);
    } else {
      hero.dataset.demoActive = 'true';
    }

    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener('change', syncMotionPreference);
      document.removeEventListener('visibilitychange', syncPageVisibility);
      delete hero.dataset.motionReady;
      delete hero.dataset.demoActive;
      delete hero.dataset.pageVisible;
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-labelledby="landing-title"
      data-hero-environment
      data-demo-paused={paused}
      data-reveal
    >
      <div className={styles.copy}>
        <p className={styles.kicker}>Help, right where you are learning</p>
        <h1 id="landing-title">Turn stuck into your next move.</h1>
        <p>Ask out loud or point to the confusing bit. Kairo shows one step and stays while you try it.</p>
        <a href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
      </div>

      <div className={styles.environment}>
        <picture className={styles.fieldPhoto}>
          <source media="(max-width: 760px)" srcSet={asset('field-notes/field-hero-mobile.webp')} />
          <img
            src={asset('field-notes/field-hero.webp')}
            alt="A creative workbench with paper and drawing tools"
            width="2200"
            height="1467"
            fetchPriority="high"
          />
        </picture>
        <img
          className={styles.meadowEdge}
          src={asset('field-notes/meadow-edge.webp')}
          alt=""
          width="2200"
          height="1467"
          aria-hidden="true"
        />

        <figure className={styles.productWindow} data-hero-stage>
          <figcaption>
            <span><i aria-hidden="true" /> Live lesson</span>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
            >
              {paused ? 'Play lesson' : 'Pause lesson'}
            </button>
          </figcaption>

          <div className={styles.blenderViewport}>
            <img
              src={asset('kairo-blender-preview.webp')}
              alt="Blender with Kairo guiding the selected cube"
              width="3560"
              height="1972"
            />
            <div className={styles.question}>
              <span>You asked</span>
              How do I animate this?
            </div>
            <svg className={styles.annotation} viewBox="0 0 240 180" aria-hidden="true">
              <path d="M18 102C24 36 92 16 164 30c60 12 78 78 26 110-50 31-146 21-172-38Z" />
            </svg>
            <div className={styles.target} aria-hidden="true">
              <span>Cube found</span>
              <i /><i /><i /><i />
            </div>
            <div className={styles.instruction}>
              <span>Next move</span>
              Press <kbd>I</kbd>, then choose <b>Location</b>.
            </div>
          </div>

          <ol className={styles.mobileTranscript} aria-label="Mobile lesson summary">
            <li><span>Ask</span><p>How do I animate this cube?</p></li>
            <li><span>Point</span><p>Press I, then choose Location.</p></li>
            <li><span>Checked</span><p>Cube selected. Ready for the next move.</p></li>
          </ol>
        </figure>

        <small className={styles.credits}>
          Photography: <a href="https://www.pexels.com/photo/5420986/">Kaboompics</a>,{' '}
          <a href="https://www.pexels.com/photo/9414025/">Sasha Kim</a>, and{' '}
          <a href="https://www.pexels.com/photo/17033427/">Budget Bizar</a> / Pexels.
        </small>
      </div>
    </section>
  );
}
