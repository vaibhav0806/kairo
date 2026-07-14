# Kairo Botanical Apron Design

## Goal

Make the existing meadow photograph a stronger part of the hero without changing the composition the user already likes. The product demo and copy remain the visual hierarchy; the meadow adds color, depth, and tactile energy behind them.

## Treatment

- Keep the existing `meadow-edge.webp` asset and its current semantic role as decorative imagery.
- Enlarge it into a lower-right ground plane behind the Blender product window: 88% of the environment width and 42% of its height on desktop.
- Restore the photograph's natural color by increasing opacity and saturation and removing the artificial blur.
- Replace the current top-only fade with a soft top-and-left mask so the meadow grows out from behind the product window and dissolves cleanly into the white page.
- Keep the meadow below the upper half of the product window so it cannot compete with the demo overlays.
- Preserve the existing mobile composition, but use an edge-to-edge crop at 30% of the environment height with restrained opacity so the image does not crowd the product window.

## Motion

- Add one subtle ambient movement while the hero is active: a slow scale from `1.02` to `1` paired with an 8px upward settle.
- Disable the movement when reduced motion is requested or the page is not visible.
- Do not add looping wind, floating particles, or new decorative elements.

## Boundaries

- Do not change the hero copy, product-window layout, Blender animation, or primary photograph.
- Do not add new assets or markup; the approved mask and motion must use the existing meadow element.
- Keep the implementation isolated to the meadow styles and the tests that protect them.

## Reversibility

Implement the treatment in one dedicated commit after the current clean hero commit. Reverting that commit must restore the current hero exactly.

## Verification

- Confirm the meadow is visibly richer at desktop, tablet, and mobile widths without covering the demo.
- Confirm the hero has no horizontal overflow.
- Confirm motion pauses when the page is hidden and is absent under `prefers-reduced-motion`.
- Run the landing-page tests, typecheck, and production build.
