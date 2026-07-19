// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ProductMoments } from '../src/landing/ProductMoments';
import { installBrowserEnvironment } from './helpers/browserEnvironment';

afterEach(cleanup);
beforeEach(() => installBrowserEnvironment());

describe('Living Canvas interactions', () => {
  test('keeps product moments manual and explains the selected scene', () => {
    const { container } = render(createElement(ProductMoments));
    expect(container.querySelector('[data-moment-state]')?.getAttribute('data-moment-state')).toBe(
      'ask'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Point together' }));
    expect(container.querySelector('[data-moment-state]')?.getAttribute('data-moment-state')).toBe(
      'point'
    );
    expect(screen.getByText(/circle an exact region/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Replay product moment' })).toBeTruthy();
  });
});
