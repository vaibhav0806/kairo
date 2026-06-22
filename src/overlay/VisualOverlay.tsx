import type { ScreenDimensions, VisualTarget } from '../core/types';
import {
  type DisplayBounds,
  normalizeRegionToDisplayPercent,
  normalizeRegionToPercent
} from './coordinates';

export function OverlayTarget({
  target,
  dimensions,
  displayBounds
}: {
  target: VisualTarget;
  dimensions: ScreenDimensions;
  displayBounds?: DisplayBounds;
}) {
  const region = displayBounds
    ? normalizeRegionToDisplayPercent(target.screenRegion, displayBounds)
    : normalizeRegionToPercent(target.screenRegion, dimensions);
  const style = {
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`
  };

  return (
    <div
      aria-label={target.label}
      className={`overlay-target ${target.kind}`}
      style={style}
      title={`${target.label} (${Math.round(target.confidence * 100)}%)`}
    />
  );
}

export function VisualOverlay({
  targets,
  dimensions,
  displayBounds
}: {
  targets: VisualTarget[];
  dimensions: ScreenDimensions;
  displayBounds?: DisplayBounds;
}) {
  return (
    <div className="visual-overlay" aria-label="Tutor visual targets">
      {targets.map((target) => (
        <OverlayTarget
          key={`${target.kind}-${target.targetId}`}
          target={target}
          dimensions={dimensions}
          displayBounds={displayBounds}
        />
      ))}
    </div>
  );
}
