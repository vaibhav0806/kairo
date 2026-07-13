# Kairo Warm Field Guide Landing Page Design

## Goal

Make the landing page explain Kairo as a tutor for learning desktop software, not a generic AI assistant and not a Blender-only product. The page should feel authored and product-led: one complete lesson establishes how Kairo teaches, then a compact model explains how that teaching works in any app and gets deeper through product skills.

The design must retain the approved warm, editorial character while removing the repeated AI-SaaS patterns that make the current page feel generated.

## Product promise

Kairo teaches inside the software the learner is already using. The learner can speak or annotate the screen, Kairo resolves the spatial context, gives one next step, waits for the learner to do it, and checks the visible result before continuing.

The product has two layers:

1. The base tutor works from the visible screen in any desktop app.
2. Product skills add the app's terminology, workflows, common mistakes, and structured lessons.

Blender is the hero lesson example. It is not positioned as the only supported or primary product.

## Page architecture

### Header

- Kairo wordmark.
- Links to `Lesson`, `Product skills`, and `Trust`.
- Quiet text action: `Join alpha ↗`.
- No boxed navigation CTA.

### Hero

Use a full-width editorial introduction above the product preview. Do not split the headline and preview into competing columns.

- Eyebrow: `Kairo / a tutor inside your software`
- Headline: `Learn software by doing. Not watching.`
- Intro: `Ask Kairo what to do next. Talk or circle what you mean. It answers aloud with one next step, waits while you do it, then checks the result before moving on.`
- Primary text action: `Join the Mac alpha ↗`
- Secondary text action: `See one complete lesson ↓`

The full-width preview uses the sharp user-provided Blender capture and the existing causal overlay sequence. Human-facing labels replace implementation language:

- Caption: `One lesson, shown in Blender`
- Lesson status: `Blender skill active`
- Target: `Kairo understood: cube`
- Learner input: `You asked + circled`

The preview demonstrates the entire loop: question, spatial grounding, one instruction, learner action, verification, and activation of the next step.

### Immediate differentiation

Place the core distinction directly after the hero:

`Tutorials make you leave the work. Agents take over the work. Kairo teaches you inside it.`

Support:

`It starts from your screen, gives one move, waits while you try it, and checks before continuing.`

This section is editorial copy, not a card grid or feature strip.

### One complete lesson

Heading: `A lesson moves only when you do.`

Show a single continuous Figma lesson as a vertical lesson spine. It must preserve the actor and causal order:

1. `You ask or point` — `Why won't these cards resize with the frame?`
2. `Kairo understands` — `Cards / horizontal resizing`
3. `One next step` — `Set horizontal resizing to Fill container.` Kairo speaks this response aloud and the compact voice waveform remains visible.
4. `You do it` — `Changed to Fill container.`
5. `Kairo checks` — `Cards resize with the frame. Next step ready.`

This replaces the old multi-app sequence of four large fake software interfaces. App breadth is explained later; the lesson section proves the teaching loop.

### Universal tutor and product skills

Heading: `Works anywhere. Gets deeper with product skills.`

Copy: `Kairo can guide from the screen alone. Add a product skill for lessons that know the software's tools, language, and workflows.`

Show two connected layers rather than a compatibility card grid:

`In any desktop app`

- Sees the current screen
- Hears the question
- Understands the annotation
- Points to the next control
- Checks the visible result

`With a product skill`

- Knows app terminology
- Teaches complete workflows
- Anticipates common mistakes
- Loads structured lesson recipes

Below the model, show restrained software rows:

- Blender — modelling, animation, materials, rendering
- Photoshop — layers, masks, retouching, compositing
- DaVinci Resolve — editing, color, audio, delivery
- Figma — layout, components, prototyping

Close with: `And any other desktop software, even without a dedicated skill.`

### Trust note

Use one compact note, not three trust cards:

`Kairo starts only when you ask. Pause it anytime. It points; it never clicks for you.`

Include the honest limitation that AI can make mistakes, but keep it secondary.

### Waitlist

- Heading: `Bring the software you want to learn.`
- Copy: `Join the Mac alpha and bring the software you already use.`
- Button: `Join the alpha`
- Preserve the current mock-only email validation and explicit preview-mode disclosure.
- Preserve the optional role selection after a successful local submission.

## Visual system

### Direction

Use a Warm Field Guide system: warm paper, warm graphite, restrained technical rules, marginal annotations, and compact product states. The page should feel like a considered learning document with a real product embedded inside it.

### Color

- Warm paper remains the page surface.
- Ink and warm graphite carry almost all typography and structural surfaces.
- Orange is only learner input or annotation.
- Violet is only Kairo's current response or resolved target.
- Green is only a compact verified state.
- No gradients.
- Avoid large tinted panels in any semantic accent color.

### Typography

- Keep Geist for continuity.
- Use one oversized display statement: the hero headline.
- Later headings are materially smaller and conversational.
- Reserve uppercase monospace for genuine product state, step numbers, and metadata.
- Do not use uppercase slash-labels as generic marketing decoration.

### Layout and components

- Full-width hero copy followed by a full-width product canvas.
- One continuous lesson spine instead of five equal process cells or four alternating feature monuments.
- Thin rules and spacing create hierarchy; avoid boxed card grids.
- Text actions use an underline or command-tab treatment instead of filled and outlined SaaS buttons.
- Corners remain square or nearly square.
- Keep product annotations visually subordinate to the captured software.

## Motion

Motion must explain product causality, not decorate sections.

- Keep the hero demonstration loop and pause it when offscreen or when the page is hidden.
- Provide an accessible `Pause demo` / `Play demo` control for the looping hero sequence.
- Reveal each of the five lesson states as that individual step reaches the reading position, while preserving causal order.
- Use 200–420ms state transitions with small movement and opacity changes.
- Remove generic whole-section fade-ups and software-row slide-ins.
- In reduced-motion mode, render the final readable state immediately.
- Marketing copy remains static.

## Responsive behavior

- The hero headline must scale with the viewport and preserve deliberate line breaks without creating a narrow column.
- The preview retains its native `3560 / 1972` coordinate system at every width.
- On small screens, simplify the in-canvas overlays and show the ask/step/check transcript immediately below the image; do not squeeze every desktop overlay into the 16:9 canvas.
- The lesson spine becomes single-column naturally; it must not rely on fixed-height fake stages.
- The two skills layers stack on small screens while preserving their relationship and order.
- All controls retain a 44px minimum target size.
- Product labels remain readable without covering the primary object.

## Accessibility

- Preserve semantic headings, landmarks, figure caption, and native form controls.
- Maintain visible keyboard focus.
- Do not encode actor or status using color alone; every semantic color has a text label.
- Decorative motion and SVG marks are hidden from assistive technology.
- The mocked waitlist continues to expose validation errors and its non-storage disclosure.

## Removal list

Remove these patterns from the current page:

- Split-column hero.
- Five-cell `Talk / Draw / Understand / Guide / Verify` strip.
- Separate problem block.
- Four alternating fake-product chapter stages.
- Repeated uppercase mono marketing labels.
- Four-principle grid.
- Three trust cards.
- Generic `data-reveal` section animation.
- Software-row slide-in animation.
- Filled primary plus outlined secondary CTA pair.

## Acceptance criteria

- A first-time visitor can describe the loop as: ask or point, Kairo understands, Kairo gives one step, learner acts, Kairo checks.
- The page explicitly distinguishes universal screen-based guidance from deeper product skills.
- Blender appears only as the hero lesson example and one product-skill row.
- Photoshop, DaVinci Resolve, and Figma appear as equally valid skill examples.
- The page contains one coherent lesson sequence, not several fabricated app interfaces.
- Semantic colors are confined to product behavior.
- Generic section-reveal and card-grid patterns are absent.
- The local waitlist mock, validation, and accessibility behavior still work.
- The high-resolution Blender image remains sharp and its overlays remain aligned.
- Typecheck, unit tests, and production build pass.
