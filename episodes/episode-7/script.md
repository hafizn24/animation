# Episode 7 — *Menang Pertama* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:42.8 (1,284 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM331,500 → RM316,500 (DOWN — BONUS MENANG + TIKET KEK MAJU).
- **Result:** Matchday 2 — BUL 1–0 OTK (FT).
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** OTAI KAMPUNG TAK LARAT? — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 7** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e7_* MP3s after regeneration.

---

## Act 1 — Otai Mind Games — frames 0–414 | `PitchPenaltyBoxApp`

- **Visual:** Hook: a shot whistles past the post and clangs the crossbar at frame 0. Pak Din — Otai Kampung's slow, condescending veteran — mocks the RM5 wage bill. Azam answers with the season's running gag: blocks are free. Pak Din promises to wait for a mistake.
- **SFX:** bell clang on the crossbar at frame 0; kick transient; crowd murmur.
- **Cues:** bell.wav@0, kick.wav@0, crowd-small.wav@95

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_01 | 0–93 | NARRATOR | "Otai Kampung FC. Kaki lambat, mulut laju." | "Otai Kampung FC. Slow legs, fast mouths." |
| e7_02 | 95–205 | PAK DIN | "Gaji lima ringgit? Kasut aku pun lebih mahal, bro." | "Five-ringgit salary? My boots cost more, bro." |
| e7_03 | 207–311 | AZAM | "Gaji aku lima ringgit. Blok aku free. Nak rasa?" | "My salary is five ringgit. My blocks are free. Want a taste?" |
| e7_04 | 313–406 | PAK DIN | "Otai tak panas. Otai tunggu korang silap." | "Old lions stay calm. We wait for your mistake." |

## Act 2 — Gol Pertama Musim — frames 414–810 | `PitchPenaltyBoxApp`

- **Visual:** Jurulatih orders the high press. Pak Din plays the easy pass; Azam reads it five steps early, cuts it out and calls Farid's name. One touch into the top corner — net ripple, camera shake, crowd roar. Azam's cheeky one-liner lands on the dazed veteran.
- **SFX:** press shout; intercept scuff; kick + net.wav on the goal; crowd-medium roar.
- **Cues:** whistle.wav@414, crowd-medium.wav@722, kick.wav@714, net.wav@722

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_06 | 414–487 | JURULATIH | "Tinggi! Press! Paksa dia silap!" | "Push up! Press! Force the mistake!" |
| e7_07 | 489–603 | NARRATOR | "Pak Din pass biasa. Azam dah baca lima langkah awal." | "Pak Din plays the easy pass. Azam read it five steps early." |
| e7_08 | 605–642 | AZAM | "Farid! Bola!" | "Farid! Ball!" |
| e7_09 | 644–727 | NARRATOR | "Satu sentuhan... terus penjuru atas." | "One touch… straight into the top corner." |
| e7_10 | 729–802 | FARID | "AKHIRNYA! Gol pertama musim ni!" | "FINALLY! First goal of the season!" |

## Act 3 — Duit Percaya & Gaji Azam — frames 810–1212 | `PitchTouchlineApp`

- **Visual:** Full-time on the touchline: the KEK MAJU board glows over a packed gate. Bos holds a fist of ticket stubs — trust money, not pocket change. Jurulatih teases about Azam wanting a raise; Bos reveals Azam refused one until the trophy. DebtTickerHUD rolls GREEN RM331,500 -> RM316,500.
- **SFX:** long whistle; coin/cash shuffle (pen-tap pattern); green HUD bell.
- **Cues:** whistle.wav@810, pen-tap.wav@940, bell.wav@1078

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e7_12 | 810–918 | NARRATOR | "Whistle panjang. Gerbang penuh. Kek Maju menyala." | "Full-time whistle. Packed gate. The Kek Maju board lights up." |
| e7_13 | 920–1028 | BOS | "Duit tiket ni... orang datang sebab percaya kita." | "This gate money… people come because they believe." |
| e7_14 | 1030–1111 | JURULATIH | "Bos, Azam tanya bila gaji dia naik." | "Boss, Azam asked when his salary goes up." |
| e7_15 | 1113–1204 | BOS | "Dia kata — lepas juara, baru ambil duit." | "He said — after we're champions, then he takes money." |

## Ending

Frame 1212: hard cut to **Buluh FC / EPISOD 7** (72 frames). No CTA.
