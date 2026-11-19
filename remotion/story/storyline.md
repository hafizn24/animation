# Buluh FC — Series Storyline

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
- **Status:** Scripted for Remotion (`remotion/src/Episode2/`); TTS clips pending generation.
- **Countdown:** 27 days left
- **Key Events:**
  - Owner pitches Buluh FC to Nexus Sports at their glass-walled HQ; the sponsor dismisses them as a "Divisyen 5" club with no audience.
  - A second pitch fails too. Back at the manager's office, the owner proposes an emergency friendly match to sell tickets; the coach points out they cannot even afford a ball.
  - The friendly is staged. The team finally scores and the stands make noise, but the gate raises only RM15,000 against RM450,000 owed.
  - The coach reminds him spirit does not pay wages. The owner stops talking about money.
- **Cliffhanger:** Owner calls a dawn training camp — "Esok, jam lima pagi. Kita ke hutan." — setting up a training-montage arc for Episode 3.

**Script location:** dialogue, narration, subtitle timings and audio cue frames live in the `SCENES` array in `remotion/src/Episode2/Episode2Composition.jsx`. TTS entries are in `remotion/scripts/generate_tts.py` (prefix `e2_`, speaker `penaja` maps to voice_4).
