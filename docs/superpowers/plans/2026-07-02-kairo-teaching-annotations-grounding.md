# Kairo Teaching Annotations And Target Grounding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Kairo's own teaching annotations feel as accurate, beautiful, and intentional as Clicky-style guidance while keeping target selection generic and model-driven across all apps.

**Architecture:** Keep user drawing tools separate from Kairo-generated teaching overlays. A vision grounding layer finds exact UI targets from the screenshot, a generic geometry layer converts raw model boxes into readable teaching targets, and the overlay/cursor renderer presents one polished purple guidance system. No per-app coordinate hardcoding is allowed.

**Tech Stack:** Tauri v2, Rust native screenshot/vision pipeline, React/TypeScript overlay rendering, Vitest, Rust unit tests, Anthropic vision grounding, existing OpenRouter/Anthropic tutor planner adapters.

---

## Implementation Status — updated 2026-07-02

This plan was written before a follow-up UX session; parts are done, parts were
deliberately dropped, and several new features (reveal timing, notch auto-close,
context-change reset) were built that are not in the original tasks. Live testing
found **no wrong targets**, so remaining grounding-accuracy work is now low
priority. Per-task status with proof:

- **Task 1 — Generic Target Geometry (`targetGeometry.ts`): ❌ DROPPED.**
  Decision (user, 2026-07-02): padding stays in Rust; a parallel TS geometry layer
  would double-pad and duplicate `padded_screen_region`. Also, the plan's own TDD
  test values were internally inconsistent (physical-vs-logical coord mix). Not built.

- **Task 2 — Native Vision Grounding: 🟡 PARTIAL.**
  ✅ Padding reduced 0.45→0.30 pct, min 20→14 px in `apply_box_targets` +
  `ground_visual_targets` (commit `badf4e9`; test `ground_visual_targets_pads_ocr_highlights`
  updated to 8/472/384/88). ⏳ "Raw tight bounds" is effectively already satisfied —
  `box_locator_prompt` already asks for "the final tight pixel box." ⏳ Helper-unify
  (fold `apply_box_targets`' inline `padded_rect` into the shared helper): NOT done, low value.

- **Task 3 — Tighten Planner Prompt: ⏳ NOT DONE.**
  The app-specific Blender line still exists (`lib.rs:2258`, `tutorPlanner.ts:182`).
  Small, still worthwhile. See explanation in the session notes.

- **Task 4 — Polished Teaching System: 🟡 PARTIAL + EXTENDED.**
  ✅ Padding polish (above). ✅ NEW beyond plan: visuals now reveal on TTS start,
  "Preparing the next step" placeholder, notch auto-close after 3s idle, and native
  context-change reset (app/tab switch + scroll/click clears stale box) — commits
  `0801cb8`, `fdbc2bf`, `68efd0f`, `badf4e9`. ⏳ Label-placement polish (`labelPlacementFor`
  is edge-aware but labels can still crowd small controls): NOT done.

- **Task 5 — Manual Evaluation Matrix: ⏳ NOT DONE.** No QA doc yet.

- **Task 6 — Full Verification + Packaged Build: ✅ ONGOING.**
  125 JS + 18 Rust tests green, typecheck clean, packaged `.app` rebuilt & signed
  each round.

**Cost note:** grounding calls the Anthropic Messages API (vision) with model
default `claude-opus-4-8` ($5/$25 per 1M as of 2026-07). ~2–3¢/ask. Cheaper path
under evaluation: swap to `qwen3.7-plus` (~12× cheaper, 79.0 vs 87.9 ScreenSpot-Pro).
We do NOT use the "tool/zoom" grounding mode — single-shot image→boxes only.

---

## Product Principles

- Kairo annotations are not user drawing tools. They are the assistant's teaching output: focus box, label, cursor, arrow/path, underline, and spotlight.
- One color family only: Kairo purple. Do not turn the screen into a multi-color status map.
- Target selection must be generic. Do not add Chrome/GitHub/YouTube/Google Meet coordinate rules.
- The model should decide *what* to point at from the screenshot. Deterministic code should only improve geometry, padding, collision, clipping, and rendering.
- If `KAIRO_SHOW_IN_CAPTURE=true`, Kairo's own notch/labels/cursor may appear in the screenshot. Prompting and validation must explicitly ignore Kairo UI unless the user asks about Kairo itself.
- One visible pointer concept per answer. The companion cursor is the pointer when a persistent box/label exists.

---

## Current State

Already present:

- `src-tauri/src/lib.rs` has Anthropic vision box detection through `detect_element_boxes`, `box_locator_prompt`, and `apply_box_targets`.
- `src/server/providers/tutorPlanner.ts` asks model providers to return `visualTargets`.
- `src/overlay/targetRouting.ts` routes point-like targets to the companion cursor and all targets to the overlay.
- `src/overlay/VisualOverlay.tsx` renders `highlight_box`, `arrow`, `underline`, `spotlight`, `pointer`, and `ghost_cursor`.
- `src/cursor/CursorApp.tsx` renders the moving companion cursor.
- The duplicate cursor issue is fixed by suppressing overlay point targets when persistent targets exist.

Current quality gaps:

- Vision boxes can be too tight, too high, or slightly offset from the real clickable region.
- Labels can crowd the target on small controls.
- Kairo-generated teaching output is not yet a coherent choreography; it is mostly a box plus a cursor.
- The planner can still return raw JSON-like text or overly literal annotation descriptions when model behavior drifts.
- There is no evaluation harness for "where is X?" target accuracy across screenshots.

---

## File Structure

### Create

- `src/overlay/targetGeometry.ts`
  - Generic geometry helpers for clamping, padding, hit-point selection, label-safe target rectangles, and target size classification.

- `tests/targetGeometry.test.ts`
  - Unit tests for target padding, edge clamping, point selection, and small-control handling.

- `tests/teachingAnnotations.test.ts`
  - Unit tests for provider response normalization and target choreography contracts.

- `docs/superpowers/specs/2026-07-02-teaching-annotation-evaluation.md`
  - Manual evaluation matrix with screenshots, prompts, expected target behavior, and pass/fail scoring.

### Modify

- `src/core/types.ts`
  - Keep existing `VisualTarget` kinds. Add optional metadata only if needed for generic rendering, not app-specific targeting.

- `src/server/providers/tutorPlanner.ts`
  - Tighten planner prompt so it asks for teaching intent, not raw decorative marks.

- `src-tauri/src/lib.rs`
  - Improve `box_locator_prompt`, `detect_element_boxes`, `apply_box_targets`, and grounding tests.

- `src/overlay/VisualOverlay.tsx`
  - Use geometry helpers for render-safe target regions and cleaner label placement.

- `src/overlay/targetRouting.ts`
  - Keep pointer routing generic and ensure companion cursor chooses the primary action point.

- `src/cursor/CursorApp.tsx`
  - Ensure the cursor points at the same target center/edge chosen by grounding, without visual duplication.

- `src/styles.css`
  - Polish visual presentation: spacing, label padding, box halo, dashed outline, arrow weight, and low-noise spotlight.

- `tests/providerPlanner.test.ts`
  - Assert prompt behavior for teaching annotations and no app-specific scope refusal.

- `tests/notchTutor.test.ts`
  - Assert routing for mixed targets: highlight box visible, companion cursor moves once, no duplicate static cursor.

- `tests/overlayCoordinates.test.ts`
  - Add edge cases for Retina/display-bound mapping.

---

## Task 1: Define Generic Target Geometry

> **STATUS: ❌ DROPPED (2026-07-02).** Padding stays in Rust by decision; a TS
> geometry layer would double-pad. Not built. Steps below kept for history only.

**Files:**
- Create: `src/overlay/targetGeometry.ts`
- Create: `tests/targetGeometry.test.ts`

- [ ] **Step 1: Write failing geometry tests**

Add tests that encode the target-quality rules without referencing any specific app:

```ts
import { describe, expect, test } from 'vitest';
import {
  clampRegionToBounds,
  paddedTeachingRegion,
  pointerRegionForTarget,
  classifyTargetSize
} from '../src/overlay/targetGeometry';

const bounds = { x: 0, y: 0, width: 1000, height: 700, scaleFactor: 2 };

describe('teaching target geometry', () => {
  test('adds readable padding around small controls without swallowing neighbors', () => {
    expect(
      paddedTeachingRegion({ x: 200, y: 100, width: 64, height: 32 }, bounds)
    ).toEqual({ x: 176, y: 76, width: 112, height: 80 });
  });

  test('clamps padded regions to the physical display', () => {
    expect(
      paddedTeachingRegion({ x: 2, y: 4, width: 48, height: 28 }, bounds)
    ).toEqual({ x: 0, y: 0, width: 74, height: 62 });
  });

  test('keeps wide fields as field-sized targets instead of giant page boxes', () => {
    expect(classifyTargetSize({ x: 100, y: 80, width: 900, height: 48 }, bounds)).toBe('wide-field');
  });

  test('centers the companion pointer inside compact click targets', () => {
    expect(pointerRegionForTarget({ x: 200, y: 100, width: 64, height: 32 }, bounds)).toEqual({
      x: 218,
      y: 94,
      width: 44,
      height: 44
    });
  });

  test('clamps invalid or overflowing regions before rendering', () => {
    expect(clampRegionToBounds({ x: -20, y: 680, width: 80, height: 80 }, bounds)).toEqual({
      x: 0,
      y: 680,
      width: 60,
      height: 20
    });
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run:

```bash
npm test -- --run tests/targetGeometry.test.ts
```

Expected: fails because `src/overlay/targetGeometry.ts` does not exist.

- [ ] **Step 3: Implement the geometry helper**

Create `src/overlay/targetGeometry.ts`:

```ts
import type { ScreenRegion } from '../core/types';
import type { DisplayBounds } from './coordinates';

export type TargetSizeClass = 'compact-control' | 'wide-field' | 'large-region';

function physicalBounds(bounds: DisplayBounds) {
  const scaleFactor = bounds.scaleFactor > 0 ? bounds.scaleFactor : 1;
  return {
    minX: bounds.x * scaleFactor,
    minY: bounds.y * scaleFactor,
    maxX: (bounds.x + bounds.width) * scaleFactor,
    maxY: (bounds.y + bounds.height) * scaleFactor,
    scaleFactor
  };
}

export function clampRegionToBounds(region: ScreenRegion, bounds: DisplayBounds): ScreenRegion {
  const { minX, minY, maxX, maxY } = physicalBounds(bounds);
  const x1 = Math.max(minX, Math.min(maxX, region.x));
  const y1 = Math.max(minY, Math.min(maxY, region.y));
  const x2 = Math.max(minX, Math.min(maxX, region.x + region.width));
  const y2 = Math.max(minY, Math.min(maxY, region.y + region.height));

  return {
    x: x1,
    y: y1,
    width: Math.max(0, x2 - x1),
    height: Math.max(0, y2 - y1)
  };
}

export function classifyTargetSize(region: ScreenRegion, bounds: DisplayBounds): TargetSizeClass {
  const { scaleFactor } = physicalBounds(bounds);
  const displayWidthPx = bounds.width * scaleFactor;
  const displayHeightPx = bounds.height * scaleFactor;
  const areaRatio = (region.width * region.height) / (displayWidthPx * displayHeightPx);
  const aspect = region.width / Math.max(1, region.height);

  if (areaRatio > 0.12 || region.width > displayWidthPx * 0.72 || region.height > displayHeightPx * 0.42) {
    return 'large-region';
  }
  if (aspect >= 5 || region.width > displayWidthPx * 0.32) {
    return 'wide-field';
  }
  return 'compact-control';
}

export function paddedTeachingRegion(region: ScreenRegion, bounds: DisplayBounds): ScreenRegion {
  const { scaleFactor } = physicalBounds(bounds);
  const sizeClass = classifyTargetSize(region, bounds);
  const minPad = sizeClass === 'compact-control' ? 12 * scaleFactor : 10 * scaleFactor;
  const maxPad = sizeClass === 'large-region' ? 18 * scaleFactor : 28 * scaleFactor;
  const pct = sizeClass === 'compact-control' ? 0.38 : sizeClass === 'wide-field' ? 0.16 : 0.06;
  const padX = Math.min(maxPad, Math.max(minPad, region.width * pct));
  const padY = Math.min(maxPad, Math.max(minPad, region.height * pct));

  return clampRegionToBounds(
    {
      x: region.x - padX,
      y: region.y - padY,
      width: region.width + padX * 2,
      height: region.height + padY * 2
    },
    bounds
  );
}

export function pointerRegionForTarget(region: ScreenRegion, bounds: DisplayBounds): ScreenRegion {
  const { scaleFactor } = physicalBounds(bounds);
  const marker = 22 * scaleFactor;
  const x = region.x + region.width / 2 - marker / 2;
  const y = region.y + region.height / 2 - marker / 2;
  return clampRegionToBounds({ x, y, width: marker, height: marker }, bounds);
}
```

- [ ] **Step 4: Verify helper tests pass**

Run:

```bash
npm test -- --run tests/targetGeometry.test.ts
```

Expected: all tests in `tests/targetGeometry.test.ts` pass.

- [ ] **Step 5: Commit geometry helper**

```bash
git add src/overlay/targetGeometry.ts tests/targetGeometry.test.ts
git commit -m "Add teaching target geometry helpers"
```

---

## Task 2: Improve Native Vision Grounding Output

> **STATUS: 🟡 PARTIAL (2026-07-02).** ✅ Padding reduced (commit `badf4e9`). ✅
> Tight-bounds prompt already present in `box_locator_prompt`. ⏳ Helper-unify not
> done (low value). No wrong targets in live testing → low priority.

**Files:**
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add Rust tests for native padding and pointer placement**

Add tests near the existing grounding tests in `src-tauri/src/lib.rs`:

```rust
#[test]
fn apply_box_targets_uses_exact_pointer_and_padded_box() {
    let content = r#"{"mode":"stuck_help","skillSlug":"","voiceText":"Click New meeting.","screenText":"Click New meeting.","visualTargets":[],"expectedNextState":"user_clicks"}"#.to_string();
    let bounds = OverlayDisplayBounds {
        x: 0.0,
        y: 0.0,
        width: 1000.0,
        height: 700.0,
        scale_factor: 2.0,
    };
    let boxes = vec![DetectedBox {
        label: "New meeting".to_string(),
        norm_x1: 0.20,
        norm_y1: 0.10,
        norm_x2: 0.32,
        norm_y2: 0.16,
        color: "#8b5cf6".to_string(),
    }];

    let grounded = apply_box_targets(content, &boxes, &bounds);
    let parsed: serde_json::Value = serde_json::from_str(&grounded).unwrap();
    let targets = parsed["visualTargets"].as_array().unwrap();
    assert_eq!(targets[0]["kind"], "pointer");
    assert_eq!(targets[1]["kind"], "highlight_box");
    assert!(targets[1]["screenRegion"]["width"].as_f64().unwrap() > 240.0);
    assert!(targets[1]["screenRegion"]["height"].as_f64().unwrap() > 84.0);
}
```

- [ ] **Step 2: Run the focused Rust test**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml apply_box_targets_uses_exact_pointer_and_padded_box
```

Expected: pass if the current padding behavior already satisfies this; otherwise fail and use the failure to adjust the implementation.

- [ ] **Step 3: Update `box_locator_prompt` for target quality**

In `src-tauri/src/lib.rs`, update `box_locator_prompt` so the vision model returns the raw target, not a padded final box:

```rust
"Return the tight raw bounds of the actual clickable or inspectable UI element. Do not add padding, halos, labels, or surrounding whitespace; Kairo will add visual padding after grounding."
```

Also include:

```rust
"If the target is a browser address bar, return the full editable address field containing the URL text, not the tab strip, page search field, or toolbar background."
```

Keep the rule generic: mention browser address bars as a common UI class, not Chrome-specific coordinates.

- [ ] **Step 4: Move raw-to-render padding into one Rust helper**

Refactor the existing closure inside `apply_box_targets` into a named helper:

```rust
fn teaching_box_region(
    raw: &ScreenRegion,
    bounds: &OverlayDisplayBounds,
    pad_pct: f64,
    pad_min_px: f64,
) -> ScreenRegion {
    padded_screen_region(raw, Some(bounds), pad_pct, pad_min_px)
}
```

Use the helper from `apply_box_targets` and `ground_visual_targets` so vision boxes and OCR fallback share the same visual breathing-room behavior.

- [ ] **Step 5: Keep one pointer source**

Ensure `apply_box_targets` still emits:

1. one `pointer` target centered on the raw target
2. one or more `highlight_box` targets using padded render regions

Do not emit a second `ghost_cursor` for the same element.

- [ ] **Step 6: Run Rust tests**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: all Rust tests pass.

- [ ] **Step 7: Commit native grounding changes**

```bash
git add src-tauri/src/lib.rs
git commit -m "Improve native teaching target grounding"
```

---

## Task 3: Tighten Planner Prompt For Teaching Intent

> **STATUS: ⏳ NOT DONE (2026-07-02).** Most teaching-intent wording already exists;
> the remaining work is dropping the app-specific Blender line (`lib.rs:2258`,
> `tutorPlanner.ts:182`) for a generic rule. Small, still worthwhile.

**Files:**
- Modify: `src/server/providers/tutorPlanner.ts`
- Modify: `tests/providerPlanner.test.ts`
- Create: `tests/teachingAnnotations.test.ts`

- [ ] **Step 1: Add planner prompt tests**

Add `tests/teachingAnnotations.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest';
import { createOpenRouterTutorPlanner } from '../src/server/providers/tutorPlanner';
import type { TutorTurnInput } from '../src/core/orchestrator';
import type { OpenRouterMessage } from '../src/server/providers/openRouter';

const input: TutorTurnInput = {
  userQuery: 'Where is the rectangle tool?',
  activeApp: { activeApp: 'Chrome', bundleId: 'com.google.Chrome', windowTitle: 'tldraw' },
  annotations: [],
  screen: {
    captured: true,
    imageMimeType: 'image/png',
    imageBase64: 'abc123',
    byteLength: 6,
    displayBounds: { x: 0, y: 0, width: 1000, height: 700, scaleFactor: 2 }
  },
  skill: { slug: 'general', displayName: 'General', appIdentifiers: [], landmarks: {} },
  constraints: ['Return one short tutor step.']
};

describe('teaching annotation planner prompt', () => {
  test('describes Kairo output as teaching annotations, not user tools', async () => {
    const chat = vi.fn(async () =>
      JSON.stringify({
        mode: 'stuck_help',
        skillSlug: '',
        voiceText: 'The rectangle tool is in the toolbar.',
        screenText: 'The rectangle tool is in the toolbar.',
        visualTargets: [
          {
            kind: 'highlight_box',
            label: 'Rectangle tool',
            confidence: 0.9,
            screenRegion: { x: 100, y: 100, width: 40, height: 40 }
          }
        ],
        expectedNextState: 'user_clicks_rectangle'
      })
    );
    const planner = createOpenRouterTutorPlanner({ chat });
    await planner(input);

    const messages = (chat.mock.calls as unknown as Array<[OpenRouterMessage[]]>)[0][0];
    const system = String(messages[0].content);
    expect(system).toContain('Kairo-generated instructional overlays');
    expect(system).toContain('not user drawing tools');
    expect(system).toContain('WHERE/SHOW QUESTIONS');
    expect(system).toContain('Prefer one precise target');
    expect(system).not.toContain('Blender unless');
  });
});
```

- [ ] **Step 2: Run the new test and confirm behavior**

Run:

```bash
npm test -- --run tests/teachingAnnotations.test.ts
```

Expected: pass if prompt already contains these instructions; otherwise fail on missing guidance.

- [ ] **Step 3: Update the system prompt**

In `src/server/providers/tutorPlanner.ts`, make the prompt enforce this model behavior:

```ts
'Teaching annotations must describe the next useful action on the screen. Do not describe Kairo marks as objects unless the user asks about the marks themselves.',
'For targetable UI, return one primary target. Add a second target only for a path, source/destination, or clear compare/contrast step.',
'If the user asks where a thing is, answer in words and also return a visual target for that thing. The visual target is required unless the thing is not visible.',
'For messy user doodles, infer the underlying app object from the arrow head, enclosed object, or nearest UI label. Never answer only "I see annotations".',
'Do not mention an app-specific skill unless the user named that app, the active app matches that skill, or the screenshot clearly shows that app.'
```

- [ ] **Step 4: Keep response parsing strict**

Do not loosen `tutorResponseSchema`. If the provider returns prose, `fallbackResponse` should still display plain prose but never raw JSON.

- [ ] **Step 5: Run provider tests**

Run:

```bash
npm test -- --run tests/providerPlanner.test.ts tests/teachingAnnotations.test.ts
```

Expected: all provider prompt and parser tests pass.

- [ ] **Step 6: Commit planner prompt changes**

```bash
git add src/server/providers/tutorPlanner.ts tests/providerPlanner.test.ts tests/teachingAnnotations.test.ts
git commit -m "Tighten teaching annotation planner prompt"
```

---

## Task 4: Render Teaching Targets As A Polished System

> **STATUS: 🟡 PARTIAL + EXTENDED (2026-07-02).** ✅ Padding polish. ✅ NEW: reveal
> on TTS start, "Preparing the next step", notch auto-close (3s idle), context-change
> reset (commits `0801cb8`, `fdbc2bf`, `68efd0f`, `badf4e9`). ⏳ Label-placement
> polish for small controls: NOT done.

**Files:**
- Modify: `src/overlay/VisualOverlay.tsx`
- Modify: `src/overlay/targetRouting.ts`
- Modify: `src/cursor/CursorApp.tsx`
- Modify: `src/styles.css`
- Modify: `tests/notchTutor.test.ts`

- [ ] **Step 1: Add routing test for no duplicate pointer**

Update `tests/notchTutor.test.ts` with a mixed target case:

```ts
test('renders persistent teaching shape without a duplicate overlay pointer', async () => {
  const bridge = createBridge({
    runTutorTurn: vi.fn(async () =>
      JSON.stringify({
        mode: 'stuck_help',
        skillSlug: '',
        voiceText: 'Click New meeting.',
        screenText: 'Click New meeting.',
        visualTargets: [
          {
            kind: 'pointer',
            targetId: 'vision-primary',
            label: 'New meeting',
            confidence: 0.95,
            screenRegion: { x: 240, y: 120, width: 44, height: 44 }
          },
          {
            kind: 'highlight_box',
            targetId: 'vision-box-0',
            label: 'New meeting',
            confidence: 0.9,
            screenRegion: { x: 180, y: 90, width: 180, height: 80 }
          }
        ],
        expectedNextState: 'user_clicks'
      })
    )
  });

  await askTutorFromNotch({
    query: 'Where is New meeting?',
    nativeBridge: bridge,
    aiProvider: 'openrouter',
    defaultSkill: 'general'
  });

  expect(bridge.cursorPoint).toHaveBeenCalledWith(
    expect.objectContaining({
      screenRegion: { x: 240, y: 120, width: 44, height: 44 }
    })
  );
  expect(bridge.showOverlay).toHaveBeenCalledWith(
    expect.objectContaining({
      targets: expect.arrayContaining([
        expect.objectContaining({ kind: 'pointer' }),
        expect.objectContaining({ kind: 'highlight_box' })
      ])
    })
  );
});
```

This verifies data routing. Rendering suppression is covered by component behavior and visual review.

- [ ] **Step 2: Render labels outside the box when possible**

In `src/overlay/VisualOverlay.tsx`, keep `labelPlacementFor` edge-aware and ensure labels do not sit on top of small controls by default. Preserve the existing data placements:

```tsx
<span className={`overlay-target-label overlay-${target.kind}-label`} data-placement={labelPlacement}>
  {target.label}
</span>
```

- [ ] **Step 3: Improve CSS spacing without adding colors**

In `src/styles.css`, tune these selectors:

```css
.overlay-target.highlight_box {
  border: 3px dashed rgb(167 139 250 / 0.95);
  border-radius: 14px;
  box-shadow:
    0 0 0 12px rgb(124 58 237 / 0.13),
    0 18px 42px rgb(58 22 120 / 0.24);
}

.overlay-target-label {
  padding: 7px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #c4a1ff, #7c3aed);
  color: white;
  font-weight: 760;
  letter-spacing: 0;
  white-space: nowrap;
  box-shadow: 0 10px 28px rgb(88 28 135 / 0.32);
}

.overlay-target-label[data-placement='above'] {
  bottom: calc(100% + 10px);
}

.overlay-target-label[data-placement='below'] {
  top: calc(100% + 10px);
}
```

- [ ] **Step 4: Keep pointer visual singular**

In `src/overlay/VisualOverlay.tsx`, keep this rule:

```ts
const hasPersistentTarget = targets.some(
  (target) => target.kind !== 'pointer' && target.kind !== 'ghost_cursor'
);
```

Point targets render only when `hasPersistentTarget` is false. This prevents two cursors for "New meeting button" and similar answers.

- [ ] **Step 5: Verify frontend tests and typecheck**

Run:

```bash
npm test -- --run tests/notchTutor.test.ts tests/overlayCoordinates.test.ts
npm run typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 6: Commit rendering polish**

```bash
git add src/overlay/VisualOverlay.tsx src/overlay/targetRouting.ts src/cursor/CursorApp.tsx src/styles.css tests/notchTutor.test.ts tests/overlayCoordinates.test.ts
git commit -m "Polish Kairo teaching annotation rendering"
```

---

## Task 5: Add Manual Evaluation Matrix

> **STATUS: ⏳ NOT DONE (2026-07-02).** No QA matrix doc yet. Useful once we tune
> accuracy or switch grounding models (e.g. Opus → qwen3.7-plus A/B).

**Files:**
- Create: `docs/superpowers/specs/2026-07-02-teaching-annotation-evaluation.md`

- [ ] **Step 1: Create evaluation doc**

Create the evaluation file with this content:

```markdown
# Teaching Annotation Evaluation Matrix

Date: 2026-07-02
Status: active QA checklist

## Required Env

- `ANTHROPIC_API_KEY` set
- `ANTHROPIC_VISION_MODEL=claude-sonnet-4-6` or stronger
- `KAIRO_VISION_MAX_EDGE=2048`
- `KAIRO_SHOW_IN_CAPTURE=false` for normal usage
- `KAIRO_SHOW_IN_CAPTURE=true` only when recording/debugging Kairo overlays

## Pass Criteria

Each prompt passes only if:

- the target is the actual requested UI element
- the label is one to three words
- the box has visible breathing room without swallowing nearby unrelated controls
- the companion cursor appears once
- no Kairo UI is targeted unless the prompt asks about Kairo
- answer text describes what to do, not the internal annotation JSON

## Test Cases

| App/screen | Prompt | Expected visual |
| --- | --- | --- |
| Google Meet landing | `Where is the New meeting button?` | One padded box around the New meeting button and one companion cursor near the button center. |
| Browser on YouTube | `Where can I click to change the URL?` | Box around the browser address bar, not the YouTube search field and not the video. |
| GitHub home | `Where can I search my repositories?` | Box around the left repository search field with comfortable padding. |
| tldraw toolbar | `Where is the rectangle tool?` | Box around the square outline tool in the toolbar, not a large toolbar strip. |
| Google search results | `Show me the Images tab.` | Box and label around the Images tab. |
| Any dense UI | `What is this marked area?` after drawing an arrow | Answer describes the underlying UI at the arrow head, not "annotation 1". |
| Any page | `What is on this screen?` | No visual target unless the answer refers to a concrete element. |

## Scoring

- 2 = exact target, polished visual
- 1 = correct area but poor padding or label placement
- 0 = wrong target, no target, duplicate pointer, or Kairo targets itself

Ship only when the seven required cases average at least 1.7 and no case scores 0.
```

- [ ] **Step 2: Commit evaluation doc**

```bash
git add docs/superpowers/specs/2026-07-02-teaching-annotation-evaluation.md
git commit -m "Add teaching annotation QA matrix"
```

---

## Task 6: Full Verification And Packaged App Test

> **STATUS: ✅ ONGOING (2026-07-02).** 125 JS + 18 Rust tests green, typecheck clean,
> packaged `.app` rebuilt & signed each round.

**Files:**
- Modify only files changed by Tasks 1-5.

- [ ] **Step 1: Run all JS tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript typecheck**

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Run Rust tests**

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: all Rust tests pass.

- [ ] **Step 4: Run Rust check**

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected: check passes.

- [ ] **Step 5: Build the packaged macOS app**

```bash
npm run tauri:build -- --bundles app
```

Expected: `src-tauri/target/release/bundle/macos/Kairo Tutor.app` is rebuilt and signed.

- [ ] **Step 6: Launch the rebuilt app**

```bash
osascript -e 'tell application "Kairo Tutor" to quit' || true
open "src-tauri/target/release/bundle/macos/Kairo Tutor.app"
```

Expected: the app opens and `Cmd+Shift+Space` activates the notch.

- [ ] **Step 7: Run the QA matrix**

Use `docs/superpowers/specs/2026-07-02-teaching-annotation-evaluation.md`. Record scores in the PR/commit notes.

- [ ] **Step 8: Final commit**

```bash
git status --short
git add src src-tauri tests docs .env.example plan.md README.md FEATURE.md brand.md
git commit -m "Improve Kairo teaching annotation grounding"
```

Only include files actually changed by this plan and related current work.

---

## Acceptance Criteria

- "Where is X?" returns a visible, accurate visual target for X when X is visible.
- Address bars, toolbar icons, sidebar fields, and app chrome count as valid targets.
- Kairo no longer draws two cursors for the same target.
- Highlight boxes have consistent padding and do not feel pasted directly on top of UI text.
- Labels are short, readable, and placed outside the target where possible.
- Kairo-generated annotations are assistant teaching output, not a new user toolbar.
- Messy user annotations are interpreted as intent, not counted as internal annotation IDs.
- No per-app coordinate rules are introduced.
- Packaged app build passes before marking the work complete.

---

## Risk Controls

- If model grounding is wrong, improve the vision prompt or model configuration first. Do not add app-specific coordinate hacks.
- If a box is slightly too tight or crowded, adjust generic padding and label placement helpers.
- If the target is consistently the wrong visible element, add evaluation cases and prompt examples that distinguish common UI classes.
- If `KAIRO_SHOW_IN_CAPTURE=true` causes Kairo to target itself, strengthen the "ignore Kairo UI" prompt and add a QA case with Kairo visible.
- If latency regresses, keep the vision grounding call parallel with answer generation and tune `KAIRO_VISION_MAX_EDGE` before reducing quality.

---

## Related Docs

- `docs/superpowers/specs/2026-06-30-claude-vision-boxes-grounding-design.md`
- `docs/superpowers/specs/2026-06-30-companion-cursor-design.md`
- `docs/clicky-borrowing-notes.md`
