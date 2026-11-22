# Episode 5 — *Pengorbanan & Nombor 7 Baru* (Script)

> **This script is governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md),**
> including the Section 0 0–2s Pattern-Interrupt Hook Standard.

- **Runtime:** 00:00 – 01:12.0 (2,160 frames @ 30fps), 1080x1920 vertical (9:16). Episode-specific upgrade from the series' 720x1280 master; all overlay styling is the same design scaled 1.5x.
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*) with a smaller English translation line under every subtitle (dual subtitles MS + EN).
- **Structure:** Bos / Karim / Jurulatih / two teammates / Azam character dialogue across three acts. No narrator-only stretches. **No CTAs, no outro prompts.**
- **Subtitles:** white sans-serif with an uppercase gold speaker label (`BOS`, `KARIM`, `JURULATIH`, `Rakan 1`, `Rakan 2`, `AZAM`) inside a dark rounded plate, scaled for 1080 width, kept above the Shorts bottom-25% / right-15% dead zones.
- **Settings:** Act 1 — `ClubOffice` (`environments/club-office.js`, reused directly from Ep. 4). Acts 2 & 3 — `LockerRoomApp` (`environments/locker-room.js`, the existing squad set from Ep. 1). No new locker-room environment was needed.
- **Pacing:** all frames locked to [`audio-script.json`](./audio-script.json). Longest no-dialogue stretch is the 8.5s debt-ticker beat, which is *not* dead air: it is carried by a continuous tense BGM bed, a cash/stamp tick sequence, a door click and an animated `DebtTickerHUD`. Every other inter-line gap is <= 0.5s.
- **Hook:** frame 0 is already bright and moving — tight, pushed-in close-up on Karim in the half-open doorway, boots in hand, eyes locked on the `RM50,000` offer sheet. Sharp SFX transient at frame 0. `HookTitle` spring-pops for frames 0–45 and clears before the first cut.
- **J-cut:** Teammate 1's first line (`e5_06`) begins at frame 825 — **0.5s before** the visual cut to Act 2 at frame 840 — so retention does not dip across the transition.
- **Ending:** 0.3s beat on Coach's stunned face, then a **hard cut to pure black** with a sharp comedic percussion hit. No title card, no credits, no CTA. (This is an intentional, punchline-driven override of the series' usual `BULOH FC / EPISOD X` card.)
- **Machine-readable source of truth:** [`audio-script.json`](./audio-script.json). The composition imports this JSON directly for all timings.

---

## ACT 1 — Karim's Sacrifice (00:00 – 00:28) | `ClubOffice`

Frames 0–839 (840 frames).

### Shot 1 — Tight doorway close-up (00:00 – 00:04.1), frames 0–129
- **Visual:** full brightness from frame 0. Tight push-in on Karim (#8) framed in the half-open, cooler-backlit doorway, boots hanging from his left hand. His eyes are locked on the `RM50,000` offer paper on the desk. First camera cut lands at frame 45.
- **HookTitle:** `"JANGAN JUAL KAPTEN."` — spring pop-in, top pill `EP. 5 • PENGORBANAN`, frames 0–45, inside `SafeArea`.
- **SFX:** frame-0 bass/paper transient; low office drone bed starts under the voice.
- **Audio / subtitles:**

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_01 | 00:00.0 – 00:04.1 | 0–123 | BOS | "Karim… jangan salah faham. Aku takkan jual kapten aku." | "Karim… don't get me wrong. I'm not selling my captain." |

### Shot 2 — The armband on the desk (00:04.4 – 00:12.1), frames 130–364
- **Visual:** slow eased push-in following Karim as he walks calmly to the desk and lays his **captain armband** down beside the offer paper. He does not look up. Shoulders heavy, deliberate placement.
- **SFX:** soft paper/armband scuff as it touches the desk; drone ducks under his lines.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_02 | 00:04.4 – 00:07.8 | 132–234 | KARIM | "Hutang kita dekat empat ratus ribu, bos." | "Our debt is almost four hundred thousand, boss." |
| e5_03 | 00:08.1 – 00:12.1 | 243–363 | KARIM | "Kalau kelab ni mati, semua habis. Jual aku." | "If this club dies, it's all over. Sell me." |

### Shot 3 — Over the Manager's shoulder (00:12.5 – 00:19.5), frames 365–584
- **Visual:** over-the-shoulder from Bos as Karim turns back toward the doorway. Karim glances back once, gives the smallest nod, and keeps walking. Bos's hand hovers over the pen but never takes it.
- **Camera:** two hard cuts (Bos OTS → Karim's retreating back → tight Bos reaction).

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_04 | 00:12.5 – 00:14.3 | 375–429 | BOS | "Kau pasti, Rim?" | "You sure, Rim?" |
| e5_05 | 00:14.7 – 00:19.5 | 441–585 | KARIM | "Bawa Buluh FC naik Divisyen 1." | "Take Buluh FC to Division 1." |

### Shot 4 — Door closes, debt ticks down (00:19.5 – 00:28.0), frames 585–839
- **Visual:** the door clicks shut (frame ~600). Camera pans smoothly to the `DebtTickerHUD`, which springs in and animates through four states with cash/tick SFX:
  1. `TAWARAN DITERIMA: RM50,000` (stamp hit)
  2. `HUTANG KELAB: RM381,500` (ticks down digit-by-digit)
  3. `**RM331,500**` (final figure lands, gold flash)
  4. `KOS GAJI: -35%` (holds through the cut)
- **SFX:** `stamp.wav` → three `pen-tap.wav` ticks → `bell.wav` on the final figure; tense underscore swells under the whole beat.
- **J-cut:** `e5_06` (Teammate 1) starts at frame 825 — over the tail of this shot — 15 frames before the visual cut.

---

## ACT 2 — The #7 Rumor (00:28 – 00:44) | `LockerRoomApp`

Frames 840–1319 (480 frames).

- **[00:28.0 – 00:28.8] Transition:** `whoosh.wav` + a snappy `ESOKNYA...` title card overlay for 24 frames (0.8s), rendered over the start of the locker-room shot.
- **[00:28.8 – 00:36.0] Shot 5:** medium two-shot of Rakan 1 & Rakan 2 hyped on the bench, Jurulatih arms-crossed nearby. Locker banks and hanging red/white kits behind them.
- **[00:36.0 – 00:44.0] Shot 6:** cut to Bos smiling subtly near the locker-room door, Jurulatih eyeing him suspiciously. Slow push toward the door handle.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_06* | 00:27.5 – 00:31.3 | 825–940 | Rakan 1 | "Weh, dengar cerita bos dah sign pemain nombor 7 baru!" | "Yo, heard the boss just signed a new number 7!" |
| e5_07 | 00:31.7 – 00:35.7 | 951–1071 | Rakan 2 | "Fuhh, baru jual Karim lima puluh ribu… confirm striker padu ni!" | "Whoa, we just sold Karim for fifty grand… gotta be a killer striker!" |
| e5_08 | 00:36.1 – 00:39.3 | 1083–1179 | JURULATIH | "Siapa kau beli ni, bos?" | "Who did you buy, boss?" |
| e5_09 | 00:39.7 – 00:42.9 | 1191–1287 | BOS | "Tengok sendiri." | "See for yourself." |

\* `e5_06` audio starts at frame 825 (J-cut); its subtitle starts at frame 840 when the visual cut lands.

---

## ACT 3 — Azam's Reveal & the RM5 Punchline (00:44 – 01:10.9) | `LockerRoomApp`

Frames 1320–2126 (807 frames).

### Shot 7 — Door bursts open (00:44 – 00:49.8), frames 1320–1494
- **Visual:** dramatic low-angle backlight on the locker-room door. `door.wav` + `bass-hit.wav` + a small crowd cheer fire as it bursts open. **Azam (#7)** strides in first, beaming, confident quiff silhouette, chest out, one hand cocked at his hip.
- **Easter egg:** a subtle stylized comment card pops for 1.5s (frames 1335–1380), upper-left of centre, clear of the right-side Shorts buttons and the subtitle plate:
  `@akudingin-d1f — "Pertama"` / `Azam • #7 • Defender • Gaji RM5`. It is a fan-inspired *in-world* card only. **No "comment below" CTA.**
- **Audio / subtitles:**

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_10 | 00:44.5 – 00:46.1 | 1335–1383 | AZAM | "PERTAMA!" | "FIRST!" |
| e5_11 | 00:46.6 – 00:49.8 | 1398–1494 | AZAM | "Assalamualaikum. Saya Azam. Defender baru." | "Assalamualaikum. I'm Azam. The new defender." |

### Shot 8 — Whip-pan to disbelief (00:50.3 – 00:55.8), frames 1495–1674
- **Visual:** fast `whoosh` whip-pan to Rakan 1's confused face, then whip back to Azam — dead serious, slight head tilt, adjusting his #7 jersey.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_12 | 00:50.3 – 00:53.5 | 1509–1605 | Rakan 1 | "Kejap… defender pakai nombor tujuh?!" | "Wait… a defender wearing number seven?!" |
| e5_13 | 00:54.0 – 00:55.8 | 1620–1674 | AZAM | "Baru lawan gerun." | "So the opponents get scared." |

### Shot 9 — The RM5 punchline (00:56.5 – 01:10.6), frames 1675–2118
- **Visual:** tight two-shot / shot-reverse-shot between Jurulatih and Bos; Azam slightly out of focus in the background, flexing his #7 jersey. Jurulatih leans in, nervous. Bos does not blink. On the last line Bos holds up the tablet/HUD flashing `HUTANG: RM331,500` while the debt ticker re-prises briefly.
- **Audio / subtitles:**

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_14 | 00:56.5 – 01:00.9 | 1695–1827 | JURULATIH | "Bos… kita baru dapat lima puluh ribu. Berapa gaji budak ni?" | "Boss… we just got fifty thousand. What's this kid's salary?" |
| e5_15 | 01:01.5 – 01:03.2 | 1845–1896 | BOS | "Lima ringgit." | "Five ringgit." |
| e5_16 | 01:03.8 – 01:05.7 | 1914–1971 | JURULATIH | "Lima ribu?!" | "Five thousand?!" |
| e5_17 | 01:06.4 – 01:10.6 | 1992–2118 | BOS | "Lima ringgit. Duit Karim semua bayar hutang." | "Five ringgit. Karim's money all went to debt." |

### Ending — hard cut to black (01:10.9), frames 2119–2159
- 0.3s beat (frames 2119–2127) on Jurulatih's stunned face, then a **hard cut to pure black** with a sharp comedic percussion hit (`kick.wav` + `bass-hit.wav`). 33 frames of black. No title card, no credits, no CTA.

---

## Camera & Animation Standards (reminder)
- Frame 0 = full brightness + transient; hook clears by frame 45; first cut at frame 45.
- No repeated static angle; shot-reverse-shot escalates closer each exchange; the reveal is a low-angle push, not a hold.
- Faceless cast: exaggerate head shakes, nods, shoulder slumps, gestures, breathing. Azam's `AZAM 7` back panel and front number must stay legible and properly lit in the reveal.
- Debt ticker, comment card and bilingual subtitles all sit inside the 1080x1920 safe zones: right padding >= 162px (15%) and bottom padding >= 480px (25%), with no overlap between overlays.
- All durations are locked to `audio-script.json`; the JSON wins on conflict.
