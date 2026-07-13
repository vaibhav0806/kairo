# Kairo Live Creative Wall

Date: 2026-07-14
Status: approved product direction

## Objective

Turn Kairo's clean but restrained landing page into a visual AI-product launch.
The site must feel energetic before the visitor reads: real creative imagery,
recognisable software work, and motion that demonstrates Kairo's teaching loop.

The crisp white/off-white base remains. The previous abstract black wireframes
and large decorative app tiles are retired because they look like a design
system rather than product proof.

## Signature

The page is remembered for one recurring living mark:

`orange annotation → violet guidance → green check`

That sequence travels across the hero, creative imagery, software examples,
and closing action. It is Kairo's visual explanation of learning by doing.

## Visual system

- Canvas: near-white `#FCFCFA` and cool off-white `#F3F5F2`.
- Ink: `#151515`.
- Learner input: orange `#FF6547`.
- Kairo guidance: violet `#8B79FF`.
- Verified progress: green `#78CAAA`.
- Active controls: electric blue `#3078FF`.
- Product screens may use graphite `#171717` for contrast.

Color appears in confident blocks, annotations, targets, progress, and image
frames. Do not add generic gradient auroras, glass cards, or neon glows.

## Hero

Keep the split hero and real Blender screenshot, but make it behave like a live
product trailer:

1. the screenshot stays sharp and stable;
2. the learner's orange circle draws around the selected object;
3. the violet Kairo target and spoken step arrive;
4. the lesson rail resolves to a green checked state before looping.

The headline and supporting copy stay short. On mobile, a compact product strip
must enter the first viewport rather than leaving the fold text-only.

## Creative wall

Add four licensed Pexels images representing what visitors want to learn to
make, not generic stock portraits:

- vivid 3D output — Steve A Johnson;
- a real visual-design workspace — Tranmautritam;
- a real video-editing timeline — Vito Goričan.
- a bright blank design canvas — Hanna Pad.

Images are downloaded locally, resized to 1600px, credited, given fixed aspect
ratios, and used as learning surfaces. Kairo overlays sit above them; the site
does not imply the underlying images are Kairo outputs or customer work.

## Scroll story

Replace the generic wireframe lesson canvas with one sticky media stage. As the
visitor scrolls through the three numbered beats, the stage crossfades between
the 3D, design, and editing images while the same teaching sequence advances:

1. `Ask` — the orange hand-drawn mark identifies the confusing area.
2. `See the next step` — the violet target and cursor land on a control.
3. `Try it` — the timeline advances and a green check confirms the result.

Each beat has one sentence. The image and overlay carry the explanation.

## App examples

The app section becomes four compact visual windows instead of oversized
poster cards. Each window has one recognisable visual fragment and a small
motion demonstration:

- Blender: selection/orbit;
- Photoshop: layer reveal;
- DaVinci Resolve: moving playhead;
- Figma: frame reflow.

Micro-demos run when the tile enters the viewport and replay on hover/focus.
Text remains stationary. No invented availability claims are added.

## Closing

The dark control section remains as a deliberate contrast beat. The waitlist
becomes a brighter final composition with app-choice chips and a strong submit
state so the page ends with momentum rather than a thin form line.

## Motion and accessibility

- Animate transforms, opacity, SVG stroke progress, and object-position only.
- Hero motion pauses offscreen, in hidden tabs, and via the existing control.
- Scroll media crossfades are 300–400ms; interaction feedback is 100–150ms.
- Ambient motion must never block reading or input.
- Reduced motion renders every visual in a stable final state and hides the
  pause control.
- Structural text and the waitlist form are never hidden before observation.

## Acceptance criteria

- The first viewport includes a visually active product demo on desktop and
  mobile.
- At least four locally hosted, licensed images appear in the page.
- The sticky lesson stage visibly changes image and overlay state during normal
  scrolling at 1440px and 390px.
- Every app tile has a distinct, visible micro-demo.
- The page has no horizontal overflow, clipped copy, or blank scroll zones at
  1440px, 768px, and 390px.
- All existing tests plus new landing assertions pass, and the production
  build succeeds.
