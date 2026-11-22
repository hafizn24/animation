# Buluh FC — Production Rules (ALL EPISODES)

These rules are mandatory for every episode. They exist so the series keeps the
same storytelling structure, pacing, subtitle design and cinematic quality as
Episode 1. `PRODUCTION_RULES.md` is the single source of truth; the main project
guide (`README.md`) and the story docs (`remotion/story/story-guide.md`,
`remotion/story/storyline.md`) link back to it.

---

## 0. 0–2s Pattern-Interrupt Hook Standard (MANDATORY)

Episode 2 held 42% completion but only 28.8% Stayed-to-Watch because it opened
on slow exposition. Every episode from Episode 3 onward MUST interrupt the
pattern in the first two seconds:

- **Frame 0 is already bright and moving.** Start at full brightness with an
  active camera push / subject in motion. Never fade in from black, never hold
  a static wide establishing shot.
- **No backstory, no numbers, no " Previously on…".** Open *in media res* on
  the clearest action or conflict beat. Context comes after the hook.
- **First cut or major angle shift by 1.5–2.0s (frames 45–60).** The opening
  shot must not sit unchanged past frame 60.
- **Frame-0 audio transient.** Trim leading silence from the first TTS clip
  (`_01`) so voice/action lands at exactly `t = 0.0s`, and fire a sharp SFX
  transient on frame 0.
- **Bold hook overlay for the first 1.5s (frames 0–45).** A 3–5 word
  `HookTitle` spring-pop message must appear inside `SafeArea`, clear of the
  YouTube Shorts dead zones (bottom 25% / right 15%) and clear of subtitles
  and the scoreboard HUD.
- Analytics guardrail: the hook must be visible and legible on a phone before
  the viewer can decide to scroll. Keep the runtime in the 40–45s sweet spot.
  Episode 5 was rebuilt from natural 1.0x TTS clips and now sits at **45.1s**,
  back in the sweet spot; no runtime exception is active. Later episodes follow
  the same audio-derived timeline method unless their own story doc says otherwise.

---

## 1. Script-First Workflow (MANDATORY)

No scene may be built before its script exists.

For every episode, create **both** of these before touching any Three.js /
Remotion code:

- `episodes/episode-X/script.md` — the human-readable scene breakdown, timings,
  visuals, SFX/BGM notes and subtitle text.
- `episodes/episode-X/audio-script.json` — the machine-readable source of truth
  for TTS generation and timed subtitles (lines, speakers, start/end frames).

The `SCENES` array in `remotion/src/EpisodeX/EpisodeXComposition.jsx` and the
TTS manifest in `remotion/scripts/generate_tts.py` must mirror
`audio-script.json`. When in doubt, the JSON wins.

## 2. Multi-Voice Structure (MANDATORY)

Every episode MUST alternate between:

- `NARRATOR` lines — scene-setting, internal monologue, emotional beats.
- `CHARACTER DIALOGUE` lines — spoken by a named character with a speaker label.

A narrator-only episode is rejected. Aim for at least 2 named characters per
episode and at least one exchange between them.

## 3. Casual Malay Tone (CRITICAL)

All dialogue and narration MUST be natural, casual spoken Malaysian Malay
(*Bahasa Melayu santai*). Write how people actually talk, not textbook Malay.

- DO use: `tak berbaloi`, `boleh la`, `macam mana`, `ambik la`, `je`, `dah`,
  `kat`, `ni`, `akak`, `bro`, `memang`, `sikit`, `tengok`.
- DO NOT use stiff/formal register: `ia`, `beliau`, `apakah`, `walaubagaimanapun`,
  `mengambil`, `menuju`, `sesungguhnya`, `tertanya-tanya`.
- Keep sentences short and punchy. One idea per line.

## 4. Episode 1 Dual-Subtitle System (MANDATORY)

Render subtitles with `remotion/src/components/Subtitles.jsx`. Two distinct
styles, never mixed:

| Type | Style |
|---|---|
| **Narration** | Italic, warm gold (`#d8b26a`), serif (Georgia), at the bottom of frame. No speaker label. |
| **Character dialogue** | Clean white sans-serif (Arial/Helvetica), with an **uppercase gold speaker label** above the text (e.g. `PEMILIK`, `PENAJA 1`, `KEK MAJU`, `JURULATIH`). |

Both sit inside a subtle dark rounded plate so they stay readable on phone
screens. Narration is timed per line (`audio-script.json`); it is not a
permanent overlay. For the 1080x1920 Episode 5 master,
`remotion/src/Episode5/components/Episode5Subtitles.jsx` is the same design
scaled 1.5x, with the plate kept clear of the Shorts bottom-25% / right-15% zones.

## 5. NO Engagement-Bait CTAs (STRICT)

Never include like / comment / subscribe / "komen episod seterusnya" prompts.
No `"Komen episod 3 kalau nak tengok"`, no `"Like & subscribe"`, nothing
similar.

Every episode ends on a **dramatic final line**, then a **hard cut** to a clean
black title card:

```
BULOH FC
────────────── (thin gold divider)
EPISOD X
```

No CTA. No credits crawl. Hold the card briefly, then end.

**Episode 5 exception:** the RM5 punchline deliberately overrides the title
card — a 0.3s stunned beat followed by a **hard cut to pure black** with a
comedic percussion hit. No text, no credits, no CTA. Do not add a card to Ep. 5.

## 6. Audio-Driven Pacing (MANDATORY)

- Scene and shot durations are locked to the audio script timings in
  `audio-script.json`. Frames = seconds x FPS (30).
- Maximum `0.5s–0.8s` buffer between audio lines.
- ZERO 5–9 second silent gaps. If a beat feels long, cut it or fill it with
  narration — never leave dead air.
- Generate TTS with the project script:
  `python scripts/generate_tts.py e2_` (from `remotion/`).
- Voice mapping lives in `generate_tts.py`; each distinct character gets a
  distinct voice where possible.
- SFX and BGM cues are procedural beds generated by
  `python scripts/generate_audio_beds.py` (stamp, paper slide, door slam, shop
  bell, tense underscore, warm acoustic underscore). Mount them in the scene
  `<Sequence>` with `<Audio>` at the cue frames listed in the script.

## 7. Camera & Animation Standards

- Never repeat the same static camera angle more than twice in a scene. Use
  smooth eased push-ins, pans, cutaways and over-the-shoulder shots like Ep. 1.
- Characters are faceless: exaggerate body language — head shakes on Y axis,
  nods, shoulder slumps, hand gestures, subtle idle breathing.
- No stiff A-poses. No prop clipping (hands through laptops, folders through
  desks). Give distinct characters distinct hair, outfit colors and proportions.
- Keep environments distinct. Never reuse the Buloh FC office as a bakery or a
  sponsor office. No outdoor signposts indoors.
- Use `<SafeArea />` and `<CutFlash />` in every scene sequence.

## 8. Definition of Done

Before an episode is called finished:

- [ ] `script.md` and `audio-script.json` exist and match the composition.
- [ ] Narrator and character lines alternate; no narrator-only stretches.
- [ ] All copy is casual Malay; no formal register, no CTA.
- [ ] Dual subtitles render correctly (gold italic narration / gold-labelled
      white dialogue).
- [ ] Final line hard-cuts to the black `BULOH FC / EPISOD X` title card (Episode 5: hard cut to pure black instead).
- [ ] No silent gap over 0.8s; no repeated static angle; no clipping.
- [ ] `npm run studio` opens the composition; a still render succeeds.
- [ ] Story docs (`remotion/story/`) match the current canon in Section 9.

---

## 9. Series Canon (after Episode 5)
Single source of truth for numbers and roster continuity. Episode entries below
describe the state *at the time of that episode*; this section is the state now.

- **Club debt:** **RM331,500** (RM450,000 at Ep. 1 → RM381,500 before Ep. 5 →
  RM331,500 after the sale). **KOS GAJI: -35%**. No other figure is current.
- **Transfer income:** **RM50,000** from a Kelab Divisyen 4 club for Karim; all
  of it went to debt. Target remains **Divisyen 1**.
- **Roster:** **Karim (#8)** — former captain / centre midfielder — **departed in
  Ep. 5**; his armband stays on the Boss's desk and the captaincy is vacant.
  **Azam (#7)** — Defender, fan character **@akudingin-d1f**, salary **RM5** —
  joins with the signature entrance **"PERTAMA!"**.
- **Fan easter egg:** the `@akudingin-d1f — "Pertama"` card is an in-world detail
  only and is **never** an engagement prompt.
- **Continuity reference:** [`remotion/story/storyline.md`](./remotion/story/storyline.md).
