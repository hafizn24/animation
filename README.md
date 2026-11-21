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
characters/                    # procedural 3D character rigs (incl. character-karim.js)
environments/                  # procedural 3D locations (incl. club-office.js / ClubOffice)
remotion/
  src/
    components/                # Scene3D, SafeArea, Subtitles, HookTitle, ScoreboardHUD, TransferOfferHUD
    Episode1/ Episode2/ Episode3/ Episode4/  # compositions + scene directors
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
```

## Regenerating audio

Update `episodes/episode-X/audio-script.json` and
`remotion/scripts/generate_tts.py`, then:

```bash
cd remotion
python scripts/generate_tts.py e2_        # e2_ = Episode 2, b = Episode 1
python scripts/generate_tts.py e3_        # e3_ = Episode 3 (e3_01 lead-silence trimmed)
python scripts/generate_tts.py e4_        # e4_ = Episode 4 (all clips lead-silence trimmed)
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
