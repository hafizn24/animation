# Buluh FC — 3D Character & Remotion Studio

Cinematic vertical (9:16) Malay-language shorts built with procedural Three.js
scenes rendered through Remotion.

> **Read first:** [`PRODUCTION_RULES.md`](./PRODUCTION_RULES.md) — mandatory
> format law. Season data lives in [`story/`](./story/) and is the single source
> of truth for money, league, cast and environments.

## Quick start

```bash
npm install
npm start                 # 3D viewer at http://localhost:3000

cd remotion
npm install
npm run studio            # Remotion studio
```

## Layout

```
episodes/
  episode-1/ … episode-5/       script.md + audio-script.json (Episodes 1–5)
story/
  season-bible.md               logline, tone, arc map, antagonist options
  season-money.json             freeze, instalments, income, shocks, payout
  league.json                   8 clubs, 14 matchdays, results, standings
  cast.json                     recurring characters, voices, rigs
  environments.json             existing and new sets per arc
characters/                     procedural rigs + viewer modules
environments/                   procedural sets + viewer modules
viewer/                         registry-driven viewer (index.html is a thin shell)
scripts/                        verify-season, verify-episode, retime, repo/viewer checks
remotion/
  src/episodes.js               composition registry (ids, frames, sizes)
  src/components/               Episode 1–5 components (do not edit)
  src/shared/                   EndCard, Subtitles, HookTitle, SeasonHUD (Episode 6+)
  scripts/generate_tts.py       TTS: hard-coded manifest for b/e2–e5, JSON for e6+
  public/audio/                 TTS, bgm and sfx beds
  out/                          renders and verification stills (gitignored)
```

Episodes 1–4 are **720x1280** and Episode 5 onward is **1080x1920**, all at
30fps. Do not "fix" this mismatch — it is intentional.

## Viewer

```bash
npm start
npm test                        # rigs/asset tests + merge-conflict and README checks
npm run check:viewer-registry   # every exported *App class is registered
CHROME_PATH=/path/to/chrome npm run test:viewer   # 18 entries x 2 cycles, WebGL leak check
```

Deep-link any entry with `?id=azam`. `CHROME_PATH` must point at the system
Chrome executable (or set the environment variable before the command).

## Rendering

From `remotion/`:

```bash
npm run render                  # Episode 1
npm run render:episode2
npm run render:episode3
npm run render:episode4
npm run render:episode5
npm run render:matchday         # FootballMatch demo

npx remotion still Episode5 out/ep5.png --frame=0
npx remotion render Episode5 out/ep5-hook.mp4 --frames=0-60
npx remotion compositions       # lists registered compositions
```

Render scripts for Episode N appear only after that episode exists.

## Audio and timelines

From `remotion/`:

```bash
python scripts/generate_tts.py --dry-run e5_   # lists rows with no network/key
python scripts/generate_tts.py e5_             # calls the TTS API (needs .env)
python scripts/generate_audio_beds.py          # procedural SFX/BGM beds
```

Never commit `.env` — it holds `ILMU_API_KEY`. Generated MP3s in
`remotion/public/audio/tts/` are the timing source of truth; TTS runs at natural
speed with both-end silence trimmed and no atempo stretching. For episodes 6+
the rows come from `episodes/episode-N/audio-script.json` and the voice, speed
and pitch come from `story/cast.json`.

From the repo root, after an approved script and generated audio:

```bash
node scripts/retime.mjs 6               # measure MP3s, rebuild frames + timing table
node scripts/verify-episode.mjs 6        # JSON/script/audio/format/HUD checks
npm run verify:season                    # recompute money, league, cast, HUD values
```

## Season format (Episode 6 onward)

- 1080x1920 @ 30fps, 40–46s target, never above 51s.
- Casual Malaysian Malay on screen and in audio, plus a smaller English line
  under every subtitle.
- Dialogue-led; the narrator bridges at most twice per episode on a voice no
  speaker in that episode shares.
- Frame 0 bright and moving, `HookTitle` for frames 0–45, first cut by frame 60,
  sharp SFX transient on frame 0, first clip lead-trimmed.
- Hard cut to the 72-frame black `Buluh FC / EPISOD X` card. No CTA, ever.
- `audio-script.json` wins over `script.md` and over code.
