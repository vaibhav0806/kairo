import { describe, expect, test, vi } from 'vitest';
import { askTutorFromNotch } from '../src/notch/notchTutor';
import type { NativeBridge } from '../src/native/nativeBridge';

function createBridge(overrides: Partial<NativeBridge> = {}): NativeBridge {
  return {
    getActiveApp: vi.fn(async () => ({
      activeApp: 'Chrome',
      bundleId: 'com.google.Chrome',
      windowTitle: 'OpenRouter',
      source: 'native'
    })),
    getPermissionStatus: vi.fn(),
    requestRequiredPermissions: vi.fn(),
    openPermissionSettings: vi.fn(),
    captureScreen: vi.fn(async () => ({
      captured: true,
      activeApp: {
        activeApp: 'Chrome',
        bundleId: 'com.google.Chrome',
        windowTitle: 'OpenRouter',
        source: 'native'
      },
      imageMimeType: 'image/png',
      imageBase64: 'abc123',
      byteLength: 6,
      displayBounds: { x: 0, y: 0, width: 1000, height: 700, scaleFactor: 2 }
    })),
    showOverlay: vi.fn(),
    showAnnotationOverlay: vi.fn(),
    updateOverlay: vi.fn(),
    getCurrentOverlayPayload: vi.fn(),
    hideOverlay: vi.fn(),
    showNotch: vi.fn(),
    getCurrentNotchPayload: vi.fn(),
    hideNotch: vi.fn(),
    runTutorTurn: vi.fn(async () =>
      JSON.stringify({
        mode: 'stuck_help',
        skillSlug: 'blender',
        voiceText: 'This page shows OpenRouter logs.',
        screenText: 'This page shows OpenRouter logs.',
        visualTargets: [],
        expectedNextState: 'user_asks_next'
      })
    ),
    registerActivationShortcut: vi.fn(),
    ...overrides
  } as NativeBridge;
}

describe('askTutorFromNotch', () => {
  test('runs a tutor turn directly from the visible notch window', async () => {
    const bridge = createBridge();

    await expect(
      askTutorFromNotch({
        query: 'What is on this screen?',
        nativeBridge: bridge,
        aiProvider: 'openrouter',
        defaultSkill: 'blender'
      })
    ).resolves.toEqual({
      state: 'showing_step',
      layout: 'answer',
      title: 'Kairo answered',
      detail: 'This page shows OpenRouter logs.'
    });

    expect(bridge.captureScreen).toHaveBeenCalled();
    expect(bridge.runTutorTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        userQuery: 'What is on this screen?',
        screen: expect.objectContaining({ captured: true })
      })
    );
  });

  test('passes screen annotations from the notch into the tutor turn', async () => {
    const bridge = createBridge();
    const annotation = {
      id: 'screen-annotation-1',
      type: 'rectangle' as const,
      screenRegion: { x: 100, y: 120, width: 220, height: 90 }
    };

    await askTutorFromNotch({
      query: 'What is this marked area?',
      nativeBridge: bridge,
      aiProvider: 'openrouter',
      defaultSkill: 'blender',
      annotations: [annotation]
    });

    expect(bridge.runTutorTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        annotations: [annotation]
      })
    );
  });

  test('returns a visible provider error instead of staying in thinking', async () => {
    const bridge = createBridge({
      runTutorTurn: vi.fn(async () => {
        throw new Error('Provider failed');
      })
    });

    await expect(
      askTutorFromNotch({
        query: 'What is on this screen?',
        nativeBridge: bridge,
        aiProvider: 'openrouter',
        defaultSkill: 'blender'
      })
    ).resolves.toMatchObject({
      state: 'showing_step',
      layout: 'answer',
      title: 'Kairo answered',
      detail: expect.stringContaining('Kairo could not complete the request')
    });
  });
});
