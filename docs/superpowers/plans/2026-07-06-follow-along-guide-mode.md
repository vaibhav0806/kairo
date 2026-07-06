# Follow-Along Guide Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third tutor path — a reactive, hands-on "follow-along" guide that shows one step at a time, waits for the user to actually do it, then re-reads the screen and shows the next step, all while the chat stays open and the user stays free.

**Architecture:** A closed reactive loop orchestrated in the notch frontend, layered on the existing open chat. New native primitives: a fast perceptual frame-hash (dHash) so we can tell "did the screen change?" without a model, and click-coordinate emission from the existing input tap. New model calls: a follow-along Fable vision turn (goal + history + one settled frame → one step) and a cheap text-only ack. Everything else reuses what ships today (gate ack, streaming TTS, overlay/cursor, epochs, `recentContext`).

**Tech Stack:** Rust (Tauri commands, `core-graphics` event taps, `image` crate), React/TypeScript (notch controller, vitest), OpenRouter (gate/ack text), Anthropic `claude-fable-5` (vision), Sarvam (streaming TTS).

**Spec:** `docs/superpowers/specs/2026-07-06-follow-along-guide-mode-design.md`

**Project rules that shape this plan:**
- Work on `main`, no feature branches (per CLAUDE.md).
- Never `println!`/`console.*` — always `klog!` (Rust) / `klog()` (TS). New subsystem tag: `follow`.
- Test the packaged `.app` (`npm run app`), never a dev server. First build after a cargo change is slow.
- Verify before done: `npm run typecheck`, `npm run test`, `cargo check --manifest-path src-tauri/Cargo.toml`, then `npm run app`.

---

## File Structure

**Native (Rust), `src-tauri/src/`:**
- `framehash.rs` — **new.** dHash perceptual hash + Hamming distance + `capture_frame_hash` command. One responsibility: "reduce a screenshot to a 256-bit fingerprint and compare fingerprints."
- `input.rs` — **modify.** Emit `input:click { x, y }` (display points) from the existing mouse-down tap while a new `follow_click` watch is armed. Add `arm_follow_click` / `disarm_follow_click` atomics.
- `tutor.rs` — **modify.** Add `run_follow_turn` (vision, one follow-along step) and `run_ack_turn` (text-only ack). Extend `run_gate_turn` output with `follow_along: bool`.
- `prompts.rs` — **modify.** Add `follow_turn_system_prompt`, `ack_system_prompt`; extend `gate_system_prompt` with the follow-along-intent rule.
- `grounding.rs` — **modify.** Add `apply_follow_step` (single box → pointer+highlight, passthrough `expect`/`wait`/`status`), reusing `map_box_to_targets`.
- `constants.rs` — **modify.** Add the follow-along constants block.
- `lib.rs` — **modify.** Register the new commands; add the `FollowClickWatch` managed state.
- `types.rs` — **modify.** Add `FollowTurnInput`, `AckInput`, `FrameHash` structs.

**Frontend (TS), `src/`:**
- `notch/followAlong.ts` — **new.** Pure helpers + types: `hammingDistance`, `sameScreen`/`stillMoving` verdicts, `clickInBox`, `waitFloorMs`, `parseFollowStep`, the `FollowAlongState` type. No React, no side effects → fully unit-testable.
- `notch/followController.ts` — **new.** The reactive controller: entry, settle loop, click-gate + screen-match, ack→step, pointer draw/fade, idle fade, done. Owns its own clip slot/epoch. Talks to the notch via a small injected interface (so it's testable with fakes).
- `notch/NotchApp.tsx` — **modify.** Wire the controller in: route `follow_along` from the gate, subscribe to `input:click`, keep `followAlong` state alive across voice turns, inject follow context into gate/tutor calls.
- `notch/notchTutor.ts` — **modify.** Add `askFollowStep` (calls `run_follow_turn`) and `speakAck` helpers mirroring the existing `askTutorFromNotch`/reveal.
- `native/nativeBridge.ts` — **modify.** Wrap the new commands: `captureFrameHash`, `runFollowTurn`, `runAckTurn`, `armFollowClick`, `disarmFollowClick`; extend the gate wrapper return.
- `config/env.ts` — **modify.** Mirror any follow-along model/timeout constants the frontend needs.

**Tests, `tests/`:**
- `followAlong.test.ts` — **new.** Unit tests for every pure helper in `followAlong.ts`.
- `followController.test.ts` — **new.** Controller state-machine tests with fakes.

---

## Phase 1 — Native frame-hash primitive

Goal: a fast, accurate, no-model "are these two screens the same?" fingerprint. dHash (difference hash) at 16×16 → 256 bits; naturally sensitive to scroll/structural change, tolerant of pixel noise. Pixels never leave Rust.

### Task 1.1: dHash + Hamming (pure Rust, unit-tested)

**Files:**
- Create: `src-tauri/src/framehash.rs`
- Modify: `src-tauri/src/lib.rs` (add `mod framehash;` near the other `mod` lines, ~top of file)

- [ ] **Step 1: Create the module with dHash + Hamming + inline tests**

Create `src-tauri/src/framehash.rs`:

```rust
//! Perceptual frame fingerprint for the follow-along loop.
//!
//! dHash (difference hash): downscale to 17x16 grayscale, then for each row
//! compare each pixel to its right neighbour (16 comparisons x 16 rows = 256
//! bits). Robust to minor pixel noise (cursor blink, clock tick), sensitive to
//! structural change (scroll = vertical shift flips many gradient bits, page
//! load, navigation). Comparison is popcount of XOR — nanoseconds.
//!
//! The hash is 8 x u32 (256 bits) so it round-trips to the JS frontend as a
//! plain number[] (each element < 2^32, safe as a JS number).

use image::GenericImageView;

pub(crate) const HASH_U32S: usize = 8; // 256 bits

/// Compute a 256-bit dHash from encoded image bytes (PNG or JPEG).
pub(crate) fn dhash_from_bytes(bytes: &[u8]) -> Result<[u32; HASH_U32S], String> {
    let img = image::load_from_memory(bytes).map_err(|e| format!("decode: {e}"))?;
    Ok(dhash(&img))
}

/// Compute a 256-bit dHash from a decoded image.
pub(crate) fn dhash(img: &image::DynamicImage) -> [u32; HASH_U32S] {
    // 17 wide so we get 16 horizontal comparisons per row; 16 rows.
    let small = img
        .resize_exact(17, 16, image::imageops::FilterType::Triangle)
        .to_luma8();
    let mut bits = [0u32; HASH_U32S];
    let mut idx = 0usize;
    for y in 0..16u32 {
        for x in 0..16u32 {
            let left = small.get_pixel(x, y).0[0];
            let right = small.get_pixel(x + 1, y).0[0];
            if left > right {
                bits[idx / 32] |= 1u32 << (idx % 32);
            }
            idx += 1;
        }
    }
    bits
}

/// Number of differing bits (0..=256). Lower = more similar.
pub(crate) fn hamming(a: &[u32; HASH_U32S], b: &[u32; HASH_U32S]) -> u32 {
    let mut d = 0u32;
    for i in 0..HASH_U32S {
        d += (a[i] ^ b[i]).count_ones();
    }
    d
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, RgbImage};

    fn solid(w: u32, h: u32, v: u8) -> DynamicImage {
        DynamicImage::ImageRgb8(RgbImage::from_pixel(w, h, image::Rgb([v, v, v])))
    }

    #[test]
    fn identical_images_have_zero_distance() {
        let a = dhash(&solid(200, 200, 128));
        let b = dhash(&solid(200, 200, 128));
        assert_eq!(hamming(&a, &b), 0);
    }

    #[test]
    fn a_horizontal_gradient_differs_from_flat() {
        // Flat gray vs a left->right gradient: many gradient bits flip.
        let flat = dhash(&solid(64, 64, 128));
        let mut grad = RgbImage::new(64, 64);
        for (x, _y, px) in grad.enumerate_pixels_mut() {
            let v = (x * 4) as u8;
            *px = image::Rgb([v, v, v]);
        }
        let grad = dhash(&DynamicImage::ImageRgb8(grad));
        assert!(hamming(&flat, &grad) > 20, "gradient should be clearly different");
    }
}
```

- [ ] **Step 2: Register the module**

In `src-tauri/src/lib.rs`, add alongside the other `mod` declarations (near `mod capture;` etc.):

```rust
mod framehash;
```

- [ ] **Step 3: Run the Rust tests**

Run: `cargo test --manifest-path src-tauri/Cargo.toml framehash`
Expected: `identical_images_have_zero_distance` and `a_horizontal_gradient_differs_from_flat` PASS.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/framehash.rs src-tauri/src/lib.rs
git commit -m "feat(follow): dHash perceptual frame fingerprint + hamming"
```

### Task 1.2: `capture_frame_hash` command

**Files:**
- Modify: `src-tauri/src/framehash.rs` (add the command)
- Modify: `src-tauri/src/types.rs` (add `FrameHash`)
- Modify: `src-tauri/src/lib.rs` (register in `generate_handler!`)
- Modify: `src-tauri/src/capture.rs` (expose raw PNG bytes if not already — see step)

- [ ] **Step 1: Add the `FrameHash` type**

In `src-tauri/src/types.rs`, add:

```rust
#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub(crate) struct FrameHash {
    /// 8 x u32 = 256-bit dHash. JS-safe as number[].
    pub hash: Vec<u32>,
}
```

- [ ] **Step 2: Add the command to `framehash.rs`**

Capture the screen (raw, full-res PNG — we hash a downscaled copy, so we do NOT want the model-facing JPEG downscale here) and return its dHash. Reuse the existing screencapture helper in `capture.rs`. If `capture.rs` only exposes the downscaled/JPEG path, add a small `pub(crate) fn capture_screen_png_bytes() -> Result<Vec<u8>, String>` there that returns the raw PNG bytes from `capture_screen_with_screencapture()` before downscaling; hashing a downscaled frame is fine too (dHash downscales anyway), so passing the model JPEG bytes also works — prefer whichever raw-bytes accessor already exists.

```rust
use crate::types::FrameHash;

#[tauri::command]
pub(crate) fn capture_frame_hash() -> Result<FrameHash, String> {
    let _t = crate::klog::timer("follow", "capture_frame_hash");
    let png = crate::capture::capture_screen_png_bytes()?; // raw bytes accessor
    let hash = dhash_from_bytes(&png)?;
    crate::klog!(follow, debug, bytes = png.len(), "captured frame hash");
    Ok(FrameHash { hash: hash.to_vec() })
}
```

If `capture_screen_png_bytes` does not exist, add to `capture.rs`:

```rust
/// Raw PNG bytes of the main display (pre-downscale). Used by the follow-along
/// frame-hash; not sent to any model.
pub(crate) fn capture_screen_png_bytes() -> Result<Vec<u8>, String> {
    capture_screen_with_screencapture() // returns the PNG bytes it already reads
}
```
(Adjust to return the `Vec<u8>` the existing function reads from the temp PNG before it is deleted; if that function currently returns a different shape, extract the read-bytes step into this helper.)

- [ ] **Step 3: Register the command**

In `src-tauri/src/lib.rs` `tauri::generate_handler![ ... ]`, add `framehash::capture_frame_hash,` next to `capture_screen,`.

- [ ] **Step 4: cargo check**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: compiles (may be slow on first build after cargo change).

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/framehash.rs src-tauri/src/types.rs src-tauri/src/lib.rs src-tauri/src/capture.rs
git commit -m "feat(follow): capture_frame_hash command"
```

---

## Phase 2 — Native click-coordinate emission

Goal: while follow-along is active, emit `input:click { x, y }` (display points, main display) from the existing mouse-down tap. No new permission (Accessibility only — same as today).

### Task 2.1: `FollowClickWatch` state + arm/disarm commands

**Files:**
- Modify: `src-tauri/src/input.rs` (define the watch struct near `ContextWatch`)
- Modify: `src-tauri/src/lib.rs` (manage the state; add `arm_follow_click` / `disarm_follow_click` commands; register)

- [ ] **Step 1: Define the watch**

In `src-tauri/src/input.rs`, near the `ContextWatch` definition, add:

```rust
/// While armed, the mouse-down tap emits `input:click { x, y }` (display points).
/// Independent of ContextWatch (which is a one-shot teardown signal).
#[derive(Default)]
pub(crate) struct FollowClickWatch {
    pub armed: std::sync::atomic::AtomicBool,
}
```

- [ ] **Step 2: Manage the state + commands in `lib.rs`**

Where the app `.manage(...)`s `ContextWatch`, also add:

```rust
.manage(std::sync::Arc::new(input::FollowClickWatch::default()))
```

Add the commands (near `arm_context_watch`):

```rust
#[tauri::command]
fn arm_follow_click(watch: State<'_, std::sync::Arc<input::FollowClickWatch>>) {
    watch.armed.store(true, std::sync::atomic::Ordering::SeqCst);
    klog!(follow, debug, "follow-click armed");
}

#[tauri::command]
fn disarm_follow_click(watch: State<'_, std::sync::Arc<input::FollowClickWatch>>) {
    watch.armed.store(false, std::sync::atomic::Ordering::SeqCst);
    klog!(follow, debug, "follow-click disarmed");
}
```

Register both in `generate_handler!`.

- [ ] **Step 3: cargo check**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/input.rs src-tauri/src/lib.rs
git commit -m "feat(follow): FollowClickWatch state + arm/disarm commands"
```

### Task 2.2: Emit click coordinates from the tap

**Files:**
- Modify: `src-tauri/src/input.rs` (the `spawn_context_input_tap` callback)

The existing tap (per exploration) taps `LeftMouseDown`/`RightMouseDown`/`OtherMouseDown`/`ScrollWheel` and binds the event as `_event` (discarded). We now read the event location on a left mouse-down and emit it when `FollowClickWatch` is armed. Pass the `Arc<FollowClickWatch>` into the tap spawner alongside the existing `ContextWatch`.

- [ ] **Step 1: Thread the follow-click watch into the tap**

Update `spawn_context_input_tap(...)`'s signature and its `lib.rs` call site to also receive `follow: std::sync::Arc<FollowClickWatch>`. Clone it into the callback closure.

- [ ] **Step 2: Read location + emit on left mouse-down**

Inside the tap callback, replace the discarded-event binding. `CGEvent::location()` returns a `CGPoint` in **global display coordinates (points, top-left origin)** — the same space as the overlay target boxes, so no conversion on the main display:

```rust
move |_proxy, event_type, event| {
    // Existing context-reset behavior (unchanged):
    if context_watch_settled(&watch) {
        fire_context_reset(&app, &watch, "input");
    }
    // New: follow-along click coordinates on a left mouse-down.
    if matches!(event_type, CGEventType::LeftMouseDown)
        && follow.armed.load(std::sync::atomic::Ordering::SeqCst)
    {
        let p = event.location(); // CGPoint, global display points, top-left origin
        let _ = app.emit("input:click", ClickPoint { x: p.x, y: p.y });
        klog!(follow, debug, x = p.x, y = p.y, "emit input:click");
    }
    CallbackResult::Keep
}
```

Add the payload struct near the top of `input.rs`:

```rust
#[derive(serde::Serialize, Clone)]
struct ClickPoint {
    x: f64,
    y: f64,
}
```

Ensure `use core_graphics::event::{CGEventType};` (or the crate's path) and `use tauri::Emitter;` are in scope (mirror the existing emits in this file, e.g. `context:changed`).

- [ ] **Step 3: cargo check**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: compiles.

- [ ] **Step 4: Manual coordinate-space verification (deferred to Phase 6)**

Coordinate spaces are error-prone. We verify in Phase 6 that an emitted `input:click` for a real click lands inside the drawn box; a mismatch means points-vs-pixels and we add a `scale_factor` conversion here. Note this dependency; do not mark the geometry gate "done" until Phase 6 confirms.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/input.rs
git commit -m "feat(follow): emit input:click coordinates while follow-click armed"
```

---

## Phase 3 — Model layer (constants, prompts, native turns)

### Task 3.1: Constants

**Files:**
- Modify: `src-tauri/src/constants.rs`
- Modify: `src/config/env.ts` (mirror the ones the frontend needs)

- [ ] **Step 1: Add the follow-along constants block**

Append to `src-tauri/src/constants.rs`:

```rust
// ---------------------------------------------------------------- Follow-along
// The reactive, hands-on guide path. See
// docs/superpowers/specs/2026-07-06-follow-along-guide-mode-design.md
pub(crate) const FOLLOW_MODEL: &str = "claude-fable-5";        // vision, next step
pub(crate) const FOLLOW_TURN_TIMEOUT_MS: u64 = 20_000;
pub(crate) const ACK_MODEL: &str = "google/gemini-2.5-flash-lite"; // text-only ack
pub(crate) const ACK_TIMEOUT_MS: u64 = 6_000;

// `wait` enum floors (ms) — the model emits the bucket, we map here.
pub(crate) const WAIT_INSTANT_MS: u64 = 75;
pub(crate) const WAIT_UI_SETTLE_MS: u64 = 400;
pub(crate) const WAIT_PAGE_LOAD_MS: u64 = 1_500;
pub(crate) const WAIT_NETWORK_MS: u64 = 2_500;
```

- [ ] **Step 2: Mirror the frontend-facing knobs in `src/config/env.ts`**

Add to the zod defaults (matching the native values), since the settle loop + wait mapping run in the frontend:

```ts
// Follow-along (mirror of src-tauri/src/constants.rs)
FOLLOW_SETTLE_POLL_MS: z.coerce.number().default(300),
FOLLOW_SETTLE_MAX_ITERATIONS: z.coerce.number().default(10),
FOLLOW_SETTLE_MOVING_BITS: z.coerce.number().default(6),   // >this of 256 = still moving
FOLLOW_SAMESCREEN_BITS: z.coerce.number().default(28),     // >this of 256 = different screen
FOLLOW_CLICK_PAD_PT: z.coerce.number().default(24),        // click tolerance around the box
FOLLOW_POINTER_IDLE_FADE_MS: z.coerce.number().default(30_000),
WAIT_INSTANT_MS: z.coerce.number().default(75),
WAIT_UI_SETTLE_MS: z.coerce.number().default(400),
WAIT_PAGE_LOAD_MS: z.coerce.number().default(1_500),
WAIT_NETWORK_MS: z.coerce.number().default(2_500),
```
(Follow the existing shape of `env.ts`; if it parses from `import.meta.env`, keep these as plain defaults — they need no `.env` entry.)

- [ ] **Step 3: Verify**

Run: `cargo check --manifest-path src-tauri/Cargo.toml` and `npm run typecheck`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/constants.rs src/config/env.ts
git commit -m "feat(follow): constants — models, wait floors, settle/geometry knobs"
```

### Task 3.2: Prompts

**Files:**
- Modify: `src-tauri/src/prompts.rs`

- [ ] **Step 1: Add the follow-along vision prompt**

Add to `src-tauri/src/prompts.rs`:

```rust
/// System prompt for one follow-along step. The model sees ONE settled
/// screenshot plus the goal and the steps already done, and returns exactly ONE
/// next step. It NEVER pre-plans the whole task.
pub(crate) fn follow_turn_system_prompt(goal: &str, history: &[String]) -> String {
    let done = if history.is_empty() {
        "Nothing done yet — this is the first step.".to_string()
    } else {
        format!("Steps already completed:\n- {}", history.join("\n- "))
    };
    format!(
        "You are guiding the user hands-on toward a goal, ONE step at a time, on \
their real screen. GOAL: {goal}\n{done}\n\n\
Look at the screenshot (the user's CURRENT screen). Return ONLY JSON: \
{{ \"say\": string, \"box\": [x1,y1,x2,y2] | null, \"expect\": \"click\"|\"observe\", \
\"wait\": \"instant\"|\"ui-settle\"|\"page-load\"|\"network\", \"status\": \"guiding\"|\"done\" }}.\n\
Rules:\n\
- Exactly ONE next action. If the goal is already achieved on this screen, set \
status \"done\" and say a short congratulations; box null.\n\
- `box` = normalized fractions 0..1, tight around the single control to act on. \
Use null only for a pure explanation/observe step.\n\
- `expect`: \"click\" when the user must click the boxed control; \"observe\" for a \
pure explanation with no action.\n\
- `wait`: how long the screen will take to settle AFTER this action — \"instant\" \
(focus/toggle), \"ui-settle\" (menu/panel opens), \"page-load\" (open file / switch \
tab), \"network\" (submit / merge / server round-trip).\n\
- No positional words (no \"top-right\"/\"left\"). The box shows WHERE; your words say \
WHAT and WHY. Refer to the target as \"this\" / \"the one I've highlighted\".\n\
- Do NOT claim what will happen after the click; describe the action to take.\n\
Output ONLY the JSON object."
    )
}
```

- [ ] **Step 2: Add the ack prompt**

```rust
/// Text-only ack spoken immediately after a valid click, while the vision model
/// plans the next step. MUST NOT claim any on-screen result — only acknowledge
/// the action and bridge to the next step.
pub(crate) fn ack_system_prompt() -> String {
    "The user just did the action you asked for in a hands-on guide. Say ONE short, \
warm, forward-looking spoken line (about 4 to 8 words) that acknowledges they did \
it and that you're moving to the next step. You have NOT seen the result — do NOT \
claim anything is now open/done/changed. Good: \"Nice — let me line up the next \
step.\" \"Got it, one moment for what's next.\" Bad: \"Great, the editor is open now.\" \
Return ONLY the sentence, no quotes, no JSON."
        .to_string()
}
```

- [ ] **Step 3: Extend the gate prompt with follow-along intent**

Locate `gate_system_prompt()` (around `prompts.rs:15`). Extend its JSON contract and add a rule. Change the emitted-JSON line to include `follow_along` and add the rule text:

```rust
// In gate_system_prompt(), update the "Return ONLY JSON" line to:
//   Return ONLY JSON: { "needsScreen": boolean, "voiceText": string, "followAlong": boolean }.
// And add this rule near the other rules:
//   Set followAlong=true ONLY when the user wants to be guided hands-on through
//   DOING a multi-step task on their screen ("walk me through…", "guide me to…",
//   "help me do…", "teach me to <perform action>"). For "explain / what is this /
//   orient me" set followAlong=false. followAlong=true implies needsScreen=true.
```
Keep the existing `needsScreen`/`voiceText` behavior and the "SHORT spoken filler, no screen claims" rule intact.

- [ ] **Step 4: Verify**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: compiles.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/prompts.rs
git commit -m "feat(follow): follow-turn + ack prompts; gate emits followAlong"
```

### Task 3.3: `apply_follow_step` (raw JSON → frontend-ready targets)

**Files:**
- Modify: `src-tauri/src/grounding.rs`

Reuse the existing `map_box_to_targets` (box fractions → pointer + highlight in display points, with sampled accent color). Emit a single-step shape carrying the follow-along fields.

- [ ] **Step 1: Add the function + a unit test**

In `src-tauri/src/grounding.rs`, add (mirroring `apply_step_targets`):

```rust
/// Reshape a raw follow-along step `{say, box?, expect, wait, status}` into a
/// frontend-ready `{say, visualTargets, expect, wait, status}`. `box` is
/// normalized fractions; it becomes a highlight_box + pointer in display points.
pub(crate) fn apply_follow_step(
    raw: &str,
    _image_base64: Option<&str>,
    bounds: &OverlayDisplayBounds,
) -> Result<String, String> {
    let v: serde_json::Value = serde_json::from_str(raw).map_err(|e| format!("follow json: {e}"))?;
    let say = v.get("say").and_then(|s| s.as_str()).unwrap_or("").to_string();
    let expect = v.get("expect").and_then(|s| s.as_str()).unwrap_or("observe").to_string();
    let wait = v.get("wait").and_then(|s| s.as_str()).unwrap_or("ui-settle").to_string();
    let status = v.get("status").and_then(|s| s.as_str()).unwrap_or("guiding").to_string();

    let targets = match v.get("box") {
        Some(b) if !b.is_null() => {
            if let Some(nb) = parse_norm_box(b) {
                map_box_to_targets(&nb, bounds) // returns Vec<serde_json::Value> of targets
            } else {
                Vec::new()
            }
        }
        _ => Vec::new(),
    };

    let out = serde_json::json!({
        "say": say,
        "visualTargets": targets,
        "expect": expect,
        "wait": wait,
        "status": status,
    });
    Ok(out.to_string())
}
```
(Match the exact helper names/return types already in `grounding.rs`: `parse_norm_box`, `map_box_to_targets`, `OverlayDisplayBounds`. If `map_box_to_targets` returns a typed struct rather than `Vec<Value>`, serialize it the same way `apply_step_targets` does.)

- [ ] **Step 2: Add a test in the existing `#[cfg(test)] mod tests` of `grounding.rs`**

```rust
#[test]
fn apply_follow_step_passes_through_fields_and_makes_targets() {
    let bounds = OverlayDisplayBounds { x: 0.0, y: 0.0, width: 1000.0, height: 800.0, scale_factor: 2.0 };
    let raw = r#"{"say":"click this","box":[0.1,0.1,0.2,0.2],"expect":"click","wait":"page-load","status":"guiding"}"#;
    let out = apply_follow_step(raw, None, &bounds).unwrap();
    let v: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert_eq!(v["expect"], "click");
    assert_eq!(v["wait"], "page-load");
    assert_eq!(v["status"], "guiding");
    assert!(v["visualTargets"].as_array().unwrap().len() >= 1, "box → at least a highlight/pointer");
}

#[test]
fn apply_follow_step_null_box_is_observe_with_no_targets() {
    let bounds = OverlayDisplayBounds { x: 0.0, y: 0.0, width: 1000.0, height: 800.0, scale_factor: 2.0 };
    let raw = r#"{"say":"look here","box":null,"expect":"observe","wait":"instant","status":"guiding"}"#;
    let out = apply_follow_step(raw, None, &bounds).unwrap();
    let v: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert_eq!(v["visualTargets"].as_array().unwrap().len(), 0);
}
```
(Adjust the `OverlayDisplayBounds` literal to the struct's real fields — copy from the existing tests near `grounding.rs:1027`.)

- [ ] **Step 3: Run the tests**

Run: `cargo test --manifest-path src-tauri/Cargo.toml apply_follow_step`
Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/grounding.rs
git commit -m "feat(follow): apply_follow_step — single box → targets + passthrough fields"
```

### Task 3.4: `run_follow_turn` + `run_ack_turn` commands

**Files:**
- Modify: `src-tauri/src/types.rs` (inputs)
- Modify: `src-tauri/src/tutor.rs` (commands)
- Modify: `src-tauri/src/lib.rs` (register)

- [ ] **Step 1: Add input types**

In `src-tauri/src/types.rs`:

```rust
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct FollowTurnInput {
    pub goal: String,
    pub history: Vec<String>,
    pub image_base64: Option<String>,
    pub media_type: Option<String>,
    pub active_app: Option<String>,
    pub window_title: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AckInput {
    /// The instruction the user just completed (drives a screen-blind ack).
    pub completed_step: String,
}
```

- [ ] **Step 2: `run_follow_turn` (vision, one step)**

In `src-tauri/src/tutor.rs`, mirror the single-call path of `run_tutor_turn` (uses `anthropic_vision_chat`, then reshape). Requires a screenshot + display bounds:

```rust
#[tauri::command]
pub(crate) async fn run_follow_turn(input: crate::types::FollowTurnInput) -> Result<String, String> {
    let _t = crate::klog::timer("follow", "run_follow_turn");
    let bounds = crate::capture::main_display_bounds().ok_or("no display bounds")?;
    let image = input.image_base64.as_deref().ok_or("follow turn needs a screenshot")?;
    let media = input.media_type.as_deref().unwrap_or("image/jpeg");
    let system = crate::prompts::follow_turn_system_prompt(&input.goal, &input.history);
    let user = format!(
        "App: {}. Window: {}.",
        input.active_app.as_deref().unwrap_or("?"),
        input.window_title.as_deref().unwrap_or("?"),
    );
    let raw = crate::grounding::anthropic_vision_chat(
        &system, &user, image, media,
        crate::constants::FOLLOW_MODEL,
        crate::constants::FOLLOW_TURN_TIMEOUT_MS,
    ).await?;
    let cleaned = crate::grounding::clean_model_json(&raw);
    let shaped = crate::grounding::apply_follow_step(&cleaned, Some(image), &bounds)?;
    crate::klog!(follow, info, "follow step ready");
    Ok(shaped)
}
```
(Match the real signatures of `anthropic_vision_chat`, `clean_model_json`, `main_display_bounds`, and the `OverlayDisplayBounds`↔`DisplayBounds` type used by `apply_follow_step` — copy from `run_tutor_turn`'s single-call branch, `tutor.rs:255-311`.)

- [ ] **Step 3: `run_ack_turn` (text-only)**

Mirror `run_gate_turn`'s OpenRouter text call, but with the ack prompt and no `needsScreen` parsing — just return the sentence:

```rust
#[tauri::command]
pub(crate) async fn run_ack_turn(input: crate::types::AckInput) -> Result<String, String> {
    let _t = crate::klog::timer("follow", "run_ack_turn");
    let system = crate::prompts::ack_system_prompt();
    let user = format!("Completed action: {}", input.completed_step);
    // Reuse the same OpenRouter text path the gate uses (effort=none, short).
    let text = crate::tutor::openrouter_text_chat(
        &system, &user,
        crate::constants::ACK_MODEL,
        crate::constants::ACK_TIMEOUT_MS,
    ).await.unwrap_or_default();
    let text = text.trim().to_string();
    crate::klog!(follow, info, len = text.len(), "ack ready");
    Ok(text)
}
```
If a reusable `openrouter_text_chat(system, user, model, timeout)` helper does not exist, extract one from the body of `run_gate_turn` (`tutor.rs:421`) — the request-building + POST + `choices[0].message.content` read — and call it from both. This is a DRY refactor local to `tutor.rs`, in-scope for this change. On any failure the ack returns `""` (the frontend then just skips speaking it — never blocks the step).

- [ ] **Step 4: Register both commands**

In `src-tauri/src/lib.rs` `generate_handler!`, add `run_follow_turn,` and `run_ack_turn,` next to `run_tutor_turn,`.

- [ ] **Step 5: Verify**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: compiles.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/types.rs src-tauri/src/tutor.rs src-tauri/src/lib.rs
git commit -m "feat(follow): run_follow_turn (vision step) + run_ack_turn (text ack)"
```

---

## Phase 4 — Frontend pure helpers (TDD)

Goal: every decision the controller makes, as a pure function, unit-tested in vitest (node env, no DOM).

### Task 4.1: `followAlong.ts` types + helpers

**Files:**
- Create: `src/notch/followAlong.ts`
- Test: `tests/followAlong.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/followAlong.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  hammingDistance,
  stillMoving,
  sameScreen,
  clickInBox,
  waitFloorMs,
  parseFollowStep,
} from '../src/notch/followAlong';

describe('hammingDistance', () => {
  it('is 0 for identical hashes', () => {
    expect(hammingDistance([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8])).toBe(0);
  });
  it('counts differing bits across all u32 chunks', () => {
    // 0b1 vs 0b0 in first chunk = 1 bit; 0b111 vs 0b0 in last = 3 bits
    expect(hammingDistance([1, 0, 0, 0, 0, 0, 0, 0b111], [0, 0, 0, 0, 0, 0, 0, 0])).toBe(4);
  });
});

describe('stillMoving / sameScreen thresholds', () => {
  const a = [0, 0, 0, 0, 0, 0, 0, 0];
  it('stillMoving when distance exceeds the movingBits threshold', () => {
    expect(stillMoving(a, [0, 0, 0, 0, 0, 0, 0, 0b1111111], 6)).toBe(true); // 7 bits > 6
    expect(stillMoving(a, [0, 0, 0, 0, 0, 0, 0, 0b1], 6)).toBe(false);       // 1 bit
  });
  it('sameScreen when distance is within the samescreen threshold', () => {
    expect(sameScreen(a, [0, 0, 0, 0, 0, 0, 0, 0b11], 28)).toBe(true);       // 2 <= 28
    // 30 differing bits > 28 => not same screen
    const many = [0xffffffff, 0x3fff, 0, 0, 0, 0, 0, 0]; // 32 + 14 = 46 bits
    expect(sameScreen(a, many, 28)).toBe(false);
  });
});

describe('clickInBox', () => {
  const box = { x: 100, y: 100, width: 50, height: 40 }; // display points
  it('true when the click is inside', () => {
    expect(clickInBox({ x: 120, y: 120 }, box, 0)).toBe(true);
  });
  it('false when clearly outside', () => {
    expect(clickInBox({ x: 400, y: 400 }, box, 0)).toBe(false);
  });
  it('respects padding', () => {
    expect(clickInBox({ x: 95, y: 95 }, box, 0)).toBe(false);
    expect(clickInBox({ x: 95, y: 95 }, box, 24)).toBe(true);
  });
});

describe('waitFloorMs', () => {
  const cfg = { instant: 75, uiSettle: 400, pageLoad: 1500, network: 2500 };
  it('maps each bucket', () => {
    expect(waitFloorMs('instant', cfg)).toBe(75);
    expect(waitFloorMs('network', cfg)).toBe(2500);
  });
  it('defaults unknown to uiSettle', () => {
    expect(waitFloorMs('weird' as any, cfg)).toBe(400);
  });
});

describe('parseFollowStep', () => {
  it('parses a valid step', () => {
    const s = parseFollowStep({
      say: 'click this',
      visualTargets: [{ kind: 'highlight_box', screenRegion: { x: 1, y: 2, width: 3, height: 4 } }],
      expect: 'click',
      wait: 'page-load',
      status: 'guiding',
    });
    expect(s.expect).toBe('click');
    expect(s.status).toBe('guiding');
    expect(s.box).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });
  it('treats a step with no highlight_box as observe-shaped (box null)', () => {
    const s = parseFollowStep({ say: 'look', visualTargets: [], expect: 'observe', wait: 'instant', status: 'guiding' });
    expect(s.box).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run test -- followAlong`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/notch/followAlong.ts`**

```ts
// Pure helpers + types for the follow-along guide loop. No React, no side effects.

export type FollowExpect = 'click' | 'observe';
export type FollowWait = 'instant' | 'ui-settle' | 'page-load' | 'network';
export type FollowStatus = 'guiding' | 'done';

export interface ScreenRegion { x: number; y: number; width: number; height: number }
export interface FrameHashV { hash: number[] } // 8 x u32

export interface FollowStep {
  say: string;
  box: ScreenRegion | null;      // the highlight_box region in display points, or null
  visualTargets: any[];          // raw targets to route to the overlay/cursor
  expect: FollowExpect;
  wait: FollowWait;
  status: FollowStatus;
}

export interface FollowAlongState {
  active: boolean;
  goal: string;
  history: string[];             // completed step instructions
  currentStep: FollowStep | null;
  referenceHash: number[] | null; // dHash of the frame currentStep was planned from
}

export interface WaitFloors { instant: number; uiSettle: number; pageLoad: number; network: number }

/** Differing-bit count between two 8x u32 dHashes (0..256). */
export function hammingDistance(a: number[], b: number[]): number {
  let d = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    let x = (a[i] ^ b[i]) >>> 0;
    // popcount of a 32-bit int
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    x = (x + (x >>> 4)) & 0x0f0f0f0f;
    d += (x * 0x01010101) >>> 24;
  }
  return d;
}

/** Screen is still animating/loading: distance exceeds the sensitive threshold. */
export function stillMoving(a: number[], b: number[], movingBits: number): boolean {
  return hammingDistance(a, b) > movingBits;
}

/** Same screen as the reference: distance within the tolerant threshold. */
export function sameScreen(a: number[], b: number[], samescreenBits: number): boolean {
  return hammingDistance(a, b) <= samescreenBits;
}

/** Is a click (display points) inside the box, padded by padPt points? */
export function clickInBox(
  click: { x: number; y: number },
  box: ScreenRegion,
  padPt: number,
): boolean {
  return (
    click.x >= box.x - padPt &&
    click.x <= box.x + box.width + padPt &&
    click.y >= box.y - padPt &&
    click.y <= box.y + box.height + padPt
  );
}

/** Map a `wait` bucket to its floor in ms. Unknown → uiSettle. */
export function waitFloorMs(wait: FollowWait, floors: WaitFloors): number {
  switch (wait) {
    case 'instant': return floors.instant;
    case 'ui-settle': return floors.uiSettle;
    case 'page-load': return floors.pageLoad;
    case 'network': return floors.network;
    default: return floors.uiSettle;
  }
}

/** Normalize a raw follow-step payload (from run_follow_turn) into a FollowStep. */
export function parseFollowStep(raw: any): FollowStep {
  const targets: any[] = Array.isArray(raw?.visualTargets) ? raw.visualTargets : [];
  const boxTarget = targets.find((t) => t?.kind === 'highlight_box') ?? null;
  const region = boxTarget?.screenRegion ?? null;
  const box: ScreenRegion | null = region
    ? { x: region.x, y: region.y, width: region.width, height: region.height }
    : null;
  const expect: FollowExpect = raw?.expect === 'click' ? 'click' : 'observe';
  const status: FollowStatus = raw?.status === 'done' ? 'done' : 'guiding';
  const wait: FollowWait = (['instant', 'ui-settle', 'page-load', 'network'] as const)
    .includes(raw?.wait) ? raw.wait : 'ui-settle';
  return { say: String(raw?.say ?? ''), box, visualTargets: targets, expect, wait, status };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm run test -- followAlong`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/notch/followAlong.ts tests/followAlong.test.ts
git commit -m "feat(follow): pure helpers — hamming, thresholds, clickInBox, wait map, parse"
```

---

## Phase 5 — Frontend follow-along controller

Goal: the reactive loop. Built as a controller with an injected interface so its state machine is testable without React/Tauri; wired into `NotchApp` last.

### Task 5.1: The controller (dependency-injected, unit-tested)

**Files:**
- Create: `src/notch/followController.ts`
- Test: `tests/followController.test.ts`

The controller depends only on a small interface (`FollowDeps`) so tests inject fakes. It does NOT import React or Tauri directly.

- [ ] **Step 1: Write the failing test (happy path + wrong-screen click)**

Create `tests/followController.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { createFollowController, type FollowDeps } from '../src/notch/followController';

function deps(overrides: Partial<FollowDeps> = {}): FollowDeps {
  return {
    captureFrameHash: vi.fn(async () => [0, 0, 0, 0, 0, 0, 0, 0]),
    captureScreenB64: vi.fn(async () => ({ imageBase64: 'x', mediaType: 'image/jpeg' })),
    runFollowTurn: vi.fn(async () => ({
      say: 'click this', box: { x: 100, y: 100, width: 40, height: 30 },
      visualTargets: [{ kind: 'highlight_box', screenRegion: { x: 100, y: 100, width: 40, height: 30 } }],
      expect: 'click', wait: 'instant', status: 'guiding',
    })),
    runAckTurn: vi.fn(async () => 'nice, next step'),
    speak: vi.fn(async () => {}),
    showPointer: vi.fn(),
    fadePointer: vi.fn(),
    armFollowClick: vi.fn(),
    disarmFollowClick: vi.fn(),
    sleep: vi.fn(async () => {}),
    now: (() => { let t = 0; return () => (t += 1000); })(),
    log: vi.fn(),
    cfg: {
      settlePollMs: 300, settleMaxIterations: 10, settleMovingBits: 6, samescreenBits: 28,
      clickPadPt: 24, pointerIdleFadeMs: 30000,
      waitFloors: { instant: 75, uiSettle: 400, pageLoad: 1500, network: 2500 },
    },
    ...overrides,
  };
}

describe('follow controller', () => {
  it('start() plans and shows the first step, arms the click watch', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('open my first PR', { activeApp: 'Chrome', windowTitle: 'repo' });
    expect(d.runFollowTurn).toHaveBeenCalledTimes(1);
    expect(d.showPointer).toHaveBeenCalledTimes(1);
    expect(d.armFollowClick).toHaveBeenCalled();
    expect(c.state.active).toBe(true);
    expect(c.state.currentStep?.expect).toBe('click');
  });

  it('a valid in-box click on the same screen acks + advances', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    d.runFollowTurn = vi.fn(async () => ({
      say: 'done!', box: null, visualTargets: [], expect: 'observe', wait: 'instant', status: 'done',
    })) as any;
    // click centre of the box; captureFrameHash returns the same reference hash → same screen
    await c.onClick({ x: 120, y: 115 });
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
    expect(c.state.active).toBe(false); // status done → deactivated
  });

  it('an in-box click but the screen CHANGED does nothing', async () => {
    const d = deps();
    // reference hash is zeros; make the click-time capture very different
    d.captureFrameHash = vi
      .fn()
      .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0])      // planning frame (reference)
      .mockResolvedValue([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]); // click-time: different
    const c = createFollowController(d);
    await c.start('goal', {});
    const acksBefore = (d.runAckTurn as any).mock.calls.length;
    await c.onClick({ x: 120, y: 115 });
    expect((d.runAckTurn as any).mock.calls.length).toBe(acksBefore); // no ack
    expect(c.state.history.length).toBe(0); // no advance
  });

  it('a click outside the box does nothing', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    await c.onClick({ x: 999, y: 999 });
    expect(d.runAckTurn).not.toHaveBeenCalled();
    expect(c.state.history.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- followController`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/notch/followController.ts`**

```ts
import {
  parseFollowStep, clickInBox, waitFloorMs, stillMoving, sameScreen,
  type FollowAlongState, type FollowStep, type WaitFloors,
} from './followAlong';

export interface FollowCfg {
  settlePollMs: number;
  settleMaxIterations: number;
  settleMovingBits: number;
  samescreenBits: number;
  clickPadPt: number;
  pointerIdleFadeMs: number;
  waitFloors: WaitFloors;
}

export interface FollowDeps {
  captureFrameHash: () => Promise<number[]>;
  captureScreenB64: () => Promise<{ imageBase64: string; mediaType: string }>;
  runFollowTurn: (args: {
    goal: string; history: string[]; imageBase64: string; mediaType: string;
    activeApp?: string; windowTitle?: string;
  }) => Promise<any>;
  runAckTurn: (completedStep: string) => Promise<string>;
  speak: (text: string) => Promise<void>;
  showPointer: (step: FollowStep) => void;
  fadePointer: () => void;
  armFollowClick: () => void;
  disarmFollowClick: () => void;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
  log: (level: string, msg: string, fields?: Record<string, unknown>) => void;
  cfg: FollowCfg;
}

export interface FollowController {
  state: FollowAlongState;
  start(goal: string, ctx: { activeApp?: string; windowTitle?: string }): Promise<void>;
  onClick(click: { x: number; y: number }): Promise<void>;
  onScreenMoved(): void;   // scroll / tab / window change → fade pointer, keep step
  stop(reason: string): void;
}

export function createFollowController(d: FollowDeps): FollowController {
  const state: FollowAlongState = {
    active: false, goal: '', history: [], currentStep: null, referenceHash: null,
  };
  let epoch = 0;               // bumped on stop / supersede
  let lastCtx: { activeApp?: string; windowTitle?: string } = {};

  function stop(reason: string) {
    epoch++;
    state.active = false;
    state.currentStep = null;
    state.referenceHash = null;
    d.disarmFollowClick();
    d.fadePointer();
    d.log('info', 'follow stopped', { reason });
  }

  async function planAndShow(myEpoch: number) {
    const hash = await d.captureFrameHash();
    const shot = await d.captureScreenB64();
    if (epoch !== myEpoch) return;
    const raw = await d.runFollowTurn({
      goal: state.goal, history: state.history,
      imageBase64: shot.imageBase64, mediaType: shot.mediaType,
      activeApp: lastCtx.activeApp, windowTitle: lastCtx.windowTitle,
    });
    if (epoch !== myEpoch) return;
    const step = parseFollowStep(raw);
    state.currentStep = step;
    state.referenceHash = hash;
    d.log('info', 'follow step', { expect: step.expect, wait: step.wait, status: step.status });

    if (step.status === 'done') {
      if (step.say) await d.speak(step.say);
      stop('done');
      return;
    }
    if (step.say) void d.speak(step.say); // speak in parallel with showing the pointer
    if (step.box) {
      d.showPointer(step);
      d.armFollowClick();
    } else {
      // observe step: no target, nothing to wait for → auto-flow to the next step
      state.history.push(step.say);
      await autoFlow(myEpoch);
    }
  }

  async function autoFlow(myEpoch: number) {
    // observe steps chain straight into the next plan (screen usually unchanged)
    if (epoch !== myEpoch || !state.active) return;
    await planAndShow(myEpoch);
  }

  async function settleThenPlan(myEpoch: number, wait: string) {
    // wait floor
    await d.sleep(waitFloorMs(wait as any, d.cfg.waitFloors));
    if (epoch !== myEpoch) return;
    // settle-diff loop (capped)
    let prev = await d.captureFrameHash();
    for (let i = 0; i < d.cfg.settleMaxIterations; i++) {
      await d.sleep(d.cfg.settlePollMs);
      if (epoch !== myEpoch) return;
      const cur = await d.captureFrameHash();
      if (!stillMoving(prev, cur, d.cfg.settleMovingBits)) break;
      prev = cur;
      if (i === d.cfg.settleMaxIterations - 1) {
        d.log('warn', 'settle cap hit — sending slightly-moving frame');
      }
    }
    if (epoch !== myEpoch) return;
    await planAndShow(myEpoch);
  }

  return {
    state,
    async start(goal, ctx) {
      epoch++;
      const myEpoch = epoch;
      state.active = true;
      state.goal = goal;
      state.history = [];
      lastCtx = ctx;
      d.log('info', 'follow start', { goal });
      await planAndShow(myEpoch);
    },

    async onClick(click) {
      const step = state.currentStep;
      if (!state.active || !step || step.expect !== 'click' || !step.box) return;
      if (!clickInBox(click, step.box, d.cfg.clickPadPt)) {
        d.log('debug', 'click outside box — ignored');
        return; // passive: do nothing
      }
      // screen-match guard: is the screen still the one we drew the pointer on?
      const nowHash = await d.captureFrameHash();
      if (!state.referenceHash || !sameScreen(state.referenceHash, nowHash, d.cfg.samescreenBits)) {
        d.log('debug', 'in-box click but screen changed — ignored');
        return; // they scrolled/navigated then clicked the same coordinate
      }
      // VALID: disarm, fade the old pointer, ack, settle, next step.
      // Bump epoch to supersede any stray in-flight settle/plan; stay active.
      const myEpoch = ++epoch;
      d.disarmFollowClick();
      d.fadePointer();
      const completed = step.say;
      state.history.push(completed);
      // ack (screen-blind) speaks immediately; failure → skip, never block
      void d.runAckTurn(completed).then((t) => { if (t && epoch === myEpoch) return d.speak(t); });
      await settleThenPlan(myEpoch, step.wait);
    },

    onScreenMoved() {
      if (!state.active || !state.currentStep) return;
      d.fadePointer(); // stale — hide the hint; keep the step + goal
      d.log('debug', 'screen moved — pointer faded, step kept');
    },

    stop,
  };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm run test -- followController`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/notch/followController.ts tests/followController.test.ts
git commit -m "feat(follow): reactive controller — settle loop, click gate, screen-match, ack→step"
```

### Task 5.2: nativeBridge wrappers

**Files:**
- Modify: `src/native/nativeBridge.ts`

- [ ] **Step 1: Add the command wrappers**

Mirror the existing `invoke` wrappers in `nativeBridge.ts`:

```ts
export async function captureFrameHash(): Promise<number[]> {
  const r = await invoke<{ hash: number[] }>('capture_frame_hash');
  return r.hash;
}
export async function runFollowTurn(input: {
  goal: string; history: string[]; imageBase64: string; mediaType: string;
  activeApp?: string; windowTitle?: string;
}): Promise<string> {
  return invoke<string>('run_follow_turn', { input });
}
export async function runAckTurn(completedStep: string): Promise<string> {
  return invoke<string>('run_ack_turn', { input: { completedStep } });
}
export async function armFollowClick(): Promise<void> { await invoke('arm_follow_click'); }
export async function disarmFollowClick(): Promise<void> { await invoke('disarm_follow_click'); }
```
Add these to the exported bridge object/namespace exactly as the file exposes the others (e.g. under the `nativeBridge` object). Also extend the existing `runGate` wrapper's return type to include `followAlong: boolean`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/native/nativeBridge.ts
git commit -m "feat(follow): nativeBridge wrappers for follow-along commands"
```

### Task 5.3: Wire the controller into NotchApp

**Files:**
- Modify: `src/notch/NotchApp.tsx`
- Modify: `src/notch/notchTutor.ts` (helpers, optional but keeps NotchApp lean)

This is integration; verified in Phase 6 (no unit test — needs the real app). Keep the diffs small and follow existing patterns (epoch checks, `klog`, `listen`).

- [ ] **Step 1: Build the `FollowDeps` from real bridges + notch primitives**

In `NotchApp.tsx`, construct the controller once (in a ref) with real deps:
- `captureFrameHash` → `nativeBridge.captureFrameHash`
- `captureScreenB64` → reuse the existing capture that yields the base64 + mediaType used by the tutor turn (the same value fed to `run_tutor_turn`; see `capturedScreenRef`/`processCapturedAudio`).
- `runFollowTurn` → `nativeBridge.runFollowTurn` then `JSON.parse`
- `runAckTurn` → `nativeBridge.runAckTurn`
- `speak` → `createStreamingClip(nativeBridge, text, STEP_SYNTH_TIMEOUT_MS)` played on a **dedicated follow-along clip slot** (a new ref, NOT `answerAudioRef`) so it doesn't fight the turn's filler/answer clip.
- `showPointer(step)` → route `step.visualTargets` to the overlay + cursor via the existing `routeVisualTargets` (as `revealStep` does in `notchTutor.ts`), keeping the cursor in `pointing` mode so auto-hide doesn't fire. Use `transition: 'draw'` for the first, `'glide'` thereafter (mirror `playSteps`).
- `fadePointer` → `nativeBridge.hideOverlay()` + `nativeBridge.cursorRelease()`.
- `armFollowClick`/`disarmFollowClick` → the new bridges.
- `sleep` → a promise `setTimeout`.
- `now` → `Date.now`.
- `log` → `klog` bound to the `'follow'` subsystem.
- `cfg` → from `env.ts` follow-along values.

- [ ] **Step 2: Route the gate's `followAlong` into the controller**

In `submitQuery`, after the gate returns (voice path), if `gate.followAlong` is true: speak the gate `voiceText` filler as today (entry ack — unchanged), then instead of the normal vision turn, call `followControllerRef.current.start(query, { activeApp, windowTitle })`. The controller does its own capture + `run_follow_turn`. Do NOT also run the normal `askTutorFromNotch` path for this turn.

- [ ] **Step 3: Subscribe to `input:click`**

Add a `listen('input:click', (e) => followControllerRef.current.onClick(e.payload as {x:number;y:number}))` alongside the other `listen(...)` calls (near `context:changed`). It is a no-op unless the controller is active with a click-step (the controller guards internally).

- [ ] **Step 4: Fade on material change; keep follow state across voice turns**

- In the existing `context:changed` handler, if the controller is active, also call `followControllerRef.current.onScreenMoved()` (fades the pointer, keeps the step) INSTEAD of the full teardown that clears follow state. Keep the normal teardown when follow is inactive.
- In `submitQuery`, the existing turn-start teardown (`stopAnswerPlayback`, `cursorRelease`, `hideOverlay`) is fine — it drops the *pointer*, but must NOT clear the controller's `followAlong` state. Ensure the follow controller state lives in the ref (outside React re-render teardown) and survives. When a voice turn happens mid-follow-along, inject follow context (goal + history) into the gate/tutor input (extend `buildRecentContext` or pass an extra field) so the model stays goal-aware; after answering, if still active, the controller keeps its current step (re-show pointer if the screen still matches, via `onScreenMoved`'s inverse — a `reshowIfMatches()` you can add, or simply let the next click re-validate).

- [ ] **Step 5: Idle fade (30s)**

When a click-step pointer is shown and no click/voice arrives within `pointerIdleFadeMs`, fade the pointer (goal stays dormant). Implement as a timer in the controller's `showPointer` path (add a `scheduleIdleFade`/`clearIdleFade` using `d.sleep` + epoch check), or a `setTimeout` in NotchApp keyed to the controller. Keep it in the controller for testability if convenient; otherwise a NotchApp timer is acceptable for v1.

- [ ] **Step 6: Typecheck + build + smoke**

Run: `npm run typecheck` (expected pass), then `npm run app` (build + launch the signed app).

- [ ] **Step 7: Commit**

```bash
git add src/notch/NotchApp.tsx src/notch/notchTutor.ts
git commit -m "feat(follow): wire follow-along controller into the notch turn flow"
```

---

## Phase 6 — Integration, coordinate verification, manual QA

No unit tests here — the real app is the target. Test with the packaged build.

### Task 6.1: Coordinate-space verification (the one risky native bit)

**Files:** none (verification), possibly `src-tauri/src/input.rs` if a conversion is needed.

- [ ] **Step 1: Run with follow-along and a known click**

Run `npm run app`. Trigger follow-along (say "walk me through …" at a screen with an obvious button). When the pointer shows, click the button. `tail -F ~/Library/Logs/Kairo/kairo-latest.log`.

- [ ] **Step 2: Compare the emitted click to the box**

In the logs, find the `emit input:click x=… y=…` line and the follow step's box region. Confirm the click coordinates fall inside the box region (both should be display points on the main display).

- [ ] **Step 3: If they don't match → add conversion**

If the click is off by the display scale factor (e.g. 2×), the CGEvent location is in pixels, not points — divide by `main_display_bounds().scale_factor` in `input.rs` before emitting, and re-verify. Commit the fix:
```bash
git add src-tauri/src/input.rs
git commit -m "fix(follow): convert click coords to display points"
```

### Task 6.2: Capture-poisoning check

- [ ] **Step 1: Confirm the settle loop settles**

With `SHOW_IN_CAPTURE=true` (dev default), run a follow-along step whose action triggers a page load. Watch the `follow` logs for the settle loop. If it hits `settle cap hit` every time (Kairo's own animation keeps the frame "moving"), rebuild with `KAIRO_SHOW_IN_CAPTURE=false`:
```bash
osascript -e 'tell application "Kairo Tutor" to quit'
KAIRO_SHOW_IN_CAPTURE=false npm run tauri:build -- --bundles app && open "src-tauri/target/release/bundle/macos/Kairo Tutor.app"
```
Confirm the settle loop now converges (breaks before the cap on a settled page). Document this in the spec's testing note if not already (it is).

- [ ] **Step 2: Confirm the old pointer is hidden before settle captures**

Verify in logs that `fadePointer` (hideOverlay + cursorRelease) is called at the valid click, BEFORE the settle captures begin — so the settle frames are clean.

### Task 6.3: Happy path — GitHub "create a PR"

- [ ] **Step 1: Walk the flow**

On a GitHub repo page, say "walk me through opening my first PR." Follow each pointer: open a file → edit → commit → create PR → merge. Confirm at each action: ack speaks fast, the settle loop catches the merge-button load (no stale/loading screenshot sent to Fable), the next step points correctly, and the ack never claims a screen result.

### Task 6.4: Unhappy paths

- [ ] **Step 1: Scroll-then-click-same-coordinate** — after a pointer shows, scroll the page, then click the (now different) content at the old pointer location. Confirm: NO ack, NO advance (screen-match guard rejects it), and the pointer faded on the scroll.
- [ ] **Step 2: Do something else entirely** — click a totally unrelated area. Confirm: nothing happens, pointer stays (if screen unchanged) or fades (if it changed).
- [ ] **Step 3: Talk mid-follow-along** — hold ⌥⌃ and ask an unrelated question. Confirm: normal answer, follow-along survives (goal/history intact), and you can resume.
- [ ] **Step 4: Wander to another app** — switch apps mid-step. Confirm: pointer fades + a soft "I'll wait…" (if implemented) and on return the guide continues.
- [ ] **Step 5: Idle 30s** — do nothing. Confirm the pointer fades and a later follow-up can still reference the goal.

### Task 6.5: Full verification sweep + commit

- [ ] **Step 1: Run the full suite**

Run:
```bash
npm run typecheck
npm run test
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml framehash
```
Expected: all green.

- [ ] **Step 2: Final build**

Run: `npm run app -- --check` (typecheck + tests + cargo check, then build + launch).

- [ ] **Step 3: Commit any QA fixes**

```bash
git add -A
git commit -m "test(follow): manual QA fixes for follow-along guide mode"
```

---

## Deferred / follow-ups (not in this plan)

- In-process capture (ScreenCaptureKit / `CGDisplayCreateImage`) if the `screencapture` CLI cadence in the settle loop proves too slow.
- Circle-for-`click` / box-for-`observe` overlay visual (from `competitor_notes.txt`).
- Keystroke/`type` and precise `scroll` expect-types.
- Multi-monitor geometry.
- Live AX-element re-anchoring (the "north-star" that keeps a pointer glued to scrolling content).
```
