import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('overlay styles', () => {
  test('keeps annotation toolbar below the macOS menu area', () => {
    const styles = readFileSync('src/styles.css', 'utf8');

    expect(styles).toContain('top: 52px;');
    expect(styles).toContain('max-width: calc(100vw - 32px);');
    expect(styles).toContain('min-height: 42px;');
  });

  test('uses one stable notch card shell with persistent controls', () => {
    const styles = readFileSync('src/styles.css', 'utf8');

    expect(styles).toContain('min-height: 196px;');
    expect(styles).toContain('grid-template-columns: 18px minmax(0, 1fr) 42px;');
    expect(styles).toContain('min-height: 48px;');
    expect(styles).toContain('.notch-tool-row');
  });
});
