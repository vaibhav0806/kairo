# Kairo Footer Wildflower Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive pixelated wildflower specimen to the right side of Kairo's footer without changing `Learn by doing.`

**Architecture:** Store one transparent WebP under `public/field-notes/`. Render it as a decorative footer layer and reuse the existing ambient visibility observer for one restrained entrance drift; CSS controls placement, cropping, and responsiveness.

**Tech Stack:** React, TypeScript, CSS Modules, Vite, Vitest, WebP

## Global Constraints

- Preserve `Learn by doing.` exactly as written and in its current position.
- Preserve the large `kairo` wordmark.
- Use one crooked stem, leaves, and one expressive bloom rendered as monochrome halftone.
- Use only a restrained acid-green fringe.
- Do not add a background, text, logos, insects, pots, or other objects.
- Keep the image behind footer content and disable motion for reduced-motion visitors.
- Add no runtime dependency.

---

### Task 1: Create the transparent wildflower asset

**Files:**
- Create: `public/field-notes/footer-wildflower.webp`

- [ ] Generate a square source on a perfectly flat `#ff6000` chroma-key background: one tall crooked wildflower stem with leaves and one expressive bloom, viewed like a scanned nineteenth-century botanical specimen, black and off-white archival engraving, visibly coarse bitmap halftone and ordered dithering, faint acid-green fringe only around the silhouette, generous padding, no shadow, text, logo, frame, insect, pot, scenery, or extra object.
- [ ] Remove the key with `${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py` using border auto-key, soft matte, thresholds `12` and `220`, and despill.
- [ ] Export a transparent WebP at least `1600px` wide to the exact project path.
- [ ] Verify with `sips -g pixelWidth -g pixelHeight -g hasAlpha public/field-notes/footer-wildflower.webp`; dimensions must be at least `1600` and `hasAlpha` must be `yes`.
- [ ] Inspect the asset and commit it as `feat: add footer wildflower artwork`.

### Task 2: Integrate the wildflower into the footer

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

- [ ] Extend the structured-footer test to assert `Learn by doing.` remains, `[data-footer-wildflower]` exists, its `src` contains `field-notes/footer-wildflower.webp`, and its `alt` is empty; run the landing test and confirm it fails first.
- [ ] Add the existing landing asset helper pattern to `LandingPage.tsx`.
- [ ] Mark the footer with `data-ambient-stage` and render a lazy decorative `<img className={styles.footerWildflower} data-footer-wildflower alt="" width="1800" height="1800">` before `.footerTop`.
- [ ] Position the asset absolutely behind `.footerTop` and the wordmark, crop it from the right edge, and transition from `translateY(5%)` to `translateY(0)` when `data-ambient-active='true'`.
- [ ] At `max-width: 760px`, move it lower, crop more from the right, and reduce opacity so the left copy remains unobstructed.
- [ ] Run `npm test -- --run`, `npm run build`, and `git diff --check`; commit as `feat: add wildflower artwork to footer`.

### Task 3: Visual verification and publishing

- [ ] Review the footer at `1440`, `768`, and `390` CSS pixels for readability, cropping, and horizontal overflow.
- [ ] Check `prefers-reduced-motion: reduce` keeps the specimen static and visible.
- [ ] Re-run `npm test -- --run`, `npm run build`, and `git diff --check` after any adjustment.
- [ ] Merge to `main`, push to the `kairo` remote, remove the feature worktree, and verify the existing live preview returns HTTP `200`.
