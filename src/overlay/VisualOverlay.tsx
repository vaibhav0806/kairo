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

  // A pointer marks a single spot: draw a pulsating circle centered on the point,
  // with a small cursor resting on it (Clicky-style).
  if (target.kind === 'pointer') {
    return (
      <div
        aria-label={target.label}
        className="overlay-target pointer"
        style={{
          left: `${region.left}%`,
          top: `${region.top}%`,
          width: `${region.width}%`,
          height: `${region.height}%`
        }}
      >
        <span className="overlay-pointer-ping" aria-hidden="true" />
        <span className="overlay-pointer-ping is-delayed" aria-hidden="true" />
        <span className="overlay-pointer-ring" aria-hidden="true" />
        <svg className="overlay-pointer-cursor" viewBox="0 0 32 36" aria-hidden="true">
          <path
            d="M1 1 L1 27 L8.5 20.5 L13 31 L18 29 L13.5 18.5 L23 18.5 Z"
            fill="#ffffff"
            stroke="#04201d"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {target.label ? <span className="overlay-pointer-label">{target.label}</span> : null}
      </div>
    );
  }

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
