import type { ScreenRegion, UserAnnotation } from '../core/types';

export type AnnotationPoint = {
  x: number;
  y: number;
};

export type AnnotationTool = UserAnnotation['type'] | 'erase';
export type DragAnnotationTool = Exclude<UserAnnotation['type'], 'pen'>;

export function normalizeDragToRegion(start: AnnotationPoint, end: AnnotationPoint): ScreenRegion {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

export function normalizePointsToRegion(points: AnnotationPoint[]): ScreenRegion {
  if (points.length === 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export function createAnnotationFromDrag({
  id,
  type,
  start,
  end
}: {
  id: string;
  type: DragAnnotationTool;
  start: AnnotationPoint;
  end: AnnotationPoint;
}): UserAnnotation {
  return {
    id,
    type,
    screenRegion: normalizeDragToRegion(start, end)
  };
}

export function createAnnotationFromPoints({
  id,
  points
}: {
  id: string;
  points: AnnotationPoint[];
}): UserAnnotation {
  return {
    id,
    type: 'pen',
    screenRegion: normalizePointsToRegion(points),
    points
  };
}

export function isPointInRegion(point: AnnotationPoint, region: ScreenRegion) {
  return (
    point.x >= region.x &&
    point.x <= region.x + region.width &&
    point.y >= region.y &&
    point.y <= region.y + region.height
  );
}

export function eraseAnnotationAtPoint(
  annotations: UserAnnotation[],
  point: AnnotationPoint
): UserAnnotation[] {
  let indexToErase = -1;
  for (let index = annotations.length - 1; index >= 0; index -= 1) {
    if (isPointInRegion(point, annotations[index].screenRegion)) {
      indexToErase = index;
      break;
    }
  }

  if (indexToErase < 0) {
    return annotations;
  }

  return annotations.filter((_, index) => index !== indexToErase);
}
