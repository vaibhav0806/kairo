// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ToolPlayground } from '../src/landing/ToolPlayground';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('shows concrete tool questions without claiming integrations', () => {
  const { container } = render(createElement(ToolPlayground));
  expect(screen.getByText('Why does this title stop so abruptly?')).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'DaVinci Resolve' }));
  expect(container.querySelector('[data-tool]')?.getAttribute('data-tool')).toBe('davinci');
  expect(screen.getByText('How do I make this speed change feel smoother?')).toBeTruthy();
  expect(container.textContent).not.toMatch(/official integration|partner/i);
});
