import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import styles from './LandingPage.module.css';

type WaitlistRole = 'Student' | 'Creator' | 'Educator';

export function validateWaitlistEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

const learningLoop = ['Talk', 'Draw', 'Understand', 'Guide', 'Verify'];

const skills = [
  ['Blender', 'Animation · materials · rendering', 'Active / alpha'],
  ['Photoshop', 'Layers · masks · retouching', 'Next'],
  ['DaVinci Resolve', 'Timeline · color · export', 'Planned'],
  ['Figma', 'Frames · auto layout · components', 'Planned'],
  ['Your institute', 'Curriculum · internal workflows', 'Custom skill / Not available yet']
] as const;

function ProductPreview() {
  return (
    <figure className={styles.productPreview} data-product-preview>
      <figcaption>
        <span>Product preview</span>
        <strong>First live skill / Blender</strong>
      </figcaption>
      <div className={styles.softwareFrame}>
        <img
          src={`${import.meta.env.BASE_URL}kairo-blender-preview.png`}
          alt="Blender startup scene used to demonstrate Kairo's on-screen guidance"
        />
        <svg className={styles.learnerAnnotation} viewBox="0 0 180 130" aria-hidden="true">
          <path d="M16 68 C9 25 130 5 163 46 C190 80 147 121 84 120 C28 118 1 91 16 68" />
        </svg>
        <div className={styles.kairoTarget}><span>Cube · target</span></div>
        <div className={styles.kairoCursor} aria-hidden="true">➤</div>
        <div className={styles.notch}>
          <span className={styles.wave} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Good. The cube is selected. Press I and choose Location.</span>
        </div>
        <blockquote className={styles.learnerAsk}>
          <b>You / voice + annotation</b>
          “How do I start animating this cube?”
        </blockquote>
        <div className={styles.progressRail} aria-label="Example lesson progress">
          <p>Make your first animation</p>
          <div className={styles.verified}><span>01</span><b>Select cube</b><em>Done</em></div>
          <div className={styles.current}><span>02</span><b>Insert keyframe</b><em>Now</em></div>
          <div><span>03</span><b>Move to frame 40</b><em>Next</em></div>
        </div>
      </div>
      <small>
        Interface image: <a href="https://docs.blender.org/manual/en/latest/editors/3dview/startup_scene.html">Blender Manual</a>, CC BY-SA. Kairo overlays are a product preview.
      </small>
    </figure>
  );
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
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
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      return;
    }

    page.dataset.motionReady = 'true';
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22 });

    page.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

    const preview = page.querySelector('[data-product-preview]');
    const previewObserver = new IntersectionObserver(([entry]) => {
      if (entry) page.dataset.demoActive = String(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (preview) previewObserver.observe(preview);

    const syncPageVisibility = () => {
      page.dataset.pageVisible = String(!document.hidden);
    };
    syncPageVisibility();
    document.addEventListener('visibilitychange', syncPageVisibility);

    return () => {
      revealObserver.disconnect();
      previewObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPageVisibility);
      delete page.dataset.motionReady;
      delete page.dataset.demoActive;
      delete page.dataset.pageVisible;
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.landingPage}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#how">How it works</a>
          <a href="#skills">Skills</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className={styles.headerCta} href="#access">Request access</a>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <div>
              <p className={styles.eyebrow}>Screen-native AI tutor / Mac alpha</p>
              <h1 id="landing-title">Learn software by doing. <span>Not watching.</span></h1>
              <p className={styles.heroIntro}>Kairo turns the screen in front of you into a live lesson. Ask a question, point to what you mean, and follow one verified step at a time.</p>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#access">Request access</a>
              <a className={styles.secondaryAction} href="#how">Watch Kairo teach <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <ProductPreview />
        </section>

        <ol className={styles.learningLoop} aria-label="Kairo learning loop">
          {learningLoop.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></li>
          ))}
        </ol>

        <section className={styles.problem} aria-labelledby="problem-title" data-reveal>
          <p>Why another way to learn?</p>
          <div>
            <h2 id="problem-title">Tutorials show their screen. Kairo starts from yours.</h2>
            <p>There is no hunting for the right timestamp or translating someone else’s setup. Ask from the place where you are stuck and keep working in your own file.</p>
          </div>
        </section>

        <section id="how" className={styles.how} aria-labelledby="how-title">
          <header className={styles.sectionHeader} data-reveal>
            <p>How it works</p>
            <h2 id="how-title">A question becomes your next clear action.</h2>
          </header>

          <article className={styles.chapter} data-reveal data-motion="conversation">
            <div className={styles.chapterCopy}>
              <span>01 / Ask naturally</span>
              <h3>Talk to Kairo. <span>Hear the answer.</span></h3>
              <p>Hold the shortcut and ask the question in your own words. Kairo answers aloud without pulling you away from the software.</p>
            </div>
            <div className={styles.chapterVisual} aria-label="Voice question and spoken guidance example">
              <p className={styles.visualLabel}>Learner input / voice</p>
              <blockquote className={styles.conversationQuestion} data-conversation-beat="question">“Why does this keyframe not move the cube?”</blockquote>
              <div className={`${styles.voiceResponse} ${styles.conversationResponse}`} data-conversation-beat="response">
                <span className={styles.miniWave} aria-hidden="true"><i /><i /><i /><i /><i /></span>
                <p><b>Kairo guidance / voice</b>Your second keyframe is at the same position. Move the playhead, then move the cube.</p>
              </div>
              <p className={styles.conversationAction} data-conversation-beat="action"><b>Learner action / move</b> Moves the cube at frame 40.</p>
              <p className={`${styles.visualVerification} ${styles.conversationVerified}`} data-conversation-beat="verification"><b>Movement verified</b> The cube changed position. Ready for the next step.</p>
            </div>
          </article>

          <article className={styles.chapter} data-reveal data-motion="annotation">
            <div className={styles.chapterCopy}>
              <span>02 / Point to context</span>
              <h3>Circle “this.” <span>Kairo resolves what you mean.</span></h3>
              <p>Draw around the control, object, or region you mean. Kairo combines your words with what is visible on your screen.</p>
            </div>
            <div className={styles.chapterVisual} aria-label="On-screen annotation grounding example">
              <p className={styles.visualLabel}>Learner input / annotation</p>
              <div className={styles.fakeToolbar}><span>Move</span><span>Rotate</span><span>Scale</span></div>
              <svg className={styles.drawnCircle} viewBox="0 0 180 110" aria-hidden="true">
                <path d="M13 58 C5 19 126 1 165 38 C199 70 149 107 87 104 C28 102 1 81 13 58" />
              </svg>
              <span className={styles.annotationLabel}>This control</span>
              <p className={styles.groundedAnswer}><b>Kairo guidance / resolved target</b>Object Properties → Transform → Location</p>
              <p className={styles.visualVerification}><b>Verification</b> Target found on your screen</p>
            </div>
          </article>

          <article className={styles.chapter} data-reveal data-motion="guidance">
            <div className={styles.chapterCopy}>
              <span>03 / Stay in control</span>
              <h3 aria-label="The AI points. You act.">The AI points. <span>You act.</span></h3>
              <p>Kairo marks the next control and explains the move. It does not take over your mouse, so the skill stays with you.</p>
            </div>
            <div className={styles.chapterVisual} aria-label="Kairo pointing to the learner's next action">
              <p className={styles.visualLabel}>Kairo guidance / next control</p>
              <div className={styles.guideNotch}>
                <span className={styles.miniWave} aria-hidden="true"><i /><i /><i /><i /><i /></span>
                <span>Choose Location to save the cube’s position.</span>
              </div>
              <div className={styles.targetControl}><span>Insert keyframe</span><b>Location</b></div>
              <span className={styles.guideCursor} aria-hidden="true">➤</span>
              <p className={styles.learnerAction}><b>Learner input / action</b> You choose and click Location</p>
              <p className={styles.visualVerification}><b>Verification</b> Action remains yours</p>
            </div>
          </article>

          <article className={styles.chapter} data-reveal data-motion="verification">
            <div className={styles.chapterCopy}>
              <span>04 / Build real progress</span>
              <h3 aria-label="Kairo checks before moving on.">Kairo checks <span>before moving on.</span></h3>
              <p>Kairo looks for the result of each step before giving you the next one. If the screen does not match, it helps you recover.</p>
            </div>
            <div className={`${styles.chapterVisual} ${styles.verifyVisual}`} aria-label="Lesson step verification example">
              <p className={styles.visualLabel}>Learner input / completed action</p>
              <div className={styles.checkRow}><span>01</span><b>Select cube</b><em>Verified</em></div>
              <div className={styles.checkRow}><span>02</span><b>Insert keyframe</b><em>Verified</em></div>
              <div className={`${styles.checkRow} ${styles.nextRow}`}><span>03</span><b>Move to frame 40</b><em>Next</em></div>
              <p className={styles.visualVerification}><b>Kairo guidance / verification</b> Two steps confirmed. Ready to continue.</p>
            </div>
          </article>
        </section>

        <section id="skills" className={styles.skills} aria-labelledby="skills-title">
          <header className={styles.sectionHeader} data-reveal>
            <p>Skills</p>
            <h2 id="skills-title">Deep in one tool first. More as Kairo learns them well.</h2>
          </header>
          <div className={styles.skillList} data-reveal data-motion="skills">
            {skills.map(([software, knowledge, status], index) => (
              <article className={styles.skillRow} key={software} style={{ '--skill-index': index } as CSSProperties}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{software}</h3>
                <p>{knowledge}</p>
                <strong data-status={status}>{status}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.difference} aria-labelledby="difference-title" data-reveal>
          <div className={styles.differenceLead}>
            <p>What makes Kairo different</p>
            <h2 id="difference-title">Built around learning, not task completion.</h2>
          </div>
          <div className={styles.principles}>
            <p><span>01</span><b>Your screen</b>Context starts with the work in front of you.</p>
            <p><span>02</span><b>One step</b>Guidance stays small enough to understand.</p>
            <p><span>03</span><b>Your action</b>Kairo points; it does not take over.</p>
            <p><span>04</span><b>Real progress</b>Each move is checked before the lesson continues.</p>
          </div>
        </section>

        <section id="trust" className={styles.trust} aria-labelledby="trust-title" data-reveal>
          <header className={styles.sectionHeader}>
            <p>Trust</p>
            <h2 id="trust-title">Quiet until you ask. Clear about its limits.</h2>
          </header>
          <div className={styles.trustColumns}>
            <article>
              <span>Activation</span>
              <h3>You choose when Kairo looks and listens.</h3>
              <p>Activate guidance with the shortcut. You can pause guidance at any time. The app stays visually quiet while you work.</p>
            </article>
            <article>
              <span>Learner control</span>
              <h3>You remain the operator.</h3>
              <p>Kairo can point and explain, but it does not click through the software for you.</p>
            </article>
            <article>
              <span>Honest limits</span>
              <h3>AI can make mistakes.</h3>
              <p>Check important guidance and use your judgment. Kairo verifies what it can see, not what it cannot know.</p>
            </article>
          </div>
        </section>

        <section id="access" className={styles.access} aria-labelledby="access-title" data-reveal>
          <div>
            <p>Early access / Mac</p>
            <h2 id="access-title">Learn inside the work.</h2>
          </div>
          <div className={styles.accessShell}>
            <p>Kairo is beginning with Blender learners. Join the early-access list to hear when a place opens.</p>
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
                  <button type="submit">Request access</button>
                </div>
                {emailError ? <p id="waitlist-error" className={styles.waitlistError} role="alert">{emailError}</p> : null}
                <p id="waitlist-note" className={styles.waitlistNote}>Preview mode. This form does not send or store your email yet.</p>
              </form>
            )}
            <p><b>Blender first.</b> Photoshop, DaVinci Resolve, and Figma follow.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
