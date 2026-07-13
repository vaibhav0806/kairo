# Kairo Live Lesson Playground — Landing Page Design

**Date:** 2026-07-14  
**Status:** Approved direction (Approach A)

## Goal

Rebuild the landing page so Kairo feels like a joyful, visual product for learning desktop tools by doing the work yourself. The page must feel active before the visitor scrolls, use a true white foundation, and demonstrate Kairo through visible product behavior rather than long explanations.

The current page is well typeset but too quiet. Its split hero, generic runway, app tile grid, and generic reveal animations make Kairo read like an editorial concept instead of a working visual tutor. This redesign replaces those structures rather than polishing them.

## Positioning

Kairo helps people learn creative and technical desktop tools while they use them. It sees the screen only when asked, understands a spoken question or annotation, gives one next step, waits for the learner to act, and checks the result before continuing.

The page should communicate four ideas in this order:

1. Ask about what is on your screen.
2. Kairo points to one next action.
3. You do the action yourself.
4. Kairo checks it and continues.

Blender is the hero demonstration, not the product category. The rest of the page must show that the same lesson loop applies across design, video, 3D, and other desktop workflows.

## Creative Direction

### Concept: Live Lesson Playground

The browser becomes a stage where a Kairo lesson appears to run in real time. A single visual signal travels down the page: it begins as voice bars, becomes a hand-drawn learner annotation, becomes Kairo's pointer path, and finishes as a green verified line. This recurring signal connects the sections and makes the motion feel like one product story rather than unrelated entrance effects.

The page should feel energetic and useful, not childish. Motion is purposeful and tied to the teaching loop. Color marks who or what is acting.

### Visual system

- **Canvas:** pure `#FFFFFF` for the page and navigation.
- **Cool surface:** `#F5F7FF` for product panels and secondary zones; no beige, cream, or warm paper backgrounds.
- **Ink:** near-black `#111217` for headings and controls.
- **Muted ink:** cool gray `#606575` for supporting copy.
- **Learner coral:** `#FF5C45` for voice, questions, and hand-drawn annotations.
- **Kairo violet:** `#7557FF` for guidance, targeting, and the active lesson step.
- **Verified green:** `#27C281` for completed actions and checks.
- **Interaction blue:** `#2477FF` for cursor paths, links, and active controls.
- **Spark yellow:** `#FFD84D` only for small moments of delight; never for body text.
- **Borders:** cool blue-gray at low contrast, strengthened only around active product UI.
- **Typography:** the existing Geist Variable stack is used for headlines, body, and interface text. Display weight and tracking create the personality without adding another font dependency. Headings use tight but readable tracking; body copy remains short and conversational.
- **Shape:** medium radii for product surfaces, pill controls only where the control truly behaves like a filter or state switch, and no decorative rounded-card wall.
- **Depth:** mostly flat white space with crisp borders; shadows appear only under floating product overlays and active cursor elements.

## Page Structure

### 1. Navigation

A slim white navigation bar contains the Kairo wordmark, three anchors (`How it works`, `Apps`, `Trust`), and a high-contrast `Join the alpha` button. It remains simple so the hero owns the first screen.

### 2. Hero: the live lesson stage

The hero is no longer a 50/50 text-and-image split. Approach A deliberately treats the earlier request for a “better fashion” as a compact centered copy block above a wide Blender lesson stage. This gives the demo enough width to be readable while keeping the copy and product visible in the first viewport.

Copy:

- Eyebrow: `A tutor for the app in front of you`
- Headline: `Stuck? Show Kairo.`
- Supporting line: `Ask out loud or circle the confusing bit. Kairo gives you one next step, waits while you try it, then checks your work.`
- Actions: `Join the alpha` and `Watch a lesson`

The Blender capture remains because it is the strongest existing product demonstration. It is displayed sharply at its native aspect ratio. Kairo's overlays sit above it as true interface layers rather than being baked into the image.

The demo loops through five states:

1. Voice bars respond beside the learner's question.
2. A coral annotation draws tightly around the selected cube.
3. A violet target locks tightly onto the visible edges of the cube rather than the empty area above it.
4. A blue cursor path travels from the cube toward Kairo's `Insert keyframe` lesson step. It does not pretend to target a Blender control that is not visible in the capture.
5. The lesson rail advances and the step turns green.

The stage includes an accessible play/pause control. Pausing freezes the demo without hiding content. Reduced-motion mode shows the final understandable state.

### 3. Lesson loop: one idea, four visual beats

Directly below the hero, a short horizontal strip names the loop: `Ask`, `Point`, `Try`, `Checked`. As the visitor scrolls, a colored signal passes through the four labels and into the next section.

On desktop, the next section is a sticky visual film with one large workspace and four compact narrative steps. The step column gives each chapter approximately `52svh`, while the workspace stays pinned beside it. Scrolling changes the workspace state rather than swapping unrelated stock photographs. Every state is visible by default; activation enhances it and never gates its visibility behind `opacity: 0`. On small screens, the states become four regular cards and never depend on sticky positioning to be readable.

The copy stays minimal:

- `Ask anything on screen.`
- `Kairo points, not clicks.`
- `You make the move.`
- `It checks before the next step.`

### 4. Cross-app skill switcher

Replace the 2×2 image wall with one interactive product stage and a row of app tabs. The initial tabs are Blender, Figma, DaVinci Resolve, and Photoshop, followed by an `Any desktop app` state.

Changing tabs updates a compact, app-specific visual lesson built from the existing local, credited image set plus lightweight CSS/SVG interface marks:

- Blender: select an object and add a keyframe.
- Figma: a frame with resize handles and an auto-layout spacing guide.
- DaVinci Resolve: a clip strip, playhead, and highlighted cut point.
- Photoshop: a layer stack, active layer, and mask thumbnail.
- Any desktop app: an unfamiliar toolbar control, a learner question mark, and Kairo's pointer.

These are demonstrations of the same lesson system, not claims of exclusive or separately shipped integrations. The label `Works wherever you are learning` makes the scope clear. Existing Pexels images in `public/` may appear as cropped background texture and retain their credits, but Kairo's lesson UI must remain the dominant visual. No remote image is loaded at runtime.

### 5. Control console

Replace the empty black trust band with a bright interactive permission console. Three preview modes communicate the trust model:

- `Start when I ask`
- `Pause anytime`
- `Point, never click`

The modes are buttons with an explicit selected state, not fake system permission toggles. Clicking a mode changes the adjacent mini-preview; keyboard focus may preview it non-destructively, and leaving focus restores the selected mode. A brief note says `You stay in control. Kairo only watches a lesson when you start one.` The AI accuracy notice remains visible but secondary.

### 6. Waitlist: build your first lesson

The final section is an upbeat mini-flow instead of a bare email form. The visitor selects an app from `Blender`, `Figma`, `DaVinci Resolve`, `Photoshop`, or `Any desktop app`; selects a goal from `Learn the basics`, `Finish a project`, or `Get unstuck`; and enters an email. `Any desktop app` and `Get unstuck` are selected initially, so only email validation can block submission. The current integration remains a local mock; successful submission gives an inline confirmation and does not pretend to persist data.

The section ends with a compact visual receipt showing the chosen app, goal, and `Saved in this preview` state. This makes the final interaction feel like part of the product without implying backend persistence.

## Motion System

The design uses a small set of reusable motion primitives:

- **Signal travel:** matching section-local SVG/CSS paths repeat the same voice-to-annotation-to-cursor-to-verification grammar. The implementation must not use one fragile document-spanning SVG.
- **Stage state changes:** opacity, small spatial movement, stroke drawing, and state-color changes communicate the lesson progression.
- **Scroll-linked chapters:** Intersection Observer activates meaningful scene changes; elements remain visible if JavaScript or observation fails.
- **Persistent ambient motion:** only one subtle ambient loop runs in a visible stage at a time. Offscreen loops and all loops controlled by the hero pause button stop; the lesson progression remains the dominant animation.
- **Direct manipulation:** app tabs and trust controls update their preview immediately on click or keyboard activation.
- **No generic fade-up system as the primary effect:** section reveals may support the story, but each major section must visibly demonstrate a Kairo behavior.

All motion uses transform and opacity where possible. `prefers-reduced-motion` disables looping, travel, and scroll interpolation while preserving the final product state and all information.

## Responsive Behavior

- Above 1100px, the hero stage is wide and the lesson film may use sticky positioning.
- Between 760px and 1099px, headline sizing and stage overlays scale with container queries or `clamp()` values; no headline word may be forced into an awkward single-word line.
- Below 760px, the navigation simplifies, the lesson stage uses a readable transcript below the image, app tabs horizontally scroll, and sticky scenes become stacked cards.
- Decorative overlays that become illegible at small sizes are hidden or replaced by text summaries.
- The page must have no horizontal overflow at 320px.

## Component Boundaries

Keep the implementation within the existing landing page and CSS module unless a component split materially improves readability. The intended units are:

- `HeroLessonStage`: owns the Blender stage, animation state, and pause control.
- `LessonLoop`: owns the four-stage teaching sequence and active scroll chapter.
- `AppLessonSwitcher`: owns selected-app state and the visual preview for each app.
- `ControlConsole`: owns the trust-control demonstration.
- `WaitlistBuilder`: owns role/app/goal selection, email validation, and mock confirmation.

Shared static data for lesson states and app examples stays beside these components. No new animation library is required; CSS keyframes, SVG stroke animation, and the existing React/Intersection Observer approach are sufficient.

## Accessibility and Failure Behavior

- All interactive controls are native buttons, links, inputs, or radios with visible focus styles.
- Color is never the only state indicator; labels and icons accompany semantic colors.
- Decorative images and SVG paths are hidden from assistive technology.
- Meaningful images have concise alt text. Image credits remain discoverable without dominating the product story.
- Without JavaScript, the core copy, final hero stage, app examples, trust statements, and waitlist form remain visible.
- Invalid email input receives a specific inline error and focus returns to the field.
- The mock submission clearly says the request is saved for the current preview only.

## Verification

The rebuild is complete only when all of the following are proven:

1. The rendered page uses white/cool-white surfaces and contains no beige or cream page sections.
2. The first viewport includes concise hero copy and a large, sharp Blender product stage.
3. The hero demo visibly cycles through voice, annotation, target, cursor, and verification states; pause and reduced-motion states work.
4. The `LessonLoop` changes workspace state, the `AppLessonSwitcher` changes an app-specific preview, and the `ControlConsole` changes its selected trust demonstration. Each is product-specific visual behavior rather than a generic entrance animation.
5. The cross-app section demonstrates Blender, Figma, DaVinci Resolve, Photoshop, and a general desktop-app state without calling them exclusive integrations.
6. Desktop, tablet, and mobile screenshots show no clipped headlines, congested copy, broken sticky regions, or horizontal overflow.
7. Keyboard navigation, visible focus, labels, semantic HTML, and reduced-motion behavior pass manual inspection.
8. Existing waitlist validation tests pass, updated landing-page tests cover the new labels and interactions, and the full test suite and production build pass.
9. All primary copy and form content is visible without JavaScript; only decorative inner marks depend on animation or observation.

## Out of Scope

- A real waitlist backend or CRM integration.
- Claims that Kairo can autonomously click or control desktop apps.
- A full interactive replica of Blender, Figma, DaVinci Resolve, or Photoshop.
- A new design-system package or animation dependency.
- Changes to the Kairo desktop application itself.
