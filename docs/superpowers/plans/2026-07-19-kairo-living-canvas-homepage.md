# Kairo Living Canvas Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current field-notes landing page with the approved Living Canvas experience while preserving the hardened email waitlist backend.

**Architecture:** Keep the page structure and copy server-rendered, with isolated client components for the hero drawing canvas, product moments, capability stage, tool playground, control moment, footer reaction, and waitlist form. Use Motion for React for interruptible spring motion, native Pointer Events plus `perfect-freehand` and SVG for Kairo ink, local component state only, and static fallbacks for reduced motion or unavailable browser features.

**Tech Stack:** Next.js 16.2.10, React 19, TypeScript 5.7, CSS Modules, Motion 12.42.2, perfect-freehand 1.2.3, Vitest 4, Testing Library, Playwright 1.61.

## Global Constraints

- Node.js remains `>=20.9.0`; npm and `package-lock.json` remain the package-management source of truth.
- The approved visual tokens are `#F5F7FB`, `#0B0D12`, `#141824`, `#E9EDF5`, `#665CFF`, `#B8F34A`, `#FF6B66`, `#FFD84D`, and `#626A78`.
- Display type is Bricolage Grotesque Variable; body and controls use Geist Variable; technical labels use Geist Mono with a system monospace fallback.
- The hero copy is “Learn any creative tool without leaving it.” and “Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.”
- The primary CTA is “Request alpha access”; the secondary action is “See how Kairo helps”.
- Product clarity must not depend on animation or interaction.
- Motion must be interruptible, spatially anchored, physically motivated, and reduced-motion safe; no scroll hijacking, autoplay audio, generic section reveals, or infinite hero loops.
- Pointer drawing remains local to the browser and is never uploaded or persisted.
- `/api/waitlist`, `src/server/**`, `src/shared/waitlistEmail.ts`, and `db/migrations/001_create_waitlist_signups.sql` keep their existing contracts.
- Do not add analytics, authentication, confirmation email, payments, new waitlist fields, agentic task execution claims, Three.js, WebGL, Rive, GSAP, or a smooth-scroll library.
- `HeroCanvas`, `ProductMoments`, `CapabilityStage`, `ToolPlayground`, `ControlMoment`, `WaitlistForm`, and `FooterMark` begin with `'use client'`; `Hero`, `AlphaInvitation`, and `LandingPage` remain server components.
- Do not copy proprietary site code or assets. Record the source and license before adapting any OSS technique.
- The original checkout's modified `AGENTS.md` is user-owned and must remain untouched.

## File Map

### New focused modules

- `src/landing/HeroCanvas.tsx` — fragments, pointer/keyboard interaction, and reaction state beneath server-rendered hero copy.
- `src/landing/HeroCanvas.module.css` — hero layout, fragments, Kairo cursor, ink, and responsive input affordances.
- `src/landing/heroInk.ts` — pure stroke path conversion, bounds calculation, and target recognition.
- `src/landing/ProductMoments.tsx` / `.module.css` — three user-controlled illustrative product scenes.
- `src/landing/CapabilityStage.tsx` / `.module.css` — Talk / See / Point / Learn tab state and one transforming visual.
- `src/landing/ToolPlayground.tsx` / `.module.css` — labelled tool selection and desktop Kairo lens.
- `src/landing/ControlMoment.tsx` / `.module.css` — guide / wait / verify learning-first sequence.
- `src/landing/AlphaInvitation.tsx` / `.module.css` — server-rendered alpha heading, founder note, and `WaitlistForm` composition.
- `src/landing/WaitlistForm.tsx` / `.module.css` — existing waitlist behavior in a dedicated client component.
- `src/landing/FooterMark.tsx` — compact keyboard/pointer-activated footer reaction.
- `src/landing/motion.ts` — shared spring constants only.
- `tests/helpers/browserEnvironment.ts` — reusable match-media, visibility, observer, and pointer-capture harnesses.
- `tests/heroInk.test.ts` — pure geometry tests.
- `tests/heroCanvas.test.ts` — hero interaction and accessibility tests.
- `tests/productMoments.test.ts` — scene selection, playback, visibility, and reduced-motion tests.
- `tests/capabilityStage.test.ts` — selection, roving focus, and accessible state tests.
- `tests/toolPlayground.test.ts` — tool content, selection, and integration-claim tests.
- `tests/controlMoment.test.ts` — guide / wait / verify and footer state tests.

### Existing files to rewrite

- `src/landing/LandingPage.tsx` — server-rendered page composition.
- `src/landing/LandingPage.module.css` — page tokens, header, section rhythm, alpha area, and footer.
- `src/landing/Hero.tsx` / `Hero.module.css` — server-rendered hero copy and layout around `HeroCanvas`.
- `src/styles.css` — global reset, new font stack, body colors, and reduced-motion behavior.
- `src/app/layout.tsx` — font imports and truthful metadata.
- `public/favicon.svg` — new Kairo violet annotation-loop favicon.
- `tests/landingPage.test.ts` — new content order and static contract.
- `tests/landingWaitlist.test.ts` — preserve waitlist tests against `WaitlistForm`; remove obsolete hero-pause assertion.
- `tests/landingSsr.test.ts` — new server-rendering and asset contract.
- `tests/landingMetadata.test.ts` — new metadata, fonts, and dependency contract.
- `tests/nextCssModules.test.ts` — visible-by-default and reduced-motion CSS contract.
- `tests/e2e/landing.spec.ts` — new browser journey and interaction checks.

### Legacy files and assets to delete after replacements are integrated

- `src/landing/LearningSequence.tsx` / `LearningSequence.module.css`
- `src/landing/VisualField.tsx` / `VisualField.module.css`
- `src/landing/TrustWaitlist.tsx` / `TrustWaitlist.module.css`
- `public/kairo-blender-preview.webp`
- `public/field-notes/`

---

### Task 1: Install the motion foundation and new brand shell

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/app/layout.tsx`
- Modify: `src/styles.css`
- Modify: `public/favicon.svg`
- Modify: `tests/landingMetadata.test.ts`
- Create: `src/landing/motion.ts`

**Interfaces:**
- Produces: `DIRECT_SPRING`, `SURFACE_SPRING`, and `SCENE_SPRING`, each satisfying Motion's spring transition object shape.
- Produces: global font imports and CSS variables consumed by every later task.

- [ ] **Step 1: Replace the metadata/dependency assertions with the new contract**

```ts
// tests/landingMetadata.test.ts
test('uses the Living Canvas metadata, fonts, and interaction dependencies', () => {
  const layout = readFileSync('src/app/layout.tsx', 'utf8');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies: Record<string, string>;
  };

  expect(layout).toContain("title: 'Kairo — Learn any creative tool'");
  expect(layout).toContain("description: 'Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.'");
  expect(layout).toContain("@fontsource-variable/bricolage-grotesque");
  expect(layout).toContain("@fontsource-variable/geist");
  expect(layout).toContain("@fontsource-variable/geist-mono");
  expect(layout).not.toContain('@fontsource/instrument-serif');
  expect(packageJson.dependencies.motion).toBe('^12.42.2');
  expect(packageJson.dependencies['perfect-freehand']).toBe('^1.2.3');
});
```

- [ ] **Step 2: Run the focused test and verify the old brand contract fails**

Run: `npm test -- tests/landingMetadata.test.ts`

Expected: FAIL because the new fonts, metadata, and dependencies are absent.

- [ ] **Step 3: Install exact dependency versions and remove the serif package**

Run:

```bash
npm install motion@12.42.2 perfect-freehand@1.2.3 @fontsource-variable/bricolage-grotesque@5.3.0 @fontsource-variable/geist-mono@5.3.0
npm uninstall @fontsource/instrument-serif
```

Expected: `package.json` records caret ranges for the four installed packages and no longer lists `@fontsource/instrument-serif`.

- [ ] **Step 4: Add the new metadata, global tokens, fonts, favicon, and spring constants**

```tsx
// src/app/layout.tsx imports and metadata
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';

export const metadata: Metadata = {
  title: 'Kairo — Learn any creative tool',
  description: 'Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.',
  icons: '/favicon.svg'
};
```

```ts
// src/landing/motion.ts
export const DIRECT_SPRING = { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 } as const;
export const SURFACE_SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 } as const;
export const SCENE_SPRING = { type: 'spring', stiffness: 220, damping: 28, mass: 1 } as const;
```

```css
/* src/styles.css */
:root {
  --canvas: #f5f7fb;
  --ink: #0b0d12;
  --surface-deep: #141824;
  --surface-soft: #e9edf5;
  --kairo: #665cff;
  --verify: #b8f34a;
  --react: #ff6b66;
  --notice: #ffd84d;
  --ink-muted: #626a78;
  color: var(--ink);
  background: var(--canvas);
  font-family: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after { box-sizing: border-box; }
html { min-width: 320px; scroll-behavior: smooth; }
body { min-width: 320px; min-height: 100vh; margin: 0; color: var(--ink); background: var(--canvas); }
button, input { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
::selection { color: white; background: var(--kairo); }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
```

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
  <rect width="32" height="32" rx="8" fill="#141824"/>
  <path d="M7 17c0-6 5-10 11-9 6 1 9 7 5 12-4 5-13 5-16-1-2-4 1-8 5-9" fill="none" stroke="#665CFF" stroke-width="3" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 5: Verify and commit the foundation**

Run: `npm test -- tests/landingMetadata.test.ts && npm run typecheck`

Expected: metadata tests PASS and TypeScript exits 0.

```bash
git add package.json package-lock.json src/app/layout.tsx src/styles.css src/landing/motion.ts public/favicon.svg tests/landingMetadata.test.ts
git commit -m "chore: add living canvas foundations"
```

### Task 2: Build and test the pure Kairo ink engine

**Files:**
- Create: `src/landing/heroInk.ts`
- Create: `tests/heroInk.test.ts`

**Interfaces:**
- Produces: `StrokePoint`, `HeroTargetId`, `HeroTarget`, `strokeToSvgPath(points)`, `getStrokeBounds(points)`, and `recognizeHeroTarget(points, targets)`.
- Consumes: `getStroke` from `perfect-freehand`.

- [ ] **Step 1: Write failing geometry and recognition tests**

```ts
// tests/heroInk.test.ts
import { describe, expect, test } from 'vitest';
import { getStrokeBounds, recognizeHeroTarget, strokeToSvgPath } from '../src/landing/heroInk';

const circle = [
  [10, 10, 0.5], [50, 5, 0.5], [90, 10, 0.5], [100, 50, 0.5],
  [90, 90, 0.5], [50, 100, 0.5], [10, 90, 0.5], [5, 50, 0.5], [10, 10, 0.5]
] as const;

describe('hero ink', () => {
  test('creates a closed SVG path for a drawable stroke', () => {
    expect(strokeToSvgPath(circle)).toMatch(/^M .+ Z$/);
  });

  test('returns stable bounds', () => {
    expect(getStrokeBounds(circle)).toEqual({ minX: 5, minY: 5, maxX: 100, maxY: 100 });
  });

  test('recognizes a closed stroke around the nearest expanded target', () => {
    expect(recognizeHeroTarget(circle, [
      { id: 'timeline', x: 20, y: 20, width: 60, height: 60 }
    ])).toBe('timeline');
  });

  test('rejects short and open gestures', () => {
    expect(recognizeHeroTarget([[0, 0], [90, 0], [180, 0]], [
      { id: 'timeline', x: 20, y: 20, width: 60, height: 60 }
    ])).toBeNull();
  });
});
```

- [ ] **Step 2: Run the pure test and verify the module is missing**

Run: `npm test -- tests/heroInk.test.ts`

Expected: FAIL with module resolution error for `src/landing/heroInk.ts`.

- [ ] **Step 3: Implement deterministic path generation and target recognition**

```ts
// src/landing/heroInk.ts
import { getStroke } from 'perfect-freehand';

export type StrokePoint = readonly [x: number, y: number, pressure?: number];
export type HeroTargetId = 'timeline' | 'layers' | 'nodes';
export type HeroTarget = Readonly<{
  id: HeroTargetId;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export function getStrokeBounds(points: readonly StrokePoint[]) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    minX: Math.min(...xs), minY: Math.min(...ys),
    maxX: Math.max(...xs), maxY: Math.max(...ys)
  };
}

export function strokeToSvgPath(points: readonly StrokePoint[]): string {
  const outline = getStroke(points.map(([x, y, pressure]) => [x, y, pressure ?? 0.5]), {
    size: 8, thinning: 0.55, smoothing: 0.72, streamline: 0.45, simulatePressure: true
  });
  if (outline.length < 3) return '';
  const [firstX, firstY] = outline[0] ?? [0, 0];
  const commands = outline.map(([x, y], index) => {
    const [nextX, nextY] = outline[(index + 1) % outline.length] ?? [x, y];
    return `${x} ${y} ${(x + nextX) / 2} ${(y + nextY) / 2}`;
  });
  return `M ${firstX} ${firstY} Q ${commands.join(' ')} Z`;
}

export function recognizeHeroTarget(
  points: readonly StrokePoint[], targets: readonly HeroTarget[]
): HeroTargetId | null {
  if (points.length < 8) return null;
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || Math.hypot(last[0] - first[0], last[1] - first[1]) > 48) return null;
  const bounds = getStrokeBounds(points);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return targets.find((target) => (
    centerX >= target.x - 24 && centerX <= target.x + target.width + 24
    && centerY >= target.y - 24 && centerY <= target.y + target.height + 24
  ))?.id ?? null;
}
```

- [ ] **Step 4: Verify geometry behavior and commit**

Run: `npm test -- tests/heroInk.test.ts`

Expected: 4 tests PASS.

```bash
git add src/landing/heroInk.ts tests/heroInk.test.ts
git commit -m "feat: add kairo ink geometry"
```

### Task 3: Build the hero quality-gate interaction

**Files:**
- Rewrite: `src/landing/Hero.tsx`
- Rewrite: `src/landing/Hero.module.css`
- Create: `src/landing/HeroCanvas.tsx`
- Create: `src/landing/HeroCanvas.module.css`
- Create: `tests/helpers/browserEnvironment.ts`
- Create: `tests/heroCanvas.test.ts`

**Interfaces:**
- Consumes: `StrokePoint`, `strokeToSvgPath`, `recognizeHeroTarget`, `DIRECT_SPRING`, and `SURFACE_SPRING`.
- Produces: server component `Hero()` with anchors `#top` and `#product-moments`.
- Produces: client component `HeroCanvas()` with accessible target buttons named `Ask Kairo about the timeline`, `Ask Kairo about the layers`, and `Ask Kairo about the nodes`.

- [ ] **Step 1: Write failing hero content and interaction tests**

```ts
// tests/heroCanvas.test.ts
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Hero } from '../src/landing/Hero';
import { HeroCanvas } from '../src/landing/HeroCanvas';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('HeroCanvas', () => {
  test('explains Kairo without requiring interaction', () => {
    render(createElement(Hero));
    expect(screen.getByRole('heading', { level: 1 }).textContent)
      .toBe('Learn any creative tool without leaving it.');
    expect(screen.getByText(/Talk to Kairo, show it what you mean/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Request alpha access' }).getAttribute('href'))
      .toBe('#access');
  });

  test('provides a keyboard equivalent for every drawable target', () => {
    render(createElement(HeroCanvas));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Kairo about the timeline' }));
    expect(screen.getByRole('status').textContent).toContain('easing');
    expect(document.querySelector('[data-hero-state="responding"]')).toBeTruthy();
  });

  test('clears a completed response without removing the page copy', () => {
    render(createElement(HeroCanvas));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Kairo about the layers' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear Kairo drawing' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('button', { name: 'Ask Kairo about the layers' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the hero test and verify the component is missing**

Run: `npm test -- tests/heroCanvas.test.ts`

Expected: FAIL with module resolution error for `HeroCanvas.tsx`.

- [ ] **Step 3: Implement the explicit hero state machine and accessible fallback**

Use these exact states and prepared responses:

```tsx
type HeroState = 'idle' | 'drawing' | 'responding';

const reactions = {
  timeline: 'That jump is in the easing. Let’s smooth the stop.',
  layers: 'This layer is driving the motion you’re seeing.',
  nodes: 'The signal breaks here. Follow this connection first.'
} as const;
```

`HeroCanvas` must:

- render copy and both CTAs before any effect runs;
- store only the completed stroke and semantic state in React state;
- collect active pointer samples in a ref and include `event.getCoalescedEvents?.()` samples;
- map client coordinates into the SVG view box using the canvas bounding rectangle;
- use `setPointerCapture` only when available;
- call `recognizeHeroTarget` on pointer release;
- render the path in an `aria-hidden` SVG and the response in `role="status"`;
- run one idle underline only when `useReducedMotion()` is false, the page is visible, and the hero intersects the viewport;
- cancel the idle timer on drawing, target-button activation, visibility change, and unmount.

Create the shared browser harness before rendering Motion components:

```ts
// tests/helpers/browserEnvironment.ts
import { vi } from 'vitest';

export function installBrowserEnvironment(options: { reducedMotion?: boolean } = {}) {
  const reducedMotion = options.reducedMotion ?? false;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reducedMotion,
      media: query,
      onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false)
    }))
  });
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe = (target: Element) => this.callback(
        [{ target, isIntersecting: true }] as IntersectionObserverEntry[],
        this as unknown as IntersectionObserver
      );
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }
  });
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true, value: vi.fn()
  });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    configurable: true, value: vi.fn()
  });
}
```

```tsx
// src/landing/Hero.tsx — no 'use client'
import { HeroCanvas } from './HeroCanvas';
import styles from './Hero.module.css';

export function Hero() {
  return <section id="top" className={styles.hero} aria-labelledby="landing-title">
  <div className={styles.copy}>
    <p className={styles.eyebrow}>Kairo · your creative learning layer</p>
    <h1 id="landing-title">Learn any creative tool without leaving it.</h1>
    <p>Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.</p>
    <div className={styles.actions}>
      <a href="#access">Request alpha access</a>
      <a href="#product-moments">See how Kairo helps</a>
    </div>
  </div>
  <HeroCanvas />
  </section>;
}
```

`HeroCanvas.tsx` renders a `div` with `data-hero-state`, three buttons/fragments identified by `data-hero-target="timeline|layers|nodes"`, an `aria-hidden` SVG path, a conditional `role="status"` response, and a conditional `Clear Kairo drawing` button. The timeline fragment contains keyframe ticks, the layers fragment contains three labelled rows, and the nodes fragment contains three connected labelled nodes; none use proprietary app names or chrome.

- [ ] **Step 4: Add the visual quality-gate styling**

Implement a bright canvas, deep-ink fragments, violet ink, `clamp()` typography, a desktop two-column hero above `1100px`, and a single-column layout below. The drawing surface uses `touch-action: pan-y` until an explicit target or draw affordance is active; buttons remain at least `44px`. Use Motion transforms for fragment response and CSS only for color/focus.

```css
.hero { min-height: 100svh; display: grid; grid-template-columns: minmax(0, .86fr) minmax(520px, 1.14fr); align-items: center; overflow: clip; background: var(--canvas); }
.copy h1 { max-width: 11ch; font-family: "Bricolage Grotesque Variable", sans-serif; font-size: clamp(3.6rem, 8vw, 8.8rem); line-height: .86; letter-spacing: -.065em; }
/* HeroCanvas.module.css */
.canvas { position: relative; min-height: clamp(420px, 54vw, 720px); isolation: isolate; touch-action: pan-y; }
.ink { fill: var(--kairo); pointer-events: none; }
.target { min-width: 44px; min-height: 44px; color: var(--ink); background: var(--surface-soft); border: 1px solid rgb(11 13 18 / 12%); }
.response { position: absolute; max-width: 260px; color: white; background: var(--surface-deep); border-radius: 18px; }
@media (prefers-reduced-motion: reduce) { .fragment, .response { transform: none !important; } }
```

- [ ] **Step 5: Verify the hero quality gate and commit**

Run: `npm test -- tests/heroInk.test.ts tests/heroCanvas.test.ts && npm run typecheck`

Expected: all focused tests PASS and TypeScript exits 0.

Manually run `npm run dev`, inspect the hero at `1440×1000`, `768×1024`, and `390×844`, and reject the task if drawing lags, the page scroll becomes trapped, or the headline/CTA requires hydration to appear.

```bash
git add src/landing/Hero.tsx src/landing/Hero.module.css src/landing/HeroCanvas.tsx src/landing/HeroCanvas.module.css tests/helpers/browserEnvironment.ts tests/heroCanvas.test.ts
git commit -m "feat: add living canvas hero"
```

### Task 4: Add the three product moments

**Files:**
- Create: `src/landing/ProductMoments.tsx`
- Create: `src/landing/ProductMoments.module.css`
- Create: `tests/productMoments.test.ts`

**Interfaces:**
- Produces: `ProductMoments()` section anchor `#product-moments`, moment IDs `ask`, `point`, `learn`, pause/replay control, and `data-moment-state`.
- Consumes: `SCENE_SPRING` and Motion visibility primitives.

- [ ] **Step 1: Write the failing product-moment behavior test**

```tsx
// tests/productMoments.test.ts
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ProductMoments } from '../src/landing/ProductMoments';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('Living Canvas interactions', () => {
  test('keeps product moments manual and explains the selected scene', () => {
    const { container } = render(createElement(ProductMoments));
    expect(container.querySelector('[data-moment-state]')?.getAttribute('data-moment-state')).toBe('ask');
    fireEvent.click(screen.getByRole('tab', { name: 'Point together' }));
    expect(container.querySelector('[data-moment-state]')?.getAttribute('data-moment-state')).toBe('point');
    expect(screen.getByText(/circle an exact region/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Replay product moment' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the focused test and verify the component is missing**

Run: `npm test -- tests/productMoments.test.ts`

Expected: FAIL with module resolution error for `ProductMoments.tsx`.

- [ ] **Step 3: Implement the controlled scene state**

```tsx
const moments = [
  { id: 'ask', label: 'Ask naturally', copy: 'Ask out loud while your hands stay in the creative tool.' },
  { id: 'point', label: 'Point together', copy: 'Circle an exact region. Kairo answers in the same spatial context.' },
  { id: 'learn', label: 'Keep learning', copy: 'Take one next move, let Kairo verify it, then continue.' }
] as const;
type MomentId = (typeof moments)[number]['id'];
```

Render a labelled tablist, one shared `figure`, a pause/replay button, and three original DOM/SVG scene states. Use `useInView` to allow the selected scene to run only while visible. Selection stops playback until replay is pressed. Reduced motion shows the completed scene state with no timed progression.

- [ ] **Step 4: Style the moments as one transforming stage and verify**

Use a deep surface with a visible explanation beside it, direction-aware scene transitions, static technical labels, and no app trademarks. At mobile widths, controls become a horizontally scrollable labelled row while the scene remains within the viewport.

```css
/* ProductMoments.module.css */
.moments { padding: clamp(88px, 12vw, 176px) clamp(20px, 5vw, 80px); color: white; background: var(--surface-deep); }
.layout { display: grid; grid-template-columns: minmax(240px, .65fr) minmax(0, 1.35fr); gap: clamp(40px, 7vw, 112px); align-items: center; max-width: 1440px; margin: 0 auto; }
.tabs { display: grid; gap: 8px; }
.stage { position: relative; min-height: clamp(420px, 54vw, 720px); overflow: hidden; border: 1px solid rgb(255 255 255 / 16%); border-radius: 28px; background: #0b0d12; }
.scene[aria-hidden='true'] { visibility: hidden; pointer-events: none; }
@media (max-width: 760px) { .layout { grid-template-columns: 1fr; } .tabs { display: flex; overflow-x: auto; } }
```

Run: `npm test -- tests/productMoments.test.ts && npm run typecheck`

Expected: focused tests PASS and TypeScript exits 0.

```bash
git add src/landing/ProductMoments.tsx src/landing/ProductMoments.module.css tests/productMoments.test.ts
git commit -m "feat: add kairo product moments"
```

### Task 5: Add the capability stage

**Files:**
- Create: `src/landing/CapabilityStage.tsx`
- Create: `src/landing/CapabilityStage.module.css`
- Create: `tests/capabilityStage.test.ts`

**Interfaces:**
- Produces: `CapabilityStage()` section anchor `#capabilities`, capability IDs `talk`, `see`, `point`, `learn`, a manual tablist, and `data-capability`.
- Consumes: `SURFACE_SPRING`.

- [ ] **Step 1: Add a failing manual-selection and keyboard test**

```tsx
// tests/capabilityStage.test.ts
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CapabilityStage } from '../src/landing/CapabilityStage';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('changes one capability stage through labelled tabs', () => {
  const { container } = render(createElement(CapabilityStage));
  const talk = screen.getByRole('tab', { name: 'Talk' });
  fireEvent.keyDown(talk, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'See' }).getAttribute('aria-selected')).toBe('true');
  expect(container.querySelector('[data-capability]')?.getAttribute('data-capability')).toBe('see');
  expect(screen.queryByText('Take over the task')).toBeNull();
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/capabilityStage.test.ts`

Expected: FAIL because `CapabilityStage` is absent.

- [ ] **Step 3: Implement roving focus and the shared stage**

Use this exact content model:

```tsx
const capabilities = [
  { id: 'talk', label: 'Talk', copy: 'Ask naturally. Kairo answers out loud without pulling you into a chat window.' },
  { id: 'see', label: 'See', copy: 'Kairo understands the application, tool, and visible state you are looking at.' },
  { id: 'point', label: 'Point together', copy: 'Circle, underline, and draw so both sides mean the same exact thing.' },
  { id: 'learn', label: 'Learn by doing', copy: 'Kairo guides one move, waits, verifies the result, and keeps going.' }
] as const;
```

Arrow Left/Right changes selection and focus; Home/End selects first/last. The stage keeps one DOM structure and changes semantic `data-capability`, copy, highlight, and SVG annotation rather than mounting four cards.

- [ ] **Step 4: Add responsive styling, verify, and commit**

Use a calm light section with a strong typographic introduction and a dark inset stage. Keep the selected indicator spring-driven, but change panel copy with a short opacity transition. Reduced motion swaps instantly.

```css
/* CapabilityStage.module.css */
.capabilities { padding: clamp(88px, 12vw, 176px) clamp(20px, 5vw, 80px); background: var(--canvas); }
.shell { max-width: 1440px; margin: 0 auto; }
.tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px; }
.stage { min-height: clamp(420px, 48vw, 640px); padding: clamp(24px, 5vw, 72px); color: white; background: var(--surface-deep); border-radius: 28px; }
.tab[aria-selected='true'] { color: white; background: var(--kairo); }
@media (max-width: 760px) { .tabs { display: flex; overflow-x: auto; } .tab { flex: 0 0 auto; } }
```

Run: `npm test -- tests/capabilityStage.test.ts && npm run typecheck`

Expected: focused tests PASS and TypeScript exits 0.

```bash
git add src/landing/CapabilityStage.tsx src/landing/CapabilityStage.module.css tests/capabilityStage.test.ts
git commit -m "feat: explain kairo capabilities"
```

### Task 6: Add the creative-tool playground

**Files:**
- Create: `src/landing/ToolPlayground.tsx`
- Create: `src/landing/ToolPlayground.module.css`
- Create: `tests/toolPlayground.test.ts`

**Interfaces:**
- Produces: `ToolPlayground()` section anchor `#tools`, tool IDs `after-effects`, `davinci`, `blender`, `figma`, labelled controls, `data-tool`, and a decorative desktop drag lens.
- Consumes: Motion drag constraints and `DIRECT_SPRING`.

- [ ] **Step 1: Add failing selection and claims tests**

```tsx
// tests/toolPlayground.test.ts
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ToolPlayground } from '../src/landing/ToolPlayground';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('shows concrete tool questions without claiming integrations', () => {
  const { container } = render(createElement(ToolPlayground));
  expect(screen.getByText('Why does this title stop so abruptly?')).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'DaVinci Resolve' }));
  expect(container.querySelector('[data-tool]')?.getAttribute('data-tool')).toBe('davinci');
  expect(screen.getByText('How do I make this speed change feel smoother?')).toBeTruthy();
  expect(container.textContent).not.toMatch(/official integration|partner/i);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/toolPlayground.test.ts`

Expected: FAIL because `ToolPlayground` is absent.

- [ ] **Step 3: Implement labelled selection and the optional desktop lens**

```tsx
const tools = [
  { id: 'after-effects', name: 'After Effects', question: 'Why does this title stop so abruptly?', answer: 'Start with the easing on these keyframes.' },
  { id: 'davinci', name: 'DaVinci Resolve', question: 'How do I make this speed change feel smoother?', answer: 'Shape the speed curve instead of making one hard jump.' },
  { id: 'blender', name: 'Blender', question: 'How do I make this material read like glass?', answer: 'Transmission and roughness are the two controls to compare first.' },
  { id: 'figma', name: 'Figma', question: 'Why does this button break when the label changes?', answer: 'Let Auto Layout size the frame from its content.' }
] as const;
```

Use a manual tablist as the source of truth. The lens is `aria-hidden`, uses Motion drag within the desktop stage, and may update the active tool only when its center enters a measured scene region. Disable lens dragging below `900px` and for reduced motion; labelled controls always work.

- [ ] **Step 4: Style original tool scenes, verify, and commit**

Build each scene from CSS and semantic text fragments rather than app screenshots. Use familiar structural cues—timeline, curve, viewport, nodes, frames—without copying proprietary chrome. Keep all scene copy root-readable and hide purely decorative controls from assistive technology.

```css
/* ToolPlayground.module.css */
.tools { padding: clamp(88px, 12vw, 176px) clamp(20px, 5vw, 80px); overflow: clip; background: var(--surface-soft); }
.shell { position: relative; max-width: 1440px; margin: 0 auto; }
.controls { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 16px; }
.stage { position: relative; min-height: clamp(480px, 58vw, 760px); overflow: hidden; border-radius: 28px; background: var(--canvas); }
.scene[aria-hidden='true'] { visibility: hidden; pointer-events: none; }
.lens { position: absolute; width: 180px; aspect-ratio: 1; border: 3px solid var(--kairo); border-radius: 50%; box-shadow: 0 18px 50px rgb(102 92 255 / 22%); }
@media (max-width: 899px), (prefers-reduced-motion: reduce) { .lens { display: none; } }
```

Run: `npm test -- tests/toolPlayground.test.ts && npm run typecheck`

Expected: focused tests PASS and TypeScript exits 0.

```bash
git add src/landing/ToolPlayground.tsx src/landing/ToolPlayground.module.css tests/toolPlayground.test.ts
git commit -m "feat: add creative tool playground"
```

### Task 7: Preserve the waitlist and add the learner-control moment

**Files:**
- Create: `src/landing/ControlMoment.tsx`
- Create: `src/landing/ControlMoment.module.css`
- Create: `src/landing/AlphaInvitation.tsx`
- Create: `src/landing/AlphaInvitation.module.css`
- Create: `src/landing/WaitlistForm.tsx`
- Create: `src/landing/WaitlistForm.module.css`
- Create: `src/landing/FooterMark.tsx`
- Create: `tests/controlMoment.test.ts`
- Modify: `tests/landingWaitlist.test.ts`

**Interfaces:**
- Produces: `ControlMoment()` section anchor `#control` with states `guide`, `waiting`, `verified`.
- Produces: server component `AlphaInvitation()` with approved heading and founder note.
- Produces: `WaitlistForm()` and `validateWaitlistEmail(value)` with the existing `/api/waitlist` contract.
- Produces: `FooterMark()` with the accessible control name `Draw Kairo footer mark`.

- [ ] **Step 1: Add failing control/footer tests and retarget existing waitlist tests**

```tsx
// tests/controlMoment.test.ts
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ControlMoment } from '../src/landing/ControlMoment';
import { FooterMark } from '../src/landing/FooterMark';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('requires the learner action before verification', () => {
  const { container } = render(createElement(ControlMoment));
  fireEvent.click(screen.getByRole('button', { name: 'Show the next move' }));
  expect(container.querySelector('[data-control-state]')?.getAttribute('data-control-state')).toBe('waiting');
  expect(screen.queryByText('Result verified')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'I tried it' }));
  expect(screen.getByText('Result verified')).toBeTruthy();
});

test('reveals the footer phrase through an explicit control', () => {
  render(createElement(FooterMark));
  fireEvent.click(screen.getByRole('button', { name: 'Draw Kairo footer mark' }));
  expect(screen.getByText('go make something.')).toBeTruthy();
});
```

In `tests/landingWaitlist.test.ts`, replace `LandingPage` imports/renders with `WaitlistForm`, retain every validation/network/success/failure assertion, and delete only the obsolete `lets the learner pause and resume the hero demonstration` test.

- [ ] **Step 2: Run focused tests and verify missing components fail**

Run: `npm test -- tests/controlMoment.test.ts tests/landingWaitlist.test.ts`

Expected: FAIL because the new modules do not exist.

- [ ] **Step 3: Implement ControlMoment and FooterMark**

`ControlMoment` copy and transitions:

```tsx
const steps = {
  guide: { title: 'Your hands stay on the tool.', body: 'Kairo gives one useful move instead of taking the task away.' },
  waiting: { title: 'Now you try it.', body: 'Kairo waits while you make the change yourself.' },
  verified: { title: 'Result verified', body: 'The change worked. Keep going when you are ready.' }
} as const;
```

The initial button is `Show the next move`; waiting exposes `I tried it`; verified exposes `Start again`. `FooterMark` is a button containing the Kairo wordmark, toggles one completed SVG loop and “go make something.”, and renders the completed static state when reduced motion is requested.

```css
/* ControlMoment.module.css */
.control { padding: clamp(88px, 12vw, 176px) clamp(20px, 5vw, 80px); background: var(--notice); }
.stage { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, .7fr); gap: clamp(40px, 8vw, 128px); max-width: 1440px; margin: 0 auto; align-items: center; }
.panel { min-height: 360px; padding: clamp(24px, 5vw, 64px); border: 2px solid var(--ink); border-radius: 28px; background: var(--canvas); box-shadow: 16px 16px 0 var(--ink); }
@media (max-width: 760px) { .stage { grid-template-columns: 1fr; } .panel { box-shadow: 8px 8px 0 var(--ink); } }
```

- [ ] **Step 4: Extract the existing waitlist behavior without changing its contract**

Move the validation, pending guard, exact response-shape check, fetch call, focus behavior, and user-facing error strings from `TrustWaitlist.tsx` into `WaitlistForm.tsx`. Keep:

```ts
fetch('/api/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: normalizedEmail })
});
```

Use the CTA label `Request alpha access` and the existing privacy note inside `WaitlistForm`.

Create a server component around it:

```tsx
// src/landing/AlphaInvitation.tsx — no 'use client'
import { WaitlistForm } from './WaitlistForm';
import styles from './AlphaInvitation.module.css';

export function AlphaInvitation() {
  return <section id="access" className={styles.access} aria-labelledby="access-title">
    <div>
      <p>Early access</p>
      <h2 id="access-title">Bring the thing you’ve been meaning to learn.</h2>
      <p>Kairo is early, and we’re building it with creative learners. Your alpha feedback will help decide which tools Kairo learns deeply first.</p>
    </div>
    <WaitlistForm />
  </section>;
}
```

```css
/* src/landing/AlphaInvitation.module.css */
.access { display: grid; grid-template-columns: minmax(0, .9fr) minmax(320px, .7fr); gap: clamp(48px, 8vw, 128px); padding: clamp(80px, 12vw, 176px) clamp(20px, 5vw, 80px); color: white; background: var(--surface-deep); }
.access h2 { max-width: 10ch; margin: 0; font-family: "Bricolage Grotesque Variable", sans-serif; font-size: clamp(3rem, 6vw, 6.5rem); line-height: .92; letter-spacing: -.055em; }
@media (max-width: 760px) { .access { grid-template-columns: 1fr; } }
```

Do not add fields or persistence.

```css
/* WaitlistForm.module.css */
.form { display: grid; gap: 12px; align-content: start; }
.form input { min-height: 56px; padding: 0 16px; color: var(--ink); background: white; border: 2px solid transparent; border-radius: 10px; }
.form button { min-height: 56px; padding: 0 20px; color: white; background: var(--kairo); border: 0; border-radius: 10px; font-weight: 700; }
.form :focus-visible { outline: 3px solid var(--verify); outline-offset: 4px; }
.error { color: #ffb6b1; }
.success { padding: 24px; color: var(--ink); background: var(--verify); border-radius: 18px; }
```

- [ ] **Step 5: Verify waitlist regression and commit**

Run: `npm test -- tests/controlMoment.test.ts tests/landingWaitlist.test.ts tests/waitlistApi.test.ts && npm run typecheck`

Expected: all focused tests PASS; the waitlist API tests retain the same successful count and TypeScript exits 0.

```bash
git add src/landing/ControlMoment.tsx src/landing/ControlMoment.module.css src/landing/AlphaInvitation.tsx src/landing/AlphaInvitation.module.css src/landing/WaitlistForm.tsx src/landing/WaitlistForm.module.css src/landing/FooterMark.tsx tests/controlMoment.test.ts tests/landingWaitlist.test.ts
git commit -m "feat: add learner control and alpha request"
```

### Task 8: Assemble the server-rendered page and remove the field-notes system

**Files:**
- Rewrite: `src/landing/LandingPage.tsx`
- Rewrite: `src/landing/LandingPage.module.css`
- Modify: `src/styles.css`
- Rewrite: `tests/landingPage.test.ts`
- Rewrite: `tests/landingSsr.test.ts`
- Rewrite: `tests/nextCssModules.test.ts`
- Delete: legacy components, CSS modules, and field-notes assets listed in the File Map.

**Interfaces:**
- Consumes: all components produced by Tasks 3–7.
- Produces: server-renderable `LandingPage()` with ordered anchors `top`, `product-moments`, `capabilities`, `tools`, `control`, and `access`.

- [ ] **Step 1: Replace legacy structure tests with the Living Canvas contract**

```tsx
test('renders the Living Canvas chapters in order', () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  const markers = ['id="top"', 'id="product-moments"', 'id="capabilities"', 'id="tools"', 'id="control"', 'id="access"', '<footer'];
  const positions = markers.map((marker) => html.indexOf(marker));
  positions.forEach((position) => expect(position).toBeGreaterThan(-1));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(html).toContain('Learn any creative tool without leaving it.');
  expect(html).toContain('Your hands stay on the tool.');
  expect(html).not.toContain('data-field-notes');
});
```

```ts
// tests/nextCssModules.test.ts
test('keeps content visible by default and limits reduced-motion overrides', () => {
  const css = readFileSync('src/landing/LandingPage.module.css', 'utf8');
  expect(css).not.toMatch(/\[data-reveal\].*opacity:\s*0/s);
  expect(css).not.toContain('clip-path: inset');
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
});
```

Update SSR tests to expect one `h1`, all approved copy, no browser-global crash, and no old `/field-notes/` or `/kairo-blender-preview.webp` asset URLs.

- [ ] **Step 2: Run structural tests and verify the old page fails**

Run: `npm test -- tests/landingPage.test.ts tests/landingSsr.test.ts tests/nextCssModules.test.ts`

Expected: FAIL because the old sections, field-notes marker, and old assets remain.

- [ ] **Step 3: Compose the new page as a server component**

```tsx
// src/landing/LandingPage.tsx
import { AlphaInvitation } from './AlphaInvitation';
import { CapabilityStage } from './CapabilityStage';
import { ControlMoment } from './ControlMoment';
import { FooterMark } from './FooterMark';
import { Hero } from './Hero';
import { ProductMoments } from './ProductMoments';
import { ToolPlayground } from './ToolPlayground';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Kairo home">kairo</a>
        <nav aria-label="Landing page">
          <a href="#product-moments">How it helps</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#tools">Tools</a>
        </nav>
        <a className={styles.headerCta} href="#access">Request alpha access</a>
      </header>
      <main>
        <Hero />
        <ProductMoments />
        <CapabilityStage />
        <ToolPlayground />
        <ControlMoment />
        <AlphaInvitation />
      </main>
      <footer className={styles.footer}><FooterMark /></footer>
    </div>
  );
}
```

Do not add `'use client'` to `LandingPage.tsx`.

- [ ] **Step 4: Rewrite page styling and remove old tracked visuals**

Implement the twelve-column `1440px` grid, sticky readable header, section scroll margins, approved spacing scale, bright/deep rhythm, and compact footer. Mobile navigation stays available in a horizontally scrollable or wrapped row; it must not be hidden.

```css
/* LandingPage.module.css */
.page { min-width: 320px; overflow-x: clip; color: var(--ink); background: var(--canvas); }
.page :global(section[id]) { scroll-margin-top: 76px; }
.page :focus-visible { outline: 3px solid var(--kairo); outline-offset: 4px; }
.header { position: sticky; z-index: 50; top: 0; display: grid; grid-template-columns: 1fr auto 1fr; min-height: 76px; padding: 0 clamp(20px, 5vw, 80px); align-items: center; gap: 24px; border-bottom: 1px solid rgb(11 13 18 / 12%); background: rgb(245 247 251 / 88%); backdrop-filter: blur(18px); }
.wordmark, .header a { color: inherit; text-decoration: none; }
.header nav { display: flex; gap: clamp(16px, 3vw, 40px); }
.headerCta { justify-self: end; min-height: 44px; padding: 0 16px; align-items: center; color: white !important; background: var(--ink); border-radius: 10px; }
.footer { display: grid; min-height: 260px; padding: 56px clamp(20px, 5vw, 80px); place-items: center; color: white; background: #0b0d12; }
@media (max-width: 760px) { .header { grid-template-columns: 1fr auto; } .header nav { grid-column: 1 / -1; order: 3; overflow-x: auto; padding-bottom: 10px; } }
@media (prefers-reduced-motion: reduce) { .page *, .page *::before, .page *::after { scroll-behavior: auto !important; } }
```

Remove legacy files with explicit paths:

```bash
git rm src/landing/LearningSequence.tsx src/landing/LearningSequence.module.css
git rm src/landing/VisualField.tsx src/landing/VisualField.module.css
git rm src/landing/TrustWaitlist.tsx src/landing/TrustWaitlist.module.css
git rm public/kairo-blender-preview.webp
git rm -r public/field-notes
```

- [ ] **Step 5: Verify server composition and commit**

Run: `npm test -- tests/landingPage.test.ts tests/landingSsr.test.ts tests/nextCssModules.test.ts tests/landingWaitlist.test.ts && npm run typecheck`

Expected: focused tests PASS, SSR uses no old assets, and TypeScript exits 0.

```bash
git add src/landing src/styles.css tests/landingPage.test.ts tests/landingSsr.test.ts tests/nextCssModules.test.ts
git commit -m "feat: assemble living canvas homepage"
```

### Task 9: Replace the browser journey and perform the visual quality pass

**Files:**
- Rewrite: `tests/e2e/landing.spec.ts`
- Create: `tests/e2e/hero-interaction.spec.ts`
- Modify: component CSS/TSX files only where fresh browser evidence identifies a defect.

**Interfaces:**
- Consumes: the integrated homepage.
- Produces: browser coverage for content, drawing fallback, manual interactions, mobile navigation, reduced motion, and waitlist submission.

- [ ] **Step 1: Write browser tests for the new journey**

Cover these exact behaviors:

```ts
test('explains Kairo and exposes every chapter', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Kairo — Learn any creative tool');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Learn any creative tool without leaving it.');
  await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  for (const id of ['product-moments', 'capabilities', 'tools', 'control', 'access']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test('supports manual learning interactions without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Kairo about the timeline' }).click();
  await expect(page.getByRole('status')).toContainText('easing');
  await page.getByRole('tab', { name: 'Point together' }).click();
  await page.getByRole('tab', { name: 'DaVinci Resolve' }).click();
  await page.getByRole('button', { name: 'Show the next move' }).click();
  await expect(page.getByText('Now you try it.')).toBeVisible();
  expect(errors).toEqual([]);
});
```

Retain the existing normalized-email request interception and exact-once assertion, changing only the submit label to `Request alpha access`. Add a `390×844` test confirming navigation remains accessible and there is no horizontal overflow. Add a reduced-motion context test confirming copy is visible and idle animations do not begin.

Create `tests/e2e/hero-interaction.spec.ts` for pointer/keyboard and touch-specific behavior:

```ts
import { devices, expect, test } from '@playwright/test';

test('keeps keyboard target selection equivalent to drawing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Kairo about the layers' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('driving the motion');
});

test.describe('touch hero', () => {
  test.use({ ...devices['Pixel 7'] });
  test('keeps vertical scrolling available outside the drawing region', async ({ page }) => {
    await page.goto('/');
    await page.locator('#product-moments').scrollIntoViewIfNeeded();
    await expect(page.locator('#product-moments')).toBeInViewport();
  });
});
```

- [ ] **Step 2: Build and run E2E to expose integration defects**

Run: `npm run build && npm run test:e2e`

Expected: PASS if Tasks 1–8 satisfy the browser contract. Any failure is treated as concrete browser, responsive, or accessibility evidence and recorded before code changes.

- [ ] **Step 3: Fix only evidence-backed browser defects**

For each failure, make the smallest component-local correction, rerun the named failing Playwright test, and then rerun the full E2E file. Do not add animation or layout changes unrelated to an observed failure.

- [ ] **Step 4: Complete the manual motion and responsive review**

Inspect `1440×1000`, `1024×768`, `768×1024`, `430×932`, `390×844`, and `320×700` with normal and reduced motion. Verify:

- headline and primary CTA appear before hydration;
- hero ink follows mouse/trackpad without visible lag;
- touch scrolling remains available outside an active draw;
- animations preserve origin and settle without bounce;
- no automatic sequence loops after reaching rest;
- all focus indicators remain visible;
- mobile navigation and tool controls remain usable;
- no horizontal overflow or blank observer-gated content;
- the waitlist remains usable after every interaction.

Use browser performance profiling during one drawing gesture. If React component commits occur for every pointer sample, move those samples out of React state before proceeding.

- [ ] **Step 5: Run the complete verification matrix and commit**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

Expected: 0 test failures, TypeScript exit 0, production build exit 0, Playwright exit 0, and no whitespace errors.

```bash
git add tests/e2e/landing.spec.ts tests/e2e/hero-interaction.spec.ts src/landing src/styles.css
git commit -m "test: verify living canvas experience"
```

### Task 10: Publish the reusable Kairo design guidelines

**Files:**
- Create: `docs/KAIRO_DESIGN_GUIDELINES.md`
- Modify: `docs/superpowers/specs/2026-07-19-kairo-living-canvas-homepage-design.md`
- Create: `tests/e2e/visual.spec.ts`
- Create: Playwright snapshot files generated from the approved desktop and mobile page.

**Interfaces:**
- Consumes: the user-approved implemented page, final CSS tokens, and verified motion behavior.
- Produces: the portable design input for future Kairo pages.

- [ ] **Step 1: Obtain the visual-approval gate**

Show the verified desktop and mobile page to the user and ask for explicit approval of the implemented visual direction. Do not create the reusable guideline before approval; requested visual changes return to Task 9's focused browser-review loop.

- [ ] **Step 2: Record stable visual regression baselines after approval**

```ts
// tests/e2e/visual.spec.ts
import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
] as const) {
  test(`${viewport.name} approved composition`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`${viewport.name}-living-canvas.png`, {
      animations: 'disabled', fullPage: true
    });
  });
}
```

Run once to write approved snapshots, then immediately run again without update mode:

```bash
npx playwright test tests/e2e/visual.spec.ts --update-snapshots
npx playwright test tests/e2e/visual.spec.ts
```

Expected: the second command passes with 2 visual tests and no snapshot differences.

- [ ] **Step 3: Write the guideline from implemented evidence**

Create `docs/KAIRO_DESIGN_GUIDELINES.md` with these complete sections:

1. Brand premise: playful creative companion backed by serious capability.
2. Product-language rules: tutor, screen context, two-way annotation, guided learning, no agentic-task claims.
3. Exact final color, typography, spacing, radius, grid, and border tokens copied from the implemented CSS.
4. Kairo presence: cursor, ink, listening pulse, anchored label, and prepared reaction rules.
5. Motion signature: final spring values, duration bounds, interruption, visibility, and reduced-motion behavior.
6. Composition patterns: calm/interactive alternation, asymmetric fragments, copy hierarchy, and section density.
7. Component patterns: CTAs, tabs, deep stages, drawing targets, tool controls, waitlist, and footer mark.
8. Accessibility and performance requirements.
9. Do/don't examples, including no mascot, no generic bento grid, no floating chatbot, no scroll hijack, no endless loop, and no decorative bounce.
10. A checklist for applying the system to another Kairo page without cloning the homepage composition.

Change the spec status from `Approved for implementation` to `Implemented and visually approved`, and link the guideline from its Delivery Strategy section.

- [ ] **Step 4: Verify documentation consistency**

Run:

```bash
rg -n "TBD|TODO|FIXME|PLACEHOLDER" docs/KAIRO_DESIGN_GUIDELINES.md docs/superpowers/specs/2026-07-19-kairo-living-canvas-homepage-design.md
git diff --check
```

Expected: `rg` prints nothing and `git diff --check` exits 0.

- [ ] **Step 5: Commit the reusable system**

```bash
git add docs/KAIRO_DESIGN_GUIDELINES.md docs/superpowers/specs/2026-07-19-kairo-living-canvas-homepage-design.md tests/e2e/visual.spec.ts tests/e2e/visual.spec.ts-snapshots
git commit -m "docs: publish kairo design guidelines"
```

## Final Handoff

After Task 10, run the full verification matrix once more and report:

- branch and worktree path;
- commits created per task;
- fresh unit, typecheck, build, and E2E results;
- any remaining npm audit findings without applying breaking `--force` updates;
- the exact paths to the approved homepage spec and reusable design guidelines.
