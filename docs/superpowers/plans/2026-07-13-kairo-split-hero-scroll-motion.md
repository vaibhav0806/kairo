# Kairo Split Hero and Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the product promise and Blender lesson side by side on desktop and add clearly perceptible, restrained scroll choreography across the landing page.

**Architecture:** Keep the existing `LandingPage`, `ProductPreview`, CSS module, waitlist, and hero demo state. Task 1 changes only hero markup and responsive layout. Task 2 replaces the lesson-only observer with one shared one-shot scroll observer and adds section-specific transform/opacity choreography while preserving the separate hero preview observer.

**Tech Stack:** React 19, TypeScript, CSS Modules, IntersectionObserver, Vite, Vitest.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-13-kairo-split-hero-scroll-motion-design.md`.
- Preserve the approved headline words, product story, waitlist behavior, sharp `kairo-blender-preview.webp`, native `3560 / 1972` ratio, and overlay geometry.
- Preserve `/` as the web landing page and `#/app` as the internal shell.
- Do not add dependencies, run Tauri, build a native app, or create/open a `.app`.
- Use only opacity and transform for new scroll motion; no blur, parallax, rotation, or scroll-jacking.
- New entrances finish within 400ms and travel no farther than 28px.
- Preserve no-JS and `prefers-reduced-motion` readable final states.
- Leave the pre-existing untracked `test-results/` directory untouched.

## File map

- `src/landing/LandingPage.tsx`: deliberate hero line spans, `data-scroll` markers, shared observer lifecycle.
- `src/landing/LandingPage.module.css`: asymmetric split hero, responsive stacking, visible section choreography, reduced-motion fallback.
- `tests/landingPage.test.ts`: structural, observer, motion, responsive, and fallback contracts.

---

### Task 1: Build the asymmetric split hero

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: existing `ProductPreview`, `.hero`, `.heroCopy`, `.productPreview`, and hero demo state.
- Produces: `.headlineDoing` and `.headlineContrast` spans plus the desktop split layout used by final QA.

- [ ] **Step 1: Write the failing hero contracts**

Replace the stale full-width hero test with contracts equivalent to:

```ts
const html = renderToStaticMarkup(createElement(LandingPage));
const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();

expect(html).toContain('class="headlineDoing"');
expect(html).toContain('class="headlineContrast"');
expect(css).toMatch(/@media \(min-width:\s*1180px\)[\s\S]*\.hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(390px,\s*0\.78fr\) minmax\(0,\s*1\.42fr\);/s);
expect(css).toMatch(/@media \(min-width:\s*1180px\)[\s\S]*\.headlinedoing\s*\{[^}]*display:\s*block;/s);
expect(css).toMatch(/@media \(max-width:\s*1179px\)[\s\S]*\.hero\s*\{[^}]*display:\s*block;/s);
expect(css).toMatch(/\.softwareframe\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/landingPage.test.ts`

Expected: the deliberate headline spans and split hero media rule are absent.

- [ ] **Step 3: Add deliberate headline markup**

Change the hero heading to:

```tsx
<h1 id="landing-title">
  Learn software <span className={styles.headlineDoing}>by doing.</span>
  <span className={styles.headlineContrast}>Not watching.</span>
</h1>
```

Do not change the wording.

- [ ] **Step 4: Implement the split and stacking CSS**

Use the existing tokens and add these layout responsibilities:

```css
.hero {
  border-bottom: 1px solid var(--line);
}

.headlineDoing,
.headlineContrast {
  display: inline;
}

.headlineContrast {
  color: var(--muted);
  font-weight: 470;
}

@media (min-width: 1180px) {
  .hero {
    display: grid;
    width: min(100%, 1440px);
    min-height: calc(100svh - 68px);
    margin: 0 auto;
    padding: 64px 48px;
    grid-template-columns: minmax(390px, 0.78fr) minmax(0, 1.42fr);
    align-items: center;
    gap: 40px;
  }

  .heroCopy,
  .productPreview {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .landingPage h1 {
    font-size: clamp(3.75rem, 5vw, 4.6rem);
  }

  .headlineDoing,
  .headlineContrast {
    display: block;
  }

  .heroActions {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 1179px) {
  .hero {
    display: block;
  }
}
```

Retain the existing 980px and 640px layout rules, updating only declarations that conflict with the new split.

- [ ] **Step 5: Run focused verification**

Run:

```bash
npx vitest run tests/landingPage.test.ts tests/landingWaitlist.test.ts
npm run typecheck
git diff --check
```

Expected: all focused tests and typecheck pass; diff check is empty.

- [ ] **Step 6: Commit the hero**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "feat: pair the hero promise with the product demo"
```

---

### Task 2: Add visible page-wide scroll choreography

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: `pageRef`, existing preview observer, document visibility handler, `data-motion-ready`, and section classes.
- Produces: one shared observer for `[data-scroll]`, `data-scroll-visible="true"`, and section-specific motion roles.

- [ ] **Step 1: Write failing observer and marker tests**

Add contracts equivalent to:

```ts
const html = renderToStaticMarkup(createElement(LandingPage));
const source = readFileSync('src/landing/LandingPage.tsx', 'utf8');
const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');

expect((html.match(/data-scroll=/g) ?? []).length).toBeGreaterThanOrEqual(14);
expect(html).toContain('data-scroll="distinction-heading"');
expect(html).toContain('data-scroll="lesson-step"');
expect(html).toContain('data-scroll="skill-layer-base"');
expect(html).toContain('data-scroll="skill-layer-product"');
expect(html).toContain('data-scroll="trust"');
expect(html).toContain('data-scroll="access-form"');
expect(source).toContain("page.querySelectorAll('[data-scroll]')");
expect(source).toContain("element.setAttribute('data-scroll-visible', 'true')");
expect(source).toContain('scrollObserver.unobserve(element)');
expect(source).not.toContain('lessonStepElements.slice');
expect(css).toContain("[data-scroll-visible='true']");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/landingPage.test.ts`

Expected: page-wide scroll markers and the shared observer are absent.

- [ ] **Step 3: Mark semantic motion groups**

Add stable roles without changing reading order:

```tsx
<h2 data-scroll="distinction-heading">...</h2>
<p data-scroll="distinction-support">...</p>
<header className={styles.sectionHeader} data-scroll="lesson-header">...</header>
<li data-scroll="lesson-step" ...>...</li>
<header className={styles.sectionHeader} data-scroll="skills-header">...</header>
<section className={styles.baseTutorLayer} data-scroll="skill-layer-base" ...>
<section className={styles.productSkillLayer} data-scroll="skill-layer-product" ...>
<li className={styles.skillRow} data-scroll="skill-row" ...>
<section id="trust" ... data-scroll="trust">
<div data-scroll="access-heading">...</div>
<div className={styles.accessShell} data-scroll="access-form">...</div>
```

- [ ] **Step 4: Replace per-row observers with one shared observer**

Use one observer and preserve the existing preview observer:

```tsx
let scrollObserver: IntersectionObserver | null = null;
let previewObserver: IntersectionObserver | null = null;

if (!reducedMotion && canObserve) {
  page.dataset.motionReady = 'true';
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.setAttribute('data-scroll-visible', 'true');
      scrollObserver?.unobserve(element);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -12% 0px' });

  page.querySelectorAll('[data-scroll]').forEach((element) => {
    scrollObserver?.observe(element);
  });
}

return () => {
  scrollObserver?.disconnect();
  previewObserver?.disconnect();
  // preserve the existing visibility cleanup
};
```

Remove the cumulative `lessonStepElements.slice(...)` behavior.

- [ ] **Step 5: Implement visible, role-specific CSS motion**

Use a single curve and role-specific direction:

```css
.landingPage[data-motion-ready='true'] [data-scroll] {
  opacity: 0;
  transform: translateY(24px);
}

.landingPage[data-motion-ready='true'] [data-scroll='skill-layer-base'] {
  transform: translateX(-24px);
}

.landingPage[data-motion-ready='true'] [data-scroll='skill-layer-product'] {
  transform: translateX(24px);
}

.landingPage[data-motion-ready='true'] [data-scroll='skill-row'] {
  transform: translateY(18px);
}

.landingPage[data-motion-ready='true'] [data-scroll][data-scroll-visible='true'] {
  opacity: 1;
  transform: none;
  transition: opacity 380ms cubic-bezier(0, 0, 0.2, 1),
    transform 380ms cubic-bezier(0, 0, 0.2, 1);
}
```

Add short delays only for paired content (`distinction-support`, product skill layer, access form), never more than 100ms. Draw the lesson dot/spine and trust rule with pseudo-elements using `scale`/`scaleX`/`scaleY`; keep every duration at or below 400ms.

- [ ] **Step 6: Extend reduced-motion final-state CSS**

Inside the existing reduced-motion media query, add:

```css
.landingPage [data-scroll],
.landingPage [data-scroll]::before,
.landingPage [data-scroll]::after {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}
```

- [ ] **Step 7: Run focused and full verification**

Run:

```bash
npx vitest run tests/landingPage.test.ts tests/landingWaitlist.test.ts
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: the full suite passes, typecheck exits 0, Vite builds successfully, and diff check is empty.

- [ ] **Step 8: Commit the choreography**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "feat: add visible scroll choreography"
```

---

### Task 3: Browser-only responsive and motion QA

**Files:**
- Modify only if a concrete regression is found in Task 1 or Task 2 files.

**Interfaces:**
- Consumes: completed split hero and shared scroll observer.
- Produces: four-size visual approval and evidence that motion appears during actual scrolling.

- [ ] **Step 1: Start only the Vite web route**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5273
```

Expected: Vite serves `http://127.0.0.1:5273/`. Do not start Tauri.

- [ ] **Step 2: Capture and inspect four viewport sizes**

Verify 1440×900, 1280×800, 768×1024, and 390×844:

- Desktop hero is side by side at 1440 and 1280.
- Desktop headline is exactly three deliberate lines without clipping.
- Preview remains sharp and its overlays align with the cube.
- Tablet stacks at 768.
- Mobile transcript remains readable at 390.
- `scrollWidth === clientWidth` at every viewport.

- [ ] **Step 3: Verify scroll motion in the browser**

Scroll from top to bottom at normal reading speed and confirm:

- Distinction heading and support visibly enter separately.
- Each lesson row enters at its own position and the spine/dot motion is visible.
- Base and product skill layers enter from opposite directions.
- Skill rows, trust, and waitlist animate once.
- Content remains readable when reduced motion is enabled.

- [ ] **Step 4: Final checks**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

Expected: 204 or more tests pass; typecheck/build/diff check pass; only pre-existing `test-results/` may remain untracked.
