# Kairo Any-Software Positioning Revision

Date: 2026-07-13
Status: Approved direction, pending written-spec review

## Objective

Present Kairo as an AI tutor for learning any desktop software. Compatibility is
broad, but the product job remains narrow: Kairo teaches; it does not automate
the learner's work or act as a general desktop agent.

The existing headline remains the product promise:

> Learn software by doing. Not watching.

The supporting category line becomes:

> Kairo is an AI tutor that teaches you inside whatever desktop software you're
> learning.

## Product-story hierarchy

1. The hero establishes the category and learner-controlled loop.
2. Blender appears only as a concrete hero demonstration.
3. The four “How it works” chapters use multiple software examples to prove
   breadth.
4. The skills section presents equal compatibility, not a staged roadmap.
5. The access section invites people to bring the software they want to learn.

The page must not describe Kairo as a desktop agent, automation tool, copilot
that performs work, or app-specific integration marketplace. “The AI points.
You act.” remains the behavioral principle.

## Hero

- Eyebrow: `AI tutor for any desktop software / Mac alpha`
- Headline: unchanged.
- Intro: `Kairo teaches you inside whatever software you're learning. Ask a
  question, point to what you mean, do the step yourself, and let Kairo check
  the result.`
- Product-preview label: `Example lesson / Blender`
- Blender remains the sole app-specific hero example and retains the Blender
  Manual attribution.

### Hero image quality

The current 849×527 image is stretched to roughly twice its source dimensions
in the reported desktop layout, then faded with `opacity: 0.88`. This is the
root cause of the blurry, washed-out preview.

Replace it at the same public path with a clean Blender startup-scene capture of
at least 1698×1054, preferably approximately 2400×1500 for Retina headroom. A
local high-resolution capture from the installed Blender application is
preferred because the Blender Manual serves the same low-resolution source.
Render it at full opacity. Do not use CSS sharpening or artificial raster
upscaling.

### Hero overlay geometry

Keep all current animation timing. Change geometry only:

- Violet target: tightly cover the selected cube at approximately `left:
  44.8%`, `top: 43.5%`, `width: 10.7%`, `aspect-ratio: 0.92`.
- Orange annotation: surround the complete cube with a loose hand-drawn margin
  at approximately `left: 39.35%`, `top: 39.8%`, `width: 21%`.
- The label remains attached to the violet target, and the cursor resolves to
  the cube rather than empty grid space.

The final geometry must be verified visually at desktop and mobile sizes after
the new image is captured, because a different crop may require small percentage
adjustments.

## Cross-tool learning chapters

Each chapter demonstrates the same learning loop in a different context. Kairo
answers and points; the learner performs every action.

1. **Ask naturally — Figma**
   - Question: `Why won't these cards resize with the frame?`
   - Guidance: `The parent is fixed width. Change it to Fill container, then
     resize the frame.`
   - Learner action and verification remain explicit.
2. **Point to context — Photoshop**
   - The learner circles a visible control.
   - Resolved target: `Layers panel → Add layer mask`.
3. **Stay in control — DaVinci Resolve**
   - Guidance points to `Add to Render Queue`.
   - Copy continues to state that Kairo does not click for the learner.
4. **Build real progress — tool-neutral**
   - Steps: `Find the control`, `Make the change`, `Check the result`.
   - The green verified state and violet next state remain semantic.

## Compatibility section

Replace the roadmap framing and all `Active`, `Next`, and `Planned` statuses.

- Label: `Software you can learn with Kairo`
- Heading: `One tutor for whatever you open next.`
- Supporting copy: `Blender, Photoshop, DaVinci Resolve, Figma, and anything
  else on your screen.`
- Rows remain visually equal:
  - Blender — `3D · animation · rendering`
  - Photoshop — `Layers · masks · retouching`
  - DaVinci Resolve — `Timeline · color · delivery`
  - Figma — `Frames · auto layout · components`
  - Any desktop software — `If it is on your screen, you can learn it with
    Kairo.`

The final row communicates open-ended breadth without presenting unverified
app-specific integrations.

## Access section

Remove `Kairo is beginning with Blender learners` and `Blender first`.

- Lead: `Bring the software you're learning. Join the early-access list to try
  Kairo on your own screen.`
- Close: `Blender, Photoshop, DaVinci Resolve, Figma, and many more.`
- The form remains a clearly labeled, local-only mock.

## Verification visual spacing

The green and violet row backgrounds currently contain no horizontal padding,
which leaves the index and status text pressed against their edges. Add 24px
horizontal padding on desktop and 16px on mobile while retaining the existing
outer chapter padding, grid structure, and animation sequence.

## Accessibility and motion

- Preserve existing IntersectionObserver and page-visibility gating.
- Preserve the existing ten-second hero sequence and chapter timing.
- Preserve readable no-observer and reduced-motion final states.
- Keep verified green exclusively for confirmed learning progress.
- Maintain current keyboard, focus, contrast, attribution, and mock-waitlist
  behavior.

## Acceptance criteria

- No Blender-first or Blender-only product claims remain outside the hero
  example, and no `Active`, `Next`, or `Planned` compatibility statuses remain.
- The page clearly says Kairo teaches inside any desktop software.
- The four feature chapters no longer repeat a Blender cube/keyframe workflow.
- The compatibility section treats the named tools as examples, not a roadmap.
- The Blender source remains clear when the preview is rendered at 1974×1012.
- Orange and violet overlays identify the actual cube at desktop and mobile
  widths without changing their animation timing.
- Verification-row content has visible breathing room on both sides.
- Reduced-motion, no-observer, keyboard, 200% zoom, responsive layout, mock
  waitlist, typecheck, tests, and Vite production build remain healthy.
- No Tauri, native application, or `.app` build is run.
