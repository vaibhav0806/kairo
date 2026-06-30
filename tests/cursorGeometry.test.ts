import { describe, expect, test } from 'vitest';
import {
  POINTING_STANDOFF,
  pointingTip,
  regionToLocalRect,
  shadowTip
} from '../src/cursor/geometry';

const display = { x: 0, y: 0, width: 1000, height: 800, scaleFactor: 2 };

describe('regionToLocalRect', () => {
  test('converts retina pixel regions into local points', () => {
    expect(
      regionToLocalRect({ x: 600, y: 400, width: 240, height: 80 }, display)
    ).toEqual({ left: 300, top: 200, width: 120, height: 40 });
  });
});

describe('pointingTip', () => {
  test('rings the element center and rests the arrow below-left, no flip', () => {
    const tip = pointingTip({ x: 600, y: 400, width: 240, height: 80 }, display);
    expect(tip.flipX).toBe(false);
    expect(tip.flipY).toBe(false);
    // center = (360, 220)
    expect(tip.ringX).toBe(360);
    expect(tip.ringY).toBe(220);
    expect(tip.tipX).toBe(360 - POINTING_STANDOFF);
    expect(tip.tipY).toBe(220 + POINTING_STANDOFF);
  });

  test('flips horizontally when the element center hugs the left edge', () => {
    const tip = pointingTip({ x: 0, y: 400, width: 40, height: 80 }, display);
    expect(tip.flipX).toBe(true);
    expect(tip.flipY).toBe(false);
    expect(tip.ringX).toBe(10);
    expect(tip.tipX).toBe(10 + POINTING_STANDOFF);
  });

  test('flips vertically when the element center hugs the bottom edge', () => {
    const tip = pointingTip({ x: 600, y: 1480, width: 240, height: 80 }, display);
    expect(tip.flipX).toBe(false);
    expect(tip.flipY).toBe(true);
    expect(tip.ringY).toBe(760);
    expect(tip.tipY).toBe(760 - POINTING_STANDOFF);
  });
});

describe('shadowTip', () => {
  test('parks the tip just below the mouse', () => {
    const tip = shadowTip(400, 300);
    expect(tip.y).toBeGreaterThan(300);
  });
});
