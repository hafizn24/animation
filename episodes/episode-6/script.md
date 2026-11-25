# Episode 6 — *Peluang Terakhir* (Script)

> **This script is governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md),**
> including the Section 0 0–2s Pattern-Interrupt Hook Standard.

- **Runtime:** ~00:42.0 (1,260 frames @ 30fps, locked to measured `e6_*` audio durations), 1080x1920 vertical (9:16).
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*) with a smaller English translation line under every subtitle (dual subtitles MS + EN).
- **Structure:** Peguam / Bos / Jurulatih / Azam / Narrator across 5 scenes. No narrator-only stretches. **No CTAs, no outro prompts.**
- **Subtitles:**
  - Character dialogue: white sans-serif with uppercase gold speaker label (`PEGUAM`, `BOS`, `JURULATIH`, `AZAM`).
  - Narration: italic warm gold (`#d8b26a`) serif (Georgia), no speaker label.
- **Settings:**
  - Scenes 1 & 2 — `Episode6OfficeApp` (`environments/episode6-office.js`) with `BossApp`, `LawyerApp`, `SoccerCoachOutfitApp`.
  - Scenes 3 & 4 — `StadiumApp` (`environments/stadium.js`) with `BossApp`, `SoccerCoachOutfitApp`, `AzamApp` (#7), `SquadVariationsApp` (NO Karim, NO captain armband).
  - Scene 5 — Matchday 1 fixture reveal (`PERLAWANAN 1: BULUH FC vs HARIMAU LEMBAH FC`) + hard cut to black `Buluh FC / EPISOD 6` EndCard (72 frames).
- **Continuity:**
  - Starting debt: **RM326,500** (Kek Maju's RM5,000 already deducted).
  - Wage costs: **-35%**.
  - Karim: Departed (absent from all lineups).
  - Azam: Defender, **#7**, salary RM5.
  - Captaincy: Vacant (no armband).
  - Division 5 format: 12 clubs, single round-robin (11 matches), champion promoted to Division 4.
  - Stadium: Seizure conditionally frozen until end of season.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## Scene 1 — The Warning (00:00.0 – 00:07.0) | `Episode6OfficeApp`

- **Visual:** Frame 0 is already bright and moving. Camera starts tight on Boss's desk as the thick legal notice (`PERJANJIAN BERSYARAT`) slams down heavily on frames 1–8 with a sharp paper/desk impact SFX (`stamp.wav` + `paper.wav`). Cut/rack to `LawyerApp` standing across the desk; `BossApp` looks visibly worried.
- **HookTitle:** `"PELUANG TERAKHIR."` — spring pop-in, top pill `EP. 6 • PELUANG TERAKHIR`, frames 0–45, inside `SafeArea`.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e6_01 | PEGUAM | "Ini peluang terakhir kamu. Jangan sampai stadium ni terlepas." | "This is your last chance. Don't let this stadium slip away." |

---

## Scene 2 — The Debt (00:07.0 – 00:15.0) | `Episode6OfficeApp`

- **Visual:** Boss checks the finance ledger/HUD showing `Baki Hutang: RM326,500` (`Kek Maju: -RM5,000`, `Kos Gaji: -35%`). `SoccerCoachOutfitApp` stands beside/across the desk reacting seriously.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e6_02 | BOS | "Hutang kita masih RM326,500..." | "Our debt is still RM326,500..." |
| e6_03 | JURULATIH | "Kalau macam tu, kita memang kena naik Division 4." | "If that's the case, we really have to get promoted to Division 4." |

---

## Scene 3 — The New Challenge (00:15.0 – 00:25.0) | `StadiumApp`

- **Visual:** Buluh FC training pitch. Coach addresses the rebuilt squad in formation (`AzamApp` #7 prominent, `SquadVariationsApp` extras, NO Karim, NO captain armband). Tactical HUD shows `DIVISION 5: 12 KELAB | 11 PERLAWANAN | JUARA → DIV 4`.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e6_04 | JURULATIH | "Musim ni ada 12 pasukan. Semua lawan sekali. Kita ada 11 perlawanan." | "This season has 12 teams. Everyone plays once. We have 11 matches." |
| e6_05 | AZAM | "Jadi, tak ada ruang untuk main-main?" | "So, there's no room to mess around?" |
| e6_06 | JURULATIH | "Memang tak ada." | "None at all." |

---

## Scene 4 — A New Beginning (00:25.0 – 00:37.0) | `StadiumApp`

- **Visual:** Wide-to-medium cinematic grass-level shot on the stadium pitch. Squad stands united in Buluh FC kits. Boss watches from the touchline, then camera pushes in on Azam (#7) scanning his teammates, locked in for the fight.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e6_07 | BOS | "Karim dah pergi. Tapi Buluh FC masih ada." | "Karim is gone. But Buluh FC is still here." |

---

## Scene 5 — The Cliffhanger & End Card (00:37.0 – 00:45.0) | `StadiumApp` + EndCard

- **Visual:** Dramatic reveal of Matchday 1 fixture (`PERLAWANAN 1: BULUH FC vs HARIMAU LEMBAH FC`). Hold tension, then hard cut to black title card: `Buluh FC` / `EPISOD 6` (72 frames, gold/white styling, NO CTA).

| Line | Speaker | Malay | English |
|---|---|---|---|
| e6_08 | NARRATOR | "Perjalanan Division 5 bermula. Tapi lawan pertama mereka bukan calang-calang..." | "The Division 5 journey begins. But their first opponent is no pushover..." |
