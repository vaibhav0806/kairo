# Kairo Field Notes Landing Page

**Status:** Approved design direction  
**Date:** 2026-07-14

## Objective

Rebuild Kairo's landing page as an editorial, image-led product experience for learning desktop tools by doing. The page should feel organic and tactile while keeping the product immediately understandable and the waitlist easy to join.

The visual direction draws from the authored composition of Quarq, the environmental product framing of Agnost, and the structural grid and cinematic contrast of Compound. Kairo should interpret those qualities through its own learning and annotation language rather than reproduce their compositions.

## Positioning

Kairo is help inside the tool a learner is already using. A learner can ask aloud or point at the confusing area. Kairo gives one next step, waits while the learner tries it, and checks the result before continuing.

The landing page should show this behavior instead of explaining it at length. Blender remains the lead demonstration, but the broader product story covers creative and technical desktop tools.

## Creative Direction: Kairo Field Notes

The page is a crisp white editorial canvas containing a tactile world of work in progress: software windows, paper, marks, tools, natural materials, and soft directional light. Kairo's interface sits inside that world as a precise digital guidance layer.

The experience should feel:

- Organic, tactile, and human
- Clear before clever
- Visually rich but typographically restrained
- Calm in its motion, with moments of sharp focus
- Built around practice and progress rather than generic AI imagery

## Visual System

### Color

- Primary canvas: crisp white
- Secondary surfaces: cool white and very light neutral gray, never beige
- Ink: near-black
- Kairo signal: violet
- Learner annotation: coral
- Verified state: restrained green
- Environmental color comes primarily from photography

Violet, coral, and green are functional signals. They should not become large decorative background fields.

### Typography

- A high-character editorial serif is used for the hero and a small number of major statements.
- A neutral sans serif is used for product copy, controls, and calls to action.
- A restrained mono style is used for micro-labels, step numbers, and interface metadata.
- Copy stays short. Scale, whitespace, and imagery create hierarchy.

### Structure

- A subtle page-wide hairline grid connects sections.
- Major scenes align to the same columns and edges.
- Product windows are treated as large visual objects rather than small cards.
- Section transitions alternate between crisp white editorial space and immersive photographic scenes.
- Rounded cards are used sparingly. Most panels should feel like prints, windows, or sheets arranged in a workspace.

### Imagery

The image world combines:

- Large, sharp software scenes
- Editorial photography of making and learning: desks, paper, sketches, keyboards, tablets, tools, and hands at work
- Organic materials and subtle growth motifs
- Selective halftone, dither, blur, and mask treatments that connect physical images with software interfaces

Photography must support the learning story. Avoid generic AI portraits, robots, glowing brains, and unrelated landscape imagery.

## Page Architecture

### 1. Header

A minimal white header with the Kairo wordmark, a few anchor links, and one black waitlist call to action. Hairline borders and generous spacing should make it feel editorial rather than app-like.

### 2. Hero

Desktop uses a composed two-column layout:

- Left: short editorial headline, one supporting sentence, and one primary action
- Right: the existing Blender lesson animation, rebuilt as a sharp product window embedded into a tactile photographic environment

The grid, environmental image, product window, and annotations form one scene. On smaller screens the content stacks without shrinking the headline or product window into unreadable fragments.

### 3. The Learning Sequence

A full-width sticky product chapter demonstrates the loop:

1. Ask
2. Point
3. Try
4. Check

Scrolling advances the same visual scene rather than revealing four disconnected cards. The software interface remains anchored while Kairo's annotation, instruction, learner action, and verified state change around it.

### 4. Learn Across Your Tools

Show Kairo beyond Blender through an overlapping visual composition of tools such as Figma, VS Code, Photoshop, and other desktop applications. Screens should resemble prints or work surfaces arranged in a physical studio. Cursor trails and annotations connect the scenes.

Copy is limited to one headline and a short supporting line. No app-by-app feature paragraphs.

### 5. Ask, Try, Learn

Three large editorial panels sit within one continuous organic environment:

- Ask about what is on screen
- Try one clear next step
- Learn through immediate feedback

Each panel uses a distinct crop or product moment, a short label, and minimal copy. Panels should feel layered into the environment rather than floating on isolated colored backgrounds.

### 6. Trust and Control

A darker photographic chapter creates contrast. Sharp white panels communicate:

- Kairo starts only when asked
- Kairo can be paused at any time
- Kairo points and explains but does not click for the learner

This section should remain concise and avoid unsupported privacy or security claims.

### 7. Waitlist

Return to a crisp white canvas. The waitlist uses one strong statement, an email input, and a clear submit action. The current mock integration can remain, with accessible validation and a clear success state.

### 8. Footer

End with a large near-black field, a structured set of minimal links, and an oversized Kairo wordmark. The footer should feel like a final visual chapter, not an afterthought.

## Motion System

Motion should feel slow, physical, and purposeful:

- Gentle parallax between the grid, photography, and product windows
- Masked image entrances and restrained vertical reveals
- Annotation paths drawing onto the software interface
- Progressive blur-to-focus around the area Kairo is teaching
- Sticky scroll scenes that advance the lesson state
- Subtle cursor-responsive movement where appropriate
- Quiet continuous movement only for ambient details

Avoid bounce-heavy component animation, constant card movement, and effects that compete with the product demonstration.

All core content must remain usable with reduced motion enabled. Scroll effects must degrade to complete static states without hiding content.

## Content Principles

- Lead with what the learner can do, not technical AI terminology.
- Prefer demonstrations and captions to explanatory paragraphs.
- Keep Blender as one strong example without implying Kairo is Blender-specific.
- Use direct, friendly language.
- Avoid repeated use of the words "software," "AI tutor," and "skill."
- Do not invent customer logos, testimonials, or performance claims.

## Responsive Behavior

- Preserve readable headline line breaks at common laptop widths.
- Keep the hero product window large enough to understand at 100% browser zoom.
- Stack the hero at tablet and mobile widths.
- Replace complex sticky sequences with controlled stepped states where viewport height is limited.
- Ensure decorative layers never create horizontal overflow.
- Keep touch targets at least 44 pixels and maintain keyboard-visible focus states.

## Implementation Boundaries

- Continue using the current React and Vite landing-page repository.
- Reuse the existing Blender source image and core demonstration concept.
- Keep the waitlist as a mock integration for now.
- Use properly licensed images and store optimized local assets rather than depending on fragile external hotlinks.
- Keep the site website-only. No native application or Tauri code should return.

## Success Criteria

- The first viewport immediately communicates that Kairo helps people learn inside the tools they use.
- The page feels like one authored visual world rather than a sequence of SaaS components.
- Images and product scenes carry more of the story than body copy.
- The Blender demonstration is sharp, legible, and visually integrated with the hero.
- Scrolling produces visible, purposeful progression throughout the page.
- Kairo is clearly positioned across multiple desktop tools.
- The page remains responsive, accessible, and fast enough for a landing experience.
