# Project Learnings

> Managed by `/learn`. Append-only - latest entry wins on conflicts.

## Patterns

(entries here)

## Pitfalls

### macos-native-capability-permissions
- **Insight:** Before UI work for any new macOS native capability, update `Info.plist`, add required entitlements, document TCC reset/test notes, and verify the signed app with `codesign -d --entitlements :- path/to/Kairo\ Tutor.app`.
- **Confidence:** 10/10
- **Source:** tauri-v2
- **Files:** README.md, src-tauri/Info.plist, src-tauri/Entitlements.plist, src-tauri/tauri.conf.json
- **Date:** 2026-06-22

## Preferences

### tauri-through-next-milestone
- **Insight:** Stick with Tauri through the next milestone unless a verified WebKit/WKWebView blocker appears.
- **Confidence:** 8/10
- **Source:** tauri-v2
- **Files:** README.md, src-tauri/tauri.conf.json
- **Date:** 2026-06-22

## Architecture

(entries here)

## Tools

(entries here)
