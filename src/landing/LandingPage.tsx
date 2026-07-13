import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './LandingPage.module.css';

type AppName = 'Blender' | 'Figma' | 'DaVinci Resolve' | 'Photoshop' | 'Any desktop app';
type GoalName = 'Learn the basics' | 'Finish a project' | 'Get unstuck';
type TrustMode = 'ask' | 'pause' | 'point';

export function validateWaitlistEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

const lessonChapters = [
  {
    id: 'ask',
    number: '01',
    label: 'Ask',
    title: 'Ask anything on screen.',
    copy: 'Say it out loud or circle the part that is confusing.'
  },
  {
    id: 'point',
    number: '02',
    label: 'Point',
    title: 'Kairo shows the next step.',
    copy: 'No ten-step dump. Just the next useful action.'
  },
  {
    id: 'try',
    number: '03',
    label: 'Try',
    title: 'You make the move.',
    copy: 'Kairo waits while you do the work yourself.'
  },
  {
    id: 'checked',
    number: '04',
    label: 'Checked',
    title: 'It checks before moving on.',
    copy: 'When the step is right, the lesson continues.'
  }
] as const;

const appLessons = [
  {
    name: 'Blender',
    image: 'creative-3d.jpg',
    mode: 'model',
    prompt: 'How do I add my first keyframe?',
    action: 'Select the cube, then press I.',
    detail: 'Object selected'
  },
  {
    name: 'Figma',
    image: 'creative-layout.jpg',
    mode: 'layout',
    prompt: 'Why is this spacing uneven?',
    action: 'Select the frame and open Auto layout.',
    detail: 'Frame selected'
  },
  {
    name: 'DaVinci Resolve',
    image: 'creative-edit.jpg',
    mode: 'edit',
    prompt: 'Where should I cut this pause?',
    action: 'Move the playhead to the quiet beat.',
    detail: 'Cut point found'
  },
  {
    name: 'Photoshop',
    image: 'creative-design.jpg',
    mode: 'image',
    prompt: 'How do I hide this background?',
    action: 'Select the layer and add a mask.',
    detail: 'Layer selected'
  },
  {
    name: 'Any desktop app',
    image: 'creative-design.jpg',
    mode: 'any',
    prompt: 'What does this control do?',
    action: 'Point to it and ask Kairo.',
    detail: 'Control understood'
  }
] as const satisfies readonly {
  name: AppName;
  image: string;
  mode: string;
  prompt: string;
  action: string;
  detail: string;
}[];

const goals: readonly GoalName[] = ['Learn the basics', 'Finish a project', 'Get unstuck'];

const trustModes = [
  { id: 'ask', label: 'Start when I ask', copy: 'No lesson runs until you begin one.', status: 'Waiting for you' },
  { id: 'pause', label: 'Pause anytime', copy: 'Stop watching and listening with one click.', status: 'Lesson paused' },
  { id: 'point', label: 'Point, never click', copy: 'Kairo guides the move. You stay in control.', status: 'Pointer only' }
] as const satisfies readonly { id: TrustMode; label: string; copy: string; status: string }[];

function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}

interface HeroLessonStageProps {
  paused: boolean;
  onToggle: () => void;
}

function VoiceBars({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? styles.voiceBarsCompact : styles.voiceBars} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  );
}

function HeroLessonStage({ paused, onToggle }: HeroLessonStageProps) {
  return (
    <figure className={styles.heroStage} data-hero-stage>
      <figcaption className={styles.stageCaption}>
        <span><i aria-hidden="true" /> Live lesson</span>
        <button type="button" onClick={onToggle} aria-pressed={paused}>
          <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
          {paused ? 'Play lesson' : 'Pause lesson'}
        </button>
      </figcaption>

      <div className={styles.heroViewport}>
        <img
          src={asset('kairo-blender-preview.webp')}
          alt="Blender scene with a cube selected while Kairo guides the next step"
        />

        <div className={styles.heroQuestion}>
          <VoiceBars />
          <div>
            <span>You asked</span>
            <p>How do I start animating this cube?</p>
          </div>
        </div>

        <svg className={styles.heroAnnotation} viewBox="0 0 220 190" aria-hidden="true">
          <path d="M18 100 C5 44 42 12 114 14 C184 16 219 55 205 112 C191 168 133 184 68 169 C27 159 8 133 18 100" />
        </svg>

        <div className={styles.heroTarget} aria-hidden="true">
          <span>Cube found</span>
          <i /><i /><i /><i />
        </div>

        <svg className={styles.heroCursorTrail} viewBox="0 0 360 220" aria-hidden="true">
          <path d="M18 28 C112 40 178 89 224 170 C257 225 309 200 340 170" />
        </svg>
        <span className={styles.heroCursor} aria-hidden="true">➤</span>

        <div className={styles.heroGuide}>
          <div className={styles.guideMark} aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span>Next move</span>
            <p>Press <kbd>I</kbd>, then choose <b>Location</b>.</p>
          </div>
        </div>

        <div className={styles.heroProgress} aria-label="Example lesson progress">
          <div className={styles.progressTitle}>
            <span>First animation</span>
            <em>1 of 3</em>
          </div>
          <ol>
            <li className={styles.heroVerified}><span>✓</span><b>Select cube</b><em>Done</em></li>
            <li className={styles.heroCurrent}><span>02</span><b>Insert keyframe</b><em>Now</em></li>
            <li><span>03</span><b>Move to frame 40</b><em>Next</em></li>
          </ol>
        </div>

        <span className={styles.heroSpark} aria-hidden="true">✦</span>
      </div>

      <ol className={styles.mobileTranscript} aria-label="Mobile lesson summary">
        <li><span>Ask</span><p>How do I animate this cube?</p></li>
        <li><span>Point</span><p>Press I, then choose Location.</p></li>
        <li><span>Checked</span><p>Cube selected. Ready for the next move.</p></li>
      </ol>

      <small className={styles.heroCredit}>
        Interface capture: <a href="https://www.blender.org/">Blender</a>. Kairo overlays are a product preview.
      </small>
    </figure>
  );
}

function LessonWorkspace({ activeChapter }: { activeChapter: number }) {
  return (
    <div className={styles.lessonWorkspace}>
      <div className={styles.workspaceChrome}>
        <span><i /><i /><i /></span>
        <b>new-project.canvas</b>
        <em>Kairo lesson</em>
      </div>
      <div className={styles.workspaceCanvas} data-workspace-state={lessonChapters[activeChapter].id}>
        <div className={styles.workspaceArtwork} aria-hidden="true">
          <span className={styles.artOrbA} />
          <span className={styles.artOrbB} />
          <span className={styles.artPanel} />
          <span className={styles.artType}>MAKE<br />SOMETHING</span>
        </div>
        <div className={styles.workspaceQuestion}>
          <VoiceBars compact />
          <span>How do I make this feel less flat?</span>
        </div>
        <svg className={styles.workspaceCircle} viewBox="0 0 260 150" aria-hidden="true">
          <path d="M12 79 C16 21 90 4 168 16 C236 26 263 71 235 111 C207 151 112 151 49 130 C17 119 5 99 12 79" />
        </svg>
        <div className={styles.workspacePointer} aria-hidden="true"><span>Try this</span><i>➤</i></div>
        <span className={styles.workspaceAction} aria-hidden="true">Add contrast</span>
        <div className={styles.workspaceCheck}><span>✓</span><b>Nice. That reads clearly.</b></div>
        <div className={styles.signalRail} aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
      <div className={styles.workspaceFooter} role="status" aria-live="polite" aria-atomic="true">
        <span>{lessonChapters[activeChapter].number} / 04</span>
        <b>{lessonChapters[activeChapter].label}</b>
        <em>{lessonChapters[activeChapter].title}</em>
      </div>
    </div>
  );
}

function LessonLoop() {
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const chapters = chapterRefs.current.filter((chapter): chapter is HTMLLIElement => chapter !== null);
    if (chapters.length === 0) return undefined;

    let animationFrame: number | null = null;
    const syncChapter = () => {
      animationFrame = null;
      const readingLine = Math.min(window.innerHeight * 0.48, 520);
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const distance = rect.top <= readingLine && rect.bottom >= readingLine
          ? 0
          : Math.abs(rect.top + rect.height / 2 - readingLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveChapter(nearestIndex);
    };
    const scheduleSync = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(syncChapter);
    };

    scheduleSync();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('hashchange', scheduleSync);
    window.addEventListener('pageshow', scheduleSync);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('hashchange', scheduleSync);
      window.removeEventListener('pageshow', scheduleSync);
    };
  }, []);

  return (
    <section id="how-it-works" className={styles.lessonLoop} aria-labelledby="lesson-loop-title">
      <header className={styles.sectionIntro}>
        <p>One move at a time</p>
        <h2 id="lesson-loop-title">See it. Try it.<br />Keep going.</h2>
        <span>Kairo stays with the work instead of sending you away to another tutorial.</span>
      </header>

      <ol className={styles.loopStrip} aria-label="How a Kairo lesson works">
        {lessonChapters.map((chapter, index) => (
          <li key={chapter.id} data-active={activeChapter === index}>
            <span>{chapter.number}</span>
            <b>{chapter.label}</b>
          </li>
        ))}
      </ol>

      <div className={styles.lessonFilm} data-active-chapter={activeChapter}>
        <LessonWorkspace activeChapter={activeChapter} />
        <ol className={styles.lessonChapters}>
          {lessonChapters.map((chapter, index) => (
            <li
              key={chapter.id}
              ref={(element) => { chapterRefs.current[index] = element; }}
              data-lesson-chapter={chapter.id}
              data-chapter-index={index}
              data-active={activeChapter === index}
            >
              <span>{chapter.number}</span>
              <div>
                <p>{chapter.label}</p>
                <h3>{chapter.title}</h3>
                <small>{chapter.copy}</small>
              </div>
              <i aria-hidden="true">{index === 3 ? '✓' : '↘'}</i>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AppVisualMarks() {
  return (
    <div className={styles.appVisualMarks} aria-hidden="true">
      <div className={styles.modelMark}><span /><span /><i>3D</i></div>
      <div className={styles.layoutMark}><span>Frame · Auto layout</span><i /><i /><i /></div>
      <div className={styles.editMark}><span /><span /><span /><span /><i /></div>
      <div className={styles.imageMark}><span /><span /><span /><i /></div>
      <div className={styles.anyMark}><span>?</span><i /><i /></div>
    </div>
  );
}

function AppLessonSwitcher() {
  const [selectedApp, setSelectedApp] = useState<AppName>('Any desktop app');
  const lesson = appLessons.find((appLesson) => appLesson.name === selectedApp) ?? appLessons[4];

  return (
    <section id="apps" className={styles.apps} aria-labelledby="apps-title">
      <header className={styles.appsHeader}>
        <p>Bring the app you are learning</p>
        <h2 id="apps-title">Help in the app you’re learning</h2>
        <span>The same one-step lesson, shaped around what is on your screen.</span>
      </header>

      <div className={styles.appTabs} aria-label="Choose an example lesson">
        {appLessons.map((appLesson) => (
          <button
            key={appLesson.name}
            type="button"
            aria-label={`${appLesson.name} lesson`}
            aria-pressed={selectedApp === appLesson.name}
            onClick={() => setSelectedApp(appLesson.name)}
          >
            <i aria-hidden="true" />
            {appLesson.name}
          </button>
        ))}
      </div>

      <div className={styles.appStage} data-mode={lesson.mode} data-ambient-stage>
        <div className={styles.appMedia}>
          {appLessons.map((appLesson) => (
            <img
              key={appLesson.name}
              src={asset(appLesson.image)}
              alt=""
              aria-hidden="true"
              data-active={selectedApp === appLesson.name}
            />
          ))}
          <span className={styles.appMediaWash} aria-hidden="true" />
          <AppVisualMarks />
          <div className={styles.appCursor} aria-hidden="true">➤</div>
          <div className={styles.appTarget} aria-hidden="true"><span>Look here</span></div>
        </div>

        <div className={styles.appLessonPanel}>
          <div className={styles.appPanelTop} role="status" aria-live="polite" aria-atomic="true">
            <span><i /> Live</span>
            <b>{lesson.name}</b>
          </div>
          <blockquote>
            <VoiceBars compact />
            <p>{lesson.prompt}</p>
          </blockquote>
          <div className={styles.appAnswer}>
            <span>Kairo</span>
            <p>{lesson.action}</p>
          </div>
          <div className={styles.appResult}>
            <span>✓</span>
            <b>{lesson.detail}</b>
            <em>Ready</em>
          </div>
        </div>
      </div>

      <p className={styles.mediaCredits}>
        Images: <a href="https://www.pexels.com/photo/vibrant-abstract-3d-render-with-gradient-colors-34204383/">Steve A Johnson</a>, <a href="https://www.pexels.com/photo/full-frame-shot-of-computer-326514/">Tranmautritam</a>, <a href="https://www.pexels.com/photo/close-up-shot-of-a-computer-screen-6253568/">Vito Goričan</a>, and <a href="https://www.pexels.com/photo/a-laptop-with-a-blank-white-screen-8534464/">Hanna Pad</a> / Pexels.
      </p>
    </section>
  );
}

function ControlConsole() {
  const [selectedMode, setSelectedMode] = useState<TrustMode>('ask');
  const mode = trustModes.find((trustMode) => trustMode.id === selectedMode) ?? trustModes[0];

  return (
    <section id="trust" className={styles.controlConsole} aria-labelledby="trust-title">
      <header className={styles.controlHeader}>
        <p>Your screen. Your call.</p>
        <h2 id="trust-title">You stay in control</h2>
        <span>Kairo joins a lesson only when you want it there.</span>
      </header>

      <div className={styles.controlShell}>
        <div className={styles.controlModes} aria-label="Preview Kairo controls">
          {trustModes.map((trustMode, index) => (
            <button
              key={trustMode.id}
              type="button"
              aria-label={trustMode.label}
              aria-pressed={selectedMode === trustMode.id}
              onClick={() => setSelectedMode(trustMode.id)}
            >
              <span>0{index + 1}</span>
              <b>{trustMode.label}</b>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </div>

        <div className={styles.controlPreview} data-mode={selectedMode} data-ambient-stage>
          <div className={styles.previewWindow}>
            <div className={styles.previewBar}><span /><span /><span /><b>lesson.canvas</b></div>
            <div className={styles.previewScene}>
              <span className={styles.previewObject} />
              <span className={styles.previewPointer}>➤</span>
              <span className={styles.previewPause}>Ⅱ</span>
              <VoiceBars />
            </div>
          </div>
          <div className={styles.previewStatus} role="status" aria-live="polite" aria-atomic="true">
            <span><i /> {mode.status}</span>
            <p>{mode.copy}</p>
          </div>
        </div>
      </div>

      <p className={styles.trustNote}>Double-check important work. AI can get things wrong.</p>
    </section>
  );
}

function WaitlistBuilder() {
  const [selectedApp, setSelectedApp] = useState<AppName>('Any desktop app');
  const [selectedGoal, setSelectedGoal] = useState<GoalName>('Get unstuck');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateWaitlistEmail(email);
    if (error) {
      setEmailError(error);
      const input = event.currentTarget.elements.namedItem('waitlist-email');
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }

    setEmailError(null);
    setSubmittedEmail(email.trim());
  };

  return (
    <section id="access" className={styles.waitlist} aria-labelledby="access-title">
      <header className={styles.waitlistHeader}>
        <p>Mac alpha</p>
        <h2 id="access-title">What do you want to learn?</h2>
        <span>Tell us where you want to begin.</span>
      </header>

      <div className={styles.builderShell}>
        {submittedEmail ? (
          <div className={styles.builderReceipt} aria-live="polite">
            <div className={styles.receiptBurst} aria-hidden="true"><span>✓</span><i /><i /><i /><i /></div>
            <p>Preview complete</p>
            <h3>Your first lesson is taking shape.</h3>
            <dl>
              <div><dt>App</dt><dd>{selectedApp}</dd></div>
              <div><dt>Goal</dt><dd>{selectedGoal}</dd></div>
              <div><dt>Email</dt><dd>{submittedEmail}</dd></div>
            </dl>
            <small>Nothing was sent or stored.</small>
          </div>
        ) : (
          <>
            <div className={styles.builderPreview} data-ambient-stage aria-hidden="true">
              <div className={styles.builderCanvas}>
                <span className={styles.builderCardA}>{selectedApp}</span>
                <span className={styles.builderCardB}>{selectedGoal}</span>
                <svg viewBox="0 0 320 180"><path d="M14 126 C90 14 207 13 301 77" /></svg>
                <span className={styles.builderCursor}>➤</span>
                <span className={styles.builderCheck}>✓</span>
              </div>
              <p><VoiceBars compact /> Lesson ready to start</p>
            </div>

            <form className={styles.builderForm} onSubmit={handleSubmit} noValidate>
              <fieldset>
                <legend><span>01</span> What are you learning?</legend>
                <div className={styles.builderChoices}>
                  {appLessons.map((appLesson) => (
                    <button
                      key={appLesson.name}
                      type="button"
                      aria-label={`Learn in ${appLesson.name}`}
                      aria-pressed={selectedApp === appLesson.name}
                      onClick={() => setSelectedApp(appLesson.name)}
                    >
                      {appLesson.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend><span>02</span> What is the goal?</legend>
                <div className={styles.builderChoices}>
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      aria-pressed={selectedGoal === goal}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.builderEmail}>
                <label htmlFor="waitlist-email"><span>03</span> Email address</label>
                <div>
                  <input
                    id="waitlist-email"
                    name="waitlist-email"
                    type="email"
                    aria-label="Email address"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? 'waitlist-error waitlist-note' : 'waitlist-note'}
                    onChange={(event) => { setEmail(event.target.value); setEmailError(null); }}
                    placeholder="you@example.com"
                  />
                  <button type="submit">Join the alpha <span aria-hidden="true">↗</span></button>
                </div>
                {emailError ? <p id="waitlist-error" className={styles.waitlistError} role="alert">{emailError}</p> : null}
                <p id="waitlist-note" className={styles.waitlistNote}>Preview only. This form does not send or store your email yet.</p>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [demoPaused, setDemoPaused] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canObserve = 'IntersectionObserver' in window;
    let previewObserver: IntersectionObserver | null = null;
    let ambientObserver: IntersectionObserver | null = null;

    if (!reducedMotion) page.dataset.motionReady = 'true';

    if (canObserve) {
      const preview = page.querySelector('[data-hero-stage]');
      previewObserver = new IntersectionObserver(([entry]) => {
        if (entry) page.dataset.demoActive = String(entry.isIntersecting);
      }, { threshold: 0.08 });
      if (preview) previewObserver.observe(preview);

      if (!reducedMotion) {
        const ambientStages = [...page.querySelectorAll('[data-ambient-stage]')] as HTMLElement[];
        ambientObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const stage = entry.target as HTMLElement;
            stage.dataset.ambientActive = String(entry.isIntersecting);
          });
        }, { threshold: 0.08 });
        ambientStages.forEach((stage) => ambientObserver?.observe(stage));
      }
    } else {
      page.dataset.demoActive = 'true';
    }

    const syncPageVisibility = () => {
      page.dataset.pageVisible = String(!document.hidden);
    };
    syncPageVisibility();
    document.addEventListener('visibilitychange', syncPageVisibility);

    return () => {
      previewObserver?.disconnect();
      ambientObserver?.disconnect();
      document.removeEventListener('visibilitychange', syncPageVisibility);
      delete page.dataset.motionReady;
      delete page.dataset.demoActive;
      delete page.dataset.pageVisible;
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.landingPage} data-demo-paused={demoPaused}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">
          <span aria-hidden="true">k</span>kairo
        </a>
        <nav aria-label="Landing page">
          <a href="#how-it-works">How it works</a>
          <a href="#apps">Apps</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className={styles.headerCta} href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span aria-hidden="true" /> Help, right where you’re learning</p>
            <h1 id="landing-title">Stuck? <span>Show Kairo.</span></h1>
            <p className={styles.heroIntro}>Ask out loud or circle the confusing bit. Kairo gives you one next step, waits while you try it, then checks your work.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
              <a className={styles.secondaryAction} href="#how-it-works"><span aria-hidden="true">↓</span> See how it works</a>
            </div>
          </div>
          <HeroLessonStage paused={demoPaused} onToggle={() => setDemoPaused((paused) => !paused)} />
        </section>

        <LessonLoop />
        <AppLessonSwitcher />
        <ControlConsole />
        <WaitlistBuilder />
      </main>
    </div>
  );
}
