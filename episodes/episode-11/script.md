# Episode 11 — *Separuh Masa Neraka* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:43.4 (1,301 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM300,000 → RM305,000 (UP — DENDA KAD + CAJ BANK).
- **Result:** Matchday 5 — BUL 0–2 BSW (HT).
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** KETINGGALAN 0–2! TAMAT? — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 11** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e11_* MP3s after regeneration.

---

## Act 1 — Mesin & Kad Kuning — frames 0–323 | `PitchCenterCircleApp`

- **Visual:** Hook: the referee flashes a yellow card straight into the lens. Besi Waja play like a machine; Kapten Malik commands in three-word bursts. The card is AZAM's — and the league fine plus bank charge it triggers (+RM5,000) is his guilt to carry. MatchHUD advances 0-1 (24') -> 0-2 (41') -> 0-2 (HT).
- **SFX:** whistle + card flash at 0; kick + net on both conceded goals; crowd murmur.
- **Cues:** whistle.wav@0, kick.wav@157, net.wav@165, kick.wav@205, net.wav@213

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e11_01 | 0–116 | NARRATOR | "Besi Waja. Tak kalah satu pun. Datang nak tanam kita." | "Besi Waja. Undefeated. Here to bury us." |
| e11_02 | 118–170 | KAPTEN MALIK | "Tekan. Halau. Ulang." | "Press. Clear. Repeat." |
| e11_03 | 172–218 | PENGADIL | "Kad kuning! Azam!" | "Yellow card! Azam!" |
| e11_04 | 220–315 | AZAM | "Hampir lima ribu sebab kad aku. Maaf, bos." | "Almost five grand over my card. I am sorry, boss." |

## Act 2 — Bilik Ganti Sunyi — frames 323–696 | `LockerRoomApp`

- **Visual:** The 5-3-2 whiteboard untouched, heads down, flickering lights. Farid says the thing nobody wants to admit — this team cannot beat Besi Waja without Karim. Danial is hollowed out. Azam refuses to let the room die, seconds before the door opens and Bos walks in without a word.
- **SFX:** door open; flickering-lamp buzz; low tense drone; one bass-hit on the door.
- **Cues:** door.wav@607, bass-hit.wav@609

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e11_06 | 323–425 | NARRATOR | "Bilik ganti sunyi. Baju basah. Lampu berkelip." | "The locker room is silent. Wet kits. Flickering lights." |
| e11_07 | 427–520 | FARID | "Kita tak boleh lawan diorang tanpa Karim." | "We cannot beat them without Karim." |
| e11_09 | 522–615 | AZAM | "Karim dah pergi. Kita masih kena berdiri." | "Karim is gone. We still have to stand." |
| e11_10 | 617–688 | NARRATOR | "Pintu buka. Bos masuk. Senyap." | "The door opens. The boss walks in. Silence." |

## Act 3 — Armband (Kovenan Diteruskan) — frames 696–1229 | `LockerRoomApp`

- **Visual:** Bos pulls Karim's gold armband from his pocket — the same armband he swore over in Episode 6. He explains the wait; Azam confesses the yellow card; Bos explains why guilt is exactly why he chose him. The handover lands, the armband goes on, hard cut. No narrator in this act.
- **SFX:** quiet room tone; soft fabric rustle on the handover; one warm bell as the band is worn.
- **Cues:** paper.wav@824, bell.wav@1127

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e11_11 | 696–804 | BOS | "Karim tinggal armband ni. Aku tunggu siapa layak." | "Karim left this armband. I waited to see who deserves it." |
| e11_12 | 806–885 | BOS | "Azam. Hari ni kau kapten Buluh FC." | "Azam. Today you are the captain of Buluh FC." |
| e11_13 | 887–987 | AZAM | "Kad kuning aku tadi hampir tenggelamkan kita." | "My yellow card almost sank us today." |
| e11_14 | 989–1105 | BOS | "Sebab tu aku pilih kau. Yang rasa berat takkan silap." | "That is why I chose you. The one who feels the weight never errs." |
| e11_15 | 1107–1221 | AZAM | "Gaji aku lima ringgit. Baju ni aku jaga sampai mati." | "My salary is five ringgit. This shirt I guard till I die." |

## Ending

Frame 1229: hard cut to **Buluh FC / EPISOD 11** (72 frames). No CTA.
