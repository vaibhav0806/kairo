# Responsive motion Task 2 report

## Outcome

Restored the landing page's product-demo loop and replaced generic chapter-child timing with semantic, causal, one-shot sequences. The work stayed website-only; no Tauri command, native build, `.app` launch, route, or waitlist behavior was touched.

## Files

- `tests/landingPage.test.ts`
  - Added the requested semantic markup/keyframe contracts.
  - Added focused regression contracts for the corrected guidance-notch entrance and its mobile position.
- `src/landing/LandingPage.tsx`
  - Replaced the hero annotation div with an inline orange SVG path while retaining the attributed Blender PNG backdrop.
  - Added `data-motion` semantics to conversation, annotation, guidance, verification, and skills.
  - Moved the skills reveal hook to the observed list and assigned `--skill-index` to rows.
  - Added restrained reveal hooks to the problem transition, section headers, difference, trust, and access.
  - Added a real spoken-guidance notch to the guidance chapter.
- `src/landing/LandingPage.module.css`
  - Added the visibility-scoped hero loop and distinct one-shot chapter/skill keyframes.
  - Added complete static/reduced-motion states and a mobile guidance spacing correction.
- `.superpowers/sdd/responsive-task-2-report.md`
  - This verification report.

## TDD evidence

### Initial RED

Command:

```text
npm test -- tests/landingPage.test.ts
```

Result: exit 1. The new choreography contract failed first on missing `data-motion="conversation"`; the other 8 landing-page tests passed. This confirmed the test was detecting the absent feature rather than a setup error.

### Initial GREEN

Command:

```text
npm test -- tests/landingPage.test.ts
```

Result: exit 0, 1 file passed, 9 tests passed.

### Browser-found regression cycles

Chrome sampling exposed two concrete issues, each handled with a focused RED/GREEN cycle:

1. The guidance notch's first animated frame jumped downward because it shared the target-control keyframe. A new `guidenotchin` contract failed at RED, then passed after the notch received its own `-14px → 0` entrance.
2. At a 390px viewport the guidance notch overlapped the target by 10.8px. A mobile CSS contract failed at RED, then passed after moving the notch to `top: 54px`.

Final focused result after both fixes: exit 0, 9/9 tests passed.

## Implemented motion behavior

### Hero loop

The final static composition remains the base CSS state. Looping keyframes are applied only below:

```css
.landingPage[data-demo-active='true'][data-page-visible='true']
```

The 10-second loop enters in causal order: learner question, orange SVG draw, violet target resolve/pulse, ghost cursor travel, spoken notch, and progress verification. All overlay elements fade together near the end, and the SVG resets while invisible, avoiding a visible hard reset. Leaving the preview or hiding the page removes the scoped animations and returns the readable final composition.

### Scroll chapters

- `conversation`: learner question → Kairo spoken response → action/verification.
- `annotation`: orange SVG stroke draw → label/resolved answer → verification.
- `guidance`: spoken notch → target control → cursor travel → learner action → verification.
- `verification`: completed rows become green in order → next row becomes violet/current → verification message.
- `skills`: one observed list triggers horizontal rows with `100ms * --skill-index` staggering.

Generic reveal motion remains only for restrained section continuity. No scroll listener, wheel interception, snap behavior, or scroll-timeline dependency was added.

## Chrome computed-style evidence

Browser: installed Google Chrome, production Vite preview, DevTools Protocol. Desktop viewport: 1440×1000. Mobile viewport: 390×844.

### Hero sampled frames

After explicitly restarting the visible loop, Chrome reported:

- Question: opacity `0 → 1`; Y transform `16px → 0`.
- Orange hero SVG: stroke dash offset `430px → 119.9px → 0px`; opacity `0 → 1`.
- Violet target: opacity `0 → 1`; scale `0.88 → 1.027 → 1`, proving resolve plus pulse.
- Ghost cursor: translation `76px, 58px → 0, 0`; opacity `0 → 1`.
- Notch: opacity `0 → 0.56 → 1`; Y transform `-14px → -6.2px → 0`.
- Progress rail: opacity `0 → 1`; Y transform `12px → 0`.
- Completed step: color `rgb(185,185,181) → rgb(126,200,171) → rgb(120,202,170)`.
- At 9.22s all overlay opacities were fading together (`0.823`), confirming a soft loop reset rather than a hard flash.

### One-shot chapter samples

- Conversation settled with question, response, and verification at opacity `1` and zero Y translation after entering in order.
- Annotation path sampled at `430px / opacity 0`, then `422.99px / 0.016`, then `40.88px / 0.905`, and settled at `0px / 1`; the resolved answer stayed hidden until after the draw and settled visible.
- Corrected guidance notch sampled at Y `-14px`, then `-11.06px`, and settled at `0`; target stayed pending during notch entry. Cursor sampled from translation `72px,58px` to `0,0`; learner action settled at opacity `1`.
- Verification rows began gray (`rgb(119,120,125)`), the first row turned green before the second, and the settled state was two green rows plus a violet current row (`rgb(139,121,255)`).
- Skills sampled row 1 at opacity `0.829` / X `4.78px`, row 2 at `0.463` / X `15.04px`, and row 4 still at `0` / X `28px`; all rows settled at opacity `1` / X `0`, proving the 100ms stagger.

### Accessibility/fallback samples

With Chrome emulating `prefers-reduced-motion: reduce`:

- `data-motion-ready` remained absent.
- 11/11 reveal containers, all skill rows, and all causal chapter children were visible.
- Hero and chapter SVG dash offsets were `0px`; hero animation name was `none`.
- Verification colors were already final: green completed rows and violet current row.

With `IntersectionObserver` removed before page scripts executed:

- `data-motion-ready` remained absent.
- Hidden reveal containers: `0`.
- Hidden causal nodes: `0`.
- Both SVG dash offsets were `0px`.

### Mobile layout sample

At 390×844 after the corrective cycle:

- Document width: `390px`; horizontal overflow: `false`.
- Guidance notch/target overlap: `0px`.
- Gap between notch and target: `9.19px`.

No screenshots were captured; computed style, stroke, color, transform, opacity, and geometry samples were recorded directly from Chrome.

## Full web verification

Final command:

```text
npm run typecheck && npm test && npm run build && git diff --check
```

Result:

- TypeScript: exit 0.
- Vitest: 36 files passed, 190 tests passed.
- Production website build: exit 0; 81 modules transformed.
- Diff whitespace check: exit 0.

Focused final result: `tests/landingPage.test.ts` passed 9/9.

## Self-review

- Scope is limited to the three requested landing files plus this required report.
- The existing IntersectionObserver architecture is reused; there are no new dependencies or scroll event handlers.
- Static HTML/CSS remains fully readable before enhancement, without IntersectionObserver, and under reduced motion.
- No scroll snap, wheel interception, gradients, fake video, routing/native/waitlist changes, or unrelated redesign was introduced.
- The Blender PNG remains explicitly labeled and attributed as an interface backdrop; product behavior is represented by real HTML/SVG overlays rather than video.
- The only remaining judgment call is animation pacing: timings are intentionally restrained and causal, but subjective feel can still be tuned later without changing the semantic structure.
