# Kairo Hero and Tool Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten responsive hero spacing, reveal the four tool prints progressively on scroll, and replace the repeated practice heading.

**Architecture:** Reuse the existing `LandingPage` intersection observer and CSS-module motion system. Add a dedicated `data-tool-reveal` marker for nested tool prints so their entrance state does not conflict with section-level reveals or their authored paper rotations.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vitest, Testing Library, Vite

## Global Constraints

- Preserve the approved crisp-white organic editorial direction and current imagery.
- Do not add animation dependencies.
- Motion must be transform/opacity only and disabled under reduced motion.
- Preserve all existing focus, waitlist, responsive, and website-only behavior.

---

### Task 1: Responsive hero rhythm

**Files:**
- Modify: `src/landing/Hero.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: existing `.hero`, `.copy`, `.environment`, and `@media (min-width: 1180px)` rules
- Produces: top-aligned desktop layout with viewport-height-based optical spacing

- [ ] Add a failing CSS-contract test asserting `align-items: start`, viewport-height-aware hero top padding, and a desktop-only copy offset.
- [ ] Run `npm test -- --run tests/landingPage.test.ts` and confirm the new assertion fails.
- [ ] Update the hero spacing rules using `clamp()` and keep mobile gutters unchanged.
- [ ] Run the focused test and confirm it passes.

### Task 2: Progressive tool-print reveal

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/VisualField.tsx`
- Modify: `src/landing/VisualField.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: the existing `data-revealed` attribute written by `LandingPage` observers
- Produces: four `[data-tool-reveal]` figures independently observed and revealed once

- [ ] Add failing tests asserting four reveal markers and observer registration for a representative tool print.
- [ ] Add failing CSS assertions for opacity/transform entrance, authored final rotations, 400 ms-or-shorter easing, and reduced-motion final visibility.
- [ ] Run the focused tests and confirm failure.
- [ ] Include `[data-tool-reveal]` in the existing reveal query and add the marker to each tool figure.
- [ ] Add motion-safe CSS that preserves each print's final rotation and does not animate layout properties.
- [ ] Run the focused tests and confirm they pass.

### Task 3: Practice heading and full verification

**Files:**
- Modify: `src/landing/VisualField.tsx`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Produces: the accessible section name `Keep making. Keep learning.`

- [ ] Update the heading regression test to expect `Keep making. Keep learning.` and reject the old repeated heading.
- [ ] Change only the practice section `<h2>` copy.
- [ ] Run `npm test -- --run` and expect all tests to pass.
- [ ] Run `npm run typecheck`, `npm run build`, and `git diff --check`.
- [ ] Review at 375 px, 768 px, and 1280 px, including reduced motion.
- [ ] Commit the implementation without co-author trailers.
