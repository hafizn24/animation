# Buluh FC — Series Storyline

> **All episodes follow [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md):**
> script-first, multi-voice casual Malay, dual subtitles, no CTAs, audio-driven
> pacing.

## Logline
A struggling **Divisyen 5** (fifth-division) Malaysian football club faces a **RM450,000 debt** and a **30-day deadline** before their stadium is seized. With an unpaid squad, a skeptical coach, and a ruthless lawyer closing in, the club owner must pull off a miracle on and off the pitch.

---

## Core Stakes & Rules
- **The Debt:** RM450,000 owed (stadium & club operations).
- **The Division:** Buluh FC competes in **Divisyen 5** (fifth tier). Low expectations are a recurring theme — sponsors and rivals use "Divisyen 5" as an insult; the owner wears it as a badge of pride.
- **The Countdown:** 30 days remaining (track current day in every episode).
- **Win Condition:** Clear the debt or secure a major sponsor/cup prize before Day 30.
- **Lose Condition:** Stadium seized, club dissolved.

---

## Main Characters
| Character | Role | Goal / Motivation | Key Trait |
|---|---|---|---|
| **Owner** | Club Owner | Save Buluh FC without losing his dignity | Optimistic, desperate, talks big |
| **Coach** | Head Coach | Protect the players & get paid | Pragmatic, blunt (*"kata-kata tak bayar bil elektrik"*) |
| **Chairman** | Club / League Authority | Enforce the rules & protect finances | Cold, by-the-book |
| **Peguam** | Lawyer / Debt Collector | Collect RM450,000 or seize the stadium | Sharp, intimidating, clock-watching |
| **Penaaja** | Sponsor Executive (Nexus Sports) | Buy naming rights only on a winning, high-draw club | Slick, impatient, check-watching |

---

## Episode Tracker

### Episode 1 — *Hari 30: RM450,000 Tertunggak* (Published)
- **Status:** Released
- **Countdown:** 30 days left
- **Key Events:**
  - Owner receives the RM450,000 notice.
  - Coach confronts Owner in the locker room after a 0–3 loss.
  - Peguam delivers the final 30-day ultimatum.
- **Cliffhanger:** How will Buluh FC survive the first week with zero budget?

### Episode 2 — *Hari 27: Divisyen 5* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode2/`); **1,260 frames / 42s @ 30fps**; 9:16 vertical Shorts cut with timed multi-voice Malay TTS and Episode 1's dual subtitles (gold italic narration / gold-labelled white dialogue).
- **Countdown:** 27 days left
- **4-beat Shorts structure:**
  1. **0–4s — Default notice.** Push-in on the DEFAULT NOTICE folder; narrator sets the RM450,000 debt and the ticking clock.
  2. **4–18s — Rejected sponsors (3 beats).** Nexus Sports (cool blue, dismissive exec), Apex Corp (red/charcoal logo, proposal pushed back), then the door slams on PEMILIK. No repetitive camera loop.
  3. **18–30s — Kek Maju bakery.** Warm contrast in a distinct bakery: the owner hands over a small envelope. KEK MAJU and PEMILIK exchange dialogue.
  4. **30–42s — Club office & final line.** JURULATIH proposes the charity match; PEMILIK delivers the "peluang terakhir" line. Hard cut to the clean black `BULOH FC / EPISOD 2` title card. No CTA.
- **Cliffhanger:** The charity match is the last chance — cuts directly to the title card.

**Script location:** `episodes/episode-2/script.md` and `episodes/episode-2/audio-script.json` are the source of truth. The `SCENES` array in `remotion/src/Episode2/Episode2Composition.jsx` mirrors the JSON. TTS text/voices are in `remotion/scripts/generate_tts.py` (prefix `e2_`). Regenerate with `python scripts/generate_tts.py e2_`.

### Episode 3 — *Perlawanan Persahabatan: Buluh FC vs Hulubalang United (3–0)* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode3/`); **1,260 frames / 42s @ 30fps**; 9:16 vertical Shorts with multi-voice Malay + English dual subtitles, pattern-interrupt hook and audio-driven pacing.
- **Continuity from Ep. 2:** Following Kek Maju bakery owner's support, Buluh FC takes the pitch with renewed spirit. The bakery name `KEK MAJU` appears on a sideline ad-board, and the owner is on the touchline cheering with the locals.
- **Plot:** Buluh FC dominate the heavy favourites **Hulubalang United** 3–0 through three escalating goals (tap-in, slick team move, long-range banger). Skeptical locals — including the bakery owner — turn into genuine believers.
- **Analytics fix:** Frame 0 opens at full brightness mid-strike with a sharp kick transient and a 1.5s `HookTitle`; first camera cut lands by frame 45. All shot/goal/HUD cues are read from `episodes/episode-3/audio-script.json`.
- **Cliffhanger:** The friendly is over — the captain declares the warm-up finished. Season kickoff begins; stakes shift from friendly proof-of-concept to official league survival. No CTA.

**Script location:** `episodes/episode-3/script.md` and `episodes/episode-3/audio-script.json` are the source of truth. `remotion/src/Episode3/Episode3Composition.jsx` imports the JSON directly for all scene, goal, slow-motion, shake, HUD and SFX timings. TTS text/voices live in `remotion/scripts/generate_tts.py` (prefix `e3_`). Regenerate with `python scripts/generate_tts.py e3_`.
