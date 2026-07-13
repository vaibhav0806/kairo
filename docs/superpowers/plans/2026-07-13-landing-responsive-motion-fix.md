# Kairo Landing Responsive Motion Fix Plan

> **For agentic workers:** Use superpowers:subagent-driven-development and superpowers:test-driven-development. Work task-by-task on `main`.

**Goal:** Make the hero fit normal laptop/desktop viewports and restore the approved product and scroll animation language.

**Root causes:** The hero headline uses full-viewport `vw` sizing inside a 39%-wide grid column, while the product frame has a fixed 640px minimum height. The production product preview is a static PNG with only waveform bars animated. Scroll observers work, but they only trigger generic parent/child fades; the approved causal sequences were never implemented.

**Constraints:** React/Vite website only. No native app build, new dependencies, scroll-jacking, scroll snap, wheel interception, gradients, fake footage, or changes outside landing files/tests. Preserve reduced-motion and no-IntersectionObserver static fallbacks.

---

### Task 1: Make the hero responsive to its column and viewport height

**Files:**
- Modify: `tests/landingPage.test.ts`
- Modify: `src/landing/LandingPage.module.css`

- [ ] Add a failing style-contract test that requires:

```ts
expect(css).toMatch(/\.herocopy\s*\{[^}]*container-type:\s*inline-size;/);
expect(css).toMatch(/\.landingpage h1\s*\{[^}]*font-size:\s*clamp\(3\.5rem,\s*17cqi,\s*7rem\);/);
expect(css).toMatch(/\.softwareframe\s*\{[^}]*min-height:\s*clamp\(480px,\s*calc\(100svh - 240px\),\s*640px\);/);
```

- [ ] Run `npm test -- tests/landingPage.test.ts` and record RED.

- [ ] Implement only:

```css
.heroCopy {
  container-type: inline-size;
}

.landingPage h1 {
  font-size: clamp(3.5rem, 17cqi, 7rem);
}

.softwareFrame {
  min-height: clamp(480px, calc(100svh - 240px), 640px);
}
```

Keep the existing mobile override and <=980px aspect-ratio behavior.

- [ ] Run focused test, typecheck, and production build. Measure 1280×720, 1440×820, 1920×936, and the user's ~1974×1012 viewport. Verify the full hero, preview, and CTAs fit; “Not watching.” stays on one line; no horizontal overflow.

- [ ] Commit as `fix: make landing hero viewport responsive`.

---

### Task 2: Restore the product-demo loop and causal scroll choreography

**Files:**
- Modify: `tests/landingPage.test.ts`
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`

- [ ] Add failing markup/style contract tests for:

```ts
expect(html).toContain('data-motion="conversation"');
expect(html).toContain('data-motion="annotation"');
expect(html).toContain('data-motion="guidance"');
expect(html).toContain('data-motion="verification"');
expect(html).toContain('data-motion="skills"');
expect(html).toContain('<svg');
expect(css).toContain('@keyframes herodraw');
expect(css).toContain('@keyframes herotarget');
expect(css).toContain('@keyframes herocursor');
expect(css).toContain('@keyframes conversationin');
expect(css).toContain('@keyframes annotationdraw');
expect(css).toContain('@keyframes cursortravel');
expect(css).toContain('@keyframes verifyrow');
expect(css).toContain('@keyframes skillin');
expect(css).toContain("[data-demo-active='true'][data-page-visible='true']");
```

- [ ] Run `npm test -- tests/landingPage.test.ts` and record RED.

- [ ] Replace the hero's fully drawn annotation div with an inline SVG path. Keep the PNG as an honestly labeled backdrop. Drive this visible loop only while the preview and page are visible:

1. learner question enters;
2. orange SVG annotation draws;
3. violet target resolves and pulses;
4. ghost cursor travels toward the target;
5. notch instruction enters;
6. progress rail verifies the completed step;
7. loop resets without a hard flash.

Base/offscreen state remains the final readable composition. Apply looping keyframes only under:

```css
.landingPage[data-demo-active='true'][data-page-visible='true']
```

- [ ] Add semantic `data-motion` values to the four chapters. Replace generic child timing with distinct one-shot sequences triggered by `[data-visible='true']`:

- `conversation`: learner question → Kairo response → learner action/verification;
- `annotation`: orange SVG path draws → violet resolved answer appears;
- `guidance`: spoken guidance/notch → target control → cursor travel → learner action;
- `verification`: completed rows turn green in order → next row becomes violet/current.

Every chapter must render its final state without JavaScript or with reduced motion.

- [ ] Move `data-reveal` from each skill row to the skill list container, add `data-motion="skills"`, and assign each row `--skill-index`. Reveal rows horizontally with 100ms index-based delays. The list remains static and fully visible without motion enhancement.

- [ ] Add subtle one-shot reveal attributes to the problem transition, section headers, difference, trust, and access sections so the full page has motion continuity without turning every element into spectacle.

- [ ] Extend reduced-motion CSS to set SVG dash offsets, opacity, transforms, colors, and all causal children to their final state. No essential text may remain hidden.

- [ ] Run focused tests, typecheck, full Vitest suite, production build, and diff check. In Chrome, verify each key element changes position/opacity/stroke between sampled frames and every sequence settles visibly.

- [ ] Commit as `fix: restore landing motion choreography`.

---

### Task 3: Web-only visual verification

**Files:**
- Modify only if a reproduced web defect needs a failing test and focused fix.

- [ ] Run the existing Vite website only. Do not run Tauri or build a `.app`.
- [ ] Capture 1280×720, 1440×820, 1920×936, 1974×1012, 768×1024, and 375×812.
- [ ] Verify hero fit, product sequence, all scroll chapters, skill cascade, waitlist, reduced motion, keyboard focus, and 200% zoom.
- [ ] Run `npm run typecheck`, `npm run test`, `npm run build`, and `git diff --check` fresh.
- [ ] Commit only a test-backed focused web fix if QA finds one.
