# Episode 8 — *Duit vs Maruah* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard.

- **Runtime:** 00:00 – 00:44.0 (1,320 frames @ 30fps), 1080×1920 vertical.
- **Result:** Menang 2–1 (6 mata) • **Debt:** RM316,500 → RM296,500 (−RM20,000 🟢 — breaks the RM300k barrier).
- **Structure:** NARRATOR alternates with RAYAN, BOS, AZAM and FARID. **No CTAs.**
- **Settings:** Act 1 `MatchTunnel` → Act 2 `ModularPitchZone` penalty box → Act 3 penalty box for table + debt overlays.
- **Hook:** Rayyan tosses a thick envelope onto Bos's chest (`paper.wav` slap) at frame 0; HookTitle "RASUAH KELAB HUTANG?" for frames 0–45; first cut at frame 90.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 8** EndCard.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## ACT 1 — Bribe in the Tunnel (00:00 – 00:16) | `MatchTunnel` — frames 0–479

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_01 | 0–75 | NARRATOR | "Vanguard Elite. Kasut emas, kereta mewah, dan satu sampul tebal." | "Vanguard Elite. Gold boots, fancy cars, and one thick envelope." |
| e8_02 | 90–210 | RAYAN | "Kelab kau hutang, kan? Ambil la ini. Kalah je esok." | "Your club's in debt, right? Take this. Just lose tomorrow." |
| e8_03 | 225–330 | BOS | "Kau fikir kami jual maruah sekali dengan hutang?" | "You think we sold our pride along with the debt?" |
| e8_04 | 345–465 | NARRATOR | "Bos letak sampul tu balik ke tangan Rayyan. Tenang je." | "Boss puts the envelope back in Rayyan's hand. Calm as you like." |

## ACT 2 — Shut Down & Winner (00:16 – 00:32) | Penalty Box — frames 480–959

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_05 | 495–570 | NARRATOR | "Rayyan main cantik. Skill, feint, nampak macam iklan." | "Rayyan plays pretty. Skills, feints, like a commercial." |
| e8_06 | 585–675 | RAYAN | "Nampak tak? Ini kelas divisyen empat." | "See that? This is Division Four class." |
| e8_07 | 690–750 | AZAM | "Kelas? Saya jaga kelas, bro." | "Class? I guard the class, bro." |
| e8_08 | 765–855 | NARRATOR | "Azam tutup ruang. Farid lari. Dua satu." | "Azam shuts the door. Farid runs. Two-one." |
| e8_09 | 870–945 | FARID | "Maruah tak dijual, tapi gol dijual!" | "Pride isn't for sale — but goals are!" |

- **Overlay:** `MatchHUD` ticks `0-0 → 1-0 → 1-1 → 2-1`.

## ACT 3 — Table & Barrier (00:32 – 00:41.6) | Penalty Box — frames 960–1247

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_10 | 975–1050 | NARRATOR | "Papan kedudukan: Buluh FC kekal tempat ketiga. Dua menang berturut-turut." | "The table: Buluh FC stay third. Two wins in a row." |
| e8_11 | 1065–1140 | BOS | "Tiga ratus ribu... tak. Dua ratus sembilan puluh enam." | "Three hundred grand... no. Two hundred and ninety-six." |
| e8_12 | 1155–1230 | NARRATOR | "RM296,500. Kali pertama kita nampak garisan tiga ratus." | "RM296,500. The first time we see below the three-hundred line." |

- **Overlays:** `LeagueTableOverlay` (MD3) then GREEN `DebtTickerHUD` **RM316,500 → RM296,500**.

## Ending

Frame 1248: hard cut to **Buluh FC / EPISOD 8** (72 frames). No CTA.
