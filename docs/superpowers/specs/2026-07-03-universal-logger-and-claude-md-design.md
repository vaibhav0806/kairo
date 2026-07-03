# Universal Non-Blocking Logger + CLAUDE.md — Design

Date: 2026-07-03
Status: Approved for planning

## 1. Problem & Context

Kairo is a macOS Tauri app run as a **packaged `.app`** (`npm run tauri:build -- --bundles app`, launched via `open …/Kairo Tutor.app`). All diagnostics today go to **stderr**:

- Rust `src-tauri/src/` (recently split into focused modules — `lib.rs`, `audio.rs`, `input.rs`, `grounding.rs`, `tutor.rs`, `speech.rs`, `panels.rs`, …): ~24 `eprintln!`/`println!` with ad-hoc prefixes (`[ptt-timing]`, `[boxes]`, `[gate]`, `[fe-diag]`). No `log`/`tracing` crate.
- Frontend (TS/React, 4 WebViews — notch/overlay/cursor/activation): zero `console.*`; already funnels through a `debugLog()` bridge → `debug_log` Tauri command → `eprintln!("[fe-diag] …")`.

When the packaged `.app` is launched via `open`, stderr is not captured anywhere readable. **The logs are invisible in the exact flow the developer uses.** Result: no persistent, universal record of what each subsystem did.

## 2. Goals & Non-Goals

**Goals**
- One **universal** logger covering every subsystem, Rust + all frontend WebViews, writing to a **persistent file on disk** that survives runs and is easy to `tail`/read.
- Audience = **developers only** (this app never ships to end users in this form). Serves both **debugging** and **telemetry** (latencies, sizes, provider/model, state transitions, errors).
- **Zero measurable impact on app performance.** This is the hard constraint (see §3).
- A **`CLAUDE.md`** at repo root that (a) documents the repo overall — project, folder structure, build/run rules, providers/env, testing — and (b) mandates that every future change adds logging through this logger.

**Non-Goals**
- No remote/cloud upload, no telemetry backend, no crash-reporting SaaS. File-on-disk only.
- No user-facing log UI.
- No size-based rotation tuning beyond daily rotation + keep-N (simple is fine for dev).
- No rewrite of `lib.rs` structure; we add a logging module and retrofit call-sites in place.

## 3. Hard Constraint: Non-Blocking (perf)

**Hot threads must never do file I/O or log formatting on their own thread.** The audio input callback (`cpal`), vision/grounding calls, the PTT/event-tap runloop, cursor tracking, and the UI/IPC path all run on latency-sensitive threads.

Rule: a log call on a hot thread does the cheapest possible thing (hand a message to a bounded, in-memory channel) and returns. A **dedicated background writer thread** owns all formatting + file writes. If the channel is full, the logger **drops** the message (and counts drops) rather than block.

This is provided out of the box by `tracing-appender`'s `non_blocking` writer (lossy mode = drop-on-full, tracks dropped count). We keep lossy mode ON.

## 4. Rust Architecture

### 4.1 Stack
- `tracing = "0.1"` — facade (macros, spans, fields).
- `tracing-subscriber = { version = "0.3", features = ["env-filter", "fmt"] }` — filtering + formatting.
- `tracing-appender = "0.2"` — non-blocking rolling file writer.

### 4.2 New module: `src-tauri/src/klog.rs` (or an inline `mod klog` if a separate file complicates the single-crate build)
Responsibilities:
- `klog::init()` — build the subscriber once, at the very start of app setup, before any subsystem starts. Returns/stores the `WorkerGuard` (see §4.5).
- A thin `klog!` macro family enforcing the **subsystem-tag convention** so call-sites are ergonomic and consistent, and CLAUDE.md can say "use `klog!`, never `eprintln!`".
- `klog::timer(subsystem, op)` — RAII timing guard (see §4.6).
- Redaction helpers (see §4.7).

### 4.3 Macro shape
```
klog!(vision, info, "boxes", count = boxes.len(), ms = elapsed_ms);
// expands to:
tracing::info!(target: "vision", count = boxes.len(), ms = elapsed_ms, "boxes");
```
- First arg = subsystem (becomes the tracing `target`, a `'static` string).
- Second arg = level (`error|warn|info|debug|trace`).
- Then a message literal + structured `key = value` fields.
- Subsystems (initial set): `mic`, `audio`, `vision`, `grounding`, `ptt`, `cursor`, `gate`, `tts`, `stt`, `screen`, `overlay`, `notch`, `activation`, `providers`, `app` (lifecycle/startup), `frontend` (see §5).

### 4.4 Sinks
- **File sink (always on):** `tracing-appender` rolling **daily** file in the log dir, wrapped in `non_blocking` (lossy). Format: plaintext, one line per event.
- **Stderr sink (opt-in):** a second `fmt` layer to stderr, enabled only when `KAIRO_LOG_STDERR=true` (default OFF — packaged-app-via-`open` has no useful stderr, and we avoid any chance of a blocking stderr write on a hot path). Dev-in-terminal users flip it on.

### 4.5 Log file location, rotation, lifecycle
- Directory: **`~/Library/Logs/Kairo/`** (standard macOS location; survives rebuilds; `identifier` is `com.kairo.tutor`). Create on init.
- Filenames: `kairo.YYYY-MM-DD.log` via `RollingFileAppender` daily rotation, `max_log_files(7)` (keep last 7).
- Convenience: on init, best-effort create/refresh a symlink `kairo-latest.log → kairo.<today>.log` so there's a stable path to `tail`. Failure to symlink is non-fatal.
- **Robustness:** if the log dir can't be created/opened, fall back to the system temp dir; if that fails, degrade to stderr-only. **The logger must never panic or crash the app.**
- The `WorkerGuard` returned by `non_blocking` must live for the whole process (flushes on drop). Store it in a process-lifetime holder (a `static OnceCell<WorkerGuard>` or Tauri managed state that lives as long as the app). Losing the guard early would drop buffered logs.

### 4.6 Line format
Plaintext, greppable, structured fields as `key=value`:
```
2026-07-03T12:00:01.234Z INFO  [vision] boxes count=3 ms=812 model=claude-opus-4-8
2026-07-03T12:00:02.500Z WARN  [mic] stream restart reason="device changed"
2026-07-03T12:00:03.001Z ERROR [gate] turn failed err="timeout after 8000ms"
```
Fields are structured (via tracing) so a JSONL sink is a one-line swap later if telemetry ever needs machine parsing. No JSONL now.

### 4.7 What to log + redaction
Log freely: subsystem, event, **latencies** (`ms=`), sizes (`bytes=`, `px=`, `count=`), provider + model names, error messages, state transitions, key lifecycle events.

**Never log** raw media or secrets. Redact to metadata:
- audio → `audio_bytes=48000` (never PCM samples).
- screenshot → `screenshot=1280x800 jpeg bytes=63210` (never pixels/base64).
- transcripts → `transcript_len=214` by default; full text only when `KAIRO_LOG_TRANSCRIPTS=true` (dev-only escape hatch).
- API keys / auth headers → never; log provider name only.

Redaction helpers live in `klog` so call-sites format media/secrets safely by construction.

### 4.8 Levels + runtime control
- Levels: `ERROR / WARN / INFO / DEBUG / TRACE`.
- Our subsystems log under `kairo::<subsystem>` targets so one directive controls them all without drowning in dependency internals.
- Filtering via `EnvFilter` from a **`KAIRO_LOG`** env var (RUST_LOG-style). Default when unset: **`info,kairo=debug`** (deps quiet at INFO, all Kairo steps at DEBUG).
- Overrides: `KAIRO_LOG=kairo=trace` (our code, max detail), `KAIRO_LOG=debug` (everything incl. deps), `KAIRO_LOG=info,kairo::vision=trace,kairo::mic=warn` (per-subsystem).
- Loaded from process env, consistent with existing `.env`/`.env.local` walk-up loading.

### 4.9 Timing spans (telemetry half)
Provide `let _t = klog::timer("vision", "grounding_call");` — an RAII guard that logs `<op> ms=…` at DEBUG when dropped (works across `.await` when held in scope). Instrument the key round-trips: gate turn, vision/grounding call, tutor turn, tts, stt, screen capture. Gives automatic "what's slow" data with near-zero code.

### 4.10 Init ordering
`klog::init()` is the **first thing** in the Tauri `setup`/`run` path, before mic/PTT/cursor/panels start, so no subsystem logs before the subscriber exists. `.env`/`.env.local` must be loaded before init if `KAIRO_LOG*` are read from there (match current env-load order; if env load happens later, read `KAIRO_LOG` directly from process env at init and accept dotenv-provided values are applied at their existing point).

## 5. Frontend Architecture

### 5.1 New module: `src/core/logger.ts`
- `klog(subsystem, level, message, fields?)` — the single frontend entry point.
- **Batches** lines in an in-memory queue; flushes every ~250ms OR when queue hits ~20 lines OR on `pagehide`/`beforeunload`, via a single IPC call. Avoids one IPC per log line (perf).
- Each line carries `{ level, subsystem, webview, message, fields }` where `webview ∈ {notch, overlay, cursor, activation}` (detected from the entry point / route).

### 5.2 Error auto-capture
Each WebView entry (`main.tsx` and the per-panel roots) installs `window.onerror` + `unhandledrejection` handlers that call `klog('frontend','error', …)`. Catches crashes that would otherwise vanish. (We do NOT monkey-patch `console.*` — there are zero `console.*` call-sites today, so no value.)

### 5.3 Rust bridge
- Extend the native bridge: add `debug_log_batch(lines: Vec<FeLogLine>)` Tauri command; keep `debug_log` as a thin single-line wrapper (back-compat) or route it through the batch path.
- Rust maps each `FeLogLine` to a tracing event with `target: "frontend"` and fields `webview=…`, `sub=…`, plus the message. Frontend lines land in the **same file**, interleaved, filterable via `KAIRO_LOG=frontend=debug`.
- `target` is the fixed `"frontend"` (tracing targets must be `'static`); the frontend's own subsystem name rides as a `sub=` field.

## 6. Retrofit Scope (first pass)

Convert existing sites so "universal" is true on day one:
- All ~24 `eprintln!`/`println!` across the modules → `klog!` with the right subsystem + level. Map existing prefixes: `[ptt-timing]`→`ptt`, `[boxes]`/`[boxes-diag]`→`grounding`, `[gate]`→`gate`, `[fe-diag]`→`frontend`, mic/audio format lines → `mic`/`audio`, startup/window lines → `app`.
- Upgrade the `debug_log` bridge + `nativeBridge.ts` `debugLog()` to the batched `klog` path (§5).
- Add timing guards to the key provider round-trips (§4.9).

## 7. CLAUDE.md (repo root)

A full repo guide, not just logging. Sections:
1. **Project** — screen-native AI tutor for software labs; macOS Tauri app; notch panel + full-screen annotation overlay + companion cursor.
2. **Architecture / folder map** —
   - `src/` frontend WebViews & logic: `notch/`, `overlay/`, `cursor/`, `activation/`, `core/` (orchestrator, runtimePlanner, skills, types), `server/providers/` (elevenLabs, openRouter, sarvam, tutorPlanner), `native/nativeBridge.ts`, `config/env.ts`.
   - `src-tauri/src/lib.rs` — native macOS: NSPanels/windows, mic capture (cpal), screen capture, vision/grounding, PTT + event taps, cursor tracking, gate, provider HTTP calls, all Tauri commands.
   - `docs/`, `scripts/`, `tests/`.
3. **Build/run rules** (from project memory) — NEVER `dev`; build packaged `.app` via `npm run tauri:build -- --bundles app`; launch via `open …/Kairo Tutor.app`; dev port 5273; stable self-signed "Kairo Tutor Local Dev" cert (TCC grants persist); `.env`/`.env.local` walk-up loading; notch = non-activating NSPanel.
4. **Providers + env** — `KAIRO_*` flags and provider keys (AI/STT/TTS/grounding), where they load from.
5. **Logging rules (mandate)** — the non-blocking logger; **use `klog!` (Rust) / `klog()` (frontend), never bare `eprintln!`/`println!`/`console.*`**; always tag a subsystem; log every new step, state transition, and error path with latencies/sizes; **never log secrets or raw media** (audio/screenshot/full transcript) — metadata only; how to read logs (`tail -f ~/Library/Logs/Kairo/kairo-latest.log`), `KAIRO_LOG` filtering, `KAIRO_LOG_STDERR`, `KAIRO_LOG_TRANSCRIPTS`.
6. **Testing / verification** — `npm run typecheck`, `npm run test` (vitest), `cargo check --manifest-path src-tauri/Cargo.toml`, `npm run tauri:build -- --bundles app`, `npm run smoke:providers`.
7. **Conventions** — keep cross-platform in mind (Windows is a future target); no unrelated refactors.

## 8. Testing / Verification

- **Rust:** `cargo check` compiles with the new deps + `klog` module. A packaged `.app` run produces `~/Library/Logs/Kairo/kairo-<today>.log` with lines from multiple subsystems; frontend lines appear with `[frontend] webview=…`. Verify a forced error path lands as `ERROR`. Confirm `KAIRO_LOG=warn` suppresses INFO/DEBUG.
- **Perf sanity:** logging on the audio callback / vision path shows no added latency (non-blocking channel; timer fields let us see call durations unchanged). Confirm lossy drop-count is logged if it ever triggers.
- **Frontend:** existing `nativeBridge` tests updated for the batched bridge; a unit test that `klog()` batches and flushes on threshold/interval and that `window.onerror` routes through it.
- Full green: `npm run typecheck && npm run test && cargo check … && npm run tauri:build -- --bundles app`.

## 9. Open Questions

None blocking. Two minor defaults chosen (revisit if wrong): daily rotation + keep-7 instead of size-cap; stderr sink default OFF.
