import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('overlay styles', () => {
  test('keeps annotation toolbar below the macOS menu area', () => {
    const styles = readFileSync('src/styles.css', 'utf8');

    expect(styles).toContain('top: 56px;');
    expect(styles).toContain('max-width: calc(100vw - 32px);');
  });
});
