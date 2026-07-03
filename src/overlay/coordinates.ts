import type { PercentRegion, ScreenDimensions, ScreenRegion } from '../core/types';

export type DisplayBounds = ScreenDimensions & {
  x: number;
  y: number;
  scaleFactor: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeRegionToPercent(
  region: ScreenRegion,
  dimensions: ScreenDimensions
): PercentRegion {
  const left = clamp(region.x, 0, dimensions.width);
  const top = clamp(region.y, 0, dimensions.height);
  const right = clamp(region.x + region.width, 0, dimensions.width);
  const bottom = clamp(region.y + region.height, 0, dimensions.height);

  return {
    left: (left / dimensions.width) * 100,
    top: (top / dimensions.height) * 100,
    width: ((right - left) / dimensions.width) * 100,
    height: ((bottom - top) / dimensions.height) * 100
  };
}

export function normalizeRegionToDisplayPercent(
  region: ScreenRegion,
  displayBounds: DisplayBounds
): PercentRegion {
  return normalizeRegionToPercent(
    {
      x: region.x - displayBounds.x,
      y: region.y - displayBounds.y,
      width: region.width,
      height: region.height
    },
    displayBounds
  );
}
