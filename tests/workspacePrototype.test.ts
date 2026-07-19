// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { VioletThread } from '../src/landing/violet-thread/VioletThread';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('Violet Thread prototype', () => {
  test('renders a semantic path for each instructional state', () => {
    const { rerender } = render(createElement(VioletThread, { state: 'notice' }));
    const thread = document.querySelector('[data-violet-thread]');
    expect(thread?.getAttribute('data-thread-state')).toBe('notice');
    expect(thread?.querySelector('path')?.getAttribute('d')).toBeTruthy();

    rerender(createElement(VioletThread, { state: 'verify' }));
    expect(thread?.getAttribute('data-thread-state')).toBe('verify');
    expect(thread?.getAttribute('data-thread-verified')).toBe('true');
  });
});
