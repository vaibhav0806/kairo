# Kairo Warm Field Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans and implement one task at a time.

**Goal:** Replace the template-like landing page with one product-led story that clearly communicates Kairo's ask/point/guide/act/check teaching loop and its universal-base-plus-product-skills model.

**Architecture:** Keep the existing `LandingPage` route, component, CSS module, hero image, and local waitlist state. Recompose the page around a full-width hero, one continuous lesson spine, one two-layer product-skills model, one trust note, and the existing waitlist. Keep motion inside product demonstrations and remove generic marketing reveals.

**Tech stack:** React 19, TypeScript, CSS Modules, Vite, Vitest.

## Constraints

- Follow `docs/superpowers/specs/2026-07-13-kairo-warm-field-guide-design.md`.
- Preserve the high-resolution `public/kairo-blender-preview.webp` and its native `3560 / 1972` preview ratio.
- Preserve `/` for the landing page and `#/app` for the internal product shell.
- Preserve local-only waitlist validation, preview disclosure, success state, and optional role controls.
- Do not add dependencies, build Tauri, run Tauri, or create/open a native `.app`.
- Leave the pre-existing untracked `test-results/` directory untouched.
- Match the current formatting style and avoid unrelated refactors.

## File map

- `src/landing/LandingPage.tsx`: new story, lesson spine, product-skills model, trust note, waitlist copy, observer targets.
- `src/landing/LandingPage.module.css`: Warm Field Guide layout, typography, compact product states, responsive behavior, causal motion.
- `tests/landingPage.test.ts`: product-promise, content structure, motion, image, form, and accessibility contracts.

---

### Task 1: Rebuild the product story and semantic structure

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `tests/landingPage.test.ts`

- [ ] Add failing tests for the exact five-beat order: `You ask or point`, `Kairo understands`, `One next step`, `You do it`, `Kairo checks`.
- [ ] Add failing tests for the exact universal-versus-product-skill model, all four product examples, and the closing any-software statement.
- [ ] Add failing absence checks for the old `Talk / Draw / Understand / Guide / Verify` strip, four fabricated app stages, principles grid copy, and three trust-card headings.
- [ ] Add failing tests for the revised human hero labels, CTA copy, differentiation statement, waitlist heading, and mock disclosure.
- [ ] Replace the old page sections with the header, full-width hero, immediate differentiation, one Figma lesson spine, two-layer product-skills model, compact trust note, and waitlist defined in the design specification.
- [ ] Retain `ProductPreview`, form validation, success state, role buttons, and semantic landmarks.
- [ ] Run `npx vitest run tests/landingPage.test.ts` and `npm run typecheck`.
- [ ] Commit as `feat: rebuild the landing page around one lesson`.

### Task 2: Apply the Warm Field Guide visual system

**Files:**
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/landingPage.test.ts`

- [ ] Add failing CSS contracts for full-width hero flow, warm graphite, restrained semantic colors, unboxed text CTAs, lesson spine, stacking skills layers, and mobile behavior.
- [ ] Remove styling for deleted feature grids and fabricated app interfaces.
- [ ] Implement the full-width editorial hero above the native-ratio product canvas.
- [ ] Implement one continuous lesson spine with compact learner, Kairo, action, and verified states.
- [ ] Implement the base-tutor and product-skill layers with rules and spacing instead of cards.
- [ ] Replace the three trust cards with one compact ruled note.
- [ ] Restyle waitlist controls as one coherent input/action row while preserving native semantics and 44px targets.
- [ ] Ensure only the hero is display-sized; later headings are smaller and conversational.
- [ ] Run the focused tests at desktop-oriented and CSS-contract level, then run `npm run typecheck` and `git diff --check`.
- [ ] Commit as `feat: apply the warm field guide visual system`.

### Task 3: Make motion causal and product-specific

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Modify: `tests/landingPage.test.ts`

- [ ] Add failing tests that reject `data-reveal`, generic section fade-up keyframes, and software-row slide-in keyframes.
- [ ] Add failing tests for the ordered lesson-state motion target and final readable reduced-motion state.
- [ ] Replace the generic reveal observer with an observer for the lesson sequence only; keep the hero preview visibility and page-visibility controls.
- [ ] Animate the five lesson states in causal order using short opacity/position changes.
- [ ] Keep marketing copy and software rows static.
- [ ] Ensure the hero demo pauses offscreen and when the page is hidden.
- [ ] Ensure `prefers-reduced-motion` renders final product states without transitions or animation.
- [ ] Run `npx vitest run tests/landingPage.test.ts`, `npm run typecheck`, and `git diff --check`.
- [ ] Commit as `feat: focus landing motion on the lesson`.

### Task 4: Full browser-only verification and independent review

**Files:**
- Modify only if a concrete regression is found in Tasks 1–3 files.

- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- [ ] Verify no stale Blender-first or generic AI-assistant language remains outside the labeled hero example and skills row.
- [ ] Verify the high-resolution image asset, native aspect ratio, overlay alignment contracts, keyboard focus, form labels/errors, and mock disclosure.
- [ ] Verify the design at wide desktop, 100% laptop scale, tablet, and mobile in the web-only Vite route when a browser backend is available.
- [ ] If browser control remains unavailable, report that limitation explicitly and request one refreshed screenshot rather than claiming visual verification.
- [ ] Request an independent spec/code review and resolve any concrete issue.
- [ ] Commit only if review or verification requires a fix.

## Completion criteria

- The page visibly teaches one coherent ask-to-check lesson.
- Universal screen-based guidance and deeper product skills are distinct and understandable.
- The layout no longer uses the old split hero, process strip, alternating feature stages, principle cards, trust cards, or generic reveal choreography.
- The Blender example remains sharp, correctly aligned, and explicitly labeled as one lesson example.
- The mock waitlist remains functional and honest.
- All automated checks pass, and any visual-QA limitation is reported accurately.
