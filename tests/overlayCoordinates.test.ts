import { describe, expect, test } from 'vitest';
import {
  normalizeRegionToDisplayPercent,
  normalizeRegionToPercent
} from '../src/overlay/coordinates';

describe('overlay coordinate normalization', () => {
  test('maps screenshot pixel regions into percentage overlay regions', () => {
    expect(
      normalizeRegionToPercent(
        {
          x: 960,
          y: 486,
          width: 180,
          height: 180
        },
        {
          width: 1920,
          height: 1080
        }
      )
    ).toEqual({
      left: 50,
      top: 45,
      width: 9.375,
      height: 16.666666666666664
    });
  });

  test('clamps regions to the visible display bounds', () => {
    expect(
      normalizeRegionToPercent(
        {
          x: -120,
          y: 900,
          width: 420,
          height: 300
        },
        {
          width: 1000,
          height: 1000
        }
      )
    ).toEqual({
      left: 0,
      top: 90,
      width: 30,
      height: 10
    });
  });

  test('normalizes display-point target regions into overlay percentages', () => {
    expect(
      normalizeRegionToDisplayPercent(
        {
          x: 450,
          y: 300,
          width: 150,
          height: 100
        },
        {
          x: 0,
          y: 0,
          width: 900,
          height: 600,
          scaleFactor: 2
        }
      )
    ).toEqual({
      left: 50,
      top: 50,
      width: 16.666666666666664,
      height: 16.666666666666664
    });
  });

  test('normalizes display-offset regions for secondary displays', () => {
    expect(
      normalizeRegionToDisplayPercent(
        {
          x: 2100,
          y: 240,
          width: 200,
          height: 100
        },
        {
          x: 1800,
          y: 0,
          width: 1000,
          height: 800,
          scaleFactor: 1
        }
      )
    ).toEqual({
      left: 30,
      top: 30,
      width: 20,
      height: 12.5
    });
  });
});
