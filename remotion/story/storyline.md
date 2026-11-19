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
- **Status:** Scripted for Remotion (`remotion/src/Episode2/`); 1,500 frames / 50s @ 30fps; vertical Shorts cut with **timed Malay TTS and zero on-screen captions**. One voiceover clip per beat, mounted at frames 0 / 150 / 630 / 1050.
- **Countdown:** 27 days left
- **4-beat Shorts structure:**
  1. **0–5s — Episode 1 recap.** Quick flash of the lender boardroom: the RM450,000 DEFAULT NOTICE slams onto the table. VO recaps that Buluh FC has less than 30 days before the stadium is seized.
  2. **5–22s — Sponsor rejection montage.** Fast, hard-cut takes of big corporate sponsors turning the Owner away because Buluh FC is a "Divisyen 5" club. No slow walks or dead air.
  3. **22–36s — Small bakery sponsor.** Warm/hopeful tone. A tiny local bakery ("Kek Maju") steps up with modest support — not enough for RM450,000, but enough to keep fighting.
  4. **36–50s — Crowdfunding friendly-match cliffhanger.** Owner and Coach decide to organise a crowdfunding friendly match to save the club. Ends on a **spoken** CTA — *"Mampukah perlawanan amal ni selamatkan Buluh FC? Komen 'EPISOD 3' kalau nak tengok!"* — with no static title card.
- **Cliffhanger:** Can the charity match save Buluh FC? Sets up the crowdfunding friendly-match arc for Episode 3.

**Script location:** the beat frame ranges and audio cue frames live in the `SCENES` array in `remotion/src/Episode2/Episode2Composition.jsx`. TTS text and beat-aligned frame budgets are in `remotion/scripts/generate_tts.py` (prefix `e2_`). Regenerate with `python scripts/generate_tts.py e2_`. Captions stay off; the story is carried by voiceover plus 3D props (DEFAULT NOTICE, KEK MAJU sign, PERLAWANAN AMAL poster).
