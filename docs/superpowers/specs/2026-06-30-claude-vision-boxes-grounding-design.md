# Phase 1 — Claude Vision Boxes Grounding (Design)

Date: 2026-06-30
Branch: `feat/claude-vision-boxes`
Status: design — awaiting review before implementation plan

## Goal

Replace the single-point Computer Use grounding with **Opus 4.8 bounding-box
vision**. Draw multiple **labeled rectangles** around the on-screen elements the
user is asking about, and have the companion ("shadow") cursor point at the
**bottom-left corner of the primary box** at all times. Ship minimal, test on
real apps (Blender especially — tiny dense icons), then decide whether Phase 2/3
is needed.

This is the smallest viable diff from the system running today. One-stage: a
single Opus 4.8 vision call both *decides* which elements are relevant and
*returns* their boxes + captions.

## Why this approach

- The `computer` tool returns click **points only** (one action per agent-loop
  step) — it is a clicker, the wrong tool for drawing shapes.
- Claude **vision** returns multiple `[x1,y1,x2,y2]` boxes + labels in one
  ordinary messages request (Anthropic "Coordinates and bounding boxes" doc).
- Opus 4.8 currently tops ScreenSpot-Pro GUI grounding — same vendor + key we
  already use, cross-platform (good for the future Windows target).
- See memory `kairo-visual-targeting-and-platform` for the full landscape
  (Gemini masks, OmniParser, SAM2, Qwen) — all deferred past Phase 1.

## Current → New

**Current** (`run_tutor_turn`, `src-tauri/src/lib.rs`):
- Parallel: OpenRouter answer (Gemini, writes `voiceText`) + Computer Use point
  call (`detect_element_point`, returns ONE point).
- `apply_point_target` **discards** the model's `visualTargets` and replaces them
  with a single `pointer` marker.
- Fallback: OCR Set-of-Mark grounding (`ground_visual_targets`).

**New:**
- Parallel: OpenRouter answer (unchanged) + **Opus 4.8 vision boxes call**
  (`detect_element_boxes`, returns N labeled boxes).
- `apply_box_targets` emits `N × highlight_box` (with captions) **plus** one
  `pointer` at the bottom-left corner of the primary box.
- Fallback: OCR Set-of-Mark grounding **retained** unchanged.

## Components

### 1. `detect_element_boxes()` — Rust, `src-tauri/src/lib.rs` (replaces `detect_element_point`)

- Model: `ANTHROPIC_VISION_MODEL` (default `claude-opus-4-8`), direct Anthropic
  `POST /v1/messages`. **No `computer` tool, no `anthropic-beta` header.**
- **Pre-resize the screenshot aspect-preserving** to long edge
  ≤ `KAIRO_VISION_MAX_EDGE` (default `1568`; can raise toward `2576` for tiny
  Blender icons). Record the resized width/height `(rw, rh)`. Aspect-preserving
  (NOT `resize_exact`) so boxes are not skewed.
- Message: the resized image + a text prompt:
  > "The user asked this while looking at their screen: \"{user_query}\".
  > Identify the on-screen elements the user is asking about or should look at.
  > Return JSON: a list of objects `{label, box}` where `label` is a short 1-3
  > word caption and `box` is `[x1, y1, x2, y2]` in ABSOLUTE PIXELS of this
  > {rw}×{rh} image, origin top-left, x right, y down. List the most relevant
  > element first, at most 4. If nothing on screen is relevant, return an empty
  > list."
- Use structured outputs (`output_config.format` = `json_schema`, array of
  `{label: string, box: number[]}`, `additionalProperties:false`) for guaranteed
  parse. `thinking` omitted (off) for latency.
- Validate each `box` has length 4; clamp; normalize to `[0,1]` by dividing
  `x` by `rw` and `y` by `rh`.
- Return `Vec<DetectedBox { norm_x1, norm_y1, norm_x2, norm_y2, label }>`.

### 2. `apply_box_targets()` — Rust (replaces `apply_point_target`)

- For each `DetectedBox`, emit a `highlight_box` `VisualTarget`:
  - `screenRegion` in physical pixels:
    `x = (bounds.x + nx1*bounds.width) * scale_factor`,
    `y = (bounds.y + ny1*bounds.height) * scale_factor`,
    `width = (nx2-nx1)*bounds.width*scale_factor`,
    `height = (ny2-ny1)*bounds.height*scale_factor`.
  - `label` = the box caption.
- Primary box = `boxes[0]`. Emit one `pointer` `VisualTarget` whose region is a
  small marker centered on the **bottom-left corner** of the primary box
  (point `(nx1, ny2)`), so the companion cursor flies there.
- Result `visualTargets = [pointer(primary bottom-left), highlight_box × N]`.
- No Y-flip (top-left origin throughout, same as the old point path).

### 3. `run_tutor_turn()` — Rust

- Keep the local OCR pass (`ocr_tutor_screenshot`) for fallback.
- `tokio::join!(answer_future, boxes_future)` — boxes call replaces the point
  call; runs **in parallel** with the answer so it adds ~no wall-clock.
- Merge: boxes non-empty → `apply_box_targets`; else →
  `ground_visual_targets(content, &ocr)` (existing fallback, e.g. no API key or
  purely conceptual question).

### 4. Frontend — `src/overlay/VisualOverlay.tsx` + `src/styles.css`

- Render a small **caption pill** for each `highlight_box` (rounded label near
  the box's top-left), giving the Clicky "area 25" look.
- `pointer` continues to route to the companion cursor (no change).

### 5. Routing — `src/overlay/targetRouting.ts`

- **No change.** `pointer` ∈ `POINT_KINDS` → companion cursor; `highlight_box` →
  overlay window. Already correct.

### 6. Types — `src/core/types.ts`

- `VisualTarget` already has `label` + `screenRegion`. No new required fields for
  Phase 1 (reuse `highlight_box` + `pointer`).

## Config

- `ANTHROPIC_VISION_MODEL` — default `claude-opus-4-8`.
- `KAIRO_VISION_MAX_EDGE` — default `1568` (raise toward `2576` to test tiny
  Blender icons without a rebuild; read at runtime in Rust).
- `ANTHROPIC_API_KEY` — reused.

## Defaults chosen (flagged for review)

- Max 4 boxes.
- Primary box = first (model ordered by relevance).
- Pointer at bottom-left corner `(x1, y2)` of the primary box.
- Caption pills rendered on boxes.
- OCR fallback retained.
- Resize long-edge default 1568.

## Parallelism / performance

- Single vision call returns ALL boxes (no per-target fan-out) — one round trip.
- Boxes call parallel with the answer call (`tokio::join!`).
- Structured outputs avoid parse-retry loops.
- `thinking` off on the boxes call for lower latency.

## Out of scope (Phase 2 / 3)

- Varied shape types per target (circle / arrow / underline / spotlight).
- Zoom-and-verify pass or OmniParser for tiny pro-app icons.
- Segmentation masks (Gemini 2.5+ / SAM 2).
- Two-stage (answer model describes targets → vision grounds each).

## Testing

Per project rule: **never `tauri dev`** — build the packaged `.app`
(`npm run tauri:build -- --bundles app`), grant TCC, launch, and test on Blender
+ a text-heavy app. Observe box accuracy and cursor placement at the bottom-left
corner. Tune `KAIRO_VISION_MAX_EDGE` if Blender icons miss.

## Risks

- **Coordinate mapping is the #1 bug source** — resize must be aspect-preserving
  and boxes mapped back to display physical pixels correctly.
- Tiny Blender icons may need higher resolution (env-tunable) or Phase 2.
- Opus 4.8 vision latency > old CU point, but hidden behind the parallel answer
  call. Acceptable for a test.
