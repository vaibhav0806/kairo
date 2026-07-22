// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ContextLayers } from '../src/landing/violet-thread/ContextLayers';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(() => {
  document.body.innerHTML = '';
});
beforeEach(() => installBrowserEnvironment({ reducedMotion: true }));

test('connects one authentic workspace question to a Kairo response', () => {
  render(createElement(ContextLayers, { active: true }));

  expect(screen.getByRole('heading', { name: 'Kairo sees what you mean.' })).toBeTruthy();
  expect(screen.getByText('“Where are the preview controls?”')).toBeTruthy();
  expect(screen.getByText('Open Preview in the right dock. That panel holds the playback controls.')).toBeTruthy();
  expect(screen.getByRole('img', { name: 'After Effects motion study with timeline layers and Preview controls in the right dock' })).toBeTruthy();
  expect(document.querySelector('[data-context-phase="complete"]')).toBeTruthy();
  expect(screen.queryByText(/Chapter/)).toBeNull();
});

test('styles playback as status until replay becomes available', () => {
  const css = readFileSync('src/landing/violet-thread/ContextLayers.module.css', 'utf8');

  expect(css).toMatch(/\.replay\s*\{[^}]*color:\s*#626a78;[^}]*cursor:\s*default;/s);
  expect(css).toMatch(/\.replay:not\(:disabled\)\s*\{[^}]*border-bottom:[^}]*cursor:\s*pointer;/s);
});
