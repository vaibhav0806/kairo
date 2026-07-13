import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('landing metadata and brand', () => {
  test('describes the product in page metadata', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('<title>Kairo — Learn software by doing</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('screen-native AI tutor');
    expect(html).toContain("/^#\\/(cursor|overlay|notch)/");
  });

  test('records the approved semantic brand roles', () => {
    const brand = readFileSync('brand.md', 'utf8');
    expect(brand).toContain('#F5F4EF');
    expect(brand).toContain('#FF6547');
    expect(brand).toContain('#8B79FF');
    expect(brand).toContain('#78CAAA');
    expect(brand).toContain('Learn software by doing. Not watching.');
  });
});
