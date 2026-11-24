# Episode 6 — *Janji Bank & Matchday 1* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard.

- **Runtime:** 00:00 – 00:43.0 (1,290 frames @ 30fps), 1080×1920 vertical.
- **Result:** Kalah 0–2 (0 mata) • **Debt:** RM331,500 → RM331,500 (±RM0 — loss pays RM0).
- **Structure:** NARRATOR alternates with BOS, PEGUAM, KAPTEN ZAKI, JURULATIH and AZAM. No narrator-only stretch. **No CTAs.**
- **Settings:** Act 1 `ClubOffice` (with red NOTIS SITA folder, stamp and Karim's vacant gold armband) → Act 2 `ModularPitchZone` center circle → Act 3 `ModularPitchZone` touchline bench.
- **Hook:** frame 0 is already bright and moving — a red bank stamp slams onto the NOTIS SITA folder (`stamp.wav` transient). `HookTitle` "JANJI JUARA ATAU SITA!" spring-pops for frames 0–45; first cut at frame 54.
- **11-a-side:** a 2.7s `StartingXICard` reads all 11 Buluh FC players from `story/division5-league.json` (featured names in gold); only 2–4 Three.js rigs render per shot.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 6** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`.

---

## ACT 1 — Janji Bank (00:00 – 00:14) | `ClubOffice` — frames 0–419

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e6_01 | 0.0–3.0 | 0–89 | NARRATOR | "Cop merah. Meja ni bukan lagi milik kita." | "A red stamp. This desk isn't ours anymore." |
| e6_02 | 3.0–6.1 | 91–184 | PEGUAM | "Masa awak habis, bos. Stadium ni milik bank." | "Your time is up, boss. This stadium belongs to the bank." |
| e6_03 | 6.2–12.4 | 186–373 | BOS | "Kasih satu musim. Juara Divisyen 5 — hadiah dengan bonus penaja lunas hutang kita." | "Give us one season. Win Divisyen 5 — the prize and sponsor bonus clear our debt." |
| e6_04 | 12.5–15.7 | 375–471 | PEGUAM | "Juara atau sita. Kalah, kosong ringgit." | "Champions or seized. Lose, and you get nothing." |

- **Visual:** stamp close-up → Peguam/Bos two-shot → Bos negotiation push-in → Peguam's cold warning. The gold armband stays on the desk beside the red folder.

## ACT 2 — Matchday 1 (00:14 – 00:30) | `ModularPitchZone` Center Circle — frames 420–899

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e6_05 | 15.9–19.9 | 476–598 | NARRATOR | "Matchday satu. Tanpa Karim, Buluh FC macam tak ada nakhoda." | "Matchday one. Without Karim, Buluh FC has no helmsman." |
| e6_06 | 20.0–23.6 | 600–707 | KAPTEN ZAKI | "Kau tak ada kapten? Bagus la. Kami nombor satu." | "No captain? Even better. We're number one." |
| e6_07 | 23.6–26.5 | 709–794 | JURULATIH | "Azam! Tekan! Jangan bagi dia ruang!" | "Azam! Press! Don't give him space!" |
| e6_08 | 26.5–30.7 | 796–920 | NARRATOR | "Dua gol. Satu lawan. Dan lampu sorot bank masih menyala." | "Two goals. One opponent. And the bank's spotlight is still on." |

- **Overlays:** `StartingXICard` frames 438–520; `MatchHUD` ticks `BUL 0-2 TKJ` with `1' → 63' → 89'`.

## ACT 3 — Last-Ditch Block (00:30 – 00:40.6) | Touchline Bench — frames 900–1217

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e6_09 | 30.8–35.6 | 925–1069 | NARRATOR | "Minit ke-89. Azam nampak satu peluang terakhir untuk menahan." | "89th minute. Azam sees one last chance to block." |
| e6_10 | 35.7–38.0 | 1071–1139 | AZAM | "Tak lepas. Hari ini tak lepas." | "Not through. Not today." |
| e6_11 | 38.0–42.1 | 1141–1262 | NARRATOR | "Di tepi padang, Peguam tengok jam. Dia tak perlu cakap apa-apa." | "On the touchline, the lawyer checks his watch. He doesn't need to say a word." |

- **Debt beat:** `DebtTickerHUD` flashes neutral grey at **RM331,500** — a loss earns RM0.

## Ending

Frame 1218: hard cut to **Buluh FC / EPISOD 6** (72 frames). No CTA.
