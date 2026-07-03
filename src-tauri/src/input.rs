//! Global input watchers: the context-reset poll + scroll/click tap that clear
//! stale guidance when the user moves on, and the ⌥⌃ push-to-talk tap.

use crate::audio::send_audio_command;
use crate::panels::{listening_notch_payload, show_notch_with_payload, typing_notch_payload};
use crate::platform::{frontmost_bundle_id, frontmost_window_title};
use crate::{AudioCommand, ContextWatch, NotchState};
use std::sync::atomic::Ordering;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};

// Below this hold time, a ⌥⌃ press is a "tap" (→ open typing); at/above it, a
// "hold" (→ push-to-talk). The 250ms build of the cpal stream overlaps this
// window, so a confirmed hold already has a live mic.
pub(crate) const PTT_TAP_MAX_MS: u64 = 250;

#[derive(Debug, PartialEq, Eq)]
pub(crate) enum PttOutcome {
    Tap,
    Hold,
}

pub(crate) fn classify_press(held: Duration, tap_max_ms: u64) -> PttOutcome {
    if held < Duration::from_millis(tap_max_ms) {
        PttOutcome::Tap
    } else {
        PttOutcome::Hold
    }
}

const KAIRO_BUNDLE_ID: &str = "com.kairo.tutor";
// Ignore activity for the first moment after arming so the reveal itself (or the
// click/key that triggered the ask) never counts as "the user moved on".
const CONTEXT_SETTLE_MS: u64 = 500;

// True only when armed AND past the settle window — the single gate every watcher
// checks before firing.
fn context_watch_settled(watch: &ContextWatch) -> bool {
    if !watch.armed.load(Ordering::SeqCst) {
        return false;
    }
    watch
        .armed_at
        .lock()
        .ok()
        .and_then(|guard| *guard)
        .map(|at| at.elapsed() >= Duration::from_millis(CONTEXT_SETTLE_MS))
        .unwrap_or(false)
}

// Disarm and tell the notch exactly once per armed session. `swap` makes it
// one-shot even if the poll and the input tap fire in the same instant.
fn fire_context_reset(app: &tauri::AppHandle, watch: &ContextWatch, reason: &str) {
    if watch.armed.swap(false, Ordering::SeqCst) {
        let _ = app.emit("context:changed", reason.to_string());
    }
}

// Low-frequency poll (only costs anything while armed) that catches app switches
// and tab/page changes: the frontmost bundle id changing, or the front window
// title changing within the same app. Covers keyboard-driven switches (Cmd+Tab,
// Cmd+number) that the input tap deliberately doesn't listen for.
pub(crate) fn spawn_context_poll(app: &tauri::AppHandle, watch: ContextWatch) {
    let app = app.clone();
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(450));
        if !context_watch_settled(&watch) {
            continue;
        }
        let Some((base_bundle, base_title)) =
            watch.baseline.lock().ok().and_then(|guard| guard.clone())
        else {
            continue;
        };
        let cur_bundle = frontmost_bundle_id().unwrap_or_default();
        // Our own non-activating panels shouldn't take frontmost, but never let
        // Kairo's own UI count as the user switching away.
        if cur_bundle == KAIRO_BUNDLE_ID {
            continue;
        }
        let switched_app =
            !base_bundle.is_empty() && !cur_bundle.is_empty() && cur_bundle != base_bundle;
        if switched_app {
            fire_context_reset(&app, &watch, "app-switch");
            continue;
        }
        let cur_title = frontmost_window_title().unwrap_or_default();
        let changed_title =
            !base_title.is_empty() && !cur_title.is_empty() && cur_title != base_title;
        if changed_title {
            fire_context_reset(&app, &watch, "window-change");
        }
    });
}

// Listen-only global event tap for scroll + mouse-down (NOT mouse-moved, so
// moving toward the target is never a reset, and NOT keyDown, so this needs only
// the Accessibility grant Kairo already has — no Input Monitoring prompt). If the
// tap can't be created it degrades gracefully; the poll above still covers
// app/tab switches.
pub(crate) fn spawn_context_input_tap(app: &tauri::AppHandle, watch: ContextWatch) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{
        CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement, CGEventType,
        CallbackResult,
    };

    let app = app.clone();
    std::thread::spawn(move || {
        let tap = CGEventTap::new(
            CGEventTapLocation::Session,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            vec![
                CGEventType::ScrollWheel,
                CGEventType::LeftMouseDown,
                CGEventType::RightMouseDown,
                CGEventType::OtherMouseDown,
            ],
            move |_proxy, _event_type, _event| {
                if context_watch_settled(&watch) {
                    fire_context_reset(&app, &watch, "input");
                }
                // Listen-only: never modify the event stream, always keep the event.
                CallbackResult::Keep
            },
        );
        let Ok(tap) = tap else {
            crate::klog!(input, warn, "event tap unavailable; scroll/click reset disabled (app/tab switch reset still works)");
            return;
        };
        // Standard CGEventTap → CFRunLoop wiring. run_current() blocks this
        // dedicated thread for the process lifetime, keeping the tap alive.
        unsafe {
            let Ok(source) = tap.mach_port().create_runloop_source(0) else {
                crate::klog!(input, error, "failed to create event-tap runloop source");
                return;
            };
            CFRunLoop::get_current().add_source(&source, kCFRunLoopCommonModes);
            tap.enable();
            CFRunLoop::run_current();
        }
    });
}

// Separate listen-only tap for the ⌥⌃ push-to-talk chord (FlagsChanged). Kept apart
// from the mouse/scroll tap on purpose: keyboard-class taps can require the separate
// macOS "Input Monitoring" grant, so if THIS tap can't be created, PTT is simply
// disabled while the mouse/scroll reset tap keeps working untouched.
pub(crate) fn spawn_ptt_tap(app: &tauri::AppHandle, watch: ContextWatch) {
    use core_foundation::runloop::{kCFRunLoopCommonModes, CFRunLoop};
    use core_graphics::event::{
        CGEventFlags, CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement,
        CGEventType, CallbackResult,
    };

    let app = app.clone();
    std::thread::spawn(move || {
        let tap = CGEventTap::new(
            CGEventTapLocation::Session,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            vec![CGEventType::FlagsChanged],
            move |_proxy, _event_type, event| {
                let flags = event.get_flags();
                let both = flags.contains(CGEventFlags::CGEventFlagAlternate)
                    && flags.contains(CGEventFlags::CGEventFlagControl);
                let was = watch.ptt_active.load(Ordering::SeqCst);

                if both && !was {
                    // Chord DOWN. Start capturing immediately (the ~200ms cpal build overlaps
                    // the tap/hold window). Stay visually quiet until the promote timer.
                    watch.ptt_active.store(true, Ordering::SeqCst);
                    let press_id = watch.ptt_generation.fetch_add(1, Ordering::SeqCst) + 1;
                    if let Ok(mut guard) = watch.ptt_down_at.lock() {
                        *guard = Some(Instant::now());
                    }
                    crate::klog!(ptt, info, press = press_id, "⌥⌃ down");
                    send_audio_command(&app, AudioCommand::Start(Instant::now()));

                    // Promote to "listening" only if still held after the tap window AND this is
                    // still the same press (generation unchanged).
                    let app_promote = app.clone();
                    let watch_promote = watch.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(Duration::from_millis(PTT_TAP_MAX_MS));
                        if watch_promote.ptt_active.load(Ordering::SeqCst)
                            && watch_promote.ptt_generation.load(Ordering::SeqCst) == press_id
                        {
                            crate::klog!(ptt, info, press = press_id, "hold confirmed → listening");
                            let _ = app_promote.emit("cursor:listening", ());
                            let _ = app_promote
                                .emit("ptt:recording", serde_json::json!({ "active": true }));
                            let app_main = app_promote.clone();
                            let _ = app_promote.run_on_main_thread(move || {
                                let notch_state = app_main.state::<NotchState>();
                                if let Err(error) = show_notch_with_payload(
                                    &app_main,
                                    notch_state.inner(),
                                    Some(listening_notch_payload()),
                                ) {
                                    crate::klog!(ptt, error, "failed to show notch: {error}");
                                }
                            });
                        }
                    });
                } else if !both && was {
                    // Chord UP. Invalidate any pending promote, measure duration, classify.
                    watch.ptt_active.store(false, Ordering::SeqCst);
                    watch.ptt_generation.fetch_add(1, Ordering::SeqCst);
                    let held = watch
                        .ptt_down_at
                        .lock()
                        .ok()
                        .and_then(|guard| *guard)
                        .map(|at| at.elapsed())
                        .unwrap_or_default();
                    // Recording truth is now false regardless of branch.
                    let _ = app.emit("ptt:recording", serde_json::json!({ "active": false }));

                    match classify_press(held, PTT_TAP_MAX_MS) {
                        PttOutcome::Tap => {
                            crate::klog!(ptt, info, ms = held.as_millis(), "tap → typing");
                            send_audio_command(&app, AudioCommand::Cancel);
                            let app_main = app.clone();
                            let _ = app.run_on_main_thread(move || {
                                let notch_state = app_main.state::<NotchState>();
                                if let Err(error) = show_notch_with_payload(
                                    &app_main,
                                    notch_state.inner(),
                                    Some(typing_notch_payload()),
                                ) {
                                    crate::klog!(ptt, error, "failed to show typing notch: {error}");
                                }
                                let _ = app_main.emit("notch:focus-input", ());
                            });
                        }
                        PttOutcome::Hold => {
                            crate::klog!(ptt, info, ms = held.as_millis(), "hold → send");
                            send_audio_command(&app, AudioCommand::Stop);
                            let _ = app.emit("cursor:thinking", ());
                        }
                    }
                }
                CallbackResult::Keep
            },
        );
        let Ok(tap) = tap else {
            crate::klog!(
                ptt,
                warn,
                "tap unavailable; grant Input Monitoring + relaunch to enable ⌥⌃"
            );
            return;
        };
        unsafe {
            let Ok(source) = tap.mach_port().create_runloop_source(0) else {
                crate::klog!(ptt, error, "failed to create PTT runloop source");
                return;
            };
            CFRunLoop::get_current().add_source(&source, kCFRunLoopCommonModes);
            tap.enable();
            CFRunLoop::run_current();
        }
    });
}

#[cfg(test)]
mod classify_press {
    use super::{classify_press, PttOutcome, PTT_TAP_MAX_MS};
    use std::time::Duration;

    #[test]
    fn quick_press_is_a_tap() {
        assert_eq!(classify_press(Duration::from_millis(120), PTT_TAP_MAX_MS), PttOutcome::Tap);
    }

    #[test]
    fn just_under_threshold_is_a_tap() {
        assert_eq!(classify_press(Duration::from_millis(249), 250), PttOutcome::Tap);
    }

    #[test]
    fn at_or_over_threshold_is_a_hold() {
        assert_eq!(classify_press(Duration::from_millis(250), 250), PttOutcome::Hold);
        assert_eq!(classify_press(Duration::from_millis(900), 250), PttOutcome::Hold);
    }
}
