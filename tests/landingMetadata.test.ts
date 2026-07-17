import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('landing metadata and brand', () => {
  test('describes the landing website in the root layout metadata', () => {
    const layout = readFileSync('src/app/layout.tsx', 'utf8');

    expect(layout).toMatch(/export\s+const\s+metadata(?:\s*:\s*Metadata)?\s*=\s*\{/);
    expect(layout).toMatch(/title:\s*['"]Kairo — Learn by doing['"]/);
    expect(layout).toMatch(/description:\s*['"]Ask Kairo about what is on your screen and get one clear next step while you learn\.['"]/);
    expect(layout).toMatch(/icons?\s*:\s*(?:\{\s*icon\s*:\s*)?['"]\/favicon\.svg['"]/);
    expect(layout).toMatch(/import\s+['"]@fontsource-variable\/geist['"];?/);
    expect(layout).toMatch(/import\s+['"]@fontsource\/instrument-serif['"];?/);
    expect(layout).toMatch(/import\s+['"]\.\.\/styles\.css['"];?/);
    expect(layout).toMatch(/<html\s+lang=['"]en['"]>/);
    expect(layout).not.toMatch(/cursor|overlay|notch/i);
  });

  test('uses a local brand favicon that the public server can return', () => {
    const layout = readFileSync('src/app/layout.tsx', 'utf8');
    const favicon = readFileSync('public/favicon.svg', 'utf8');

    expect(layout).toContain('/favicon.svg');
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('aria-hidden="true"');
  });

  test('renders the landing page from the Next.js route', () => {
    const page = readFileSync('src/app/page.tsx', 'utf8');

    expect(page).toMatch(/import\s+\{\s*LandingPage\s*\}\s+from\s+['"]\.\.\/landing\/LandingPage['"]/);
    expect(page).toMatch(/<LandingPage\s*\/>/);
    expect(page).not.toContain('./App');
    expect(page).not.toContain('./native');
    expect(page).not.toContain('./notch');
    expect(page).not.toContain('./overlay');
    expect(page).not.toContain('./cursor');
  });

  test('ships a Next.js website-only dependency graph', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.scripts.dev).toBe('next dev');
    expect(packageJson.scripts.build).toBe('next build');
    expect(packageJson.scripts.start).toBe('next start');
    expect(packageJson.dependencies.next).toBeTruthy();
    expect(packageJson.devDependencies).not.toHaveProperty('@vitejs/plugin-react');
    expect(Object.values(packageJson.scripts).join('\n')).not.toMatch(/\bvite(?:\s|$)/);
    expect(JSON.stringify(packageJson)).not.toContain('@tauri-apps');
    expect(JSON.stringify(packageJson)).not.toContain('tauri:');
    expect(JSON.stringify(packageJson)).not.toContain('build-dmg');
  });
});
