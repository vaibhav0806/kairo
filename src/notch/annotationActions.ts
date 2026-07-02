import type { AnnotationTool } from '../annotations/annotationTools';

// Keep the user marking surface intentionally small: users mark context, Kairo
// generates the richer instructional overlays in its answer.
export type NotchAnnotationTool = Extract<AnnotationTool, 'pen' | 'erase'>;

export type NotchAnnotationStartPayload = {
  tool: NotchAnnotationTool;
};

const defaultTool: NotchAnnotationTool = 'pen';

export function createAnnotationStartPayload(
  tool: NotchAnnotationTool = defaultTool
): NotchAnnotationStartPayload {
  return { tool };
}

export function normalizeAnnotationStartPayload(
  payload: Partial<NotchAnnotationStartPayload> | null | undefined
): NotchAnnotationStartPayload {
  return createAnnotationStartPayload(payload?.tool ?? defaultTool);
}
