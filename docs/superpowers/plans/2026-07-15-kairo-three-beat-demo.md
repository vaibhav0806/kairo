# Kairo Three-Beat Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero and “How it works” demonstrate one complete Kairo lesson—adding a first keyframe—in three clear beats: Ask, Do, Check.

**Architecture:** Keep the existing hero and sticky lesson components, but replace their copy and visual state machines with the same three-beat story. Preserve the current Blender capture and layout; add only the small overlays needed to show the learner action and Kairo’s verified result.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, Vite

## Global Constraints

- Demonstrated goal: `Add your first keyframe`.
- Use exactly three lesson beats: `Ask`, `Do`, `Check`.
- “Point” is an input within Ask, not a separate chapter.
- Do not claim that one keyframe completes an animation.
- Preserve the hero layout, headline, botanical layers, Blender capture, CTA, Tools, Trust, and waitlist.
- Keep an accessible Pause/Play control, but render only `Ⅱ` or `▶` visibly.
- Mobile and reduced-motion fallbacks must expose the complete Ask/Do/Check story without autoplay.

---

### Task 1: Hero goal loop and compact playback control

**Files:**
- Modify: `tests/landingPage.test.ts`
- Modify: `src/landing/Hero.tsx`
- Modify: `src/landing/Hero.module.css`

**Interfaces:**
- Consumes: Existing `paused` state and hero motion data attributes.
- Produces: A visible goal plus mutually legible Ask, Do, and Check hero states.

- [ ] **Step 1: Write failing hero narrative tests**

Update the hero assertions to require:

```ts
expect(html).toContain('Goal');
expect(html).toContain('Add your first keyframe');
expect(html).toContain('How do I add a keyframe here?');
expect(html).toContain('You did');
expect(html).toContain('Keyframe added');
expect(html).toContain('Move to frame 40');

const pause = screen.getByRole('button', { name: 'Pause lesson' });
expect(pause.textContent).toBe('Ⅱ');
fireEvent.click(pause);
const play = screen.getByRole('button', { name: 'Play lesson' });
expect(play.textContent).toBe('▶');
```

Update the mobile/reduced-motion contract to require a three-row transcript with labels `Ask`, `Do`, and `Check`, and to hide all animated overlays while the transcript is active.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --run tests/landingPage.test.ts`

Expected: FAIL because the current hero lacks the explicit goal, learner-action overlay, verified-result overlay, and icon-only control.

- [ ] **Step 3: Implement the hero markup**

In `Hero.tsx`:

- Change support copy to `Ask about what’s on your screen. Kairo shows one move, watches you do it, and checks that it worked.`
- Give the button a dynamic `aria-label` and `title`, and render only `Ⅱ` or `▶` inside an `aria-hidden` span.
- Add the persistent goal label `Goal · Add your first keyframe`.
- Change the question to `How do I add a keyframe here?`.
- Keep the target and instruction, then add:

```tsx
<div className={styles.learnerAction} aria-hidden="true">
  <span>You did</span>
  <b><kbd>I</kbd> → Location</b>
</div>
<div className={styles.verified} aria-hidden="true">
  <span>Checked</span>
  <b>Keyframe added</b>
  <small>Next · Move to frame 40</small>
</div>
```

- Replace the mobile transcript with Ask, Do, and Check rows using the same exact lesson.

- [ ] **Step 4: Implement mutually legible hero animation states**

In `Hero.module.css`:

- Make the control a square 44px icon button.
- Style a compact persistent goal chip.
- Add `.learnerAction` and `.verified` panels, with green reserved for the successful Check state.
- Replace the accumulating keyframes with a 10-second loop:
  - Ask visible from 6–28%.
  - Do instruction visible from 34–62%, with learner action entering at 48%.
  - Check visible from 68–96%.
- Include the new overlays in the existing paused/running selectors.
- Hide all animated overlays on mobile and reduced motion; leave the static transcript visible.

- [ ] **Step 5: Run the focused tests**

Run: `npm test -- --run tests/landingPage.test.ts`

Expected: all landing-page tests pass.

- [ ] **Step 6: Commit the hero task**

```bash
git add src/landing/Hero.tsx src/landing/Hero.module.css tests/landingPage.test.ts
git commit -m "feat: show a complete hero lesson"
```

---

### Task 2: Three-step How It Works flow

**Files:**
- Modify: `tests/landingPage.test.ts`
- Modify: `src/landing/LearningSequence.tsx`
- Modify: `src/landing/LearningSequence.module.css`

**Interfaces:**
- Consumes: Existing sticky chapter tracking and workspace state attributes.
- Produces: Three states named `ask`, `do`, and `check` using the same goal and result as the hero.

- [ ] **Step 1: Write failing sequence tests**

Change the expected chapter IDs and copy:

```ts
expect(chapterIds).toEqual(['ask', 'do', 'check']);
expect(html).toContain('One question. One result.');
expect(html).toContain('See a lesson from start to finish.');
expect(html).toContain('Add a keyframe in three clear steps.');
expect(html).not.toContain('Follow the four steps below.');
```

Update the sticky-scroll test to use three chapter positions and expect the last state to be `check` at chapter index `2`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --run tests/landingPage.test.ts`

Expected: FAIL because the sequence still contains Ask, Point, Try, and Check.

- [ ] **Step 3: Replace the chapter model and section copy**

Use these three chapters in `LearningSequence.tsx`:

```ts
const lessonChapters = [
  {
    id: 'ask',
    label: 'Ask',
    title: 'Show where you’re stuck.',
    copy: 'Ask aloud or circle the cube: “How do I add a keyframe here?”',
    summary: 'You asked: How do I add a keyframe here?'
  },
  {
    id: 'do',
    label: 'Do',
    title: 'Follow one move.',
    copy: 'Kairo finds the cube and says: Press I, then choose Location. You make the move yourself.',
    summary: 'Kairo: Press I → Location. You do it.'
  },
  {
    id: 'check',
    label: 'Check',
    title: 'Know it worked.',
    copy: 'Kairo sees the keyframe was added, then gives the next step.',
    summary: 'Checked: Keyframe added.'
  }
] as const;
```

Use the approved heading and show `Goal · Add your first keyframe` in the workspace bar. Change the question and result copy to match the hero.

- [ ] **Step 4: Reduce the workspace state CSS to three states**

In `LearningSequence.module.css`:

- `ask` shows only the question and learner mark.
- `do` shows the target, instruction, and learner action.
- `check` shows only the verified result.
- Remove `point`, `try`, and `checked` selectors.
- Preserve non-sticky, small-screen, and reduced-motion fallbacks.

- [ ] **Step 5: Run focused and full verification**

Run:

```bash
npm test -- --run tests/landingPage.test.ts
npm test -- --run
npm run typecheck
npm run build
git diff --check
```

Expected: all tests pass, TypeScript and Vite exit successfully, and no whitespace errors are reported.

- [ ] **Step 6: Commit the sequence task**

```bash
git add src/landing/LearningSequence.tsx src/landing/LearningSequence.module.css tests/landingPage.test.ts
git commit -m "feat: simplify how Kairo works"
```

---

### Task 3: Responsive visual review and delivery

**Files:**
- Modify only if a verified responsive defect is found in the files already listed above.

**Interfaces:**
- Consumes: Completed hero and sequence tasks.
- Produces: A reviewed public preview ready for user approval.

- [ ] **Step 1: Review at required widths**

Capture the hero and How It Works at 375×812, 768×1024, and 1280×800. Confirm the goal, current action, and result remain readable; confirm the icon button stays 44×44; confirm no horizontal overflow.

- [ ] **Step 2: Review reduced motion**

Confirm the static Ask/Do/Check transcript communicates the complete lesson and no autoplay control is shown when no animation runs.

- [ ] **Step 3: Run final verification after any visual fixes**

Run: `npm test -- --run && npm run typecheck && npm run build && git diff --check`

Expected: all checks pass.

- [ ] **Step 4: Publish the feature preview**

Point the existing ngrok tunnel at the verified feature workspace and provide the URL for user review. Do not merge until the user approves the preview.
