import type { VisualTarget } from '../core/types';
import type { NativeBridge, NativeOverlayDisplayBounds } from '../native/nativeBridge';

// Target kinds the companion cursor flies to (single points). All other kinds are
// area highlights and render in the overlay window instead.
export const POINT_KINDS: ReadonlySet<VisualTarget['kind']> = new Set([
  'pointer',
  'arrow',
  'ghost_cursor'
]);

// Single source of truth for how an answer's visual targets reach the screen:
// the primary point-like target drives the companion cursor; area targets render
// in the overlay. Keeps the notch flow and the main-window flow identical.
export async function routeVisualTargets(
  nativeBridge: Pick<NativeBridge, 'cursorPoint' | 'showOverlay' | 'hideOverlay'>,
  targets: VisualTarget[],
  displayBounds: NativeOverlayDisplayBounds
): Promise<void> {
  const pointTarget = targets.find((target) => POINT_KINDS.has(target.kind));
  const areaTargets = targets.filter((target) => !POINT_KINDS.has(target.kind));

  if (pointTarget) {
    await nativeBridge.cursorPoint({
      screenRegion: pointTarget.screenRegion,
      displayBounds,
      color: pointTarget.color
    });
  }

  if (areaTargets.length > 0) {
    await nativeBridge.showOverlay({ displayBounds, targets: areaTargets });
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
