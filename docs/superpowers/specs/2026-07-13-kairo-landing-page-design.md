# Kairo Landing Page (Design)

Date: 2026-07-13
Branch: `main` (per project rule — no feature branch)
Status: design — awaiting review before implementation plan

## Goal

Build a modern, student-first landing page for Kairo that makes the product
understandable in the first viewport, demonstrates the real tutoring loop, and
collects early-access interest through a mock waitlist flow.

The page should communicate one core idea:

> **Learn software by doing. Not watching.**

Blender is the first live skill and the concrete product demonstration. It must
not define Kairo as a Blender-only product.

## Product positioning

Kairo is a screen-native AI tutor for learning complex software. A learner can
talk naturally, point or draw on screen, receive one contextual instruction,
act inside the software, and have Kairo verify the new screen before continuing.

The product principle is unchanged:

> **The AI points. The user acts.**

The first audience is an individual learner or creator trying to make progress
inside difficult creative software. Educators and institutes remain a secondary
path near the waitlist, not a competing hero message.

## Messaging hierarchy

The page uses three levels of specificity:

1. **Hero:** the category-wide promise — learn complex software through action,
   not detached tutorials.
2. **Product demonstration:** Blender is labeled `First live skill / Blender`
   and shows the interaction in a believable workflow.
3. **Skills:** Blender is active alpha; Photoshop is next; DaVinci Resolve and
   Figma are planned. Status labels must be honest and visually explicit.

The hero copy is:

> **Learn software by doing. Not watching.**
>
> Kairo turns the screen in front of you into a live lesson. Ask a question,
> point to what you mean, and follow one verified step at a time.

Primary CTA: `Request access`

Secondary CTA: `Watch Kairo teach`

Do not use unsupported claims such as “master anything,” “learn faster,” or
“personalized to you.” Do not add invented testimonials, logos, user counts,
waitlist positions, or urgency.

## Page narrative

The page talks directly to the learner and follows their experience rather than
presenting an abstract problem/solution diagram.

### 1. Immediate hero

The first viewport contains both the promise and the product. It must not open
with a full-screen problem statement.

The product preview shows a real Kairo teaching state:

- learner asks how to begin animating a cube;
- learner input is visible as voice plus an on-screen annotation;
- Kairo resolves the target;
- the notch gives one short instruction;
- the ghost cursor points without clicking;
- a progress rail shows one completed step and one current step.

The preview is labeled as an example/product preview and Blender is labeled as
the first live skill.

### 2. Interaction loop

A compact five-beat strip explains the loop:

1. Talk
2. Draw
3. Understand
4. Guide
5. Verify

This is the fastest explanation of the product and should remain directly under
the hero.

### 3. Problem transition

The problem becomes one short transition rather than a standalone conceptual
hero:

> Tutorials show their screen. Kairo starts from yours.

Supporting copy explains that normal tutorials lose the learner's current app,
screen state, and exact point of confusion.

### 4. How Kairo teaches

Four scroll chapters demonstrate product behavior:

1. **Conversation:** the learner's question and Kairo's short spoken response
   enter in sequence.
2. **Spatial context:** the learner's orange annotation draws first, then
   Kairo's violet resolved target appears.
3. **Guidance:** the notch, target, and ghost cursor enter in that order. The
   cursor never performs the action.
4. **Verification:** the completed step turns green only after the next screen
   state is checked; the following step then becomes active.

The copy must describe shipped or actively demonstrated behavior. It should not
imply autonomous control.

### 5. Works inside your tools

Avoid the heading “Integrations,” which would imply finished partner or API
integrations. Use `Works inside your tools` or `Tool-specific skills`.

Each skill row includes software, example knowledge, and an honest status:

- Blender — active / alpha
- Photoshop — next
- DaVinci Resolve — planned
- Figma — planned
- Institute workflow — custom skill direction, not currently available

### 6. Why it is different

Keep this as a concise comparison, not a generic feature-card grid:

- Kairo begins from the learner's current screen.
- Guidance is one step at a time.
- The learner performs the action.
- Progress is checked before the lesson advances.

### 7. Trust

Trust copy stays factual:

- Kairo activates when the learner asks; it is not presented as continuously
  recording.
- The learner can pause guidance.
- The design principle is guidance rather than autonomous clicking.
- AI can make mistakes; learners should verify important work.

Do not add security badges or absolute privacy claims until policy and storage
mechanisms exist.

### 8. Waitlist

The final CTA repeats `Request access` and includes one required email field.
Role is an optional post-submit question with `Student`, `Creator`, and
`Educator` choices.

The mock flow has three states:

- idle;
- invalid email with a specific inline message;
- preview success with the typed email preserved.

The form uses `type="email"`, `autocomplete="email"`, a visible label, and an
`aria-live` status region. The mock keeps the submitted email in React state for
the current preview only; it does not persist or transmit personal data.
Mock-mode confirmation copy must say that the email was not sent. The page must
not be deployed while claiming to collect real signups. A real endpoint or
waitlist provider is required before public launch.

## Visual system

The approved direction is `Quiet Product Film` with warm intelligence:

- surface: warm neutral `#F5F4EF`;
- primary text: near-black `#151515`;
- learner input and annotations: orange/coral `#FF6547`;
- Kairo speech, guidance, targets, and cursor: violet `#8B79FF`;
- verified progress only: green `#78CAAA`;
- typography: the installed Geist variable sans plus the system monospace stack
  for compact product metadata. Do not add a font dependency only for metadata.

The color roles are semantic and must not drift. Orange is not a CTA color;
violet is not decorative atmosphere; green is not used before verification.

Avoid:

- decorative gradients and gradient text;
- purple auroras, glowing spheres, and star fields;
- glass-card or bento-card filler;
- colored pills used as decoration;
- oversized em dashes or other synthetic editorial drama;
- serif display type;
- fake dashboards or proof.

Marketing CTAs are plain underlined links or a quiet form. The Kairo notch may
remain pill-shaped because that is product UI, not marketing decoration.

## Motion system

Motion explains product behavior. It is not ambient spectacle.

Use viewport-driven reveal choreography for the four teaching chapters and the
skill rows. Normal document scrolling remains fully under the user’s control.
There is no scroll-jacking, pinned multi-screen sequence, or custom wheel
behavior.

Where supported, CSS view timelines may drive the sequence. The fallback is a
small `IntersectionObserver` that adds a reveal class once. Content must remain
visible and understandable if neither enhancement is available.

Motion constraints:

- animate `transform`, `opacity`, and SVG stroke progress rather than layout;
- each chapter runs once and settles into a readable end state;
- stagger only meaningful causal order;
- do not auto-play audio;
- keep hero motion restrained so the promise is readable immediately;
- use `prefers-reduced-motion: reduce` to disable choreography and show the final
  state;
- pause nonessential looping animation when the page is hidden or off-screen.

## Product imagery

The product preview should use Kairo's actual notch, annotation, target, cursor,
and verification language. The final public page should use actual Kairo footage
over actual software.

The design prototype may use the official Blender manual startup-scene image as
a temporary stand-in. It must not be treated as a Kairo screenshot, and it
should be replaced with an owned capture before public launch. No stock AI art
or invented learner results are permitted.

## Responsive behavior

Desktop uses the split hero and large product-film composition.

At tablet widths:

- the hero stacks copy above the product preview;
- the preview keeps a usable aspect ratio rather than a fixed height;
- chapter copy and visual stay paired;
- the five-beat strip may wrap or become a two-row grid.

At phone widths:

- headline size uses `clamp()` and does not force artificial line breaks;
- the lesson rail becomes a compact overlay or moves below the product frame;
- the full interaction remains readable without horizontal scrolling;
- skill rows stack status below the software name;
- all tap targets remain at least 44px.

## Accessibility and performance

- Use semantic landmarks and a single `h1`.
- Preserve visible keyboard focus.
- Maintain WCAG AA contrast for body copy and controls.
- Product visuals require useful alt text; decorative marks are hidden from
  assistive technology.
- The waitlist is fully keyboard operable.
- Do not encode learner/Kairo/verified meaning by color alone; retain text
  labels.
- Avoid loading video in the initial implementation. Prefer an optimized still
  plus lightweight CSS/SVG motion.
- Reserve media dimensions to prevent layout shift.
- Lazy-load below-the-fold imagery.
- Keep animation code dependency-free.

## Implementation boundary

The desktop product and the marketing page must remain isolated.

The existing `index.html` and hash routes are used by four Tauri WebViews:

- main setup window;
- `#/notch`;
- `#/overlay`;
- `#/cursor`.

The landing page must not replace or restyle those views. The browser root `/`
will render the landing page. The current setup/debug shell moves to the explicit
`#/app` route. Native routes are resolved first and remain unchanged:

- `#/notch` → `NotchApp`;
- `#/overlay` → `OverlayApp`;
- `#/cursor` → `CursorApp`;
- `#/app` → the current `App`;
- empty browser hash → the landing page.

The Tauri main window must be changed to `index.html#/app` in
`src-tauri/tauri.conf.json`; otherwise first-run permission onboarding would
incorrectly open the marketing page. The early transparent-document bootstrap
in `index.html` remains unchanged.

Landing styles live in a CSS module or are otherwise strictly scoped to the
landing root. Do not add marketing selectors to `src/styles.css`, which is
shared by the native notch, overlay, and cursor WebViews.

The expected implementation remains small: one landing component, one isolated
stylesheet, the minimum entry/routing/config change, and focused tests for route
choice and waitlist validation. Do not simulate network latency or impossible
backend failures in the local-only mock. Update `brand.md` so the approved
semantic color roles replace the stale teal/dark direction. No CSS framework,
animation library, router, or backend is needed.

## Verification

Before completion:

- run `npm run typecheck`;
- run `npm run test`;
- run `npm run build`;
- verify the landing page at desktop, tablet, and phone widths;
- verify keyboard navigation and form states;
- verify reduced-motion behavior;
- run `npm run app -- --check` because frontend entry changes can affect packaged
  Tauri WebViews;
- confirm the main, notch, overlay, and cursor windows still route correctly.

## Deliberately out of scope

- production waitlist storage or email automation;
- authentication;
- analytics integration;
- a CMS;
- pricing;
- testimonials, customer logos, or metrics without real evidence;
- supporting every software tool at launch;
- autonomous clicking;
- redesigning the desktop product UI.
