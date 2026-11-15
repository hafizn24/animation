# The Oaks · Matchday

A 10 second cinematic football sequence built with [Remotion](https://remotion.dev) and
Three.js, for Oakhaven United FC.

- **`out/matchday-v2.mp4`** – the current cut. 1920×1080, 30fps, 10.000s, H.264.
- `out/matchday.mp4` – the first pass, rendered with a purpose-built set of models.

## Built from the project, not beside it

`matchday-v2.mp4` reuses the assets that already live in this repository rather than
a parallel set of models:

| Asset | Used for |
|---|---|
| `environments/stadium.js` | The Oaks – pitch, markings, goals, hoardings, grandstand, clubhouse with the lit manager's office, floodlights, club flags |
| `characters/character-soccer.js` | the squad and the keeper, in the real `soccerRedWhite` / `awayBlueWhite` kits |
| `characters/character-coach.js` | the coach on the touchline |
| `characters/character-suit.js` | the referee |
| `characters/character-chairman.js` | the chairman in the directors' area |
| `characters/character-new-owner.js` | the new owner beside him |

The characters keep their own toon materials and back-side outline meshes – they are
only scaled to human size and posed for the match. The stadium keeps its own
materials; the lights are re-graded at runtime for an evening kick off and a crowd
is added to the terrace.

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
npm run render        # writes out/matchday-v2.mp4
npm run render:still  # writes out/still.png
```

## How it works

Remotion renders every frame deterministically, so the whole scene is driven by the
frame number – there is no `Math.random`, no `Date.now` and no clock.

- `src/FootballMatch.jsx` – the composition. Owns the canvas, the cinematic grade,
  the 2.39:1 letterbox, the opening title and the one frame flash that masks each cut.
  The 3D scene is built once and drawn inside a `delayRender` window so Remotion waits
  for the frame to be finished before capturing it.
- `src/scene/MatchdayScene.js` – assembles The Oaks and the cast, then drives the ball
  choreography, the player scripts and the camera shot list.
- `src/scene/textures.js` – the few textures that are not already in the project
  (dusk sky, ball, hoardings, crest) are all drawn procedurally to a canvas.
