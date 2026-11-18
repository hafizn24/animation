# Buluh FC — Episode 1

Vertical football storytelling built with [Remotion](https://remotion.dev) and
Three.js, using the procedural sets and character rigs that already live in this
repository.

- **`out/episode-1.mp4`** – Episode 1, "The Gamble": 720×1280, 9:16, 30fps, ~84s.
- `out/matchday-v2.mp4` – the original 10 second vertical matchday cut.

## Format

Everything is composed for **vertical video (TikTok / YouTube Shorts)**:

- 720×1280 canvas, 9:16, 30fps, H.264
- No cinematic letterbox — the frame is filled edge to edge
- Soft top/bottom gradients mark the platform safe areas without hard bars
- Subtitles and titles are sized and positioned for a narrow screen

## Built from the project, not beside it

| Asset | Used for |
|---|---|
| `environments/stadium.js` | Buluh FC – pitch, markings, goals, hoardings, grandstand, clubhouse, floodlights, scoreboard |
| `environments/locker-room.js` | Scene 3 – the silent dressing room |
| `environments/manager-office.js` | Scenes 4 and 5 – the handover and the cliffhanger |
| `characters/character-new-owner.js` | The ambitious new owner |
| `characters/character-chairman.js` | The old chairman |
| `characters/character-coach.js` | The veteran coach |
| `characters/character-soccer.js` | The squad |

## Episode 1 — The Gamble

| Scene | Time | Setting |
|---|---|---|
| 1 | 0 – 15s | Dawn at the ground — the owner walks onto the pitch |
| 2 | 15 – 30s | Matchday — 0–3 down, the team has stopped believing |
| 3 | 30 – 48s | Locker room — words meet a wall of silence |
| 4 | 48 – 66s | Manager's office — the chairman hands over the keys |
| 5 | 66 – 80s | The default notice — 30 days to save the ground |
| End | 80 – 84s | Title card: **Buluh FC — Episode 1** |

There is no TTS. The story is carried by stylised cinematic subtitles, environmental
lighting and camera movement.

## Running it

```bash
npm install
npm run studio        # interactive preview
npm run render        # writes out/episode-1.mp4
npm run render:matchday
npm run render:still
```

## How it works

Every frame is deterministic — no `Math.random`, no `Date.now`, no clock.

- `src/Root.jsx` – registers both compositions at 720×1280.
- `src/Episode1/Episode1Composition.jsx` – the five-scene timeline and subtitle script.
- `src/Episode1/sceneKit.js` – shared rig/environment/camera builder used by every shot.
- `src/Episode1/scenes/` – one director per scene (camera keys, actors, lighting).
- `src/components/Scene3D.jsx` – mounts a WebGL renderer and draws one frame inside a
  `delayRender` window so Remotion waits for the capture.
- `src/components/Subtitles.jsx` / `SafeArea.jsx` – vertical typography and platform safe area.
- `src/scene/textures.js` – procedural canvas textures (sky, scoreboard, default notice, ball).
