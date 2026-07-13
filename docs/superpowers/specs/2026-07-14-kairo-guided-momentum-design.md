# Kairo Color Signal Landing Page

Date: 2026-07-14
Status: proposed design

## Objective

Replace Kairo's polished-but-muted landing page with a crisp, optimistic
product experience. It must feel like a modern creative tool in motion: bold,
screen-native, and unmistakably about learning by doing.

The previous warm editorial direction is deliberately retired. More movement
and color must reveal product behavior, not become generic AI decoration.

## Visual direction: Color Signal

Kairo uses a near-white canvas and high-contrast black typography. The product
states become the visual identity:

- learner input — orange `#FF6547`;
- Kairo guidance — violet `#8B79FF`;
- verified progress — green `#78CAAA`;
- active learning / app discovery — electric blue `#3078FF`.

Colors appear in larger, geometric marks: targets, underlines, progress
segments, scene tabs, cursor paths, and confirmation panels. They never become
background auroras, gradients, glass effects, or arbitrary decoration.

## Hero: a bright live desk

Keep the split hero and genuine Blender product preview. Surround it with a
compact signal system that makes the product feel active before the user
scrolls:

1. an orange `You ask` marker originates beside the headline;
2. a violet guide path crosses toward the preview and resolves at the target;
3. a green `Step checked` marker settles below the preview;
4. a thin blue lesson counter carries the flow from 01 to 03.

The heading, description, and actions remain plain and readable. The signals
are visual proof rather than extra explanatory copy. The hero animation loops
only while visible, pauses when requested, and respects reduced motion.

## Main product sequence: a visual lesson runway

Follow the hero with a horizontal-to-vertical sequence of three product scenes.
It is the page's energetic centre rather than a generic feature grid.

### Scene 01 — Ask / Figma

An off-white interface fragment shows a layout question. An orange drawn mark
and label identify the confusing area. Supporting copy: `Circle the thing that
doesn't make sense.`

### Scene 02 — Guide / Photoshop

A darker image-editing interface fragment shows a violet Kairo target, a short
spoken instruction, and a cursor that stops before clicking. Supporting copy:
`Kairo points to one next step.`

### Scene 03 — Check / DaVinci Resolve

A timeline-like interface fragment shows a green completion rail and a checked
result. Supporting copy: `You do it. Kairo checks what changed.`

Each scene uses stylised CSS/SVG product fragments, not a fabricated complete
application screenshot. Captions call them examples. The exact live-product
claim remains limited to the existing Blender demonstration.

## Motion

The learning order is visible:

- orange annotation strokes draw first;
- violet target and cursor follow;
- green verified state arrives only at the end;
- blue progress marker advances between scenes.

Scroll motion runs once per scene using the existing observer structure. It
only animates transforms, opacity, and SVG stroke progress; every scene remains
readable in its final state with JavaScript disabled or reduced motion enabled.

There is no parallax, scroll-jacking, animated background, auto-scrolling
marquee, blur, or autoplay audio. Motion is 300–400ms for a scene entrance and
100–150ms for interactive feedback.

## Skills: product map instead of a passive table

The skills section becomes a clean white product map that follows the runway.
Each application is a vivid but compact tile connected to a learning mode:

- Blender — model;
- Photoshop — image;
- DaVinci Resolve — edit;
- Figma — layout.

Tiles expose the existing honest descriptions and animate their color mark into
place on scroll. Do not add availability labels, fake integrations, customer
logos, testimonials, or invented results.

## Quiet finish

Trust and early-access sections return to mostly neutral off-white with small
semantic signals only. This release of visual density gives the waitlist form a
clear, trustworthy finish after the energetic product story.

## Technical boundaries

- Preserve React/Vite structure, isolated landing styles, current waitlist
  mock, primary Blender image, semantic color roles, visible focus, and
  reduced-motion fallback.
- Do not add a design, animation, or image package. Use local React, CSS, and
  SVG only.
- Do not modify Tauri routes or native WebView styles.
- Product visuals reserve their own dimensions and must not cause layout shift.
- Test at 1440px, 1280px, 768px, and 390px. No horizontal clipping, text
  overlap, or hidden structural content is acceptable.

## Acceptance criteria

- The hero visibly communicates learner → guide → verified through color and
  motion before a visitor reaches the first scroll section.
- The first two page lengths show three materially different, visual Kairo
  learning moments across multiple applications.
- The skills area reads as an active product map instead of a static table.
- The full page feels more upbeat and distinctive in visual review while
  preserving clarity and trust.
- All color meaning is duplicated with visible labels; reduced motion renders
  the completed, readable page; focused tests and production build pass.
