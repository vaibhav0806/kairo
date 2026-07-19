// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ToolTravel } from '../src/landing/violet-thread/ToolTravel';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('ToolTravel', () => {
  test('offers every approved tool and problem in one workspace', () => {
    render(createElement(ToolTravel));
    expect(screen.getByRole('heading', { name: 'Different tools. The same way of getting unstuck.' }))
      .toBeTruthy();
    for (const name of ['After Effects', 'DaVinci Resolve', 'Blender', 'Figma']) {
      expect(screen.getByRole('tab', { name: new RegExp(name) })).toBeTruthy();
    }
    for (const problem of [
      'abrupt easing handle',
      'disconnected color node',
      'incorrect transform axis',
      'broken auto-layout spacing'
    ]) expect(screen.getByText(problem)).toBeTruthy();
  });

  test('supports roving keyboard selection and instant keyboard state', () => {
    render(createElement(ToolTravel));
    const afterEffects = screen.getByRole('tab', { name: /After Effects/ });
    fireEvent.keyDown(afterEffects, { key: 'ArrowRight' });
    expect(document.querySelector('[data-tool="davinci"]')).toBeTruthy();
    expect(screen.getByRole('tab', { name: /DaVinci Resolve/ }).getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('[data-tool-selection-instant="true"]')).toBeTruthy();

    fireEvent.keyDown(screen.getByRole('tab', { name: /DaVinci Resolve/ }), { key: 'End' });
    expect(document.querySelector('[data-tool="figma"]')).toBeTruthy();
  });

  test('does not claim formal integrations or autonomous work', () => {
    const { container } = render(createElement(ToolTravel));
    const copy = container.textContent?.toLowerCase() ?? '';
    expect(copy).not.toContain('integration');
    expect(copy).not.toContain('partner');
    expect(copy).not.toContain('take over');
    expect(copy).not.toContain('done for you');
  });
});
