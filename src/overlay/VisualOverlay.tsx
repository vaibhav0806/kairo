import type { CSSProperties } from 'react';
import type { PercentRegion, ScreenDimensions, VisualTarget } from '../core/types';
import {
  type DisplayBounds,
  normalizeRegionToDisplayPercent,
  normalizeRegionToPercent
} from './coordinates';

// Relative luminance (0..1) of a #rrggbb hex — used to pick readable caption text.
function hexLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    return 0.5;
  }
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function markerIdFor(target: VisualTarget) {
  return `overlay-arrow-${target.targetId.replace(/[^a-z0-9_-]/gi, '-')}`;
}

function labelPlacementFor(region: PercentRegion) {
  if (region.top < 12) {
    return 'below';
  }
  if (region.left < 10) {
    return 'right';
  }
  if (region.left + region.width > 88) {
    return 'left';
  }
  return 'above';
}

export function OverlayTarget({
  target,
  dimensions,
  displayBounds,
  renderPointTarget = true
}: {
  target: VisualTarget;
  dimensions: ScreenDimensions;
  displayBounds?: DisplayBounds;
  renderPointTarget?: boolean;
}) {
  const region = displayBounds
    ? normalizeRegionToDisplayPercent(target.screenRegion, displayBounds)
    : normalizeRegionToPercent(target.screenRegion, dimensions);
  const labelPlacement = labelPlacementFor(region);

  if ((target.kind === 'pointer' || target.kind === 'ghost_cursor') && !renderPointTarget) {
    return null;
  }

  // A pointer marks a single spot when there is no persistent shape target. If
  // a highlight/label exists too, the companion cursor is the only pointer.
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
        <span className="overlay-pointer-ring" aria-hidden="true" />
        <svg className="overlay-pointer-cursor" viewBox="0 0 24 32" aria-hidden="true">
          <defs>
            <linearGradient id="kairo-pointer-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c79bff" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path
            d="M23 1 L23 27 L15.5 20.5 L11 31 L6 29 L10.5 18.5 L1 18.5 Z"
            fill="url(#kairo-pointer-grad)"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        {target.label ? <span className="overlay-pointer-label">{target.label}</span> : null}
      </div>
    );
  }

  // Kairo guidance uses one stable purple visual language. The backend may send
  // sampled accent colors, but rendering them made the overlay feel inconsistent.
  const color: string | undefined = undefined;
  const style: CSSProperties = {
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`
  };
  // Dynamic accent: tint border + glow to the colour sampled behind the box.
  if (color && target.kind === 'highlight_box') {
    style.borderColor = color;
    style.boxShadow = `0 0 0 9999px rgb(10 14 18 / 0.08), 0 0 24px ${color}59`;
  }

  const labelStyle: CSSProperties | undefined = color
    ? {
        background: color,
        borderColor: 'rgb(255 255 255 / 0.4)',
        boxShadow: `0 2px 10px ${color}73`,
        color: hexLuminance(color) > 0.6 ? '#0a0e12' : '#ffffff'
      }
    : undefined;

  if (target.kind === 'arrow') {
    const markerId = markerIdFor(target);

    return (
      <div
        aria-label={target.label}
        className="overlay-target arrow"
        style={style}
        title={`${target.label} (${Math.round(target.confidence * 100)}%)`}
      >
        <svg className="overlay-arrow-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <marker
              id={markerId}
              markerHeight="10"
              markerWidth="10"
              orient="auto"
              refX="8.5"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M0 0 10 5 0 10 2.4 5z" />
            </marker>
          </defs>
          <path
            className="overlay-arrow-line"
            d="M8 74 C35 54 62 46 92 26"
            markerEnd={`url(#${markerId})`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {target.label ? (
          <span
            className="overlay-target-label overlay-arrow-label"
            data-placement={labelPlacement}
            style={labelStyle}
          >
            {target.label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      aria-label={target.label}
      className={`overlay-target ${target.kind}`}
      style={style}
      title={`${target.label} (${Math.round(target.confidence * 100)}%)`}
    >
      {target.kind !== 'ghost_cursor' && target.label ? (
        <span
          className={`overlay-target-label overlay-${target.kind}-label`}
          data-placement={labelPlacement}
          style={labelStyle}
        >
          {target.label}
        </span>
      ) : null}
    </div>
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
  const hasPersistentTarget = targets.some(
    (target) => target.kind !== 'pointer' && target.kind !== 'ghost_cursor'
  );

  return (
    <div className="visual-overlay" aria-label="Tutor visual targets">
      {targets.map((target) => (
        <OverlayTarget
          key={`${target.kind}-${target.targetId}`}
          target={target}
          dimensions={dimensions}
          displayBounds={displayBounds}
          renderPointTarget={!hasPersistentTarget}
        />
      ))}
    </div>
  );
}
