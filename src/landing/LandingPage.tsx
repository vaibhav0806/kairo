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
  ['Blender', 'modelling, animation, materials, rendering'],
  ['Photoshop', 'layers, masks, retouching, compositing'],
  ['DaVinci Resolve', 'editing, color, audio, delivery'],
  ['Figma', 'layout, components, prototyping']
] as const;

const lessonSteps = [
  ['You ask or point', '“Why won\'t these cards resize with the frame?”', 'learnerStep'],
  ['Kairo understands', 'Cards / horizontal resizing', 'contextStep'],
  ['One next step', 'Set horizontal resizing to Fill container.', 'guideStep'],
  ['You do it', 'Changed to Fill container.', 'actionStep'],
  ['Kairo checks', 'Cards resize with the frame. Next step ready.', 'verifiedStep']
] as const;

const baseTutorCapabilities = [
  'Sees the current screen',
  'Hears the question',
  'Understands the annotation',
  'Points to the next control',
  'Checks the visible result'
] as const;

const productSkillCapabilities = [
  'Knows app terminology',
  'Teaches complete workflows',
  'Anticipates common mistakes',
  'Loads structured lesson recipes'
] as const;

interface ProductPreviewProps {
  demoPaused: boolean;
  onToggleDemo: () => void;
}

function ProductPreview({ demoPaused, onToggleDemo }: ProductPreviewProps) {
  return (
    <figure className={styles.productPreview} data-product-preview>
      <figcaption>
        <span>One lesson, shown in Blender</span>
        <strong>Blender skill active</strong>
        <button
          className={styles.demoControl}
          type="button"
          onClick={onToggleDemo}
        >
          {demoPaused ? 'Play demo' : 'Pause demo'}
        </button>
      </figcaption>
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

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [demoPaused, setDemoPaused] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [role, setRole] = useState<WaitlistRole | null>(null);

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
    const lessonStepObservers: IntersectionObserver[] = [];
    let previewObserver: IntersectionObserver | null = null;

    if (!reducedMotion && canObserve) {
      page.dataset.motionReady = 'true';
      const lessonStepElements = Array.from(page.querySelectorAll('[data-lesson-step]'));
      lessonStepObservers.push(...lessonStepElements.map((step) => {
        const stepIndex = lessonStepElements.indexOf(step);
        const observer = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) {
            lessonStepElements.slice(0, stepIndex + 1).forEach((visibleStep) => {
              visibleStep.setAttribute('data-step-visible', 'true');
            });
            observer.unobserve(step);
          }
        }, { threshold: 0.28, rootMargin: '0px 0px -45% 0px' });
        observer.observe(step);
        return observer;
      }));
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
      lessonStepObservers.forEach((observer) => observer.disconnect());
      previewObserver?.disconnect();
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
          <a href="#lesson">Lesson</a>
          <a href="#skills">Product skills</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className={styles.headerCta} href="#access">Join alpha <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <div>
              <p className={styles.eyebrow}>Kairo / a tutor inside your software</p>
              <h1 id="landing-title">
                Learn software <span className={styles.headlineDoing}>by doing.</span>
                {' '}<span className={styles.headlineContrast}>Not watching.</span>
              </h1>
              <p className={styles.heroIntro}>
                Ask Kairo what to do next. Talk or circle what you mean. Kairo answers aloud with
                one next step, waits while you do it, then checks the result before moving on.
              </p>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#access">Join the Mac alpha <span aria-hidden="true">↗</span></a>
              <a className={styles.secondaryAction} href="#lesson">See one complete lesson <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <ProductPreview demoPaused={demoPaused} onToggleDemo={() => setDemoPaused((paused) => !paused)} />
        </section>

        <section className={styles.distinction} aria-labelledby="distinction-title">
          <h2 id="distinction-title">Tutorials make you leave the work. Agents take over the work. Kairo teaches you inside it.</h2>
          <p>It starts from your screen, gives one move, waits while you try it, and checks before continuing.</p>
        </section>

        <section id="lesson" className={styles.lesson} aria-labelledby="lesson-title">
          <header className={styles.sectionHeader}>
            <p>One complete lesson in Figma</p>
            <h2 id="lesson-title">A lesson moves only when you do.</h2>
          </header>
          <ol className={styles.lessonSpine} aria-label="One Kairo lesson" data-motion="lesson">
            {lessonSteps.map(([label, detail, className], index) => (
              <li className={styles[className]} data-lesson-step={index + 1} key={label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{label}</h3>
                  <p>{detail}</p>
                  {index === 2 ? (
                    <span className={styles.spokenResponse} aria-label="Kairo spoken response">
                      <span className={styles.miniWave} aria-hidden="true"><i /><i /><i /><i /><i /></span>
                      Kairo answers aloud
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="skills" className={styles.skills} aria-labelledby="skills-title">
          <header className={styles.sectionHeader}>
            <p>One tutor, two layers</p>
            <div>
              <h2 id="skills-title">Works anywhere. Gets deeper with product skills.</h2>
              <p className={styles.skillsIntro}>Kairo can guide from the screen alone. Add a product skill for lessons that know the software's tools, language, and workflows.</p>
            </div>
          </header>
          <div className={styles.skillLayers}>
            <section className={styles.baseTutorLayer} aria-labelledby="base-tutor-title">
              <h3 id="base-tutor-title">In any desktop app</h3>
              <ul>
                {baseTutorCapabilities.map((capability) => <li key={capability}>{capability}</li>)}
              </ul>
            </section>
            <section className={styles.productSkillLayer} aria-labelledby="product-skill-title">
              <h3 id="product-skill-title">With a product skill</h3>
              <ul>
                {productSkillCapabilities.map((capability) => <li key={capability}>{capability}</li>)}
              </ul>
            </section>
          </div>
          <ul className={styles.skillList} aria-label="Available product skill examples">
            {skills.map(([software, knowledge]) => (
              <li className={styles.skillRow} key={software}>
                <h3>{software}</h3>
                <p>{knowledge}</p>
              </li>
            ))}
          </ul>
          <p className={styles.anySoftware}>And any other desktop software, even without a dedicated skill.</p>
        </section>

        <section id="trust" className={styles.trust} aria-labelledby="trust-title">
          <p>Trust</p>
          <h2 id="trust-title">Kairo starts only when you ask. Pause it anytime. It points; it never clicks for you.</h2>
          <p className={styles.trustLimit}>AI can make mistakes. Check important guidance and use your judgment.</p>
        </section>

        <section id="access" className={styles.access} aria-labelledby="access-title">
          <div>
            <p>Early access / Mac</p>
            <h2 id="access-title">Bring the software you want to learn.</h2>
          </div>
          <div className={styles.accessShell}>
            <p>Join the Mac alpha and bring the software you already use.</p>
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
