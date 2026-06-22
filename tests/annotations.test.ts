import { describe, expect, test } from 'vitest';
import {
  createAnnotationFromDrag,
  eraseAnnotationAtPoint,
  normalizeDragToRegion
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
