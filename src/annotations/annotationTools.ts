import type { ScreenRegion, UserAnnotation } from '../core/types';

export type AnnotationPoint = {
  x: number;
  y: number;
};

export type AnnotationTool = UserAnnotation['type'] | 'erase';

export function normalizeDragToRegion(start: AnnotationPoint, end: AnnotationPoint): ScreenRegion {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

export function createAnnotationFromDrag({
  id,
  type,
  start,
  end
}: {
  id: string;
  type: UserAnnotation['type'];
  start: AnnotationPoint;
  end: AnnotationPoint;
}): UserAnnotation {
  return {
    id,
    type,
    screenRegion: normalizeDragToRegion(start, end)
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
