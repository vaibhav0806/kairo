# Kairo Footer Wildflower Design

## Goal

Give the footer a memorable organic visual signature without changing its approved left-side message or making the artwork explain the product literally.

## Direction

Add one oversized wildflower specimen to the right side of the black footer. It should resemble a scanned botanical print converted into coarse monochrome halftone pixels: tactile, slightly strange, and consistent with the meadow imagery already used across the site.

## Composition

- Preserve `Learn by doing.` exactly as written and in its current position.
- Preserve the large `kairo` wordmark.
- Place the wildflower on the footer's right half and crop part of it beyond the right edge.
- Keep it behind the footer content so it never blocks text.
- Use an off-white botanical engraving with a restrained acid-green fringe.
- Let it occupy roughly 55–65% of the footer width on desktop.
- On small screens, move it lower and keep the left message unobstructed.

## Motion

- Apply a very small vertical drift as the footer enters the viewport.
- Add no continuous looping animation.
- Disable movement when reduced motion is requested.

## Asset

- Use a locally stored transparent raster asset.
- The flower must be visibly halftoned or dithered rather than photorealistic.
- Use one connected, asymmetrical plant with several crooked branches, abundant leaves, two or three blooms, and a few buds.
- Do not include text, logos, a background, insects, pots, or additional objects.

## Acceptance Criteria

- The approved left-side footer copy is unchanged.
- The wildflower is clearly visible without reducing text contrast.
- The footer remains responsive at desktop, tablet, and mobile widths.
- Reduced-motion visitors see a static composition.
- Tests and the production build continue to pass.
