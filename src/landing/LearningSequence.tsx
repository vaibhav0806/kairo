import { useEffect, useRef, useState } from 'react';
import styles from './LearningSequence.module.css';

const lessonChapters = [
  {
    id: 'ask',
    label: 'Ask',
    title: 'Show where you’re stuck.',
    copy: 'Ask aloud or circle the cube: “How do I add a keyframe here?”',
    summary: 'You asked: How do I add a keyframe here?'
  },
  {
    id: 'do',
    label: 'Do',
    title: 'Follow one move.',
    copy: 'Kairo finds the cube and says: Press I, then choose Location. You make the move yourself.',
    summary: 'Kairo: Press I → Location. You do it.'
  },
  {
    id: 'check',
    label: 'Check',
    title: 'Know it worked.',
    copy: 'Kairo sees the keyframe was added, then gives the next step.',
    summary: 'Checked: Keyframe added.'
  }
] as const;

function asset(filename: string): string {
  return `/${filename}`;
}

export function LearningSequence() {
  const filmRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [stickyMode, setStickyMode] = useState(false);
  const activeLesson = lessonChapters[activeChapter] ?? lessonChapters[0];

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return undefined;

    const chapterMarkers = [...film.querySelectorAll<HTMLElement>('[data-chapter-index]')];
    const stickyLesson = window.matchMedia('(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
    let pendingFrame: number | null = null;
    let tracking = false;

    const updateActiveChapter = () => {
      pendingFrame = null;
      const readingLine = Math.min(window.innerHeight * 0.48, 520);
      let nearestChapter = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      chapterMarkers.forEach((chapter) => {
        const chapterIndex = Number(chapter.dataset.chapterIndex);
        const rect = chapter.getBoundingClientRect();
        const distance = rect.top <= readingLine && rect.bottom >= readingLine
          ? 0
          : Math.abs(rect.top + rect.height / 2 - readingLine);
        if (distance < nearestDistance) {
          nearestChapter = chapterIndex;
          nearestDistance = distance;
        }
      });

      setActiveChapter((current) => current === nearestChapter ? current : nearestChapter);
    };

    const scheduleUpdate = () => {
      if (pendingFrame !== null) return;
      pendingFrame = window.requestAnimationFrame(updateActiveChapter);
    };

    const stopTracking = () => {
      if (!tracking) return;
      tracking = false;
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
      window.removeEventListener('pageshow', scheduleUpdate);
      if (pendingFrame !== null) {
        window.cancelAnimationFrame(pendingFrame);
        pendingFrame = null;
      }
    };

    const syncStickyMode = () => {
      setStickyMode(stickyLesson.matches);
      if (!stickyLesson.matches) {
        stopTracking();
        setActiveChapter(0);
        return;
      }
      if (!tracking) {
        tracking = true;
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        window.addEventListener('hashchange', scheduleUpdate, { passive: true });
        window.addEventListener('pageshow', scheduleUpdate, { passive: true });
      }
      scheduleUpdate();
    };

    syncStickyMode();
    stickyLesson.addEventListener('change', syncStickyMode);

    return () => {
      stickyLesson.removeEventListener('change', syncStickyMode);
      stopTracking();
    };
  }, []);

  return (
    <section id="how-it-works" className={styles.sequence} aria-labelledby="sequence-title" data-reveal>
      <header className={styles.intro}>
        <p>One question. One result.</p>
        <h2 id="sequence-title">See a lesson from start to finish.</h2>
        <span>Add a keyframe in three clear steps.</span>
      </header>

      <div ref={filmRef} className={styles.film} data-active-chapter={activeChapter} data-sticky-mode={stickyMode}>
        <div
          className={styles.workspace}
          data-learning-workspace
          data-workspace-state={activeLesson.id}
        >
          <div className={styles.workspaceBar} aria-hidden="true">
            <span><i /> Live lesson</span>
            <b>Goal · Add your first keyframe</b>
          </div>

          <figure className={styles.viewport}>
            <img
              src={asset('kairo-blender-preview.webp')}
              alt="Blender with a cube selected in the 3D viewport"
              width="3560"
              height="1972"
              loading="lazy"
              decoding="async"
            />

            <div className={`${styles.layer} ${styles.question}`} aria-hidden="true">
              <span aria-hidden="true">You asked</span>
              How do I add a keyframe here?
            </div>

            <svg className={`${styles.layer} ${styles.learnerMark}`} viewBox="0 0 260 190" aria-hidden="true">
              <path d="M22 106C32 42 94 15 169 29c68 13 84 77 31 117-49 37-148 25-178-40Z" />
              <path d="m193 145 35 25-9-38" />
            </svg>

            <div className={`${styles.layer} ${styles.target}`} aria-hidden="true">
              <span aria-hidden="true">Cube found</span>
              <i /><i /><i /><i />
            </div>

            <div className={`${styles.layer} ${styles.instruction}`} aria-hidden="true">
              <span aria-hidden="true">Next move</span>
              <p data-instruction-copy>Press <kbd>I</kbd>, then choose <b>Location</b>.</p>
            </div>

            <div className={`${styles.layer} ${styles.action}`} aria-hidden="true">
              <span aria-hidden="true">Your move</span>
              <b><kbd>I</kbd> Insert keyframe</b>
              <small>You choose Location.</small>
            </div>

            <div className={`${styles.layer} ${styles.verified}`} aria-hidden="true">
              <span aria-hidden="true">Checked</span>
              <b>Keyframe added</b>
              <small>Next · Move to frame 40</small>
            </div>
          </figure>

          <p className={styles.status}>
            {activeLesson.summary}
          </p>
        </div>

        <ol className={styles.chapters} aria-label="How a Kairo lesson works">
          {lessonChapters.map((chapter, index) => (
            <li
              key={chapter.id}
              className={styles.chapter}
              data-lesson-chapter={chapter.id}
              data-chapter-index={index}
              aria-current={stickyMode && index === activeChapter ? 'step' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{chapter.label}</p>
                <h3>{chapter.title}</h3>
                <small>{chapter.copy}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
