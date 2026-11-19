# Episode 1 Master Production Plan: Buluh FC (Vertical Short Drama)

## 1. Core Profile & Story Framework
* **Protagonist**: **The Ambitious Underdog** (New Owner, navy sweater & messenger bag). He poured his life savings into his hometown club.
* **The Club**: **Buluh FC**, Liga Daerah / Peringkat Rendah.
* **Antagonist**: **The Loan Shark / Peguam** (navy executive suit) holding a **RM450,000** private loan over the ground.
* **Format**: Vertical 720×1280, 9:16, 30fps, 75 seconds. TikTok / YouTube Shorts. Full-bleed with soft platform safe-area tint, hard cuts masked by a two-frame flash.
* **Audio / Dialogue Style**: Malay TTS via ILMU `ilmu-tts-v2.1` (`scripts/generate_tts.py` → `public/audio/tts/`). Casual narrator voice opens each beat, followed by character voices; stylised subtitles and dramatic soundtrack cues complete the mix.
* **Direction rule**: **Open on the conflict.** No slow establishing shots. Every beat is 6–12 seconds and ends on a question; the final beat loops back to the opening image.

---

## 2. Beat-by-Beat Shot List & Malay Script

### Beat 1: Cold Open — The Notice (0 – 11.3s / 340 frames)
* **Environment**: `environments/lender-boardroom.js` — cold panelled office, blinds, city night.
* **Camera**: Fast push from a three-quarter wide to the red folder on the desk.
* **Action**: The solicitor leans forward and slides the notice across the mahogany desk.
* **Narrator**: *"Malam ni, dalam bilik kerja yang sejuk, satu folder merah kena ketuk atas meja. Nampak macam biasa... tapi ada yang nak berakhir."*
* **Subtitles**:
  > RM450,000 tertunggak.
  > Tiga puluh hari. Atau stadium ini milik kami.

### Beat 2: The Reality (11.3 – 19.3s / 240 frames)
* **Environment**: `environments/stadium.js` — evening matchday.
* **Camera**: Touchline tracker whipping up to the scoreboard.
* **Action**: Scoreboard reads `BULUH 0 - 3 GUEST`. Heads down.
* **Narrator**: *"Padang dah gelap, tapi lampu stadium masih terang. Buluh FC... kelab yang dulu pernah ada harapan."*
* **Subtitles**:
  > Peringkat rendah kita. Tempat kebelakangan.
  > 0 - 3. Dan pasukan ni dah berputus asa.

### Beat 3: The Tunnel (19.3 – 27.3s / 240 frames)
* **Environment**: `environments/players-tunnel.js` — dark brick tunnel opening onto a floodlit pitch and crowd silhouettes.
* **Camera**: Low follow behind the owner as he walks from darkness into the light.
* **Action**: He stops at the mouth of the tunnel.
* **Narrator**: *"Dia jalan dari gelap ke terang. Sepuluh tahun duit simpanan, orang kata ni kerja gila... tapi dia tak peduli."*
* **Subtitles**:
  > Tapi ni rumah saya.

### Beat 4: The Cold Truth (27.3 – 40.7s / 400 frames)
* **Environment**: `environments/locker-room.js` — flickering strips, silent benches.
* **Camera**: Dolly through the doorway toward the owner.
* **Narrator**: *"Bilik ganti sunyi, lampu berkelip. Dia masuk, dan terus rasa tekanan tu."*
* **Subtitles**:
  > Pemilik: Saya tahu ni berat. Tapi semuanya berubah hari ini.
  > Jurulatih: Maaf bos, tapi kata-kata tak bagi pampasan untuk bayar bil elektrik. Atau gaji pemain.
  > Sunyi menerpa ruang.

### Beat 5: The Handover (40.7 – 53.7s / 390 frames)
* **Environment**: `environments/manager-office.js` — warm desk lamp.
* **Camera**: Over-the-shoulder across the desk; brass keys slide into frame.
* **Narrator**: *"Meja kayu, lampu meja, sepasang kunci. Pengerusi tak banyak cakap — tapi dia tahu beban yang dia serahkan."*
* **Subtitles**:
  > Pengerusi: Sekarang ni masalah awak, anak muda. Jangan sampai tenggelam.
  > Pemilik: Saya akan cuba bina semula kelab ni. Apa pun jadinya.
  > Dia menandatangani.

### Beat 6: The Hidden Clause (53.7 – 63.7s / 300 frames)
* **Environment**: `environments/manager-office.js` — darkened, single lamp.
* **Camera**: Slow push onto the red-stamped document.
* **Narrator**: *"Bilik dah gelap. Satu dokumen dengan cop merah muncul — klausul yang tersorok daripada dia sejak awal."*
* **Subtitles**:
  > Bayaran penuh dalam 30 hari — atau stadium ni dirampas.
  > Wang simpanan saya hanya beli hutangnya.

### Beat 7: The Hook (63.7 – 70.8s / 215 frames)
* **Environment**: `environments/lender-boardroom.js` — match cut back to beat 1.
* **Camera**: Same framing as the cold open; the solicitor closes the folder.
* **Narrator**: *"Bilik kerja yang sama. Folder ditutup perlahan. Satu perkiraan dah bermula."*
* **Subtitles**:
  > Peguam: Tiga puluh hari.
  > Hari pertama bermula sekarang.

### End Card (70.8 – 74.8s / 120 frames)
* Cut to black, sound cue, title: **BULUH FC — EPISOD 1**.

---

## 3. Technical Implementation (Remotion)
* `src/Root.jsx` — `Episode1`: 2245 frames, 30fps, 720×1280.
* `src/Episode1/Episode1Composition.jsx` — seven-beat timeline, Malay subtitles, TTS clips, cut flashes, end card.
* `src/Episode1/sceneKit.js` — shared environment / rig / camera builder.
* `src/Episode1/scenes/` — `boardroomScene.js`, `matchdayScene.js`, `tunnelScene.js`,
  `lockerRoomScene.js`, `handoverScene.js`, `cliffhangerScene.js`.
* `src/components/Scene3D.jsx`, `Subtitles.jsx`, `SafeArea.jsx`.
* Both new environments are also registered in the root viewer (`index.html`).
