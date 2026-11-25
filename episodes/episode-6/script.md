# Episode 6 — *Janji Bank* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:43.7 (1,311 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM331,500 → RM331,500 (FLAT — KALAH MATCHDAY 1 = TIADA BONUS).
- **Result:** Matchday 1 — BUL 0–2 TKJ (89').
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** JANJI JUARA ATAU SITA! — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 6** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e6_* MP3s after regeneration.

---

## Act 1 — Janji Bank (dengan Armband) — frames 0–524 | `ClubOfficeApp`

- **Visual:** Frame 0: the heavy red stamp slams onto the NOTIS SITA folder; Karim's gold armband sits beside it. Peguam gives the ultimatum; Bos signs the one-season freeze and points at the armband — it stays on the desk until Buluh FC lift the trophy. Peguam's answer defines the season: armbands don't pay debt — goals do.
- **SFX:** stamp slam at frame 0; paper slide; pen-tap ticks on the signing.
- **Cues:** stamp.wav@0, paper.wav@93, pen-tap.wav@309, pen-tap.wav@321

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e6_01 | 0–93 | NARRATOR | "Cop merah. Meja ni bukan lagi milik kita." | "A red stamp. This desk isn't ours anymore." |
| e6_02 | 93–201 | PEGUAM | "Tujuh hari, bos. Juara atau sita. Awak yang sign." | "Seven days, boss. Champions or seized. You're the one signing." |
| e6_03 | 201–309 | BOS | "Kasih satu musim. Juara Divisyen 5, hutang lunas." | "Give us one season. Win Divisyen 5, debt cleared." |
| e6_04 | 309–423 | BOS | "Armband Karim kekal atas meja ni. Sampai kita juara." | "Karim's armband stays on this desk. Until we're champions." |
| e6_05 | 423–516 | PEGUAM | "Armband tak bayar hutang. Gol yang bayar." | "Armbands don't pay debt. Goals do." |

## Act 2 — Matchday 1 vs Taktik Jaya — frames 524–998 | `PitchCenterCircleApp`

- **Visual:** Kickoff vs neon-green Taktik Jaya. Kapten Zaki struts with his clipboard — a try-hard tactician, not a one-line extra. Danial screams at the backline as Taktik Jaya score twice; Azam organises, Jurulatih refuses to let heads drop. The loss lands through the players' voices.
- **SFX:** kickoff whistle; crowd murmur; boot-on-ball kicks; net swish on both conceded goals.
- **Cues:** whistle.wav@524, crowd-small.wav@617, kick.wav@807, net.wav@815, kick.wav@894, net.wav@902

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e6_06 | 524–617 | NARRATOR | "Matchday satu. Tanpa kapten, tanpa Karim." | "Matchday one. No captain, no Karim." |
| e6_07 | 617–725 | KAPTEN ZAKI | "Tak ada kapten? Aku ada clipboard. Itu beza kita." | "No captain? I have a clipboard. That's the difference." |
| e6_08 | 725–820 | AZAM | "Hutang bukan mati, bro. Aku jaga belakang." | "Debt isn't death, bro. I guard the back." |
| e6_09 | 820–907 | DANIAL | "Belakang!! Siapa jaga lurus belakang?!" | "Backline!! Who's holding the line?!" |
| e6_10 | 907–990 | JURULATIH | "Fokus! Susun balik! Belum mati lagi!" | "Focus! Line up again! Not dead yet!" |

## Act 3 — Blok Terakhir & Skrip Peguam — frames 998–1239 | `PitchTouchlineApp`

- **Visual:** Minute 89, Zaki wants a third for his clipboard. Azam throws his body in front of the shot — his line, his responsibility. On the touchline Peguam writes it all down without a word. DebtTickerHUD flashes NEUTRAL at RM331,500 — a loss pays RM0.
- **SFX:** block thud (bass-hit); sharp whistle; pen-tap as the lawyer writes.
- **Cues:** whistle.wav@998, bass-hit.wav@1067, pen-tap.wav@1144, pen-tap.wav@1158

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e6_11 | 998–1073 | NARRATOR | "Minit ke-89. Zaki nak satu lagi." | "Minute 89. Zaki wants one more." |
| e6_13 | 1073–1144 | AZAM | "Tak lepas. Hari ini tak lepas." | "Not through. Not today." |
| e6_14 | 1144–1231 | NARRATOR | "Peguam catat semua. Tanpa sepatah pun." | "The lawyer writes it all down. Not one word." |

## Ending

Frame 1239: hard cut to **Buluh FC / EPISOD 6** (72 frames). No CTA.
