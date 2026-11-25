# Episode 9 — *Hutang Naik Balik* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:44.1 (1,324 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM296,500 → RM321,500 (UP — PINJAMAN KECEMASAN LAMPU STADIUM).
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** HUTANG NAIK BALIK?! — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 9** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e9_* MP3s after regeneration.

---

## Act 1 — Latihan Malam & Letupan — frames 0–442 | `PitchCrisisNightApp`

- **Visual:** Frame 0: night training in full floodlight — Azam's drill squad moving. Mid-scene the hero tower blows: sparks, smoke, blackness, silence. Danial's panic, Jurulatih's bad news, and the narrator's ultimatum: pay twenty-five grand before matchday four or forfeit.
- **SFX:** electrical pop + sparks at the explosion; empty-night ambience; bass-hit on the blackout.
- **Cues:** bass-hit.wav@18, whistle.wav@24

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e9_01 | 0–95 | NARRATOR | "Sepuluh malam latihan extra. Lampu terang." | "Ten nights of extra training. Floodlights blazing." |
| e9_02 | 97–188 | AZAM | "Lagi sekali! Blok, halau, langkah balik!" | "Again! Block, clear, step back!" |
| e9_03 | 190–252 | DANIAL | "Eh?! Lampu! LAMPU PADAM!!" | "Huh?! The lights! LIGHTS OUT!!" |
| e9_04 | 254–353 | JURULATIH | "Tiang letup. Padang tutup sampai kita bayar." | "The pylon blew. Pitch closed until we pay." |
| e9_05 | 355–434 | NARRATOR | "Dua puluh lima ribu. Atau forfeit." | "Twenty-five grand. Or forfeit." |

## Act 2 — Telefon yang Bos Tak Nak Call — frames 442–784 | `ClubOfficeApp`

- **Visual:** The office at its lowest. Bos lifts the phone to the one name he hoped never to call again. The Peguam's cold proverb lands — but one degree warmer: the kids training at night earned that loan. Bos vows it is the last call he will ever make.
- **SFX:** phone ring + pickup; pen-tap on the terms; low office drone.
- **Cues:** pen-tap.wav@676, stamp.wav@692

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e9_07 | 442–546 | BOS | "Peguam. Lampu kelab aku mati. Top-up satu lagi." | "Lawyer. My club's lights are dead. One more top-up." |
| e9_08 | 548–650 | PEGUAM | "Satu langkah depan, dua langkah belakang, bos." | "One step forward, two steps back, boss." |
| e9_09 | 652–776 | PEGUAM | "Tapi budak-budak kau latihan malam. Duit aku hantar esok." | "But your kids training at night? The money goes out tomorrow." |

## Act 3 — Lampu Balik, Hutang Naik — frames 784–1252 | `PitchCrisisNightApp`

- **Visual:** Two days later: the floodlights blaze again over the same penalty box, fully lit. The squad stares up at the lamps they now owe. Azam asks the question, Bos owns the answer, and Azam makes the season's promise: these lights get paid back with a trophy. DebtTickerHUD slams RED RM296,500 -> RM321,500.
- **SFX:** floodlamp hum up; pen-tap ticks with the HUD; bass-hit on the red spike.
- **Cues:** bass-hit.wav@1118, crowd-small.wav@1056

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e9_11 | 784–884 | NARRATOR | "Dua hari lepas. Lampu balik. Hutang pun naik." | "Two days later. The lights are back. So is the debt." |
| e9_12 | 886–946 | AZAM | "Lampu ni mahal kan, bos?" | "These lights cost a fortune, right, boss?" |
| e9_13 | 948–1054 | BOS | "Mahal. Tapi sebab korang nak belajar, aku bayar." | "Expensive. But you wanted to learn, so I paid." |
| e9_14 | 1056–1151 | AZAM | "Lampu ni kita bayar balik... dengan trofi." | "We'll pay these lights back… with a trophy." |
| e9_15 | 1153–1244 | NARRATOR | "RM321,500. Tapi kelab ni tak mudah mati." | "RM321,500. But this club does not die easily." |

## Ending

Frame 1252: hard cut to **Buluh FC / EPISOD 9** (72 frames). No CTA.
