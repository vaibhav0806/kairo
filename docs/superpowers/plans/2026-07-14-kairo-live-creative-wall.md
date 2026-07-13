# Kairo Live Creative Wall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Kairo's abstract visual placeholders with licensed creative media, recognisable app fragments, and persistent product motion.

**Architecture:** Keep the existing React landing page and CSS module. Add four local image assets, drive the sticky lesson stage from the existing active-scene state, and keep animation in CSS so no dependency is added.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules, Vitest.

## Global Constraints

- Preserve the real Blender hero preview and mock waitlist behavior.
- Add no runtime dependency.
- Keep the off-white canvas and semantic orange/violet/green/blue roles.
- Respect reduced motion and never hide structural content.

---

### Task 1: Add licensed visual assets

**Files:**
- Create: `public/creative-3d.jpg`
- Create: `public/creative-design.jpg`
- Create: `public/creative-edit.jpg`
- Create: `public/creative-layout.jpg`
- Modify: `src/landing/LandingPage.tsx`

- [x] Download the four 1600px Pexels images named in the design spec.
- [x] Add descriptive alt text and visible creator credits linked to each Pexels page.
- [x] Assert the local images and credits in `tests/landingPage.test.ts`.

### Task 2: Build the living media lesson stage

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

- [x] Render the three lesson images in the sticky canvas with active-state data attributes.
- [x] Crossfade and scale images as `activeScene` changes.
- [x] Animate the orange annotation, violet target/cursor, and green check over the active image.
- [x] Keep the full scroll sequence visible on mobile and reduced-motion users.

### Task 3: Replace decorative app posters with micro-demos

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

- [x] Add one visual-window fragment to each app tile.
- [x] Animate selection, layer reveal, playhead movement, and frame reflow on viewport entry and hover.
- [x] Keep labels and descriptions readable at 390px.

### Task 4: Energise the close and verify

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

- [x] Add app-choice chips above the waitlist form without changing mock submission semantics.
- [x] Run `npm test` and expect all tests to pass.
- [x] Run `npm run build` and expect a successful Vite production build.
- [x] Browser-review 1440x900, 768x1024, and 390x844, including reduced motion.
