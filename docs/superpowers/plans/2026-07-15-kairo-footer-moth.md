# Kairo Footer Moth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive, pixelated moth artwork to the right side of Kairo's footer without changing the approved `Learn by doing.` copy.

**Architecture:** Store one transparent raster asset under the existing `public/field-notes/` collection. Render it as a decorative footer layer and reuse the landing page's existing `data-ambient-stage` visibility observer for one restrained entrance drift; CSS owns placement, cropping, responsiveness, and reduced-motion behavior.

**Tech Stack:** React, TypeScript, CSS Modules, Vite, Vitest, local WebP assets

## Global Constraints

- Preserve `Learn by doing.` exactly as written and in its current position.
- Preserve the large `kairo` wordmark.
- The moth must be visibly halftoned or dithered rather than photorealistic.
- Do not include text, logos, a background, or additional objects in the asset.
- Keep the moth behind footer content so it never blocks text.
- Disable movement when reduced motion is requested.
- Add no new runtime dependency.

---

### Task 1: Create the footer moth asset

**Files:**
- Create: `public/field-notes/footer-moth.webp`

**Interfaces:**
- Produces: a transparent WebP asset available at `${import.meta.env.BASE_URL}field-notes/footer-moth.webp`
- Consumes: no application code

- [ ] **Step 1: Generate the source artwork**

Generate one square transparent image using this exact art direction:

```text
A single oversized moth viewed straight-on with wings fully spread, rendered as a black-and-off-white archival natural-history engraving converted into coarse bitmap halftone and ordered dithering. High contrast, imperfect tactile ink texture, slightly strange and expressive. Add only a very thin chromatic fringe along the outer silhouette that shifts between acid green and electric violet. Transparent background, no ground shadow, no text, no logo, no frame, no plants, no additional insects or objects. Center the moth with generous transparent margin so it can be cropped responsively.
```

- [ ] **Step 2: Export the production asset**

Convert the generated source to `public/field-notes/footer-moth.webp`, preserving transparency and a minimum width of 1600 pixels.

- [ ] **Step 3: Verify the asset**

Run:

```bash
sips -g pixelWidth -g pixelHeight -g hasAlpha public/field-notes/footer-moth.webp
```

Expected: width and height are at least `1600`; `hasAlpha: yes`.

- [ ] **Step 4: Commit**

```bash
git add public/field-notes/footer-moth.webp
git commit -m "feat: add footer moth artwork"
```

### Task 2: Integrate the moth into the responsive footer

**Files:**
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/LandingPage.module.css`
- Test: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: `public/field-notes/footer-moth.webp` through the existing `asset(filename: string): string` helper pattern
- Produces: a decorative `<img data-footer-moth>` inside the existing footer and responsive CSS placement

- [ ] **Step 1: Write the failing footer test**

Add assertions to the existing structured-footer test:

```ts
const footer = screen.getByRole('contentinfo');
expect(footer.textContent).toContain('Learn by doing.');
expect(footer.querySelector('[data-footer-moth]')?.getAttribute('src')).toContain('field-notes/footer-moth.webp');
expect(footer.querySelector('[data-footer-moth]')?.getAttribute('alt')).toBe('');
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- --run tests/landingPage.test.ts
```

Expected: FAIL because `[data-footer-moth]` is absent.

- [ ] **Step 3: Render the decorative asset**

Add the standard landing-page asset helper near the imports:

```ts
function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}
```

Mark the footer as an ambient stage and render the image before `.footerTop`:

```tsx
<footer className={styles.footer} data-ambient-stage>
  <img
    className={styles.footerMoth}
    data-footer-moth
    src={asset('field-notes/footer-moth.webp')}
    alt=""
    width="1800"
    height="1800"
    loading="lazy"
    decoding="async"
  />
```

- [ ] **Step 4: Add responsive composition and motion**

Add CSS that keeps the artwork behind content, crops it from the right edge, and only shifts it when its existing ambient observer activates:

```css
.footerMoth {
  position: absolute;
  z-index: 0;
  right: -10%;
  top: 5%;
  width: min(58vw, 920px);
  height: auto;
  opacity: 0.86;
  pointer-events: none;
  transform: translate3d(0, 5%, 0) rotate(4deg);
  transition: transform 1200ms cubic-bezier(.2,.7,.2,1);
}

.footer[data-ambient-active='true'] .footerMoth {
  transform: translate3d(0, 0, 0) rotate(4deg);
}

.footerTop,
.footer > strong {
  position: relative;
  z-index: 1;
}
```

Inside the existing `max-width: 760px` media query, add:

```css
.footerMoth {
  top: 28%;
  right: -34%;
  width: min(110vw, 700px);
  opacity: 0.68;
}
```

The existing reduced-motion rule already forces `transform: none` and `transition: none` for footer descendants.

- [ ] **Step 5: Run verification**

Run:

```bash
npm test -- --run
npm run build
git diff --check
```

Expected: 47 tests pass, the Vite production build exits `0`, and `git diff --check` prints no output.

- [ ] **Step 6: Commit**

```bash
git add src/landing/LandingPage.tsx src/landing/LandingPage.module.css tests/landingPage.test.ts
git commit -m "feat: add moth artwork to footer"
```

### Task 3: Visual and live verification

**Files:**
- Modify only if visual verification exposes a concrete responsive defect.

**Interfaces:**
- Consumes: the completed footer asset and CSS composition
- Produces: verified desktop, tablet, and mobile footer layouts

- [ ] **Step 1: Review desktop, tablet, and mobile widths**

Check the footer at `1440`, `768`, and `390` CSS pixels. Confirm the moth is visible, the left copy remains unobstructed, the large wordmark remains readable, and no horizontal scrollbar appears.

- [ ] **Step 2: Review reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm the moth remains static and visible.

- [ ] **Step 3: Re-run verification after any visual fix**

```bash
npm test -- --run
npm run build
git diff --check
```

Expected: 47 tests pass, build exits `0`, and no whitespace errors are reported.

- [ ] **Step 4: Publish**

Push the completed commits to the `main` branch and confirm the existing ngrok preview returns HTTP `200` with `field-notes/footer-moth.webp` in the rendered module response.
