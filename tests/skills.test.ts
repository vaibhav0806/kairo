import { describe, expect, test } from 'vitest';
import { createSkillPackRegistry } from '../src/core/skills';

describe('createSkillPackRegistry', () => {
  test('provides a general screen fallback without app-specific landmarks', () => {
    const registry = createSkillPackRegistry();
    const general = registry.getGeneral();

    expect(general.slug).toBe('general');
    expect(general.displayName).toBe('General screen');
    expect(general.landmarks).toEqual({});
    expect(registry.getBySlug('general')).toBe(general);
    expect(registry.list().map((pack) => pack.slug)).toContain('general');
  });

  test('loads the Blender skill pack and its UI landmarks', () => {
    const registry = createSkillPackRegistry();
    const blender = registry.getBySlug('blender');

    expect(blender.slug).toBe('blender');
    expect(blender.displayName).toBe('Blender');
    expect(blender.landmarks.timeline.commonLocation).toBe('bottom');
  });

  test('selects Blender from active app metadata', () => {
    const registry = createSkillPackRegistry();

    expect(
      registry.matchActiveApp({
        activeApp: 'Blender',
        bundleId: 'org.blenderfoundation.blender',
        windowTitle: 'Blender'
      })?.slug
    ).toBe('blender');
  });

  test('selects Blender when the user mentions it in a general app context', () => {
    const registry = createSkillPackRegistry();

    expect(registry.matchUserQuery('Can you help me learn Blender basics?')?.slug).toBe(
      'blender'
    );
  });
});
