import type { UserAnnotation } from '../core/types';

export type NotchAnnotationTool = UserAnnotation['type'];

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
