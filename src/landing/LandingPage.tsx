import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './LandingPage.module.css';

type WaitlistRole = 'Student' | 'Creator' | 'Educator';

export function validateWaitlistEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

const skills = [
  ['Blender', 'modelling, animation, materials, rendering', 'model', 'creative-3d.jpg', 'A vivid abstract 3D render'],
  ['Photoshop', 'layers, masks, retouching, compositing', 'image', 'creative-design.jpg', 'A visual design project open on a desktop screen'],
  ['DaVinci Resolve', 'editing, color, audio, delivery', 'edit', 'creative-edit.jpg', 'A close-up of a video editing timeline'],
  ['Figma', 'layout, components, prototyping', 'layout', 'creative-layout.jpg', 'A bright laptop canvas ready for a visual layout']
] as const;

const learningScenes = [
  ['01', 'Ask / 3D', 'model', 'Circle the thing that doesn’t make sense.', 'learner', 'creative-3d.jpg', 'Colorful abstract 3D artwork by Steve A Johnson', 'Steve A Johnson', 'https://www.pexels.com/photo/vibrant-abstract-3d-render-with-gradient-colors-34204383/'],
  ['02', 'Guide / visual design', 'image', 'Kairo points to one next step.', 'kairo', 'creative-design.jpg', 'A visual design workspace photographed by Tranmautritam', 'Tranmautritam', 'https://www.pexels.com/photo/full-frame-shot-of-computer-326514/'],
  ['03', 'Check / video editing', 'edit', 'You do it. Kairo checks what changed.', 'verified', 'creative-edit.jpg', 'A video editing timeline photographed by Vito Goričan', 'Vito Goričan', 'https://www.pexels.com/photo/close-up-shot-of-a-computer-screen-6253568/']
] as const;

interface ProductPreviewProps {
  demoPaused: boolean;
  onToggleDemo: () => void;
}

function ProductPreview({ demoPaused, onToggleDemo }: ProductPreviewProps) {
  return (
    <figure className={styles.productPreview} data-product-preview>
      <figcaption>
        <span>Watch Kairo guide a lesson</span>
        <button
          className={styles.demoControl}
          type="button"
          onClick={onToggleDemo}
        >
          {demoPaused ? 'Play demo' : 'Pause demo'}
        </button>
      </figcaption>
      <ol className={styles.heroSignals} aria-label="How a Kairo lesson progresses">
        <li className={styles.signalLearner}><span>01</span><b>You ask</b></li>
        <li className={styles.signalKairo}><span>02</span><b>Kairo guides</b></li>
        <li className={styles.signalVerified}><span>03</span><b>Step checked</b></li>
      </ol>
      <div className={styles.softwareFrame}>
        <img
          src={`${import.meta.env.BASE_URL}kairo-blender-preview.webp`}
          alt="Blender startup scene used to demonstrate Kairo's on-screen guidance"
        />
        <svg className={styles.learnerAnnotation} viewBox="0 0 180 130" aria-hidden="true">
          <path d="M16 68 C9 25 130 5 163 46 C190 80 147 121 84 120 C28 118 1 91 16 68" />
        </svg>
        <div className={styles.kairoTarget}><span>Kairo understood: cube</span></div>
        <div className={styles.kairoCursor} aria-hidden="true">➤</div>
        <div className={styles.notch}>
          <span className={styles.wave} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Good. The cube is selected. Press I and choose Location.</span>
        </div>
        <blockquote className={styles.learnerAsk}>
          <b>You asked + circled</b>
          “How do I start animating this cube?”
        </blockquote>
        <div className={styles.progressRail} aria-label="Example lesson progress">
          <p>Make your first animation</p>
          <div className={styles.verified}><span>01</span><b>Select cube</b><em>Done</em></div>
          <div className={styles.current}><span>02</span><b>Insert keyframe</b><em>Now</em></div>
          <div><span>03</span><b>Move to frame 40</b><em>Next</em></div>
        </div>
      </div>
      <ol className={styles.mobileTranscript} aria-label="Mobile lesson summary">
        <li><span>Ask</span><p>“How do I start animating this cube?”</p></li>
        <li><span>Step</span><p>Press I and choose Location.</p></li>
        <li><span>Check</span><p>Cube selected. Next step ready.</p></li>
      </ol>
      <small>
        Interface capture: <a href="https://www.blender.org/">Blender</a>. Kairo overlays are a product preview.
      </small>
    </figure>
  );
}

function LearningRunway() {
  const [activeScene, setActiveScene] = useState(0);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const scenes = sceneRefs.current.filter((scene): scene is HTMLElement => scene !== null);
    if (!('IntersectionObserver' in window) || scenes.length === 0) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      const nearest = visible[0]?.target as HTMLElement | undefined;
      if (nearest) setActiveScene(Number(nearest.dataset.sceneIndex));
    }, { rootMargin: '-20% 0px -45% 0px', threshold: 0.01 });

    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  const [number, app, mode, copy, , , , creator, sourceUrl] = learningScenes[activeScene];

  return (
    <section id="lesson" className={styles.runway} aria-labelledby="runway-title">
      <header className={styles.runwayHeader} data-scroll="runway-header">
        <p>See it work</p>
        <h2 id="runway-title">Your screen becomes the lesson.</h2>
        <p>One clear move at a time.</p>
      </header>
      <div className={styles.lessonShowcase} data-active-scene={activeScene}>
        <div className={styles.lessonCanvas}>
          <div className={styles.canvasTopline}>
            <span>{number} / live lesson</span>
            <b>{app}</b>
            <em>{activeScene === 0 ? 'You point' : activeScene === 1 ? 'Kairo guides' : 'You try'}</em>
          </div>
          <div className={styles.canvasField} data-mode={mode}>
            {learningScenes.map(([, sceneApp, , , , image, alt], index) => (
              <img
                className={styles.canvasMedia}
                src={`${import.meta.env.BASE_URL}${image}`}
                alt={activeScene === index ? alt : ''}
                aria-hidden={activeScene !== index}
                data-scene={index}
                data-active={activeScene === index}
                key={sceneApp}
              />
            ))}
            <span className={styles.canvasShade} aria-hidden="true" />
            <span className={styles.canvasCircle} aria-hidden="true" />
            <span className={styles.canvasLayers} aria-hidden="true"><i /><i /><i /><i /></span>
            <span className={styles.canvasTarget} aria-hidden="true" />
            <span className={styles.canvasCursor} aria-hidden="true">➤</span>
            <span className={styles.canvasTimeline} aria-hidden="true"><i /><i /><i /><i /><i /></span>
            <span className={styles.canvasCheck} aria-hidden="true">✓</span>
          </div>
          <div className={styles.canvasCaption}>
            <span>{number}</span>
            <p>{copy}</p>
          </div>
          <small className={styles.canvasCredit}>Image: <a href={sourceUrl}>{creator}</a> / Pexels</small>
        </div>
        <ol className={styles.learningSteps} aria-label="Kairo lesson sequence">
        {learningScenes.map(([number, app, , copy, tone], index) => (
          <li
            className={styles.learningScene}
            data-scroll="learning-scene"
            data-scroll-index={index}
            data-tone={tone}
            data-scene-index={index}
            data-active={activeScene === index}
            ref={(element) => { sceneRefs.current[index] = element; }}
            key={app}
          >
            <div className={styles.sceneTopline}><span>{number}</span><b>{app}</b><em>{activeScene === index ? 'Now showing' : 'Step'}</em></div>
            <p>{copy}</p>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [demoPaused, setDemoPaused] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [role, setRole] = useState<WaitlistRole | null>(null);
  const [selectedApp, setSelectedApp] = useState<(typeof skills)[number][0]>('Blender');

  const handleWaitlistSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateWaitlistEmail(email);
    if (error) {
      setEmailError(error);
      const emailInput = event.currentTarget.elements.namedItem('waitlist-email');
      if (emailInput instanceof HTMLInputElement) emailInput.focus();
      return;
    }

    setEmailError(null);
    setSubmittedEmail(email.trim());
  };

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canObserve = 'IntersectionObserver' in window;
    let scrollObserver: IntersectionObserver | null = null;
    let previewObserver: IntersectionObserver | null = null;
    let visibilityFrame: number | null = null;
    const scrollTargets = [...page.querySelectorAll('[data-scroll]')] as HTMLElement[];

    const showScrollTarget = (element: HTMLElement) => {
      element.setAttribute('data-scroll-visible', 'true');
      if (scrollObserver) scrollObserver.unobserve(element);
    };

    const reconcileVisibleScrollTargets = () => {
      scrollTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) showScrollTarget(element);
      });
    };

    if (!reducedMotion && canObserve) {
      page.dataset.motionReady = 'true';
      scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showScrollTarget(entry.target as HTMLElement);
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -96px 0px' });

      scrollTargets.forEach((element) => {
        scrollObserver?.observe(element);
      });
      visibilityFrame = window.requestAnimationFrame(reconcileVisibleScrollTargets);
      window.addEventListener('pageshow', reconcileVisibleScrollTargets);
      window.addEventListener('resize', reconcileVisibleScrollTargets);
      window.addEventListener('scroll', reconcileVisibleScrollTargets, { passive: true });
    }

    if (canObserve) {
      const preview = page.querySelector('[data-product-preview]');
      previewObserver = new IntersectionObserver(([entry]) => {
        if (entry) page.dataset.demoActive = String(entry.isIntersecting);
      }, { threshold: 0.1 });
      if (preview) previewObserver.observe(preview);
    }

    const syncPageVisibility = () => {
      page.dataset.pageVisible = String(!document.hidden);
    };
    syncPageVisibility();
    document.addEventListener('visibilitychange', syncPageVisibility);

    return () => {
      scrollObserver?.disconnect();
      previewObserver?.disconnect();
      if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame);
      window.removeEventListener('pageshow', reconcileVisibleScrollTargets);
      window.removeEventListener('resize', reconcileVisibleScrollTargets);
      window.removeEventListener('scroll', reconcileVisibleScrollTargets);
      document.removeEventListener('visibilitychange', syncPageVisibility);
      delete page.dataset.motionReady;
      delete page.dataset.demoActive;
      delete page.dataset.pageVisible;
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.landingPage} data-demo-paused={demoPaused}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#lesson">See it work</a>
          <a href="#skills">Apps</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className={styles.headerCta} href="#access">Join alpha <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <div>
              <p className={styles.eyebrow}>Meet Kairo</p>
              <h1 id="landing-title">
                Learn <span className={styles.headlineDoing}>by doing.</span>
                {' '}<span className={styles.headlineContrast}>Not watching.</span>
              </h1>
              <p className={styles.heroIntro}>Ask. Point. Learn by doing.</p>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#access">Join the Mac alpha <span aria-hidden="true">↗</span></a>
              <a className={styles.secondaryAction} href="#lesson">See Kairo guide a lesson <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <ProductPreview demoPaused={demoPaused} onToggleDemo={() => setDemoPaused((paused) => !paused)} />
        </section>

        <LearningRunway />

        <section id="skills" className={styles.skills} aria-labelledby="skills-title">
          <header className={styles.sectionHeader} data-scroll="skills-header">
            <p>Bring your own app</p>
            <div>
              <h2 id="skills-title">Kairo can meet you where you work.</h2>
            </div>
          </header>
          <ul className={styles.skillGrid} aria-label="Examples of apps Kairo can guide in">
            {skills.map(([software, knowledge, mode, image, alt], index) => (
              <li className={styles.skillTile} data-scroll="skill-row" data-scroll-index={index} data-mode={mode} key={software}>
                <div className={styles.skillTileVisual}>
                  <img src={`${import.meta.env.BASE_URL}${image}`} alt={alt} />
                  <span className={styles.skillTileMark} aria-hidden="true" />
                  <span className={styles.skillTileArt} aria-hidden="true"><i /><i /><i /><i /></span>
                </div>
                <div className={styles.skillTileCopy}>
                  <h3>{software}</h3>
                  <p>{knowledge}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.anySoftware}>Don’t see your app? Kairo can still help from what’s on your screen.</p>
          <p className={styles.mediaCredits}>Images: <a href="https://www.pexels.com/photo/vibrant-abstract-3d-render-with-gradient-colors-34204383/">Steve A Johnson</a>, <a href="https://www.pexels.com/photo/full-frame-shot-of-computer-326514/">Tranmautritam</a>, <a href="https://www.pexels.com/photo/close-up-shot-of-a-computer-screen-6253568/">Vito Goričan</a>, and <a href="https://www.pexels.com/photo/a-laptop-with-a-blank-white-screen-8534464/">Hanna Pad</a> / Pexels.</p>
        </section>

        <section id="trust" className={styles.trust} data-scroll="trust" aria-labelledby="trust-title">
          <p>You stay in control</p>
          <div>
            <h2 id="trust-title">Kairo only helps when you ask. You can pause it whenever you want. It never takes over.</h2>
            <ol className={styles.trustControl} aria-label="Kairo control states">
              <li><span>01</span><b>You ask</b></li>
              <li><span>02</span><b>Kairo guides</b></li>
              <li><span>03</span><b>You decide</b></li>
            </ol>
          </div>
          <p className={styles.trustLimit}>Double-check important work. AI can get things wrong.</p>
        </section>

        <section id="access" className={styles.access} aria-labelledby="access-title">
          <div data-scroll="access-heading">
            <p>Early access for Mac</p>
            <h2 id="access-title">What do you want to learn?</h2>
          </div>
          <div className={styles.accessShell} data-scroll="access-form">
            <div className={styles.accessMarks} aria-hidden="true"><i /><i /><i /><i /></div>
            <p>Pick an app. We’ll start there.</p>
            <fieldset className={styles.appChooser}>
              <legend>What do you want to learn first?</legend>
              {skills.map(([software]) => (
                <button
                  type="button"
                  aria-pressed={selectedApp === software}
                  onClick={() => setSelectedApp(software)}
                  key={software}
                >
                  {software}
                </button>
              ))}
            </fieldset>
            {submittedEmail ? (
              <div className={styles.waitlistSuccess} aria-live="polite">
                <strong>Preview complete.</strong>
                <p>{submittedEmail} was not sent or stored. Connect a waitlist provider before launch.</p>
                <fieldset>
                  <legend>Which best describes you? <span>Optional</span></legend>
                  {(['Student', 'Creator', 'Educator'] as const).map((option) => (
                    <button key={option} type="button" aria-pressed={role === option} onClick={() => setRole(option)}>{option}</button>
                  ))}
                </fieldset>
              </div>
            ) : (
              <form className={styles.waitlistForm} onSubmit={handleWaitlistSubmit} noValidate>
                <label htmlFor="waitlist-email">Email address</label>
                <div className={styles.emailRow}>
                  <input
                    id="waitlist-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-describedby={emailError ? 'waitlist-error waitlist-note' : 'waitlist-note'}
                    aria-invalid={Boolean(emailError)}
                    onChange={(event) => { setEmail(event.target.value); setEmailError(null); }}
                  />
                  <button type="submit">Join the alpha</button>
                </div>
                {emailError ? <p id="waitlist-error" className={styles.waitlistError} role="alert">{emailError}</p> : null}
                <p id="waitlist-note" className={styles.waitlistNote}>Preview mode. This form does not send or store your email yet.</p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
