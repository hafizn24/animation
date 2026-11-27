# Episode 7 — *12 Pasukan, Satu Impian* (Script)

> **This script is governed by [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md),**
> including the Section 0 0–2s Pattern-Interrupt Hook Standard.

- **Runtime:** ~00:41.9 (1,257 frames @ 30fps, locked to measured `e7_*` audio durations), 1080x1920 vertical (9:16).
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*) with a smaller English translation line under every subtitle (dual subtitles MS + EN).
- **Structure:** Jurulatih / Narrator / Bos / Rizal / Azam across 5 scenes. Two named characters exchange lines (Rizal ↔ Azam). **No CTAs, no outro prompts.**
- **Subtitles:**
  - Character dialogue: white sans-serif with uppercase gold speaker label (`JURULATIH`, `BOS`, `RIZAL`, `AZAM`).
  - Narration: italic warm gold (`#d8b26a`) serif (Georgia), no speaker label.
- **Settings:**
  - Scene 1 & Scene 4 & Scene 5 — `StadiumApp` (`environments/stadium.js`) with pre-season training props: 6 orange cone drill lanes, 3 footballs, sideline water crate.
  - Scene 2 — `Episode6OfficeApp` (`environments/episode6-office.js`) with `BossApp` (dark `charcoalOwner` blazer) and `LawyerApp`; desk carries the RM326,500 finance ledger, the conditional seizure-freeze agreement and the **unworn captain's armband**.
  - Scene 3 — `LockerRoomApp` (`environments/locker-room.js`) with `SoccerOutfitApp` (Rizal **#10**) and `AzamApp` (**#7**); the bench carries the unworn captain's armband and the notice board lists `PERLAWANAN 1: BULUH FC v HARIMAU LEMBAH FC`.
- **Continuity (unchanged from Episode 6):**
  - Debt: **RM326,500** — no result, promotion or verbal sponsor offer changes it.
  - Karim: departed in Episode 5, **never shown**.
  - Captaincy: **vacant** — no Buluh FC player wears an armband (`armband.visible = false`).
  - League: 12 clubs, single round-robin, 11 matches, champion promoted to Division 4 — see [`division-5-clubs.md`](../../remotion/story/division-5-clubs.md).
  - Stadium: seizure frozen under `PERJANJIAN BERSYARAT` until the end of the season.

**Machine-readable source of truth:** [`audio-script.json`](./audio-script.json).

---

## Scene 1 — Matchday Mindset (00:00.0 – 00:04.9) | `StadiumApp`

- **Visual:** Frame 0 is already bright and moving — OTS wide-medium over Jurulatih (full body, `talk` pose, live arm gesture) into two orange cone drill lanes with footballs on the grass and the squad jogging behind. Hard cut on frame 45 to a distinct reverse angle on Azam (**#7**) and Rizal (**#10**) mid-drill. Sharp whistle SFX (`whistle.wav`) on frame 0 to guarantee the audio transient; `whoosh.wav` on every scene cut.
- **HookTitle:** `"12 PASUKAN, SATU IMPIAN."` — spring pop-in, top pill `EP. 7 • 12 PASUKAN, SATU IMPIAN`, frames 0–45, inside `SafeArea`.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e7_01 | JURULATIH | "Gerak, gerak! Musim ni kita takde masa nak main-main. Cepat sikit!" | "Move, move! This season we have no time to mess around. Faster!" |

---

## Scene 2 — The Agreement (00:04.9 – 00:15.2) | `ClubOfficeApp`

- **Visual:** Cut to the Episode 6 office set. Boss stands over the desk in his dark blazer with the RM326,500 finance ledger, the `PERJANJIAN BERSYARAT` paper and the unworn captain's armband in frame, all above the subtitle plate. Lawyer sits opposite. `agreementHud` (frames 170–435) stacks `PEMBEKUAN PENYITAAN STADIUM` / `SAH SEHINGGA TAMAT MUSIM` / `BAKI HUTANG: RM326,500` with a `paper.wav` rustle on entry.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e7_02 | NARRATOR | "Divisyen lima. Dua belas kelab, satu tempat je naik. Tekanan baru." | "Division five. Twelve clubs, only one goes up. New pressure." |
| e7_03 | BOS | "Perjanjian cakap jelas. Stadium beku sampai musim tamat. Kita takde pilihan." | "The agreement is clear. The stadium stays frozen until the season ends. We have no choice." |

---

## Scene 3 — The Rumour (00:15.2 – 00:25.0) | `LockerRoomApp`

- **Visual:** Cut to the locker room. Rizal (**#10**, print `RIZAL`) leans in with the rumour, the Matchday 1 fixture notice board (`BULUH FC v HARIMAU LEMBAH FC`) fully readable behind him; Azam (**#7**) answers without looking up from his boots, the unworn captain's armband visible on the bench behind him. Camera racks from Rizal to Azam on the exchange, sightlines clear of the treatment table.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e7_04 | RIZAL | "Weh, dengar tak? Metro Selatan beli striker luar. Siapa nak lawan?" | "Hey, did you hear? Metro Selatan bought a foreign striker. Who's going to face them?" |
| e7_05 | AZAM | "Dengar. Kita lawan diorang kat padang, bukan kat kedai kopi." | "I heard. We face them on the pitch, not at the coffee shop." |

---

## Scene 4 — Like Matchday (00:25.0 – 00:34.1) | `StadiumApp`

- **Visual:** Wide of the whole drill grid — Boss watches from the sideline technical area outside the chalk while the squad keeps jogging between the cone lanes; he steps in for the last word, hard cut to a medium that keeps his chest above the subtitle zone.

| Line | Speaker | Malay | English |
|---|---|---|---|
| e7_06 | JURULATIH | "Latihan ni macam matchday. Satu silap, terus kena marah." | "This training is like matchday. One mistake and you get an earful." |
| e7_07 | BOS | "Tiket semua dah jual. Tinggal kau orang kat padang. Buktikan dekat aku." | "The tickets are all sold. All that's left is you on the pitch. Prove it to me." |

---

## Scene 5 — The League & End Card (00:34.1 – 00:41.9) | `StadiumApp` + EndCard

- **Visual:** Brand-new heroic low-angle dolly push on Rizal (**#10**), Azam (**#7**) and the squad looking ahead — Jurulatih and Boss verified outside the frame, no cropped sleeve. `leagueBoard` (frames 1040–1163) reveals the full 12-club Division 5 table — genuinely new information — with `bass-hit.wav` on its entry. Hold the tension, then hard cut to black title card: `Buluh FC` / `EPISOD 7` (72 frames, gold/white styling, NO CTA).

| Line | Speaker | Malay | English |
|---|---|---|---|
| e7_08 | NARRATOR | "Dua belas kelab, satu impian. Jalan keluar? Cuma satu. Siapa jatuh dulu?" | "Twelve clubs, one dream. And the way out? Only one. Who falls first?" |
