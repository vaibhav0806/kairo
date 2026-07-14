# Kairo Field Notes Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Kairo landing page as a crisp-white, organic, image-led editorial experience with a sharp Blender demonstration, visible scroll progression, cross-tool breadth, and a mock waitlist.

**Architecture:** Keep the existing React 19 and Vite application, but split the 662-line page and 3,109-line stylesheet into four section-owned component pairs plus a thin page shell. Use CSS, inline SVG, `IntersectionObserver`, and one `requestAnimationFrame`-throttled scroll listener instead of adding an animation library. Store optimized licensed photography locally and preserve the existing high-resolution Blender capture.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, CSS Modules, Vitest 4, Testing Library, Fontsource Geist, Fontsource Instrument Serif

## Global Constraints

- Primary canvas is `#ffffff`; secondary surfaces are cool white and very light neutral gray, never beige.
- Kairo violet, learner coral, and verified green are functional signals, not decorative section backgrounds.
- Blender is the lead demonstration but the page must show Figma, VS Code, Photoshop, and broader desktop-tool coverage.
- Keep copy direct, friendly, and short; avoid repeated use of “software,” “AI tutor,” and “skill.”
- Keep the waitlist local-only with honest disclosure; no network request and no storage.
- Use properly licensed local images; do not hotlink production imagery.
- Preserve native controls, keyboard focus, 44-pixel touch targets, and complete reduced-motion states.
- Keep the repository website-only; no Tauri, native application, cursor overlay, or provider code.
- Do not add GSAP, Framer Motion, WebGL, Canvas, or a component library.

---

## File Map

- `src/landing/LandingPage.tsx`: page composition, global reveal observer, header, and footer.
- `src/landing/LandingPage.module.css`: root tokens, structural grid, header, footer, reveal contract, and global breakpoints.
- `src/landing/Hero.tsx`: hero copy, pause state, Blender product window, tactile image layers, and voice/annotation primitives.
- `src/landing/Hero.module.css`: two-column composition, photo/product layering, calibrated Blender overlays, and hero timeline.
- `src/landing/LearningSequence.tsx`: Ask → Point → Try → Check data, sticky-scene state, and scroll synchronization.
- `src/landing/LearningSequence.module.css`: pinned product chapter, state-specific overlays, and stepped fallback.
- `src/landing/VisualField.tsx`: cross-tool print composition, Ask/Try/Learn panels, and image credits.
- `src/landing/VisualField.module.css`: organic workbench scene, print layers, inline-SVG connectors, and panel reveals.
- `src/landing/TrustWaitlist.tsx`: trust promises, email validation, mock waitlist, and success state.
- `src/landing/TrustWaitlist.module.css`: dark tactile trust scene, hard white panels, and white conversion chapter.
- `public/field-notes/*.webp`: optimized local Pexels photography.
- `tests/landingPage.test.ts`: structure, behavior, asset, motion, responsive, and accessibility contracts.
- `tests/landingWaitlist.test.ts`: pause and waitlist interaction behavior.
- `tests/landingMetadata.test.ts`: metadata and website-only boundary.

---

### Task 1: Lock the editorial architecture and typography

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/main.tsx`
- Modify: `src/landing/LandingPage.tsx`
- Replace: `src/landing/LandingPage.module.css`
- Create: `src/landing/Hero.tsx`
- Create: `src/landing/Hero.module.css`
- Create: `src/landing/LearningSequence.tsx`
- Create: `src/landing/LearningSequence.module.css`
- Create: `src/landing/VisualField.tsx`
- Create: `src/landing/VisualField.module.css`
- Create: `src/landing/TrustWaitlist.tsx`
- Create: `src/landing/TrustWaitlist.module.css`
- Modify: `tests/landingPage.test.ts`
- Modify: `tests/landingWaitlist.test.ts`

**Interfaces:**
- Produces: `Hero(): JSX.Element`, `LearningSequence(): JSX.Element`, `VisualField(): JSX.Element`, `TrustWaitlist(): JSX.Element`, `validateWaitlistEmail(value: string): string | null`.
- Produces semantic section IDs: `top`, `how-it-works`, `tools`, `practice`, `trust`, and `access`.
- `LandingPage.tsx` re-exports `validateWaitlistEmail` to preserve the public test import.

- [ ] **Step 1: Add a failing architecture test**

Replace the old hero/switcher structure assertions in `tests/landingPage.test.ts` with this ordered landmark test:

```ts
test('renders the approved field-notes chapters in order', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  const markers = [
    'id="top"',
    'id="how-it-works"',
    'id="tools"',
    'id="practice"',
    'id="trust"',
    'id="access"',
    '<footer'
  ];
  const positions = markers.map((marker) => html.indexOf(marker));

  positions.forEach((position) => expect(position).toBeGreaterThan(-1));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(html).toContain('data-field-notes="true"');
});
```

At the same time, remove the outgoing implementation-coupled tests for app-tab switching, the trust carousel, old creative JPEG names, exact legacy CSS coordinates, the old ambient-stage count, the Figma-specific selector, and the saturated eight-color palette. Keep email validation, website-only metadata, pause behavior, waitlist accessibility, and the high-resolution Blender source check. Remove the app/goal selector test from `tests/landingWaitlist.test.ts` because the approved waitlist has one email field.

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `npm test -- tests/landingPage.test.ts -t "renders the approved field-notes chapters in order"`
Expected: FAIL because `tools`, `practice`, and the footer are absent.

- [ ] **Step 3: Install the licensed editorial serif**

Run: `npm install @fontsource/instrument-serif@5.2.8`
Expected: `package.json` and `package-lock.json` add the OFL-1.1 Fontsource package without any other dependency change.

Add the import to `src/main.tsx`:

```ts
import '@fontsource/instrument-serif';
```

- [ ] **Step 4: Create section-owned component shells and compose the page**

Implement the final semantic shell in `src/landing/LandingPage.tsx`:

```tsx
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
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
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
        <div><a href="#top">Home</a><a href="#how-it-works">How it works</a><a href="#access">Join</a></div>
        <p>Learn by doing.</p>
        <strong aria-label="Kairo">kairo</strong>
      </footer>
    </div>
  );
}
```

Create `src/landing/Hero.tsx` as the first working hero state:

```tsx
import { useState } from 'react';
import styles from './Hero.module.css';

export function Hero() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={styles.hero} aria-labelledby="landing-title" data-reveal>
      <div>
        <p>Help, right where you are learning</p>
        <h1 id="landing-title">Turn stuck into your next move.</h1>
        <p>Ask out loud or point to the confusing bit. Kairo shows one step and stays while you try it.</p>
        <a href="#access">Join the alpha</a>
      </div>
      <figure data-hero-stage>
        <figcaption>Live lesson</figcaption>
        <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          {paused ? 'Play lesson' : 'Pause lesson'}
        </button>
      </figure>
    </section>
  );
}
```

Create `src/landing/LearningSequence.tsx` with the complete semantic sequence:

```tsx
import styles from './LearningSequence.module.css';

const chapters = [
  ['ask', 'Ask'], ['point', 'Point'], ['try', 'Try'], ['checked', 'Check']
] as const;

export function LearningSequence() {
  return (
    <section id="how-it-works" className={styles.sequence} aria-labelledby="sequence-title" data-reveal>
      <h2 id="sequence-title">One move at a time.</h2>
      <div data-learning-workspace data-workspace-state="ask">Kairo stays with the work.</div>
      <ol>
        {chapters.map(([id, label], index) => (
          <li key={id} data-lesson-chapter={id} data-chapter-index={index}>{label}</li>
        ))}
      </ol>
    </section>
  );
}
```

Create `src/landing/VisualField.tsx` with both labelled regions:

```tsx
import styles from './VisualField.module.css';

export function VisualField() {
  return (
    <>
      <section id="tools" className={styles.tools} aria-labelledby="tools-title" data-reveal>
        <h2 id="tools-title">Learn across your tools</h2>
        <div>{['Blender', 'Figma', 'VS Code', 'Photoshop'].map((tool) => <figure key={tool} data-tool-print><figcaption>{tool}</figcaption></figure>)}</div>
        <svg data-tool-connector aria-hidden="true" viewBox="0 0 1200 420"><path d="M72 302C236 82 405 70 546 230s344 140 580-84" /></svg>
      </section>
      <section id="practice" className={styles.practice} aria-labelledby="practice-title" data-reveal>
        <h2 id="practice-title">Ask, try, learn</h2>
        {['Ask', 'Try', 'Learn'].map((title) => <article key={title}><h3>{title}</h3></article>)}
      </section>
    </>
  );
}
```

Create `src/landing/TrustWaitlist.tsx` with the existing validation contract:

```tsx
import { useState, type FormEvent } from 'react';
import styles from './TrustWaitlist.module.css';

export function validateWaitlistEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

export function TrustWaitlist() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validateWaitlistEmail(email);
    if (nextError) {
      setError(nextError);
      (event.currentTarget.elements.namedItem('waitlist-email') as HTMLInputElement).focus();
      return;
    }
    setError(null);
    setSubmitted(email.trim());
  };
  return (
    <>
      <section id="trust" className={styles.trust} aria-labelledby="trust-title" data-reveal>
        <h2 id="trust-title">You stay in control.</h2>
      </section>
      <section id="access" className={styles.waitlist} aria-labelledby="access-title" data-reveal>
        <h2 id="access-title">Learn what you want to make.</h2>
        {submitted ? <div aria-live="polite"><p>Preview complete</p><p>{submitted}</p><small>Nothing was sent or stored.</small></div> : (
          <form onSubmit={submit} noValidate>
            <label htmlFor="waitlist-email">Email address</label>
            <input id="waitlist-email" name="waitlist-email" type="email" autoComplete="email" value={email} aria-invalid={Boolean(error)} aria-describedby={error ? 'waitlist-error waitlist-note' : 'waitlist-note'} onChange={(event) => { setEmail(event.target.value); setError(null); }} />
            <button type="submit">Join the alpha</button>
            {error ? <p id="waitlist-error" role="alert">{error}</p> : null}
            <p id="waitlist-note">Preview only. This form does not send or store your email yet.</p>
          </form>
        )}
      </section>
    </>
  );
}
```

Create the four referenced CSS Module files with the named root classes and no hiding rules. Every section now renders its headline and working control before its richer scene is added.

- [ ] **Step 5: Establish the white grid and type tokens**

Start `LandingPage.module.css` with the final shared contract:

```css
.page {
  --paper: #ffffff;
  --paper-cool: #f6f7f8;
  --ink: #111315;
  --muted: #666b70;
  --line: #dfe2e4;
  --violet: #7057ff;
  --coral: #ff6247;
  --green: #249765;
  min-width: 320px;
  overflow-x: clip;
  background-color: var(--paper);
  background-image: linear-gradient(to right, transparent calc(100% - 1px), rgba(17, 19, 21, 0.055) 1px);
  background-size: min(6.25vw, 96px) 100%;
  color: var(--ink);
  font-family: "Geist Variable", Inter, sans-serif;
}

.page :global(h1),
.page :global(h2) {
  font-family: "Instrument Serif", Georgia, serif;
  font-weight: 400;
}

.page :global(a),
.page :global(button),
.page :global(input) {
  min-height: 44px;
}

.page :focus-visible {
  outline: 3px solid var(--violet);
  outline-offset: 4px;
}
```

- [ ] **Step 6: Run the architecture and baseline behavior tests**

Run: `npm test -- tests/landingPage.test.ts tests/landingWaitlist.test.ts`
Expected: PASS for the new architecture, pause control, email validation, focus-on-error, and local-only success disclosure.

- [ ] **Step 7: Commit the architecture**

```bash
git add package.json package-lock.json src tests/landingPage.test.ts
git commit -m "refactor: split landing into editorial chapters"
```

---

### Task 2: Build the tactile hero and optimize its photography

**Files:**
- Create: `public/field-notes/field-hero.webp`
- Create: `public/field-notes/field-hero-mobile.webp`
- Create: `public/field-notes/meadow-edge.webp`
- Modify: `src/landing/Hero.tsx`
- Modify: `src/landing/Hero.module.css`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- `Hero` owns `paused: boolean` and exposes one button whose accessible name toggles between `Pause lesson` and `Play lesson`.
- Hero root provides `data-hero-environment`; Blender figure provides `data-hero-stage`.
- Uses `asset(filename: string)` locally to prepend `import.meta.env.BASE_URL`.

- [ ] **Step 1: Add failing hero and asset tests**

```ts
test('leads with an editorial hero inside a tactile product scene', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain('data-hero-environment="true"');
  expect(html).toContain('data-hero-stage="true"');
  expect(html).toContain('kairo-blender-preview.webp');
  expect(html).toContain('field-notes/field-hero.webp');
  expect(html).toContain('Pause lesson');
  expect(html).not.toContain('Blender skill active');
});

test('ships optimized local tactile photography with visible credits', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  ['field-hero.webp', 'field-hero-mobile.webp', 'meadow-edge.webp'].forEach((name) => {
    const image = readFileSync(`public/field-notes/${name}`);
    expect(image.toString('ascii', 0, 4)).toBe('RIFF');
    expect(image.toString('ascii', 8, 12)).toBe('WEBP');
    expect(image.byteLength).toBeLessThan(900_000);
  });
  expect(html).toContain('Pexels');
});
```

- [ ] **Step 2: Run the hero test and verify the red state**

Run: `npm test -- tests/landingPage.test.ts -t "editorial hero|optimized local tactile"`
Expected: FAIL because the field-note images and environment wrapper do not exist.

- [ ] **Step 3: Download and encode the licensed photography**

```bash
mkdir -p public/field-notes /tmp/kairo-field-notes
curl -L "https://images.pexels.com/photos/5420986/pexels-photo-5420986.jpeg?auto=compress&cs=tinysrgb&w=2400" -o /tmp/kairo-field-notes/field-hero.jpg
curl -L "https://images.pexels.com/photos/9414025/pexels-photo-9414025.jpeg?auto=compress&cs=tinysrgb&w=1600" -o /tmp/kairo-field-notes/field-hero-mobile.jpg
curl -L "https://images.pexels.com/photos/17033427/pexels-photo-17033427.jpeg?auto=compress&cs=tinysrgb&w=2400" -o /tmp/kairo-field-notes/meadow-edge.jpg
cwebp -quiet -q 78 -resize 2200 0 /tmp/kairo-field-notes/field-hero.jpg -o public/field-notes/field-hero.webp
cwebp -quiet -q 78 -resize 1200 0 /tmp/kairo-field-notes/field-hero-mobile.jpg -o public/field-notes/field-hero-mobile.webp
cwebp -quiet -q 76 -resize 2200 0 /tmp/kairo-field-notes/meadow-edge.jpg -o public/field-notes/meadow-edge.webp
```

Credit the source pages in `Hero.tsx`: Kaboompics/Pexels photo `5420986`, Sasha Kim/Pexels photo `9414025`, and Budget Bizar/Pexels photo `17033427`.

- [ ] **Step 4: Implement the composed hero scene**

Build `Hero.tsx` around this final structure:

```tsx
<section className={styles.hero} aria-labelledby="landing-title" data-hero-environment data-reveal>
  <div className={styles.copy}>
    <p className={styles.kicker}>Help, right where you are learning</p>
    <h1 id="landing-title">Turn stuck into your next move.</h1>
    <p>Ask out loud or point to the confusing bit. Kairo shows one step and stays while you try it.</p>
    <a href="#access">Join the alpha <span aria-hidden="true">↗</span></a>
  </div>
  <div className={styles.environment}>
    <picture className={styles.fieldPhoto}>
      <source media="(max-width: 760px)" srcSet={asset('field-notes/field-hero-mobile.webp')} />
      <img src={asset('field-notes/field-hero.webp')} alt="A creative workbench with paper and drawing tools" width="2200" height="1467" fetchPriority="high" />
    </picture>
    <img className={styles.meadowEdge} src={asset('field-notes/meadow-edge.webp')} alt="" width="2200" height="1467" aria-hidden="true" />
    <figure className={styles.productWindow} data-hero-stage>
      <figcaption><span>Live lesson</span><button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? 'Play lesson' : 'Pause lesson'}</button></figcaption>
      <div className={styles.blenderViewport}>
        <img src={asset('kairo-blender-preview.webp')} alt="Blender with Kairo guiding the selected cube" width="3560" height="1972" />
        <div className={styles.question}>How do I animate this?</div>
        <svg className={styles.annotation} viewBox="0 0 240 180" aria-hidden="true"><path d="M18 102C24 36 92 16 164 30c60 12 78 78 26 110-50 31-146 21-172-38Z" /></svg>
        <div className={styles.instruction}>Press I, then choose Location.</div>
      </div>
    </figure>
  </div>
</section>
```

Reuse the current calibrated cube target geometry and nine-second activation lifecycle. Make the Blender image itself fully opaque and sharp; apply blur or dither only to separate decorative layers.

- [ ] **Step 5: Implement responsive hero composition and pause lifecycle**

In `Hero.module.css`, use a two-column grid only at `min-width: 1180px`. Stack copy above a wide scene below that threshold. Keep the Blender viewport at `aspect-ratio: 3560 / 1972`, use `object-fit: cover`, and preserve the mobile transcript below `760px`. Gate autoplay with visibility, document visibility, `data-demo-paused`, and reduced motion.

- [ ] **Step 6: Verify hero behavior and assets**

Run: `npm test -- tests/landingPage.test.ts -t "editorial hero|optimized local tactile|high-resolution Blender"`
Run: `npm test -- tests/landingWaitlist.test.ts -t "pause and resume"`
Expected: PASS.

- [ ] **Step 7: Commit the hero**

```bash
git add public/field-notes src/landing/Hero.tsx src/landing/Hero.module.css tests/landingPage.test.ts
git commit -m "feat: compose tactile product hero"
```

---

### Task 3: Rebuild the sticky learning sequence

**Files:**
- Modify: `src/landing/LearningSequence.tsx`
- Modify: `src/landing/LearningSequence.module.css`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- `lessonChapters` is a four-item readonly array with IDs `ask`, `point`, `try`, and `checked`.
- Root film exposes `data-active-chapter="0|1|2|3"`; the anchored scene exposes `data-workspace-state="ask|point|try|checked"`.
- Each chapter marker exposes `data-chapter-index` for the tested reading-line calculation.

- [ ] **Step 1: Preserve the behavioral test and add the single-scene contract**

```ts
test('shows one anchored scene through the complete learning loop', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  expect(html.match(/data-learning-workspace=/g)).toHaveLength(1);
  expect(html.match(/data-lesson-chapter=/g)).toHaveLength(4);
  ['Ask', 'Point', 'Try', 'Check'].forEach((label) => expect(html).toContain(label));
  expect(html).toContain('data-active-chapter="0"');
  expect(html).toContain('data-workspace-state="ask"');
});
```

Keep the existing `getBoundingClientRect` plus `requestAnimationFrame` test and update its expected final state from `checked` only if the component naming changes; the data values must remain unchanged.

- [ ] **Step 2: Run the focused sequence tests**

Run: `npm test -- tests/landingPage.test.ts -t "anchored scene|keeps the lesson workspace in sync"`
Expected: first test FAIL until the new workspace contract is rendered; scroll-sync test may fail during the component split.

- [ ] **Step 3: Implement the reading-line state calculation**

Use the existing passive scroll/resize/hashchange/pageshow listener and `requestAnimationFrame` throttling. Compute the nearest chapter to `Math.min(window.innerHeight * 0.48, 520)`, store only the discrete `activeChapter`, and cancel the pending frame on cleanup.

- [ ] **Step 4: Implement state-specific visual layers**

Render one `data-learning-workspace` containing the Blender image, coral learner mark, violet target, instruction card, learner action, and green verified card. Switch their visibility with `data-workspace-state`; never mount four copies of the Blender viewport.

Use this CSS state contract:

```css
.workspace[data-workspace-state='ask'] .question,
.workspace[data-workspace-state='point'] .question,
.workspace[data-workspace-state='point'] .target,
.workspace[data-workspace-state='point'] .instruction,
.workspace[data-workspace-state='try'] .action,
.workspace[data-workspace-state='checked'] .verified {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
```

Keep every alternate state visible in the DOM for assistive technology, but mark decorative duplicate labels `aria-hidden="true"`. Put the active text summary in one `role="status"` element.

- [ ] **Step 5: Add sticky and stepped layout rules**

Enable the two-column pinned scene only inside:

```css
@media (min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference) {
  .workspace { position: sticky; top: 96px; }
}
```

For narrower or shorter viewports, place the complete workspace above four readable chapter rows with no pinned timing.

- [ ] **Step 6: Run the sequence tests**

Run: `npm test -- tests/landingPage.test.ts -t "learning loop|anchored scene|lesson workspace"`
Expected: PASS.

- [ ] **Step 7: Commit the sequence**

```bash
git add src/landing/LearningSequence.tsx src/landing/LearningSequence.module.css tests/landingPage.test.ts
git commit -m "feat: choreograph scroll learning sequence"
```

---

### Task 4: Build the organic cross-tool visual field

**Files:**
- Create: `public/field-notes/workbench.webp`
- Create: `public/field-notes/sketches.webp`
- Delete: `public/creative-3d.jpg`
- Delete: `public/creative-design.jpg`
- Delete: `public/creative-edit.jpg`
- Delete: `public/creative-layout.jpg`
- Modify: `src/landing/VisualField.tsx`
- Modify: `src/landing/VisualField.module.css`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- `VisualField` renders two regions: `#tools` labelled “Learn across your tools” and `#practice` labelled “Ask, try, learn”.
- `#tools` renders all four tool labels at once: Blender, Figma, VS Code, Photoshop.
- `#practice` renders exactly three `<article>` panels in Ask → Try → Learn order.

- [ ] **Step 1: Replace the outgoing tab-switcher test with visual-composition tests**

```ts
test('shows Kairo across multiple tools in one visual composition', () => {
  render(createElement(LandingPage));
  const region = screen.getByRole('region', { name: 'Learn across your tools' });
  ['Blender', 'Figma', 'VS Code', 'Photoshop'].forEach((tool) => {
    expect(within(region).getByText(tool)).toBeTruthy();
  });
  expect(region.querySelectorAll('[data-tool-print]')).toHaveLength(4);
  expect(region.querySelector('[data-tool-connector]')?.getAttribute('aria-hidden')).toBe('true');
});

test('shows three concise practice moments in one environment', () => {
  render(createElement(LandingPage));
  const region = screen.getByRole('region', { name: 'Ask, try, learn' });
  const panels = within(region).getAllByRole('article');
  expect(panels).toHaveLength(3);
  expect(panels.map((panel) => panel.querySelector('h3')?.textContent)).toEqual(['Ask', 'Try', 'Learn']);
});
```

- [ ] **Step 2: Run the visual-field tests and verify the red state**

Run: `npm test -- tests/landingPage.test.ts -t "multiple tools|practice moments"`
Expected: FAIL until the old app tabs are replaced.

- [ ] **Step 3: Create the two continuous environmental assets**

```bash
mkdir -p /tmp/kairo-field-notes public/field-notes
curl -L "https://images.pexels.com/photos/1111692/pexels-photo-1111692.jpeg?auto=compress&cs=tinysrgb&w=2400" -o /tmp/kairo-field-notes/sketches.jpg
curl -L "https://images.pexels.com/photos/7147730/pexels-photo-7147730.jpeg?auto=compress&cs=tinysrgb&w=2000" -o /tmp/kairo-field-notes/workbench.jpg
cwebp -quiet -q 76 -resize 2200 0 /tmp/kairo-field-notes/sketches.jpg -o public/field-notes/sketches.webp
cwebp -quiet -q 76 -resize 1600 0 /tmp/kairo-field-notes/workbench.jpg -o public/field-notes/workbench.webp
rm public/creative-3d.jpg public/creative-design.jpg public/creative-edit.jpg public/creative-layout.jpg
```

Credit Karol D/Pexels photo `1111692` and Michael Burrows/Pexels photo `7147730` in the section’s visible credit line.

- [ ] **Step 4: Implement the cross-tool print composition**

Render four overlapping `<figure data-tool-print>` elements. Use the existing Blender image for the Blender print. Build recognizable Figma, VS Code, and Photoshop canvases from semantic labels plus CSS-rendered interface fragments; do not copy proprietary logos or hotlink screenshots. Add one decorative inline SVG connector:

```tsx
<svg className={styles.connector} data-tool-connector aria-hidden="true" viewBox="0 0 1200 420">
  <path d="M72 302C236 82 405 70 546 230s344 140 580-84" />
</svg>
```

The violet path connects the four prints and a coral hand-drawn mark identifies the focused area on each.

- [ ] **Step 5: Implement the continuous Ask/Try/Learn environment**

Use one lazy-loaded workbench image behind all three articles. Keep each article to a label, headline, and one sentence:

```tsx
const practiceMoments = [
  { label: '01', title: 'Ask', copy: 'Say what is confusing or point straight at it.' },
  { label: '02', title: 'Try', copy: 'Follow one clear move while Kairo stays with you.' },
  { label: '03', title: 'Learn', copy: 'See what changed, then keep going with confidence.' }
] as const;
```

Use square or lightly rounded white panels, hairline borders, and photographic crops. Do not use three unrelated colored cards.

- [ ] **Step 6: Verify imagery and visual-field behavior**

Run: `npm test -- tests/landingPage.test.ts -t "multiple tools|practice moments|optimized local tactile"`
Expected: PASS with all local images under the per-image budget.

- [ ] **Step 7: Commit the visual field**

```bash
git add public/field-notes src/landing/VisualField.tsx src/landing/VisualField.module.css tests/landingPage.test.ts
git commit -m "feat: add organic cross-tool visual field"
```

---

### Task 5: Finish the trust, waitlist, and footer chapters

**Files:**
- Create: `public/field-notes/trust-rock.webp`
- Modify: `src/landing/TrustWaitlist.tsx`
- Modify: `src/landing/TrustWaitlist.module.css`
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/landingPage.test.ts`
- Modify: `tests/landingWaitlist.test.ts`

**Interfaces:**
- `validateWaitlistEmail(value)` retains current messages and trimming behavior.
- Waitlist contains one `name="waitlist-email"` input and one submit button.
- Trust section renders three statements with no interactive carousel.
- Footer renders a dark chapter and an oversized visible `kairo` wordmark.

- [ ] **Step 1: Add failing trust, simple-waitlist, and footer tests**

```ts
test('states the three control promises without unsupported claims', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  expect(html).toContain('Starts only when you ask');
  expect(html).toContain('Pause anytime');
  expect(html).toContain('Points, never clicks');
  expect(html).toContain('AI can get things wrong');
  expect(html).not.toMatch(/military-grade|zero data retention|SOC 2/i);
});

test('renders one local-only waitlist field and a structured footer', () => {
  render(createElement(LandingPage));
  expect(screen.getAllByLabelText('Email address')).toHaveLength(1);
  expect(screen.getByRole('contentinfo')).toBeTruthy();
  expect(screen.getByRole('contentinfo').querySelector('[data-footer-wordmark]')?.textContent).toBe('kairo');
});
```

Confirm the outgoing app/goal selector test is absent from `tests/landingWaitlist.test.ts`; keep the pause, invalid email, trimmed email, and honest disclosure tests.

- [ ] **Step 2: Run the conversion-chapter tests**

Run: `npm test -- tests/landingPage.test.ts -t "control promises|local-only waitlist"`
Expected: FAIL until the trust carousel and builder are replaced.

- [ ] **Step 3: Encode the dark organic texture**

```bash
mkdir -p /tmp/kairo-field-notes public/field-notes
curl -L "https://images.pexels.com/photos/3707669/pexels-photo-3707669.jpeg?auto=compress&cs=tinysrgb&w=2400" -o /tmp/kairo-field-notes/trust-rock.jpg
cwebp -quiet -q 74 -resize 2200 0 /tmp/kairo-field-notes/trust-rock.jpg -o public/field-notes/trust-rock.webp
```

Credit Mitchell Luo/Pexels photo `3707669` in the trust section.

- [ ] **Step 4: Implement the concise trust chapter**

Render the dark texture full-bleed with three hard white panels:

```tsx
const trustPromises = [
  ['01', 'Starts only when you ask', 'Kairo waits until you begin a lesson.'],
  ['02', 'Pause anytime', 'Stop the lesson whenever you want.'],
  ['03', 'Points, never clicks', 'You make every move yourself.']
] as const;
```

Add the visible note `AI can get things wrong. Check important guidance and use your judgment.`

- [ ] **Step 5: Simplify the waitlist without changing its guarantees**

Keep `validateWaitlistEmail`, focus invalid input, `aria-invalid`, `aria-describedby`, and the success state. Remove the app and goal selectors. Use the success copy `You are on the preview list.` and retain `Nothing was sent or stored.` until a real integration exists.

- [ ] **Step 6: Build the black editorial footer**

Add `data-footer-wordmark` to the footer `<strong>`. Use a near-black field, numbered navigation labels, and a clipped display wordmark at `clamp(8rem, 24vw, 28rem)`. Keep links keyboard accessible and ensure the footer remains readable at 320 pixels.

- [ ] **Step 7: Run trust and waitlist tests**

Run: `npm test -- tests/landingPage.test.ts -t "control promises|local-only waitlist"`
Run: `npm test -- tests/landingWaitlist.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit the conversion chapters**

```bash
git add public/field-notes src/landing/TrustWaitlist.tsx src/landing/TrustWaitlist.module.css src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests
git commit -m "feat: finish trust waitlist and footer"
```

---

### Task 6: Add the shared reveal, parallax, and reduced-motion system

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Modify: `src/landing/Hero.module.css`
- Modify: `src/landing/LearningSequence.module.css`
- Modify: `src/landing/VisualField.module.css`
- Modify: `src/landing/TrustWaitlist.module.css`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- Page root uses `data-motion-ready`, `data-page-visible`, and `data-reduced-motion`.
- Reveal targets use `data-reveal`; observer sets `data-revealed="true"` once.
- Ambient scenes use `data-ambient-stage`; observer sets `data-ambient-active="true|false"`.
- Hidden entrance states only apply beneath `[data-motion-ready='true']`.

- [ ] **Step 1: Replace the observer stub with a controllable harness**

```ts
class IntersectionObserverHarness {
  static instances: IntersectionObserverHarness[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    IntersectionObserverHarness.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  trigger(target: Element, isIntersecting: boolean) {
    this.callback([{ target, isIntersecting }] as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}
```

Add tests that trigger a reveal target and ambient target, assert their data attributes, switch `matchMedia().matches` to `true`, and assert `data-motion-ready` is absent while every section remains in the DOM.

- [ ] **Step 2: Run the observer tests and verify the red state**

Run: `npm test -- tests/landingPage.test.ts -t "reveals a visual chapter|stops ambient motion|reduced motion"`
Expected: FAIL until the page controller sets the complete contract.

- [ ] **Step 3: Implement the page-level lifecycle**

In one `useEffect`, read reduced motion, set page visibility, create the reveal and ambient observers, observe their matching targets, and clean up observers/listeners. Reveal state is one-shot; ambient state follows current intersection. If `IntersectionObserver` is unavailable, set every reveal target to revealed and do not hide content.

- [ ] **Step 4: Apply the restrained visual motion**

Use only these motion families:

```css
[data-motion-ready='true'] [data-reveal]:not([data-revealed='true']) {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  clip-path: inset(0 0 10% 0);
}

[data-reveal] {
  transition: opacity 700ms ease, transform 800ms cubic-bezier(.2,.7,.2,1), clip-path 800ms cubic-bezier(.2,.7,.2,1);
}

[data-ambient-active='true'] .ambientPhoto {
  transform: scale(1);
}
```

Keep translation at or below 32 pixels. Animate SVG annotations with `stroke-dasharray` and `stroke-dashoffset`; do not rasterize cursor trails or grid lines.

- [ ] **Step 5: Add complete reduced-motion and small-screen fallbacks**

```css
@media (prefers-reduced-motion: reduce) {
  .page { scroll-behavior: auto; }
  .page *, .page *::before, .page *::after {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    clip-path: none !important;
  }
  [data-reveal] { opacity: 1 !important; }
}
```

In the hero, show one intentional static state instead of every timeline layer. In the learning sequence, show the four complete rows without sticky positioning. Remove pointer-responsive effects for `(hover: none)`.

- [ ] **Step 6: Run motion and accessibility tests**

Run: `npm test -- tests/landingPage.test.ts -t "reveals a visual chapter|ambient motion|reduced motion|native controls"`
Expected: PASS.

- [ ] **Step 7: Commit the motion system**

```bash
git add src/landing tests/landingPage.test.ts
git commit -m "feat: add cinematic scroll motion system"
```

---

### Task 7: Complete responsive, performance, and browser verification

**Files:**
- Modify: `src/landing/*.module.css`
- Modify: `tests/landingPage.test.ts`
- Modify: `README.md`

**Interfaces:**
- Desktop hero is two-column at `1180px+`; tablet and mobile stack.
- Sticky learning sequence activates only at `960px+`, `720px+` viewport height, and no reduced motion.
- Below-fold images use `loading="lazy"`, `decoding="async"`, explicit width/height, and stable aspect ratios.
- All raster assets together remain below 5 MB; each new environmental image remains below 900 KB.

- [ ] **Step 1: Add the final CSS and asset-budget contract**

```ts
test('keeps the field-notes system responsive and within its image budget', () => {
  const css = [
    'LandingPage.module.css', 'Hero.module.css', 'LearningSequence.module.css',
    'VisualField.module.css', 'TrustWaitlist.module.css'
  ].map((name) => readFileSync(`src/landing/${name}`, 'utf8')).join('\n').toLowerCase();
  const assets = readdirSync('public/field-notes').map((name) => statSync(`public/field-notes/${name}`).size);

  expect(css).toContain('#ffffff');
  expect(css).toContain('instrument serif');
  expect(css).toContain('@media (min-width: 1180px)');
  expect(css).toContain('@media (min-width: 960px) and (min-height: 720px)');
  expect(css).toContain('@media (max-width: 760px)');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(Math.max(...assets)).toBeLessThan(900_000);
  expect(assets.reduce((sum, size) => sum + size, 0)).toBeLessThan(5_000_000);
});
```

- [ ] **Step 2: Run the contract and fix only concrete failures**

Run: `npm test -- tests/landingPage.test.ts -t "responsive and within its image budget"`
Expected: PASS after missing dimension, lazy-loading, breakpoint, and asset-budget failures are resolved.

- [ ] **Step 3: Run the full automated verification**

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: 3 test files pass, TypeScript reports no errors, Vite creates `dist`, and `git diff --check` prints nothing.

- [ ] **Step 4: Run the production preview and inspect target viewports**

Run: `npm run dev -- --host 127.0.0.1`
Inspect in a real browser at 1440×900, 1280×800 at 100% zoom, 1024×768, and 390×844. Verify:

- Hero line breaks remain intentional and the Blender UI remains legible.
- No horizontal scrollbar appears.
- Ask → Point → Try → Check visibly advances while scrolling.
- All reveals finish; no section remains empty.
- Organic photographs crop cleanly and credits are visible.
- Tool prints communicate breadth beyond Blender.
- Waitlist error focus and success state work by keyboard.
- Footer finishes the page without clipped links.
- Reduced-motion mode shows complete static content.

- [ ] **Step 5: Update README verification instructions**

Document only these commands and the local-only waitlist disclosure:

````markdown
## Verify

```bash
npm test
npm run typecheck
npm run build
```

The waitlist is a local preview. It does not send or store email addresses.
````

- [ ] **Step 6: Commit the verified rebuild**

```bash
git add src tests public README.md package.json package-lock.json
git commit -m "feat: complete field notes landing rebuild"
```

- [ ] **Step 7: Leave the verified branch ready for final review**

Run: `git status --short`
Expected: no output. Do not push before the required whole-branch review and branch-finishing workflow.
