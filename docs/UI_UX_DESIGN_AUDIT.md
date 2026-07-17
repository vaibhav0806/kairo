# Kairo Landing Page — UI/UX/Design Audit

Date: 2026-07-16
Scope: `src/landing`, global styles, responsive behavior, interaction code, motion, accessibility, and the alpha conversion path.

## Executive summary

Kairo already has a distinctive, coherent visual direction. The editorial typography, field-note photography, restrained palette, annotated product scenes, and repeated “Ask → Do → Check” model make the product feel more thoughtful than a generic AI landing page. The implementation also has strong foundations: semantic sections, responsive sizing, 44px controls, lazy loading below the fold, a pausable hero demo, visibility-aware animation, and a static reduced-motion transcript.

The current page is **not launch-ready**. The primary conversion action does not submit or store an email, the email field loses its visible keyboard focus indicator, mobile navigation removes all section links, and several frequent interactions are over-animated. The page also repeats the same learning loop three times, which increases length without adding enough new proof.

An external designer review reinforces the overall assessment: preserve the visual identity and the second “lesson from start to finish” section, then focus the next design pass on the hero stack, tool explanation, and trust section. The designer explicitly suggested a continuously moving carousel for Tools and possibly an alternative/video treatment around the hero. This audit records those suggestions faithfully, then recommends a user-controlled carousel rather than autoplay so the explanation remains accessible and easy to follow.

### Decision

**Block launch until P0 items are fixed.** After those fixes, the design is strong enough for a focused polish pass rather than a redesign.

### Designer-priority implementation status

Implemented on 2026-07-16:

- **Tools:** replaced the four-print collage with an automatically advancing, pausable carousel. Each tool now explains Ask, Identify, Next move, and Verify; manual selection and arrow-key navigation pause rotation, and reduced motion disables it.
- **Trust:** replaced the heavy white cards with three compact, translucent icon-led promises and shortened their supporting copy.
- **Hero:** removed the detached green meadow layer so the product window and background photograph read as one simpler stack.
- **Video:** intentionally not implemented. The corrected feedback presents it as an ambiguous alternative to explore, not a clear requirement; it should be prototyped only if the simplified hero still underperforms.

## External designer feedback — English translation

> Sir, I think the site is already pretty cool and has been made very well. I do not think there is a lot of major feedback.
>
> For the last “You stay in control” section, try exploring how it could be improved—for example, by adding some more icons. I think it is becoming a little too visually heavy.
>
> In the “Learn across your tools” section, things are being marked, but it is not being explained clearly what can happen, how it could be better, or what exactly is being communicated there. It is becoming a little confusing to understand what is happening.
>
> I think you could turn it into a carousel-type concept, like a continuously moving carousel. There could be an image with markers and everything explaining it; that might make the message feel clearer.
>
> Otherwise, it is looking pretty good. The style is good and feels a little different. Also, try seeing whether something else could be made—possibly a video or another treatment. The hero at the beginning feels slightly strange. The green image showing underneath it makes the stacking design feel like it could be improved.
>
> Apart from that, I think it is nice and everything looks fine. I liked the second section. I think that is enough; that section is good. What comes below it feels a little confusing, but the rest looks very good.
>
> I will also send some skills that you can apply, along with websites you can look at for inspiration.

### Corrections from the earlier transcription

| Earlier interpretation | Corrected understanding |
| --- | --- |
| “Try to make something else” | He mentions trying another treatment and appears to say **video**. The exact relationship to the hero is slightly ambiguous, so this should be treated as a concept to explore rather than a firm video requirement. |
| Carousel mentioned generally | He specifically proposes a **continuously moving carousel** with an image and markers for the Tools section. |
| Trust section needs icons | Correct, but he also says the section is already **visually heavy**. The intended improvement is better scanability, not simply adding more visual elements. |
| General confusion below the second section | Correct. His strongest clarity concern is the **Learn across your tools** section and the content that follows the second section. |
| Overall sentiment | Strongly positive: few major changes, preserve the distinctive style, and keep the second section substantially as it is. |

## What is working

| Area | Current strength | Evidence |
| --- | --- | --- |
| Visual identity | Geist UI type, Instrument Serif display type, paper/ink colors, offset print shadows, and editorial photography form a recognizable system. | `src/main.tsx:4-5`, `src/landing/LandingPage.module.css:1-31` |
| Product explanation | The page shows the product inside Blender instead of relying on abstract AI claims. | `src/landing/Hero.tsx:101-132`, `src/landing/LearningSequence.tsx:120-177` |
| Information model | “Ask → Do → Check” is simple, memorable, and consistently represented. | `src/landing/LearningSequence.tsx:4-26` |
| Responsive foundation | Layouts use `clamp()`, minimum widths, content caps, and explicit desktop/mobile modes. | `src/landing/Hero.module.css:1-9`, `src/landing/VisualField.module.css:608-703` |
| Interaction safety | The hero demo can be paused and stops while off-screen or while the page is hidden. | `src/landing/Hero.tsx:12-49`, `src/landing/Hero.tsx:88-99`, `src/landing/Hero.module.css:420-459` |
| Baseline accessibility | Semantic landmarks, labelled sections, descriptive images, 44px minimum controls, validation messaging, and reduced-motion handling are present. | `src/landing/LandingPage.tsx:98-137`, `src/landing/TrustWaitlist.tsx:70-94`, `src/landing/LandingPage.module.css:38-48` |

## Prioritized findings

### P0 — must fix before launch

| Before | After | Why |
| --- | --- | --- |
| “Join the alpha” validates locally, then says the email was not submitted or stored. `src/landing/TrustWaitlist.tsx:31-41,75-94` | Connect the form to the actual waitlist endpoint, show pending/success/error states, and only claim success after a confirmed response. If the backend is intentionally unavailable, replace the form and CTA with an honest “Alpha signup coming soon” state. | The primary CTA cannot fulfill its promise. This is a conversion failure and a trust problem, not a polish issue. |
| The input overrides shared focus styling with `outline: none; box-shadow: none`. `src/landing/TrustWaitlist.module.css:137-141` | Keep the global focus ring or add an input-specific `:focus-visible` ring with at least a 3:1 contrast against adjacent colors. | Keyboard users cannot see where focus is. The current rule cancels the otherwise good global focus treatment. |

### P1 — high-impact UX improvements

| Before | After | Why |
| --- | --- | --- |
| All navigation links disappear below 760px. `src/landing/LandingPage.module.css:212-219` | Keep a compact “How it works” link or add a small, accessible menu. Preserve direct access to the page’s proof sections. | Mobile users are left with only home and the alpha CTA, weakening wayfinding and forcing a long linear scroll. |
| The same Ask/Do/Check story appears in the hero transcript, the full learning sequence, and the practice section. `src/landing/Hero.tsx:135-138`, `src/landing/LearningSequence.tsx:179-196`, `src/landing/VisualField.tsx:105-130` | Give each section one job: hero = value and immediate proof; sequence = detailed product mechanics; practice = outcomes, use cases, or learner evidence. Remove the redundant third explanation. | Repetition lengthens the page without increasing confidence. The narrative should progress from promise → proof → breadth → trust → conversion. |
| The hero’s main CTA is “See how it works,” while the alpha CTA is visually secondary and only appears in the header. `src/landing/Hero.tsx:60-65`, `src/landing/LandingPage.tsx:114` | Keep “See how it works” as secondary and add a clear primary “Join the alpha” action in the hero once the form works. | Visitors who already understand the value should not have to scroll or inspect the header to convert. |
| Below-fold sections start hidden until `IntersectionObserver` marks them revealed. `src/landing/LandingPage.tsx:45-67`, `src/landing/LandingPage.module.css:50-58` | Keep content visible by default and opt into motion with a short-lived initialized class plus a fail-safe. Add print styles that force all content visible. | Full-page capture exposed a largely blank middle because off-screen content never intersected. The same pattern is fragile for print, automation, and observer edge cases. |
| “Any desktop app” is claimed after showing four examples. `src/landing/VisualField.tsx:24-29` | Name supported/tested apps or qualify the statement as the intended direction. Add one compact platform/alpha-scope line near the CTA. | An unqualified universal claim weakens trust when the page provides narrower evidence. |
| The tool prints show prompts, focus marks, and a connector, but do not explain what each mark represents or what Kairo does next. `src/landing/VisualField.tsx:31-101` | Replace the four simultaneous prints with one focused, user-controlled showcase. For each tool, explicitly label **what you ask**, **what Kairo identifies**, **the next move**, and **how success is checked**. | The current composition communicates breadth, but not the product behavior. More markers or motion would increase confusion unless their meaning is made explicit. |
| The footer contains only “Learn by doing” and the wordmark. `src/landing/LandingPage.tsx:122-137` | Add a compact footer row for contact, privacy, terms, and product/company identity. Include only real destinations. | An AI product asking for email access needs basic trust and accountability cues. |

### P2 — visual hierarchy and responsive polish

| Before | After | Why |
| --- | --- | --- |
| The hero remains stacked until 1180px and its visual environment keeps a `520–860px` minimum height. `src/landing/Hero.module.css:56-60,499-516` | Add an intermediate tablet/small-laptop composition around 900–1100px and reduce the visual stage height there. | The current breakpoint can create excessive vertical travel before users reach supporting proof. |
| The hero layers a rotated field photo, a meadow-edge cutout, and the product window with competing offsets and shadows. `src/landing/Hero.module.css:64-140` | Make the product window the dominant layer. Reduce the green meadow cutout’s height/opacity, align its edge with the product frame, and use one deliberate offset direction across the stack. | The green layer currently reads as an unrelated image peeking out rather than depth belonging to the same composition. |
| Several sections use `min-height: 100svh` plus large vertical padding. `src/landing/LearningSequence.module.css:1-7`, `src/landing/VisualField.module.css:521-530`, `src/landing/TrustWaitlist.module.css:1-8` | Reserve full-viewport height for the sticky learning sequence. Let supporting sections size to content, especially on shorter screens. | Repeated viewport-height sections make the page feel cinematic but slow and dilute the CTA. |
| The decorative footer remains `90svh` after an already long conversion funnel. `src/landing/LandingPage.module.css:136-145` | Reduce footer height on small screens and give the remaining space one useful closing action or trust cue. | On mobile, another near-full-screen pause after the form adds length without helping the user decide or act. |
| Headings are carefully tracked but body descriptions do not consistently use improved wrapping. `src/landing/Hero.module.css:29-42`, `src/landing/LearningSequence.module.css:26-37`, `src/landing/VisualField.module.css:24-36` | Keep `text-wrap: balance` on headings and add `text-wrap: pretty` to short descriptions, card copy, and captions. | This removes short orphan lines and makes the editorial type system feel more intentional. |
| Cards and product frames rely on hard 1px borders plus large offset shadows. `src/landing/Hero.module.css:131-140`, `src/landing/LearningSequence.module.css:46-53`, `src/landing/VisualField.module.css:114-121` | Preserve the offset-print shadow as a brand device, but soften non-essential borders with a low-opacity shadow ring. Keep borders where they clarify controls or image edges. | The current treatment is cohesive but becomes visually noisy when repeated across every frame. |
| The trust section combines a full-bleed photo, dark overlay, three large white cards, numbering, and long text. `src/landing/TrustWaitlist.tsx:45-69`, `src/landing/TrustWaitlist.module.css:1-98` | Reduce each promise to a compact icon, short title, and one-line explanation. Use three consistent 24px line icons—request, pause, verify—and reduce the cards’ height and contrast against the photo. | Icons can improve scanning, but adding them without simplifying the cards would make the already-heavy section busier. |
| No skip link appears before the sticky header. `src/landing/LandingPage.tsx:98-116` | Add a visually hidden “Skip to content” link that becomes visible on focus and targets `main`. | This is a small, low-risk improvement for keyboard navigation through a sticky header. |

### P3 — performance and credibility polish

| Before | After | Why |
| --- | --- | --- |
| `kairo-blender-preview.webp` is about 1 MB and is reused in the hero, learning sequence, and tools section; the footer and trust rasters are about 820 KB and 568 KB. | Generate viewport-appropriate `srcset` variants, keep the high-resolution hero version only where needed, and target a materially smaller total image transfer. | The visual story depends on imagery, so image sizing is the largest practical performance opportunity. |
| The site presents four supported tools but no evidence of product maturity, availability, or a concrete alpha expectation. `src/landing/VisualField.tsx:24-101`, `src/landing/TrustWaitlist.tsx:70-94` | Add one concise expectation near the CTA: supported platform, current alpha scope, and what happens after signup. | Specificity reduces uncertainty and makes the alpha request credible without adding a large new section. |

## Motion review

Terminology in this section follows the installed animation vocabulary: **scroll reveal**, **line drawing**, **press / tap feedback**, **easing**, **stagger**, **compositing**, **interruptible animation**, and **reduced motion**.

### Findings table

| Before | After | Why |
| --- | --- | --- |
| Header labels animate for 450ms on both hover and keyboard focus. `src/landing/LandingPage.module.css:106-127` | Keep keyboard focus static; gate hover behind `(hover: hover) and (pointer: fine)` and use `transform 150ms cubic-bezier(0.23, 1, 0.32, 1)`. | Navigation is frequent UI. The current interaction exceeds the sub-300ms ceiling and makes focus feel delayed. |
| Every section uses a 700–800ms opacity/translate/clip-path scroll reveal. `src/landing/LandingPage.module.css:50-58` | Remove clip-path, reduce travel from 28px to about 8px, and use opacity/transform for 240–300ms with `cubic-bezier(0.23, 1, 0.32, 1)`. | The generic reveal is over-choreographed. Shorter compositor-friendly motion will feel more responsive. |
| Sticky lesson layers use 300ms opacity and 420ms transform transitions. `src/landing/LearningSequence.module.css:106-112` | Use roughly 180ms opacity and 220ms transform with the strong ease-out curve; reduce travel from 18px to 8px. | A scroll-driven system response should track the reader instead of visibly trailing them. |
| The tools section draws one large connector and four focus marks for 800–1100ms. `src/landing/VisualField.module.css:85-112,238-265` | Keep most strokes static. If line drawing is retained, use it on one focal mark and reveal the others with short opacity/transform transitions. | Five simultaneous paint-bound SVG animations add cost and compete for attention. |
| The scroll-state annotation draws for 520ms. `src/landing/LearningSequence.module.css:147-164` | Keep the path static and reveal the mark using its existing opacity/transform transition, capped near 220ms. | The surrounding state change already communicates the action; repeated line drawing is unnecessary. |
| Hero target scales from 0.82, overshoots to 1.06, and settles. `src/landing/Hero.module.css:474-478` | Enter from `scale(0.95)` with opacity and settle directly at 1. | Bounce is not motivated by a gesture or momentum, so it feels decorative rather than physical. |
| Six hero tracks share a 10-second `ease-in-out` keyframe timeline. `src/landing/Hero.module.css:429-450` | Keep the explanatory loop, but make the master timing linear and give each visible arrival a short strong ease-out transition. | The motion has a valid explanatory purpose, but the shared easing softens the Ask → Do → Check cadence. |
| Pressable elements lift on hover but have no pointer-down response. `src/landing/Hero.module.css:606-615`, `src/landing/LandingPage.tsx:114`, `src/landing/TrustWaitlist.tsx:91` | Add `:active { transform: scale(0.97); }` with a 100–160ms transform transition. Use a non-motion color/state response when reduced motion is enabled. | Immediate press feedback confirms causality and makes controls feel responsive. |
| Reduced motion globally disables every animation, transition, transform, and clip-path. `src/landing/LandingPage.module.css:238-259` | Remove positional movement and loops, but retain short opacity/color feedback. Preserve static authored transforms that are part of composition. | Reduced motion means gentler feedback, not no feedback; the blanket rule also risks altering layout and visual hierarchy. |

### Motion verdict

**Feel-breaking regressions:** the 450ms animated keyboard-focus treatment and 420ms scroll-state movement are too slow for frequent UI.

**Missed simplifications:** remove the universal clip reveal, reduce repeated SVG line drawing, and remove the unmotivated hero bounce.

**Performance:** the implementation correctly avoids animating layout properties and throttles scroll updates with `requestAnimationFrame` (`src/landing/LearningSequence.tsx:47-71`). The main remaining risk is simultaneous paint-bound SVG stroke animation.

**Interruptibility and timing:** interactive scroll states correctly use CSS transitions. Hero keyframes are acceptable because they are explanatory, pausable, visibility-aware, and not directly manipulated.

**Accessibility:** there is a strong static transcript and the sticky experience is disabled for reduced motion, but the global disable-all rule needs a gentler replacement.

**Motion decision: Block** until animated keyboard focus is removed and the frequent transitions are brought within the UI timing budget.

## Focused redesign directions

### Tools: use a controlled showcase, not a continuous carousel

| Element | Recommendation |
| --- | --- |
| Navigation | Four labelled tabs or previous/next controls: Blender, Figma, VS Code, Photoshop. Do not autoplay. |
| Main visual | Show one large product canvas at a time so annotations remain readable. Preserve the paper-print visual language around this single frame. |
| Explanation | Pair the visual with four stable labels: Ask, Identify, Next move, Verify. Highlight the active label as the corresponding annotation appears. |
| Transition | Use a short crossfade or direction-aware transition. Keep the control interruptible and honor reduced motion with an instant state change or opacity-only transition. |
| Proof | Replace “any desktop app” with the actual supported/tested scope and state whether the examples are live, prototype, or planned. |

This keeps the designer’s useful carousel instinct—one item receiving attention at a time—without the comprehension, accessibility, and motion costs of a continuous loop.

### Trust: simplify before adding decoration

Use one icon per promise, but make the icon semantic rather than ornamental:

| Promise | Icon direction | Shortened support copy |
| --- | --- | --- |
| Starts only when you ask | Pointer or request mark | “Kairo waits for you to start.” |
| Pause anytime | Pause control | “Stop or resume whenever you want.” |
| Checks before moving on | Check inside a frame | “The next step appears after the result.” |

Keep the AI caution visible, but visually separate it from the three benefit cards so it reads as responsible disclosure rather than a fourth feature.

### Hero: make the stack read as one object

Preserve the headline and live lesson window. Treat the photography as supporting depth: one background plane, one product plane, and at most one restrained foreground edge. The meadow image should share the product window’s alignment or be removed; an unrelated partial layer is worse than a simpler stack.

The designer may also be suggesting a video or alternate hero treatment. Treat this as an A/B concept, not an automatic replacement: compare the cleaned-up static/live-demo stack against a short, muted, pausable product video. Keep the version that explains Kairo faster and performs acceptably; do not add video solely for visual novelty.

## Recommended implementation order

1. Make the waitlist real, including pending, success, and server-error states.
2. Restore visible input focus and add a skip link.
3. Tighten the header, section reveal, and sticky lesson timing; add press feedback.
4. Redesign Tools as a user-controlled, single-focus showcase with explicit annotation meaning.
5. Simplify Trust and add three restrained semantic icons.
6. Clean up the hero stack so the product window is dominant and the green layer supports it; optionally prototype the designer’s video/alternate-treatment idea for comparison.
7. Preserve a compact mobile navigation path.
8. Shorten the page by removing or repurposing the repeated practice explanation.
9. Add a primary alpha CTA to the hero and credibility links to the footer.
10. Add the tablet layout pass and reduce repeated `100svh` sections.
11. Produce responsive image variants and remeasure transfer size/LCP.

## Verification checklist

- Keyboard-only: skip link, header links, hero CTA, pause control, email input, submit, and validation all have visible focus.
- Screen reader: section names, pause/play state, waitlist errors, pending state, and confirmed submission are announced once and in the right order.
- Mobile: navigation remains available; no horizontal overflow at 320px, 375px, and 430px.
- Tablet/small laptop: inspect 768×1024, 1024×768, 1024×900, and 1180×820 for excessive hero/section height.
- Motion: inspect at normal speed and 4× slow motion; verify keyboard focus is static and scroll-state motion does not lag the reading line.
- Reduced motion: preserve static composition and short opacity/color feedback; remove loops and positional travel.
- Performance: measure LCP and total image transfer on a throttled mobile profile after responsive images are added.
- Conversion: verify a real email reaches the waitlist backend exactly once and failures do not produce a success state.

## Audit notes

This review applied all five installed skills:

- `apple-design`: responsiveness, physical feedback, restraint, typography, agency, and reduced motion.
- `animation-vocabulary`: precise names for the existing motion patterns.
- `make-interfaces-feel-better`: wrapping, focus, hit areas, surfaces, press states, and transition specificity.
- `review-animations`: timing, easing, performance, hover gating, accessibility, and the explicit Block/Approve threshold.
- `emil-design-eng`: purpose/frequency decisions and Before/After review format.

Automated verification at audit time: **48 tests passed** and the production TypeScript/Vite build succeeded. Live visual inspection was completed at **1440×1000, 768×1024, and 390×844**, including anchored checks of How it works, Tools, Trust, and Access. The tested layouts showed a clear hero hierarchy, readable mobile type, and no obvious horizontal overflow. Complete the remaining real-device, keyboard, screen-reader, performance, and slow-motion checks above before final sign-off.
