# Buluh FC — YouTube Shorts Story & Pacing Guide

> **Production rules govern every storytelling decision:**
> [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md).
> The old "no captions / spoken CTA" approach is **retired** — Episode 1's dual
> subtitle design and clean gold-divider title card are now the standard.

## Target Metrics & Format
- **Target Runtime:** ~42–55 seconds (strictly under 60s).
- **Aspect Ratio:** 9:16 vertical, 720x1280 @ 30fps.
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*).
- **Structure:** alternating NARRATOR + CHARACTER DIALOGUE lines.

## The 4-Beat Episode Structure
1. **Hook (0:00–0:04)** — start on the stakes. Hard SFX on frame 1. Gold italic
   narrator subtitle. No slow atmospheric intro.
2. **Escalation (0:04–0:18)** — reach the confrontation before 0:15. Distinct
   locations, hard cuts, no dead air. Character dialogue with gold speaker
   labels.
3. **Emotional Turn (0:18–0:30)** — warmth/hope beats against the cold setup.
4. **Dramatic Close (0:30–0:42)** — sharp final line, then a **hard cut** to the
   clean black `BULOH FC / EPISOD X` title card. **No CTA, ever.**

## Subtitle Design (Episode 1 standard)
- Narration → italic warm gold serif at bottom of frame.
- Dialogue → white sans-serif with uppercase gold speaker label above.
- Both timed to the audio; no permanent overlay, no engagement bait.

## Audio-Driven Pacing
- Durations come from `episodes/episode-X/audio-script.json`.
- Max 0.5–0.8s gap between lines. Zero 5–9 second silent gaps.
- TTS voices are assigned per character in `scripts/generate_tts.py`.

## Visual Storytelling
Because characters are faceless, exaggerate body language: head shakes,
nods, slumped shoulders, hand gestures, breathing. Environments must be
visually distinct (e.g. cold sponsor office vs warm bakery vs club office).
