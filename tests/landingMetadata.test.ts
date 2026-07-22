import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('landing metadata and brand', () => {
  test('describes the landing website in the root layout metadata', () => {
    const layout = readFileSync('src/app/layout.tsx', 'utf8');

    expect(layout).toMatch(/export\s+const\s+metadata(?:\s*:\s*Metadata)?\s*=\s*\{/);
    expect(layout).toMatch(/title:\s*['"]Kairo — Learn any creative tool['"]/);
    expect(layout).toMatch(
      /description:\s*['"]Talk to Kairo, show it what you mean, and get visual guidance directly on your screen\.['"]/
    );
    expect(layout).toMatch(/icons?\s*:\s*(?:\{\s*icon\s*:\s*)?['"]\/favicon\.svg['"]/);
    expect(layout).toMatch(/import\s+['"]@fontsource-variable\/geist['"];?/);
    expect(layout).toMatch(/import\s+['"]@fontsource-variable\/bricolage-grotesque['"];?/);
    expect(layout).toMatch(/import\s+['"]@fontsource-variable\/geist-mono['"];?/);
    expect(layout).not.toMatch(/instrument-serif/);
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
    expect(favicon).toContain('viewBox="0 0 32 32"');
    expect(favicon).toContain('#141824');
    expect(favicon).toContain('#665CFF');
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

  test('ships truthful privacy and interim license routes', () => {
    const privacy = readFileSync('src/app/privacy/page.tsx', 'utf8');
    const license = readFileSync('src/app/license/page.tsx', 'utf8');

    expect(privacy).toContain('Privacy notice');
    expect(privacy).toContain('email address');
    expect(privacy).toContain('early access');
    expect(privacy).toContain('July 22, 2026');
    expect(privacy).toContain('href="/license"');
    expect(license).toContain('License status');
    expect(license).toContain('has not selected a software license yet');
    expect(license).toContain('default copyright');
    expect(license).toContain('href="/privacy"');
  });

  test('ships a Next.js website-only dependency graph', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.dependencies).not.toHaveProperty('vite');
    expect(packageJson.devDependencies).not.toHaveProperty('vite');
    expect(packageJson.scripts.dev).toBe('next dev');
    expect(packageJson.scripts.build).toBe('next build');
    expect(packageJson.scripts.start).toBe('next start');
    expect(packageJson.dependencies.next).toBeTruthy();
    expect(packageJson.dependencies.motion).toBe('^12.42.2');
    expect(packageJson.dependencies['perfect-freehand']).toBe('^1.2.3');
    expect(packageJson.dependencies['@fontsource-variable/bricolage-grotesque']).toBe('^5.3.0');
    expect(packageJson.dependencies['@fontsource-variable/geist-mono']).toBe('^5.3.0');
    expect(packageJson.dependencies).not.toHaveProperty('@fontsource/instrument-serif');
    expect(packageJson.devDependencies).not.toHaveProperty('@vitejs/plugin-react');
    expect(Object.values(packageJson.scripts).join('\n')).not.toMatch(/\bvite(?:\s|$)/);
    expect(JSON.stringify(packageJson)).not.toContain('@tauri-apps');
    expect(JSON.stringify(packageJson)).not.toContain('tauri:');
    expect(JSON.stringify(packageJson)).not.toContain('build-dmg');
  });
});
