# Kairo Living Canvas Homepage Design

Date: 2026-07-19
Status: Approved for implementation

## Goal

Replace the current field-notes landing page with a new homepage that makes Kairo immediately understandable, unusually enjoyable to explore, and credible as a powerful learning product for creative software.

The page should feel like a creative workspace that has become intelligent. It must combine playful personality, tactile and physically believable motion, and direct product explanation. The experience may be surprising, informal, and internet-native, but it must never obscure the primary promise or the alpha-access conversion path.

## Product Truth

Kairo is currently a tutor, not a task-performing agent.

It can:

- hold a general-purpose spoken conversation;
- see the user's screen when invited and answer questions about it;
- point, circle, and draw directly over the screen to explain spatially;
- understand annotations the user draws to indicate an exact region;
- provide guided tutorials across unfamiliar creative and technical software.

Kairo intentionally keeps the learner's hands on the tool. It guides, waits, and verifies rather than taking over the task. Future agentic behavior is outside this homepage's promise.

## Audience and Conversion

The primary audience is creative-tool learners:

- complete beginners opening a professional tool for the first time;
- ambitious self-taught creators who repeatedly get stuck;
- experienced creatives learning a second or third tool.

The shared situation is more important than skill level: a creator knows what they want to make, but unfamiliar software is getting in the way.

The visitor journey is:

1. Become curious through a distinctive interaction.
2. Understand what Kairo does without having to interact.
3. See believable examples of Kairo's capabilities.
4. Understand the product's breadth and learning-first philosophy.
5. Request alpha access through the existing email waitlist.

The page can be designed for curiosity and shareability, but it must not claim or assume virality. Success means visitors find it worth exploring and can accurately explain Kairo afterward.

## Reference Synthesis

The design borrows principles, not visual identities:

- [HeyClicky](https://www.heyclicky.com/): personality, internet-native energy, short product moments, and a site that rewards exploration.
- [beUI](https://beui.dev/) and [beUI Pro](https://pro.beui.dev/): tactile components, tuned motion, live interaction, and responsive state changes.
- [Markd](https://usemarkd.app/): crisp typography, concise copy, and a restrained foundation beneath expressive details.
- [Agnost](https://agnost.ai/): product proof that visitors can inspect instead of only reading claims.
- [Greptile](https://www.greptile.com/): blunt positioning, concrete examples, confidence, and an irreverent edge.
- [Granola](https://www.granola.ai/): polished product storytelling organized around specific workflow moments.

No proprietary page code, assets, copy, or recognizable composition will be copied. Open-source code may be adapted only after verifying its license and recording its source.

## Design Direction: Living Canvas

The browser page becomes a responsive creative canvas. Kairo is represented as an expressive spatial presence rather than a mascot or conventional chat window.

Kairo appears through:

- an annotation cursor;
- freehand circles, arrows, and underlines;
- a small listening or speaking pulse;
- labels that remain spatially attached to the thing being discussed;
- concise spoken-style responses;
- motion that reacts to user intent.

The creative work remains visually dominant. Kairo's interface explains and responds without covering the page with an assistant panel.

### Governing Principles

1. Every section contains one thing worth interacting with and one sentence that makes Kairo easier to understand.
2. Product clarity never depends on completing an interaction.
3. Motion preserves cause, direction, velocity, and spatial attachment.
4. The playful surface rests on predictable navigation, readable copy, and a reliable waitlist.
5. Surprise is concentrated in a few signature moments rather than applied to every element.
6. No interaction hijacks the visitor's cursor, scrolling, or audio.

## Visual System

### Color

The foundation is a bright, cool canvas rather than the current botanical beige treatment.

| Role | Token | Initial value | Usage |
| --- | --- | --- | --- |
| Canvas | `--canvas` | `#F5F7FB` | Primary page background |
| Ink | `--ink` | `#0B0D12` | Headlines, body, strong borders |
| Deep surface | `--surface-deep` | `#141824` | Creative-software fragments and inverse sections |
| Soft surface | `--surface-soft` | `#E9EDF5` | Secondary panels and inactive controls |
| Kairo | `--kairo` | `#665CFF` | Cursor, ink, active states, primary brand signal |
| Verify | `--verify` | `#B8F34A` | Successful identification and verification |
| React | `--react` | `#FF6B66` | Playful reactions and emphasis |
| Notice | `--notice` | `#FFD84D` | Hints, highlights, and temporary attention |
| Muted ink | `--ink-muted` | `#626A78` | Supporting copy and metadata |

Kairo violet is the only persistent accent. Green, coral, and yellow appear briefly as semantic reaction colors, not as equal brand colors.

### Typography

- Display: Bricolage Grotesque Variable, used for expressive headlines and large statements.
- Body and controls: Geist Variable, used for clarity at all sizes.
- Technical labels: Geist Mono or a system monospace fallback, used sparingly inside software fragments.

Headlines may change width, size, or line breaks responsively, but individual letters should not continuously animate. Body copy remains conventional and easy to scan.

### Composition

- Use a twelve-column desktop grid with a `1440px` maximum content width.
- Allow large display type and product fragments to cross internal grid boundaries without causing horizontal overflow.
- Alternate calm explanatory areas with denser interactive stages.
- Avoid universal card grids and repeated rounded rectangles.
- Use medium radii for functional surfaces and irregular SVG contours for Kairo's marks.
- Preserve generous negative space so the playful elements read as intentional rather than noisy.

Use the spacing scale `4, 8, 12, 16, 24, 32, 48, 64, 96, 144`. Functional surfaces use `10px`, `18px`, or `28px` radii according to size; pills are reserved for statuses and compact controls. Default dividers use ink at approximately twelve percent opacity. Strong dark borders are reserved for active drawing targets and deliberate graphic emphasis.

## Page Journey

### 1. Hero: Kairo Meets Your Cursor

The hero is an open creative canvas, not a fake application window and not a required product tutorial.

Approved copy:

> **Learn any creative tool without leaving it.**
>
> Talk to Kairo, show it what you mean, and get visual guidance directly on your screen.

Primary CTA: **Request alpha access**

Secondary navigation action: **See how Kairo helps**

Small fragments inspired by timelines, layers, nodes, canvases, and playheads sit around the composition. They are original, app-agnostic abstractions rather than replicas of proprietary software.

Kairo's annotation cursor enters once, underlines or circles a meaningful part of the composition, and then rests. Pointer movement gives nearby fragments restrained depth and resistance. Within the designated canvas, holding and dragging creates Kairo ink. Closing a rough circle near a fragment attaches a short response to that fragment. Different hit regions produce different prepared reactions, and a small number of unusual gestures reveal optional Easter eggs.

The interaction is intentionally forgiving and deterministic. The page does not pretend to run Kairo or browser-based AI. Copy communicates the product even if the visitor never touches the canvas.

Desktop uses pointer drawing. Touch uses press-and-drag inside a clearly bounded area so normal vertical scrolling remains reliable. Keyboard users can focus each fragment and activate an equivalent **Ask Kairo about this** action.

The hero performs one short idle interaction after load, only when it is visible and motion is allowed. It never loops indefinitely and never takes control of the visitor's pointer.

### 2. Product Moments

Short, user-controlled scenes explain Kairo without turning the hero into a tutorial. The first release uses authored DOM/SVG scenes that are visibly illustrative rather than fake live product output. Their structure accepts real product captures later without changing the section layout.

The three moments are:

1. **Ask naturally:** a creator asks a question while working in an After Effects-inspired motion workspace.
2. **Point together:** the creator circles an exact region and Kairo responds with a spatially anchored mark.
3. **Keep learning:** Kairo gives one next move, waits for the learner, verifies the visible result, and continues.

Scenes play only while visible, remain muted, have explicit replay/pause controls, and stop on user interaction. The text explanation remains visible independently of animation.

### 3. One Intelligence, Four Ways to Learn

A single shared visual changes when the visitor selects:

- **Talk** — ask naturally and hear Kairo respond;
- **See** — Kairo understands the visible application context;
- **Point together** — either side can circle, draw, and identify exact regions;
- **Learn by doing** — Kairo guides and verifies instead of taking control.

This is one transforming stage, not four disconnected feature cards. Selection is manual, keyboard-operable, and does not auto-advance.

### 4. Creative-Tool Playground

After Effects is the flagship example because motion, keyframes, layers, and visible before/after results make Kairo's spatial teaching easiest to understand.

DaVinci Resolve, Blender, and Figma demonstrate breadth. Labelled tool controls remain available at all sizes. On pointer-capable desktop layouts, visitors may also drag a Kairo lens between the tool scenes; touch layouts use the labelled controls and do not require lens dragging.

Each tool receives a concrete learning moment rather than a logo and generic claim:

- After Effects: “Why does this title stop so abruptly?”
- DaVinci Resolve: “How do I make this speed change feel smoother?”
- Blender: “How do I make this material read like glass?”
- Figma: “Why does this button break when the label changes?”

The examples are illustrative of Kairo's general screen understanding; they must not imply formal integrations or partnerships.

### 5. Your Hands Stay on the Tool

This section establishes Kairo's learning-first position against task-performing agents.

The interaction shows Kairo provide a step, wait while the learner performs it, and respond only after the visible result changes. Supporting copy explains that Kairo starts when invited, can be paused, and helps the learner build skill rather than silently replacing their work.

Privacy and control information appears as concise, readable statements rather than decorative trust cards.

### 6. Alpha Invitation

Approved direction:

> **Bring the thing you've been meaning to learn.**

The redesign preserves the existing email-only request flow, API contract, and Neon schema. Adding a tool-preference question or other lead data is outside the redesign scope and requires a separate product decision.

The form retains pending, validation, confirmed-success, and retryable-failure states. It includes a two- or three-sentence founder note explaining that Kairo is early, is being built for creative learners, and that alpha feedback will shape which tools it supports first. The page will not invent usage numbers, testimonials, or customer logos.

The footer is compact. On pointer or keyboard activation, Kairo circles the wordmark and writes “go make something.” Reduced-motion mode shows the completed static mark. The footer does not become another viewport-height decorative section.

## Motion and Interaction System

### Technical Foundation

- Motion for React for gestures, spring state, presence, and layout transitions.
- Motion values for high-frequency pointer-following updates without React rerenders.
- Native Pointer Events for mouse, touch, and pen input.
- `perfect-freehand` for pressure- and velocity-sensitive Kairo strokes.
- SVG for freehand marks, arrows, circles, and spatial labels.
- CSS for simple focus, hover, color, and opacity feedback.

GSAP is excluded from this implementation. Introducing it requires a separate design change supported by a specific Motion limitation and a measured prototype. Three.js, WebGL, Rive, scroll-jacking libraries, and custom smooth-scroll replacements are also excluded.

No beUI component is copied wholesale in the initial implementation. Its MIT-licensed source may inform isolated interaction techniques only after recording the source and license beside the implementation decision. beUI Pro or any other commercial source requires an appropriate license and must not be copied from a rendered page.

### Kairo Motion Signature

- Ink trails the pointer by a small, visible amount and catches up without wobble.
- Stroke width responds to speed and actual pen pressure when available.
- Labels originate at the identified point and preserve that spatial attachment.
- Draggable fragments resist at boundaries and settle without decorative bounce.
- State changes preserve incoming velocity when changing destination.
- Marks erase, redirect, or redraw through a visible cause rather than arbitrary fades.
- Every user-triggered animation is interruptible.

Initial spring presets:

| Preset | Stiffness | Damping | Mass | Use |
| --- | ---: | ---: | ---: | --- |
| Direct | 520 | 38 | 0.7 | Press, cursor response, small controls |
| Surface | 320 | 30 | 0.9 | Panels, labels, fragment settling |
| Scene | 220 | 28 | 1.0 | Larger composition changes |

These values are starting constraints, not an excuse to apply the same motion everywhere. Each sequence must be reviewed at normal speed and slowed playback.

### Prohibited Motion

- Generic reveal animation on every section.
- Infinite hero loops.
- Bounce without impact, gesture, or stored momentum.
- Parallax applied to body copy.
- Animating keyboard focus position.
- Autoplay audio.
- Cursor replacement outside the hero canvas.
- Scroll hijacking or pinned scenes that prevent normal page progress.

## Component Architecture

The new page should server-render its copy and structural layout. Client boundaries are limited to areas with real interaction:

- `HeroCanvas` owns pointer drawing, fragment reactions, and hero idle state.
- `ProductMoments` owns playback and visibility state for the three short scenes.
- `CapabilityStage` owns the manually selected Talk / See / Point / Learn state.
- `ToolPlayground` owns the selected tool and Kairo lens position.
- `ControlMoment` owns the guide / wait / verify sequence.
- `WaitlistForm` preserves the existing submission behavior.

Each interactive component uses local state with explicit named states. No global state library or page-wide animation controller is needed. Motion constants and semantic colors may be shared through small token modules or CSS custom properties; behavioral state should remain local.

## Data and Failure Behavior

- Hero strokes and interaction state remain entirely in the browser and are never uploaded or persisted.
- Page interactions require no API and remain useful offline after assets load.
- The waitlist continues to post normalized JSON to `/api/waitlist` and uses the existing Neon adapter.
- A failed or unavailable animation leaves all copy and controls visible in their final state.
- A failed scene asset shows its static poster and accompanying explanation.
- Missing `IntersectionObserver` support starts content visible and disables visibility-dependent playback.
- Drawing recognition failure keeps the stroke visible, offers reset, and never blocks navigation.
- Waitlist failures retain the entered email and present the existing accessible retry message.

## Responsive and Accessibility Requirements

- Desktop, tablet, and mobile use the same narrative, not separate reduced-content pages.
- Mobile replaces hover-only reactions with explicit tap or press affordances.
- The drawing region must use appropriate `touch-action` behavior without blocking vertical page scroll outside the active gesture.
- All drawing targets have keyboard-operable button equivalents and visible focus.
- Reduced motion removes idle sequences, pointer following, travel, and repeated drawing. It preserves instantaneous state changes, color, and short opacity feedback.
- The DOM reading order remains logical without visual positioning.
- Interactive labels expose their state and target through accessible names.
- Color is never the only way to distinguish ask, identify, guide, and verify states.
- Decorative tool fragments are hidden from assistive technology.
- Minimum touch targets are `44px` square.

## Performance Requirements

- The headline, CTA, and static hero composition must render without waiting for interaction code.
- High-frequency pointer updates use motion values, refs, or direct SVG data rather than React state.
- Pointer samples are capped and simplified before rendering long paths.
- Coalesced pointer events may improve precision when supported but require a standard Pointer Event fallback.
- Below-fold scenes initialize only near the viewport and stop when hidden.
- No interaction may introduce continuous background work after it reaches rest.
- Hero assets must be responsive, local, and sized for their rendered dimensions.
- The finished page targets a good Core Web Vitals result on a mid-range mobile device; visual ambition does not justify delaying the primary copy or CTA.

## Verification

Automated verification must cover:

- hero idle, drawing, recognition, response, and reset states;
- keyboard equivalents for each drawing target;
- touch interaction without broken page scrolling;
- manual capability and tool selection;
- pause, replay, visibility, and reduced-motion behavior;
- waitlist validation, pending, success, duplicate, and failure behavior;
- server rendering without browser globals;
- production build and hydration without errors;
- screenshots at representative desktop, tablet, and mobile sizes.

Manual review must cover:

- normal-speed and slowed-motion playback;
- perceived weight, continuity, and interruption;
- mouse, trackpad, touch, and keyboard use;
- content clarity without animation or interaction;
- visible focus, contrast, and screen-reader announcements;
- frame-rate and render profiling during drawing;
- absence of horizontal overflow at narrow widths.

The implementation is accepted only if a first-time visitor can state that Kairo sees the screen, supports spoken questions and two-way annotation, and guides the learner without performing the task for them.

## Non-Goals

- Building the Kairo desktop product or running real Kairo inference in the browser.
- Adding agentic task execution to the product promise.
- Adding authentication, analytics, confirmation email, payments, or new waitlist fields.
- Copying the structure, character identity, or code of any reference site.
- Adding motion solely to make every section busy.
- Preserving the current field-notes photography, botanical assets, typography, or layout.

## Delivery Strategy

Implementation should begin with the hero interaction in isolation. The hero must demonstrate smooth drawing, useful reactions, predictable input behavior, and a static fallback before the remaining page is rebuilt. If the optional interaction cannot meet that quality bar, the hero ships with its concise idle reaction and static composition; the rest of the product story remains intact.

After the hero quality gate passes, build the server-rendered page structure, then add each interactive island independently. Preserve the existing waitlist backend throughout the redesign and run the complete regression suite after integration.

After the implemented page has passed visual iteration and received user approval, extract the proven tokens, composition rules, motion signature, component patterns, and do/don't examples into `docs/KAIRO_DESIGN_GUIDELINES.md`. That document is the portable input for future Kairo pages; this specification remains the rationale and requirements for the homepage redesign.
