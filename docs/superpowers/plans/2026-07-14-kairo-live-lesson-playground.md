# Kairo Live Lesson Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the quiet beige/editorial landing page with a crisp-white, joyful, product-led experience that demonstrates Kairo's ask → point → try → checked lesson loop across desktop apps.

**Architecture:** Keep the existing landing route and local assets. Rebuild the page as five focused functions inside `LandingPage.tsx`, keep all landing styles in the existing CSS module, and replace brittle source-string tests with a small mix of semantic render tests and interaction tests. CSS/SVG motion remains dependency-free and every essential state is visible without animation.

**Tech Stack:** React 19, TypeScript 5.7, CSS Modules, SVG, Intersection Observer, Vitest 4, Testing Library, Vite 6.

## Global Constraints

- Page and navigation canvas is pure `#FFFFFF`; cool secondary surfaces use `#F5F7FF`; no beige, cream, or warm paper sections.
- Semantic colors are learner coral `#FF5C45`, Kairo violet `#7557FF`, verified green `#27C281`, interaction blue `#2477FF`, and accent yellow `#FFD84D`.
- Use the existing Geist Variable font and existing assets in `public/`; load no remote image at runtime and add no animation dependency.
- Preserve `kairo-blender-preview.webp` at its native `3560 / 1972` aspect ratio and keep overlays aligned to the cube.
- Blender is only the hero example. The page must also demonstrate Figma, DaVinci Resolve, Photoshop, and a general desktop-app state.
- Kairo points but never clicks. Do not imply autonomous control or describe the named apps as exclusive integrations.
- Keep waitlist submission local and explicitly disclose that data is not sent or stored.
- Essential content is visible without JavaScript. Observer and keyframe behavior may enhance content but may not gate it behind `opacity: 0`.
- `prefers-reduced-motion: reduce` shows a complete final state, disables looping/travel motion, and leaves controls and copy readable.
- Preserve unrelated worktree changes in `vite.config.ts` and `docs/superpowers/specs/2026-07-13-kairo-friendly-copy-safe-scroll-design.md`.

## File Map

- Modify `src/landing/LandingPage.tsx`: page data, five landing components, observer lifecycle, interactions, mock form behavior.
- Replace `src/landing/LandingPage.module.css`: white visual system, responsive layouts, section-local product visuals, and motion states.
- Replace `tests/landingPage.test.ts`: semantic content, interaction, asset, reduced-motion, and responsive source contracts.
- Do not modify `src/main.tsx`, `src/rootRoute.ts`, `vite.config.ts`, or any Tauri/app route.

---

### Task 1: Write the New Landing Contract

**Files:**
- Modify: `tests/landingPage.test.ts`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: current `LandingPage` and `validateWaitlistEmail(value: string): string | null` exports.
- Produces: failing behavioral requirements for the new copy, component states, imagery, and visual-system tokens.

- [ ] **Step 1: Replace stale editorial-layout tests with semantic product-story tests**

Start the test file with a browser environment and import Testing Library:

```ts
// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LandingPage, validateWaitlistEmail } from '../src/landing/LandingPage';
```

Install deterministic browser stubs in the test file rather than production code:

```ts
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  value: IntersectionObserverStub
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
});

afterEach(() => {
  document.body.innerHTML = '';
});
```

Add named tests for these exact contracts:

```ts
test('leads with a concise live-lesson hero', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  expect(html).toContain('A tutor for the app in front of you');
  expect(html).toContain('Stuck? Show Kairo.');
  expect(html).toContain('Ask out loud or circle the confusing bit.');
  expect(html).toContain('Watch a lesson');
  expect(html).not.toContain('Learn by doing.');
});

test('shows the complete ask point try checked lesson loop', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  ['Ask', 'Point', 'Try', 'Checked'].forEach((label) => expect(html).toContain(label));
  expect(html.match(/data-lesson-chapter=/g)).toHaveLength(4);
});

test('offers cross-app lesson previews without integration claims', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  ['Blender', 'Figma', 'DaVinci Resolve', 'Photoshop', 'Any desktop app'].forEach((app) => {
    expect(html).toContain(app);
  });
  expect(html).toContain('Works wherever you are learning');
  expect(html).not.toContain('integration');
});

test('uses the approved crisp-white semantic palette', () => {
  const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
  ['#ffffff', '#f5f7ff', '#111217', '#ff5c45', '#7557ff', '#27c281', '#2477ff', '#ffd84d'].forEach((token) => {
    expect(css).toContain(token);
  });
  ['#fcfcfa', '#f2f1ed'].forEach((oldToken) => expect(css).not.toContain(oldToken));
});
```

Keep the current email-validator test and high-resolution Blender asset byte/dimension assertions. Replace old selector-specific tests for `.runway`, `.skillGrid`, `.trust`, `.lessonSpine`, and the asymmetric desktop split.

- [ ] **Step 2: Run the focused suite and confirm the new contract fails**

Run: `npm test -- tests/landingPage.test.ts`

Expected: FAIL on `Stuck? Show Kairo.`, the five app states, four lesson chapters, and the white palette tokens.

---

### Task 2: Rebuild the Semantic Product Story

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: `kairo-blender-preview.webp`, the four existing `creative-*.jpg` assets, and `validateWaitlistEmail`.
- Produces: `HeroLessonStage`, `LessonLoop`, `AppLessonSwitcher`, `ControlConsole`, `WaitlistBuilder`, and the exported `LandingPage` composition.

- [ ] **Step 1: Define typed app, lesson, trust, and goal data**

Replace `WaitlistRole`, `skills`, and `learningScenes` with readonly records:

```ts
type AppName = 'Blender' | 'Figma' | 'DaVinci Resolve' | 'Photoshop' | 'Any desktop app';
type GoalName = 'Learn the basics' | 'Finish a project' | 'Get unstuck';
type TrustMode = 'ask' | 'pause' | 'point';

const lessonChapters = [
  { id: 'ask', number: '01', label: 'Ask', title: 'Ask anything on screen.', copy: 'Say it out loud or circle the part that is confusing.' },
  { id: 'point', number: '02', label: 'Point', title: 'Kairo points to one move.', copy: 'No ten-step dump. Just the next useful action.' },
  { id: 'try', number: '03', label: 'Try', title: 'You make the move.', copy: 'Kairo waits while you do the work yourself.' },
  { id: 'checked', number: '04', label: 'Checked', title: 'It checks before moving on.', copy: 'When the step is right, the lesson continues.' }
] as const;

const appLessons = [
  { name: 'Blender', image: 'creative-3d.jpg', mode: 'model', prompt: 'How do I add my first keyframe?', action: 'Select the cube, then press I.', detail: 'Object selected' },
  { name: 'Figma', image: 'creative-layout.jpg', mode: 'layout', prompt: 'Why is this spacing uneven?', action: 'Select the frame and open Auto layout.', detail: 'Frame selected' },
  { name: 'DaVinci Resolve', image: 'creative-edit.jpg', mode: 'edit', prompt: 'Where should I cut this pause?', action: 'Move the playhead to the quiet beat.', detail: 'Cut point found' },
  { name: 'Photoshop', image: 'creative-design.jpg', mode: 'image', prompt: 'How do I hide this background?', action: 'Select the layer and add a mask.', detail: 'Layer selected' },
  { name: 'Any desktop app', image: 'creative-design.jpg', mode: 'any', prompt: 'What does this control do?', action: 'Point to it and ask Kairo.', detail: 'Control understood' }
] as const satisfies readonly { name: AppName; image: string; mode: string; prompt: string; action: string; detail: string }[];

const trustModes = [
  { id: 'ask', label: 'Start when I ask', copy: 'No lesson runs until you begin one.' },
  { id: 'pause', label: 'Pause anytime', copy: 'Stop watching and listening with one click.' },
  { id: 'point', label: 'Point, never click', copy: 'Kairo guides the move. You stay in control.' }
] as const satisfies readonly { id: TrustMode; label: string; copy: string }[];
```

- [ ] **Step 2: Replace `ProductPreview` with `HeroLessonStage`**

Keep the controlled interface:

```ts
interface HeroLessonStageProps {
  paused: boolean;
  onToggle: () => void;
}
```

Render a `<figure data-hero-stage>` containing the native-ratio Blender image, voice prompt, coral SVG annotation, cube-aligned violet target, cursor path, Kairo answer, three-step rail, compact `Ask / Point / Checked` mobile transcript, attribution, and a button whose text is `Pause lesson` or `Play lesson`. Use `data-demo-paused={paused}` at the page root so CSS alone controls keyframe play state.

- [ ] **Step 3: Replace `LearningRunway` with `LessonLoop`**

Keep one `activeChapter` number, an array of chapter refs, and a local Intersection Observer. The component must render:

```tsx
<section id="how-it-works" className={styles.lessonLoop} aria-labelledby="lesson-loop-title">
  <header className={styles.sectionIntro}>
    <p>One move at a time</p>
    <h2 id="lesson-loop-title">See it. Try it. Keep going.</h2>
  </header>
  <ol className={styles.loopStrip} aria-label="How a Kairo lesson works">
    {lessonChapters.map((chapter, index) => (
      <li key={chapter.id} data-active={activeChapter === index}><span>{chapter.number}</span>{chapter.label}</li>
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
          data-active={activeChapter === index}
        >
          <span>{chapter.number}</span>
          <h3>{chapter.title}</h3>
          <p>{chapter.copy}</p>
        </li>
      ))}
    </ol>
  </div>
</section>
```

Each chapter article includes `data-lesson-chapter={chapter.id}`, `data-active`, a native heading, and its copy. If Intersection Observer is unavailable, state `0` remains readable and all chapters remain visible.

- [ ] **Step 4: Add `AppLessonSwitcher`**

Use local `selectedApp` state defaulting to `Any desktop app`. Render a labelled tab-like row of native buttons with `aria-pressed`, one large app preview using the selected local image, app-specific CSS/SVG interface marks selected through `data-mode`, and visible prompt/action/detail copy. The stage receives `aria-live="polite"` so keyboard selection is announced.

- [ ] **Step 5: Add `ControlConsole`**

Use local `selectedMode: TrustMode` defaulting to `ask`. Render three native buttons with `aria-pressed`, and one adjacent preview keyed by `data-mode={selectedMode}`. The preview always includes a visible status label, a short mode explanation, and a visual cursor/listening/pause state. Do not use checkboxes or imply OS permissions.

- [ ] **Step 6: Add `WaitlistBuilder`**

Move the form state into the component. Default app to `Any desktop app` and goal to `Get unstuck`. App and goal buttons use `aria-pressed`; email remains the only validated field. On success, replace the form with a receipt containing selected app, selected goal, submitted email, `Saved in this preview`, and `Nothing was sent or stored.`

- [ ] **Step 7: Compose the new page**

The order must be navigation, compact hero copy, `HeroLessonStage`, `LessonLoop`, `AppLessonSwitcher`, `ControlConsole`, and `WaitlistBuilder`. Navigation anchors are `#how-it-works`, `#apps`, `#trust`, and `#access`. Remove the old runway, tile grid, dark trust band, page-wide generic `data-scroll` reveal system, roles, and optional post-submit survey.

- [ ] **Step 8: Run focused tests**

Run: `npm test -- tests/landingPage.test.ts`

Expected: semantic tests pass; palette/style tests remain failing until Task 3.

- [ ] **Step 9: Commit the semantic rebuild**

```bash
git add src/landing/LandingPage.tsx tests/landingPage.test.ts
git commit -m "feat: rebuild landing product story"
```

---

### Task 3: Replace the Visual System and Motion Language

**Files:**
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: class names and data states produced by Task 2.
- Produces: the crisp-white responsive page, hero lesson animation, section-local product visuals, and pause/visibility motion gates.

- [ ] **Step 1: Replace the old token block and page shell**

Start the module with the approved exact values:

```css
.landingPage {
  --canvas: #ffffff;
  --surface: #f5f7ff;
  --ink: #111217;
  --muted: #606575;
  --line: #dfe3ef;
  --learner: #ff5c45;
  --kairo: #7557ff;
  --verified: #27c281;
  --active: #2477ff;
  --spark: #ffd84d;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--canvas);
  color: var(--ink);
  font-family: "Geist Variable", Inter, ui-sans-serif, system-ui, sans-serif;
}
```

Delete every old warm/graphite page token and selector belonging to the runway, skill grid, lesson spine, and dark trust band.

- [ ] **Step 2: Build the hero composition**

Style the copy as a centered block with `padding: clamp(72px, 9vw, 132px) 24px clamp(44px, 5vw, 72px)`, a headline sized `clamp(3.7rem, 8.8vw, 8.5rem)`, maximum two visual lines, a `max-width: 48rem` supporting line, and at least `32px` between headline and support. Style the lesson stage at `width: min(calc(100% - 48px), 1440px)` and preserve `aspect-ratio: 3560 / 1972` on the image frame.

Place the coral annotation and violet target using percentage coordinates tied to the supplied screenshot; the target must bound the cube itself. Place the cursor path between the target and lesson rail, not at an unseen Blender control.

- [ ] **Step 3: Implement the hero state timeline**

Create one 9-second loop whose marks enter in causal order. Use named keyframes `voicePulse`, `drawAnnotation`, `lockTarget`, `travelCursor`, and `verifyStep`. Default all elements to their final visible state; only the motion-ready, visible, unpaused page restarts them from initial keyframe values.

The running selector must gate all hero loops:

```css
.landingPage[data-motion-ready='true'][data-demo-active='true'][data-page-visible='true'][data-demo-paused='false'] .heroStage :is(.voiceBars i, .heroAnnotation path, .heroTarget, .heroCursor, .heroVerified) {
  animation-play-state: running;
}
```

- [ ] **Step 4: Style the four-chapter lesson film**

Use a white/cool-surface two-column desktop grid. The workspace is `position: sticky; top: 88px; height: calc(100svh - 120px)` and each chapter is `min-height: 52svh`. State-specific selectors on `[data-active-chapter='0'..'3']` move the local signal, pointer, attempt control, and verified mark. Chapter content is never opacity-hidden.

- [ ] **Step 5: Style the app switcher as one large stage**

Use a horizontally scrollable tab row and a 12-column preview stage. Image texture occupies the left/background zone; the Kairo prompt, active UI schematic, action card, and result badge occupy distinct layers. Use `[data-mode='model'|'layout'|'edit'|'image'|'any']` to show app-specific visual marks. The selected button gets an ink border and violet state dot; hover alone does not change selection.

- [ ] **Step 6: Style the trust console and waitlist builder**

Trust stays bright: a cool-blue panel with three large selectable rows and one lively preview. Waitlist uses a white section with a violet/blue visual builder panel, high-contrast choices, a single-line email form on desktop, and a compact receipt after submission. No section may use a full black background.

- [ ] **Step 7: Run focused tests and inspect for stale selectors**

Run:

```bash
npm test -- tests/landingPage.test.ts
rg -n "#fcfcfa|#f2f1ed|\.runway|\.skillGrid|\.lessonSpine|background:\s*var\(--graphite\)" src/landing/LandingPage.module.css
```

Expected: tests PASS; `rg` prints no stale warm/editorial selector matches.

- [ ] **Step 8: Commit the visual rebuild**

```bash
git add src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "feat: add live lesson playground visuals"
```

---

### Task 4: Add Responsive and Reduced-Motion Guarantees

**Files:**
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: all page sections and animation selectors from Tasks 2–3.
- Produces: usable 320px, tablet, desktop, no-JS, and reduced-motion states.

- [ ] **Step 1: Add failing contracts for breakpoints and reduced motion**

Add these exact source-level assertions:

```ts
test('stacks complex scenes and preserves motion fallbacks on small screens', () => {
  const css = readFileSync('src/landing/LandingPage.module.css', 'utf8').toLowerCase();
  const mobile = css.slice(css.indexOf('@media (max-width: 760px)'));
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

  expect(css).toMatch(/\.lessonworkspace\s*\{[^}]*position:\s*sticky;/s);
  expect(css).toMatch(/\.heroviewport\s*\{[^}]*aspect-ratio:\s*3560 \/ 1972;/s);
  expect(mobile).toMatch(/\.lessonfilm\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  expect(mobile).toMatch(/\.apptabs\s*\{[^}]*overflow-x:\s*auto;/s);
  expect(reduced).toContain('animation: none !important');
  expect(reduced).toContain('transition: none !important');
  expect(reduced).toContain('transform: none !important');
});
```

- [ ] **Step 2: Implement tablet rules**

At `max-width: 1099px`, reduce outer gutters, keep hero stage full width, use a shorter non-sticky lesson workspace above the chapter cards, and keep app preview copy legible. Do not hide product content.

- [ ] **Step 3: Implement mobile rules**

At `max-width: 760px`, simplify navigation, stack hero actions, hide illegible hero overlay panels in favor of the transcript, turn lesson chapters into regular cards, make app tabs `overflow-x: auto`, stack trust controls/preview, stack the email input/button, and keep every tap target at least `44px` high.

- [ ] **Step 4: Implement reduced-motion rules**

Under `@media (prefers-reduced-motion: reduce)`, set `animation: none !important`, `transition: none !important`, and `transform: none !important` for animated marks; set final SVG stroke offsets and all essential product states visible. Keep the pause button visible and functional as an explicit state control.

- [ ] **Step 5: Run focused tests, typecheck, and build**

Run:

```bash
npm test -- tests/landingPage.test.ts
npm run typecheck
npm run build
```

Expected: all commands exit `0`; Vite produces `dist/index.html` and landing assets.

- [ ] **Step 6: Commit responsive guarantees**

```bash
git add src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "fix: make landing motion responsive and accessible"
```

---

### Task 5: Browser Review, Fixes, and Full Verification

**Files:**
- Modify if required by evidence: `src/landing/LandingPage.tsx`
- Modify if required by evidence: `src/landing/LandingPage.module.css`
- Modify if required by evidence: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: completed page from Tasks 1–4.
- Produces: evidence that the actual rendered page satisfies the design, not only source-level tests.

- [ ] **Step 1: Start the normal website server**

Run: `npm run dev`

Expected: Vite serves the landing page on `http://127.0.0.1:5273/`. Do not run `npm run app`, Tauri, or the `.app` scripts.

- [ ] **Step 2: Capture desktop, tablet, and mobile evidence**

Inspect at 1440×1000, 1024×900, 768×1024, and 390×844. Verify:

- white/cool-white surfaces only;
- compact hero copy plus a large, sharp Blender stage in the first viewport;
- no awkward headline wrap, clipped overlay, or horizontal scrollbar;
- four lesson chapters change the workspace without blank scroll areas;
- all five app states update the preview;
- all three trust modes update the console;
- waitlist errors, selection, and receipt states are readable;
- animation continues after initial reveals and pauses when requested.

- [ ] **Step 3: Run an independent design and accessibility review**

Give reviewers the rendered screenshots and the approved spec. Require them to identify dull/dead zones, generic card patterns, misleading interaction claims, overflow, insufficient contrast, and missing reduced-motion/focus behavior. Fix every concrete P0/P1 finding before proceeding.

- [ ] **Step 4: Re-run all verification**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

Expected: full test suite, typecheck, and build exit `0`; no whitespace errors; only intentional landing changes plus the pre-existing unrelated `vite.config.ts` and spec state remain.

- [ ] **Step 5: Final requirement audit**

Compare current screenshots and source against all nine verification items in `docs/superpowers/specs/2026-07-14-kairo-live-lesson-playground-design.md`. Do not claim completion if any item lacks direct rendered or command evidence.
