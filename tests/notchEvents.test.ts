import { describe, expect, test, vi } from 'vitest';
import { subscribeToNotchPayload } from '../src/notch/notchEvents';
import type { NotchPayload } from '../src/notch/types';

const payload: NotchPayload = {
  state: 'captured',
  layout: 'prompt',
  title: 'Screen captured',
  detail: 'Ready for a question'
};

describe('subscribeToNotchPayload', () => {
  test('loads current native payload before subscribing for future notch events', async () => {
    const onPayload = vi.fn();
    const listen = vi.fn(async () => vi.fn());
    const readCurrentPayload = vi.fn(async () => payload);

    await subscribeToNotchPayload({
      listen,
      readCurrentPayload,
      onPayload
    });

    expect(readCurrentPayload).toHaveBeenCalledBefore(listen);
    expect(onPayload).toHaveBeenCalledWith(payload);
    expect(listen).toHaveBeenCalledWith('notch:update', expect.any(Function));
  });
});
