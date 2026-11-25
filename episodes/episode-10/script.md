# Episode 10 — *Hidup Mati* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:44.1 (1,323 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM321,500 → RM300,000 (DOWN — BONUS MENANG + KUTIPAN TIKET).
- **Result:** Matchday 4 — BUL 4–3 KIL (FT).
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** PERLAWANAN PALING GILA! — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 10** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e10_* MP3s after regeneration.

---

## Act 1 — Serangan Gila — frames 0–389 | `PitchPenaltyBoxApp`

- **Visual:** Hook: the scoreboard flips 1-0 -> 1-1 -> 2-2 -> 3-3 inside the first 1.4 seconds. Kapten Bob of Kilat Rovers laughs through the chaos — defence is for cowards. Danial is done shouting; Azam takes command of the backline like a captain who has not yet been handed the armband.
- **SFX:** whistle at 0; three quick net swishes on the hook; crowd-big bed; Danial scream.
- **Cues:** whistle.wav@0, net.wav@14, net.wav@28, net.wav@42, crowd-big.wav@46

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_01 | 0–100 | NARRATOR | "Kilat Rovers. Serang gila. Pertahanan? Tiada." | "Kilat Rovers. Crazy attacks. Defence? None." |
| e10_02 | 102–201 | KAPTEN BOB | "Pertahanan buat apa?! Gol lagi best, brader!" | "Who needs defence?! Goals are more fun, lads!" |
| e10_03 | 203–284 | DANIAL | "TIGA TIGA?! Aku penat jerit, Azam!!" | "THREE-ALL?! I'm done shouting, Azam!!" |
| e10_04 | 286–381 | AZAM | "Semua dengar aku! Satu blok — kita menang!" | "Everyone listen! One block — we win this!" |

## Act 2 — Minit ke-88 — frames 389–859 | `PitchPenaltyBoxApp`

- **Visual:** Minute 88: Jurulatih sends everyone forward. Kilat attack once more; Azam reads it, blocks it clean and releases Farid on the counter. One strike — 4-3. Bob's reply spreads the RM5 legend to the enemy camp; Azam's answer makes it a warning.
- **SFX:** block thud (bass-hit); kick + net.wav on the winner; crowd-big roar; comic thud on Bob's collapse.
- **Cues:** whistle.wav@389, bass-hit.wav@588, kick.wav@678, net.wav@686, crowd-big.wav@686

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_05 | 389–495 | JURULATIH | "Semua naik! Minit 88 — sekarang atau takda esok!" | "Everyone forward! Minute 88 — now or never!" |
| e10_06 | 497–594 | NARRATOR | "Kilat serang lagi. Azam baca... dan potong." | "Kilat attack again. Azam reads it… and cuts it out." |
| e10_07 | 596–635 | AZAM | "Farid! Jalan!" | "Farid! Run!" |
| e10_08 | 637–691 | FARID | "Kau blok, aku settle!" | "You block, I finish!" |
| e10_09 | 693–770 | NARRATOR | "Empat tiga. Buluh FC masih hidup!" | "Four-three. Buluh FC are still alive!" |
| e10_11 | 772–851 | AZAM | "Lima ringgit. Lepas ni jadi mahal." | "Five ringgit. About to get expensive." |

## Act 3 — Bayang Besi Waja — frames 859–1251 | `PitchTouchlineApp`

- **Visual:** Full-time table: second place, three points behind an undefeated side. Jurulatih describes the machine that never smiles; Bos answers with the season's thesis — machines break, Buluh FC has a heart. LeagueTableOverlay (MD4) and a GREEN debt roll RM321,500 -> RM300,000 close the act.
- **SFX:** long whistle; table slide-up whoosh; green HUD bell.
- **Cues:** whistle.wav@859, whoosh.wav@867, bell.wav@1117

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_12 | 859–961 | NARRATOR | "Tempat kedua. Tiga mata di belakang Besi Waja." | "Second place. Three points behind Besi Waja." |
| e10_13 | 963–1048 | JURULATIH | "Diorang tak senyum. Main macam mesin." | "They never smile. They play like a machine." |
| e10_14 | 1050–1133 | BOS | "Mesin boleh rosak. Kita ada jantung." | "Machines break. We have a heart." |
| e10_15 | 1135–1243 | NARRATOR | "RM300,000 tepat. Matchday lima — juara atau sita." | "RM300,000 exactly. Matchday five — champions or seized." |

## Ending

Frame 1251: hard cut to **Buluh FC / EPISOD 10** (72 frames). No CTA.
