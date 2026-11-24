# Episode 7 — *Menang Pertama* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard.

- **Runtime:** 00:00 – 00:42.0 (1,260 frames @ 30fps), 1080×1920 vertical.
- **Result:** Menang 1–0 (3 mata) • **Debt:** RM331,500 → RM316,500 (−RM15,000 🟢).
- **Structure:** NARRATOR alternates with PAK DIN, AZAM, FARID, JURULATIH and BOS. **No CTAs.**
- **Settings:** Act 1 & 2 `ModularPitchZone` penalty box → Act 3 touchline with the glowing `KEK MAJU` ad-board.
- **Hook:** ball whizzes past the post and clangs the crossbar at frame 0 (`bell.wav` + `kick.wav`). HookTitle "OTAI KAMPUNG TAK LARAT?" for frames 0–45; first cut at frame 90.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 7** EndCard.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## ACT 1 — Otai Mind Games (00:00 – 00:15) | Penalty Box — frames 0–449

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_01 | 0–75 | NARRATOR | "Otai Kampung FC. Lambat jalan, tapi mulut lebih laju dari kaki." | "Otai Kampung FC. Slow on the feet, faster with the mouth." |
| e7_02 | 90–195 | PAK DIN | "Gaji lima ringgit? Anak muda, aku boleh bayar seminggu dengan duit poket." | "Five ringgit salary? Kid, I can pay you a week's wage from my pocket money." |
| e7_03 | 210–270 | AZAM | "Boleh la. Tarikh gaji nanti saya panjang tangan sikit." | "Sure. On payday I might get a little grabby." |
| e7_04 | 285–435 | NARRATOR | "Dia jalan perlahan. Tapi matanya baca padang macam main catur." | "He walks slowly. But he reads the pitch like a chessboard." |

## ACT 2 — First Goal (00:15 – 00:30) | Penalty Box — frames 450–899

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_05 | 465–555 | JURULATIH | "Tinggi! Press dari depan! Jangan tunggu dia bagi pass!" | "Push up! Press from the front! Don't wait for his pass!" |
| e7_06 | 570–660 | NARRATOR | "Pak Din bagi pass kecil — Azam baca, dan potong." | "Pak Din slips a little pass — Azam reads it and cuts it out." |
| e7_07 | 675–720 | AZAM | "Farid! Pergi!" | "Farid! Go!" |
| e7_08 | 735–825 | NARRATOR | "Satu sentuhan. Satu deretan. Gol pertama Buluh FC musim ni!" | "One touch. One roar. Buluh FC's first goal of the season!" |
| e7_09 | 840–890 | FARID | "Akhirnya juga!" | "Finally!" |

- **Overlay:** `MatchHUD` ticks `BUL 1-0 OTK` (`1' → 78' → FT`).

## ACT 3 — Fulltime Payout (00:30 – 00:39.6) | Touchline — frames 900–1187

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_10 | 915–990 | NARRATOR | "Whistle panjang. KEK MAJU berdiri depan, papan iklan dia nampak lebih terang." | "Fulltime. KEK MAJU is front and centre, and her ad-board never looked brighter." |
| e7_11 | 1005–1080 | BOS | "Lima belas ribu masuk. Tiket, bukan duit syiling." | "Fifteen grand in. Ticket money, not pocket change." |
| e7_12 | 1095–1170 | NARRATOR | "Hutang turun. Tiga ratus tiga puluh satu ke tiga ratus enam belas." | "The debt drops. Three-thirty-one to three-sixteen." |

- **Debt beat:** `DebtTickerHUD` rolls GREEN **RM331,500 → RM316,500**.

## Ending

Frame 1188: hard cut to **Buluh FC / EPISOD 7** (72 frames). No CTA.
