# Episode 4 — *RM50,000 Untuk Karim* (Script)

> **This script is governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md),**
> including the Section 0 0–2s Pattern-Interrupt Hook Standard.

- **Runtime:** 00:00 – 00:51.0 (1,530 frames @ 30fps), 720x1280 vertical (9:16).
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*) with a smaller English translation line under every subtitle (dual subtitles MS + EN).
- **Structure:** Boss / Coach / Karim character dialogue across three scenes. No narrator-only stretches; no CTAs.
- **Subtitles:** dialogue = white sans-serif with uppercase gold speaker label (`BOS`, `JURULATIH`, `KARIM`) above the text, inside a dark rounded plate above the Shorts bottom 25% / right 15% dead zones.
- **Setting:** `ClubOffice` (`environments/club-office.js`) — matte dark plaster, warm wood floor, a warm desk lamp, a tactics whiteboard behind the Coach, and a half-open doorway behind the Boss's shoulder backlit with cooler hallway light.
- **Pacing:** max 0.4–0.6s buffer between lines, **one deliberate 1.3s dead silence** between `e4_09` and `e4_10` (room tone drops out). No other dead air.
- **Ending:** muted low bass hit on `e4_10` → hard cut to a clean black `BULOH FC / EPISOD 4` title card. **No CTA.**
- **Machine-readable source of truth:** [`audio-script.json`](./audio-script.json). The composition imports this JSON directly for all timings.

---

## Scene 1 — The Bomb Drops (00:00 – 00:04.6)
Frames 0–137 (138 frames).

- **Visual:** Frame 0 at **full brightness**, tight push-in on the Boss's hand sliding the offer sheet across the warm wood desk toward camera. First major angle cut at frame 45 (tight hand/paper insert → Boss's upper body behind the desk).
- **HookTitle:** `"RM50,000 UNTUK KARIM."` — spring pop-in for frames 0–45 inside `SafeArea`, with top pill `EP. 4 • TAWARAN PEMINDAHAN`.
- **SFX:** frame-0 paper-slide transient (`paper.wav`) synced to the paper motion; low indoor office drone bed starts under the voice.
- **Camera:** eased push-in from a low three-quarter desk angle to a closer Boss framing by frame 45; no static hold.

| Time | Frames | Subtitle | Malay text | English |
|---|---|---|---|---|
| 00:00.0 – 00:04.18 | 0–125 | BOS (white + gold label) | "Kelab Divisyen Empat baru hantar tawaran. Lima puluh ribu untuk Karim." | "A Division 4 club just sent an offer. 50K for Karim." |

---

## Scene 2 — Heart vs. Survival (00:04.6 – 00:44.5)
Frames 138–1334 (1,197 frames).

- **Visual:** shot-reverse-shot between Coach and Boss, escalating closer each exchange — medium two-shot → Coach OTS → Boss OTS → tight single on each. The tactics whiteboard sits on the wall behind the Coach (subtle `BULUH FC • RAMPIKAN PADANG` scribbles). Body language does the acting: Coach leans in and gestures; Boss keeps his hands flat on the paper, then spreads them.
- **HUD:** `TransferOfferHUD` springs in on `e4_05` (frame 549) and exits on `e4_06` (frame 897): header `TAWARAN RASMI — KELAB DIVISYEN 4`, figures `RM50,000` (Transfer Fee) and `KOS GAJI: -35%` (Salary Relief).
- **Audio:** low-tension office drone/ambience bed continues under all lines, ducked while anyone talks.
- **Camera:** hard cuts at frames 12, 135, 324, 411, 591, 780, 894, 1023 (local) — never the same static angle twice in a row.

| Time | Frames | Subtitle | Malay text | English |
|---|---|---|---|---|
| 00:04.7 – 00:08.37 | 141–251 | JURULATIH | "Kau biar betul? Musim baru nak mula, kau nak jual kapten kita?" | "Are you serious? The season's about to start and you're selling our captain?" |
| 00:09.1 – 00:14.5 | 273–435 | JURULATIH | "Karim baru dua puluh lapan. Friendly lepas dia MVP! Semua serangan kita jalan sebab dia kat tengah." | "Karim's only 28. He was MVP last friendly! Our entire attack runs through him in midfield." |
| 00:15.2 – 00:17.83 | 456–535 | BOS | "Aku tahu, coach. Aku pun tengok game tu." | "I know, coach. I watched that game too." |
| 00:18.3 – 00:23.97 | 549–719 | BOS | "Tapi tengok akaun kelab ni. Lima puluh ribu memang tak banyak, tapi cukup untuk kita bernafas." | "But look at the club's accounts. 50K isn't much, but it's enough to keep us breathing." |
| 00:24.3 – 00:29.9 | 729–897 | BOS | "Lagi satu... gaji Karim paling tinggi dalam skuad. Kalau dia keluar, kos gaji kita terus turun." | "And one more thing... Karim's our highest earner. If he leaves, our wage bill drops immediately." |
| 00:30.3 – 00:34.6 | 909–1038 | JURULATIH | "Kalau dia keluar, siapa nak kawal padang? Kita nak menang ke nak cukup syarat je?" | "If he leaves, who controls the pitch? Are we here to win or just make up the numbers?" |
| 00:35.4 – 00:41.37 | 1062–1241 | BOS | "Tak ada guna menang satu game kalau bulan depan kelab ni dah tak mampu bayar gaji budak-budak lain." | "No point winning one match if next month we can't pay the rest of the squad." |
| 00:41.7 – 00:44.5 | 1251–1335 | BOS | "Keputusan aku muktamad. Kita terima tawaran tu." | "My decision is final. We're taking the offer." |

---

## Scene 3 — The Doorway Cliffhanger (00:44.5 – 00:48.6)
Frames 1335–1457 (123 frames).

- **Audio beat:** **1.3s dead silence** (frames 1335–1373) immediately after `e4_09` — the office room tone drops out completely as the Boss reaches for the pen (a small pen-tap on the desk at frame 1356, near-silent). This is the only long pause in the episode.
- **Visual:** slow eased camera pan past the Boss's right shoulder, past the desk lamp, to the half-open office door in the back wall. Cool hallway light cuts a bright vertical wedge across the dark floor. Karim stands in the gap in his Buluh FC **Match Jersey** — `KARIM` and `8` clearly printed on the back, captain's armband on his left sleeve, boots hanging from one hand. He has heard everything. A subtle head-lift as he steps into the light.
- **SFX:** muted dramatic low bass hit (`bass-hit.wav`) fires exactly on `e4_10` (frame 1374); office drone stays out through the beat and returns at low level under Karim's line.
- **Camera:** one continuous slow pan (no cut) from the Boss's shoulder to the doorway, ending on a tight medium of Karim framed by the door.

| Time | Frames | Subtitle | Malay text | English |
|---|---|---|---|---|
| 00:45.8 – 00:47.77 | 1374–1433 | KARIM | "Bos... betul ke apa yang aku dengar tadi?" | "Boss... is what I just heard true?" |

---

## Outro Title Card (00:48.6 – 00:51.0)
Frames 1458–1529 (72 frames).

Hard cut to clean black card (no fade, no credits):

```
BULOH FC
────────────── (thin gold divider)
EPISOD 4
```

No CTA, no "komen episod 5", no credits crawl. Hold briefly, then end.

---

## Camera & Animation Standards (reminder)
- Frame 0 = full brightness + the paper-slide transient; hook overlay clears by frame 45; first cut at frame 45.
- Shot-reverse-shot escalates closer each exchange; no repeated static angle; the reveal is one slow eased pan.
- Faceless characters: exaggerated head shakes, nods, shoulder slumps, hand gestures, idle breathing. Karim's jersey back (`KARIM 8`) and armband must be clearly legible and properly lit in Scene 3.
- All overlays (`HookTitle`, `TransferOfferHUD`, bilingual `Subtitles`) stay inside `SafeArea`, clear of the Shorts bottom 25% / right 15% dead zones and never overlap each other.
- All durations are locked to the audio timings above; `audio-script.json` wins on conflict.
