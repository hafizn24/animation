# Episode 10 — *Hidup Mati* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard.

- **Runtime:** 00:00 – 00:43.0 (1,290 frames @ 30fps), 1080×1920 vertical.
- **Result:** Menang 4–3 (9 mata) • **Debt:** RM321,500 → RM300,000 (−RM21,500 🟢).
- **Structure:** NARRATOR alternates with KAPTEN BOB, JURULATIH, AZAM, FARID and BOS, with a direct Bob ↔ Azam exchange in Act 2. **No CTAs.**
- **Settings:** Acts 1–2 `ModularPitchZone` penalty box → Act 3 touchline for table + debt overlays.
- **Hook:** rapid-fire scoreboard flip `1-0 → 1-1 → 2-2 → 3-3` inside frames 0–42 (`whistle.wav` at 0, three `net.wav` swishes at 14/28/42). HookTitle "PERLAWANAN PALING GILA!" for frames 0–45; first cut at frame 54.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 10** EndCard.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## ACT 1 — Pure Chaos (00:00 – 00:14) | Penalty Box — frames 0–419

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_01 | 0–99 | NARRATOR | "Kilat Rovers. Serangan gila, pertahanan kosong." | "Kilat Rovers. All attack, no defence." |
| e10_02 | 104–207 | KAPTEN BOB | "Kami tak percaya pada pertahanan! Kami percaya pada gol!" | "We don't believe in defence! We believe in goals!" |
| e10_03 | 212–328 | NARRATOR | "Danial penat menjerit pada backline. Skor: tiga-tiga." | "Danial is tired of shouting at his backline. Score: three-three." |

- **Overlay:** `MatchHUD` flips `1-0 → 1-1 → 2-2 → 3-3` on the frame-0 hook.

## ACT 2 — 88th Minute Winner (00:14 – 00:31) | Penalty Box — frames 420–929

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_04 | 335–366 | JURULATIH | "Semua naik! Sekarang!" | "Everyone forward! Now!" |
| e10_05 | 371–481 | NARRATOR | "Minit ke-88. Azam blok, then hantar ke Farid." | "88th minute. Azam blocks, then picks out Farid." |
| e10_06 | 486–519 | AZAM | "Sekali lagi, Farid!" | "One more time, Farid!" |
| e10_06b | 524–588 | FARID | "Kau blok, aku serang! Terus, Azam!" | "You block, I attack! Straight, Azam!" |
| e10_07 | 593–707 | NARRATOR | "Satu tendangan. Empat tiga. Buluh FC masih hidup!" | "One strike. Four-three. Buluh FC are still alive!" |
| e10_08 | 712–740 | FARID | "Sampai juga!" | "Finally made it!" |

## ACT 3 — Second Place (00:31 – 00:40.6) | Touchline — frames 930–1217

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_09 | 747–846 | NARRATOR | "Tempat kedua. Tiga mata di belakang Besi Waja." | "Second place. Three points behind Besi Waja." |
| e10_10 | 851–1015 | BOS | "Tiga ratus ribu tepat. Juara nanti, hadiah dengan bonus penaja lunas semua." | "Three hundred grand exactly. Win the title and the prize plus sponsor bonus clear it all." |
| e10_11 | 1020–1125 | NARRATOR | "Matchday lima. Besi Waja. Juara atau sita." | "Matchday five. Besi Waja. Champions or seized." |

- **Overlays:** `LeagueTableOverlay` (MD4) → GREEN `DebtTickerHUD` **RM321,500 → RM300,000**.

## Ending

Frame 1218: hard cut to **Buluh FC / EPISOD 10** (72 frames). No CTA.
