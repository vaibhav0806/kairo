import { describe, expect, test } from 'vitest';
import { resolveScreenPreview } from '../src/screenPreview';

const fallbackDimensions = {
  width: 1920,
  height: 1080
};

describe('resolveScreenPreview', () => {
  test('uses the real captured screen image when capture data is available', () => {
    expect(
      resolveScreenPreview(
        {
          captured: true,
          imageMimeType: 'image/png',
          imageBase64: 'abc123',
          displayBounds: {
            x: 0,
            y: 0,
            width: 900,
            height: 600,
            scaleFactor: 2
          }
        },
        fallbackDimensions
      )
    ).toEqual({
      mode: 'capture',
      title: 'Current screen',
      imageSrc: 'data:image/png;base64,abc123',
      dimensions: {
        width: 1800,
        height: 1200
      }
    });
  });

  test('falls back to the mock Blender preview before the first capture', () => {
    expect(resolveScreenPreview(null, fallbackDimensions)).toEqual({
      mode: 'mock',
      title: 'Blender viewport',
      imageSrc: undefined,
      dimensions: fallbackDimensions
    });
  });
});
