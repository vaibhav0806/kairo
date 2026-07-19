// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CapabilityStage } from '../src/landing/CapabilityStage';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

test('changes one capability stage through labelled tabs', () => {
  const { container } = render(createElement(CapabilityStage));
  const talk = screen.getByRole('tab', { name: 'Talk' });
  fireEvent.keyDown(talk, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'See' }).getAttribute('aria-selected')).toBe('true');
  expect(container.querySelector('[data-capability]')?.getAttribute('data-capability')).toBe('see');
  expect(screen.queryByText('Take over the task')).toBeNull();
});
