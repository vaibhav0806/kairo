# Kairo Violet Thread Full Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the visually approved Violet Thread prototype through Understand, Learn, Travel, and Begin so the entire homepage is one coherent, interactive Kairo lesson.

**Architecture:** Keep the approved Notice → Understand opening intact and use chapter-local state plus chapter-local Thread geometry for the remaining sections. Avoid a page-height SVG, scroll-scrubbed animation, or a global state machine that can overwrite a learner interaction. Existing generic lower-page components remain recoverable in git but are removed from `LandingPage`; the waitlist network contract remains inside `WaitlistForm`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Motion, SVG, Vitest/Testing Library, Playwright.

## Global Constraints

- Kairo is a tutor and learning tool, not a task-performing agent.
- The five primary statements are exactly: `Stuck? Point at it.`, `You don’t have to explain the whole screen.`, `Guidance that waits for you.`, `Different tools. The same way of getting unstuck.`, and `What have you been meaning to learn?`.
- The four Travel contexts are After Effects / abrupt easing handle, DaVinci Resolve / disconnected color node, Blender / incorrect transform axis, and Figma / broken auto-layout spacing.
- Bone is the reading canvas; graphite is software chrome; violet is guidance; warm lime is verification; coral is unresolved state.
- User input immediately interrupts authored motion. Verification is caused only by learner action.
- Direct feedback stays below 300 ms. Explanatory scene travel may use 300–500 ms only to preserve spatial continuity.
- Mobile never requires hover, precise drawing, or small-handle dragging. Touch targets are at least 44×44 px.
- Reduced motion renders a complete static storyboard with instant state changes.
- Chapter headings and product truths remain present in server-rendered HTML and without JavaScript.
- Preserve waitlist normalization, request payload, error recovery, duplicate-submit guard, focus management, and retry behavior.
- Do not add WebGL, shader, 3D, or new runtime dependencies.
- Do not merge, deploy, or replace the public homepage without explicit authorization.

---

### Task 1: Shared Thread Profiles and the Complete Understand Chapter

**Files:**
- Create: `src/landing/violet-thread/threadTypes.ts`
- Modify: `src/landing/violet-thread/VioletThread.tsx`
- Modify: `src/landing/violet-thread/VioletThread.module.css`
- Modify: `src/landing/violet-thread/noticeLessonModel.ts`
- Modify: `src/landing/violet-thread/ContextLayers.tsx`
- Modify: `src/landing/violet-thread/ContextLayers.module.css`
- Modify: `tests/workspacePrototype.test.ts`
- Create: `tests/contextLayers.test.ts`

**Interfaces:**
- Produces `VioletThreadState`, `ThreadProfile`, and a profile-aware `VioletThread` used by every later chapter.
- Preserves the existing `NoticeLesson` and `WorkspacePrototype` public props.

- [ ] **Step 1: Write the failing profile and Context tests**

Add assertions equivalent to:

```ts
render(createElement(VioletThread, { state: 'guide', profile: 'lesson' }));
expect(document.querySelector('[data-thread-profile="lesson"]')).toBeTruthy();

render(createElement(ContextLayers, { active: true }));
for (const label of [
  'What you said',
  'What is visible',
  'What you pointed at',
  'What Kairo understood'
]) expect(screen.getByText(label)).toBeTruthy();
expect(document.querySelector('[data-thread-profile="context"]')).toBeTruthy();
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- tests/workspacePrototype.test.ts tests/contextLayers.test.ts`

Expected: FAIL because `profile` and `data-thread-profile` do not exist and Context still uses the decorative divider.

- [ ] **Step 3: Extract neutral Thread types**

Create:

```ts
export type VioletThreadState =
  | 'dormant'
  | 'notice'
  | 'attach'
  | 'guide'
  | 'wait'
  | 'verify'
  | 'travel';

export type ThreadProfile =
  | 'notice'
  | 'context'
  | 'lesson'
  | 'tool-travel'
  | 'invitation';
```

Remove the duplicate `VioletThreadState` declaration from `noticeLessonModel.ts` and import it from `threadTypes.ts`.

- [ ] **Step 4: Make `VioletThread` profile-aware**

Change the props to:

```ts
type VioletThreadProps = Readonly<{
  state: VioletThreadState;
  profile?: ThreadProfile;
  className?: string;
  label?: string;
}>;
```

Default `profile` to `notice`. Store compatible SVG path sets for `notice`, `context`, `lesson`, `tool-travel`, and `invitation`; each profile uses the same viewBox and command topology within that profile. Render `data-thread-profile={profile}`. Keep reduced-motion duration at zero and keep `verify`/`travel` lime.

- [ ] **Step 5: Replace Context’s decorative divider with semantic Thread geometry**

Render:

```tsx
<VioletThread
  state={active ? 'guide' : 'wait'}
  profile="context"
  className={styles.contextThread}
  label="Kairo connects the shared context"
/>
```

Remove `.layers::before`. Keep the approved 60 ms settling stagger, but the Thread must pass behind and visually touch all four artifacts. All four artifacts remain fully readable while inactive and with reduced motion.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/workspacePrototype.test.ts tests/contextLayers.test.ts tests/noticeLesson.test.ts
npm run typecheck
git diff --check
```

Commit:

```bash
git add src/landing/violet-thread tests/workspacePrototype.test.ts tests/contextLayers.test.ts
git commit -m "feat: connect the understand chapter"
```

---

### Task 2: Guided Lesson That Waits for Learner Action

**Files:**
- Create: `src/landing/violet-thread/guidedLessonModel.ts`
- Create: `src/landing/violet-thread/GuidedLesson.tsx`
- Create: `src/landing/violet-thread/GuidedLesson.module.css`
- Create: `tests/guidedLessonModel.test.ts`
- Create: `tests/guidedLesson.test.ts`

**Interfaces:**
- Consumes `VioletThread` with `profile="lesson"`.
- Produces `<GuidedLesson />`, a self-contained `section#learn`.

- [ ] **Step 1: Write failing reducer tests**

Test this contract:

```ts
expect(GUIDED_INITIAL_STATE).toEqual({ phase: 'guide', maskEdge: 38 });
expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_CHANGED', value: 68 }))
  .toEqual({ phase: 'waiting', maskEdge: 68 });
expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_COMMITTED', value: 68 }).phase)
  .toBe('verified');
expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'MASK_COMMITTED', value: 52 }).phase)
  .toBe('waiting');
expect(guidedLessonReducer(GUIDED_INITIAL_STATE, { type: 'SHOW_STATIC_STORYBOARD' }))
  .toEqual({ phase: 'verified', maskEdge: 68 });
```

Use inclusive verification bounds `64..72`, input bounds `0..100`, and cancellation that returns the unchanged waiting state.

- [ ] **Step 2: Run reducer tests and verify RED**

Run: `npm test -- tests/guidedLessonModel.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure model**

Export:

```ts
export type GuidedPhase = 'guide' | 'waiting' | 'verified';
export type GuidedLessonState = Readonly<{ phase: GuidedPhase; maskEdge: number }>;
export const GUIDED_MASK_MIN = 0;
export const GUIDED_MASK_MAX = 100;
export const GUIDED_TARGET_MIN = 64;
export const GUIDED_TARGET_MAX = 72;
export const GUIDED_INITIAL_STATE = { phase: 'guide', maskEdge: 38 } as const;
export function guidedLessonReducer(
  state: GuidedLessonState,
  event: GuidedLessonEvent
): GuidedLessonState;
```

No timer event may return `verified`.

- [ ] **Step 4: Write failing component tests**

Cover:

```ts
render(createElement(GuidedLesson));
expect(screen.getByRole('heading', { name: 'Guidance that waits for you.' })).toBeTruthy();
expect(screen.getByText('Move the mask edge to the final guide.')).toBeTruthy();

const control = screen.getByRole('slider', { name: 'Move the mask edge' });
fireEvent.change(control, { target: { value: '52' } });
fireEvent.pointerUp(control);
expect(document.querySelector('[data-guided-phase="waiting"]')).toBeTruthy();
expect(screen.queryByRole('status')).toBeNull();

fireEvent.change(control, { target: { value: '68' } });
fireEvent.pointerUp(control);
expect(screen.getByRole('status').textContent).toContain('Kairo verified');
expect(screen.getByRole('link', { name: 'Continue to creative tools' })).toBeTruthy();
```

Add keyboard completion and reduced-motion verified-storyboard cases.

- [ ] **Step 5: Build the Chapter 3 composition**

Render a bone editorial heading beside one graphite workspace, not a card grid. The workspace contains:

- a poster preview with a visible vertical final guide;
- a mask edge whose transform responds immediately to `maskEdge`;
- an accessible range input labelled `Move the mask edge`;
- a three-position rail labelled `Guide`, `Your turn`, `Verified`;
- the exact guidance `Move the mask edge to the final guide.`;
- the waiting copy `Kairo is waiting for your move.`;
- verified status `Kairo verified the mask edge.`;
- a `Continue to creative tools` link to `#travel`, visible only after verification except in the static reduced-motion storyboard.

Map Thread states `guide → wait → verify`. Direct range updates use no tween; pointer release and arrow-key release commit. Use at least a 44 px touch track and visible focus.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/guidedLessonModel.test.ts tests/guidedLesson.test.ts
npm run typecheck
git diff --check
```

Commit: `git commit -m "feat: add the guided learning chapter"`

---

### Task 3: One Morphing Workspace Across Four Creative Tools

**Files:**
- Create: `src/landing/violet-thread/toolTravelModel.ts`
- Create: `src/landing/violet-thread/ToolTravel.tsx`
- Create: `src/landing/violet-thread/ToolTravel.module.css`
- Create: `tests/toolTravelModel.test.ts`
- Create: `tests/toolTravel.test.ts`

**Interfaces:**
- Consumes `VioletThread` with `profile="tool-travel"`.
- Produces `<ToolTravel />`, a self-contained `section#travel` with accessible tabs.

- [ ] **Step 1: Write failing model tests**

Define and test:

```ts
export type ToolId = 'after-effects' | 'davinci' | 'blender' | 'figma';
export type ToolTravelState = Readonly<{
  activeTool: ToolId;
  manuallyInterrupted: boolean;
}>;

expect(selectTool(TOOL_TRAVEL_INITIAL_STATE, 'blender')).toEqual({
  activeTool: 'blender',
  manuallyInterrupted: true
});
expect(toolIndexAfter('after-effects', -1)).toBe(3);
expect(toolIndexAfter('figma', 1)).toBe(0);
```

Keep the data in one exported `TOOL_PROBLEMS` tuple containing the exact tool and problem labels from Global Constraints. Do not add an authored auto-advance timer; it is optional in the spec and direct selection is clearer and safer.

- [ ] **Step 2: Run model tests and verify RED**

Run: `npm test -- tests/toolTravelModel.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the model and truthful tool data**

Each entry includes `id`, `name`, `shortName`, `problem`, `question`, and `guidance`. Required problem values:

```ts
'abrupt easing handle'
'disconnected color node'
'incorrect transform axis'
'broken auto-layout spacing'
```

Guidance must describe what the learner should inspect or change, never claim Kairo changed it.

- [ ] **Step 4: Write failing component tests**

Cover all tools, exact problem labels, `role="tablist"`, roving focus, ArrowLeft/ArrowRight/Home/End, `aria-selected`, `data-tool`, pointer-versus-keyboard instant selection, and absence of `integration`, `partner`, `take over`, or `done for you` claims.

- [ ] **Step 5: Build the continuous Travel workspace**

Render the primary statement `Different tools. The same way of getting unstuck.` and one persistent graphite workspace shell. Direct tabs sit on a ruler-like tool rail, not in cards. Inside the same shell render:

- After Effects: speed graph, keyframe, outgoing handle, coral abrupt stop;
- DaVinci Resolve: node graph with one visibly disconnected edge before Output;
- Blender: object viewport with XYZ gizmo and the incorrect X axis selected while Z is required;
- Figma: auto-layout frame with collapsed gap and a visible spacing control.

Keep scene dimensions stable. Pointer/touch selection may use a 300–400 ms transform/opacity spatial transition; keyboard selection is instant. The Thread detaches and reattaches to the relevant local target. Reduced motion renders the selected scene instantly. Tool tabs are at least 44 px high on mobile and the workspace scrolls vertically with the page.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/toolTravelModel.test.ts tests/toolTravel.test.ts
npm run typecheck
git diff --check
```

Commit: `git commit -m "feat: add the creative tool travel chapter"`

---

### Task 4: Turn the Waitlist Into the Begin Chapter

**Files:**
- Modify: `src/landing/AlphaInvitation.tsx`
- Modify: `src/landing/AlphaInvitation.module.css`
- Modify: `src/landing/WaitlistForm.tsx`
- Modify: `src/landing/WaitlistForm.module.css`
- Create: `tests/alphaInvitation.test.ts`
- Modify: `tests/landingWaitlist.test.ts`

**Interfaces:**
- Adds optional `onSubmitted?: (normalizedEmail: string) => void` to `WaitlistForm`.
- `AlphaInvitation` owns only Thread presentation state; `WaitlistForm` continues to own all network and validation state.

- [ ] **Step 1: Write failing Begin tests**

Assert the exact heading `What have you been meaning to learn?` and all four notes:

```ts
'finally understand nodes'
'learn motion curves properly'
'stop guessing in Blender'
'get comfortable in Figma'
```

Mock a successful request and assert focus lands on a single status containing `You’re on the list. Go make something.` and the invitation Thread becomes verified.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/alphaInvitation.test.ts tests/landingWaitlist.test.ts`

Expected: FAIL on the new heading, notes, callback, and success phrase.

- [ ] **Step 3: Add the presentation-only success callback**

Change the signature to:

```ts
type WaitlistFormProps = Readonly<{
  onSubmitted?: (normalizedEmail: string) => void;
}>;

export function WaitlistForm({ onSubmitted }: WaitlistFormProps = {}) {
```

After a response passes the existing strict `{ ok: true }` check, call `onSubmitted?.(normalizedEmail)` immediately before `setSubmitted(normalizedEmail)`. Do not change the request, error, pending, focus, or retry logic. Add `aria-busy={pending}` to the form or submit control without changing behavior.

- [ ] **Step 4: Build the Begin composition**

Make `AlphaInvitation` a client component with local `submitted` presentation state. Render `VioletThread` with `profile="invitation"` and `state={submitted ? 'verify' : 'travel'}`. Place the four learner notes as meaningful pinned artifacts around one form surface. Keep all labels, validation messages, privacy note, and focus behavior visible and accessible.

Change the success status copy to:

```tsx
<p>You’re on the list. Go make something.</p>
```

- [ ] **Step 5: Verify the unchanged network contract and commit**

Run:

```bash
npm test -- tests/alphaInvitation.test.ts tests/landingWaitlist.test.ts tests/waitlistApi.test.ts
npm run typecheck
git diff --check
```

Commit: `git commit -m "feat: complete the violet thread invitation"`

---

### Task 5: Replace the Generic Lower Page and Verify the Whole Journey

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/landingPage.test.ts`
- Modify: `tests/landingSsr.test.ts`
- Modify: `tests/e2e/landing.spec.ts`
- Modify: `tests/e2e/hero-interaction.spec.ts`
- Create: `tests/e2e/violet-journey.spec.ts`
- Later, after final visual approval only: `docs/KAIRO_DESIGN_GUIDELINES.md`

**Interfaces:**
- Consumes `Hero` (Notice + Understand), `GuidedLesson`, `ToolTravel`, and `AlphaInvitation`.
- Removes `ProductMoments`, `CapabilityStage`, `ToolPlayground`, and `ControlMoment` from the rendered page without deleting their recoverable source files.

- [ ] **Step 1: Write failing full-page content/order tests**

Require IDs in this order:

```ts
['id="top"', 'id="understand"', 'id="learn"', 'id="travel"', 'id="access"', '<footer']
```

Require one `h1`, all five primary statements, all four tools, the four context layers, the guided wait/verify truth, and the four learner notes in server HTML. Require navigation links `How Kairo sees`, `Guided lesson`, and `Creative tools` pointing to `#understand`, `#learn`, and `#travel`.

- [ ] **Step 2: Run page tests and verify RED**

Run: `npm test -- tests/landingPage.test.ts tests/landingSsr.test.ts`

Expected: FAIL because old generic sections remain and new chapters are not assembled.

- [ ] **Step 3: Assemble only the five-chapter page**

`LandingPage` main becomes:

```tsx
<main>
  <Hero />
  <GuidedLesson />
  <ToolTravel />
  <AlphaInvitation />
</main>
```

Update navigation to the three required chapter links. Preserve the sticky compact header, alpha CTA, footer, page focus styles, and 320 px minimum width. Do not delete unused lower-section source files in this task.

- [ ] **Step 4: Extend browser coverage**

Add browser cases that:

- complete Notice, then complete Guided Lesson only through a learner range release;
- select each Travel tool with pointer and keyboard;
- verify direct keyboard selection is instant and remains selected;
- submit the waitlist through the unchanged mocked endpoint and see the expanded success phrase;
- navigate to `#understand`, `#learn`, `#travel`, and `#access` without scroll trapping;
- prove no horizontal overflow at 320×568, 390×844, 768×1024, and 1440×1000;
- prove reduced motion shows Notice verified, Guided Lesson verified, all tool controls, and Begin immediately;
- prove no-JavaScript HTML contains all five statements and all four tools;
- collect and assert zero page/console errors.

- [ ] **Step 5: Run the complete regression gate**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 6: Run motion and visual review**

Use the repository `review-animations` skill. Review normal speed, slowed playback, reduced motion, pointer interruption, keyboard instant transitions, touch controls, and document visibility. Capture desktop 1440×1000, tablet 768×1024, mobile 390×844, and reduced-motion screenshots. Fix all blocking findings.

- [ ] **Step 7: Commit and publish the live preview**

Commit: `git commit -m "feat: complete the violet thread homepage"`

Build and restart only the isolated worktree’s production server on port 3001. Keep the existing ngrok tunnel if healthy, verify the full journey through its public URL, and leave both processes running.

- [ ] **Step 8: Stop at the final visual gate**

Provide the live URL and request explicit full-page visual approval. Do not create visual baselines, `docs/KAIRO_DESIGN_GUIDELINES.md`, merge, deploy, or replace the public homepage until that approval is given.

---

## Self-Review

- Spec coverage: Tasks 1–5 cover shared context, guide/wait/action/verify, four exact tool problems, Begin/waitlist, semantic SSR, mobile, keyboard, reduced motion, no-JS, and final visual approval.
- Deliberate omission: the optional authored Tool Travel auto-advance is excluded to avoid an unavoidable loop and because direct selection proves the claim more clearly.
- Deliberate architecture choice: local Thread SVGs replace a global page-height path so responsive reflow cannot break geometry and scroll cannot overwrite learner state.
- Placeholder scan: every task contains concrete files, interfaces, tests, commands, and completion conditions. Design guidelines are explicitly gated by the approved spec.
- Type consistency: `VioletThreadState` and `ThreadProfile` originate in `threadTypes.ts`; all later tasks import them from that file.
