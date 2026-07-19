import { describe, expect, test } from 'vitest';
import { getStrokeBounds, recognizeHeroTarget, strokeToSvgPath } from '../src/landing/heroInk';

const circle = [
  [10, 10, 0.5],
  [50, 5, 0.5],
  [90, 10, 0.5],
  [100, 50, 0.5],
  [90, 90, 0.5],
  [50, 100, 0.5],
  [10, 90, 0.5],
  [5, 50, 0.5],
  [10, 10, 0.5]
] as const;

describe('hero ink', () => {
  test('creates a closed SVG path for a drawable stroke', () => {
    expect(strokeToSvgPath(circle)).toMatch(/^M .+ Z$/);
  });

  test('returns stable bounds', () => {
    expect(getStrokeBounds(circle)).toEqual({ minX: 5, minY: 5, maxX: 100, maxY: 100 });
  });

  test('recognizes a closed stroke around the nearest expanded target', () => {
    expect(
      recognizeHeroTarget(circle, [{ id: 'timeline', x: 20, y: 20, width: 60, height: 60 }])
    ).toBe('timeline');
  });

  test('rejects short and open gestures', () => {
    expect(
      recognizeHeroTarget(
        [
          [0, 0],
          [90, 0],
          [180, 0]
        ],
        [{ id: 'timeline', x: 20, y: 20, width: 60, height: 60 }]
      )
    ).toBeNull();
  });
});
