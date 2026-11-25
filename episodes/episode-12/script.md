# Episode 12 — *Juara Divisyen 5* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:43.4 (1,303 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM305,000 → RM0 (DOWN — HADIAH JUARA + BONUS PENAJA — LUNAS!).
- **Result:** Matchday 5 — BUL 3–2 BSW (FT).
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** KAPTEN BARU, MISI MUSTAHIL — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 12** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e12_* MP3s after regeneration.

---

## Act 1 — Ucapan Kapten & Comeback — frames 0–292 | `PitchCenterCircleApp`

- **Visual:** Frame 0: the new captain mid-speech, armband tight, finger forward. Buluh FC come out swinging: Farid slices the machine for 1-2, then a corner with EVERYONE up — Azam rises for the header, 2-2. Malik repeats his mantra as it stops working. MatchHUD climbs 0-2 -> 1-2 -> 2-2.
- **SFX:** kick + net on both comeback goals; crowd-medium swelling; corner whistle.
- **Cues:** whistle.wav@0, kick.wav@87, net.wav@95, kick.wav@174, net.wav@182, crowd-medium.wav@182

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_01 | 0–100 | AZAM | "Diorang tanam kita. Sekarang kita gali balik!" | "They buried us. Now we dig out!" |
| e12_04 | 100–187 | NARRATOR | "Corner. Semua naik... termasuk kapten." | "Corner. Everyone up… including the captain." |
| e12_05 | 187–284 | AZAM | "SETARAF! Sekarang diorang yang tengok kita!" | "ALL SQUARE! Now they watch US!" |

## Act 2 — Minit ke-90 (Dilakar, Bukan Dicerita) — frames 292–700 | `PitchPenaltyBoxApp`

- **Visual:** Minute 90, two-all. Azam releases Farid behind the machine; the stadium holds its breath — ONE narrator line, then the slow-motion 1v1 against the giant Besi Waja keeper: low crouch, oversized gloves, top corner. MASUK. Azam's captain scream and Malik's machine finally breaking are the only reactions we need.
- **SFX:** one heartbeat bass-hit before the strike; kick + net.wav on the winner; crowd-big eruption; whistle.
- **Cues:** bass-hit.wav@426, kick.wav@512, net.wav@520, crowd-big.wav@520, whistle.wav@603

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_07 | 292–392 | NARRATOR | "Minit ke-90. Dua dua. Satu serangan terakhir." | "Minute 90. Two-all. One last attack." |
| e12_08 | 392–436 | AZAM | "FARID! SEKARANG!" | "FARID! NOW!" |
| e12_09 | 436–525 | NARRATOR | "Stadium diam. Satu peluang. Satu nafas." | "The stadium holds its breath. One chance. One breath." |
| e12_10 | 525–561 | FARID | "MASUK!!" | "IT'S IN!!" |
| e12_11 | 561–617 | AZAM | "JUARA!!! KITA JUARA!!!" | "CHAMPIONS!!! WE'RE CHAMPIONS!!!" |
| e12_12 | 617–692 | KAPTEN MALIK | "Kita kalah... pada kelab hutang." | "We lost… to a club in debt." |

## Act 3 — Lunas & Karim di Tribun — frames 700–1231 | `PitchHeroStandApp`

- **Visual:** The new hero-stand set, floodlit and bannered. The Peguam's phone lands the payout in dialogue — no narrator arithmetic. Bos screams the club back to life; then the camera finds the tribun: Karim in his Divisyen 4 away kit with a Buluh scarf, clapping. His line completes Episode 5's promise. Season2Hook card: DIVISYEN 4 — LAWAN PERTAMA: KELAB KARIM. Confetti falls after the banner flips to JUARA.
- **SFX:** phone buzz; crowd-big trophy roar; warm bell on LUNAS; confetti shimmer on the banner flip.
- **Cues:** crowd-big.wav@700, bell.wav@945, crowd-big.wav@955

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_13 | 700–797 | NARRATOR | "Kat tribun... satu siluet dah lama berdiri." | "In the stands… one silhouette has been standing a while." |
| e12_14 | 797–839 | BOS | "Rim...? KARIM?!" | "Rim…? KARIM?!" |
| e12_15 | 839–945 | KARIM | "Aku kata dulu — jangan jual kapten. Lagi garang!" | "I told you — do not sell your captain. Even fiercer now!" |
| e12_16 | 945–1047 | PEGUAM | "Hadiah juara masuk. Bonus penaja masuk. LUNAS." | "Champion prize landed. Sponsor bonus landed. CLEARED." |
| e12_17 | 1047–1128 | BOS | "Kita lunas!! Buluh FC hidup balik!!" | "We are clear!! Buluh FC lives again!!" |
| e12_18 | 1128–1223 | KARIM | "Divisyen 4 tunggu. Jumpa kat sana, kapten." | "Division 4 is waiting. See you there, captain." |

## Ending

Frame 1231: hard cut to **Buluh FC / EPISOD 12** (72 frames). No CTA.
