# Buluh FC — 3D Character & Remotion Studio

Cinematic vertical (9:16) Malay-language shorts built with procedural Three.js
scenes rendered through Remotion.

> **Read first:** [`PRODUCTION_RULES.md`](./PRODUCTION_RULES.md) — mandatory
> rules for every episode (script-first workflow, multi-voice casual Malay
> scripts, dual subtitles, no CTAs, audio-driven pacing, camera standards).

## Quick start

```bash
# root: 3D character / environment viewer
npm install
npm start

# remotion: video studio + rendering
cd remotion
npm install
npm run studio
```

## Layout

```
PRODUCTION_RULES.md            # source of truth for all episodes
episodes/
  episode-1/                   # script.md + audio-script.json
  episode-2/                   # script.md + audio-script.json
  episode-3/                   # script.md + audio-script.json (source of truth)
  episode-4/                   # script.md + audio-script.json — RM50,000 Untuk Karim
  episode-5/                   # script.md + audio-script.json — Pengorbanan & Nombor 7 Baru
characters/                    # procedural 3D character rigs (incl. character-karim.js, character-azam.js)
environments/                  # procedural 3D locations (incl. club-office.js / ClubOffice)
remotion/
  src/
    components/                # Scene3D, SafeArea, Subtitles, HookTitle, ScoreboardHUD, TransferOfferHUD
    Episode1/ Episode2/ Episode3/ Episode4/ Episode5/  # compositions + scene directors
    Root.jsx                   # composition registry + durations
  scripts/generate_tts.py      # multi-voice TTS generation
  story/                       # story guide + series storyline
  out/                         # rendered MP4s
```

## Rendering

```bash
cd remotion
npm run render          # Episode 1
npm run render:episode2 # Episode 2
npm run render:episode3 # Episode 3
npm run render:episode4 # Episode 4 — RM50,000 Untuk Karim (out/episode-4.mp4)
npm run render:episode5 # Episode 5 — Pengorbanan & Nombor 7 Baru (out/episode-5.mp4)
```

## Regenerating audio

Update `episodes/episode-X/audio-script.json` and
`remotion/scripts/generate_tts.py`, then:

```bash
cd remotion
python scripts/generate_tts.py e2_        # e2_ = Episode 2, b = Episode 1
python scripts/generate_tts.py e3_        # e3_ = Episode 3 (e3_01 lead-silence trimmed)
python scripts/generate_tts.py e4_        # e4_ = Episode 4 (all clips lead-silence trimmed)
python scripts/generate_tts.py e5_        # e5_ = Episode 5 (natural 1.0x, both-end silence trimmed, no stretching)
python scripts/generate_audio_beds.py     # procedural SFX + BGM beds (incl. office drone + bass hit)
```

### Episode 4 notes
- `ClubOffice` (`environments/club-office.js`) is a lightweight 9:16 indoor set: dark plaster shell,
  warm wood floor, desk + offer sheet + pen, tactics whiteboard, warm desk lamp and a half-open,
  cooler-backlit doorway for the Karim reveal.
- Karim's rig (`characters/character-karim.js`) prints `KARIM` and `8` on the Match Jersey back and
  front, adds a captain armband and carries boots in his left hand.
- `TransferOfferHUD` shows `TAWARAN RASMI — KELAB DIVISYEN 4`, `RM50,000` and `KOS GAJI: -35%`
  on `e4_05`–`e4_06`. A deliberate 1.3s silence drops the room tone before Karim's doorway line.
- Subtitle/sequence frames in `audio-script.json` are locked to the measured, lead-silence-trimmed
  durations of the generated `e4_01`–`e4_10` MP3s (max gap 0.8s; one intentional 1.3s pause).
- Total: 1,530 frames / 51.0s @ 30fps, with a 0.83s hold after `e4_10` before the hard cut.
- Smoke tests:
  `npx remotion render Episode4 out/episode-4-test.mp4 --frames=0-150` and
  `npx remotion render Episode4 out/episode-4-scene3-test.mp4 --frames=1320-1509`.
- `Karim` and `Club Office` are also registered in the standalone viewer (`npm start`).

### Episode 5 notes
- **Pengorbanan & Nombor 7 Baru** — **1,353 frames / 45.1s @ 30fps**, **1080x1920** (9:16 master;
  overlays are the Ep. 1 design scaled 1.5x). Ends on a hard cut to pure black — no title card, no CTA.
- All `e5_*` clips are generated at **natural 1.0x speed** with both-end silence trimmed — **no time
  stretching**. Every frame is derived from measured clip durations: 5–8 frame dialogue gaps,
  a 12-frame armband beat, 3-frame rapid-fire between the last three lines, and an 8-frame beat
  before black.
- **`characters/character-azam.js`** (`AzamApp`) mirrors Karim's rig/proportions with an `AZAM 7`
  jersey, swept quiff and `stride`/`reveal` poses. After *"Baru lawan gerun."* he eases into a
  relaxed **`idle`** (arms lowered, breathing, weight shift) for the whole RM5 exchange — no T-pose.
- **Act 1** reuses `ClubOfficeApp`; **Acts 2–3** reuse the existing `LockerRoomApp` (`environments/locker-room.js`).
  Karim's carried boots are hidden and his captain armband is laid cleanly on the desk; Bos faces the
  squad/camera three-quarter front in Act 2; the final 12s use a 45-degree front-quarter two-shot.
- `DebtTickerHUD` plays for **90 frames (3.0s)**, ticking `HUTANG KELAB` from `RM381,500` to
  `RM331,500` with `KOS GAJI: -35%`. A 1.5s `@akudingin-d1f` comment card flashes on Azam's entrance;
  it contains no engagement prompt. `ESOKNYA...` holds 16 frames (0.53s).
- Teammate 1's `e5_06` starts at frame 494 — a 0.47s J-cut before the visual cut to Act 2 at frame 508,
  just after the counter lands on `RM331,500`.
- Smoke tests: `npx remotion render Episode5 out/e5-smoke/act1-armband-hud.mp4 --frames=185-215`,
  `... --frames=470-515`, `... --frames=730-795`, `... --frames=830-1070`, and
  `... --frames=1233-1352`.
