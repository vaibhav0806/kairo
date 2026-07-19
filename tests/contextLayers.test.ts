// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, expect, test } from 'vitest';
import { ContextLayers } from '../src/landing/violet-thread/ContextLayers';

afterEach(() => {
  document.body.innerHTML = '';
});

test('connects the four shared context artifacts with the Violet Thread', () => {
  render(createElement(ContextLayers, { active: true }));

  for (const label of [
    'What you said',
    'What is visible',
    'What you pointed at',
    'What Kairo understood'
  ]) {
    expect(screen.getByText(label)).toBeTruthy();
  }
  expect(document.querySelector('[data-thread-profile="context"]')).toBeTruthy();
});
