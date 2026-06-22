import type { ScreenDimensions } from './core/types';
import type { NativeScreenCapture } from './native/nativeBridge';

export type ScreenPreviewSource = {
  mode: 'capture' | 'mock';
  title: string;
  imageSrc?: string;
  dimensions: ScreenDimensions;
};

function capturedDimensions(
  screenCapture: NativeScreenCapture,
  fallbackDimensions: ScreenDimensions
): ScreenDimensions {
  if (!screenCapture.displayBounds) {
    return fallbackDimensions;
  }

  const scaleFactor =
    screenCapture.displayBounds.scaleFactor > 0 ? screenCapture.displayBounds.scaleFactor : 1;

  return {
    width: screenCapture.displayBounds.width * scaleFactor,
    height: screenCapture.displayBounds.height * scaleFactor
  };
}

export function resolveScreenPreview(
  screenCapture: NativeScreenCapture | null,
  fallbackDimensions: ScreenDimensions
): ScreenPreviewSource {
  if (screenCapture?.captured && screenCapture.imageBase64 && screenCapture.imageMimeType) {
    return {
      mode: 'capture',
      title: screenCapture.activeApp
        ? `${screenCapture.activeApp.activeApp} screen`
        : 'Current screen',
      imageSrc: `data:${screenCapture.imageMimeType};base64,${screenCapture.imageBase64}`,
      dimensions: capturedDimensions(screenCapture, fallbackDimensions)
    };
  }

  return {
    mode: 'mock',
    title: 'Blender viewport',
    imageSrc: undefined,
    dimensions: fallbackDimensions
  };
}
