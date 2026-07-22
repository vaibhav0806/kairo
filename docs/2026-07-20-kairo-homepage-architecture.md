# Kairo Homepage Architecture

**Status:** Approved for section-by-section implementation
**Date:** 2026-07-20
**Depends on:** [Kairo Living Canvas](./2026-07-20-kairo-living-canvas-system.md)

## Objective

Keep the homepage short while progressing from product clarity to product proof, breadth, and conversion. The approved navbar, hero, and `#understand` section remain unchanged. The lower page adds two more product chapters and one compact finish.

The navbar, hero, and `#understand` section are locked. Remaining sections are implemented and approved one at a time; work does not advance to the next section until the current section is visually approved.

## Proposed page architecture

### 1. Kairo sees what you mean

**Anchor:** `#understand`
**Job:** Make screen context, spoken questions, and spatial pointing understandable in one glance.

Use one wide, authentic creative-tool recording. A short spoken question appears, a location is selected, and one Kairo response attaches to that exact area. This is not another artifact collage.

Motion plays once when the section becomes visible: question, selection, connector, response. It pauses offscreen and provides replay or pause. Mobile places the recording first and the complete transcript below it.

### 2. You make the move

**Anchor:** `#learn`
**Job:** Explain guided tutorials and the fact that Kairo waits for the learner.

This is the page's one GSAP-led signature sequence. A real tool workspace remains visually stable while three semantic states advance:

- Explain
- Wait
- Check

The copy remains blunt: Kairo gives the next move. You do it. Kairo checks the result.

On capable desktop layouts, ScrollTrigger pins the real workspace for a short sequence and synchronizes the state changes. The stage should occupy roughly 1.6 to 1.8 scroll viewports, not an extended cinematic chapter. Direct controls remain available. Mobile and reduced-motion layouts use a compact tab rail above one 4:3 capture with no pinning or autoplay.

### 3. Same help, different canvas

**Anchor:** `#travel`
**Job:** Prove breadth across After Effects, DaVinci Resolve, Blender, and Figma.

Use an asymmetric contact sheet with one dominant real capture and three narrow offcuts. Selecting a tool promotes its capture into the main stage and changes one specific learner question. Do not use four equal feature cards.

Motion uses shared-layout promotion through Motion. Only the active clip plays. Mobile uses one main stage and a horizontally scrollable thumbnail rail with the active name and filename always visible.

### 4. Built to teach. Built in the open.

**Anchor:** `#access`
**Job:** Establish the open-source direction and convert interested learners.

Combine the GitHub statement and alpha invitation into one calm final section. Use the real repository link, a short founder note, one email field, and one primary intent: Request alpha access. Do not invent stars, learner quotes, customer proof, or unsupported availability claims.

Motion is limited to link feedback and honest form pending, success, and error states. The footer follows immediately and stays compact.

## Page rhythm

- Hero: energetic, spatial, interactive.
- Understand: focused causal proof.
- Learn: the signature guided sequence.
- Travel: playful breadth and shared motion.
- Access: quiet, credible, decisive.

The page remains on a light canvas. Rhythm comes from density, scale, and motion rather than switching into an unrelated dark theme.

## Current-page changes

- Merge the current Notice and Guided Lesson demonstrations into one authentic guided sequence.
- Keep the context message but replace the four equal context cards with a short visual cause-and-effect bridge.
- Replace synthetic Tool Travel scenes with authentic captures.
- Remove chapter numbers and repeated section-label formulas.
- Remove the dark-theme Guided Lesson and Tool Travel visual worlds.
- Remove fake learner-note quotes from the alpha section.
- Keep the footer drawing as a small signature moment instead of the entire footer.
- Avoid a second hero-like collage below the fold.

## Asset plan

Before implementation, define the exact problem shown in each capture.

- Understand: one short real screen recording with a visible, specific stuck moment.
- Learn: one real before, learner-action, and verified sequence from the same tool and project.
- Travel: four authentic tool captures with one concrete problem and filename each.
- Access: optional real repository crop only if it remains legible; otherwise use the GitHub mark and text.

The current hero assets can act as layout placeholders, but the lower page should not simply repeat the same crop in the final version.

## Implementation order

1. Approve this page architecture.
2. Lock the exact Understand and Learn stories before writing animation code.
3. Gather or capture the authentic media.
4. Build the static desktop, tablet, and mobile compositions.
5. Add Motion interactions.
6. Add the single GSAP sequence and its fallbacks.
7. Connect the final alpha state and verify the complete page.
8. Use Kimi as a critique checkpoint on a concrete full-page build, then filter its advice through the design system.

## Acceptance checks

- Each section has one new job and does not repeat the hero.
- The product is understandable without watching every animation.
- Every moving sequence has a static complete state.
- Media is real and locally optimized.
- No section feels like a generic SaaS component block.
- The page keeps one persistent accent and one visual world.
- Touch, keyboard, reduced-motion, and short-height layouts remain complete.
- The lower page does not make the overall experience feel long or heavy.
