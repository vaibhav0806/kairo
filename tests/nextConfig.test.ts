import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('Next.js project configuration', () => {
  test('pins Turbopack to this repository root', () => {
    const configPath = 'next.config.ts';

    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const config = readFileSync(configPath, 'utf8');
    expect(config).toMatch(/turbopack\s*:\s*\{/);
    expect(config).toMatch(/root\s*:\s*process\.cwd\(\)/);
  });
});
