import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('overlay styles', () => {
  test('keeps annotation toolbar below the macOS menu area', () => {
    const styles = readFileSync('src/styles.css', 'utf8');

    expect(styles).toContain('top: 52px;');
    expect(styles).toContain('max-width: calc(100vw - 32px);');
    expect(styles).toContain('min-height: 42px;');
  });

  test('reserves enough notch space for the captured prompt row', () => {
    const styles = readFileSync('src/styles.css', 'utf8');

    expect(styles).toContain('min-height: 158px;');
    expect(styles).toContain('min-height: 48px;');
  });
});
