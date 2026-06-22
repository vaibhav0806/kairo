import { describe, expect, test, vi } from 'vitest';
import { buildTutorTurnInput, createTutorOrchestrator } from '../src/core/orchestrator';

const request = {
  userQuery: 'Help me animate this',
  activeApp: 'Blender',
  bundleId: 'org.blenderfoundation.blender',
  windowTitle: 'Blender',
  annotations: []
};

describe('tutor orchestrator', () => {
  test('builds provider input from screen context, app metadata, annotations, and skill pack', () => {
    const input = buildTutorTurnInput({
      request,
      screenCapture: {
        captured: true,
        imageMimeType: 'image/png',
        imageBase64: 'abc123',
        byteLength: 6,
        displayBounds: { x: 0, y: 0, width: 900, height: 600, scaleFactor: 2 }
      },
      skillSlug: 'blender'
    });

    expect(input.userQuery).toBe('Help me animate this');
    expect(input.activeApp.activeApp).toBe('Blender');
    expect(input.screen).toMatchObject({
      captured: true,
      imageMimeType: 'image/png',
      byteLength: 6
    });
    expect(input.skill.slug).toBe('blender');
    expect(input.constraints).toContain('Return one short tutor step.');
    expect(input.constraints).toContain(
      'Answer general user questions directly, even when they are not related to the selected skill pack.'
    );
    expect(input.constraints).toContain(
      'Use the selected skill pack only when the active app or user question makes it relevant.'
    );
  });

  test('uses the configured planner adapter for a tutor turn', async () => {
    const response = {
      mode: 'guided_lesson' as const,
      skillSlug: 'blender',
      voiceText: 'Click the cube.',
      screenText: 'Select the cube.',
      visualTargets: [],
      expectedNextState: 'cube_selected'
    };
    const planner = vi.fn(async () => response);
    const orchestrator = createTutorOrchestrator({ planner });

    await expect(
      orchestrator.runTextTurn({
        request,
        screenCapture: null,
        skillSlug: 'blender'
      })
    ).resolves.toBe(response);

    expect(planner).toHaveBeenCalledWith(expect.objectContaining({
      userQuery: 'Help me animate this',
      skill: expect.objectContaining({ slug: 'blender' })
    }));
  });
});
