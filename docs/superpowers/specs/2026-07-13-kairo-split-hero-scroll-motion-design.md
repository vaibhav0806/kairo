# Kairo Split Hero and Scroll Motion Design

## Goal

Restore a strong side-by-side relationship between the product promise and the Blender lesson while making scroll motion clearly perceptible throughout the page. Preserve the Warm Field Guide visual system, product story, sharp Blender source, responsive behavior, waitlist, and accessibility work already approved.

## Why the current version misses

The full-width hero separates the headline from the product demonstration, so the first viewport reads like an editorial statement followed by a screenshot. The product should instead feel like the direct proof of the promise.

The current scroll implementation only animates five lesson rows by 12px over 320ms. All other sections are static, and multiple lesson rows can reveal together. The implementation technically moves, but the user cannot perceive a page-wide scroll experience.

## Chosen direction

Use an asymmetric editorial split hero plus restrained, section-specific scroll choreography.

This was selected over:

- A sticky hero, which would dominate the page and make the Blender example feel like the entire product.
- A pinned scrollytelling lesson, which would add complexity and fight the user's scroll for a simple landing page.

## Hero composition

### Desktop at 1180px and above

- Center the hero in the existing 1440px page container with 48px gutters.
- Use a two-column grid: `minmax(390px, 0.78fr) minmax(0, 1.42fr)`.
- Use a 40px column gap and 64px vertical padding.
- Place the copy in the left column and the full ProductPreview in the right column.
- Keep the preview's native `3560 / 1972` frame ratio and all approved overlay geometry.
- The product canvas must receive more width than the copy so its labels and animation remain legible.

The headline uses deliberate markup:

1. `Learn software`
2. `by doing.`
3. `Not watching.`

The first two lines use primary ink; the contrast line uses muted ink. Desktop type uses `clamp(3.75rem, 5vw, 4.6rem)` with tight but readable leading. This prevents the accidental four-line wrapping previously reported at 100% laptop scale.

The introduction remains below the headline at a maximum width of 30rem. The two text CTAs stack vertically so they do not collide inside the narrower copy column.

### Tablet below 1180px

- Stack copy above preview.
- Allow `Learn software by doing.` to share the first line group and keep `Not watching.` as the deliberate contrast line.
- Use 32px gutters until the mobile breakpoint.

### Mobile at 640px and below

- Retain 20px gutters.
- Keep the native-ratio capture.
- Retain the simplified Ask → Step → Check transcript below the frame.
- Keep nonessential desktop overlay cards hidden to avoid congestion.

## Scroll choreography

### Observer architecture

Use one shared `IntersectionObserver` for elements marked `data-scroll`. When an element reaches the reading zone, set `data-scroll-visible="true"` and unobserve it. Use a threshold near 0.15 with a bottom root margin near -12%.

Keep the hero preview observer separate because it controls whether the looping product demonstration is running. Preserve the page-visibility and user Pause/Play gates.

Lesson rows are observed individually. Do not reveal prior rows in a cumulative slice; each row should respond to its own scroll position.

### Section motion

All entrances use only opacity and transform, finish within 300–400ms, and use a strong ease-out curve. Maximum travel is 28px.

- Distinction: heading rises 28px; supporting copy follows with a short delay.
- Lesson: header rises 24px. Each lesson row rises 28px individually. Its dot scales in, and the spine segment draws downward using `scaleY` from the top.
- Product skills: section header rises. The universal base layer enters 24px from the left; the product-skill layer enters 24px from the right with a short offset. Software rows rise 18px individually.
- Trust: the rule draws horizontally while the copy rises 20px.
- Waitlist: the heading rises 28px; the form follows with a short offset.

Do not animate every paragraph independently. Do not use blur, rotation, parallax, scroll-jacking, or long stagger chains.

## Motion fallbacks

- Motion styles only activate when JavaScript adds `data-motion-ready="true"`; no-JS content stays visible.
- `prefers-reduced-motion: reduce` renders all content in its final state and disables product entrance motion.
- The hero Pause/Play control remains unchanged for users who allow motion.
- The looping hero still pauses offscreen and when the document is hidden.

## Accessibility

- Preserve semantic sections, headings, lists, native links, button, and form controls.
- Preserve the existing visible focus treatment and 44px hit targets.
- Scroll motion must not change reading order or focus order.
- Content is never permanently hidden if observers are unavailable.
- Product status continues to use text as well as semantic color.

## Testing and verification

- Update source contracts that currently require a full-width block hero or static marketing sections.
- Test the split breakpoint, deliberate headline spans, observer lifecycle, individual lesson-row triggers, section scroll markers, and reduced-motion final state.
- Preserve existing image dimension, aspect-ratio, overlay, route, waitlist, and accessibility tests.
- Run focused landing tests, the full suite, typecheck, and production build.
- Visually verify 1440×900, 1280×800, 768×1024, and 390×844.
- Confirm no horizontal overflow and verify the scroll choreography by moving through the whole page.

## Acceptance criteria

- At 1280px and wider, hero copy and the Blender preview are visibly side by side.
- The headline uses three intentional desktop lines and never breaks into the old accidental four-line composition.
- The Blender preview remains sharp, correctly aligned, and readable.
- Multiple page sections visibly animate as the user scrolls.
- Lesson rows reveal at their own reading positions rather than several at once.
- Motion stays restrained and causal rather than becoming decorative template animation.
- Tablet and mobile layouts remain unclipped and free of horizontal overflow.
- Reduced-motion and missing-observer states remain fully readable.
- All automated checks and four-size visual QA pass.
