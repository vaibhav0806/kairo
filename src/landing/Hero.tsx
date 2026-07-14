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
    const Observer = window.IntersectionObserver;
    if (typeof Observer === 'function') {
      observer = new Observer(([entry]) => {
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
    >
      <div className={styles.copy}>
        <p className={styles.kicker}>Help, right where you are learning</p>
        <h1 id="landing-title">Turn stuck into your next move.</h1>
        <p>Ask about what’s on your screen. Kairo shows one move, watches you do it, and checks that it worked.</p>
        <a href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
      </div>

      <div className={styles.environment} data-ambient-stage>
        <picture className={styles.fieldPhoto}>
          <source media="(max-width: 760px)" srcSet={asset('field-notes/field-hero-mobile.webp')} />
          <img
            className={styles.ambientPhoto}
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
              aria-label={paused ? 'Play lesson' : 'Pause lesson'}
              title={paused ? 'Play lesson' : 'Pause lesson'}
            >
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
            </button>
          </figcaption>

          <div className={styles.blenderViewport}>
            <img
              src={asset('kairo-blender-preview.webp')}
              alt="Blender with Kairo guiding the selected cube"
              width="3560"
              height="1972"
            />
            <div className={styles.goal}>Goal · Add your first keyframe</div>
            <div className={styles.question}>
              <span>You asked</span>
              How do I add a keyframe here?
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
              <p data-instruction-copy>Press <kbd>I</kbd>, then choose <b>Location</b>.</p>
            </div>
            <div className={styles.learnerAction} aria-hidden="true">
              <span>You did</span>
              <b><kbd>I</kbd> → Location</b>
            </div>
            <div className={styles.verified} aria-hidden="true">
              <span>Checked</span>
              <b>Keyframe added</b>
              <small>Next · Move to frame 40</small>
            </div>
          </div>

          <ol className={styles.mobileTranscript} aria-label="Mobile lesson summary">
            <li><span>Ask</span><p>How do I add a keyframe here?</p></li>
            <li><span>Do</span><p>Press I, then choose Location.</p></li>
            <li><span>Check</span><p>Keyframe added. Next · Move to frame 40.</p></li>
          </ol>
        </figure>

      </div>
    </section>
  );
}
