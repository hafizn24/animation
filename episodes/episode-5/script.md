# Episode 5 — *Pengorbanan & Nombor 7 Baru* (Script)

> **This script is governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md),**
> including the Section 0 0–2s Pattern-Interrupt Hook Standard.

- **Runtime:** 00:00 – 00:45.1 (1,353 frames @ 30fps), 1080x1920 vertical (9:16).
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*) with a smaller English translation line under every subtitle (dual subtitles MS + EN).
- **Structure:** Bos / Karim / Jurulatih / two teammates / Azam character dialogue across three acts. No narrator-only stretches. **No CTAs, no outro prompts.**
- **Subtitles:** white sans-serif with an uppercase gold speaker label (`BOS`, `KARIM`, `JURULATIH`, `Rakan 1`, `Rakan 2`, `AZAM`) inside a dark rounded plate, scaled 1.5x for 1080 width, clear of the Shorts bottom-25% / right-15% dead zones.
- **Settings:** Act 1 — `ClubOffice` (`environments/club-office.js`, reused from Ep. 4). Acts 2 & 3 — `LockerRoomApp` (`environments/locker-room.js`, reused from Ep. 1). No new environment was needed.
- **Pacing:** all frames are derived from the **natural 1.0x** measured durations of `e5_01`–`e5_17` — no time stretching, both ends of every clip silence-trimmed. Standard dialogue gap 5–8 frames (0.17–0.27s); the armband beat is 12 frames (0.4s); the final three lines are rapid-fire at 3 frames (0.1s) apart, followed by an 8-frame (0.25s) stunned beat and a hard cut to black.
- **Hook:** frame 0 is already bright and moving — a tight, pushed-in close-up on Karim (#8) in the half-open doorway, eyes locked on the `RM50,000` offer sheet. Sharp SFX transient at frame 0; `HookTitle` spring-pops for frames 0–45 and clears before the first cut.
- **J-cut:** Teammate 1's first line (`e5_06`) begins at frame 494 — **0.47s before** the visual cut to Act 2 at frame 508 — landing just after the debt counter reaches `RM331,500`.
- **Ending:** 0.25s beat on Coach's stunned face, then a **hard cut to pure black** with a sharp comedic percussion hit. No title card, no credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json). The composition imports this JSON directly for all timings.

---

## ACT 1 — Karim's Sacrifice (00:00.0 – 00:16.9) | `ClubOffice`

Frames 0–507 (508 frames).

### Shot 1 — Tight doorway close-up (frames 0–148)
- **Visual:** full brightness from frame 0. Tight push-in on Karim (#8) framed in the half-open, cooler-backlit doorway. His eyes are locked on the `RM50,000` offer paper on the desk. The carried boots prop is hidden — no detached boots float beside him or clip the desk. First camera cut lands at frame 45.
- **HookTitle:** `"JANGAN JUAL KAPTEN."` — spring pop-in, top pill `EP. 5 • PENGORBANAN`, frames 0–45, inside `SafeArea`.
- **SFX:** frame-0 transient; low office drone bed starts under the voice.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_01 | 00:00.0 – 00:04.7 | 0–141 | BOS | "Karim… jangan salah faham. Aku takkan jual kapten aku." | "Karim… don't get me wrong. I'm not selling my captain." |

### Shot 2 — The armband on the desk (frames 149–322)
- **Visual:** slow eased push-in following Karim as he walks calmly to the desk. A small gold **captain armband** prop settles onto the wood surface **beside** the offer paper; a dedicated desk insert makes the placement clearly legible. He does not look up. Shoulders heavy, deliberate placement. The 12-frame beat between `e5_02` and `e5_03` is the emotional pause.
- **SFX:** soft paper/armband scuff as it touches the desk; drone ducks under his lines.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_02 | 00:05.0 – 00:07.0 | 149–209 | KARIM | "Hutang kita dekat empat ratus ribu, bos." | "Our debt is almost four hundred thousand, boss." |
| e5_03 | 00:07.4 – 00:10.5 | 221–315 | KARIM | "Kalau kelab ni mati, semua habis. Jual aku." | "If this club dies, it's all over. Sell me." |

### Shot 3 — Over the Manager's shoulder (frames 323–417)
- **Visual:** over-the-shoulder from Bos as Karim turns back toward the doorway. Karim glances back once, gives the smallest nod, and keeps walking. Bos's hand hovers over the pen but never takes it.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_04 | 00:10.8 – 00:11.6 | 323–348 | BOS | "Kau pasti, Rim?" | "You sure, Rim?" |
| e5_05 | 00:11.9 – 00:13.9 | 356–417 | KARIM | "Bawa Buluh FC naik Divisyen 1." | "Take Buluh FC to Division 1." |

### Shot 4 — Door closes, debt ticks down (frames 418–507)
- **Visual:** the door clicks shut; camera pans smoothly to the `DebtTickerHUD`, which springs in for **90 frames (3.0s)** with:
  1. `TAWARAN DITERIMA: RM50,000` + `DITERIMA` stamp,
  2. `HUTANG KELAB: RM381,500` ticking down to `RM331,500`,
  3. `KOS GAJI: -35%` holding through the cut.
- **SFX:** `stamp.wav` → three `pen-tap.wav` ticks → `bell.wav` as the counter lands.
- **J-cut:** `e5_06` starts at frame 494, 14 frames before the visual cut, right after the counter lands at frame 492.

---

## ACT 2 — The #7 Rumor (00:16.9 – 00:27.6) | `LockerRoomApp`

Frames 508–827 (320 frames).

- **Transition:** `whoosh.wav` + a snappy `ESOKNYA...` card for **16 frames (0.53s)** over the start of the locker-room shot.
- **Shot 5:** medium two-shot of hyped teammates facing camera; Jurulatih arms-crossed nearby.
- **Shot 6:** Bos is staged **three-quarter front** to the squad and camera (never a back-of-head/lockers silhouette) for both *"Siapa kau beli ni, bos?"* and *"Tengok sendiri."*, with a brief suspicious-Jurulatih insert. Slow push toward the door handle.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_06* | 00:16.9 – 00:19.8 | 508–593 | Rakan 1 | "Weh, dengar cerita bos dah sign pemain nombor 7 baru!" | "Yo, heard the boss just signed a new number 7!" |
| e5_07 | 00:20.0 – 00:24.1 | 601–724 | Rakan 2 | "Fuhh, baru jual Karim lima puluh ribu… confirm striker padu ni!" | "Whoa, we just sold Karim for fifty grand… gotta be a killer striker!" |
| e5_08 | 00:24.4 – 00:25.5 | 732–765 | JURULATIH | "Siapa kau beli ni, bos?" | "Who did you buy, boss?" |
| e5_09 | 00:25.8 – 00:26.4 | 773–792 | BOS | "Tengok sendiri." | "See for yourself." |

\* `e5_06` audio starts at frame 494 (J-cut); its subtitle starts at frame 508 when the visual cut lands.

---

## ACT 3 — Azam's Reveal & the RM5 Punchline (00:27.6 – 00:43.8) | `LockerRoomApp`

Frames 828–1312 (485 frames).

### Shot 7 — Door bursts open (frames 828–861)
- **Visual:** dramatic low-angle backlight; `door.wav` + `bass-hit.wav` + a small crowd cheer as the door bursts open. **Azam (#7)** strides in beaming with a swept quiff, chest out, no T-pose.
- **Easter egg:** the stylized comment card pops for **45 frames (1.5s)** at frames 836–881: `@akudingin-d1f — "Pertama"` / `Azam • #7 • Defender • Gaji RM5`. In-world fan detail only — **no CTA**.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_10 | 00:27.9 – 00:28.3 | 836–850 | AZAM | "PERTAMA!" | "FIRST!" |
| e5_11 | 00:28.7 – 00:31.3 | 862–940 | AZAM | "Assalamualaikum. Saya Azam. Defender baru." | "Assalamualaikum. I'm Azam. The new defender." |

### Shot 8 — Whip-pan to disbelief (frames 948–1059)
- **Visual:** fast `whoosh` whip-pan to Rakan 1's confused face, then back to dead-serious Azam with a slight head tilt.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_12 | 00:31.6 – 00:33.8 | 948–1014 | Rakan 1 | "Kejap… defender pakai nombor tujuh?!" | "Wait… a defender wearing number seven?!" |
| e5_13 | 00:34.1 – 00:34.9 | 1022–1048 | AZAM | "Baru lawan gerun." | "So the opponents get scared." |

### Shot 9 — The RM5 punchline (frames 1060–1305)
- **Visual:** a clean **45-degree front-quarter two-shot / shot-reverse-shot** keeps both Jurulatih's shocked lean and Bos's deadpan face visible to camera. Immediately after *"Baru lawan gerun."*, Azam eases into a relaxed **`idle`** pose — arms lowered at his sides, subtle breathing and weight shift — and stays there, slightly out of focus in the background. No flex/T-pose anywhere in this section. On the last line Bos holds up the tablet/HUD flashing `HUTANG: RM331,500`.
- **Audio:** the last three lines are 3 frames (0.1s) apart for rapid-fire comic timing.

| Line | Time | Frames | Speaker | Malay | English |
|---|---|---|---|---|---|
| e5_14 | 00:35.3 – 00:38.9 | 1060–1168 | JURULATIH | "Bos… kita baru dapat lima puluh ribu. Berapa gaji budak ni?" | "Boss… we just got fifty thousand. What's this kid's salary?" |
| e5_15 | 00:39.3 – 00:40.0 | 1180–1201 | BOS | "Lima ringgit." | "Five ringgit." |
| e5_16 | 00:40.1 – 00:40.7 | 1204–1221 | JURULATIH | "Lima ribu?!" | "Five thousand?!" |
| e5_17 | 00:40.8 – 00:43.5 | 1224–1305 | BOS | "Lima ringgit. Duit Karim semua bayar hutang." | "Five ringgit. Karim's money all went to debt." |

### Ending — hard cut to black (frame 1313)
- 8-frame (0.25s) stunned beat, then a **hard cut to pure black** with `kick.wav` + `bass-hit.wav` (40 frames of black). No title card, no credits, no CTA.

---

## Camera & Animation Standards (reminder)
- Frame 0 = full brightness + transient; hook clears by frame 45; first cut at frame 45.
- No repeated static angle; shot-reverse-shot escalates closer each exchange; the reveal is a low-angle push, not a hold.
- Faceless cast: exaggerate head shakes, nods, shoulder slumps, gestures, breathing. Azam's `AZAM 7` panels stay legible in the reveal; both suit characters face the camera in the final two-shot.
- Debt ticker, comment card and bilingual subtitles stay inside the 1080x1920 safe zones: right padding >= 162px (15%) and bottom padding >= 480px (25%), with no overlap.
- All durations are locked to `audio-script.json`; the JSON wins on conflict.
