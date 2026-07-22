# Kairo Living Canvas

**Status:** Approved
**Date:** 2026-07-20
**Scope:** Kairo marketing page, beginning with the approved navbar and hero

## Design read

Kairo is an experimental SaaS landing page for ambitious creative-tool learners. Its visual language is a living desktop: real work-in-progress material arranged on a precise, cool-white canvas, with Kairo appearing as a violet guidance layer.

The page should feel playful and authored without making the product harder to understand.

- Variance: 9 / 10
- Motion intensity: 7 / 10
- Visual density: 4 / 10
- Theme: light only
- Persistent accent: Kairo violet

This is a flexible language, not a reusable application component library. Lower sections should inherit the hero's materials and behavior without repeating its collage composition.

## Product story

The page has one chronological argument:

1. Kairo understands the screen, the question, and the place the learner means.
2. Kairo gives one next move and waits.
3. The learner makes the change.
4. Kairo checks the result and continues.
5. The same teaching model travels across creative tools.

Kairo is a tutor, not an autonomous operator. Copy and motion should preserve the learner's agency.

## Core tokens

These tokens are semantic starting points. A section may tune opacity and scale, but should not introduce a new visual world.

```css
:root {
  /* Color */
  --color-canvas-page: #f5f7fb;
  --color-canvas-section: #f8f9fb;
  --color-canvas-workspace: #fbfcfe;
  --color-ink: #0b0d12;
  --color-display-ink: #08090c;
  --color-text-secondary: #505765;
  --color-text-tertiary: #767c88;
  --color-kairo: #665cff;
  --color-kairo-wash: #f6f4ff;
  --color-white: #ffffff;

  /* Borders */
  --border-subtle: rgb(11 13 18 / 8%);
  --border-section: rgb(11 13 18 / 10%);
  --border-control: rgb(11 13 18 / 24%);
  --border-media: rgb(11 13 18 / 38%);

  /* Typography */
  --font-display: "Bricolage Grotesque Variable", sans-serif;
  --font-body: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", monospace;

  /* Geometry */
  --radius-control: 2px;
  --radius-overlay: 4px;
  --radius-media: 7px;
  --target-min: 44px;
  --page-gutter: clamp(20px, 5vw, 80px);
  --content-max: 1280px;
  --section-space: clamp(88px, 10vw, 144px);

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-snappy: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-draw: cubic-bezier(0.77, 0, 0.175, 1);
  --duration-press: 120ms;
  --duration-hint: 160ms;
  --duration-state: 180ms;
  --duration-move: 220ms;
  --duration-focus: 420ms;
  --duration-media: 500ms;
}
```

The existing green, coral, and yellow values are not part of the core marketing language. Add a secondary functional color only when a real product state cannot be communicated with ink, opacity, and violet.

## Typography

- Bricolage is the expressive voice. Use it for major statements and the wordmark.
- Geist is the explanatory voice. Use it for body copy, navigation, controls, and actions.
- Geist Mono is evidence. Use it for filenames, app state, Kairo system labels, and short interaction hints.
- Major headlines should be short enough to create hierarchy through scale, not paragraphs.
- Use the outlined display treatment once, in the hero. Repeating it would turn a signature into a template.
- Use at most one eyebrow across all lower sections. Do not number sections or label them as chapters.

## Surface and shape language

### Canvas

The default plane is a cool white, not beige and not pure empty white. Dots and focus fields are local interaction cues. They should respond to selection or guide attention, not become wallpaper across every section.

### Authentic artifact

Real tool imagery behaves like physical desktop material:

- thin dark border
- 7px or lower corner radius
- slight resting rotation
- restrained soft elevation
- violet active ring
- filename outside or at the edge of the media
- active material straightens and rises slightly
- inactive material remains readable and mostly still

Do not build fake application screenshots from styled `div` elements. Use real captures, recordings, or carefully cropped authentic source material.

### Kairo-owned surface

Kairo responses use a pale-violet paper surface, a thin dark border, and a hard violet offset shadow. The hard violet shadow is reserved for Kairo-owned surfaces and the primary action.

### Controls

Controls are compact, mostly square-edged, and visibly pressable. Minimum target size is 44px. Hover may lift by 1px on a fine pointer; press should move inward or reduce the hard shadow. Focus uses a 3px violet ring.

## Reusable visual primitives

These are behaviors and materials, not mandatory React abstractions.

- **Canvas section:** cool-white plane, page gutter, optional local focus field.
- **Artifact:** authentic media, mono filename, physical selection state.
- **Kairo response:** pale-violet answer surface with streamed text.
- **Violet connector:** a causal route between a selected problem and Kairo's response.
- **Offset action:** near-black action with a restrained violet hard shadow.
- **Tool rail:** compact selector that promotes one real artifact into the main stage.
- **Mono metadata:** filename, active tool, short state, or interaction hint.

## Motion system

Motion must explain hierarchy, causality, feedback, or progress. Nothing floats merely to make the page feel alive.

### Motion roles

1. **Feedback, 120 to 180ms:** press, hover, focus, active control.
2. **State change, 180 to 260ms:** artifact selection, tab change, active border, short reveal.
3. **Causal explanation, 400 to 800ms:** target selected, connector arrives, Kairo responds.
4. **Narrative scroll:** one guided-learning sequence in the lower page.

Only the active and visible material moves. Videos pause offscreen. Inactive tool scenes do not continue animating. Decorative perpetual loops are not part of the system.

### Technology decision

- Use CSS for hover, press, focus, and simple state transitions.
- Use Motion for mounted state, shared-layout promotion, response streaming, and component-level entrances.
- Use GSAP with ScrollTrigger for one desktop guided-learning sequence where a real workspace stays pinned while the learning state advances.
- Do not use GSAP for general fades, hover effects, or every section entrance.

The GSAP sequence must clean up its context on unmount and must not run on reduced-motion, short-height, or mobile layouts. Those layouts receive the same states through direct tabs or buttons.

### Causal order

When Kairo reacts to a selected problem, preserve this order:

1. Selection becomes visible.
2. The connector reaches the destination.
3. The response begins streaming.
4. Verification appears only after the learner's visible action.

Animation completion, not an unrelated timeout, should release the next state.

## Responsive contract

- Above 1060px: full spatial composition.
- 701px to 1060px: a deliberately composed tablet layout, never a squeezed desktop scene.
- 700px and below: one primary artifact at a time, with controls and response in normal document flow.
- 420px and below: compact type and tighter geometry without shrinking touch targets.
- Short-height screens avoid pinning and use direct stepped interaction.
- Mobile keeps active tool names and filenames visible.
- Connectors shorten or become local on mobile; they must not cross unrelated copy.

Reduced motion resolves streamed text immediately, removes pinning and positional travel, pauses media, and preserves every selected state through border, color, and layout.
