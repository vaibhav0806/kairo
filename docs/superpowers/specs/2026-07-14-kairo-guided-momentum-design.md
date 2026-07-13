# Kairo Guided Momentum Landing Page

Date: 2026-07-14
Status: proposed design

## Objective

Retain Kairo's clarity and calm confidence, while replacing the current
"polished but static" feeling with a landing page that visibly demonstrates a
learner moving through unfamiliar software.

The page should feel like an expressive creative tool, not a generic AI
landing page or a dark cinematic product trailer.

## Product idea

The web experience is a sequence of visible learning signals:

- a learner asks or marks a point of confusion;
- Kairo resolves the screen target;
- one action is guided;
- the learner completes it;
- the page acknowledges progress.

Orange remains learner input, violet remains Kairo guidance, and green remains
verified progress. Those states become legible page-wide rather than existing
only inside the Blender preview.

## What changes

### Hero: a live learning desk

Keep the split composition and the Blender preview as the single concrete
product proof. Add a restrained system of surrounding status signals:

- a compact orange "you ask" chip enters from the copy column;
- a violet target/guide signal travels toward the preview;
- a green completed-step signal settles once the preview reaches its verified
  animation phase;
- a subtle progress line connects those signals, without a gradient, glow, or
  decorative particle field.

The hero heading remains readable before these signals move. The proof should
feel active, never busy.

### Product story: three software moments

Replace the current largely textual distinction-to-lesson sequence with a
single visual learning runway that contains three small product scenes:

1. **Ask in Figma** — a frame resize question and an orange circle around the
   relevant control.
2. **Guide in Photoshop** — a violet Kairo response points at the next tool.
3. **Check in DaVinci Resolve** — a green result confirms the action happened.

These are clearly labeled examples, not claims that all app skills are live.
They use CSS/SVG interface fragments rather than fabricated full screenshots.
Each scene has one vivid action and one plain-language sentence.

### Motion: causal and visible

Use one-time scroll choreography only when JavaScript and motion preferences
allow it:

- learner marks draw in orange first;
- Kairo targets and cursor follow in violet;
- completion settles in green;
- scene cards rise a short distance and their internal action happens once;
- the active scene gains a numbered progress rail while the previous scene
  remains readable.

No ambient floating, parallax, scroll-jacking, blur, autoplay audio, or long
stagger chains. The existing reduced-motion final state remains fully visible.

### Skills: from a data table to a learning map

Keep the honest list of applications, but turn it into the tail of the visual
runway. Each app row gets a compact, static visual language marker tied to a
learning mode (layout, image, edit, model), plus the existing truthful copy.

Do not add availability claims, fake integrations, customer logos, testimonials,
or invented performance numbers.

## Layout and visual system

- Retain the warm surface and dark skills band; they preserve the friendly
  foundation already approved.
- Use 16px-ish geometric targets, underlines, and progress marks—not rounded
  SaaS cards—as the recognisable Kairo motif.
- Increase color presence only when it explains state. The orange/violet/green
  system is more saturated and appears at key story transitions.
- Place visual density in the hero and learning runway. Trust and waitlist stay
  comparatively quiet so the page has a release after the energy.
- Keep product examples crisp, high contrast, and sharply framed. Do not use
  gradients, glass, stock imagery, AI-generated people, or decorative 3D.

## Information order

1. Split hero + active learning signal system.
2. Short statement of the teaching loop.
3. Three-scene visual learning runway.
4. Skills / applications as the expansion of that capability.
5. Trust and access.

The main headline and waitlist behavior remain unchanged unless a small copy
change is needed to support a scene.

## Technical boundaries

- Preserve the current React/Vite structure, landing isolation, waitlist mock,
  Blender asset, semantic color roles, and reduced-motion support.
- Add only local React/CSS/SVG composition. Do not add an animation dependency
  or external imagery dependency.
- New motion must start only after in-view detection and must leave the final
  state readable if the observer fails.
- Keep all interactive controls real buttons or anchors, keyboard reachable,
  and focus-visible.
- Verify at 1440px, 1280px, 768px, and 390px; there must be no horizontal
  clipping or text/visual overlap.

## Acceptance criteria

- The first two scroll lengths contain at least three concrete, visibly
  different Kairo learning moments—not just headings and copy.
- Each accent color communicates a learner/Kairo/verified state in text as
  well as color.
- The landing page feels more energetic in a visual review while remaining
  recognisably Kairo and easy to scan.
- Hero and page motion are obvious but restrained, with a complete
  reduced-motion fallback.
- Existing waitlist, image, accessibility, and route behavior passes its
  focused checks; production build succeeds.
