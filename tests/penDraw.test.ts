import { describe, expect, test } from 'vitest';
import {
  DRAW_EASE,
  boxCornerRegions,
  clamp01,
  cubicBezier,
  evalDrawEase,
  lerp
} from '../src/core/penDraw';

describe('penDraw easing', () => {
  test('clamp01 pins to the unit interval', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(2)).toBe(1);
  });

  test('lerp interpolates endpoints and midpoint', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  test('a linear cubic-bezier is the identity', () => {
    const linear = cubicBezier(0, 0, 1, 1);
    for (const x of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(linear(x)).toBeCloseTo(x, 3);
    }
  });

  test('draw ease pins endpoints and stays monotonic in [0,1]', () => {
    expect(evalDrawEase(0)).toBe(0);
    expect(evalDrawEase(1)).toBe(1);
    let previous = -1;
    for (let x = 0; x <= 1.0001; x += 0.05) {
      const y = evalDrawEase(Math.min(x, 1));
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = y;
    }
  });

  test('draw ease control points feed the sampler (documents the CSS contract)', () => {
    // If this changes, the cubic-bezier() literal in styles.css must change too.
    expect([...DRAW_EASE]).toEqual([0.22, 1, 0.36, 1]);
  });
});

describe('boxCornerRegions', () => {
  test('returns zero-size regions at the top-left and bottom-right corners', () => {
    const { fromRegion, toRegion } = boxCornerRegions({ x: 100, y: 120, width: 220, height: 90 });
    expect(fromRegion).toEqual({ x: 100, y: 120, width: 0, height: 0 });
    expect(toRegion).toEqual({ x: 320, y: 210, width: 0, height: 0 });
  });
});
