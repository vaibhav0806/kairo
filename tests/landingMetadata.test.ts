import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('landing metadata and brand', () => {
  test('describes the landing website in page metadata', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('<title>Kairo — Learn by doing</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('one clear next step');
    expect(html).not.toContain('cursor|overlay|notch');
  });

  test('links a local brand favicon that the static server can return', () => {
    const html = readFileSync('index.html', 'utf8');
    const favicon = readFileSync('public/favicon.svg', 'utf8');

    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg"');
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('aria-hidden="true"');
  });

  test('ships a website-only entry and dependency graph', () => {
    const entry = readFileSync('src/main.tsx', 'utf8');
    const packageJson = readFileSync('package.json', 'utf8');

    expect(entry).toContain("import { LandingPage } from './landing/LandingPage';");
    expect(entry).not.toContain('./App');
    expect(entry).not.toContain('./native');
    expect(entry).not.toContain('./notch');
    expect(entry).not.toContain('./overlay');
    expect(entry).not.toContain('./cursor');
    expect(packageJson).not.toContain('@tauri-apps');
    expect(packageJson).not.toContain('tauri:');
    expect(packageJson).not.toContain('build-dmg');
  });
});
