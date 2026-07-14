# Kairo Hero and Tool Reveal Design

**Status:** Approved

## Goal

Tighten the landing page's first-screen rhythm across viewport sizes, make the tools collage arrive progressively as the learner scrolls, and remove the repeated “Ask, try, learn” heading.

## Hero spacing

- Keep the existing split editorial composition, typography, imagery, and Blender lesson.
- Replace the vertically centered desktop copy with top-aligned content plus a small viewport-height-based optical offset.
- Reduce hero and scene top padding with `clamp()` values that respond to both short and tall screens.
- Preserve the existing single-column and mobile layouts without introducing fixed pixel heights or horizontal overflow.

## Tools reveal

- Keep “Learn across your tools” visible before the collage.
- Observe each of the four tool prints independently using the existing intersection-observer system.
- Each print enters once with opacity, a short upward translation, and its existing rotation settling into place.
- Use a maximum 400 ms ease-out transition. Do not animate layout properties.
- Under `prefers-reduced-motion: reduce`, show every print immediately in its final position.

## Practice heading

- Replace “Ask, try, learn” with “Keep making. Keep learning.”
- Keep the three Ask, Try, and Learn cards unchanged; they are the visual explanation beneath the new outcome-focused heading.

## Verification

- Add regression coverage for the responsive hero alignment and viewport-height spacing tokens.
- Add regression coverage for four independently observed tool prints and motion-safe CSS.
- Update copy assertions for the new practice heading.
- Run tests, typecheck, production build, and `git diff --check`.
