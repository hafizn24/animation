# Buluh FC — YouTube Shorts Story & Pacing Guide

> Production rules govern every episode: [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md).
> The old "no captions / spoken CTA" approach is retired. Episode 1's dual subtitle design and clean gold-divider title card are the standard.
> The Episode 6–22 plan lives in [`episode-6-to-22-roadmap.md`](./episode-6-to-22-roadmap.md); the detailed current canon is in [`storyline.md`](./storyline.md).

## Target Metrics & Format

- **Target runtime:** 40–45 seconds unless the approved episode plan justifies a different runtime; always under 60 seconds.
- **Aspect ratio:** 9:16 vertical, 30fps. Episode 5 master: 1080x1920.
- **Language:** casual spoken Malaysian Malay (Bahasa Melayu santai).
- **Structure:** multi-voice narrator and named-character dialogue, with at least two named characters and an exchange.
- **Current canon entering Episode 6:** debt **RM326,500** after the RM5,000 Kek Maju contribution is deducted once from RM331,500. Karim (#8) has departed; Azam (#7, Defender, @akudingin-d1f, RM5) has joined; wage costs are down 35%; captaincy is vacant.
- **New season:** 12-club Division 5 single round-robin, 11 matchdays per club, 66 total matches, 3/1/0 points, champion promoted to Division 4.
- **Legal stakes:** stadium seizure frozen until the end of the season under a conditional written extension; Episode 6 establishes the written conditions.

## The 4-Beat Episode Structure

1. **Hook (0:00–0:04):** start on the stakes, with a sharp SFX transient. No slow exposition.
2. **Escalation (0:04–0:18):** reach the confrontation before 0:15. Distinct locations, hard cuts, no dead air.
3. **Emotional Turn (0:18–0:30):** warmth, humour or character conflict against the cold setup.
4. **Dramatic Close (0:30–0:42):** sharp final line, then hard cut to the clean black `Buluh FC / EPISOD X` title card. No CTA.

## Subtitle Design

- Narration: italic warm gold serif.
- Dialogue: white sans-serif with uppercase gold speaker label.
- Both timed to the audio; no permanent overlay, no engagement bait.

## Audio-Driven Pacing

- Durations come from `episodes/episode-X/audio-script.json`.
- Max 0.5–0.8s gap between lines; zero 5–9 second silent gaps.
- TTS voices are assigned per character in `remotion/scripts/generate_tts.py`.

## Visual Storytelling

Because characters are faceless, exaggerate body language: head shakes, nods, slumped shoulders, hand gestures and breathing. Environments must be visually distinct (cold sponsor office vs warm bakery vs club office).

## 0–2s Pattern-Interrupt Hook

Frame 0 opens at full brightness on action — never fade from black or hold a wide shot. A bold 3–5 word `HookTitle` appears inside `SafeArea` for 1.5s; first camera cut by frame 45. First TTS clip has leading silence trimmed and a sharp SFX transient fires on frame 0. See [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md).

## Established Backstory

- **Episode 3:** Buluh FC defeated Hulubalang United 3–0 in a friendly. Kek Maju appeared on the sideline ad-board and the bakery owner supported the team.
- **Episode 4:** A Division 4 club offered RM50,000 for Karim; Boss and Coach debated loyalty versus survival; wage costs were reduced by 35%.
- **Episode 5:** Karim accepted the transfer, the RM50,000 went to debt, and the post-transfer balance became RM331,500. Karim left his armband behind. Azam (#7, Defender, salary RM5) joined.
- **Kek Maju:** The contribution is confirmed as RM5,000 and is deducted once from the post-Episode-5 debt, giving the Episode 6 opening balance of RM326,500.

## Season Roadmap

See [Episode 6–22 Season Roadmap](./episode-6-to-22-roadmap.md) for the 12-club league format, matchday-by-matchday arc, episode beats, legal extension and debt bookkeeping rules.
