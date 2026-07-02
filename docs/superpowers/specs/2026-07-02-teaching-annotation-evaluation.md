# Teaching Annotation Evaluation Matrix

Date: 2026-07-02
Status: active QA checklist

Purpose: a fast, repeatable check that Kairo points at the right thing, looks
polished, and behaves well — run it after any change to grounding, the prompts,
or the overlay, and especially when A/B-ing the grounding model (Opus ↔ Qwen).

## Grounding provider + env

Grounding is swappable at runtime (no rebuild) via env; Kairo reads `.env` from
the project root.

| Env var | Default | Meaning |
| --- | --- | --- |
| `KAIRO_GROUNDING_PROVIDER` | `anthropic` | `anthropic` (Opus) or `qwen` (qwen3.7-plus). |
| `ANTHROPIC_API_KEY` | — | Required for the `anthropic` provider. |
| `ANTHROPIC_VISION_MODEL` | `claude-opus-4-8` | Anthropic grounding model. |
| `DASHSCOPE_API_KEY` | — | Required for the `qwen` provider (Alibaba Model Studio). |
| `QWEN_VISION_MODEL` | `qwen3.7-plus` | Qwen grounding model. |
| `QWEN_BASE_URL` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` | Qwen OpenAI-compatible endpoint. |
| `KAIRO_VISION_MAX_EDGE` | `1568` | Longest screenshot edge (px) sent to the model. Lower = cheaper, slightly less precise. |
| `KAIRO_SHOW_IN_CAPTURE` | `false` | `true` only when recording/debugging Kairo's own overlays. |

Rough cost per ask (2026-07): Opus 4.8 ≈ 2–3¢; qwen3.7-plus ≈ 0.2¢ (~12× cheaper).
We use single-shot image→boxes (no zoom/tool loop).

## Pass criteria

Each prompt passes only if:

- the target is the actual requested UI element (not a heading, paragraph, or a
  giant page region)
- the label is one to three words, placed clearly outside the control (never on top)
- the box has visible breathing room without swallowing nearby unrelated controls
- the companion cursor appears once (no duplicate pointer)
- no Kairo UI is targeted unless the prompt asks about Kairo
- answer text describes what to do, not the internal annotation JSON
- box + cursor + text all appear together when speech starts (not before)

## Test cases

| App/screen | Prompt | Expected visual |
| --- | --- | --- |
| Google Meet landing | `Where is the New meeting button?` | One padded box around New meeting + one companion cursor near its center. |
| Browser on YouTube | `Where can I click to change the URL?` | Box around the browser address bar, not the YouTube search field or the video. |
| GitHub home | `Where can I search my repositories?` | Box around the repository search field with comfortable padding. |
| tldraw toolbar | `Where is the rectangle tool?` | Box around the square outline tool, not the whole toolbar strip. |
| Google search results | `Show me the Images tab.` | Box + label around the Images tab. |
| Any dense UI | `What is this marked area?` after drawing an arrow | Answer describes the UI at the arrow head, not "annotation 1". |
| Any page | `What is on this screen?` | No visual target unless the answer names a concrete element. |

## Behaviour checks (not targeting)

- **Reveal timing:** during LLM→TTS gap the notch body shows "Preparing the next
  step"; box/cursor appear only when speech starts.
- **Auto-close:** notch + box clear ~3s after speech ends if untouched; hovering or
  typing a follow-up keeps it open.
- **Context reset:** switching app/tab, scrolling, or clicking clears the box + cursor
  (notch stays); plain mouse movement does NOT clear it.

## Scoring

- 2 = exact target, polished visual
- 1 = correct area but poor padding or label placement
- 0 = wrong target, no target, duplicate pointer, or Kairo targets itself

Ship only when the seven targeting cases average at least 1.7 and no case scores 0.

## Opus ↔ Qwen A/B

Run the seven targeting cases once with `KAIRO_GROUNDING_PROVIDER=anthropic` and
once with `=qwen`, same screenshots. Record both scores. If Qwen stays within ~1
average point and never scores 0 on a case, switch the default to Qwen for the
~12× cost cut. Note any case where Qwen regresses (usually tiny icon-only targets).
