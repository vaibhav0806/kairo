# Kairo Violet Thread Homepage Design

**Status:** Approved design; awaiting written-spec review  
**Date:** 2026-07-19  
**Supersedes:** The visual composition and page structure in `2026-07-19-kairo-living-canvas-homepage-design.md`  
**Preserves:** Product positioning, audience, waitlist behavior, accessibility requirements, and tested technical foundations from the Living Canvas work

## Objective

Create a distinctive Kairo homepage that behaves like an in-context lesson rather than a conventional product brochure.

The page must make three things unmistakable:

1. Kairo understands what the learner is looking at.
2. Kairo can point, draw, and explain in the same spatial context.
3. Kairo guides the learner, waits for them to act, and verifies the result instead of doing the work for them.

The desired first impression is:

> This website noticed the same problem I did, taught me how to fix it, and let me do it.

The experience should be memorable enough to share while remaining truthful, useful, and understandable without prior product context.

## Product Truths

Kairo is currently a learning tool and tutor, not a task-performing agent.

- A learner can talk to Kairo and hear it respond.
- Kairo can inspect the learner's screen when invited.
- Kairo and the learner can point, circle, underline, and draw to share spatial context.
- Kairo can guide tutorials across complex creative applications.
- Kairo gives one useful move, waits for the learner to perform it, verifies the result, and then continues.
- The first audience is creative-tool learners using After Effects, DaVinci Resolve, Blender, and Figma.
- The primary conversion is requesting alpha access.

The homepage uses authored illustrations and interactions to communicate these truths. It must not imply that the real Kairo product is running inside the browser.

## Creative Thesis

The homepage is one continuous Kairo lesson.

Instead of moving through repeated headings, cards, tabs, and product mockups, the visitor enters a creative workspace that changes state as Kairo teaches. Timelines, layers, nodes, bezier handles, selection boxes, rulers, and annotations form the page's composition rather than sitting inside generic marketing cards.

The visual concept is:

> Kinetic creative-tool manual × annotated sketchbook × professional software interface

The experience should feel observant, precise, informal, and alive. It should not feel childish, chaotic, or generically futuristic.

## Reference Translation

The direction takes principles from current reference sites without copying their assets, layouts, or identifiable motifs.

### HeyClicky principles to transfer

- Make the page behave like the product metaphor rather than merely describe it.
- Keep the central task calm while useful surprises inhabit the edges.
- Alternate dense interactive scenes with generous visual pauses.
- Use informal artifacts to imply a human, lived-in environment.

Kairo must not copy macOS menu bars, traffic-light windows, desktop folders, pixel GIF collages, rainbow arches, emoticon mascots, lowercase-everything voice, or HeyClicky's exact palette and placement.

### beUI principles to transfer

- Let each interaction prove the claim associated with it.
- Use restrained surfaces so functional motion carries the drama.
- Give controls spring resistance, shared spatial continuity, and clear state transitions.
- Concentrate theatrical motion in a few purposeful moments.

Kairo must not copy beUI's component-gallery grid, rainbow pills, aurora treatment, capsule CTA styling, Cooper-and-Geist typography pairing, or recognizable component demos.

## Signature System: The Violet Thread

Kairo is represented by a living violet annotation line called the Violet Thread.

The Thread is not a mascot and does not replace the visitor's pointer. It is a spatial teaching instrument whose form communicates Kairo's current role.

Its vocabulary is:

`underline → pointer → circle → bezier path → waiting pulse → verification mark → travel line`

### Thread states

1. **Dormant:** No drawing. The workspace remains fully understandable.
2. **Notice:** The Thread enters once and pauses near a meaningful problem.
3. **Attach:** It anchors to an exact interface object or visible region.
4. **Guide:** It points, circles, or traces the learner's next move.
5. **Wait:** It becomes still except for one restrained breathing response while the learner acts.
6. **Verify:** It resolves from violet to warm lime and draws a completion mark.
7. **Travel:** It stretches or reconstitutes into the spatial bridge to the next chapter.

Every use of the Thread must answer what Kairo is noticing, explaining, waiting for, or verifying. It is never applied as arbitrary decoration.

## Visual Language

### Materials and color roles

- **Bone canvas:** the primary reading and working surface.
- **Graphite chrome:** tool rails, panels, labels, and structural contrast.
- **Violet:** Kairo guidance and spatial attention only.
- **Warm lime:** successful verification only.
- **Coral:** confusion, incorrect state, or unresolved problem only.
- **Muted technical neutrals:** ticks, rulers, metadata, inactive handles, and dividers.

Color roles remain semantic throughout the page. Decorative gradients and broad rainbow accents are excluded.

### Typography

- Use a characterful grotesk for large statements and short questions.
- Use a precise utility sans for explanations and controls.
- Use monospace for timestamps, coordinates, tool labels, state labels, keyboard hints, and timeline values.
- Combine oversized editorial language with small technical annotations.
- Avoid repeated centered headline-and-paragraph blocks.

The existing Bricolage Grotesque, Geist, and Geist Mono foundation may remain if the new composition gives them sufficient character. Typography changes are permitted only if the implementation prototype demonstrates that the existing family cannot achieve the approved tone.

### Geometry

- Prefer purposeful tool-like edges, rails, frames, and anchored panels.
- Use rounded corners only when the object is physically soft, floating, or interactive.
- Avoid grids of interchangeable rounded cards.
- Allow asymmetric placement and peripheral artifacts while preserving a calm central task.
- Learner artifacts must have instructional meaning: previous attempts, pinned notes, saved states, discarded keyframes, and before/after evidence.

## Page Narrative

The page is organized as five chapters inside one evolving workspace.

### Chapter 1: Notice

The page opens in an After Effects-inspired workspace with a title animation whose final stop is visibly abrupt.

The primary statement is:

> Stuck? Point at it.

Opening sequence:

1. The title animation plays once and stops badly.
2. The Violet Thread enters from outside the workspace and pauses near the incorrect curve.
3. A small annotation appears: “That stop feels wrong, doesn't it?”
4. The visitor taps, selects, or circles the curve.
5. The relevant curve and handle move forward spatially without becoming a modal.
6. Kairo responds: “Give the stop more room. Pull this handle left.”
7. The learner changes the bezier handle.
8. The title preview updates immediately.
9. Kairo visibly waits and does not move the handle for the learner.
10. Releasing the handle in the correct range changes the Thread to lime and draws a verification mark.
11. The verification mark becomes the travel line into Chapter 2.

This is the primary quality gate for the redesign.

### Chapter 2: Understand

The verified state separates into four spatial layers connected by the Violet Thread:

- what the learner said;
- what is currently visible;
- what the learner pointed at;
- what Kairo understood.

The primary statement is:

> You don't have to explain the whole screen.

This chapter communicates voice, visible context, and shared spatial language without returning to feature tabs.

### Chapter 3: Learn

The workspace becomes a short guided lesson with one active instruction at a time.

The progression is:

`guide → wait → learner action → verify → continue`

The primary statement is:

> Guidance that waits for you.

The visitor controls progression. Kairo does not automatically complete a learner action or advance before verification.

### Chapter 4: Travel

The same Thread and workspace behavior transform through four creative-tool problems:

- **After Effects:** an abrupt easing handle.
- **DaVinci Resolve:** a disconnected color node.
- **Blender:** an incorrect transform axis.
- **Figma:** broken auto-layout spacing.

The primary statement is:

> Different tools. The same way of getting unstuck.

The workspace morphs between these problems rather than presenting four generic cards. Visitors can select a tool directly. One short authored sequence may play once when the chapter first becomes visible, provided it stops immediately when the visitor interacts.

The page must not imply formal integrations or claim product capabilities beyond screen-based contextual guidance.

### Chapter 5: Begin

The final verification mark expands into the alpha invitation.

The primary statement is:

> What have you been meaning to learn?

Small learner notes may surround the form:

- “finally understand nodes”
- “learn motion curves properly”
- “stop guessing in Blender”
- “get comfortable in Figma”

The existing email form contract is preserved. Successful submission completes the Thread and reveals:

> You're on the list. Go make something.

## Page Rhythm

The visual pacing alternates:

1. dense interactive workspace;
2. quiet editorial pause;
3. meaningful interaction;
4. quiet explanation;
5. final invitation.

Desktop uses a sticky evolving workspace only where spatial continuity materially improves understanding. It must not create long empty scroll distances or trap the reader in decorative scroll choreography.

The header remains compact and makes the alpha CTA available without competing with the lesson. Navigation labels map to meaningful chapters rather than a generic feature catalog.

## Interaction and Motion Contract

### Behavioral rules

- The opening authored sequence plays once.
- Kairo never replaces, captures, or moves the visitor's system pointer.
- User input immediately interrupts authored motion.
- Direct manipulation remains responsive while the pointer or finger is active.
- Kairo's response remains anchored to the interface object it explains.
- Kairo becomes visibly still while waiting for the learner.
- Verification must be caused by the learner's action, not by elapsed time.
- Repeated page visits and repeated chapter entry must not create unavoidable loops.

### Motion roles

- **Direct feedback:** quick press, selection, and focus response.
- **Surface response:** spring movement of panels, handles, annotations, and attached objects.
- **Scene travel:** slower transformation between chapters or tool environments.
- **Ambient behavior:** at most one slow, low-amplitude motion in an active scene.

Direct UI feedback remains below 300 ms. Larger explanatory scene travel may use approximately 400–650 ms when it preserves spatial continuity. Every sequence must be reviewed at normal speed and slowed playback.

### Performance rules

- Prefer transform, opacity, and SVG path progress.
- Use pointer refs, motion values, or direct SVG updates for high-frequency input.
- Do not route pointer movement through React state.
- Avoid animated layout properties during active interaction.
- Avoid WebGL, shader, or 3D dependencies for the first version.
- Pause scene motion when the page is hidden or the scene is outside the active range.

## Responsive Behavior

### Desktop

- Preserve the continuous workspace and spatial chapter transitions.
- Support pointer drawing and direct bezier-handle manipulation.
- Peripheral learner artifacts may inhabit the edges without obscuring the main lesson.

### Mobile and touch

- Present the same five chapters as vertically composed scenes.
- Never require hover, precise freehand drawing, or small-handle dragging to understand or complete the story.
- Offer large tap targets and a stepped handle control for the hero lesson.
- Keep normal vertical page scrolling available outside an explicitly activated drawing surface.
- Preserve the Thread's state vocabulary even when travel distances are shortened.

### Reduced motion

- Render a complete static storyboard with every product truth visible.
- Remove pointer following, idle travel, spring displacement, and repeated drawing.
- Preserve color, selection, concise opacity feedback, and instantaneous state changes.
- Display the verified state without requiring an animation to finish.

## Accessibility

- All interactive scenes must have keyboard equivalents.
- Keyboard-initiated high-frequency actions change state without spatial animation.
- Visible focus remains clear against both bone and graphite surfaces.
- Chapter headings and explanatory copy remain semantic and server-rendered.
- Tool choices use correct tab or listbox semantics according to their final control shape.
- The hero lesson exposes its instruction, action, and verification state to assistive technology.
- Pointer drawing is optional; selecting the associated region produces an equivalent outcome.
- The email form preserves current labeling, validation, focus management, and status announcements.

## Technical Architecture

The page remains a Next.js App Router route with a server-rendered shell and isolated client interactions.

### Proposed boundaries

- `LandingPage` owns semantic page structure, chapter order, navigation, and static fallbacks.
- `WorkspaceJourney` coordinates only active chapter and Violet Thread progression.
- `NoticeLesson` owns the opening playback, target selection, handle manipulation, and verification threshold.
- `ContextLayers` owns the voice, visible context, pointing, and understanding composition.
- `GuidedLesson` owns guide, wait, learner action, verification, and continue states.
- `ToolTravel` owns the four authored tool problems and direct tool selection.
- `VioletThread` renders the state-specific anchored SVG geometry.
- `AlphaInvitation` retains the current `WaitlistForm` behavior and receives only presentation state from the journey.

The implementation may reuse current drawing geometry, waitlist code, motion constants, accessibility helpers, and browser-test infrastructure. Existing generic section components should not constrain the new composition.

### State flow

The journey state is finite and explicit:

`notice → understand → learn → travel → begin`

Each chapter owns its internal state. Cross-chapter communication is limited to:

- current chapter;
- Thread state;
- whether the relevant learner action was verified;
- whether the visitor has manually interrupted authored motion.

Scroll position may request a chapter change. It must not directly control every animation frame or overwrite an in-progress learner interaction.

## Failure and Fallback Behavior

- Static server-rendered content explains the full product story before interaction code loads.
- If observers are unavailable, each scene renders in its complete readable state.
- If reduced-motion detection is unavailable, motion runs once and remains user-interruptible.
- If a pointer interaction is cancelled, the scene returns to its last stable instructional state.
- Failed target recognition retains the learner's mark briefly and offers explicit target selection.
- The waitlist retains its current retryable error behavior and never clears the email on failure.
- No decorative failure should prevent navigation to the alpha form.

## Testing Strategy

### Unit and component tests

- Violet Thread state transitions and geometry selection.
- Notice lesson playback, interruption, target selection, handle boundaries, verification threshold, and reset.
- Guide, wait, learner action, verification, and continue sequencing.
- Direct tool selection and authored first-entry behavior.
- Mobile stepped interaction parity.
- Keyboard equivalence and instant keyboard transitions.
- Reduced-motion completed states.
- Existing waitlist submission contract.

### Browser tests

- Pointer selection and bezier-handle manipulation.
- Touch scrolling outside the active drawing surface.
- Mobile tap alternative for the hero lesson.
- Keyboard completion of the hero lesson.
- Chapter navigation and no scroll trapping.
- No horizontal overflow at 320 px, 390 px, tablet, and desktop widths.
- No hydration, console, or page errors.
- Full product story with JavaScript disabled or before hydration.
- Reduced-motion static storyboard.

### Visual review

- Review the hero and first transition at normal speed and in slowed playback.
- Review desktop and physical phone behavior before extending the system.
- Record visual regression baselines only after explicit visual approval.

## Implementation Quality Gate

Implementation begins with only Chapter 1 and its transition into Chapter 2.

The prototype passes only when:

- the interaction is understandable without instruction outside the scene;
- the selected target, Kairo guidance, learner action, wait state, and verification are visually distinct;
- the motion feels physically coherent and immediately interruptible;
- the experience remains complete on touch, keyboard, and reduced motion;
- the page does not resemble a conventional SaaS hero with a demo card;
- the user explicitly approves the live prototype.

If the prototype fails this gate, revise or replace the creative mechanism before building Chapters 3–5.

## Acceptance Criteria

- A first-time visitor can accurately describe Kairo as an in-context tutor.
- The page demonstrates rather than merely lists talking, seeing, pointing, waiting, and verifying.
- The Violet Thread is recognizable and semantically consistent across all chapters.
- The visitor performs at least one meaningful learning action in the opening experience.
- The page has no repeated grid of interchangeable marketing cards.
- After Effects, DaVinci Resolve, Blender, and Figma appear as distinct learning contexts.
- Mobile presents the same narrative without relying on hover or precision dragging.
- Reduced-motion mode presents a complete static narrative.
- The waitlist network, validation, error, focus, and success behavior remain unchanged.
- The full regression suite, typecheck, production build, and browser tests pass.
- Final design guidelines are written only after the completed page receives visual approval.

## Non-Goals

- Building the actual Kairo tutor product in the browser.
- Claiming autonomous task execution.
- Adding a real voice, screen capture, or application integration to the homepage.
- Recreating HeyClicky, beUI, or another reference site's visual assets or layout.
- Filling every chapter with independent novelty.
- Using motion solely to make the page busy.
- Adding a heavy canvas, shader, game, or 3D runtime.
- Merging, deploying, or replacing the current public homepage before explicit approval.

## Implementation Sequence

1. Preserve the current Living Canvas branch as the recoverable functional baseline.
2. Build and test Chapter 1 plus the Chapter 2 transition in isolation.
3. Publish the prototype through the existing live-preview workflow.
4. Obtain explicit visual approval or revise the mechanism.
5. Extend the approved Thread system through Chapters 2–5.
6. Run interaction, accessibility, responsive, motion, and regression verification.
7. Obtain final visual approval.
8. Write `docs/KAIRO_DESIGN_GUIDELINES.md` and record approved visual baselines.
9. Present branch integration options; do not merge or deploy without authorization.
