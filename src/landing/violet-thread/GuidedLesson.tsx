'use client';

import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useReducer, useRef, useState } from 'react';
import {
  GUIDED_INITIAL_STATE,
  GUIDED_WORK_AREA_MAX,
  GUIDED_WORK_AREA_MIN,
  GuidedPhase,
  formatWorkAreaTimecode,
  guidedPhaseFromProgress,
  guidedLessonReducer
} from './guidedLessonModel';
import styles from './GuidedLesson.module.css';

const steps: ReadonlyArray<Readonly<{
  phase: GuidedPhase;
  label: string;
  detail: string;
}>> = [
  { phase: 'guide', label: 'Explain', detail: 'Kairo points' },
  { phase: 'waiting', label: 'Your turn', detail: 'You adjust' },
  { phase: 'verified', label: 'Checked', detail: 'Kairo verifies' }
];

const phaseCopy: Record<GuidedPhase, string> = {
  guide: 'Move the white work-area handle to the violet marker.',
  waiting: 'Drag the white handle to the violet marker.',
  verified: 'That’s aligned. The shot is ready to preview.'
};

export function GuidedLesson() {
  const lessonRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const manualInteraction = useRef(false);
  const scrollPhase = useRef<GuidedPhase>('guide');
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [learnerOwnsMove, setLearnerOwnsMove] = useState(false);
  const [state, dispatch] = useReducer(guidedLessonReducer, GUIDED_INITIAL_STATE);
  const reducedMotion = systemReducedMotion;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setSystemReducedMotion(query.matches);
    syncPreference();
    query.addEventListener('change', syncPreference);
    return () => query.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) dispatch({ type: 'SHOW_STATIC_STORYBOARD' });
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !lessonRef.current || !frameRef.current) return;

    let active = true;
    let teardown: () => void = () => undefined;

    const setUpScrollStory = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger')
      ]);
      if (!active || !lessonRef.current || !frameRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      const updateScrollPhase = (progress: number) => {
        if (manualInteraction.current) return;
        const nextPhase = guidedPhaseFromProgress(progress);
        if (nextPhase === scrollPhase.current) return;
        scrollPhase.current = nextPhase;
        dispatch({ type: 'SCROLL_PHASE_CHANGED', phase: nextPhase });
      };

      media.add(
        '(min-width: 1061px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)',
        () => {
          const trigger = ScrollTrigger.create({
            trigger: lessonRef.current,
            start: 'top top+=68',
            end: () => `+=${Math.round(window.innerHeight * 0.72)}`,
            pin: frameRef.current,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => updateScrollPhase(progress)
          });

          return () => trigger.kill();
        }
      );
      media.add(
        '(max-width: 1060px) and (prefers-reduced-motion: no-preference)',
        () => {
          const trigger = ScrollTrigger.create({
            trigger: lessonRef.current,
            start: 'top 35%',
            end: 'bottom 35%',
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => updateScrollPhase(progress)
          });

          return () => trigger.kill();
        }
      );
      teardown = () => media.revert();
    };

    void setUpScrollStory();
    return () => {
      active = false;
      teardown();
    };
  }, [reducedMotion]);

  const beginLearnerMove = () => {
    const isTakingOverCompletedStory = !manualInteraction.current && state.phase === 'verified';
    manualInteraction.current = true;
    setLearnerOwnsMove(true);
    if (isTakingOverCompletedStory) dispatch({ type: 'LEARNER_TAKEOVER' });
  };

  const changeWorkArea = (value: number) => {
    beginLearnerMove();
    dispatch({ type: 'WORK_AREA_CHANGED', value });
  };

  const commitWorkArea = (value: number) => {
    beginLearnerMove();
    dispatch({ type: 'WORK_AREA_COMMITTED', value });
  };

  const selectPhase = (phase: GuidedPhase) => {
    manualInteraction.current = true;
    scrollPhase.current = phase;
    setLearnerOwnsMove(false);
    dispatch({ type: 'PHASE_SELECTED', phase });
  };

  const responseHeading = state.phase === 'waiting'
    ? 'Kairo is waiting'
    : state.phase === 'verified'
      ? 'Kairo checked the result'
      : 'Kairo sees After Effects';
  const activeStep = steps.find((step) => step.phase === state.phase) ?? steps[0];

  return (
    <section
      ref={lessonRef}
      id="learn"
      className={styles.lesson}
      aria-labelledby="learn-title"
      data-guided-phase={state.phase}
      data-interaction-owner={learnerOwnsMove ? 'learner' : 'story'}
    >
      <div ref={frameRef} className={styles.lessonFrame}>
        <div className={styles.copy}>
          <h2 id="learn-title">You make the move.</h2>
          <p>Kairo gives one next move, waits while you try it, then checks the result.</p>
        </div>

        <LayoutGroup id="guided-lesson-steps">
          <ol className={styles.stepRail} aria-label="Guided lesson progress">
            {steps.map((step) => {
              const active = state.phase === step.phase;

              return (
                <li key={step.phase} data-active={active}>
                  {active ? (
                    <motion.span
                      layoutId="guided-lesson-selection"
                      className={styles.stepSelection}
                      data-guided-step-selection
                      aria-hidden="true"
                      transition={reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', duration: 0.28, bounce: 0.08 }}
                    />
                  ) : null}
                  <button
                    type="button"
                    className={styles.stepButton}
                    aria-current={active ? 'step' : undefined}
                    aria-pressed={active}
                    aria-controls="guided-workspace"
                    onClick={() => selectPhase(step.phase)}
                  >
                    <strong>{step.label}</strong>
                    <span>{step.detail}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className={styles.mobileStepDetail} aria-live="polite" data-guided-mobile-detail>
            {activeStep.detail}
          </p>
        </LayoutGroup>

        <figure id="guided-workspace" className={styles.workspace}>
          <div className={styles.workspaceBar}>
            <span>after-effects.aep</span>
            <b>{activeStep.label}</b>
          </div>

          <div className={styles.workspaceMedia}>
            <img
              className={styles.workspaceImage}
              src="/learn/after-effects-timeline.webp"
              alt="After Effects project with the timeline and layer stack enlarged"
            />

            <div
              className={styles.timelineFocus}
              data-guided-actor="learner"
              data-guided-timeline
              role="group"
              aria-label="Your move in After Effects"
            >
              <span
                className={styles.selectedRange}
                style={{ transform: `scaleX(${state.workAreaEnd / 100})` }}
                aria-hidden="true"
              />
              <i className={styles.targetPlayhead} aria-hidden="true" />
              <i
                className={styles.workAreaEdge}
                style={{ transform: `translateX(${state.workAreaEnd - 100}%)` }}
                aria-hidden="true"
              />
              {!learnerOwnsMove && state.phase === 'waiting' ? (
                <i
                  className={styles.learnerCursor}
                  style={{ transform: `translateX(${state.workAreaEnd - 100}%)` }}
                  aria-hidden="true"
                >
                  <span>you</span>
                </i>
              ) : null}
              <label className={styles.timelineControl}>
                <span>Move the work-area end in After Effects</span>
                <input
                  type="range"
                  min={GUIDED_WORK_AREA_MIN}
                  max={GUIDED_WORK_AREA_MAX}
                  step="1"
                  value={state.workAreaEnd}
                  aria-label="Move the work-area end in After Effects"
                  aria-describedby="guided-response"
                  onFocus={beginLearnerMove}
                  onPointerDown={beginLearnerMove}
                  onChange={(event) => changeWorkArea(Number(event.target.value))}
                  onPointerUp={(event) => commitWorkArea(Number(event.currentTarget.value))}
                  onBlur={(event) => commitWorkArea(Number(event.currentTarget.value))}
                  onKeyUp={(event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                      commitWorkArea(Number(event.currentTarget.value));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <aside
            className={styles.responseDock}
            data-guided-actor="kairo"
            data-guided-response
            data-phase={state.phase}
            aria-label="Kairo guidance"
          >
            <div id="guided-response" className={styles.responseStage} aria-live="polite">
              <AnimatePresence initial={false}>
                <motion.div
                  key={state.phase}
                  className={styles.response}
                  initial={reducedMotion ? false : { opacity: 0, transform: 'translateY(6px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={reducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        transform: 'translateY(-4px)',
                        transition: { duration: 0.1, ease: [0.23, 1, 0.32, 1] }
                      }}
                  transition={reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <span><b>k</b> {responseHeading}</span>
                  {state.phase === 'verified' ? (
                    <p role="status">{phaseCopy[state.phase]}</p>
                  ) : (
                    <p>{phaseCopy[state.phase]}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>

          <figcaption className={styles.workspaceControl}>
            <span>Work-area end</span>
            <time>{formatWorkAreaTimecode(state.workAreaEnd)}</time>
            <span>Target</span>
            <time>{formatWorkAreaTimecode(68)}</time>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
