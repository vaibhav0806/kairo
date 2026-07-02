import type { VisualTarget } from '../core/types';
import type { NativeBridge, NativeOverlayDisplayBounds } from '../native/nativeBridge';

// Target kinds the companion cursor flies to. The overlay suppresses duplicate
// point cursors when a persistent highlight/label is already on screen.
export const POINT_KINDS: ReadonlySet<VisualTarget['kind']> = new Set([
  'pointer',
  'arrow',
  'ghost_cursor'
]);

// Single source of truth for how an answer's visual targets reach the screen.
// The primary point-like target drives the companion cursor; persistent shapes
// render in the overlay so the user gets a stable visual explanation.
export async function routeVisualTargets(
  nativeBridge: Pick<NativeBridge, 'cursorPoint' | 'showOverlay' | 'hideOverlay'>,
  targets: VisualTarget[],
  displayBounds: NativeOverlayDisplayBounds
): Promise<void> {
  const pointTarget = targets.find((target) => POINT_KINDS.has(target.kind)) ?? targets[0];

  if (pointTarget) {
    await nativeBridge.cursorPoint({
      screenRegion: pointTarget.screenRegion,
      displayBounds,
      color: pointTarget.color
    });
  }

  if (targets.length > 0) {
    await nativeBridge.showOverlay({ displayBounds, targets });
  } else {
    await nativeBridge.hideOverlay();
  }
}

// Tear-down counterpart: clear the overlay and glide the cursor back to the mouse.
export async function releaseVisualTargets(
  nativeBridge: Pick<NativeBridge, 'cursorRelease' | 'hideOverlay'>
): Promise<void> {
  await nativeBridge.hideOverlay();
  await nativeBridge.cursorRelease();
}
