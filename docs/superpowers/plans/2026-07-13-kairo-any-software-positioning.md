# Kairo Any-Software Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition Kairo as an AI tutor for learning any desktop software while keeping Blender as one sharp, accurately annotated hero example.

**Architecture:** Keep the existing `LandingPage` component, CSS module, IntersectionObserver choreography, and local mock waitlist. Revise content in place, preserve animation timing, replace the undersized hero raster with a real high-resolution local Blender capture, and change only the layout/geometry rules responsible for congested rows and misaligned overlays.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vite, Vitest, macOS Blender screenshot source.

## Global Constraints

- Kairo is an AI tutor for learning any desktop software, not a desktop automation agent.
- Preserve `Learn software by doing. Not watching.` and `The AI points. You act.`
- Blender is allowed only as the labeled hero example and its attribution.
- Preserve animation timing, observer lifecycle, reduced motion, routing, and mock waitlist behavior.
- Use verified green only for confirmed learning progress.
- Do not add dependencies, run Tauri, build a native application, or create/open a Kairo `.app`.
- Leave the pre-existing untracked `test-results/` directory untouched.

## File map

- `src/landing/LandingPage.tsx`: copy, cross-tool examples, compatibility rows, hero label.
- `src/landing/LandingPage.module.css`: row layout, verification padding, image opacity, overlay geometry.
- `public/kairo-blender-preview.png`: high-resolution Blender hero source.
- `tests/landingPage.test.ts`: content, styling, geometry, and image-dimension contracts.

---

### Task 1: Reframe Kairo as the tutor for any desktop software

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: existing `LandingPage`, `ProductPreview`, `skills`, and semantic `data-motion` attributes.
- Produces: tool-agnostic product story, cross-tool chapters, and equal compatibility rows.

- [ ] **Step 1: Write failing product-story tests**

Render `LandingPage` and add these exact contracts:

```ts
expect(html).toContain('AI tutor for any desktop software / Mac alpha');
expect(html).toContain('whatever software you\'re learning');
expect(html).toContain('Example lesson / Blender');
expect(html).toContain('Why won\'t these cards resize with the frame?');
expect(html).toContain('Layers panel → Add layer mask');
expect(html).toContain('Add to Render Queue');
expect(html).toContain('Any desktop software');
expect(html).toContain('anything else on your screen');
expect(html).not.toContain('First live skill / Blender');
expect(html).not.toContain('Active / alpha');
expect(html).not.toContain('Kairo is beginning with Blender learners');
expect(html).not.toContain('Blender first.');
```

Assert that `Select cube`, `Insert keyframe`, and `Move to frame 40` occur only
inside `ProductPreview`, not in the scroll chapters.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npx vitest run tests/landingPage.test.ts`

Expected: failures for the new any-software copy and stale Blender-first copy.

- [ ] **Step 3: Replace stale product and chapter copy**

Use the approved hero copy:

```tsx
<p className={styles.eyebrow}>AI tutor for any desktop software / Mac alpha</p>
<p className={styles.heroIntro}>
  Kairo teaches you inside whatever software you're learning. Ask a question,
  point to what you mean, do the step yourself, and let Kairo check the result.
</p>
```

Change the preview label to `Example lesson / Blender`. Use Figma for the
conversation example, Photoshop for annotation, DaVinci Resolve for guidance,
and the generic steps `Find the control`, `Make the change`, and `Check the
result` for verification. Preserve existing learner-action and verification
beat order.

Replace the skills tuple list with:

```ts
const skills = [
  ['Blender', '3D · animation · rendering'],
  ['Photoshop', 'Layers · masks · retouching'],
  ['DaVinci Resolve', 'Timeline · color · delivery'],
  ['Figma', 'Frames · auto layout · components'],
  ['Any desktop software', 'If it is on your screen, you can learn it with Kairo.']
] as const;
```

Remove the status `<strong>` and update the skill-row grid to three columns.
Use section label `Software you can learn with Kairo`, heading `One tutor for
whatever you open next.`, and breadth copy `Blender, Photoshop, DaVinci
Resolve, Figma, and anything else on your screen.` Replace both Blender-first
access statements with the approved tool-agnostic access copy.

- [ ] **Step 4: Run focused and full verification**

```bash
npx vitest run tests/landingPage.test.ts
npm test
npm run typecheck
git diff --check
```

Expected: focused and full tests pass, typecheck exits 0, diff check is empty.

- [ ] **Step 5: Commit the story revision**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "feat: position Kairo for any desktop software"
```

---

### Task 2: Give verification states breathing room

**Files:**
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: `.checkRow`, `.nextRow`, `verifyrow`, and `verifynext`.
- Produces: unchanged semantic animation with padded green/violet content.

- [ ] **Step 1: Add a failing spacing contract**

```ts
expect(css).toMatch(/\.checkRow\s*\{[^}]*padding:\s*22px 24px;/s);
expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.checkRow\s*\{[^}]*padding:\s*18px 16px;/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/landingPage.test.ts`

Expected: padding expectations fail against the current `22px 0`.

- [ ] **Step 3: Apply the minimal spacing fix**

```css
.checkRow {
  padding: 22px 24px;
}

@media (max-width: 640px) {
  .checkRow {
    padding: 18px 16px;
  }
}
```

Do not change background keyframes, grid ordering, colors, or chapter padding.

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run tests/landingPage.test.ts
npm run typecheck
git diff --check
git add src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "fix: add space inside verification states"
```

Expected: focused tests and typecheck pass; only CSS/test files are committed.

---

### Task 3: Replace the blurry Blender source and align overlays

**Files:**
- Modify: `public/kairo-blender-preview.png`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: existing public asset URL and hero animation keyframes.
- Produces: high-resolution source at the same path and cube-aligned geometry.

- [ ] **Step 1: Add failing image-quality and geometry tests**

```ts
const image = readFileSync('public/kairo-blender-preview.png');
expect(image.readUInt32BE(16)).toBeGreaterThanOrEqual(1698);
expect(image.readUInt32BE(20)).toBeGreaterThanOrEqual(1054);
expect(css).toMatch(/\.softwareFrame > img\s*\{[^}]*opacity:\s*1;/s);
expect(css).toMatch(/\.kairoTarget\s*\{[^}]*top:\s*43\.5%;[^}]*left:\s*44\.8%;[^}]*width:\s*10\.7%;[^}]*aspect-ratio:\s*0\.92;/s);
expect(css).toMatch(/\.learnerAnnotation\s*\{[^}]*top:\s*39\.8%;[^}]*left:\s*39\.35%;[^}]*width:\s*21%;/s);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/landingPage.test.ts`

Expected: image dimensions, opacity, and geometry contracts fail.

- [ ] **Step 3: Capture a real high-resolution Blender viewport**

Use `/Applications/Blender.app` only as an image source:

1. Open the factory startup scene.
2. Maximize the 3D viewport while keeping the selected cube, toolbar, grid,
   camera, and light visible.
3. Capture the viewport at Retina resolution, at least 1698×1054 and preferably
   near 2400×1500.
4. Crop without scaling and save as RGB PNG at
   `public/kairo-blender-preview.png`.
5. Inspect with `sips -g pixelWidth -g pixelHeight` and `view_image`.

Do not synthetically upscale or sharpen the old 849×527 raster.

- [ ] **Step 4: Apply geometry-only CSS changes**

```css
.softwareFrame > img { opacity: 1; }
.learnerAnnotation { top: 39.8%; left: 39.35%; width: 21%; }
.kairoTarget { top: 43.5%; left: 44.8%; width: 10.7%; aspect-ratio: 0.92; }
```

If the new capture moves the cube, measure its percentage bounds and adjust
only those values plus matching test expectations. Do not change animation
durations or delays.

- [ ] **Step 5: Verify the real symptom in Vite**

Capture the hero at 1974×1012 and 390×844. Confirm the Blender UI is sharp and
full contrast; the orange circle surrounds the cube; the violet box covers the
cube; the cursor resolves to it; and the ten-second/reduced-motion states work.

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run tests/landingPage.test.ts
npm test
npm run typecheck
npm run build
git diff --check
git add public/kairo-blender-preview.png src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "fix: sharpen and align the hero example"
```

Expected: all web checks pass; no Tauri process or native artifact exists.

---

### Task 4: Browser-only final QA

**Files:**
- Modify only if a concrete regression is found: files from Tasks 1–3.

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: browser evidence and independent final approval.

- [ ] **Step 1: Verify the viewport matrix**

Use Vite at 1280×720, 1440×820, 1920×936, 1974×1012, 768×1024, and 375×812.
Check overflow, headline fit, compatibility rows, verification padding, image
clarity, and overlay alignment.

- [ ] **Step 2: Verify behavior and accessibility**

Check the hero loop, four cross-tool sequences, skill stagger, reduced motion,
no-IntersectionObserver fallback, keyboard focus, mock waitlist, and 200% zoom.

- [ ] **Step 3: Run final web verification**

```bash
npm run typecheck
npm test
npm run build
git diff --check
git status --short --branch
```

Expected: all checks pass and only pre-existing `test-results/` is untracked.

- [ ] **Step 4: Request final independent review**

Review the complete revision range against
`docs/superpowers/specs/2026-07-13-kairo-any-software-positioning-design.md`.
Fix every Critical or Important issue, rerun Step 3, and obtain approval before
claiming completion.

