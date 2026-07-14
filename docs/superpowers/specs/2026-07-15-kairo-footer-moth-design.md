# Kairo Footer Moth Design

## Goal

Give the footer a memorable visual signature without changing its approved left-side message or turning the artwork into a product mascot.

## Direction

Add one oversized moth illustration to the right side of the black footer. The moth should feel like a scanned natural-history specimen converted into coarse monochrome halftone pixels. It is intentionally unrelated to Kairo's literal product story; its role is atmosphere and recall.

## Composition

- Preserve `Learn by doing.` exactly as written and in its current position.
- Preserve the large `kairo` wordmark.
- Place the moth on the footer's right half, cropped partially beyond the right edge.
- Keep the moth behind the footer content so it never blocks text.
- Use an off-white body with a restrained violet-to-acid-green edge fringe.
- Let the artwork occupy roughly 45–60% of the footer width on desktop.
- On small screens, reduce the moth, move it lower, and keep the left message unobstructed.

## Motion

- Apply a very small vertical drift as the footer enters the viewport.
- Add no continuous looping animation.
- Disable the movement when reduced motion is requested.

## Asset

- Use a locally stored raster asset with transparency.
- The moth must be visibly halftoned or dithered rather than photorealistic.
- Do not include text, logos, a background, or additional objects in the asset.

## Acceptance Criteria

- The approved left-side footer copy is unchanged.
- The moth is clearly visible but does not reduce text contrast.
- The footer remains responsive at desktop, tablet, and mobile widths.
- Reduced-motion visitors see a static composition.
- Tests and the production build continue to pass.
