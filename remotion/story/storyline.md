# Buluh FC — Series Storyline

> **All episodes follow [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md):** script-first, multi-voice casual Malay, dual subtitles, no CTAs, audio-driven pacing.
>
> **Season roadmap:** [Episode 6–22 Roadmap](./episode-6-to-22-roadmap.md) is the planning source for the next season arc. Per-episode scripts and audio JSON remain the production source of truth.

## Logline

A struggling Malaysian Divisyen 5 football club is fighting to stay alive under a crushing debt. After selling its captain to survive, Buluh FC enters a new 12-team league season with a conditional reprieve from stadium seizure. Promotion is the sporting dream; keeping the club alive is the real battle.

---

## Core Stakes & Rules

- **The Debt:** The historical post-Episode-5 balance was RM331,500 after Karim's RM50,000 transfer. The user-confirmed **RM5,000 Kek Maju contribution** is deducted once from that balance. **Current debt entering Episode 6: RM326,500.**
- **The Division:** Buluh FC competes in **Divisyen 5**. The new season uses a **12-club single round-robin**: 11 matchdays per club, 66 league matches total. The champion (1st place) earns promotion to Divisyen 4.
- **The Legal Extension:** The lawyer grants a conditional extension. Stadium seizure is frozen until the end of the Division 5 season under a written agreement. This replaces the old immediate 30-day countdown as the active season pressure. The exact written conditions must be established in Episode 6 and remain consistent.
- **Sporting Goal:** Win Division 5 and earn promotion to Division 4. Karim's longer-term wish remains to take Buluh FC to Division 1.
- **Financial Rule:** Promotion or a match win does not automatically reduce debt. Only confirmed payments, prize money, sponsorship receipts or expenses change the ledger.

### Canon Snapshot — entering Episode 6

| Item | Status |
|---|---|
| **Club debt** | **RM326,500** |
| **Kek Maju contribution** | **RM5,000**, deducted once from the RM331,500 post-Episode-5 balance |
| **Karim transfer** | RM50,000 from a Kelab Divisyen 4 club; fully applied to debt before the RM331,500 post-Episode-5 balance |
| **Wage costs** | Reduced by 35% after Karim's departure |
| **Karim (#8)** | Departed after Episode 5; former captain / centre midfielder; armband left on Boss's desk |
| **Azam (#7)** | Defender; fan character @akudingin-d1f; salary RM5; joined in Episode 5 |
| **Captaincy** | Vacant; no successor named on screen |
| **League** | 12 clubs, single round-robin, 11 matchdays per club, 66 matches total |
| **Promotion** | Division 5 champion (1st place) promoted to Division 4 |
| **Stadium** | Seizure frozen until the end of the season under a conditional written extension |

---

## Main Characters

| Character | Role | Goal / Motivation | Key Trait |
|---|---|---|---|
| **Owner** | Club Owner | Save Buluh FC without losing his dignity | Optimistic, desperate, talks big |
| **Coach** | Head Coach | Protect the players & get paid | Pragmatic, blunt (*"kata-kata tak bayar bil elektrik"*) |
| **Chairman** | Club / League Authority | Enforce the rules & protect finances | Cold, by-the-book |
| **Peguam** | Lawyer / Debt Collector | Collect the outstanding debt or enforce the written agreement | Sharp, intimidating, clock-watching |
| **Penaaja** | Sponsor Executive (Nexus Sports) | Buy naming rights only on a winning, high-draw club | Slick, impatient, check-watching |
| **Karim** (`characters/character-karim.js`) | **Former** captain, Center Midfielder (#8) — departed in Ep. 5 | Keep Buluh FC's attacking engine — and the squad — intact | Loyal, quiet, carries the team; friendly-match MVP and the squad's highest earner |
| **Azam** (`characters/character-azam.js`) | Defender (#7) — signed in Ep. 5 | Prove the new #7 belongs | Fan-inspired (@akudingin-d1f), beaming, confident, works for **RM5** |

### Karim — Canonical Profile (Episodes 4–5; departed after Ep. 5)

- **Age:** 28. **Position:** Center Midfielder. **Shirt number:** #8. **Role:** Club Captain until the end of Episode 4.
- **Status:** Friendly-match MVP (vs Hulubalang United, Ep. 3) and Buluh FC's primary attacking orchestrator.
- **Contract:** Highest earner in the squad. Sold for RM50,000 to a Kelab Divisyen 4 club in Ep. 5; the fee went entirely to debt. His departure takes the captain's armband with it.
- **Look:** Buluh FC Match Jersey with `KARIM` and `8` printed on the back and front, captain's armband on the left sleeve, boots in hand at the doorway reveal. Faceless like the rest of the cast; body language carries the emotion.
- **Voice:** grounded, lower-pitched male (`karim` → `voice_4`, pitch 0.90, speed 0.95).

### Azam — Canonical Profile (from Episode 5)

- **Position:** Defender. **Shirt number:** #7. **Salary:** **RM5**.
- **Origin:** Fan-inspired character based on viewer **@akudingin-d1f**; the number 7 is his own idea (*"Baru lawan gerun"*).
- **Entrance:** *"Assalamualaikum. Saya Azam. Defender baru."* The in-world fan card is an easter egg, never a CTA.
- **Look:** Faceless, swept quiff silhouette, chest-out stance; `AZAM` and `7` printed on the Match Jersey. Rig: `characters/character-azam.js`.
- **Voice:** bright, energetic young male (`azam` → `voice_5`, speed 1.06, pitch 1.06).

---

## Episode Tracker

Episodes 1–5 are the established backstory and remain described in their original episode entries. Episodes 6–22 are planned in [`episode-6-to-22-roadmap.md`](./episode-6-to-22-roadmap.md).

### Episode 1 — *Hari 30: RM450,000 Tertunggak* (Published)
- **Status:** Released
- **Countdown:** 30 days left at the start of the original crisis.
- **Key Events:** Owner receives the RM450,000 notice; Coach confronts Owner after a 0–3 loss; Peguam delivers the original 30-day ultimatum.
- **Cliffhanger:** How will Buluh FC survive with zero budget?

### Episode 2 — *Hari 27: Divisyen 5* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode2/`); 1,260 frames / 42s @ 30fps.
- **Key Events:** Sponsors reject Buluh FC; Kek Maju bakery owner hands over an envelope; Coach proposes a charity match.
- **Continuity:** The user's confirmed Kek Maju contribution is RM5,000 in total and is reflected in the Episode 6 opening debt. Do not deduct it a second time.

### Episode 3 — *Perlawanan Persahabatan: Buluh FC vs Hulubalang United (3–0)* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode3/`); 1,260 frames / 42s @ 30fps.
- **Key Events:** Buluh FC defeat Hulubalang United 3–0 in a friendly. Kek Maju appears on the sideline ad-board and the bakery owner supports the team.

### Episode 4 — *RM50,000 Untuk Karim* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode4/`); 1,530 frames / 51s @ 30fps.
- **Key Events:** A Division 4 club offers RM50,000 for Karim. Boss and Coach debate survival versus loyalty. Wage costs are reduced by 35%.

### Episode 5 — *Pengorbanan & Nombor 7 Baru* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode5/`); 1,359 frames / 45.3s @ 30fps.
- **Key Events:** Karim accepts the transfer; RM50,000 is applied to debt, reducing it from RM381,500 to RM331,500. Karim leaves his armband behind and asks Boss to take Buluh FC to Division 1. Azam (#7), a defender, joins on RM5 salary.
- **Roster after Episode 5:** Karim departed; Azam joined; captaincy vacant.

### Episodes 6–22 — Next Season
See the [Episode 6–22 Season Roadmap](./episode-6-to-22-roadmap.md) for the episode-by-episode plan, league format, financial continuity rules and development order.
