import type { NotchPayload } from './types';

type NotchEvent<T> = {
  payload: T;
};

type NotchListen = <T>(
  eventName: string,
  handler: (event: NotchEvent<T>) => void
) => Promise<() => void>;

export async function subscribeToNotchPayload({
  listen,
  readCurrentPayload,
  onPayload
}: {
  listen: NotchListen;
  readCurrentPayload: () => Promise<NotchPayload | null>;
  onPayload: (payload: NotchPayload) => void;
}) {
  const currentPayload = await readCurrentPayload().catch(() => null);
  if (currentPayload) {
    onPayload(currentPayload);
  }

  return listen<NotchPayload>('notch:update', (event) => {
    onPayload(event.payload);
  });
}
