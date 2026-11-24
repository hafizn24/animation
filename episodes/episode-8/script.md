# Episode 8 — *Duit vs Maruah* (Script)

> **Reworked Season 1 script.** Governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md), including the Section 0 0–2s hook standard. Dialogue carries the story; the narrator only bridges. No HUD digits are spoken — numbers live in the overlays.

- **Runtime:** 00:00 – 00:44.2 (1,325 frames @ 30fps), 1080×1920 vertical.
- **Debt:** RM316,500 → RM296,500 (DOWN — BONUS MENANG MATCHDAY 3).
- **Result:** Matchday 3 — BUL 2–1 VAN (88').
- **Structure:** narrator bridges only; every act is carried by named character dialogue. **No CTAs.**
- **Hook:** RASUAH KELAB HUTANG? — spring-pop frames 0–45, first cut at frame 54, frame-0 SFX transient.
- **Ending:** hard cut to the standard 72-frame **Buluh FC / EPISOD 8** EndCard. No credits, no CTA.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json) and `story/season1-debt.json`. The JSON wins on conflict; `npm run retime` rebuilds all frames from the measured e8_* MP3s after regeneration.

---

## Act 1 — Sampul dalam Tunnel — frames 0–462 | `MatchTunnelApp`

- **Visual:** Hook: Rayyan tosses a thick envelope onto Bos's chest at frame 0. Vanguard Elite's flash winger offers the debt an easy exit; Bos's answer is the season's spine — if Buluh FC sinks, it sinks standing — and he pockets the envelope as evidence instead of throwing it back.
- **SFX:** paper slap at frame 0; tunnel reverb footfalls; low tense drone.
- **Cues:** paper.wav@0, bass-hit.wav@328

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_01 | 0–114 | NARRATOR | "Vanguard Elite. Kasut emas... dan satu sampul tebal." | "Vanguard Elite. Gold boots… and one thick envelope." |
| e8_02 | 116–224 | RAYYAN | "Kelab kau hutang kan? Ambil ni. Kalah je hari ni." | "Your club's in debt, right? Take it. Just lose today." |
| e8_03 | 226–332 | BOS | "Kau fikir kami jual maruah sekali dengan hutang?" | "You think we sold our pride along with the debt?" |
| e8_05 | 334–454 | BOS | "Kalau karam, kami karam berdiri. Ni aku simpan — bukti." | "If we sink, we sink standing. I keep this — evidence." |

## Act 2 — Kelas vs Kelas — frames 462–945 | `PitchPenaltyBoxApp`

- **Visual:** Rayyan plays pretty — feints like a TV ad — and scores first "for the envelope". Azam answers with his signature line and shuts every lane. Two counters, two Farid goals: 1-1, then 2-1. Pride is not for sale — goals are.
- **SFX:** kick + net on all three goals; crowd-medium; whistle on the winner.
- **Cues:** whistle.wav@462, kick.wav@636, net.wav@644, kick.wav@752, net.wav@760, kick.wav@843, net.wav@851, crowd-medium.wav@851

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_06 | 462–543 | NARRATOR | "Rayyan main cantik. Macam iklan TV." | "Rayyan plays pretty. Like a TV advert." |
| e8_07 | 545–649 | RAYYAN | "Nampak beza kelas? Bukan padang kampung, budak." | "See the class gap? Not a village pitch, kid." |
| e8_09 | 651–719 | AZAM | "Kelas? Saya jaga kelas, bro." | "Class? I guard the class, bro." |
| e8_10 | 721–765 | AZAM | "Farid! Sekarang!" | "Farid! Now!" |
| e8_12 | 767–856 | NARRATOR | "Counter terakhir. Farid, sekali lagi..." | "Last counter. Farid, one more time…" |
| e8_13 | 858–937 | FARID | "MARUAH TAK DIJUAL — GOL JE DIJUAL!" | "PRIDE'S NOT FOR SALE — GOALS ARE!" |

## Act 3 — Bawah Tiga Ratus — frames 945–1253 | `PitchTouchlineApp`

- **Visual:** Full-time table: Buluh FC climb on two straight wins — this one won with pride. LeagueTableOverlay (MD3) shows the climb; DebtTickerHUD rolls GREEN RM316,500 -> RM296,500. No digits are spoken — the HUD says it all.
- **SFX:** long whistle; green HUD bell; warm crowd bed.
- **Cues:** whistle.wav@945, bell.wav@1119

| Line | Frames | Speaker | Malay | English |
|---|---|---|---|---|
| e8_14 | 945–1044 | NARRATOR | "Dua menang berturut. Buluh FC mula memanjat." | "Two straight wins. Buluh FC starts climbing." |
| e8_15 | 1046–1125 | JURULATIH | "Yang ni menang dengan maruah, bos." | "This one we won with pride, boss." |
| e8_16 | 1127–1245 | BOS | "Sampul tu dalam laci aku. Bukti kita tak jual apa-apa." | "The envelope is in my drawer. Proof we sold nothing." |

## Ending

Frame 1253: hard cut to **Buluh FC / EPISOD 8** (72 frames). No CTA.
