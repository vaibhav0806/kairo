// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ControlMoment } from '../src/landing/ControlMoment';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('requires the learner action before verification', () => {
  const { container } = render(createElement(ControlMoment));
  fireEvent.click(screen.getByRole('button', { name: 'Show the next move' }));
  expect(container.querySelector('[data-control-state]')?.getAttribute('data-control-state')).toBe(
    'waiting'
  );
  expect(screen.queryByText('Result verified')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'I tried it' }));
  expect(screen.getByText('Result verified')).toBeTruthy();
});
