# Episode 10 — *Hidup Mati* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard.

- **Runtime:** 00:00 – 00:43.0 (1,290 frames @ 30fps), 1080×1920 vertical.
- **Result:** Menang 4–3 (9 mata) • **Debt:** RM321,500 → RM300,000 (−RM21,500 🟢).
- **Structure:** NARRATOR alternates with KAPTEN BOB, DANIAL (#1), JURULATIH, AZAM, FARID and BOS. **No CTAs.**
- **Settings:** Acts 1–2 `ModularPitchZone` penalty box → Act 3 touchline for table + debt overlays.
- **Hook:** rapid-fire scoreboard flip `1-0 → 1-1 → 2-2 → 3-3` at frame 0 (`whistle.wav` + three net swishes). HookTitle "PERLAWANAN PALING GILA!" for frames 0–45; first cut at frame 90.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 10** EndCard.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## ACT 1 — Pure Chaos (00:00 – 00:14) | Penalty Box — frames 0–419

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_01 | 0–75 | NARRATOR | "Kilat Rovers. Serangan gila, pertahanan kosong." | "Kilat Rovers. All attack, no defence." |
| e10_02 | 90–195 | KAPTEN BOB | "Kami tak percaya pada pertahanan! Kami percaya pada gol!" | "We don't believe in defence! We believe in goals!" |
| e10_03 | 210–405 | NARRATOR | "Danial penat menjerit pada backline. Skor: tiga-tiga." | "Danial is tired of shouting at his backline. Score: three-three." |

- **Overlay:** `MatchHUD` flips `1-0 → 1-1 → 2-2 → 3-3` on the frame-0 hook.

## ACT 2 — 88th Minute Winner (00:14 – 00:31) | Penalty Box — frames 420–929

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_04 | 435–525 | JURULATIH | "Semua naik! Sekarang!" | "Everyone forward! Now!" |
| e10_05 | 540–630 | NARRATOR | "Minit ke-88. Azam blok, then hantar ke Farid." | "88th minute. Azam blocks, then picks out Farid." |
| e10_06 | 645–705 | AZAM | "Sekali lagi, Farid!" | "One more time, Farid!" |
| e10_07 | 720–825 | NARRATOR | "Satu tendangan. Empat tiga. Buluh FC masih hidup!" | "One strike. Four-three. Buluh FC are still alive!" |
| e10_08 | 840–915 | FARID | "Masih hidup!" | "Still alive!" |

## ACT 3 — Second Place (00:31 – 00:40.6) | Touchline — frames 930–1217

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e10_09 | 945–1035 | NARRATOR | "Tempat kedua. Tiga mata di belakang Besi Waja." | "Second place. Three points behind Besi Waja." |
| e10_10 | 1050–1125 | BOS | "Tiga ratus ribu tepat. Satu perlawanan lagi." | "Three hundred grand exactly. One match left." |
| e10_11 | 1140–1200 | NARRATOR | "Matchday lima. Besi Waja. Juara atau sita." | "Matchday five. Besi Waja. Champions or seized." |

- **Overlays:** `LeagueTableOverlay` (MD4) → GREEN `DebtTickerHUD` **RM321,500 → RM300,000**.

## Ending

Frame 1218: hard cut to **Buluh FC / EPISOD 10** (72 frames). No CTA.
