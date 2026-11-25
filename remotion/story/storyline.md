# Buluh FC — Series Storyline

> **All episodes follow [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md):**
> script-first, multi-voice casual Malay, dual subtitles, no CTAs, audio-driven
> pacing.

## Logline
A struggling **Divisyen 5** (fifth-division) Malaysian football club faces a crushing debt and a 30-day deadline before their stadium is seized. With an unpaid squad, a skeptical coach, and a ruthless lawyer closing in, the club owner must pull off a miracle on and off the pitch. By Episode 5 the club has sold its captain to survive — and replaced him with the last player anyone expected.

---

## Core Stakes & Rules
- **The Debt:** **RM331,500 outstanding after Episode 5.** It began at RM450,000 (Ep. 1), stood at RM381,500 immediately before the transfer, and dropped by RM50,000 when Karim was sold — **KOS GAJI: -35%** at the same time. Older episode entries below quote the figure at the time they were written; this section is the current canon.
- **The Division:** Buluh FC competes in **Divisyen 5** (fifth tier). Low expectations are a recurring theme — sponsors and rivals use "Divisyen 5" as an insult; the owner wears it as a badge of pride. Karim's parting request is to take the club to **Divisyen 1**.
- **The Countdown:** 30 days at Episode 1 (Day 27 by Episode 2). Do not invent a new day number for Episode 5 — it is the day after the transfer is accepted.
- **Win Condition:** Clear the debt or secure a major sponsor/cup prize before Day 30.
- **Lose Condition:** Stadium seized, club dissolved.

### Canon Snapshot — after Episode 5
| Item | Status |
|---|---|
| **Club debt** | **RM331,500** (was RM450,000 → RM381,500; `KOS GAJI: -35%`) |
| **Transfer income** | **RM50,000** from a Kelab Divisyen 4 club for Karim — all of it went to debt |
| **Karim (#8)** | **Departed.** Former captain / centre midfielder; sold in Ep. 5, armband left on the Boss's desk |
| **Azam (#7)** | **New signing.** Defender, fan character `@akudingin-d1f`, salary **RM5**, enters on **"Assalamualaikum. Saya Azam. Defender baru."** |
| **Captaincy** | Vacant since Karim's departure — no new captain has been named on screen |

---

## Main Characters
| Character | Role | Goal / Motivation | Key Trait |
|---|---|---|---|
| **Owner** | Club Owner | Save Buluh FC without losing his dignity | Optimistic, desperate, talks big |
| **Coach** | Head Coach | Protect the players & get paid | Pragmatic, blunt (*"kata-kata tak bayar bil elektrik"*) |
| **Chairman** | Club / League Authority | Enforce the rules & protect finances | Cold, by-the-book |
| **Peguam** | Lawyer / Debt Collector | Collect the outstanding debt (RM450,000 at Ep. 1; **RM331,500** after Ep. 5) or seize the stadium | Sharp, intimidating, clock-watching |
| **Penaaja** | Sponsor Executive (Nexus Sports) | Buy naming rights only on a winning, high-draw club | Slick, impatient, check-watching |
| **Karim** (`characters/character-karim.js`) | **Former** captain, Center Midfielder (#8) — departed in Ep. 5 | Keep Buluh FC's attacking engine — and the squad — intact | Loyal, quiet, carries the team; friendly-match MVP and the squad's highest earner |
| **Azam** (`characters/character-azam.js`) | Defender (#7) — signed in Ep. 5 | Prove the new #7 belongs; enters on *"Assalamualaikum. Saya Azam. Defender baru."* | Fan-inspired (@akudingin-d1f), beaming, confident, works for **RM5** |

### Karim — Canonical Profile (Episodes 4–5; departed after Ep. 5)
- **Age:** 28. **Position:** Center Midfielder. **Shirt number:** #8. **Role:** Club Captain until the end of Episode 4.
- **Status:** Friendly-match MVP (vs Hulubalang United, Ep. 3) and Buluh FC's **primary attacking orchestrator** — the entire attack ran through him in midfield.
- **Contract:** Was the **highest earner in the squad** — the single biggest wage line the club cut before the season started. **Sold for RM50,000 to a Kelab Divisyen 4 club in Ep. 5**; the fee went entirely to debt. His departure takes the captain's armband with it.
- **Look:** Buluh FC **Match Jersey** with `KARIM` and `8` printed on the back, captain's armband on the left sleeve, boots in hand at the doorway reveal. Faceless like the rest of the cast; body language carries the emotion.
- **Voice:** grounded, lower-pitched male (`karim` → `voice_4`, pitch 0.90, speed 0.95) — distinct from Boss (`voice_3`) and Coach (`voice_2`).

### Azam — Canonical Profile (from Episode 5)
- **Position:** Defender. **Shirt number:** **#7**. **Salary:** **RM5** (the punchline of Ep. 5).
- **Origin:** Fan-inspired character based on viewer **@akudingin-d1f**; the number 7 is his own idea (*"Baru lawan gerun"* — opponents will fear it).
- **Entrance:** Bursts through the locker-room door in the Buluh FC Match Jersey and goes straight into **"Assalamualaikum. Saya Azam. Defender baru."**; a 1.5s in-world `@akudingin-d1f — "Bang saya nak masuk Buluh FC"` comment card flashes on screen (`Azam · #7 · Defender · Gaji RM5`). No engagement prompt — it is a fan detail, never a CTA.
- **Look:** Faceless like the rest of the cast, swept quiff silhouette, chest-out cocky stance; `AZAM` and `7` printed on the Match Jersey back and front. Rig: `characters/character-azam.js` (shares Karim's proportions and `characterParts` contract).
- **Voice:** bright, energetic young male (`azam` → `voice_5`, speed 1.06, pitch 1.06).

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
  4. **30–42s — Club office & final line.** JURULATIH proposes the charity match; PEMILIK delivers the "peluang terakhir" line. Hard cut to the clean black `Buluh FC / EPISOD 2` title card. No CTA.
- **Cliffhanger:** The charity match is the last chance — cuts directly to the title card.

**Script location:** `episodes/episode-2/script.md` and `episodes/episode-2/audio-script.json` are the source of truth. The `SCENES` array in `remotion/src/Episode2/Episode2Composition.jsx` mirrors the JSON. TTS text/voices are in `remotion/scripts/generate_tts.py` (prefix `e2_`). Regenerate with `python scripts/generate_tts.py e2_`.

### Episode 3 — *Perlawanan Persahabatan: Buluh FC vs Hulubalang United (3–0)* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode3/`); **1,260 frames / 42s @ 30fps**; 9:16 vertical Shorts with multi-voice Malay + English dual subtitles, pattern-interrupt hook and audio-driven pacing.
- **Continuity from Ep. 2:** Following Kek Maju bakery owner's support, Buluh FC takes the pitch with renewed spirit. The bakery name `KEK MAJU` appears on a sideline ad-board, and the owner is on the touchline cheering with the locals.
- **Plot:** Buluh FC dominate the heavy favourites **Hulubalang United** 3–0 through three escalating goals (tap-in, slick team move, long-range banger). Skeptical locals — including the bakery owner — turn into genuine believers.
- **Analytics fix:** Frame 0 opens at full brightness mid-strike with a sharp kick transient and a 1.5s `HookTitle`; first camera cut lands by frame 45. All shot/goal/HUD cues are read from `episodes/episode-3/audio-script.json`.
- **Cliffhanger:** The friendly is over — the captain declares the warm-up finished. Season kickoff begins; stakes shift from friendly proof-of-concept to official league survival. No CTA.

**Script location:** `episodes/episode-3/script.md` and `episodes/episode-3/audio-script.json` are the source of truth. `remotion/src/Episode3/Episode3Composition.jsx` imports the JSON directly for all scene, goal, slow-motion, shake, HUD and SFX timings. TTS text/voices live in `remotion/scripts/generate_tts.py` (prefix `e3_`). Regenerate with `python scripts/generate_tts.py e3_`.

### Episode 4 — *RM50,000 Untuk Karim* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode4/`); **1,530 frames / 51.0s @ 30fps**; 9:16 vertical Shorts with multi-voice Malay + English dual subtitles, pattern-interrupt hook and audio-driven pacing.
- **Continuity from Ep. 3:** Karim, the friendly-match MVP and captain, is the man who orchestrated the 3–0 win. The stakes shift from proof-of-concept to a cold pre-season accounting decision in the `ClubOffice` (`environments/club-office.js`).
- **Plot:** A generic **Kelab Divisyen 4** club offers **RM50,000** for Karim. It isn't a big fee, but the cash keeps the club breathing — and cutting the squad's highest salary immediately drops the wage bill. Coach argues heart (Karim is 28, captain, runs the whole attack); Boss argues survival (no point winning a game if the club can't pay the other players next month).
- **Hook:** Frame 0 opens at full brightness on the offer paper sliding across the desk, with a paper-slide SFX transient and the `RM50,000 UNTUK KARIM.` hook overlay for the first 1.5s.
- **HUD:** `TransferOfferHUD` (`remotion/src/components/TransferOfferHUD.jsx`) flashes `TAWARAN RASMI — KELAB DIVISYEN 4`, `RM50,000` and `KOS GAJI: -35%` on lines `e4_05`–`e4_06`.
- **Cliffhanger:** Boss declares the decision final (`e4_09`). A deliberate **1.3s dead silence** — room tone drops out as he reaches for the pen — then the camera pans past his shoulder to the half-open, cooler-backlit door: Karim stands there in his `KARIM 8` Match Jersey and captain's armband, boots in hand, having heard everything. A muted low bass hit lands on `e4_10` and hard-cuts to black. **No CTA.**
- **Cast:** Boss (reused Owner rig/voice `voice_3`), Coach (reused `SoccerCoachOutfitApp` rig / `voice_2`), Karim (new `character-karim.js` rig / `voice_4`).

**Script location:** `episodes/episode-4/script.md` and `episodes/episode-4/audio-script.json` are the source of truth. `remotion/src/Episode4/Episode4Composition.jsx` imports the JSON directly for all scene, subtitle, HUD, silence-beat and SFX timings. TTS text/voices live in `remotion/scripts/generate_tts.py` (prefix `e4_`, all clips lead-silence trimmed). Regenerate with `python scripts/generate_tts.py e4_`.

### Episode 5 — *Pengorbanan & Nombor 7 Baru* (In production)
- **Status:** Scripted for Remotion (`remotion/src/Episode5/`); **1,359 frames / 45.3s @ 30fps**, 1080x1920 9:16 master with MS + EN dual subtitles, a 1.5s hook and audio-driven pacing. All `e5_*` clips are natural 1.0x with both-end silence trimmed — no time stretching; the timeline is derived from measured durations (5–8 frame dialogue gaps, 12-frame armband beat, 3-frame rapid-fire punchline, 8-frame stunned beat before the percussion hit and standard outro).
- **Continuity from Ep. 4:** Karim (#8) sacrifices himself and accepts the **RM50,000** transfer to a **Kelab Divisyen 4** club so Buluh FC survives. He lays his captain armband beside the offer and asks Bos to take the club to Divisyen 1. The club debt drops from **RM381,500 to RM331,500** with **KOS GAJI: -35%**.
- **Plot:** The squad assumes the new **#7** is a striker. Instead, **Azam — a Defender, the fan character @akudingin-d1f —** bursts through the locker-room door and introduces himself: *"Assalamualaikum. Saya Azam. Defender baru."* He later explains his number: *"Baru lawan gerun."* The punchline: his salary is **RM5** — all of Karim's transfer money went to debt.
- **Roster change:** Karim (#8, former captain) **departed**; Azam (#7) **joins** the squad on **RM5**. No new captain is named.
- **Cast:** Bos (`voice_3`), Karim (`voice_4`), Jurulatih (`voice_2`), Rakan 1 & Rakan 2, and Azam (`voice_5`, new `characters/character-azam.js` rig with an `AZAM 7` jersey).
- **HUD:** `DebtTickerHUD` (`remotion/src/Episode5/components/DebtTickerHUD.jsx`) animates `TAWARAN DITERIMA: RM50,000`, ticks `HUTANG KELAB: RM381,500 → RM331,500` and holds `KOS GAJI: -35%`; a compact `HUTANG: RM331,500` tablet reprises on the last line.
- **J-cut:** `e5_06` begins 14 frames before Act 2's visual cut. The 1.5s `@akudingin-d1f — "Bang saya nak masuk Buluh FC" | Azam · #7 · Defender · Gaji RM5` comment card is an in-world fan easter egg, never an engagement prompt.
- **Ending:** 0.25s stunned beat → comedic percussion hit → the standard 72-frame **Buluh FC / EPISOD 5** EndCard, matching Ep. 2–4. No CTA.

**Script location:** `episodes/episode-5/script.md` and `episodes/episode-5/audio-script.json` are the source of truth. `remotion/src/Episode5/Episode5Composition.jsx` imports the JSON directly. TTS text/voices are in `remotion/scripts/generate_tts.py` (prefix `e5_`). Regenerate with `python scripts/generate_tts.py e5_`.

---

## Division 5 title run (Episode 6 onward)

The machine-readable canon for this season is `story/season-money.json`,
`story/league.json`, `story/cast.json` and `story/environments.json`; the prose
bible is `story/season-bible.md`. Karim is fully out of the story — no cameo,
call, letter or reunion tease — and his gold armband stays on Bos's desk until
Azam takes it in Episode 8.

- **Arc 1 — Freeze (Ep 6–11, MD1–4):** the 30-day countdown is replaced by a
  season-long foreclosure freeze conditional on a fixed instalment at every
  month-end. Ep 6 explains the change in Peguam's dialogue inside its first 25
  seconds, introduces the expanded squad and settles on a bank-branch set; the
  captaincy is resolved by Ep 8; the first instalment is paid at the end of Ep 11.
- **Arc 2 — Antagonist (Ep 12–17, MD5–8):** a recurring off-pitch antagonist makes
  his first move, a squad member is tempted away, and Hulubalang United's first
  leg is played. Rival-clubhouse and press-room sets join the rotation; the
  second instalment lands at the end of Ep 17.
- **Arc 3 — The fall (Ep 18–22, MD9–11):** results dip, the squad fractures, the
  kitty runs dry and the one cure window is used. A kampung training ground is
  the new set; fines and emergencies push the debt up before Kek Maju's
  community fund arrives on day 7.
- **Arc 4 — Champions (Ep 23–27, MD12–14):** all-in over the last three
  matchdays, with MD14 at home to Hulubalang United deciding the title. A
  final-day venue set opens, the fourth instalment is paid, the title payout
  clears the balance (LUNAS) and the first profit lands as the RM5 joke's payoff.

Every episode is 1080x1920 @ 30fps, dialogue-led with at most two narrator
bridges, bilingual subtitles, a 0–45 hook, a first cut by frame 60 and a hard
cut to the 72-frame EndCard. No CTA. `npm run verify:season` is the gate.

