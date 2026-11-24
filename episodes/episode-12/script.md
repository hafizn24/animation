# Episode 12 — *Juara Divisyen 5* (Script)

> Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Season 1 Finale Part 2.

- **Runtime:** 00:00 – 00:45.0 (1,350 frames @ 30fps), 1080×1920 vertical.
- **Result:** Menang 3–2 (12 mata, **JUARA**) • **Debt:** RM305,000 → RM0 (**−RM305,000 🟢 LUNAS** — Champion Prize + Nexus Sports promotion bonus).
- **Structure:** NARRATOR alternates with AZAM (now captain), FARID, PENJAGA GOL BESI, BOS and PEGUAM. **No CTAs.**
- **Settings:** `ModularPitchZone` center circle → penalty box for the 90th-minute 1v1 and the payout.
- **Hook:** tight close-up of Azam tightening the gold armband and pointing forward at frame 0, stadium roar rising. HookTitle "KAPTEN BARU, MISI MUSTAHIL" for frames 0–45; first cut at frame 54.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 12** EndCard. No CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## ACT 1 — Comeback (00:00 – 00:15) | Center Circle — frames 0–449

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_01 | 0–85 | NARRATOR | "Dia ketatkan armband. Terus tunjuk depan." | "He tightens the armband. Then points forward." |
| e12_02 | 87–154 | AZAM | "Aku kapten sekarang. Ikut aku." | "I'm captain now. Follow me." |
| e12_03 | 156–270 | NARRATOR | "Azam atur pertahanan, kita balas dua gol. Setarakan!" | "Azam sorts the backline, we hit back with two goals. All square!" |
| e12_04 | 272–341 | FARID | "Kasih saya satu lagi. Satu je." | "Give me one more. Just one." |

- **Overlay:** `MatchHUD` ticks `0-2 (HT) → 1-2 → 2-2`.

## ACT 2 — 90th Minute Winner (00:15 – 00:30) | Penalty Box — frames 450–899

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_05 | 346–473 | NARRATOR | "Minit ke-90. Dua dua. Satu lawan satu." | "90th minute. Two-all. One against one." |
| e12_06 | 475–519 | AZAM | "Farid! Sekarang!" | "Farid! Now!" |
| e12_06b | 521–613 | NARRATOR | "Farid lari ke kotak. Penjaga gol keluar." | "Farid runs into the box. The keeper comes out." |
| e12_06c | 615–687 | NARRATOR | "Satu lawan satu. Stadium diam." | "One against one. The stadium holds its breath." |
| e12_07 | 689–804 | NARRATOR | "Slow motion. Tendangan ke penjuru atas. Tiga dua!" | "Slow motion. Strike into the top corner. Three-two!" |
| e12_08 | 806–829 | FARID | "MASUK!" | "IN!" |

- **Visual:** Farid vs Penjaga Gol Besi (#1), low crouch and oversized gloves, slow-motion kick to the top corner; fulltime whistle.

## ACT 3 — Lunas & Season 2 Hook (00:30 – 00:42.6) | Penalty Box — frames 900–1277

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e12_09 | 834–965 | NARRATOR | "Peguam tengok telefon. Hadiah juara dan bonus Nexus Sports masuk." | "The lawyer checks his phone. The champion prize and Nexus Sports bonus land." |
| e12_10 | 967–1071 | BOS | "Tiga ratus lima ribu... kosong. Kita lunas." | "Three hundred and five grand... zero. We're clear." |
| e12_11 | 1073–1177 | NARRATOR | "Telefon Bos berdering. Divisyen 4. Lawan Karim." | "Boss's phone buzzes. Divisyen 4. Karim's club." |
| e12_12 | 1179–1259 | AZAM | "Kita akan jumpa dia. Di Divisyen 4." | "We'll meet him. In Divisyen 4." |

- **Overlays:** `LeagueTableOverlay` (MD5, champion) → GREEN `DebtTickerHUD` **RM305,000 → RM0 (LUNAS!)** → `Season2Hook` card for frames 1230–1275 (`DIVISYEN 4 / LAWAN PERTAMA: KELAB KARIM`, no CTA).

## Ending

Frame 1278: hard cut to **Buluh FC / EPISOD 12** (72 frames). No CTA.
