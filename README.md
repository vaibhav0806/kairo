# Kairo Tutor

Kairo Tutor is a Mac-first, screen-native AI tutor for practical software labs. It helps students learn complex tools by listening to their question, understanding the current screen, and guiding them one step at a time with voice and visual cues.

The product principle is:

> The AI points. The user acts.

## Source Of Truth

This repo has two primary source-of-truth files:

- [FEATURE.md](./FEATURE.md): product vision, target users, MVP scope, roadmap, UX principles, safety principles, and success metrics.
- [README.md](./README.md): current implementation architecture, setup, commands, provider choices, and engineering rules.

Supporting files such as [plan.md](./plan.md) and [docs/clicky-borrowing-notes.md](./docs/clicky-borrowing-notes.md) are useful working documents, but if they conflict with `FEATURE.md` or `README.md`, update the supporting document. Product direction belongs in `FEATURE.md`; implementation truth belongs here.

## Current Architecture

The current implementation has three layers:

```text
React/Vite frontend
  - Tutor shell UI
  - Mock Blender tutoring loop
  - Native bridge with browser-safe fallback

Tauri desktop shell
  - macOS app wrapper
  - Rust command surface
  - Active app metadata
  - First-pass permission status
  - ScreenCaptureKit screen capture

Provider utilities
  - OpenRouter chat client
  - Sarvam voice env contract
  - Local provider smoke test
```

There is no separate deployed backend yet.

The current `src/server/` folder is not a running backend service. It contains server-side/provider-safe code that should not be shipped as browser-only logic. The current provider smoke test runs locally from Node.

The likely production backend shape is a small proxy service, probably Cloudflare Worker or similar, that stores provider secrets and exposes narrow routes for:

- OpenRouter chat/vision planning
- Sarvam speech-to-text
- Sarvam text-to-speech

Until that backend exists, do not put provider secrets into browser-exposed env variables.

## Product Scope

The first product wedge is:

> AI lab assistant for creative software institutes.

The first strong demo is:

> A student opens Blender, asks “Help me make my first animation,” and the tutor guides them with voice, highlights, and a ghost cursor.

Early scope:

- Mac-first desktop app
- Global activation
- Voice input and output
- Screen capture
- Active app detection
- Visual overlay guidance
- User annotation
- Blender skill pack
- Step-by-step guided lesson loop

Out of early scope:

- Autonomous clicking
- Full LMS
- Course marketplace
- Ten-tool support
- Enterprise compliance stack
- Windows before the Mac product loop works

## Tech Stack

- TypeScript
- React
- Vite
- Vitest
- Tauri v2
- Rust
- OpenRouter for model routing
- Sarvam for speech-to-text and text-to-speech

## Providers

Model routing:

```env
KAIRO_AI_PROVIDER=openrouter
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=qwen/qwen3.6-flash
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Voice:

```env
KAIRO_STT_PROVIDER=sarvam
KAIRO_TTS_PROVIDER=sarvam
SARVAM_API_KEY=...
SARVAM_STT_MODEL=saaras:v3
SARVAM_STT_MODE=transcribe
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TTS_LANGUAGE_CODE=en-IN
SARVAM_TTS_SPEAKER=shubh
```

Local UI development can use mock providers:

```env
KAIRO_AI_PROVIDER=mock
KAIRO_STT_PROVIDER=mock
KAIRO_TTS_PROVIDER=mock
```

Only `KAIRO_*` values should be exposed to the browser bundle. Provider keys must stay in local env files, native secure storage, or a backend/proxy.

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` with local provider values when needed. `.env.local` is ignored by git.

## Commands

Run browser dev shell:

```bash
npm run dev
```

Run desktop dev shell:

```bash
npm run tauri:dev
```

Build frontend:

```bash
npm run build
```

Build macOS app bundle:

```bash
npm run tauri:build -- --bundles app
```

Test providers:

```bash
npm run smoke:providers
```

Verify repo:

```bash
npm test
npm run typecheck
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:build -- --bundles app
npm audit --audit-level=moderate
```

## Current Native Commands

The frontend calls native functionality through [src/native/nativeBridge.ts](./src/native/nativeBridge.ts). Browser mode returns safe fallback values.

Tauri commands:

- `get_active_app`: returns frontmost macOS app name, bundle id, and front window title when available.
- `get_permission_status`: returns screen/accessibility permission probes and microphone state where the WebView permission API is available.
- `capture_screen`: blocks sensitive apps locally, captures a PNG through ScreenCaptureKit, excludes Kairo windows when macOS exposes them, and returns base64 image metadata plus display bounds/scale.

Pending native work:

- Customizable shortcut settings

## Project Structure

```text
src/
  App.tsx
  config/env.ts
  core/
  native/nativeBridge.ts
  server/providers/openRouter.ts

src-tauri/
  src/lib.rs
  src/main.rs
  tauri.conf.json
  capabilities/
  icons/

skills/blender/
  skill.md
  ui_landmarks.json
  workflows.yaml
  troubleshooting.yaml
  glossary.yaml
  version_notes.md
  safety_rules.yaml

scripts/
  smoke-providers.mjs
```

## Engineering Rules

- Keep `FEATURE.md` product-facing and durable.
- Keep this README current when architecture, setup, commands, providers, or native capabilities change.
- Keep secrets out of git and out of browser-exposed env.
- Prefer narrow, testable modules over a single large app manager.
- Use Clicky as a native Mac reference, not as the architecture to copy wholesale.
- Preserve the learning principle: the tutor guides and points; the learner acts.
- Stick with Tauri through the next milestone unless a verified WebKit/WKWebView blocker appears.
- Before UI work for any new macOS native capability, update `Info.plist`, add required entitlements, document TCC reset/test notes, and verify the signed app with `codesign -d --entitlements :- path/to/Kairo\ Tutor.app`.
