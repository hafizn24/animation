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
  episode-1/ … episode-5/       # script.md + audio-script.json (Episodes 1–5)
  episode-6/ … episode-12/      # Season 1 — script.md + audio-script.json (source of truth)
story/
  season1-debt.json             # debt progression (RM331,500 → RM0)
  division5-league.json         # 6 clubs × 11 players, fixtures, standings
characters/                    # procedural 3D rigs (karim, azam, character-variants.js)
environments/                  # club-office, locker-room, stadium, modular-pitch-zone,
                               # match-tunnel, pitch-crisis-night
scripts/                       # check-league.mjs, verify-season1.mjs, retime-from-audio.mjs
remotion/
  src/
    components/                # Scene3D, SafeArea, Subtitles, HookTitle, SeasonEpisode,
                               #   MatchHUD, StartingXICard, LeagueTableOverlay,
                               #   SeasonDebtTickerHUD, DualSubtitles, EndCard
    Season1/sceneKit.js         # shared deterministic scene/pose helpers for Ep6–12
    Episode1/ … Episode12/      # compositions + scene directors
    Root.jsx                   # composition registry + durations
  scripts/generate_tts.py      # multi-voice TTS generation (prefixes b, e2_ … e12_)
  story/                       # story guide + series storyline
  out/                         # rendered MP4s (gitignored)
```

## Rendering

```bash
cd remotion
npm run render          # Episode 1
npm run render:episode2 # Episode 2
npm run render:episode3 # Episode 3
npm run render:episode4 # Episode 4 — RM50,000 Untuk Karim (out/episode-4.mp4)
npm run render:episode5  # Episode 5 — Pengorbanan & Nombor 7 Baru
npm run render:episode6  # S1 — Janji Bank & Matchday 1     (1,336f / 44.5s)
npm run render:episode7  # S1 — Menang Pertama              (1,331f / 44.4s)
npm run render:episode8  # S1 — Duit vs Maruah              (1,348f / 44.9s)
npm run render:episode9  # S1 — Hutang Naik Balik           (1,264f / 42.1s)
npm run render:episode10 # S1 — Hidup Mati                  (1,202f / 40.1s)
npm run render:episode11 # S1 — Separuh Masa Neraka         (1,207f / 40.2s)
npm run render:episode12 # S1 — Juara Divisyen 5            (1,333f / 44.4s)

# Fast smoke frames (no full render):
npx remotion still Episode6 out/ep6.png --frame=0
npx remotion render Episode6 out/ep6-hook.mp4 --frames=0-60
```

All Season 1 compositions are **1080x1920 @ 30fps** (same master as Ep. 5).

## Regenerating audio

Update `episodes/episode-X/audio-script.json` and
`remotion/scripts/generate_tts.py`, then:

```bash
cd remotion
python scripts/generate_tts.py e2_        # e2_ = Episode 2, b = Episode 1
python scripts/generate_tts.py e3_        # e3_ = Episode 3 (e3_01 lead-silence trimmed)
python scripts/generate_tts.py e4_        # e4_ = Episode 4 (all clips lead-silence trimmed)
python scripts/generate_tts.py e5_        # e5_ = Episode 5 (natural 1.0x, both-end silence trimmed, no stretching)
python scripts/generate_tts.py e6_        # … through e12_ for Season 1
python scripts/generate_audio_beds.py     # procedural SFX + BGM beds (incl. office drone + bass hit)
```

**Never commit `.env`** (it holds `ILMU_API_KEY`). Generated MP3s in
`remotion/public/audio/tts/` are the only TTS source of truth for frame timings.
Season 1 uses the natural-speed path (no atempo stretching, both-end silence
trim). After generating `e6_` … `e12_`, run `npm run retime` to rebuild every
`audio-script.json` timeline and its `script.md` table from measured durations.

Verification (no API key or rendering needed):

```bash
npm test                 # rigs, pose determinism, league table, Season 1 sources
npm run verify:season1   # frames, gaps, voices, overlays, HUD scores, cue files
npm run verify:season1 -- --audio   # additionally require every e6_–e12_ MP3
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
- **Pengorbanan & Nombor 7 Baru** — **1,359 frames / 45.3s @ 30fps**, **1080x1920** (9:16 master;
  overlays are the Ep. 1 design scaled 1.5x). Ends on the standard 72-frame **Buluh FC / EPISOD 5**
  EndCard after a comedic percussion hit — no CTA.
- All `e5_*` clips are generated at **natural 1.0x speed** with both-end silence trimmed — **no time
  stretching**. Every frame is derived from measured clip durations: 5–8 frame dialogue gaps,
  a 12-frame armband beat, 3-frame rapid-fire between the last three lines, an 8-frame beat
  before the percussion hit, then the standard outro card.
- **`characters/character-azam.js`** (`AzamApp`) mirrors Karim's rig/proportions with an `AZAM 7`
  jersey, swept quiff and `stride`/`reveal` poses. After *"Baru lawan gerun."* he eases into a
  relaxed **`idle`** (arms lowered, breathing, weight shift) for the whole RM5 exchange — no T-pose.
- **Act 1** reuses `ClubOfficeApp`; **Acts 2–3** reuse the existing `LockerRoomApp` (`environments/locker-room.js`).
  Karim's carried boots are hidden and his captain armband is laid cleanly on the desk; Bos faces the
  squad/camera three-quarter front in Act 2; the final 12s use a 45-degree front-quarter two-shot.
- `DebtTickerHUD` plays for **90 frames (3.0s)**, ticking `HUTANG KELAB` from `RM381,500` to
  `RM331,500` with `KOS GAJI: -35%`. A 1.5s `@akudingin-d1f — "Bang saya nak masuk Buluh FC"` comment
  card flashes on Azam's entrance (`Azam · #7 · Defender · Gaji RM5`); it contains no engagement prompt.
  `ESOKNYA...` holds 16 frames (0.53s).
- Azam enters directly on **"Assalamualaikum. Saya Azam. Defender baru."** — there is no separate
  shout line, clip or subtitle. The final punchline is followed by the restored series EndCard
  (matching Ep. 2–4 styling and 72-frame duration).
- Teammate 1's `e5_06` starts at frame 494 — a 0.47s J-cut before the visual cut to Act 2 at frame 508,
  just after the counter lands on `RM331,500`.
- Smoke tests: `npx remotion render Episode5 out/e5-smoke/act1-armband-hud.mp4 --frames=185-215`,
  `... --frames=470-515`, `... --frames=730-795`, `... --frames=830-1070`, and
  `... --frames=1233-1352`.

## Season 1 notes (Episodes 6–12, reworked)

- **Rework standard:** dialogue carries the story — the narrator only bridges (max ~2 lines
  per act). HUD digits are never spoken; numbers live in the overlays plus at most one
  narrator line syncing the `SeasonDebtTickerHUD` beat. Rivals keep recurring personalities
  (Zaki's clipboard, Pak Din's otai mind games, Rayyan's bribe, Bob's chaos, Malik's machine
  commands) and the RM5 salary stays a running gag. The gold armband is a covenant: sworn
  over the desk in Ep. 6, handed over in Ep. 11, paid off in Ep. 12.
- **Arc:** PEGUAM freezes foreclosure for one Divisyen 5 season. Buluh FC must win the
  championship by Matchday 5; the Champion Prize + Nexus Sports (PENAJA) promotion bonus
  (RM305,000) clears the debt. Losses pay RM0; fines/emergencies are added to the balance.
- **Debt:** RM331,500 → RM331,500 (Ep6) → RM316,500 → RM296,500 → **RM321,500** (Ep9 crisis)
  → RM300,000 → **RM305,000** (Ep11 fine) → **RM0 / LUNAS** (Ep12).
- **Cast:** BOS, JURULATIH, PEGUAM, AZAM (#7) and FARID (#9) carry the season. Profile-based
  rigs in `characters/character-variants.js` cover Danial (#1 GK), Zaki, Pak Din, Rayyan, Bob,
  Malik, Penjaga Gol Besi and PENGADIL — no new skeletons. **New for the rework:**
  `characters/character-karim-away.js` — Karim in his Divisyen 4 away kit (navy, `KARIM 8`
  panels, Buluh scarf, hidden boots slot) who returns in the stands for the MD5 final.
- **New finale set:** `environments/pitch-hero-stand.js` (`PitchHeroStandApp`) — floodlit
  grandstand with `anchors.heroSpot`, railing, flip banner (`flipBanner()`: BULUH FC → JUARA),
  seeded flags, its own instanced crowd and deterministic confetti (`updateConfetti`).
- **11-a-side:** `StartingXICard` shows the full XI from `story/division5-league.json`; only 2–4
  Three.js rigs render per shot. Modular pitch zones swap by camera, not by new stadium builds.
- **Captaincy:** Bos swears the armband covenant on his desk in Ep. 6; vacant until Ep. 11,
  when he hands Karim's gold armband to Azam (#7); Azam wears it from Ep. 12 onward.
- **Karim:** absent through Ep. 11, then in the tribun for the final (Ep. 12) —
  "Aku kata dulu — jangan jual kapten aku." His Divisyen 4 club remains the Season 2 opener.
- Every episode ends with the standard 72-frame black **Buluh FC / EPISOD X** card, no CTA.
- All match shots use the verified 9:16 camera presets in `remotion/src/Season1/sceneKit.js`
  (`WIDE_TWO_SHOT`, `MEDIUM_SPEAKER`, `OVER_SHOULDER`, `PENALTY_BOX_1V1`) and pass through
  `sanitizeCamera()` (38–42° FOV, ≥4.6-unit actor clearance, 1.25–1.45 look-at height).
- Every dialogue line carries an 8-frame (250ms) subtitle/audio tail; `MatchHUD` enters after
  frame 45 and `SeasonDebtTickerHUD` is anchored below it, so overlays never collide.
- **BGM windows now live in each episode's `audio-script.json` (`bgm`)** — the compositions no
  longer hardcode them; `SeasonEpisode` reads the JSON first.
- Verification (no rendering needed): `npm test` covers the rigs/environments (incl. the new
  assets), and `npm run verify:season1` cross-checks JSON ↔ TTS manifest ↔ script.md ↔ debt
  JSON ↔ league table for every episode.
