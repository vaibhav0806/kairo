# Grounding Reliability + Coordinate Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Kairo point reliably and quickly at on-screen controls across different Mac display scales, especially dense Chrome/browser UI.

**Architecture:** Replace the current implicit "physical px sometimes, logical px sometimes" target pipeline with an explicit coordinate contract: screenshots have capture/model pixel metadata, but all UI targets are display points/CSS pixels. Keep model grounding and tutor answering parallel, reduce visual inflation with target-kind-aware padding, and make the gate a mode-aware optimization rather than a blocker that can suppress pointing.

**Tech Stack:** Tauri v2, Rust, React/Vite, CoreGraphics, macOS `screencapture`, Apple Vision OCR, OpenRouter-compatible vision grounding, Vitest, Rust unit tests.

## Global Constraints

- Do not hardcode user prompts like `google.com` or one-off commands.
- Do not log secrets, raw screenshots, screenshot base64, raw audio, or full transcripts.
- Keep `KAIRO_SHOW_IN_CAPTURE=false` as the normal diagnostic/test setting so Kairo UI does not contaminate screenshots.
- Preserve the packaged app workflow: `npm run tauri:build -- --bundles app`, then `open "src-tauri/target/release/bundle/macos/Kairo Tutor.app"`.
- Use existing module boundaries unless a boundary is the root cause.

---

## Current Failure Model

The latest logs for the repeated prompt `how do I go to google.com?` show three independent failures:

1. **Gate instability:** the same screen-action prompt sometimes returns `needsScreen=false`, so no grounding/box happens.
2. **Grounding/provider instability:** OpenRouter Qwen grounding sometimes returns no text after ~20-25s.
3. **Visual inflation:** when grounding succeeds, the model box is already wide, then `pad_pct=0.30` expands it into a huge top-bar rectangle.

The Retina/display metadata is also suspicious:

```text
capture dims=3600x2338->1280x831
display bounds=w=1800 h=1169 scale=1.000
```

That means the captured screenshot is 2x the logical display bounds, but native display metadata says scale 1.0. This is fragile for cursor positioning and makes the code hard to reason about.

## Target Architecture

Use three explicit spaces:

- **Display points:** logical macOS/CSS pixels. Overlay windows, cursor WebViews, and final `VisualTarget.screenRegion` use this space.
- **Capture pixels:** raw `screencapture` image pixels before app downscaling.
- **Model pixels:** resized JPEG pixels sent to the grounding provider.

Rules:

- Rust maps model-normalized boxes directly to display points:

```rust
let x1 = bounds.x + b.norm_x1 * bounds.width;
let y1 = bounds.y + b.norm_y1 * bounds.height;
let x2 = bounds.x + b.norm_x2 * bounds.width;
let y2 = bounds.y + b.norm_y2 * bounds.height;
```

- Frontend overlay and cursor no longer divide AI target regions by `scaleFactor`.
- `scaleFactor` can remain in `displayBounds` for diagnostics and legacy mouse conversion, but it is not used to convert AI target regions.
- Capture metadata records raw and resized image dimensions so model output can be compared across machines.

---

### Task 1: Lock the Coordinate Contract

**Files:**
- Modify: `src-tauri/src/types.rs`
- Modify: `src-tauri/src/capture.rs`
- Modify: `src-tauri/src/grounding.rs`
- Modify: `src-tauri/src/ocr.rs`
- Modify: `src/overlay/coordinates.ts`
- Modify: `src/cursor/geometry.ts`
- Test: `src-tauri/src/lib.rs`

**Interfaces:**
- Consumes: `OverlayDisplayBounds { x, y, width, height, scaleFactor }`
- Produces: all `ScreenRegion` values in display points, not physical pixels.

- [ ] **Step 1: Add a failing Rust test for model box mapping in display points**

Add a test in `src-tauri/src/lib.rs` near `apply_box_targets_places_pointer_at_detected_box_center`:

```rust
#[test]
fn apply_box_targets_outputs_display_point_regions() {
    let raw = serde_json::to_string(&json!({
        "mode": "stuck_help",
        "skillSlug": "general",
        "voiceText": "Click the address field.",
        "screenText": "Click the address field.",
        "visualTargets": [],
        "expectedNextState": "user_clicks_address_field"
    }))
    .expect("raw response should serialize");
    let bounds = OverlayDisplayBounds {
        x: 0.0,
        y: 0.0,
        width: 1000.0,
        height: 700.0,
        scale_factor: 2.0,
    };
    let boxes = vec![DetectedBox {
        norm_x1: 0.10,
        norm_y1: 0.20,
        norm_x2: 0.20,
        norm_y2: 0.30,
        label: "Address field".to_string(),
        color: "#a78bfa".to_string(),
    }];

    let grounded = apply_box_targets(raw, &boxes, &bounds);
    let parsed: serde_json::Value =
        serde_json::from_str(&grounded).expect("grounded response should stay JSON");

    let pointer = &parsed["visualTargets"][0]["screenRegion"];
    assert_eq!(pointer["width"], 44.0);
    assert_eq!(pointer["height"], 44.0);
    assert_eq!(pointer["x"], 128.0);
    assert_eq!(pointer["y"], 153.0);
}
```

- [ ] **Step 2: Run test and confirm current behavior fails**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml apply_box_targets_outputs_display_point_regions
```

Expected: FAIL because current code multiplies by `scale_factor` and outputs physical-pixel regions.

- [ ] **Step 3: Change `apply_box_targets` to output display points**

In `src-tauri/src/grounding.rs`, replace `raw_rect` and bounds clamp logic with display-point mapping:

```rust
let (min_x, min_y, max_x, max_y) = (
    bounds.x,
    bounds.y,
    bounds.x + bounds.width,
    bounds.y + bounds.height,
);

let raw_rect = |b: &DetectedBox| -> (f64, f64, f64, f64) {
    let x1 = (bounds.x + b.norm_x1 * bounds.width).clamp(min_x, max_x);
    let y1 = (bounds.y + b.norm_y1 * bounds.height).clamp(min_y, max_y);
    let x2 = (bounds.x + b.norm_x2 * bounds.width).clamp(min_x, max_x);
    let y2 = (bounds.y + b.norm_y2 * bounds.height).clamp(min_y, max_y);
    (x1, y1, (x2 - x1).max(0.0), (y2 - y1).max(0.0))
};
```

Set pointer marker size in points:

```rust
let marker_px = 44.0;
```

- [ ] **Step 4: Change OCR regions to display points**

In `src-tauri/src/ocr.rs`, remove multiplication by `scale_factor` when building `OcrElement.region`:

```rust
region: ScreenRegion {
    x: left_logical,
    y: top_logical,
    width: bw * bounds.width,
    height: bh * bounds.height,
},
```

Keep `center_x_pct` and `center_y_pct` unchanged.

- [ ] **Step 5: Stop dividing AI target regions by scale in overlay/cursor**

In `src/overlay/coordinates.ts`, change `normalizeRegionToDisplayPercent`:

```ts
export function normalizeRegionToDisplayPercent(
  region: ScreenRegion,
  displayBounds: DisplayBounds
): PercentRegion {
  return normalizeRegionToPercent(
    {
      x: region.x - displayBounds.x,
      y: region.y - displayBounds.y,
      width: region.width,
      height: region.height
    },
    displayBounds
  );
}
```

In `src/cursor/geometry.ts`, change `regionToLocalRect`:

```ts
export function regionToLocalRect(region: ScreenRegion, displayBounds: DisplayBounds): LocalRect {
  return {
    left: region.x - displayBounds.x,
    top: region.y - displayBounds.y,
    width: region.width,
    height: region.height
  };
}
```

- [ ] **Step 6: Run coordinate tests**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml apply_box_targets_outputs_display_point_regions
npm run test -- tests/coordinates.test.ts tests/cursorGeometry.test.ts
```

Expected: Rust test passes. If `tests/coordinates.test.ts` or `tests/cursorGeometry.test.ts` do not exist, add focused tests for the changed functions rather than skipping coverage.

---

### Task 2: Record Capture Geometry Explicitly

**Files:**
- Modify: `src-tauri/src/types.rs`
- Modify: `src-tauri/src/capture.rs`
- Modify: `src-tauri/src/grounding.rs`
- Modify: `src/native/nativeBridge.ts`

**Interfaces:**
- Produces: optional metadata on `ScreenCaptureResult` / `TutorScreenInput` with raw and model image dimensions.
- Consumes: metadata only for logs and validation, not for final UI region conversion.

- [ ] **Step 1: Add capture metadata structs**

In `src-tauri/src/types.rs`:

```rust
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CaptureImageGeometry {
    pub(crate) raw_width: u32,
    pub(crate) raw_height: u32,
    pub(crate) encoded_width: u32,
    pub(crate) encoded_height: u32,
}
```

Add to `ScreenCaptureResult` and `TutorScreenInput`:

```rust
pub(crate) image_geometry: Option<CaptureImageGeometry>,
```

- [ ] **Step 2: Populate geometry during capture**

In `src-tauri/src/capture.rs`, have `downscale_screenshot` return `CaptureImageGeometry` instead of a tuple:

```rust
CaptureImageGeometry {
    raw_width: original_width,
    raw_height: original_height,
    encoded_width: output_width,
    encoded_height: output_height,
}
```

Store it in `ScreenCaptureResult.image_geometry`.

- [ ] **Step 3: Log scale derived from actual capture**

In `capture_screen`, compute:

```rust
let capture_scale_x = geometry.raw_width as f64 / bounds.width.max(1.0);
let capture_scale_y = geometry.raw_height as f64 / bounds.height.max(1.0);
```

Log:

```rust
klog!(
    screen,
    debug,
    capture_scale = %format!("{capture_scale_x:.3}x{capture_scale_y:.3}"),
    "capture geometry"
);
```

- [ ] **Step 4: Add native bridge type fields**

In `src/native/nativeBridge.ts`, add:

```ts
export type NativeCaptureImageGeometry = {
  rawWidth: number;
  rawHeight: number;
  encodedWidth: number;
  encodedHeight: number;
};
```

and optional `imageGeometry?: NativeCaptureImageGeometry`.

- [ ] **Step 5: Verify logs on the M4 Pro**

Run packaged app and ask the same prompt. Expected diagnostic line:

```text
capture geometry capture_scale=2.000x2.000 raw=3600x2338 encoded=1280x831 bounds=1800x1169
```

This confirms the system understands the display/capture relationship even if final UI targets stay in display points.

---

### Task 3: Replace One-Size Padding With Target-Aware Presentation

**Files:**
- Modify: `src-tauri/src/grounding.rs`
- Modify: `src/overlay/VisualOverlay.tsx`
- Modify: `src/styles.css`
- Test: `src-tauri/src/lib.rs`

**Interfaces:**
- Consumes: raw detected box in display points.
- Produces: visual targets that do not over-highlight wide skinny controls.

- [ ] **Step 1: Add failing tests for wide skinny controls**

In `src-tauri/src/lib.rs`, add:

```rust
#[test]
fn apply_box_targets_caps_padding_for_wide_skinny_controls() {
    let raw = serde_json::to_string(&json!({
        "mode": "stuck_help",
        "skillSlug": "general",
        "voiceText": "Use the address bar.",
        "screenText": "Use the address bar.",
        "visualTargets": [],
        "expectedNextState": "user_clicks_address_bar"
    }))
    .expect("raw response should serialize");
    let bounds = OverlayDisplayBounds {
        x: 0.0,
        y: 0.0,
        width: 1800.0,
        height: 1169.0,
        scale_factor: 2.0,
    };
    let boxes = vec![DetectedBox {
        norm_x1: 0.06,
        norm_y1: 0.09,
        norm_x2: 0.66,
        norm_y2: 0.12,
        label: "Address bar".to_string(),
        color: "#a78bfa".to_string(),
    }];

    let grounded = apply_box_targets(raw, &boxes, &bounds);
    let parsed: serde_json::Value =
        serde_json::from_str(&grounded).expect("grounded response should stay JSON");
    let highlight = &parsed["visualTargets"][1]["screenRegion"];

    assert!(highlight["x"].as_f64().unwrap() > 80.0);
    assert!(highlight["width"].as_f64().unwrap() < 1160.0);
}
```

- [ ] **Step 2: Implement capped padding helper**

In `src-tauri/src/grounding.rs`:

```rust
fn visual_padding_for_rect(width: f64, height: f64) -> (f64, f64) {
    let aspect = width / height.max(1.0);
    if aspect > 8.0 && height < 56.0 {
        return (10.0, 8.0);
    }
    ((width * 0.08).clamp(6.0, 24.0), (height * 0.12).clamp(6.0, 18.0))
}
```

Use it in `padded_rect` instead of `pad_pct=0.30`.

- [ ] **Step 3: Optional UI style for slim targets**

For `highlight_box` targets where `width / height > 8`, add a backend field:

```json
"presentation": "slim_control"
```

If adding fields is too much churn, keep kind as `highlight_box` and rely on capped padding first.

- [ ] **Step 4: Run visual target tests**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml apply_box_targets_caps_padding_for_wide_skinny_controls
```

Expected: PASS, and logs should no longer show top-bar highlights clamped to `x=0` for address-bar-like controls.

---

### Task 4: Make the Gate a Latency Optimization, Not a Blocking Source of Truth

**Files:**
- Modify: `src/notch/NotchApp.tsx`
- Modify: `src/notch/notchTutor.ts`
- Modify: `src-tauri/src/tutor.rs`
- Modify: `src-tauri/src/prompts.rs`
- Test: `tests/notchTutor.test.ts`

**Interfaces:**
- Voice asks may still answer direct without screen.
- Typed asks from the screen prompt should not be blocked by a flaky gate before screen work starts.

- [ ] **Step 1: Introduce query source**

In `src/notch/NotchApp.tsx`:

```ts
type QuerySource = 'typed' | 'voice';
```

Change:

```ts
const submitQuery = useCallback(async (nextQuery: string, source: QuerySource = 'typed') => {
```

Call voice paths with:

```ts
await submitQuery(transcript, 'voice');
```

Call typed form submit with:

```ts
submitQuery(query, 'typed')
```

- [ ] **Step 2: Make typed asks screen-first without prompt-specific hardcoding**

For `source === 'typed'`, skip the gate and go directly to the screen tutor path:

```ts
const gate =
  source === 'typed'
    ? { needsScreen: true, voiceText: '' }
    : await runGate(trimmedQuery);
```

This is mode semantics, not prompt hardcoding: `⌘⇧Space` opens the screen prompt.

- [ ] **Step 3: Keep voice direct-answer behavior**

For `source === 'voice'`, keep the current gate behavior so greetings and small talk can answer without screenshots.

- [ ] **Step 4: Stop synthesizing dynamic filler for typed screen asks**

Change:

```ts
void speakFiller(gate.voiceText || 'Let me take a look.');
```

to:

```ts
void speakFiller(gate.voiceText);
```

This uses pre-synthesized cached fillers when the gate did not produce text, removing a per-question TTS call.

- [ ] **Step 5: Cap gate timeout for voice**

In `src-tauri/src/tutor.rs`, add:

```rust
const GATE_TIMEOUT_CAP_MS: u64 = 5_000;
```

Use for `run_gate_turn` only:

```rust
let timeout = Duration::from_millis(
    provider_timeout_ms(provider_env_optional("OPENROUTER_REQUEST_TIMEOUT_MS"))
        .min(GATE_TIMEOUT_CAP_MS),
);
```

Do not cap `run_tutor_turn` to 5s.

- [ ] **Step 6: Test source routing**

In `tests/notchTutor.test.ts`, add coverage at the `NotchApp` layer if practical; otherwise add a small pure helper test after extracting gate policy:

```ts
expect(resolveGatePolicy('typed')).toEqual({ runGate: false, needsScreen: true });
expect(resolveGatePolicy('voice')).toEqual({ runGate: true });
```

If extracting a helper, place it in `src/notch/prompt.ts` with no prompt-specific regex.

---

### Task 5: Reduce Grounding Provider Variance

**Files:**
- Modify: `src-tauri/src/grounding.rs`
- Modify: `scripts/smoke-providers.mjs`
- Modify: `.env.example`
- Test: provider smoke command

**Interfaces:**
- Keep `KAIRO_GROUNDING_PROVIDER`.
- Add optional provider timeout/model knobs without changing current defaults silently.

- [ ] **Step 1: Add grounding timeout env**

In `src-tauri/src/grounding.rs`, replace fixed 25s timeouts with:

```rust
let timeout = Duration::from_millis(provider_timeout_ms(provider_env_optional(
    "KAIRO_GROUNDING_TIMEOUT_MS",
)).min(12_000));
```

Use this in both Anthropic and OpenAI-compatible grounding calls.

- [ ] **Step 2: Add OpenRouter grounding smoke test**

In `scripts/smoke-providers.mjs`, add a grounding smoke that:

- loads `.env.local`
- uses `KAIRO_GROUNDING_PROVIDER`
- sends a tiny screenshot-like image
- confirms the response has parseable text or JSON
- prints provider/model/latency only

Expected output shape:

```text
Grounding openrouter qwen/qwen3.7-plus: ok 1840ms
```

- [ ] **Step 3: Document provider choices**

In `.env.example`, add:

```env
KAIRO_GROUNDING_TIMEOUT_MS=12000
# For lower latency, test multiple vision-capable OpenRouter models with:
# npm run smoke:providers
```

- [ ] **Step 4: Run smoke**

Run:

```bash
npm run smoke:providers
```

Expected: grounding provider result reports a latency and no parse failure.

---

### Task 6: Add a Repeatability Harness for the Exact Bug

**Files:**
- Create: `scripts/replay-grounding.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: a local screenshot path or fresh capture.
- Produces: 3-5 repeated grounding calls with normalized boxes and latency.

- [ ] **Step 1: Add script command**

In `package.json`:

```json
"debug:grounding": "node scripts/replay-grounding.mjs"
```

- [ ] **Step 2: Implement repeated prompt replay**

Create `scripts/replay-grounding.mjs` that:

- loads `.env.local`
- accepts `--prompt "how do I go to google.com?"`
- captures screen via `screencapture -x -t png`
- resizes same way as Rust
- sends 5 grounding calls
- prints provider/model/latency/box

Do not print API keys or image base64.

- [ ] **Step 3: Compare machines**

Run on both machines:

```bash
npm run debug:grounding -- --prompt "how do I go to google.com?"
```

Expected comparison fields:

```text
raw=3600x2338 encoded=1280x831 provider=openrouter model=qwen/qwen3.7-plus
run=1 ms=1900 label="Address bar" norm=[0.06,0.09,0.66,0.12]
```

If your teammate’s normalized box is much tighter, it is provider/image variance. If normalized boxes match but overlay differs, it is coordinate/rendering.

---

### Task 7: Verification Matrix

**Files:**
- No new files unless adding tests above.

- [ ] **Step 1: Automated checks**

Run:

```bash
npm run typecheck
npm run test
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri:build -- --bundles app
```

Expected: all pass.

- [ ] **Step 2: Manual test on M4 Pro**

Set:

```env
KAIRO_LOG=info,kairo::screen=debug,kairo::grounding=debug,kairo::overlay=debug,kairo::cursor=debug,kairo::frontend=debug,kairo::gate=debug,kairo::tutor=debug
KAIRO_SHOW_IN_CAPTURE=false
KAIRO_GROUNDING_PROVIDER=openrouter
KAIRO_GROUNDING_MODEL=qwen/qwen3.7-plus
```

Ask:

```text
how do I go to google.com?
```

Expected:

- typed ask goes screen-first
- no `needsScreen=false` direct answer for typed screen prompt
- capture logs raw + encoded geometry
- grounding logs model box
- mapped highlight does not clamp to `x=0`
- visual target is readable and not padded across the entire browser toolbar

- [ ] **Step 3: Manual test on teammate’s MacBook Air**

Run the same `.env.local` settings and same prompt. Compare:

- raw/encoded capture dimensions
- normalized model box
- mapped raw region
- padded region
- overlay payload

Expected: if normalized model boxes are close, visual behavior should now be close too.

---

## Execution Notes

Recommended order:

1. Task 1 coordinate contract
2. Task 3 padding/presentation
3. Task 4 gate/latency
4. Task 2 capture metadata cleanup
5. Task 5 provider variance controls
6. Task 6 replay harness
7. Task 7 verification

Task 2 can be moved earlier if debugging remains unclear after Task 1, but Task 1 removes the most dangerous architectural ambiguity.
