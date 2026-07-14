# Kairo Three-Beat Demo Design

## Goal

Make Kairo understandable to a first-time visitor without prior product context. The hero and “How it works” must demonstrate one truthful outcome in the fewest meaningful beats.

The demonstrated outcome is:

> Add your first keyframe.

## Product Story

Use one consistent three-beat lesson everywhere:

1. **Ask** — The learner asks, “How do I add a keyframe here?” or circles the cube.
2. **Do** — Kairo identifies the cube and says, “Press I, then choose Location.” The learner performs that action.
3. **Check** — Kairo detects the result and confirms, “Keyframe added.” It then previews the next move: “Move to frame 40.”

“Point” is not a separate step; it is an alternative input inside Ask. “Try” is renamed Do so the learner action is explicit. “Check” remains distinct because verification is part of Kairo’s value.

## Hero

- Preserve the current hero layout, headline, botanical composition, Blender capture, and CTA.
- Add a persistent goal label inside the product window: `Goal · Add your first keyframe`.
- Change the learner question to `How do I add a keyframe here?`.
- Animate three mutually legible states rather than accumulating overlays:
  - Ask: learner question and circle appear.
  - Do: cube target and Kairo’s instruction appear, followed by a compact `You did · I → Location` signal.
  - Check: a green confirmation appears with `Keyframe added` and `Next · Move to frame 40`.
- Hold the Check state long enough to be read before the loop restarts.
- Replace the large Pause/Play text control with one compact icon-only button. Its visible symbol is `Ⅱ` while playing and `▶` while paused; its accessible label remains `Pause lesson` or `Play lesson`.
- On mobile and reduced-motion layouts, show a static three-row Ask/Do/Check transcript for the same goal.

## How It Works

- Replace the current four chapters with three: Ask, Do, Check.
- Use the same goal and exact lesson copy as the hero.
- Heading:
  - Kicker: `One question. One result.`
  - Title: `See a lesson from start to finish.`
  - Supporting line: `Add a keyframe in three clear steps.`
- Chapters:
  - **Ask — Show where you’re stuck.** `Ask aloud or circle the cube: “How do I add a keyframe here?”`
  - **Do — Follow one move.** `Kairo finds the cube and says: Press I, then choose Location. You make the move yourself.`
  - **Check — Know it worked.** `Kairo sees the keyframe was added, then gives the next step.`
- Keep the existing sticky visual workspace on capable desktop layouts, but reduce its state machine to the same three states.
- Keep non-sticky and reduced-motion fallbacks complete and readable without scroll-driven state.

## Boundaries

- Do not redesign the hero or introduce another app example.
- Do not claim that one keyframe completes an animation.
- Do not add a fourth explanatory stage.
- Do not remove the user’s ability to pause the autoplaying lesson.
- Do not change later Tools, Trust, or waitlist sections.

## Verification

- A new visitor must be able to identify the goal, learner action, Kairo instruction, and verified outcome from the hero alone.
- Hero and “How it works” must use the same three labels and same lesson outcome.
- No inactive overlay may remain visible during another beat.
- The compact control must remain keyboard-accessible and have a changing accessible label.
- Verify at 375px, 768px, and 1280px widths, including reduced motion.
- Run the complete test, typecheck, and production build suite.
