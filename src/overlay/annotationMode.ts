import {
  createAnnotationFromDrag,
  createAnnotationFromPoints,
  type AnnotationPoint,
  type DragAnnotationTool
} from '../annotations/annotationTools';
import type { UserAnnotation } from '../core/types';
import type { DisplayBounds } from './coordinates';

export function toScreenPoint(point: AnnotationPoint, displayBounds: DisplayBounds): AnnotationPoint {
  const scaleFactor = displayBounds.scaleFactor > 0 ? displayBounds.scaleFactor : 1;

  return {
    x: (displayBounds.x + point.x) * scaleFactor,
    y: (displayBounds.y + point.y) * scaleFactor
  };
}

export function createAnnotationFromDisplayDrag({
  id,
  type,
  displayBounds,
  start,
  end
}: {
  id: string;
  type: DragAnnotationTool;
  displayBounds: DisplayBounds;
  start: AnnotationPoint;
  end: AnnotationPoint;
}): UserAnnotation {
  return createAnnotationFromDrag({
    id,
    type,
    start: toScreenPoint(start, displayBounds),
    end: toScreenPoint(end, displayBounds)
  });
}

export function createPenAnnotationFromDisplayPoints({
  id,
  displayBounds,
  points
}: {
  id: string;
  displayBounds: DisplayBounds;
  points: AnnotationPoint[];
}): UserAnnotation {
  return createAnnotationFromPoints({
    id,
    points: points.map((point) => toScreenPoint(point, displayBounds))
  });
}
