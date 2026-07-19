// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ControlMoment } from '../src/landing/ControlMoment';
import { FooterMark } from '../src/landing/FooterMark';
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

test('reveals the footer phrase through an explicit control', () => {
  render(createElement(FooterMark));
  fireEvent.click(screen.getByRole('button', { name: 'Draw Kairo footer mark' }));
  expect(screen.getByText('go make something.')).toBeTruthy();
});
