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
characters/                    # procedural 3D character rigs
environments/                  # procedural 3D locations
remotion/
  src/
    components/                # Scene3D, SafeArea, Subtitles, HookTitle, ScoreboardHUD
    Episode1/ Episode2/ Episode3/  # compositions + scene directors
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
```

## Regenerating audio

Update `episodes/episode-X/audio-script.json` and
`remotion/scripts/generate_tts.py`, then:

```bash
cd remotion
python scripts/generate_tts.py e2_        # e2_ = Episode 2, b = Episode 1
python scripts/generate_tts.py e3_        # e3_ = Episode 3 (e3_01 lead-silence trimmed)
python scripts/generate_audio_beds.py     # procedural SFX + BGM beds
```
