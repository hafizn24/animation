# Matchday – next iteration

Working notes for the next pass on `matchday-v2.mp4`.

**The rule for this iteration: use the materials the project already ships.**
Every texture, material and palette the video needs should come from the repo.
The only thing the Remotion project should own is the *choreography* – camera
work, timing and the overlay. If a texture has to be drawn for the video, it
belongs in the file that owns the scene, not in `remotion/`.

---

## 1. The material inventory – what already exists

### Environment – `environments/stadium.js`

The whole ground comes from here; the video never builds its own stadium.

| Material | Palette | Used for |
|---|---|---|
| `grass` / `grassDark` | `0x3a8c3f` / `0x2d6e31` | pitch and surrounds |
| `pitchLine` | `0xffffff` | markings |
| `brick` / `brickDark` | `0x8b4513` / `0x6b3410` | clubhouse, terrace wall |
| `concrete` / `concreteDark` | `0xa8a8a8` / `0x808080` | terrace steps, roofs, hut |
| `metal` / `metalRail` | `0xcccccc` / `0xdddddd` | railings, roof pillars, pylons |
| `roofWhite` / `roofUnder` | `0xe8e8e8` / `0x888888` | stand and dugout roofs |
| `signWhite` / `signGreen` | `0xf5f5f0` / `0x1a6b1a` | fascia, hoarding boards |
| `wood` / `woodDark` | `0x8B7355` / `0x5c4a32` | clubhouse joinery, trees |
| `goalPost` / `goalBaseBar` / `goalTension` | whites and greys | goal frame and stanchions |
| `goalNet` / `goalNetBacking` | wireframe + translucent | goal netting |
| `fence` / `seat` / `scoreboard` / `red` | – | perimeter, terrace, scoreboard |
| `adBoard` / `adBoardBlue` | `0xffffff` / `0x1a3a6b` | advertising hoardings |
| `windowGlass` / `officeGlass` | `0x6699cc` / lit amber | clubhouse and manager's office |
| `lampGlass` | emissive `0xfff6dd` | floodlight lamps |
| `tarmac` / `gravel` | `0x3c3f42` / `0x8d8578` | car park |
| `black` | `0x111111` | misc trim |

Textures already drawn in that file: the grandstand fascia sign, the clubhouse
sign, the locker room sign, the players' tunnel sign, the club crest, the
ad boards (`adTexts`) and the corner flags.

### Characters – `characters/*.js`

Each app exposes `this.outfits` (palettes) and `this.materials`, plus
`changeOutfit(name)` to swap the look at runtime.

| File | Outfits | Hair | Role in the video |
|---|---|---|---|
| `character-soccer.js` | `soccerRedWhite`, `awayBlueWhite` | `crop` | the squad and the keeper |
| `character-coach.js` | `navyCoach`, `maroonCoach` | `buzz` | the coach on the touchline |
| `character-suit.js` | `classicGraySuit`, `navyExecutive` | `sidePart` | the referee |
| `character-chairman.js` | `boardroomGrey`, `navyBoardroom` | `receding` | the chairman |
| `character-new-owner.js` | `navyOwner`, `charcoalOwner` | `swept` | the new owner |
| `character-casual.js` | `beigeSweater`, `oliveSweater` | `long` | unused so far |
| `character-default.js` | `default`, `casualRed` | `messy` | unused so far |
| `character-hair.js` | `HAIR_STYLES` = crop, messy, buzz, swept, sidePart, long, afro, receding, bald | – | shared hair library |

Textures already drawn in the character files: the striped jersey
(`createStripedTexture`), the coach's back badge (`createCoachBackBadgeTexture`)
and the casual knit.

### Shared helpers

- `makeCanvasTexture(width, height, draw)` – an instance method on `StadiumApp`,
  `LockerRoomApp` and `ManagerOfficeApp`. Three copies of the same helper is the
  first thing worth consolidating into one shared module
  (e.g. `environments/scene-utils.js`) that all three import.
- The ball texture (white with black pentagons) is drawn inline in
  `environments/locker-room.js` and again in `environments/manager-office.js`.
  It is drawn a third time in `remotion/src/scene/textures.js`. **Extract one
  copy** – e.g. `characters/character-hair.js` is already a shared module for
  the cast, a sibling `characters/character-parts.js` would be the natural home.

---

## 2. Where the video currently breaks that rule

`remotion/src/scene/textures.js` still exports five things that duplicate the
project: `createAdTexture`, `createNetTexture`, `createCrestTexture` (all three
are unused now – the stadium provides the hoardings, the net and the crest) and
`createBallTexture` (a third copy of the project's ball). `makeCanvasTexture`
there is a fourth copy of the helper.

| Export | Status | Action |
|---|---|---|
| `makeCanvasTexture` | duplicate, unused | delete, and consolidate the three copies on the app classes into one shared module |
| `createAdTexture` | unused | delete |
| `createNetTexture` | unused | delete |
| `createCrestTexture` | unused | delete |
| `createBallTexture` | duplicate of the project ball | extract a shared ball texture and use it everywhere |
| `createSkyTexture` | **not** in the project | keep for now – see below |
| `createRandom` | needed (no `Math.random` in renders) | keep |

The dusk sky is the one genuine gap: `environments/stadium.js` uses a flat
`0x87ceeb` background. Either keep the gradient here as the single exception,
or – better – give `StadiumApp` a time-of-day option so the viewer and the
video share one sky.

---

## 3. Things the video does at runtime that should live in the project

These are currently done in `remotion/src/scene/MatchdayScene.js` by poking at
the scene after it has been built. They belong in the source files so the
viewer gets them too.

1. **Lighting re-grade.** The scene is traversed and the ambient, hemisphere and
   directional lights are re-coloured for an evening kick-off.
   → Add a `timeOfDay` option to `StadiumApp` (`'day' | 'dusk' | 'night'`).
2. **The crowd.** Generated at runtime as an instanced mesh on the terrace.
   → Move it into `environments/stadium.js` so the ground is populated in the
   viewer as well.
3. **The keeper's green strip.** `changeOutfit` is called and then the striped
   jersey texture is rebuilt by hand.
   → Add a `keeperKit` palette to `character-soccer.js` and a `goalkeeperKit`
   flag to the character, the way the shorts, socks and boots already work.
4. **The directors' area.** The chairman and the new owner stand on the grass
   next to the clubhouse because the ground has no directors' box.
   → Add one to `environments/stadium.js`.
5. **The magic number `PLAYER_SCALE = 0.64`.** The characters are ~2.8 units
   tall; the pitch is in metres.
   → Export the scale from the character app, e.g. `character.height`, or put
   the constant next to the rig that defines it.

---

## 4. Coordinate reference

The stadium pitch is modelled in metres, the characters are not – worth writing
down so the next iteration does not have to re-derive it.

| Thing | Position |
|---|---|
| Pitch | x −32 … 32, z −50 … 50 |
| Goals | z = ±50, net runs back to z ± 52.6 |
| Grandstand | z ≈ 55.5, terrace steps at y 3.0 – 3.75, z 54 – 56.4 |
| Clubhouse / manager's office | x −33.5 … −18.5, z 56.75 … 62.25 |
| Players' tunnel | x ≈ −29.5, z 50 → 53 |
| Dugouts | x = ±12, z = −54.5 |
| Scoreboard | x = 37.5, z = 10 |
| Characters | 2.8 units tall → × 0.64 = 1.79 m |

---

## 5. The cut (unchanged unless there is a reason)

| Shot | Time | Camera |
|---|---|---|
| 1 | 0.0 – 3.0s | Low touchline tracker on the ball carrier |
| 2 | 3.0 – 6.0s | Tight on the strike, boot meets ball |
| 3 | 6.0 – 9.0s | Crane up over the ground as the ball arcs to goal |
| 4 | 9.0 – 10.0s | The net – ball hits, keeper dives, crowd goes up |

---

## 6. Ideas for the next cut, once the materials are shared

- **Pre-match in the dressing room.** `environments/locker-room.js` and
  `environments/manager-office.js` already exist – a 3 second locker room
  scene before kick-off would use them for free, and the Chairman, the New
  Owner, the Coach and the Squad are all standing there already.
- **The tunnel.** The stadium has a players' tunnel; walking out of it is a
  natural shot 0 and would show the environment the team comes from.
- **The directors' box.** With the chairman and the owner seated, the crane
  shot has something to land on.
- **A 2.39 → 1.85 aspect change** on the goal, or a slow zoom, to sell the
  payoff.
- **Crowd noise / crowd movement.** The crowd is currently static boxes; the
  stands could react more (a ripple through the instanced mesh) on the goal.

---

## 7. Recipe – adding something without duplicating

| The look belongs to | Put it in | Then |
|---|---|---|
| the ground | `environments/stadium.js` → the `mat` dictionary | reference `mat.x` |
| a character | that character's `outfits` palette | `changeOutfit('name')` |
| a character's hair | `characters/character-hair.js` → `HAIR_STYLES` | `changeHairStyle('name')` |
| a room | `environments/locker-room.js` / `manager-office.js` | that scene's `mat` |

If a texture really is new, draw it with the project's own
`makeCanvasTexture` in the file that owns the scene – not in `remotion/`.

---

## 8. Verification checklist

```bash
# from remotion/
npm run render                      # writes out/matchday-v2.mp4

# the cut really is every three seconds - pull the frames either side of it
mkdir -p out/chk
for t in 2.95 3.00 5.95 6.00 8.95 9.00; do
  ffmpeg -ss $t -i out/matchday-v2.mp4 -frames:v 1 out/chk/t$t.png
done

ffprobe -v error -show_entries format=duration -show_entries stream=nb_frames out/matchday-v2.mp4
# expect duration=10.000000 and nb_frames=300

# the viewer still works
cd .. && node test.mjs
```

`ffmpeg` and `ffprobe` ship with Remotion – they are in
`node_modules/@remotion/compositor-win32-x64-msvc/` on Windows.

Frames worth eyeballing each pass: the first frame of every shot
(0, 90, 180, 270), the frame before each cut, and the goal itself (frame 278).
