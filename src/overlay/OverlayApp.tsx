import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import type { ScreenDimensions, VisualTarget } from '../core/types';
import { VisualOverlay } from './VisualOverlay';

type OverlayDisplayBounds = ScreenDimensions & {
  x: number;
  y: number;
  scaleFactor: number;
};

export type OverlayPayload = {
  displayBounds: OverlayDisplayBounds;
  targets: VisualTarget[];
};

export function OverlayApp() {
  const [payload, setPayload] = useState<OverlayPayload | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('overlay-document');
    document.body.classList.add('overlay-document');

    return () => {
      document.documentElement.classList.remove('overlay-document');
      document.body.classList.remove('overlay-document');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unlisten: (() => void) | undefined;

    void listen<OverlayPayload>('overlay:update', (event) => {
      if (isMounted) {
        setPayload(event.payload);
      }
    })
      .then((nextUnlisten) => {
        unlisten = nextUnlisten;
      })
      .catch(() => {
        // Browser preview and tests run without the Tauri event bus.
      });

    return () => {
      isMounted = false;
      unlisten?.();
    };
  }, []);

  return (
    <main className="overlay-shell" aria-label="Kairo visual overlay">
      {payload ? (
        <VisualOverlay
          targets={payload.targets}
          dimensions={{
            width: payload.displayBounds.width,
            height: payload.displayBounds.height
          }}
        />
      ) : null}
    </main>
  );
}
