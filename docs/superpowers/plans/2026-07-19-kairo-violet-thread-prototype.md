# Kairo Violet Thread Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Chapter 1 “Notice” lesson and its visual handoff into Chapter 2 “Understand” as a live, testable quality-gate prototype.

**Architecture:** Replace only the current hero with a coordinated `WorkspacePrototype` client island that owns a small verified/not-verified bridge between `NoticeLesson` and `ContextLayers`. Keep lesson transitions and handle verification in a pure reducer, keep Violet Thread rendering isolated, reuse the existing freehand geometry, and leave the current lower chapters and waitlist intact until the prototype receives explicit visual approval.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.7, Motion 12, perfect-freehand, CSS Modules, Vitest, Testing Library, Playwright.

## Global Constraints

- Scope is Chapter 1 “Notice” plus the visual transition into Chapter 2 “Understand” only.
- Do not rebuild Chapters 3–5 before the prototype passes the live visual gate.
- Kairo remains an in-context tutor; do not introduce autonomous task execution language.
- Use authored DOM/SVG scenes and label them through presentation as illustrative, not as a live Kairo product session.
- Preserve `WaitlistForm`, `/api/waitlist`, email normalization, focus, error, pending, and success behavior unchanged.
- Preserve the existing lower chapters while the prototype is evaluated; old hero files may remain unreferenced until approval.
- Use the exact primary copy `Stuck? Point at it.` and `You don’t have to explain the whole screen.`
- Violet means guidance, warm lime means verified, and coral means unresolved or incorrect.
- The Violet Thread must communicate `dormant → notice → attach → guide → wait → verify → travel`; it must not become ambient decoration.
- The authored opening plays once, stops when the user interacts, and pauses when the page is hidden.
- Direct UI feedback remains below 300 ms; explanatory travel may use 400–650 ms.
- Animate transform, opacity, and SVG path progress; do not animate layout during active input.
- Do not add dependencies, WebGL, shaders, 3D runtimes, cursor replacement, or scroll hijacking.
- Mobile must not require hover, freehand drawing, or precision dragging; the range control remains a large touch target.
- Keyboard changes happen without spatial animation and can complete the lesson.
- Reduced-motion mode renders the complete instructional state without waiting for an animation.
- Static server output must retain one `h1`, the full product explanation, chapter headings, and alpha access.
- Do not create screenshot baselines or `KAIRO_DESIGN_GUIDELINES.md` until explicit visual approval.

---

## File Structure

### Create

- `src/landing/violet-thread/noticeLesson.ts` — pure lesson reducer, handle bounds, verification threshold, and phase-to-Thread mapping.
- `src/landing/violet-thread/VioletThread.tsx` — state-driven SVG Thread renderer.
- `src/landing/violet-thread/VioletThread.module.css` — Thread stroke, verified color, layering, and reduced-motion treatment.
- `src/landing/violet-thread/NoticeLesson.tsx` — interactive Chapter 1 workspace, authored opening, target selection, drawing, handle input, waiting, and verification.
- `src/landing/violet-thread/NoticeLesson.module.css` — graphite/bone workspace, editor geometry, responsive handle control, and semantic state styling.
- `src/landing/violet-thread/ContextLayers.tsx` — Chapter 2 preview with the four connected context layers.
- `src/landing/violet-thread/ContextLayers.module.css` — spatial context composition and Thread handoff.
- `src/landing/violet-thread/WorkspacePrototype.tsx` — shared prototype state and two-chapter semantic composition.
- `src/landing/violet-thread/WorkspacePrototype.module.css` — hero copy, chapter rhythm, and prototype-level responsive layout.
- `tests/noticeLesson.test.ts` — pure reducer and threshold tests.
- `tests/workspacePrototype.test.ts` — component semantics, interaction, mobile-equivalent control, and reduced-motion tests.

### Modify

- `src/landing/Hero.tsx` — replace the old copy/canvas composition with the prototype island.
- `src/landing/LandingPage.tsx` — point header navigation at the prototype chapters while preserving lower chapters and alpha access.
- `src/landing/LandingPage.module.css` — adapt the header surface to the graphite/bone prototype without changing lower sections.
- `tests/landingPage.test.ts` — assert new copy, chapter ordering, and navigation while retaining waitlist validation coverage.
- `tests/landingSsr.test.ts` — assert the new server-rendered story and one-heading contract.
- `tests/e2e/hero-interaction.spec.ts` — replace old fragment checks with target selection, handle verification, pointer drawing, touch, and keyboard paths.
- `tests/e2e/landing.spec.ts` — assert new chapter presence, reduced-motion completion, hydration, and unchanged waitlist behavior.

### Preserve Until Prototype Approval

- `src/landing/HeroCanvas.tsx`
- `src/landing/HeroCanvas.module.css`
- `src/landing/Hero.module.css`
- `src/landing/ProductMoments.tsx` and its CSS module
- `src/landing/CapabilityStage.tsx` and its CSS module
- `src/landing/ToolPlayground.tsx` and its CSS module
- `src/landing/ControlMoment.tsx` and its CSS module
- `src/landing/AlphaInvitation.tsx`, `src/landing/WaitlistForm.tsx`, and their CSS modules

---

### Task 1: Pure Notice Lesson Model

**Files:**
- Create: `src/landing/violet-thread/noticeLesson.ts`
- Create: `tests/noticeLesson.test.ts`

**Interfaces:**
- Consumes: no browser or React APIs.
- Produces: `NoticePhase`, `NoticeState`, `NoticeEvent`, `INITIAL_NOTICE_STATE`, `STATIC_NOTICE_STATE`, `NOTICE_HANDLE_MIN`, `NOTICE_HANDLE_MAX`, `NOTICE_HANDLE_TARGET_MIN`, `NOTICE_HANDLE_TARGET_MAX`, `noticeLessonReducer`, `isNoticeHandleVerified`, and `threadStateForNoticePhase`.

- [ ] **Step 1: Write the failing reducer tests**

Create `tests/noticeLesson.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import {
  INITIAL_NOTICE_STATE,
  NOTICE_HANDLE_MAX,
  NOTICE_HANDLE_MIN,
  NOTICE_HANDLE_TARGET_MAX,
  NOTICE_HANDLE_TARGET_MIN,
  isNoticeHandleVerified,
  noticeLessonReducer,
  threadStateForNoticePhase
} from '../src/landing/violet-thread/noticeLesson';

describe('notice lesson model', () => {
  test('advances only through learner-controlled phases', () => {
    const noticed = noticeLessonReducer(INITIAL_NOTICE_STATE, { type: 'PREVIEW_FINISHED' });
    const attached = noticeLessonReducer(noticed, { type: 'TARGET_SELECTED' });
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const waiting = noticeLessonReducer(guiding, { type: 'HANDLE_CHANGED', value: 58 });
    const verified = noticeLessonReducer(waiting, { type: 'HANDLE_COMMITTED', value: 72 });

    expect([noticed.phase, attached.phase, guiding.phase, waiting.phase, verified.phase]).toEqual([
      'noticed',
      'attached',
      'guiding',
      'waiting',
      'verified'
    ]);
    expect(verified.handle).toBe(72);
  });

  test('manual selection interrupts the authored opening and cancellation never verifies', () => {
    const attached = noticeLessonReducer(INITIAL_NOTICE_STATE, { type: 'TARGET_SELECTED' });
    const lateOpening = noticeLessonReducer(attached, { type: 'PREVIEW_FINISHED' });
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const waiting = noticeLessonReducer(guiding, { type: 'HANDLE_CHANGED', value: 72 });
    const cancelled = noticeLessonReducer(waiting, { type: 'HANDLE_CANCELLED' });

    expect(attached.phase).toBe('attached');
    expect(lateOpening).toEqual(attached);
    expect(cancelled).toEqual({ phase: 'waiting', handle: 72 });
  });

  test('clamps the handle and refuses verification outside the target range', () => {
    const attached = noticeLessonReducer(
      { ...INITIAL_NOTICE_STATE, phase: 'noticed' },
      { type: 'TARGET_SELECTED' }
    );
    const guiding = noticeLessonReducer(attached, { type: 'GUIDANCE_READY' });
    const below = noticeLessonReducer(guiding, { type: 'HANDLE_COMMITTED', value: -30 });
    const above = noticeLessonReducer(guiding, { type: 'HANDLE_COMMITTED', value: 160 });

    expect(below).toEqual({ phase: 'waiting', handle: NOTICE_HANDLE_MIN });
    expect(above).toEqual({ phase: 'waiting', handle: NOTICE_HANDLE_MAX });
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MIN)).toBe(true);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MAX)).toBe(true);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MIN - 1)).toBe(false);
    expect(isNoticeHandleVerified(NOTICE_HANDLE_TARGET_MAX + 1)).toBe(false);
  });

  test('maps lesson phases to the semantic Violet Thread vocabulary', () => {
    expect(threadStateForNoticePhase('preview')).toBe('dormant');
    expect(threadStateForNoticePhase('noticed')).toBe('notice');
    expect(threadStateForNoticePhase('attached')).toBe('attach');
    expect(threadStateForNoticePhase('guiding')).toBe('guide');
    expect(threadStateForNoticePhase('waiting')).toBe('wait');
    expect(threadStateForNoticePhase('verified')).toBe('verify');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run:

```bash
npm test -- tests/noticeLesson.test.ts
```

Expected: FAIL because `src/landing/violet-thread/noticeLesson.ts` does not exist.

- [ ] **Step 3: Implement the pure model**

Create `src/landing/violet-thread/noticeLesson.ts`:

```ts
export type NoticePhase = 'preview' | 'noticed' | 'attached' | 'guiding' | 'waiting' | 'verified';
export type VioletThreadState = 'dormant' | 'notice' | 'attach' | 'guide' | 'wait' | 'verify' | 'travel';

export type NoticeState = Readonly<{
  phase: NoticePhase;
  handle: number;
}>;

export type NoticeEvent =
  | Readonly<{ type: 'PREVIEW_FINISHED' }>
  | Readonly<{ type: 'TARGET_SELECTED' }>
  | Readonly<{ type: 'GUIDANCE_READY' }>
  | Readonly<{ type: 'HANDLE_CHANGED'; value: number }>
  | Readonly<{ type: 'HANDLE_COMMITTED'; value: number }>
  | Readonly<{ type: 'HANDLE_CANCELLED' }>
  | Readonly<{ type: 'SHOW_STATIC_STORYBOARD' }>
  | Readonly<{ type: 'RESET' }>;

export const NOTICE_HANDLE_MIN = 0;
export const NOTICE_HANDLE_MAX = 100;
export const NOTICE_HANDLE_START = 88;
export const NOTICE_HANDLE_TARGET_MIN = 66;
export const NOTICE_HANDLE_TARGET_MAX = 78;

export const INITIAL_NOTICE_STATE: NoticeState = {
  phase: 'preview',
  handle: NOTICE_HANDLE_START
};

export const STATIC_NOTICE_STATE: NoticeState = {
  phase: 'verified',
  handle: 72
};

function clampNoticeHandle(value: number) {
  return Math.min(NOTICE_HANDLE_MAX, Math.max(NOTICE_HANDLE_MIN, value));
}

export function isNoticeHandleVerified(value: number) {
  return value >= NOTICE_HANDLE_TARGET_MIN && value <= NOTICE_HANDLE_TARGET_MAX;
}

export function noticeLessonReducer(state: NoticeState, event: NoticeEvent): NoticeState {
  if (event.type === 'RESET') return INITIAL_NOTICE_STATE;
  if (event.type === 'SHOW_STATIC_STORYBOARD') return STATIC_NOTICE_STATE;
  if (event.type === 'PREVIEW_FINISHED' && state.phase === 'preview') {
    return { ...state, phase: 'noticed' };
  }
  if (event.type === 'TARGET_SELECTED' && state.phase !== 'verified') {
    return { ...state, phase: 'attached' };
  }
  if (event.type === 'GUIDANCE_READY' && state.phase === 'attached') return { ...state, phase: 'guiding' };
  if (event.type === 'HANDLE_CHANGED' && (state.phase === 'guiding' || state.phase === 'waiting')) {
    return { phase: 'waiting', handle: clampNoticeHandle(event.value) };
  }
  if (event.type === 'HANDLE_COMMITTED' && (state.phase === 'guiding' || state.phase === 'waiting')) {
    const handle = clampNoticeHandle(event.value);
    return { phase: isNoticeHandleVerified(handle) ? 'verified' : 'waiting', handle };
  }
  if (event.type === 'HANDLE_CANCELLED' && state.phase === 'waiting') return state;
  return state;
}

export function threadStateForNoticePhase(phase: NoticePhase): VioletThreadState {
  if (phase === 'preview') return 'dormant';
  if (phase === 'noticed') return 'notice';
  if (phase === 'attached') return 'attach';
  if (phase === 'guiding') return 'guide';
  if (phase === 'waiting') return 'wait';
  return 'verify';
}
```

- [ ] **Step 4: Run the focused test and typecheck**

Run:

```bash
npm test -- tests/noticeLesson.test.ts
npm run typecheck
```

Expected: 4 tests PASS; typecheck PASS.

- [ ] **Step 5: Commit the model**

```bash
git add src/landing/violet-thread/noticeLesson.ts tests/noticeLesson.test.ts
git commit -m "feat: model violet thread lesson"
```

---

### Task 2: Semantic Violet Thread Renderer

**Files:**
- Create: `src/landing/violet-thread/VioletThread.tsx`
- Create: `src/landing/violet-thread/VioletThread.module.css`
- Modify: `tests/workspacePrototype.test.ts` (create in this task)

**Interfaces:**
- Consumes: `VioletThreadState` from `noticeLesson.ts` and `SCENE_SPRING` from `src/landing/motion.ts`.
- Produces: `VioletThread({ state, className?, label? })` and stable hooks `data-violet-thread`, `data-thread-state`, and `data-thread-verified`.

- [ ] **Step 1: Write the failing renderer test**

Create `tests/workspacePrototype.test.ts`:

```ts
// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { VioletThread } from '../src/landing/violet-thread/VioletThread';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('Violet Thread prototype', () => {
  test('renders a semantic path for each instructional state', () => {
    const { rerender } = render(createElement(VioletThread, { state: 'notice' }));
    const thread = document.querySelector('[data-violet-thread]');
    expect(thread?.getAttribute('data-thread-state')).toBe('notice');
    expect(thread?.querySelector('path')?.getAttribute('d')).toBeTruthy();

    rerender(createElement(VioletThread, { state: 'verify' }));
    expect(thread?.getAttribute('data-thread-state')).toBe('verify');
    expect(thread?.getAttribute('data-thread-verified')).toBe('true');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts
```

Expected: FAIL because `VioletThread.tsx` does not exist.

- [ ] **Step 3: Implement the Thread renderer**

Create `src/landing/violet-thread/VioletThread.tsx`:

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SCENE_SPRING } from '../motion';
import type { VioletThreadState } from './noticeLesson';
import styles from './VioletThread.module.css';

const THREAD_PATHS: Record<VioletThreadState, string> = {
  dormant: 'M24 64C24 64 24 64 24 64',
  notice: 'M24 64C138 18 236 32 330 104C370 134 402 142 452 132',
  attach: 'M24 64C138 18 244 32 334 110C370 142 406 152 462 142',
  guide: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  wait: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  verify: 'M24 64C138 18 250 34 334 114C380 158 420 176 486 138',
  travel: 'M24 64C172 20 284 52 382 150C430 198 468 230 520 286'
};

type VioletThreadProps = Readonly<{
  state: VioletThreadState;
  className?: string;
  label?: string;
}>;

export function VioletThread({ state, className, label = 'Kairo guidance' }: VioletThreadProps) {
  const reducedMotion = useReducedMotion();
  const verified = state === 'verify' || state === 'travel';

  return (
    <svg
      className={[styles.thread, className].filter(Boolean).join(' ')}
      viewBox="0 0 544 320"
      role="img"
      aria-label={label}
      data-violet-thread
      data-thread-state={state}
      data-thread-verified={verified}
    >
      <motion.path
        d={THREAD_PATHS[state]}
        initial={reducedMotion ? false : { pathLength: state === 'dormant' ? 0 : 0.08, opacity: 0 }}
        animate={{
          d: THREAD_PATHS[state],
          pathLength: state === 'dormant' ? 0 : 1,
          opacity: state === 'dormant' ? 0 : 1
        }}
        transition={reducedMotion ? { duration: 0 } : SCENE_SPRING}
      />
    </svg>
  );
}
```

Create `src/landing/violet-thread/VioletThread.module.css`:

```css
.thread {
  position: absolute;
  z-index: 8;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.thread path {
  fill: none;
  stroke: var(--kairo);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 7;
  filter: drop-shadow(0 2px 1px rgb(11 13 18 / 16%));
}

.thread[data-thread-verified='true'] path {
  stroke: var(--verify);
}

.thread[data-thread-state='wait'] path {
  opacity: 0.82;
}

@media (prefers-reduced-motion: reduce) {
  .thread path {
    transform: none !important;
  }
}
```

- [ ] **Step 4: Run the renderer test and typecheck**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts
npm run typecheck
```

Expected: renderer test PASS; typecheck PASS.

- [ ] **Step 5: Commit the renderer**

```bash
git add src/landing/violet-thread/VioletThread.tsx src/landing/violet-thread/VioletThread.module.css tests/workspacePrototype.test.ts
git commit -m "feat: add semantic violet thread"
```

---

### Task 3: Notice Lesson Interaction

**Files:**
- Create: `src/landing/violet-thread/NoticeLesson.tsx`
- Create: `src/landing/violet-thread/NoticeLesson.module.css`
- Modify: `tests/workspacePrototype.test.ts`

**Interfaces:**
- Consumes: `noticeLessonReducer`, `INITIAL_NOTICE_STATE`, `threadStateForNoticePhase`, `NOTICE_HANDLE_MIN`, `NOTICE_HANDLE_MAX`, and `VioletThread`.
- Produces: `NoticeLesson({ onVerified, traveling? })`; accessible controls named `Select the abrupt stop`, `Adjust the outgoing easing handle`, and `Reset lesson`; stable root hook `data-notice-phase`.

- [ ] **Step 1: Add failing interaction tests**

Append to `tests/workspacePrototype.test.ts`:

```ts
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { NoticeLesson } from '../src/landing/violet-thread/NoticeLesson';

test('lets the learner select, adjust, and verify the abrupt stop', () => {
  vi.useFakeTimers();
  const onVerified = vi.fn();
  render(createElement(NoticeLesson, { onVerified }));

  act(() => vi.advanceTimersByTime(900));
  expect(screen.getByText('That stop feels wrong, doesn’t it?')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
  act(() => vi.advanceTimersByTime(160));
  expect(screen.getByText('Give the stop more room. Pull this handle left.')).toBeTruthy();

  const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
  fireEvent.change(handle, { target: { value: '72' } });
  expect(document.querySelector('[data-notice-phase="waiting"]')).toBeTruthy();
  fireEvent.pointerUp(handle);

  expect(screen.getByRole('status').textContent).toContain('Result verified');
  expect(onVerified).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test('keeps an incorrect handle position in the waiting state', () => {
  vi.useFakeTimers();
  render(createElement(NoticeLesson, { onVerified: vi.fn() }));
  fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
  act(() => vi.advanceTimersByTime(160));
  const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
  fireEvent.change(handle, { target: { value: '45' } });
  fireEvent.pointerUp(handle);

  expect(document.querySelector('[data-notice-phase="waiting"]')).toBeTruthy();
  expect(screen.getByText('Kairo is waiting for your adjustment.')).toBeTruthy();
  vi.useRealTimers();
});

test('renders the completed instructional state when reduced motion is requested', () => {
  installBrowserEnvironment({ reducedMotion: true });
  const onVerified = vi.fn();
  render(createElement(NoticeLesson, { onVerified }));

  expect(document.querySelector('[data-notice-phase="verified"]')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('Result verified');
  expect(onVerified).toHaveBeenCalledTimes(1);
});
```

Move the shared Testing Library and Vitest imports into a single import statement so the file contains no duplicate imports.

- [ ] **Step 2: Run the focused test and verify the missing-component failure**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts
```

Expected: FAIL because `NoticeLesson.tsx` does not exist.

- [ ] **Step 3: Implement the lesson state and semantic workspace**

Create `src/landing/violet-thread/NoticeLesson.tsx` with this complete behavioral structure:

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useReducer, useRef } from 'react';
import { SURFACE_SPRING } from '../motion';
import {
  INITIAL_NOTICE_STATE,
  NOTICE_HANDLE_MAX,
  NOTICE_HANDLE_MIN,
  noticeLessonReducer,
  threadStateForNoticePhase
} from './noticeLesson';
import { VioletThread } from './VioletThread';
import styles from './NoticeLesson.module.css';

type NoticeLessonProps = Readonly<{ onVerified: () => void; traveling?: boolean }>;

export function NoticeLesson({ onVerified, traveling = false }: NoticeLessonProps) {
  const reducedMotion = useReducedMotion();
  const [state, dispatch] = useReducer(noticeLessonReducer, INITIAL_NOTICE_STATE);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: 'SHOW_STATIC_STORYBOARD' });
      return undefined;
    }
    const timer = window.setTimeout(() => dispatch({ type: 'PREVIEW_FINISHED' }), 900);
    const pauseWhenHidden = () => {
      if (document.hidden) window.clearTimeout(timer);
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (state.phase !== 'attached') return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'GUIDANCE_READY' }), 160);
    return () => window.clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'verified' || verifiedRef.current) return;
    verifiedRef.current = true;
    onVerified();
  }, [onVerified, state.phase]);

  const commitHandle = (value: number) => {
    dispatch({ type: 'HANDLE_COMMITTED', value });
  };

  return (
    <div className={styles.lesson} data-notice-phase={state.phase}>
      <div className={styles.editorBar} aria-hidden="true">
        <span>Composition · Title study</span><b>00:08:12</b><em>100%</em>
      </div>
      <div className={styles.preview} aria-label="A title animation with an abrupt stop">
        <motion.strong
          initial={reducedMotion ? false : { transform: 'translateX(-22%)' }}
          animate={{ transform: `translateX(${(state.handle - 72) * 0.6}px)` }}
          transition={reducedMotion || state.phase === 'waiting'
            ? { duration: 0 }
            : { duration: 0.62, ease: [0.2, 0.8, 0.2, 1] }}
        >
          MAKE IT<br />FEEL NATURAL
        </motion.strong>
      </div>
      <div className={styles.graph}>
        <span className={styles.graphLabel}>Speed graph · outgoing</span>
        <svg viewBox="0 0 520 220" aria-hidden="true">
          <path className={styles.gridLine} d="M28 182H492M28 122H492M28 62H492" />
          <motion.path
            className={styles.curve}
            d={`M42 182C${122 + state.handle} 182 ${290 + state.handle} 42 476 42`}
            animate={{ d: `M42 182C${122 + state.handle} 182 ${290 + state.handle} 42 476 42` }}
            transition={reducedMotion || state.phase === 'waiting' ? { duration: 0 } : SURFACE_SPRING}
          />
        </svg>
        <button
          type="button"
          className={styles.problemTarget}
          aria-label="Select the abrupt stop"
          onClick={() => dispatch({ type: 'TARGET_SELECTED' })}
        />
        <label className={styles.handleControl}>
          <span>Adjust the outgoing easing handle</span>
          <input
            type="range"
            min={NOTICE_HANDLE_MIN}
            max={NOTICE_HANDLE_MAX}
            step="1"
            value={state.handle}
            disabled={state.phase === 'preview' || state.phase === 'noticed' || state.phase === 'attached' || state.phase === 'verified'}
            aria-label="Adjust the outgoing easing handle"
            onChange={(event) => dispatch({ type: 'HANDLE_CHANGED', value: Number(event.target.value) })}
            onPointerUp={(event) => commitHandle(Number(event.currentTarget.value))}
            onPointerCancel={() => dispatch({ type: 'HANDLE_CANCELLED' })}
            onKeyUp={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                commitHandle(Number(event.currentTarget.value));
              }
            }}
          />
        </label>
      </div>
      <VioletThread state={traveling ? 'travel' : threadStateForNoticePhase(state.phase)} />
      <div className={styles.kairoNote} aria-live="polite">
        {state.phase === 'noticed' ? <p>That stop feels wrong, doesn’t it?</p> : null}
        {state.phase === 'guiding' ? <p>Give the stop more room. Pull this handle left.</p> : null}
        {state.phase === 'waiting' ? <p>Kairo is waiting for your adjustment.</p> : null}
        {state.phase === 'verified' ? <p role="status">Result verified. That stop has room now.</p> : null}
      </div>
      {state.phase === 'verified' ? (
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            verifiedRef.current = false;
            dispatch({ type: 'RESET' });
          }}
        >
          Reset lesson
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Add the authored graphite/bone workspace styling**

Create `src/landing/violet-thread/NoticeLesson.module.css` with these required authored rules; keep additions within the same semantic selectors:

```css
.lesson {
  position: relative;
  min-height: clamp(560px, 64vw, 760px);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 9%);
  background: #141518;
  color: #f7f3e8;
  isolation: isolate;
}

.editorBar {
  display: grid;
  min-height: 46px;
  padding: 0 18px;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  color: rgb(247 243 232 / 58%);
  font-family: "Geist Mono Variable", monospace;
  font-size: 0.68rem;
}

.editorBar b { color: var(--kairo); }
.editorBar em { justify-self: end; font-style: normal; }

.preview {
  position: absolute;
  top: 12%;
  right: 7%;
  left: 7%;
  display: grid;
  height: 38%;
  place-items: center;
  overflow: hidden;
  background: #eee8dc;
  color: #111216;
}

.preview strong {
  font-family: "Bricolage Grotesque Variable", sans-serif;
  font-size: clamp(2.6rem, 6vw, 6.8rem);
  font-weight: 720;
  line-height: 0.78;
  letter-spacing: -0.075em;
}

.graph {
  position: absolute;
  right: 7%;
  bottom: 7%;
  left: 7%;
  height: 36%;
  border-top: 1px solid rgb(255 255 255 / 8%);
  background: #0d0e11;
}

.graph svg { width: 100%; height: 100%; }
.gridLine { fill: none; stroke: rgb(255 255 255 / 7%); stroke-width: 1; }
.curve { fill: none; stroke: var(--react); stroke-linecap: round; stroke-width: 5; }

.graphLabel,
.handleControl > span {
  position: absolute;
  z-index: 3;
  color: rgb(247 243 232 / 58%);
  font-family: "Geist Mono Variable", monospace;
  font-size: 0.66rem;
}

.graphLabel { top: 14px; left: 16px; }

.problemTarget {
  position: absolute;
  z-index: 4;
  top: 10%;
  right: 1%;
  width: 96px;
  height: 96px;
  border: 1px dashed var(--react);
  border-radius: 50%;
  background: rgb(255 107 102 / 8%);
  cursor: pointer;
}

.handleControl {
  position: absolute;
  z-index: 6;
  right: 10%;
  bottom: 14%;
  left: 16%;
}

.handleControl > span { bottom: 40px; left: 0; }
.handleControl input { width: 100%; min-height: 44px; accent-color: var(--kairo); }
.handleControl input:disabled { opacity: 0.34; }

.kairoNote {
  position: absolute;
  z-index: 10;
  top: 52%;
  right: 4%;
  max-width: 280px;
  color: #ffffff;
  font-size: 0.92rem;
  line-height: 1.42;
}

.kairoNote p {
  padding: 14px 16px;
  border-left: 3px solid var(--kairo);
  background: rgb(20 21 24 / 92%);
}

.lesson[data-notice-phase='verified'] .curve { stroke: var(--verify); }
.lesson[data-notice-phase='verified'] .kairoNote p { border-color: var(--verify); }

.reset {
  position: absolute;
  z-index: 11;
  right: 18px;
  bottom: 18px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 16%);
  background: #1d1f24;
  color: #ffffff;
}

@media (max-width: 700px) {
  .lesson { min-height: 610px; }
  .preview { top: 9%; height: 31%; }
  .graph { right: 4%; bottom: 8%; left: 4%; height: 42%; }
  .kairoNote { top: 42%; right: 4%; left: 4%; max-width: none; }
  .problemTarget { width: 72px; height: 72px; }
}

@media (prefers-reduced-motion: reduce) {
  .lesson *,
  .lesson *::before,
  .lesson *::after { scroll-behavior: auto !important; }
}
```

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```bash
npm test -- tests/noticeLesson.test.ts tests/workspacePrototype.test.ts
npm run typecheck
git diff --check
```

Expected: focused tests PASS; typecheck PASS; diff check returns no output.

- [ ] **Step 6: Commit the interactive lesson**

```bash
git add src/landing/violet-thread/NoticeLesson.tsx src/landing/violet-thread/NoticeLesson.module.css tests/workspacePrototype.test.ts
git commit -m "feat: add violet thread notice lesson"
```

---

### Task 4: Pointer Drawing and Immediate Interruption

**Files:**
- Modify: `src/landing/violet-thread/NoticeLesson.tsx`
- Modify: `src/landing/violet-thread/NoticeLesson.module.css`
- Modify: `tests/workspacePrototype.test.ts`

**Interfaces:**
- Consumes: `StrokePoint`, `recognizeHeroTarget`, and `strokeToSvgPath` from `src/landing/heroInk.ts`; the curve uses the existing `'timeline'` target ID internally.
- Produces: optional pointer drawing with `data-notice-drawing`, accessible `Draw to point` toggle, and behavior equivalent to `Select the abrupt stop`.

- [ ] **Step 1: Add a failing drawing-mode component test**

Append to `tests/workspacePrototype.test.ts`:

```ts
test('keeps drawing optional and preserves the explicit target alternative', () => {
  render(createElement(NoticeLesson, { onVerified: vi.fn() }));
  const toggle = screen.getByRole('button', { name: 'Draw to point' });
  fireEvent.click(toggle);

  expect(document.querySelector('[data-notice-drawing="true"]')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Drawing on' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: 'Select the abrupt stop' })).toBeTruthy();
});
```

- [ ] **Step 2: Run the component test and verify failure**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts
```

Expected: FAIL because `NoticeLesson` does not yet expose drawing mode.

- [ ] **Step 3: Add bounded pointer drawing to `NoticeLesson`**

Add these imports and refs/state to `NoticeLesson.tsx`:

```tsx
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { StrokePoint } from '../heroInk';
import { recognizeHeroTarget, strokeToSvgPath } from '../heroInk';

const NOTICE_VIEWBOX_WIDTH = 760;
const NOTICE_VIEWBOX_HEIGHT = 760;
const NOTICE_TARGET = [{ id: 'timeline' as const, x: 618, y: 392, width: 96, height: 96 }];

const drawingSurfaceRef = useRef<HTMLDivElement>(null);
const drawingPathRef = useRef<SVGPathElement>(null);
const drawingPointsRef = useRef<StrokePoint[]>([]);
const drawingPointerRef = useRef<number | null>(null);
const [drawingEnabled, setDrawingEnabled] = useState(false);
```

Add a local coordinate helper and handlers:

```tsx
const pointForEvent = (event: ReactPointerEvent<HTMLDivElement>): StrokePoint => {
  const bounds = event.currentTarget.getBoundingClientRect();
  return [
    ((event.clientX - bounds.left) / (bounds.width || NOTICE_VIEWBOX_WIDTH)) * NOTICE_VIEWBOX_WIDTH,
    ((event.clientY - bounds.top) / (bounds.height || NOTICE_VIEWBOX_HEIGHT)) * NOTICE_VIEWBOX_HEIGHT,
    event.pressure || 0.5
  ];
};

const startDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
  if (!drawingEnabled || drawingPointerRef.current !== null) return;
  if ((event.target as Element).closest('button,input')) return;
  drawingPointerRef.current = event.pointerId;
  drawingPointsRef.current = [pointForEvent(event)];
  event.currentTarget.setPointerCapture?.(event.pointerId);
  event.preventDefault();
};

const continueDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
  if (drawingPointerRef.current !== event.pointerId) return;
  const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
  drawingPointsRef.current.push(
    ...coalesced.map((sample) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      return [
        ((sample.clientX - bounds.left) / (bounds.width || NOTICE_VIEWBOX_WIDTH)) * NOTICE_VIEWBOX_WIDTH,
        ((sample.clientY - bounds.top) / (bounds.height || NOTICE_VIEWBOX_HEIGHT)) * NOTICE_VIEWBOX_HEIGHT,
        sample.pressure || 0.5
      ] as StrokePoint;
    })
  );
  drawingPathRef.current?.setAttribute('d', strokeToSvgPath(drawingPointsRef.current));
  event.preventDefault();
};

const finishDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
  if (drawingPointerRef.current !== event.pointerId) return;
  const recognized = recognizeHeroTarget(drawingPointsRef.current, NOTICE_TARGET);
  drawingPointerRef.current = null;
  event.currentTarget.releasePointerCapture?.(event.pointerId);
  if (recognized === 'timeline') dispatch({ type: 'TARGET_SELECTED' });
};

const cancelDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
  if (drawingPointerRef.current !== event.pointerId) return;
  drawingPointerRef.current = null;
  drawingPointsRef.current = [];
  drawingPathRef.current?.setAttribute('d', '');
};
```

Attach the handlers and add the drawing layer as the first and last children of the lesson root respectively:

```tsx
<div
  ref={drawingSurfaceRef}
  className={styles.lesson}
  data-notice-phase={state.phase}
  data-notice-drawing={drawingEnabled}
  onPointerDown={startDrawing}
  onPointerMove={continueDrawing}
  onPointerUp={finishDrawing}
  onPointerCancel={cancelDrawing}
>
  {/* existing workspace children */}
  <svg className={styles.drawingLayer} viewBox="0 0 760 760" aria-hidden="true">
    <path ref={drawingPathRef} />
  </svg>
  <button
    type="button"
    className={styles.drawToggle}
    aria-pressed={drawingEnabled}
    onClick={() => setDrawingEnabled((enabled) => !enabled)}
  >
    {drawingEnabled ? 'Drawing on' : 'Draw to point'}
  </button>
</div>
```

Add the following CSS:

```css
.drawingLayer {
  position: absolute;
  z-index: 9;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.drawingLayer path { fill: var(--kairo); }
.lesson[data-notice-drawing='true'] { touch-action: none; cursor: crosshair; }

.drawToggle {
  position: absolute;
  z-index: 12;
  bottom: 18px;
  left: 18px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 16%);
  background: var(--kairo);
  color: #ffffff;
}

@media (max-width: 700px) {
  .lesson:not([data-notice-drawing='true']) { touch-action: pan-y; }
}
```

- [ ] **Step 4: Run drawing geometry and component tests**

Run:

```bash
npm test -- tests/heroInk.test.ts tests/workspacePrototype.test.ts
npm run typecheck
```

Expected: drawing geometry and component tests PASS; typecheck PASS.

- [ ] **Step 5: Commit pointer drawing**

```bash
git add src/landing/violet-thread/NoticeLesson.tsx src/landing/violet-thread/NoticeLesson.module.css tests/workspacePrototype.test.ts
git commit -m "feat: let learners point at the curve"
```

---

### Task 5: Context Handoff and Page Integration

**Files:**
- Create: `src/landing/violet-thread/ContextLayers.tsx`
- Create: `src/landing/violet-thread/ContextLayers.module.css`
- Create: `src/landing/violet-thread/WorkspacePrototype.tsx`
- Create: `src/landing/violet-thread/WorkspacePrototype.module.css`
- Modify: `src/landing/Hero.tsx`
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/workspacePrototype.test.ts`
- Modify: `tests/landingPage.test.ts`
- Modify: `tests/landingSsr.test.ts`

**Interfaces:**
- Consumes: `NoticeLesson({ onVerified, traveling? })` and `VioletThread({ state })`.
- Produces: `WorkspacePrototype`, semantic sections `#top` and `#understand`, `data-context-activated`, and navigation labels `The lesson`, `How Kairo sees`, and `Creative tools`.

- [ ] **Step 1: Add failing integration and SSR assertions**

Add to `tests/workspacePrototype.test.ts`:

```ts
import { WorkspacePrototype } from '../src/landing/violet-thread/WorkspacePrototype';

test('hands the verified lesson into the four visible context layers', () => {
  vi.useFakeTimers();
  render(createElement(WorkspacePrototype));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Stuck? Point at it.');
  expect(screen.getByRole('heading', { name: 'You don’t have to explain the whole screen.' })).toBeTruthy();
  for (const label of ['What you said', 'What is visible', 'What you pointed at', 'What Kairo understood']) {
    expect(screen.getByText(label)).toBeTruthy();
  }

  fireEvent.click(screen.getByRole('button', { name: 'Select the abrupt stop' }));
  act(() => vi.advanceTimersByTime(160));
  const handle = screen.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
  fireEvent.change(handle, { target: { value: '72' } });
  fireEvent.pointerUp(handle);
  act(() => vi.runAllTimers());
  expect(document.querySelector('[data-context-activated="true"]')).toBeTruthy();
  vi.useRealTimers();
});
```

Change the expected headline and chapter markers in `tests/landingPage.test.ts` to:

```ts
const markers = ['id="top"', 'id="understand"', 'id="product-moments"', 'id="capabilities"', 'id="tools"', 'id="control"', 'id="access"', '<footer'];
expect(html).toContain('Stuck? Point at it.');
expect(html).toContain('You don’t have to explain the whole screen.');
expect(links.map((link) => link.textContent)).toEqual(['The lesson', 'How Kairo sees', 'Creative tools']);
```

Change `tests/landingSsr.test.ts` to retain the one-`h1` assertion and require:

```ts
expect(html).toContain('Stuck? Point at it.');
expect(html).toContain('Kairo sees what you see');
expect(html).toContain('What Kairo understood');
expect(html).toContain('We’ll use your email only to contact you about Kairo early access.');
```

- [ ] **Step 2: Run focused tests and verify missing-component failures**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts tests/landingPage.test.ts tests/landingSsr.test.ts
```

Expected: FAIL because `WorkspacePrototype` and `ContextLayers` do not exist and old copy remains.

- [ ] **Step 3: Implement the context composition**

Create `src/landing/violet-thread/ContextLayers.tsx`:

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SCENE_SPRING } from '../motion';
import { VioletThread } from './VioletThread';
import styles from './ContextLayers.module.css';

const layers = [
  ['What you said', '“Why does the ending feel so abrupt?”'],
  ['What is visible', 'Title study · speed graph · final keyframe'],
  ['What you pointed at', 'Outgoing curve · last 12 frames'],
  ['What Kairo understood', 'The speed drops too quickly at the stop.']
] as const;

export function ContextLayers({ activated }: { activated: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <section id="understand" className={styles.context} aria-labelledby="understand-title" data-context-activated={activated}>
      <div className={styles.copy}>
        <p>Shared context</p>
        <h2 id="understand-title">You don’t have to explain the whole screen.</h2>
        <span>Kairo sees what you see, understands where you’re pointing, and keeps the explanation attached to the work.</span>
      </div>
      <div className={styles.layers}>
        {layers.map(([label, value], index) => (
          <motion.div
            key={label}
            className={styles.layer}
            initial={false}
            animate={activated
              ? { opacity: 1, transform: 'translateY(0px)' }
              : { opacity: 0.7, transform: reducedMotion ? 'translateY(0px)' : 'translateY(18px)' }}
            transition={reducedMotion ? { duration: 0 } : { ...SCENE_SPRING, delay: activated ? index * 0.055 : 0 }}
          >
            <span>{label}</span><p>{value}</p>
          </motion.div>
        ))}
        <VioletThread state={activated ? 'travel' : 'guide'} label="Kairo connects the learner’s shared context" />
      </div>
    </section>
  );
}
```

Create `src/landing/violet-thread/ContextLayers.module.css`:

```css
.context {
  display: grid;
  min-height: 100svh;
  padding: clamp(88px, 10vw, 150px) clamp(20px, 6vw, 92px);
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
  align-items: center;
  gap: clamp(48px, 8vw, 128px);
  background: #eee8dc;
}

.copy > p,
.layer span {
  color: var(--kairo);
  font-family: "Geist Mono Variable", monospace;
  font-size: 0.7rem;
  font-weight: 680;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.copy h2 {
  max-width: 9ch;
  margin: 18px 0 24px;
  font-family: "Bricolage Grotesque Variable", sans-serif;
  font-size: clamp(3.2rem, 6.5vw, 7.6rem);
  line-height: 0.86;
  letter-spacing: -0.065em;
}

.copy > span { display: block; max-width: 34rem; color: var(--ink-muted); line-height: 1.55; }
.layers { position: relative; min-height: 620px; }

.layer {
  position: absolute;
  width: min(330px, 54%);
  padding: 18px 20px;
  border-left: 2px solid var(--kairo);
  background: rgb(255 255 255 / 64%);
}

.layer p { margin-top: 8px; line-height: 1.4; }
.layer:nth-child(1) { top: 5%; left: 2%; }
.layer:nth-child(2) { top: 27%; right: 0; }
.layer:nth-child(3) { top: 51%; left: 7%; }
.layer:nth-child(4) { right: 6%; bottom: 4%; border-color: var(--verify); }

@media (max-width: 800px) {
  .context { min-height: auto; grid-template-columns: 1fr; }
  .layers { display: grid; min-height: auto; gap: 14px; }
  .layer { position: relative; inset: auto !important; width: 100%; }
}
```

- [ ] **Step 4: Implement the prototype coordinator and integrate it**

Create `src/landing/violet-thread/WorkspacePrototype.tsx`:

```tsx
'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ContextLayers } from './ContextLayers';
import { NoticeLesson } from './NoticeLesson';
import styles from './WorkspacePrototype.module.css';

export function WorkspacePrototype() {
  const reducedMotion = useReducedMotion();
  const [journey, setJourney] = useState<'notice' | 'verified' | 'traveling' | 'understand'>('notice');
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (!pageVisible || (journey !== 'verified' && journey !== 'traveling')) return undefined;
    if (reducedMotion) {
      setJourney('understand');
      return undefined;
    }
    const timer = window.setTimeout(
      () => setJourney(journey === 'verified' ? 'traveling' : 'understand'),
      journey === 'verified' ? 420 : 560
    );
    return () => window.clearTimeout(timer);
  }, [journey, pageVisible, reducedMotion]);

  return (
    <>
      <section id="top" className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.copy}>
          <p>Kairo · your creative learning layer</p>
          <h1 id="landing-title">Stuck? Point at it.</h1>
          <span>Kairo sees what you see, understands where you’re pointing, and guides the next move—right on your screen.</span>
          <a href="#access">Request alpha access</a>
        </div>
        <NoticeLesson
          traveling={journey === 'traveling' || journey === 'understand'}
          onVerified={() => setJourney('verified')}
        />
      </section>
      <ContextLayers activated={journey === 'understand'} />
    </>
  );
}
```

Create `src/landing/violet-thread/WorkspacePrototype.module.css`:

```css
.hero {
  display: grid;
  min-height: calc(100svh - 76px);
  padding: clamp(52px, 7vw, 104px) clamp(20px, 5vw, 80px) clamp(72px, 8vw, 112px);
  grid-template-columns: minmax(270px, 0.72fr) minmax(540px, 1.28fr);
  align-items: center;
  gap: clamp(36px, 6vw, 96px);
  overflow: clip;
  background: #eee8dc;
}

.copy > p { color: var(--kairo); font-family: "Geist Mono Variable", monospace; font-size: 0.72rem; font-weight: 680; text-transform: uppercase; }
.copy h1 { max-width: 7ch; margin: 20px 0 26px; font-family: "Bricolage Grotesque Variable", sans-serif; font-size: clamp(4rem, 8vw, 9rem); line-height: 0.82; letter-spacing: -0.075em; }
.copy > span { display: block; max-width: 32rem; color: var(--ink-muted); font-size: clamp(1rem, 1.45vw, 1.24rem); line-height: 1.5; }
.copy > a { display: inline-flex; min-height: 48px; margin-top: 30px; padding: 0 18px; align-items: center; border-left: 3px solid var(--kairo); background: #141518; color: #ffffff; font-weight: 680; text-decoration: none; }

@media (max-width: 980px) {
  .hero { grid-template-columns: 1fr; }
  .copy h1 { max-width: 9ch; }
}
```

Replace `src/landing/Hero.tsx` with:

```tsx
import { WorkspacePrototype } from './violet-thread/WorkspacePrototype';

export function Hero() {
  return <WorkspacePrototype />;
}
```

In `src/landing/LandingPage.tsx`, replace the three header links with:

```tsx
<a href="#top">The lesson</a>
<a href="#understand">How Kairo sees</a>
<a href="#tools">Creative tools</a>
```

In `src/landing/LandingPage.module.css`, change the header background to `rgb(238 232 220 / 90%)`; keep its existing blur, sizing, focus, CTA, desktop, and mobile behavior.

- [ ] **Step 5: Run focused structural tests and the whole unit suite**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts tests/landingPage.test.ts tests/landingSsr.test.ts
npm test
npm run typecheck
git diff --check
```

Expected: focused tests PASS; all current test files PASS; typecheck PASS; diff check returns no output.

- [ ] **Step 6: Commit the prototype integration**

```bash
git add src/landing/Hero.tsx src/landing/LandingPage.tsx src/landing/LandingPage.module.css src/landing/violet-thread tests/workspacePrototype.test.ts tests/landingPage.test.ts tests/landingSsr.test.ts
git commit -m "feat: integrate violet thread prototype"
```

---

### Task 6: Browser Parity, Reduced Motion, and Regression Verification

**Files:**
- Modify: `tests/e2e/hero-interaction.spec.ts`
- Modify: `tests/e2e/landing.spec.ts`

**Interfaces:**
- Consumes: stable accessible names and `data-*` hooks from Tasks 2–5.
- Produces: verified pointer, touch, keyboard, reduced-motion, SSR, waitlist, build, and responsive behavior.

- [ ] **Step 1: Replace old hero E2E expectations with the approved lesson paths**

Replace `tests/e2e/hero-interaction.spec.ts` with these three input-parity tests:

```ts
import { expect, test } from '@playwright/test';

test('recognizes a pointer loop around the abrupt curve', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Draw to point' }).click();
  const target = page.getByRole('button', { name: 'Select the abrupt stop' });
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const points = [
    [box.x - 10, box.y + box.height / 2],
    [box.x, box.y - 10],
    [box.x + box.width / 2, box.y - 14],
    [box.x + box.width + 10, box.y],
    [box.x + box.width + 14, box.y + box.height / 2],
    [box.x + box.width + 8, box.y + box.height + 10],
    [box.x + box.width / 2, box.y + box.height + 14],
    [box.x - 8, box.y + box.height + 10],
    [box.x - 10, box.y + box.height / 2]
  ];

  await page.mouse.move(points[0]?.[0] ?? 0, points[0]?.[1] ?? 0);
  await page.mouse.down();
  for (const [x, y] of points.slice(1)) await page.mouse.move(x, y, { steps: 3 });
  await page.mouse.up();
  await expect(page.getByText('Give the stop more room. Pull this handle left.')).toBeVisible();
});

test('completes the lesson with keyboard input', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Select the abrupt stop' }).focus();
  await page.keyboard.press('Enter');
  const handle = page.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
  await expect(handle).toBeEnabled();
  await handle.focus();
  await page.keyboard.press('End');
  for (let index = 0; index < 22; index += 1) await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Result verified');
  await expect(page.locator('[data-context-activated="true"]')).toHaveCount(1);
});

test.describe('touch lesson', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('uses the large range control and preserves page scrolling', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Select the abrupt stop' }).tap();
    const handle = page.getByRole('slider', { name: 'Adjust the outgoing easing handle' });
    await expect(handle).toBeEnabled();
    await handle.fill('72');
    await handle.dispatchEvent('pointerup');
    await expect(page.getByRole('status')).toContainText('Result verified');
    await page.locator('#understand').scrollIntoViewIfNeeded();
    await expect(page.locator('#understand')).toBeInViewport();
  });
});
```

Update `tests/e2e/landing.spec.ts`:

```ts
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
for (const id of ['understand', 'product-moments', 'capabilities', 'tools', 'control', 'access']) {
  await expect(page.locator(`#${id}`)).toBeVisible();
}
```

Replace the old reduced-motion hero assertion with:

```ts
await expect(page.locator('[data-notice-phase]')).toHaveAttribute('data-notice-phase', 'verified');
await expect(page.getByRole('status')).toContainText('Result verified');
await expect(page.locator('[data-context-activated="true"]')).toHaveCount(1);
await expect(page.getByRole('heading', { name: 'You don’t have to explain the whole screen.' })).toBeVisible();
```

Keep the existing waitlist interception and exact-once normalized submission test unchanged.

Add this static-fallback test to `tests/e2e/landing.spec.ts`:

```ts
test('explains Notice and Understand before interaction code loads', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stuck? Point at it.');
  await expect(page.getByRole('heading', { name: 'You don’t have to explain the whole screen.' })).toBeVisible();
  await expect(page.getByText('What Kairo understood')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Request alpha access' }).first()).toBeVisible();
  await context.close();
});
```

- [ ] **Step 2: Build and run the focused browser suite**

Run:

```bash
npm run build
npx playwright test tests/e2e/hero-interaction.spec.ts tests/e2e/landing.spec.ts
```

Expected: all focused browser tests PASS. If any test fails, stop this task and invoke `superpowers:systematic-debugging`; amend this plan with the proven source correction before editing production code.

- [ ] **Step 3: Run the complete verification matrix**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
git status --short
```

Expected:

- all Vitest files PASS;
- typecheck PASS;
- production build PASS;
- all Playwright tests PASS;
- diff check returns no output;
- status lists only intended prototype and test changes.

- [ ] **Step 4: Run the animation craft review**

Use the project `review-animations` skill against the prototype files. Resolve every blocking finding involving unjustified motion, keyboard motion, easing, duration, physical origin, interruptibility, non-GPU animation, hover gating, or reduced motion. Rerun the complete verification matrix after any correction.

- [ ] **Step 5: Commit verified browser parity**

```bash
git add tests/e2e/hero-interaction.spec.ts tests/e2e/landing.spec.ts src/landing/violet-thread
git commit -m "test: verify violet thread prototype"
```

---

### Task 7: Live Visual Quality Gate

**Files:**
- No tracked files unless the visual review reveals a concrete defect.
- Temporary captures: `/tmp/kairo-violet-thread-desktop.png`, `/tmp/kairo-violet-thread-mobile.png`, `/tmp/kairo-violet-thread-reduced.png`.

**Interfaces:**
- Consumes: the verified production build from Task 6.
- Produces: explicit user approval or rejection of the opening creative mechanism.

- [ ] **Step 1: Start a production preview without sharing `.next` with a running dev server**

Stop only the prototype worktree's existing port-3001 process after resolving its exact PID. Then run:

```bash
npm run build
npm run start -- --hostname 0.0.0.0 --port 3001
```

Expected: Next production server reports ready on port 3001.

- [ ] **Step 2: Start or refresh the ngrok tunnel**

```bash
ngrok http 3001 --log stdout
```

Resolve the current public URL through `http://127.0.0.1:4040/api/tunnels`. Verify the public page returns HTTP 200 and contains `Stuck? Point at it.`.

- [ ] **Step 3: Capture review images without creating baselines**

Use Playwright to capture:

- 1440×1000 desktop after fonts load;
- 390×844 phone before interaction and after verification;
- 1440×1000 with `prefers-reduced-motion: reduce`.

Write captures only to the three `/tmp` paths above. Do not add `toHaveScreenshot` assertions yet.

- [ ] **Step 4: Review physical behavior**

Verify on the live URL:

- the initial abrupt stop is legible;
- the Thread notices the exact curve once;
- tap and circle select the same target;
- the handle feels direct and does not lag behind input;
- Kairo remains visibly still while waiting;
- verification occurs only after release in the accepted range;
- the lime completion becomes a convincing handoff into Understand;
- phone scrolling remains normal;
- no part resembles a generic SaaS hero with a demo card.

- [ ] **Step 5: Ask for explicit visual approval**

Provide the live URL and state clearly that this gate evaluates Chapter 1 and the Chapter 2 transition only.

If rejected, revise the mechanism within Tasks 2–6 and repeat this gate. If approved, write a separate plan for Chapters 2–5; do not extend the current plan ad hoc.
