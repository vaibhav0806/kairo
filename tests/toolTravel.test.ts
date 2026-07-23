// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ToolTravel } from '../src/landing/violet-thread/ToolTravel';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('ToolTravel', () => {
  test('renders an unbounded sample of real apps without a universal placeholder tile', () => {
    render(createElement(ToolTravel));
    const region = screen.getByRole('region', { name: 'Kairo goes where you create.' });
    const field = within(region).getByRole('radiogroup', { name: 'Choose an app' });
    const choices = within(field).getAllByRole('radio');

    expect(choices).toHaveLength(28);
    for (const name of [
      'After Effects',
      'VS Code',
      'Blender',
      'Notion',
      'Figma',
      'Grafana',
      'Chrome',
      'Jira',
      'DaVinci Resolve',
      'Xcode',
      'Photoshop',
      'Google Sheets',
      'Docker',
      'Miro',
      'Maya',
      'Postman',
      'Zoom',
      'Unity',
      'Jupyter',
      'Audacity',
      'AutoCAD'
    ]) {
      expect(within(field).getByRole('radio', { name })).toBeTruthy();
    }

    expect(within(field).queryByRole('radio', { name: 'Any app you open' })).toBeNull();
    expect(region.querySelector('[data-universal-choice]')).toBeNull();
    expect(region.querySelector('[data-infinite-app-field]')).toBeTruthy();
    expect(region.querySelector('[data-app-plane]')).toBeTruthy();
    expect(region.querySelectorAll('[data-field-node]')).toHaveLength(28);
    expect(region.querySelectorAll('[data-app-icon]')).toHaveLength(28);
    expect(region.querySelectorAll('[data-kairo-puck]')).toHaveLength(1);
    expect(region.getAttribute('data-active-app')).toBe('after-effects');
    expect(region.querySelector('[data-kairo-puck-label]')?.textContent).toContain(
      'whatever you open'
    );
    expect(region.textContent).toContain('whatever you open next');

    const checked = choices.filter((choice) => choice.getAttribute('aria-checked') === 'true');
    const tabbable = choices.filter((choice) => choice.getAttribute('tabindex') === '0');
    expect(checked).toHaveLength(1);
    expect(tabbable).toHaveLength(1);
    expect(new Set(choices.map((choice) => choice.getAttribute('aria-label'))).size).toBe(28);

    for (const image of region.querySelectorAll('[data-app-icon]')) {
      expect(image.getAttribute('src')).toMatch(/^\/travel\/icons\/.+\.svg$/);
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('aria-hidden')).toBe('true');
      expect(image.getAttribute('width')).toBeTruthy();
      expect(image.getAttribute('height')).toBeTruthy();
      expect(image.hasAttribute('loading')).toBe(false);
    }
  });

  test('moves Kairo to the app the learner chooses', () => {
    render(createElement(ToolTravel));
    const region = screen.getByRole('region', { name: 'Kairo goes where you create.' });
    const field = within(region).getByRole('radiogroup', { name: 'Choose an app' });

    fireEvent.click(within(field).getByRole('radio', { name: 'Grafana' }));

    expect(region.getAttribute('data-active-app')).toBe('grafana');
    expect(within(field).getByRole('radio', { name: 'Grafana' }).getAttribute('aria-checked')).toBe('true');
    expect(within(field).getByRole('radio', { name: 'After Effects' }).getAttribute('aria-checked')).toBe('false');
    expect(region.querySelector('[data-kairo-puck]')?.getAttribute('data-active-app')).toBe('grafana');
    expect(region.querySelector('[data-kairo-puck-label]')?.textContent).toContain('Grafana');
    expect(
      within(field).getByRole('radio', { name: 'Grafana' })
        .closest('[data-field-node]')
        ?.hasAttribute('data-active-held')
    ).toBe(true);
  });

  test('previews Kairo on hover without changing the committed selection', () => {
    render(createElement(ToolTravel));
    const region = screen.getByRole('region', { name: 'Kairo goes where you create.' });
    const field = within(region).getByRole('radiogroup', { name: 'Choose an app' });
    const afterEffects = within(field).getByRole('radio', { name: 'After Effects' });
    const blender = within(field).getByRole('radio', { name: 'Blender' });
    const blenderSlot = blender.closest('[data-field-node]');

    expect(blenderSlot).toBeTruthy();
    fireEvent.mouseEnter(blenderSlot!);

    expect(region.getAttribute('data-active-app')).toBe('blender');
    expect(region.querySelector('[data-kairo-puck]')?.getAttribute('data-active-app')).toBe('blender');
    expect(region.querySelector('[data-kairo-puck-label]')?.textContent).toContain('Blender');
    expect(blender.getAttribute('aria-checked')).toBe('false');
    expect(afterEffects.getAttribute('aria-checked')).toBe('true');

    fireEvent.mouseLeave(blenderSlot!);

    expect(region.getAttribute('data-active-app')).toBe('after-effects');
    expect(region.querySelector('[data-kairo-puck-label]')?.textContent).toContain(
      'whatever you open'
    );
  });

  test('supports roving keyboard selection in the field order', () => {
    render(createElement(ToolTravel));
    const field = screen.getByRole('radiogroup', { name: 'Choose an app' });
    const afterEffects = within(field).getByRole('radio', { name: 'After Effects' });
    afterEffects.focus();

    fireEvent.keyDown(afterEffects, { key: 'ArrowRight' });
    const vscode = within(field).getByRole('radio', { name: 'VS Code' });
    expect(document.activeElement).toBe(vscode);
    expect(vscode.getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(vscode, { key: 'End' });
    const autocad = within(field).getByRole('radio', { name: 'AutoCAD' });
    expect(document.activeElement).toBe(autocad);

    fireEvent.keyDown(autocad, { key: 'Home' });
    expect(document.activeElement).toBe(afterEffects);
    expect(autocad.getAttribute('aria-checked')).toBe('false');
  });

  test('removes the screenshot contact sheet and custom app form', () => {
    const { container } = render(createElement(ToolTravel));
    expect(container.querySelectorAll(
      '[data-workspace-capture], [data-tool-contact-sheet], picture, video, form, input, textarea'
    )).toHaveLength(0);
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
