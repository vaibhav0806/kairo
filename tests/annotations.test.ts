import { describe, expect, test } from 'vitest';
import {
  createAnnotationFromPoints,
  createAnnotationFromDrag,
  eraseAnnotationAtPoint,
  normalizeDragToRegion,
  normalizePointsToRegion
} from '../src/annotations/annotationTools';

describe('annotation tools', () => {
  test('normalizes drag coordinates into a positive screen region', () => {
    expect(
      normalizeDragToRegion(
        { x: 420, y: 360 },
        { x: 120, y: 140 }
      )
    ).toEqual({
      x: 120,
      y: 140,
      width: 300,
      height: 220
    });
  });

  test('creates typed user annotations from drag regions', () => {
    expect(
      createAnnotationFromDrag({
        id: 'annotation-1',
        type: 'rectangle',
        start: { x: 100, y: 120 },
        end: { x: 260, y: 240 }
      })
    ).toEqual({
      id: 'annotation-1',
      type: 'rectangle',
      screenRegion: {
        x: 100,
        y: 120,
        width: 160,
        height: 120
      }
    });
  });

  test('creates freeform pen annotations from traced points', () => {
    expect(
      createAnnotationFromPoints({
        id: 'annotation-pen-1',
        points: [
          { x: 40, y: 90 },
          { x: 55, y: 120 },
          { x: 96, y: 80 }
        ]
      })
    ).toEqual({
      id: 'annotation-pen-1',
      type: 'pen',
      screenRegion: {
        x: 40,
        y: 80,
        width: 56,
        height: 40
      },
      points: [
        { x: 40, y: 90 },
        { x: 55, y: 120 },
        { x: 96, y: 80 }
      ]
    });
  });

  test('normalizes pen points into their bounding region', () => {
    expect(
      normalizePointsToRegion([
        { x: 18, y: 20 },
        { x: 10, y: 42 },
        { x: 30, y: 12 }
      ])
    ).toEqual({
      x: 10,
      y: 12,
      width: 20,
      height: 30
    });
  });

  test('erases the topmost annotation containing a point', () => {
    const annotations = [
      {
        id: 'annotation-1',
        type: 'circle' as const,
        screenRegion: { x: 100, y: 100, width: 80, height: 80 }
      },
      {
        id: 'annotation-2',
        type: 'highlight' as const,
        screenRegion: { x: 120, y: 120, width: 80, height: 40 }
      }
    ];

    expect(eraseAnnotationAtPoint(annotations, { x: 130, y: 130 })).toEqual([
      annotations[0]
    ]);
  });
});
