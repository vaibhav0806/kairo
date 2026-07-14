# Kairo Botanical Apron Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing meadow photograph a richer, sharper lower-right layer behind the hero product window without changing the hero structure.

**Architecture:** Reuse the existing decorative `.meadowEdge` element and the hero's existing `data-ambient-active` and `data-page-visible` state. Keep the implementation CSS-only, with regression tests that protect the desktop treatment, mobile crop, and motion fallbacks.

**Tech Stack:** React 19, CSS Modules, Vitest, TypeScript, Vite

## Global Constraints

- Keep `meadow-edge.webp`; do not add assets or markup.
- Desktop meadow size is `88%` width and `42%` height.
- Mobile meadow size is `100%` width and `30%` height.
- Use the existing meadow element for the soft top-and-left mask and ambient motion.
- Do not change the hero copy, product window, Blender animation, or primary photograph.
- Keep the code change in one dedicated, revertible commit.

---

### Task 1: Botanical apron styling and regression coverage

**Files:**
- Modify: `tests/landingPage.test.ts`
- Modify: `src/landing/Hero.module.css`

**Interfaces:**
- Consumes: Existing `.meadowEdge`, `[data-ambient-active='true']`, `[data-page-visible='false']`, `@media (max-width: 760px)`, and `@media (prefers-reduced-motion: reduce)` selectors.
- Produces: A richer decorative meadow layer with no React or markup changes.

- [ ] **Step 1: Write failing CSS-contract tests**

Add a test that extracts the base, mobile, page-hidden, and reduced-motion rules and asserts the approved values:

```ts
test('uses a vivid botanical apron behind the hero product window', () => {
  const css = readFileSync('src/landing/Hero.module.css', 'utf8');
  const meadow = css.match(/\.meadowEdge\s*\{([^}]*)\}/s)?.[1] ?? '';
  const mobile = css.match(/@media\s*\(max-width:\s*760px\)[\s\S]*?(?=@media\s*\(prefers-reduced-motion:\s*no-preference\))/)?.[0] ?? '';
  const reduced = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*$/)?.[0] ?? '';

  expect(meadow).toMatch(/width:\s*88%;/);
  expect(meadow).toMatch(/height:\s*42%;/);
  expect(meadow).toMatch(/opacity:\s*0\.88;/);
  expect(meadow).toMatch(/filter:\s*saturate\(1\.05\)\s*contrast\(1\.02\);/);
  expect(meadow).toMatch(/mask-image:\s*radial-gradient\(/);
  expect(meadow).toMatch(/transform:\s*translateY\(8px\)\s*scale\(1\.02\);/);
  expect(css).toMatch(/\[data-ambient-active='true'\]\s+\.meadowEdge\s*\{[^}]*transform:\s*translateY\(0\)\s*scale\(1\);/s);
  expect(css).toMatch(/:global\(\[data-page-visible='false'\]\)\s+\.meadowEdge\s*\{[^}]*transition:\s*none;/s);
  expect(mobile).toMatch(/\.meadowEdge\s*\{[^}]*width:\s*100%;[^}]*height:\s*30%;/s);
  expect(reduced).toMatch(/\.meadowEdge\s*\{[^}]*transition:\s*none;[^}]*transform:\s*none;/s);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --run tests/landingPage.test.ts`

Expected: FAIL because the current meadow is `71%` wide, `32%` tall, blurred, and lacks its own ambient transform rules.

- [ ] **Step 3: Implement the CSS-only botanical apron**

Update the base meadow rules:

```css
.meadowEdge {
  position: absolute;
  z-index: -1;
  right: -2%;
  bottom: 0;
  width: 88%;
  height: 42%;
  object-fit: cover;
  object-position: center 60%;
  opacity: 0.88;
  filter: saturate(1.05) contrast(1.02);
  mask-image: radial-gradient(ellipse 96% 92% at 100% 100%, black 18%, black 58%, transparent 100%);
  transform: translateY(8px) scale(1.02);
  transform-origin: right bottom;
  transition: transform 1800ms cubic-bezier(.2,.7,.2,1);
}

[data-ambient-active='true'] .meadowEdge {
  transform: translateY(0) scale(1);
}

:global([data-page-visible='false']) .meadowEdge {
  transition: none;
}
```

In the existing mobile media query, keep the element edge-to-edge and restrain its height:

```css
.meadowEdge {
  right: 0;
  width: 100%;
  height: 30%;
  opacity: 0.82;
}
```

In the existing reduced-motion media query, remove the ambient transition and transformed start state:

```css
.meadowEdge {
  transition: none;
  transform: none;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- --run tests/landingPage.test.ts`

Expected: PASS with all landing-page tests green.

- [ ] **Step 5: Verify the complete landing page**

Run: `npm test -- --run && npm run typecheck && npm run build && git diff --check`

Expected: all tests pass, TypeScript exits successfully, Vite produces `dist/`, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Commit the isolated treatment**

```bash
git add src/landing/Hero.module.css tests/landingPage.test.ts
git commit -m "feat: strengthen hero botanical layer"
```
