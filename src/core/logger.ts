// Universal frontend logger. Every WebView (notch/overlay/cursor/main) routes its
// log lines into the SAME on-disk file as the Rust side, via a single batched IPC
// call to the `debug_log_batch` command (see src-tauri/src/lib.rs + klog.rs).
//
// Perf: lines are queued in memory and flushed at most every FLUSH_MS (or when the
// queue hits MAX_BATCH), so we never pay one IPC round-trip per log line.
//
// Never log secrets or raw media (audio/screenshot base64, full transcripts) — pass
// metadata only (byte counts, sizes, ids). Mirror the Rust redaction rules.

import { invoke } from '@tauri-apps/api/core';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogFields = Record<string, string | number | boolean | null | undefined>;

interface FeLogLine {
  level: LogLevel;
  webview: string;
  sub: string;
  message: string;
}

const FLUSH_MS = 250;
const MAX_BATCH = 20;

const queue: FeLogLine[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Which WebView we are: the app routes by URL hash (see src/main.tsx).
function detectWebview(): string {
  const hash = (typeof window !== 'undefined' && window.location?.hash) || '';
  if (hash === '#/overlay') return 'overlay';
  if (hash === '#/notch') return 'notch';
  if (hash === '#/cursor') return 'cursor';
  return 'main';
}

const WEBVIEW = detectWebview();

function formatFields(fields?: LogFields): string {
  if (!fields) return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const rendered =
      typeof value === 'string' ? value : value === null ? 'null' : String(value);
    parts.push(`${key}=${rendered}`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const lines = queue.splice(0, queue.length);
  try {
    await invoke('debug_log_batch', { lines });
  } catch {
    // Not running inside the native runtime (e.g. browser dev shell). Fall back to
    // the console so the lines aren't silently lost during `npm run dev`.
    for (const line of lines) {
      const fn =
        line.level === 'error'
          ? console.error
          : line.level === 'warn'
            ? console.warn
            : console.log;
      fn(`[${line.webview}] ${line.sub}: ${line.message}`);
    }
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    void flush();
  }, FLUSH_MS);
}

/**
 * Log one line. Fields are appended as `key=value` and the whole line lands in the
 * shared Kairo log file tagged `[frontend] webview=<view> sub=<subsystem>`.
 */
export function klog(
  sub: string,
  level: LogLevel,
  message: string,
  fields?: LogFields
): void {
  queue.push({ level, webview: WEBVIEW, sub, message: message + formatFields(fields) });
  if (queue.length >= MAX_BATCH) {
    void flush();
  } else {
    scheduleFlush();
  }
}

/** Force any buffered lines out now (e.g. before a known teardown). */
export function flushLogs(): Promise<void> {
  return flush();
}

/**
 * Attach global handlers so uncaught errors and rejected promises in any WebView
 * are recorded. Call once per WebView, early (see src/main.tsx).
 */
export function installGlobalErrorLogging(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (event) => {
    klog('window', 'error', event.message || 'uncaught error', {
      src: event.filename,
      line: event.lineno,
      col: event.colno
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason =
      event.reason instanceof Error ? event.reason.message : String(event.reason);
    klog('window', 'error', 'unhandled promise rejection', { reason });
  });
  // Best-effort flush when the WebView is hidden/torn down.
  window.addEventListener('pagehide', () => {
    void flush();
  });
}
