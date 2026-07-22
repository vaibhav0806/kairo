import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  APP_OPTIONS,
  AUTO_DEMO_APP_IDS,
  CORE_APP_IDS,
  FIELD_OPTIONS,
  FIELD_SLOTS,
  INITIAL_APP_ID,
  MOBILE_FIELD_DURATION,
  appIndexAfter
} from '../src/landing/violet-thread/toolTravelModel';

describe('tool travel model', () => {
  test('uses a broad real-app reservoir and a smaller deterministic field sample', () => {
    expect(INITIAL_APP_ID).toBe('after-effects');
    expect(CORE_APP_IDS).toEqual(['after-effects', 'davinci-resolve', 'blender', 'figma']);
    expect(APP_OPTIONS).toHaveLength(50);
    expect(APP_OPTIONS.slice(0, 4).map(({ id }) => id)).toEqual(CORE_APP_IDS);
    expect(APP_OPTIONS.map(({ id }) => id)).toEqual(expect.arrayContaining([
      'vscode',
      'grafana',
      'chrome',
      'github',
      'houdini',
      'cursor',
      'docker',
      'datadog',
      'notion',
      'zoom',
      'jira',
      'kubernetes',
      'jupyter',
      'google-sheets',
      'miro',
      'xcode',
      'autocad',
      'dbeaver'
    ]));
    expect(FIELD_OPTIONS).toHaveLength(50);
    expect(new Set(FIELD_OPTIONS.map(({ id }) => id)).size).toBe(50);
    expect(FIELD_SLOTS).toHaveLength(28);
    expect(FIELD_SLOTS.filter(({ mobileHidden }) => !mobileHidden)).toHaveLength(20);
    expect(FIELD_SLOTS.filter(({ tabletHidden }) => !tabletHidden)).toHaveLength(22);
    expect(MOBILE_FIELD_DURATION).toBe(22);
    expect(new Set(
      FIELD_SLOTS.filter(({ mobileHidden }) => !mobileHidden).map(({ mobileTop }) => mobileTop)
    )).toEqual(new Set([7, 31, 55, 77]));
    expect(
      FIELD_SLOTS.filter(({ mobileHidden }) => !mobileHidden).map(({ mobileDelay }) => mobileDelay)
    ).toEqual(Array.from({ length: 20 }, (_, index) => Number((index * 1.1).toFixed(1))));
    expect(new Set(FIELD_SLOTS.map(({ id }) => id)).size).toBe(28);
    expect(new Set(FIELD_SLOTS.map(({ initialAppId }) => initialAppId)).size).toBe(28);
    expect(FIELD_SLOTS.every(({ duration, delay }) => duration >= 48 && delay > 0)).toBe(true);
    expect(AUTO_DEMO_APP_IDS).toEqual([
      'blender',
      'vscode',
      'grafana',
      'notion',
      'google-sheets'
    ]);
  });

  test('uses local SVG assets and wraps keyboard movement', () => {
    const icons = APP_OPTIONS.map(({ icon }) => icon);
    expect(icons).toHaveLength(APP_OPTIONS.length);
    expect(new Set(icons).size).toBe(APP_OPTIONS.length);

    for (const icon of icons) {
      expect(icon).toMatch(/^\/travel\/icons\/.+\.svg$/);
      const path = join(process.cwd(), 'public', icon);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, 'utf8')).toContain('<svg');
    }

    expect(appIndexAfter('after-effects', -1, FIELD_OPTIONS)).toBe(FIELD_OPTIONS.length - 1);
    expect(appIndexAfter('dbeaver', 1, FIELD_OPTIONS)).toBe(0);
  });
});
