# Buluh FC — 3D Character & Remotion Studio

Cinematic vertical (9:16) Malay-language shorts built with procedural Three.js scenes rendered through Remotion.

> **Read first:** [`PRODUCTION_RULES.md`](./PRODUCTION_RULES.md) — mandatory rules for every episode (script-first workflow, multi-voice casual Malay scripts, dual subtitles, no CTAs, audio-driven pacing, camera standards).
>
> **Season planning:** [`remotion/story/episode-6-to-22-roadmap.md`](./remotion/story/episode-6-to-22-roadmap.md) — Episode 6–22 story roadmap, Division 5 format and continuity ledger.

## Quick start

```bash
npm install
npm start

cd remotion
npm install
npm run studio
```

## Layout

```
PRODUCTION_RULES.md
episodes/
  episode-1/ ... episode-5/  # script.md + audio-script.json
characters/                  # procedural 3D character rigs
environments/                # procedural 3D locations
remotion/
  src/                        # Remotion compositions and components
  scripts/                    # TTS and audio-bed generation
  story/
    story-guide.md             # Shorts format and pacing guide
    storyline.md               # series canon and episode tracker
    episode-6-to-22-roadmap.md # season roadmap (planning document)
  out/                         # rendered MP4s
```

## Rendering

Existing render commands for Episodes 1–5 remain unchanged. New episodes must follow the script-first workflow in `PRODUCTION_RULES.md`.

## Regenerating audio

Update `episodes/episode-X/audio-script.json` and the TTS manifest, then run the matching generator from `remotion/`. See the production rules and episode script for the approved prefix and commands.
