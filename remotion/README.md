# The Oaks · Matchday

A 10 second cinematic football sequence built with [Remotion](https://remotion.dev) and
Three.js, for Oakhaven United FC.

**`out/matchday.mp4`** – 1920×1080, 30fps, 10.000s, H.264.

## The cut

One hard cut every three seconds (four shots):

| Shot | Time | Camera |
|---|---|---|
| 1 | 0.0 – 3.0s | Low touchline tracker following the ball carrier |
| 2 | 3.0 – 6.0s | Tight on the strike as the boot meets the ball |
| 3 | 6.0 – 9.0s | Crane up revealing the ground as the ball arcs to goal |
| 4 | 9.0 – 10.0s | The net – the ball hits, the keeper dives, the crowd goes up |

## Running it

```bash
npm install
npm run studio        # interactive preview
npm run render        # writes out/matchday.mp4
npm run render:still  # writes out/still.png
```

## How it works

Remotion renders every frame deterministically, so the whole scene is driven by the
frame number – there is no `Math.random`, no `Date.now` and no clock.

- `src/FootballMatch.jsx` – the composition. Owns the canvas, the cinematic grade,
  the 2.39:1 letterbox, the opening title and the one frame flash that masks each cut.
  The 3D scene is built once and drawn inside a `delayRender` window so Remotion waits
  for the frame to be finished before capturing it.
- `src/scene/MatchScene.js` – the stadium lighting, the ball choreography, the player
  scripts and the camera shot list.
- `src/scene/stadium.js` – pitch, line markings, goals, hoardings, stands, crowd
  (one instanced mesh) and floodlights.
- `src/scene/player.js` – the stylised footballer and its run/kick cycle.
- `src/scene/textures.js` – every texture is drawn procedurally to a canvas.

All the geometry and textures are procedural, matching the rest of the project –
there are no external assets.
