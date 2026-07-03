import { beforeEach, describe, expect, it, vi } from 'vitest';

// The logger talks to the native side through Tauri's `invoke`. Mock it so we can
// assert the batching behavior without a running app.
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn().mockResolvedValue(undefined) }));

import { invoke } from '@tauri-apps/api/core';
import { flushLogs, klog } from '../src/core/logger';

const invokeMock = invoke as unknown as ReturnType<typeof vi.fn>;

type Batch = { lines: Array<{ level: string; webview: string; sub: string; message: string }> };

beforeEach(async () => {
  // Drain anything a prior test buffered (also clears the pending flush timer),
  // then reset the spy so each test starts clean.
  await flushLogs();
  invokeMock.mockClear();
});

describe('frontend logger', () => {
  it('buffers lines and flushes them in a single batched IPC call', async () => {
    klog('vision', 'info', 'detected boxes', { count: 3 });
    klog('mic', 'warn', 'stream restart');

    // Under the batch cap → nothing sent yet (only a timer is pending).
    expect(invokeMock).not.toHaveBeenCalled();

    await flushLogs();

    expect(invokeMock).toHaveBeenCalledTimes(1);
    const [command, args] = invokeMock.mock.calls[0] as [string, Batch];
    expect(command).toBe('debug_log_batch');
    expect(args.lines).toHaveLength(2);
    expect(args.lines[0]).toMatchObject({ level: 'info', sub: 'vision', webview: 'main' });
    // Fields are appended as `key=value`.
    expect(args.lines[0].message).toBe('detected boxes count=3');
    expect(args.lines[1]).toMatchObject({ level: 'warn', sub: 'mic', message: 'stream restart' });
  });

  it('auto-flushes once the batch cap is reached, losing no lines', async () => {
    for (let index = 0; index < 20; index += 1) {
      klog('spam', 'debug', `line ${index}`);
    }
    await flushLogs();

    const totalLines = (invokeMock.mock.calls as Array<[string, Batch]>).reduce(
      (sum, call) => sum + call[1].lines.length,
      0
    );
    expect(totalLines).toBe(20);
  });

  it('does nothing on an empty flush', async () => {
    await flushLogs();
    expect(invokeMock).not.toHaveBeenCalled();
  });
});
