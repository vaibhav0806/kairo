import { describe, expect, test } from 'vitest';
import { resolveRootRoute } from '../src/rootRoute';

describe('root route selection', () => {
  test.each([
    ['', 'landing'],
    ['#/', 'landing'],
    ['#/app', 'app'],
    ['#/notch', 'notch'],
    ['#/overlay', 'overlay'],
    ['#/cursor', 'cursor']
  ] as const)('maps %s to %s', (hash, expected) => {
    expect(resolveRootRoute(hash)).toBe(expected);
  });

  test('uses the landing page for unknown browser hashes', () => {
    expect(resolveRootRoute('#/unknown')).toBe('landing');
  });
});
