# Kairo Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Kairo marketing landing page at the browser root, preserve every Tauri WebView route, and add an honest local-only waitlist preview.

**Architecture:** The existing Vite entry remains shared. A pure hash resolver selects the landing page at `/`, the existing debug/setup shell at `#/app`, and the unchanged notch, overlay, and cursor apps at their native hashes. The landing page is one React component with a CSS Module so marketing styles cannot leak into native transparent windows; lightweight IntersectionObserver enhancement drives scroll reveals without a motion dependency.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Vitest 4, CSS Modules, Tauri 2, Geist Variable.

## Global Constraints

- Work on `main`; do not create a branch or worktree.
- Preserve `#/notch`, `#/overlay`, and `#/cursor` exactly; route the Tauri main window to `index.html#/app`.
- Browser `/` renders the landing page; `#/app` renders the existing `App`.
- Do not add a router, CSS framework, animation library, backend, or runtime dependency.
- Keep landing styles out of `src/styles.css`; use `src/landing/LandingPage.module.css`.
- Surface `#F5F4EF`; text `#151515`; learner input `#FF6547`; Kairo guidance `#8B79FF`; verified progress `#78CAAA`.
- Hero copy is exactly `Learn software by doing. Not watching.` with no em dash.
- Blender is labeled `First live skill / Blender`; it is evidence, not Kairo's category definition.
- No gradients, serif display type, glass-card filler, fake testimonials, logos, metrics, waitlist position, or unsupported product claims.
- Motion explains conversation, annotation, guidance, verification, and skills; never intercept scrolling or use scroll snap.
- `prefers-reduced-motion: reduce` renders every section in its final readable state.
- The mock waitlist does not persist or transmit email and must say so in its success state.
- Match the repository's formatting and logging rules. The marketing page has no meaningful runtime state to log beyond existing boot logging; do not add console calls.

---

## File Map

- Create `src/rootRoute.ts`: pure mapping from URL hash to a root app identifier.
- Create `src/landing/LandingPage.tsx`: semantic page structure, product preview, motion enhancement, and local-only waitlist UI.
- Create `src/landing/LandingPage.module.css`: all landing design, responsive rules, and reduced-motion behavior.
- Create `public/kairo-blender-preview.png`: temporary official Blender manual image used only as a clearly labeled product-preview backdrop.
- Create `tests/rootRoute.test.ts`: route behavior.
- Create `tests/landingPage.test.ts`: server-rendered content, waitlist validation, and style constraints.
- Create `tests/landingMetadata.test.ts`: metadata and brand source-of-truth checks.
- Modify `src/main.tsx`: resolve the browser/native root app through `resolveRootRoute`.
- Modify `src-tauri/tauri.conf.json`: explicitly set the main window URL to `index.html#/app`.
- Modify `tests/macosBundle.test.ts`: protect the main-window route.
- Modify `index.html`: landing title and description without changing the transparent first-paint bootstrap.
- Modify `brand.md`: record the approved semantic visual system and voice.

---

### Task 1: Preserve native routes and make browser root the landing entry

**Files:**
- Create: `src/rootRoute.ts`
- Create: `tests/rootRoute.test.ts`
- Create: `tests/landingPage.test.ts`
- Create: `src/landing/LandingPage.tsx`
- Create: `src/landing/LandingPage.module.css`
- Modify: `src/main.tsx:1-27`
- Modify: `src-tauri/tauri.conf.json:14-25`
- Modify: `tests/macosBundle.test.ts:60-76`

**Interfaces:**
- Produces: `type RootRoute = 'landing' | 'app' | 'notch' | 'overlay' | 'cursor'`.
- Produces: `resolveRootRoute(hash: string): RootRoute`.
- Produces: `LandingPage(): JSX.Element` as the browser-root component.

- [ ] **Step 1: Write failing route and Tauri configuration tests**

Create `tests/rootRoute.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { resolveRootRoute } from '../src/rootRoute';

describe('root route selection', () => {
  test.each([
    ['', 'landing'],
    ['#/', 'landing'],
    ['#/app', 'app'],
    ['#/notch', 'notch'],
    ['#/overlay', 'overlay'],
    ['#/cursor', 'cursor']
  ] as const)('maps %s to %s', (hash, expected) => {
    expect(resolveRootRoute(hash)).toBe(expected);
  });

  test('uses the landing page for unknown browser hashes', () => {
    expect(resolveRootRoute('#/unknown')).toBe('landing');
  });
});
```

Extend the existing main-window assertion in `tests/macosBundle.test.ts`:

```ts
expect(mainWindow).toMatchObject({
  label: 'main',
  url: 'index.html#/app',
  visible: false,
  focus: false
});
```

Create `tests/landingPage.test.ts` so the initial browser component is also
introduced test-first:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

describe('landing page', () => {
  test('renders the approved promise at the browser root', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));
    expect(html).toContain('Learn software by doing.');
    expect(html).toContain('Not watching.');
    expect(html).toContain('First live skill / Blender');
  });
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm ci
npm test -- tests/rootRoute.test.ts tests/landingPage.test.ts tests/macosBundle.test.ts
```

Expected: `rootRoute.test.ts` and `landingPage.test.ts` fail because their source
modules do not exist, and the main-window assertion fails because the config has
no `url`.

- [ ] **Step 3: Add the pure route resolver**

Create `src/rootRoute.ts`:

```ts
export type RootRoute = 'landing' | 'app' | 'notch' | 'overlay' | 'cursor';

const nativeRoutes: Record<string, RootRoute> = {
  '#/app': 'app',
  '#/notch': 'notch',
  '#/overlay': 'overlay',
  '#/cursor': 'cursor'
};

export function resolveRootRoute(hash: string): RootRoute {
  return nativeRoutes[hash] ?? 'landing';
}
```

- [ ] **Step 4: Add a compile-safe landing shell**

Create `src/landing/LandingPage.tsx`:

```tsx
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <header className={styles.header}>
        <a href="#top" aria-label="Kairo home">kairo</a>
        <a href="#access">Request access</a>
      </header>
      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div>
            <p className={styles.eyebrow}>Screen-native AI tutor / Mac alpha</p>
            <h1 id="landing-title">Learn software by doing. <span>Not watching.</span></h1>
            <p>Kairo turns the screen in front of you into a live lesson. Ask a question, point to what you mean, and follow one verified step at a time.</p>
            <a href="#access">Request access</a>
          </div>
          <div className={styles.previewPlaceholder} aria-label="Kairo product preview">
            <span>First live skill / Blender</span>
          </div>
        </section>
        <section id="access" className={styles.access}>
          <h2>Learn inside the work.</h2>
        </section>
      </main>
    </div>
  );
}
```

Create `src/landing/LandingPage.module.css`:

```css
.landingPage {
  min-height: 100svh;
  background: #f5f4ef;
  color: #151515;
}

.header,
.hero,
.access {
  padding: 24px;
}

.hero {
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
}

.eyebrow {
  font: 0.75rem ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: uppercase;
}

.previewPlaceholder {
  min-height: 420px;
  background: #151515;
  color: #f5f4ef;
}
```

- [ ] **Step 5: Route the entry explicitly and protect the Tauri main window**

Replace the nested route expression in `src/main.tsx` with:

```tsx
import { LandingPage } from './landing/LandingPage';
import { resolveRootRoute } from './rootRoute';

const route = resolveRootRoute(window.location.hash);
const RootApp = {
  landing: LandingPage,
  app: App,
  notch: NotchApp,
  overlay: OverlayApp,
  cursor: CursorApp
}[route];
```

In the `main` window object in `src-tauri/tauri.conf.json`, add:

```json
"url": "index.html#/app",
```

Do not change any other window URL or the transparency bootstrap in `index.html`.

- [ ] **Step 6: Run focused tests and build to verify GREEN**

Run:

```bash
npm test -- tests/rootRoute.test.ts tests/landingPage.test.ts tests/macosBundle.test.ts
npm run typecheck
npm run build
```

Expected: route/config tests pass, TypeScript exits 0, and Vite emits `dist/index.html` without errors.

- [ ] **Step 7: Commit**

```bash
git add src/rootRoute.ts src/landing/LandingPage.tsx src/landing/LandingPage.module.css src/main.tsx src-tauri/tauri.conf.json tests/rootRoute.test.ts tests/landingPage.test.ts tests/macosBundle.test.ts
git commit -m "feat: route browser root to landing page"
```

---

### Task 2: Build the approved page narrative and product-led visual system

**Files:**
- Modify: `tests/landingPage.test.ts`
- Create: `public/kairo-blender-preview.png`
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`

**Interfaces:**
- Consumes: `LandingPage()` from Task 1.
- Produces: semantic sections with anchors `#how`, `#skills`, `#trust`, and `#access`.
- Produces: `[data-reveal]`, `[data-visible]`, `[data-motion-ready]`, and `[data-demo-active]` motion attributes.

- [ ] **Step 1: Write failing content and style-contract tests**

Extend `tests/landingPage.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../src/landing/LandingPage';

describe('landing page', () => {
  test('renders the approved learner-first narrative', () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('Learn software by doing.');
    expect(html).toContain('Not watching.');
    expect(html).toContain('First live skill / Blender');
    expect(html).toContain('Tutorials show their screen. Kairo starts from yours.');
    expect(html).toContain('Talk to Kairo.');
    expect(html).toContain('Circle “this.”');
    expect(html).toContain('The AI points. You act.');
    expect(html).toContain('Kairo checks before moving on.');
    expect(html).toContain('Photoshop');
    expect(html).toContain('DaVinci Resolve');
    expect(html).toContain('AI can make mistakes.');
  });

  test('uses semantic color roles and accessible motion fallbacks', () => {
    const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

    expect(css).toContain('#f5f4ef');
    expect(css).toContain('#151515');
    expect(css).toContain('#ff6547');
    expect(css).toContain('#8b79ff');
    expect(css).toContain('#78caaa');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain("[data-motion-ready='true']");
    expect(css).not.toContain('scroll-snap');
    expect(css).not.toContain('linear-gradient');
    expect(css).not.toContain('radial-gradient');
  });
});
```

- [ ] **Step 2: Run the landing test and verify RED**

Run:

```bash
npm test -- tests/landingPage.test.ts
```

Expected: the narrative assertions fail because the initial page contains only
the hero and closing access section; the CSS contract fails because the semantic
accents and reduced-motion rules are absent.

- [ ] **Step 3: Add the local preview image with attribution-ready source**

Run:

```bash
mkdir -p public
curl -L "https://docs.blender.org/manual/en/latest/_images/editors_3dview_startup-scene_labels.png" -o public/kairo-blender-preview.png
```

Expected: `file public/kairo-blender-preview.png` reports a PNG image. The page must label this as `Product preview` and link the visible image credit to the official Blender Manual page.

- [ ] **Step 4: Replace the shell with the full semantic page**

Build `LandingPage.tsx` with this exact top-level order and copy contract:

```tsx
const learningLoop = ['Talk', 'Draw', 'Understand', 'Guide', 'Verify'];

const skills = [
  ['Blender', 'Animation · materials · rendering', 'Active / alpha'],
  ['Photoshop', 'Layers · masks · retouching', 'Next'],
  ['DaVinci Resolve', 'Timeline · color · export', 'Planned'],
  ['Figma', 'Frames · auto layout · components', 'Planned']
] as const;

// Inside <main>, in order:
// 1. <section className={styles.hero}> with the approved h1, two CTAs, and ProductPreview.
// 2. <ol className={styles.learningLoop}> mapped from learningLoop.
// 3. <section className={styles.problem}> with “Tutorials show their screen. Kairo starts from yours.”
// 4. <section id="how"> containing four <article data-reveal> chapters.
// 5. <section id="skills"> mapped from skills with honest statuses.
// 6. <section className={styles.difference}> with four concise principles.
// 7. <section id="trust"> with activation, learner-control, and AI limitation copy.
// 8. <section id="access"> with the waitlist shell completed in Task 3.
```

The hero product preview must contain actual Kairo interaction language rather than generic cards:

```tsx
<figure className={styles.productPreview} data-product-preview>
  <figcaption>
    <span>Product preview</span>
    <strong>First live skill / Blender</strong>
  </figcaption>
  <div className={styles.softwareFrame}>
    <img src={`${import.meta.env.BASE_URL}kairo-blender-preview.png`} alt="Blender startup scene used to demonstrate Kairo's on-screen guidance" />
    <div className={styles.learnerAnnotation} aria-hidden="true" />
    <div className={styles.kairoTarget}><span>Cube · target</span></div>
    <div className={styles.kairoCursor} aria-hidden="true">➤</div>
    <div className={styles.notch}><span className={styles.wave} aria-hidden="true"><i /><i /><i /><i /></span><span>Good. The cube is selected. Press I and choose Location.</span></div>
    <blockquote className={styles.learnerAsk}><b>You / voice + annotation</b>“How do I start animating this cube?”</blockquote>
    <div className={styles.progressRail} aria-label="Example lesson progress">
      <p>Make your first animation</p>
      <div className={styles.verified}><span>01</span><b>Select cube</b><em>Done</em></div>
      <div className={styles.current}><span>02</span><b>Insert keyframe</b><em>Now</em></div>
      <div><span>03</span><b>Move to frame 40</b><em>Next</em></div>
    </div>
  </div>
  <small>Interface image: <a href="https://docs.blender.org/manual/en/latest/editors/3dview/startup_scene.html">Blender Manual</a>, CC BY-SA. Kairo overlays are a product preview.</small>
</figure>
```

The four chapter headings and causal visuals are exact:

```tsx
<h3>Talk to Kairo. <span>Hear the answer.</span></h3>
<h3>Circle “this.” <span>Kairo resolves what you mean.</span></h3>
<h3>The AI points. <span>You act.</span></h3>
<h3>Kairo checks <span>before moving on.</span></h3>
```

Each chapter's visual must include visible text labels for learner input, Kairo guidance, and verification so meaning is not color-only.

- [ ] **Step 5: Implement the approved visual system and responsive layout**

Replace the shell CSS with scoped tokens and layout primitives:

```css
.landingPage {
  --paper: #f5f4ef;
  --ink: #151515;
  --muted: #696964;
  --line: #cfcdc5;
  --learner: #ff6547;
  --kairo: #8b79ff;
  --verified: #78caaa;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--paper);
  color: var(--ink);
  font-family: "Geist Variable", Inter, ui-sans-serif, system-ui, sans-serif;
}

.landingPage * { box-sizing: border-box; }
.landingPage a { color: inherit; text-underline-offset: 0.25em; }
.landingPage :focus-visible { outline: 3px solid var(--kairo); outline-offset: 4px; }
.landingPage button, .landingPage input, .landingPage .header a { min-height: 44px; }
.landingPage h1 { max-width: 10ch; margin: 0; font-size: clamp(3.5rem, 7.4vw, 7.8rem); line-height: 0.88; letter-spacing: -0.075em; }
.landingPage h1 span { display: block; color: var(--muted); font-weight: 480; }
.hero { display: grid; min-height: calc(100svh - 68px); grid-template-columns: minmax(0, 0.78fr) minmax(560px, 1.22fr); border-bottom: 1px solid var(--line); }
.productPreview { min-width: 0; margin: 0; padding: 24px; background: #e9e7df; }
.softwareFrame { position: relative; min-height: 640px; overflow: hidden; border: 1px solid #242424; background: #17191e; }
.learnerAnnotation { border: 5px solid var(--learner); border-radius: 50%; }
.kairoTarget { border: 2px dashed var(--kairo); }
.verified { color: var(--verified); }

@media (max-width: 980px) {
  .hero { grid-template-columns: 1fr; }
  .softwareFrame { min-height: auto; aspect-ratio: 16 / 11; }
}

@media (max-width: 760px) {
  .landingPage h1 { max-width: 11ch; font-size: clamp(3.15rem, 16vw, 5.2rem); }
  .productPreview { padding: 12px; }
  .learningLoop { grid-template-columns: repeat(2, 1fr); }
  .chapter, .skillRow { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .landingPage { scroll-behavior: auto; }
  .landingPage *, .landingPage *::before, .landingPage *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  .landingPage [data-reveal] { opacity: 1 !important; transform: none !important; }
}
```

Use these exact structural rules for the remaining classes:

- header: 68px high, horizontal flex layout, bottom hairline, 24–32px inline
  padding, underlined request-access link;
- hero copy: vertical flex layout with 40–48px padding and the CTAs anchored near
  the bottom on desktop;
- preview overlays: absolute positioning inside `.softwareFrame`; learner ask at
  lower left, notch centered near top, progress rail on the right, annotation and
  target near the cube, with text labels retained;
- learning loop: five equal border-separated columns on desktop and two columns
  below 760px;
- problem transition: two-column editorial statement with one hairline above and
  below, collapsing to one column on mobile;
- chapter: two columns with a minimum height of 540px and alternating copy/visual
  order; below 760px use ordinary stacked flow with no sticky positioning;
- chapter visual: dark software-like stage using only the learner, Kairo, and
  verified semantic colors for states;
- skill row: four aligned columns for index, software, knowledge, and status;
- difference: one large principle statement plus four border-separated facts;
- trust: three plain text columns separated by hairlines, not cards;
- access: two-column closing section with the heading on the left and form on the
  right, stacking below 760px.

Use borders and spacing to structure the page; do not introduce decorative cards,
gradients, blur, or scroll locking.

- [ ] **Step 6: Add progressive scroll choreography with a static fallback**

In `LandingPage`, use one root ref and one effect:

```tsx
const pageRef = useRef<HTMLDivElement>(null);

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
```

Attach `ref={pageRef}` to the landing root. Essential content is visible by default. Only the presence of `data-motion-ready='true'` may place unrevealed sections into their pre-animation state:

```css
.landingPage[data-motion-ready='true'] [data-reveal] { opacity: 0; transform: translateY(34px); }
.landingPage[data-motion-ready='true'] [data-reveal][data-visible='true'] { opacity: 1; transform: none; transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1); }
.landingPage .wave i { animation-play-state: paused; }
.landingPage[data-demo-active='true'][data-page-visible='true'] .wave i { animation-play-state: running; }
```

Use staggered child delays only inside the four causal chapter visuals. Do not add scroll listeners, sticky multi-screen scenes, or `preventDefault`.

- [ ] **Step 7: Run tests, typecheck, and build**

Run:

```bash
npm test -- tests/landingPage.test.ts
npm run typecheck
npm run build
file public/kairo-blender-preview.png
git diff --check
```

Expected: landing tests pass, TypeScript and Vite exit 0, the preview is a PNG, and diff check is clean.

- [ ] **Step 8: Commit**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css public/kairo-blender-preview.png tests/landingPage.test.ts
git commit -m "feat: build product-led landing page"
```

---

### Task 3: Add the honest mock waitlist, metadata, and brand source of truth

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `tests/landingPage.test.ts`
- Create: `tests/landingMetadata.test.ts`
- Modify: `index.html:5-24`
- Modify: `brand.md`

**Interfaces:**
- Produces: `validateWaitlistEmail(value: string): string | null`.
- Produces: form states `idle | invalid | preview-success` through local React state only.
- Produces: optional post-submit role values `Student | Creator | Educator`.

- [ ] **Step 1: Write failing waitlist and metadata tests**

Add to `tests/landingPage.test.ts`:

```ts
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';

test('validates the local preview email field', () => {
  expect(validateWaitlistEmail('')).toBe('Enter your email address.');
  expect(validateWaitlistEmail('learner@')).toBe('Enter a valid email address.');
  expect(validateWaitlistEmail(' learner@example.com ')).toBeNull();
});

test('renders an accessible request-access form', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  expect(html).toContain('<label for="waitlist-email">Email address</label>');
  expect(html).toContain('type="email"');
  expect(html).toContain('autoComplete="email"');
  expect(html).toContain('aria-live="polite"');
});
```

Create `tests/landingMetadata.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('landing metadata and brand', () => {
  test('describes the product in page metadata', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('<title>Kairo — Learn software by doing</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('screen-native AI tutor');
    expect(html).toContain("/^#\\/(cursor|overlay|notch)/");
  });

  test('records the approved semantic brand roles', () => {
    const brand = readFileSync('brand.md', 'utf8');
    expect(brand).toContain('#F5F4EF');
    expect(brand).toContain('#FF6547');
    expect(brand).toContain('#8B79FF');
    expect(brand).toContain('#78CAAA');
    expect(brand).toContain('Learn software by doing. Not watching.');
  });
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/landingPage.test.ts tests/landingMetadata.test.ts
```

Expected: validation import/markup assertions fail, metadata title/description fail, and the deferred brand document lacks approved tokens.

- [ ] **Step 3: Implement pure validation and local-only form state**

Add to `LandingPage.tsx`:

```tsx
type WaitlistRole = 'Student' | 'Creator' | 'Educator';

export function validateWaitlistEmail(value: string) {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}
```

Inside `LandingPage`, add `email`, `emailError`, `submittedEmail`, and `role` state. Submit synchronously: validate; on error keep the field and focus it through normal browser invalid-state flow; on success store the trimmed email only in component state. Do not use `fetch`, timers, localStorage, sessionStorage, or cookies.

The access section must render this initial form:

```tsx
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
  {emailError ? <p id="waitlist-error" role="alert">{emailError}</p> : null}
  <p id="waitlist-note">Preview mode. This form does not send or store your email yet.</p>
  <p aria-live="polite" className={styles.srOnly} />
</form>
```

After success, replace the form with:

```tsx
<div className={styles.waitlistSuccess} aria-live="polite">
  <strong>Preview complete.</strong>
  <p>{submittedEmail} was not sent. Connect a waitlist provider before launch.</p>
  <fieldset>
    <legend>Which best describes you? <span>Optional</span></legend>
    {(['Student', 'Creator', 'Educator'] as const).map((option) => (
      <button key={option} type="button" aria-pressed={role === option} onClick={() => setRole(option)}>{option}</button>
    ))}
  </fieldset>
</div>
```

- [ ] **Step 4: Update metadata without changing transparent first paint**

Set the title and add one description directly after the viewport meta:

```html
<title>Kairo — Learn software by doing</title>
<meta name="description" content="Kairo is a screen-native AI tutor that guides you through complex software one verified step at a time." />
```

Leave the existing inline transparency style and hash bootstrap byte-for-byte unchanged.

- [ ] **Step 5: Replace the deferred brand document**

Rewrite `brand.md` with these sections and exact decisions:

```md
# Brand — Kairo Tutor

_Status: active_

## Position

Kairo is a screen-native AI tutor for learning complex software. The product promise is: **Learn software by doing. Not watching.**

## Principle

**The AI points. The user acts.**

## Visual roles

- Warm surface — `#F5F4EF`
- Primary ink — `#151515`
- Learner input and annotations — `#FF6547`
- Kairo guidance, speech, targets, and cursor — `#8B79FF`
- Verified progress only — `#78CAAA`

Use Geist Variable for display and body text, and the system monospace stack for product metadata.

## Voice

Direct, calm, and specific. Speak from the learner's side of the screen. Explain what happens next; do not sell “AI magic.”

## Avoid

Decorative gradients, glass-card filler, fake proof, autonomous language, serif display type, and oversized editorial punctuation.
```

- [ ] **Step 6: Run focused and full web verification**

Run:

```bash
npm test -- tests/landingPage.test.ts tests/landingMetadata.test.ts
npm run typecheck
npm run test
npm run build
git diff --check
```

Expected: all Vitest files pass, typecheck/build exit 0, and diff check is clean.

- [ ] **Step 7: Commit**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts tests/landingMetadata.test.ts index.html brand.md
git commit -m "feat: add mock landing waitlist"
```

---

### Task 4: Visual QA and packaged-app regression verification

**Files:**
- Modify only if a verified QA defect requires a focused fix and failing test.

**Interfaces:**
- Consumes: complete landing page and preserved Tauri routing from Tasks 1–3.
- Produces: verified browser breakpoints and packaged app route safety.

- [ ] **Step 1: Start the marketing-only browser preview**

Run:

```bash
npm run dev
```

Expected: Vite serves the landing page at `http://127.0.0.1:5273/` and the existing internal shell at `http://127.0.0.1:5273/#/app`.

- [ ] **Step 2: Capture and inspect desktop, tablet, and phone screenshots**

Use the available browser tooling to inspect at `1280×900`, `768×1024`, and `375×812`. Verify:

- Kairo and the core promise are understandable in the first viewport;
- Blender is visibly a first skill, not the category headline;
- no content clips or scrolls horizontally;
- every scroll chapter finishes in a readable state;
- product overlays remain legible;
- the waitlist is keyboard reachable and visibly labeled;
- no em dash appears in the hero;
- no decorative gradient or fake proof appears.

If a defect is found, add the narrowest failing Vitest assertion that captures it when feasible, verify RED, apply the smallest fix, and verify GREEN before continuing.

- [ ] **Step 3: Verify reduced motion and zoom**

Emulate `prefers-reduced-motion: reduce` and inspect at 200% zoom. All content must be visible without waiting for an observer or animation, focus indicators must remain visible, and the page must not require horizontal scrolling.

- [ ] **Step 4: Run full web verification fresh**

Run:

```bash
npm run typecheck
npm run test
npm run build
git diff --check
git status --short
```

Expected: all commands exit 0; status contains no uncommitted QA fix.

- [ ] **Step 5: Run packaged-app verification**

Run:

```bash
npm run app -- --check
```

Expected: typecheck, Vitest, cargo check, Tauri build, signing, and signature verification all exit 0; `Kairo Tutor.app` launches. Confirm the main setup window resolves to `#/app` and the notch, overlay, and cursor retain their existing transparent native routes.

- [ ] **Step 6: Commit any verified QA fixes**

Only if Step 2 or 3 produced changes:

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "fix: polish landing page responsiveness"
```

- [ ] **Step 7: Record final evidence**

Run:

```bash
git log --oneline -5
git status --short --branch
```

Expected: the landing implementation commits are present, the worktree is clean, and `main` is ahead of `origin/main` only by the approved local commits.
