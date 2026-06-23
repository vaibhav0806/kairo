# Unified Notch UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current state-specific notch windows with one stable, polished assistant shell that opens quickly, never shows partial/broken UI during transitions, supports follow-up questions after answers, and exposes annotation tools without forcing an Ask/Annotate mode switch.

**Architecture:** Keep the Tauri notch as a transparent always-on-top window, but stop resizing it between states. The native window stays at one stable assistant frame. React changes only the content inside that frame: captured, thinking, answer, input, and tool strip. Annotation still uses the full-screen overlay window, but tool selection starts from the notch.

**Tech Stack:** Tauri v2, Rust window management, React/TypeScript, CSS glass UI, existing native bridge events, existing annotation overlay.

---

## Root Cause

The broken UI is not mainly a model issue. The main problem is that the app is switching between different notch layouts and native window sizes:

- compact listening window: about `380x78`
- prompt/answer/thinking window: about `720x190`
- React content changes while Tauri is resizing/repositioning the transparent window
- some states hide the prompt, so answer state becomes a dead end
- annotation tools live in a separate overlay mode, so the user has to bounce between Ask and Annotate

This creates the partial capsule, clipped prompt, wrong close button placement, and “close then reopen” loop shown in the screenshots.

---

## Files To Change

- `src-tauri/src/lib.rs`
- `src/notch/types.ts`
- `src/notch/prompt.ts`
- `src/notch/NotchApp.tsx`
- `src/overlay/OverlayApp.tsx`
- `src/styles.css`
- `tests/notchPrompt.test.ts`
- `tests/activationState.test.ts`
- `tests/overlayStyle.test.ts`
- Rust tests in `src-tauri/src/lib.rs`

---

## Phase 1: Stable Native Notch Frame

- [ ] Change `notch_window_size` in `src-tauri/src/lib.rs` to use one stable visible size for every notch state.

  Target size:

  ```rust
  const NOTCH_WIDTH: f64 = 760.0;
  const NOTCH_HEIGHT: f64 = 236.0;
  ```

- [ ] Make `captured`, `thinking`, `showing_step`, `listening`, and any prompt/answer layout return the same size.

- [ ] Keep the window hidden when inactive, but do not shrink it to compact size between visible states.

- [ ] Update native tests:

  ```rust
  #[test]
  fn notch_window_size_uses_stable_assistant_frame() {
      assert_eq!(notch_window_size(Some("compact"), Some("listening")), (760.0, 236.0));
      assert_eq!(notch_window_size(Some("prompt"), Some("captured")), (760.0, 236.0));
      assert_eq!(notch_window_size(Some("compact"), Some("thinking")), (760.0, 236.0));
      assert_eq!(notch_window_size(Some("answer"), Some("showing_step")), (760.0, 236.0));
  }
  ```

- [ ] Verify shortcut startup no longer shows a half-rendered capsule from a native resize.

---

## Phase 2: One React Shell For Every State

- [ ] Replace state-specific card sizing in `src/styles.css` with a single `.notch-card` shell.

  Required layout:

  - fixed width within the native window
  - fixed min-height
  - header row with status orb, title/detail, and close button at the far right
  - body row that can show input, tools, answer text, or thinking text without changing the outer card

- [ ] Update `src/notch/NotchApp.tsx` so it always renders the same outer structure:

  ```tsx
  <main className="notch-shell">
    <section className={`notch-card notch-card--${viewState}`}>
      <header className="notch-header">...</header>
      <div className="notch-body">...</div>
    </section>
  </main>
  ```

- [ ] Move the close button into a stable grid column:

  ```css
  .notch-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
  ```

- [ ] Remove CSS that gives compact, prompt, and answer materially different outer dimensions.

- [ ] Add an `overflow: hidden` rule only at the card boundary, not around the content text.

- [ ] Add text clamping for answer detail, but keep enough lines visible to be useful.

---

## Phase 3: Prompt Persists After Answers

- [ ] Change `isNotchPromptVisible` in `src/notch/prompt.ts`.

  Current behavior:

  ```ts
  payload.state === 'captured'
  ```

  Required behavior:

  ```ts
  payload.state === 'captured' || payload.state === 'showing_step'
  ```

- [ ] In `src/notch/NotchApp.tsx`, keep the input row visible after an answer.

- [ ] Use state-aware placeholder text:

  - captured: `Ask about this screen`
  - showing_step: `Ask a follow-up`
  - thinking: disable input and show progress

- [ ] Do not require closing and reopening the notch after an answer.

- [ ] Keep the previous answer visible above the prompt or as the main detail text.

- [ ] Add tests in `tests/notchPrompt.test.ts`:

  - prompt visible for captured
  - prompt visible for showing_step
  - prompt hidden or disabled for thinking

---

## Phase 4: Inline Annotation Tool Strip

- [ ] Remove the separate notch-level `Annotate` button.

- [ ] Add a compact tool strip below or beside the input inside the same notch box.

  Required tools:

  - Pen
  - Rectangle
  - Circle
  - Highlight
  - Underline
  - Clear

- [ ] Use icon-only buttons with labels/tooltips where possible. Do not use large text pills for every tool.

- [ ] Keep `Ask` as the primary action in the input row.

- [ ] Add a small annotation count label:

  ```text
  3 marks
  ```

- [ ] Clicking a tool should start the annotation overlay immediately with that tool selected.

- [ ] Keep `Done` inside the overlay toolbar, not as a permanent notch action.

---

## Phase 5: Tool Selection Event Contract

- [ ] Update the notch-to-overlay event payload.

  Current event:

  ```ts
  emit('annotation:start')
  ```

  Required event:

  ```ts
  emit('annotation:start', { tool: 'pen' })
  ```

- [ ] Add a small helper in `src/notch` to build and validate annotation start payloads.

  Example:

  ```ts
  export type NotchAnnotationTool = 'pen' | 'rectangle' | 'circle' | 'highlight' | 'underline';
  export function createAnnotationStartPayload(tool: NotchAnnotationTool) {
    return { tool };
  }
  ```

- [ ] Update `src/overlay/OverlayApp.tsx` to read the incoming tool and set the initial tool before making the overlay interactive.

- [ ] If no tool is provided, default to `pen`.

- [ ] Add tests for the helper so the event contract is not an ad-hoc string.

---

## Phase 6: Smooth Submission And State Transition

- [ ] On shortcut activation, show the stable notch immediately with a “Capturing screen” or “Listening” state.

- [ ] Start screen capture after the notch is visible.

- [ ] Keep the existing `waitForNotchPaint` guard, but it should no longer need to wait through native resizing.

- [ ] When Ask is pressed:

  1. immediately set local state to thinking
  2. disable input
  3. keep the same shell visible
  4. send the provider request
  5. replace body content with answer when complete

- [ ] Do not hide the prompt area then rebuild it after the answer. It should remain mounted and simply switch disabled/enabled.

- [ ] Add a 12-15 second UI timeout fallback that returns the notch to an editable state with a short visible error.

---

## Phase 7: Visual Polish Rules

- [ ] The notch should use one visual system:

  - dark translucent card
  - soft border
  - restrained shadow
  - mint status/accent
  - orange annotation strokes only on the overlay

- [ ] Remove any large rectangular dark blocks that are not part of the card.

- [ ] No clipped cards, partial top arcs, or floating fragments.

- [ ] The close button should always be aligned to the right edge of the same card.

- [ ] The answer state should not show raw JSON. It must display `voiceText`/human text only.

- [ ] The tool strip must fit at desktop widths without wrapping into a broken second row.

---

## Phase 8: Verification

- [ ] Run unit tests:

  ```bash
  npm test -- --run
  ```

- [ ] Run frontend typecheck:

  ```bash
  npm run typecheck
  ```

- [ ] Run Rust tests:

  ```bash
  cargo test --manifest-path src-tauri/Cargo.toml
  ```

- [ ] Run Rust check:

  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```

- [ ] Build the app:

  ```bash
  npm run tauri:build -- --bundles app
  ```

- [ ] Verify entitlements after build:

  ```bash
  codesign -d --entitlements :- "src-tauri/target/release/bundle/macos/Kairo Tutor.app"
  ```

- [ ] Relaunch the built app:

  ```bash
  open "src-tauri/target/release/bundle/macos/Kairo Tutor.app"
  ```

---

## Manual QA Checklist

- [ ] `Cmd+Shift+Space` opens a complete notch card within about 1 second.

- [ ] No partial capsule appears during startup.

- [ ] No large blank rectangle appears behind the notch.

- [ ] Thinking state keeps the close button at the far right.

- [ ] Answer state still shows an input for follow-up questions.

- [ ] Pressing Enter in the input submits.

- [ ] Pressing Ask submits.

- [ ] Pen starts drawing mode immediately.

- [ ] Rectangle starts rectangle mode immediately.

- [ ] Circle starts circle mode immediately.

- [ ] Highlight starts highlight mode immediately.

- [ ] Underline starts underline mode immediately.

- [ ] Done returns to the same notch with the marks count visible.

- [ ] Asking after annotation includes the annotations in the provider request.

- [ ] Closing and reopening does not show old broken intermediate UI.

---

## Non-Goals For This Pass

- Full voice conversation loop.
- Full conversation memory across app restarts.
- Replacing Tauri with Electron.
- Changing provider model routing.

This pass is purely the focused UI/UX stability overhaul for the notch and annotation entry flow.
