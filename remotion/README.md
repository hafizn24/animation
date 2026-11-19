# Buluh FC — Episode 1

Vertical football storytelling built with [Remotion](https://remotion.dev) and
Three.js, using the procedural sets and character rigs that already live in this
repository.

- **`out/episode-1.mp4`** – Episode 1: 720×1280, 9:16, 30fps, 66s.
- `out/matchday-v2.mp4` – the original 10 second vertical matchday cut.

## Format

Everything is composed for **vertical video (TikTok / YouTube Shorts)**:

- 720×1280 canvas, 9:16, 30fps, H.264
- No cinematic letterbox — the frame is filled edge to edge
- Soft top/bottom gradients mark the platform safe areas without hard bars
- Malay subtitles sized and positioned for a narrow screen, with a two-frame
  flash masking each hard cut

## Direction

The episode opens on the conflict, not the backstory: a solicitor slides a
**DEFAULT NOTICE** across a cold boardroom desk in the first second. The rest
of the episode is told in short, hard-cut beats (6–12s each) — the 0–3 scoreboard,
the tunnel walk into the floodlights, the silent dressing room, the handover,
the discovery — then loops back to the same boardroom for the final hook.

## Sets and assets

| Asset | Used for |
|---|---|
| `environments/lender-boardroom.js` | Cold open and final hook — the solicitor's office |
| `environments/players-tunnel.js` | The owner walking out into the floodlights |
| `environments/stadium.js` | 0–3 scoreboard and the team's dejection |
| `environments/locker-room.js` | The silent dressing room |
| `environments/manager-office.js` | The handover and the default-notice discovery |
| `characters/character-new-owner.js` | The ambitious new owner |
| `characters/character-chairman.js` | The old chairman |
| `characters/character-coach.js` | The veteran coach |
| `characters/character-suit.js` | The solicitor |
| `characters/character-soccer.js` | The squad |

## Episode 1 beats

| Beat | Time | Setting |
|---|---|---|
| 1 | 0 – 8s | Cold open — £450,000 overdue, 30 days |
| 2 | 8 – 14s | 0–3 on the scoreboard |
| 3 | 14 – 22s | The tunnel — "this is home" |
| 4 | 22 – 34s | Locker room — words meet a wall of silence |
| 5 | 34 – 46s | Manager's office — the chairman hands over the keys |
| 6 | 46 – 56s | The default notice under the desk lamp |
| 7 | 56 – 62s | Back to the solicitor — the countdown starts |
| End | 62 – 66s | Title card: **Buluh FC — Episod 1** |

There is no TTS. Each beat opens with casual Malay narrator text, followed by
stylised character subtitles, lighting and camera movement.

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
- `src/Episode1/Episode1Composition.jsx` – the seven-beat timeline, Malay subtitle
  script, cut flashes and end card.
- `src/Episode1/sceneKit.js` – shared environment/rig/camera builder.
- `src/Episode1/scenes/` – one director per beat.
- `src/components/Scene3D.jsx` – deterministic WebGL frame drawing inside `delayRender`.
- `src/components/Subtitles.jsx` / `SafeArea.jsx` – vertical typography and safe area.
- `src/scene/textures.js` – procedural canvas textures (skies, scoreboard, notice, ball).
