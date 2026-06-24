import type { AnnotationTool } from '../annotations/annotationTools';

// Only two tools are exposed in the notch: free-draw pen and erase.
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
