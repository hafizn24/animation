# Buluh FC — Division 5 Title Run: Claude Code Prompt

Nov 25, 2026 · @Hafiz

Paste this whole document into Claude Code at the repo root of `hafizn24/animation`; it is written to the agent.

## 1. Mission and ground rules

You are working in the Buluh FC repo: procedural Three.js characters, rendered as vertical Malay-language shorts through Remotion. Your job is to wipe the Episode 6–12 draft, repair the tooling and the viewer, lock a new season canon, then build episodes from Episode 6 to the Division 5 title, one gated episode at a time.

**Read these first, in this order:**

1. `PRODUCTION_RULES.md` (sections 0–8 are the format law; ignore sections 10–11, which describe the draft you are deleting).
2. `episodes/episode-5/script.md` and `episodes/episode-5/audio-script.json`: the reference for every new episode.
3. `remotion/src/Episode5/Episode5Composition.jsx` plus its `timings.js` and `components/`.
4. `remotion/story/storyline.md` (Ep 1–5 canon only).

**Format standard for every new episode (copy Ep 5):**

| Item | Rule |
| --- | --- |
| Frame | 1080x1920, 30fps, 9:16 |
| Length | 40–46s target, never above 51s (Ep 2–5 run 42–51s; Ep 1's 74.8s is an outlier, not a target) |
| Language | Casual Malaysian Malay on screen and in audio, plus a smaller English line under every subtitle (MS+EN) |
| Structure | Dialogue-led. Narrator only bridges, at most 2 lines per episode, on a voice no speaking character in that episode shares |
| Hook | Frame 0 bright and moving, 3–5 word `HookTitle` for frames 0–45, first cut by frame 45–60, sharp SFX transient on frame 0, first TTS clip lead-trimmed |
| Audio | Natural 1.0x TTS, both ends silence-trimmed, no time-stretching; gaps of 5–8 frames; the one deliberate longer silence per episode is flagged in the JSON |
| Ending | Hard cut to the 72-frame black `Buluh FC / EPISOD X` card with the thin gold divider. No CTA, ever |
| Source of truth | `audio-script.json` wins over `script.md` and over code |

**Ground rules**

- Never edit Episodes 1–5: their scripts, compositions, audio, scenes or characters stay byte-identical. Prove it (Phase 1 regression gate).
- Work on branch `reset/division5-title-run`, commit at the end of each phase, never force-push, never commit `.env` or `ILMU_API_KEY`.
- Stop and ask the user at every **gate** in this document. Do not guess past a gate.
- Never call the TTS API without the user's go-ahead for that specific episode.
- Verify claims in this document against the repo before relying on them; report any that are wrong.
- Everything deterministic: no `Math.random()` or `Date.now()` in scenes or environments (use seeded helpers).
- Reply to the user in English; all on-screen and spoken lines in casual Malay (`tak berbaloi`, `boleh la`, `dah`, `kat`, `bro`), never the stiff register (`beliau`, `apakah`, `sesungguhnya`).

## 2. Locked decisions

The user already answered these. Do not reopen them; build on them.

| Topic | Decision | What it means for you |
| --- | --- | --- |
| Debt clock | **Freeze + monthly instalments** | The 30-day "Hari X" countdown is retired (it only existed in Ep 1–2). Peguam grants a season-long foreclosure freeze, conditional on a fixed instalment at every month-end. Miss one and the freeze is void. Ep 6 must explain this change on screen, in dialogue, inside its first 25 seconds. |
| Length | **20+ episodes** | Plan 22 episodes (Ep 6–27). More are allowed if the arc map needs them; fewer than 20 is not. |
| League | **8 clubs, double round-robin** | 14 matchdays, 3 points a win, 1 a draw, tiebreak head-to-head then goal difference. Champion is promoted. Buluh FC must not be champion before the final matchday. |
| Money | **Instalments from income; title bonus clears the balloon** | Win, draw and gate income fills a kitty; the kitty pays each instalment; fines and emergencies add to the debt; the Champion Prize plus Nexus Sports promotion bonus clears what is left (LUNAS). |
| Additions | **All four approved** | New rival club and captain per rival; more named Buluh FC squad members; one recurring off-pitch antagonist; at least one new environment per monthly arc. |
| Karim | **Fully out of the story** | He was sold in Ep 5. No cameo, no call, no letter, no Season 2 reunion tease. The gold armband stays on Bos's desk until the captaincy is resolved early in Arc 1 (propose who; Azam is the obvious candidate). |
| Purge | **Total** | Everything Ep 6–12 created or used exclusively is deleted: code, audio, tests, docs, viewer entries, league data, rival names. Git history keeps it (see Phase 1). |
| Viewer | **Rebuild** | `index.html` becomes a thin shell over a registry-driven viewer (Phase 2). |

**Canon carried over from Ep 1–5 (do not contradict):**

- Debt is **RM331,500** after Ep 5 (RM450,000 at Ep 1, RM381,500 before the transfer). **KOS GAJI: -35%** after Karim's RM50,000 sale to a Divisyen 4 club.
- **Azam (#7)**: defender, fan-inspired (`@akudingin-d1f`), salary **RM5**, entered on "Assalamualaikum. Saya Azam. Defender baru."; the RM5 joke is a running gag, keep it alive.
- Recurring Ep 1–5 cast: **Bos** (owner), **Jurulatih** (coach), **Peguam** (lender's lawyer), **Penaja** (Nexus Sports exec), **Kek Maju** bakery owner, Apex Corp exec, Rizal and the Ep 3 teammates. **Hulubalang United** (Ep 3 friendly opponents, black-and-orange, heavy favourites) join Division 5 as the main title rival.
- Karim and Azam rigs, the club office, locker room and stadium stay as they are.

**Proposed defaults (the user has not set these; adopt them, flag them in your report, and change only with a reason):** the numbers in Phase 3 and the arc map in Phase 5.

## 3. Phase 0 — Baseline (no gate)

The repo is not green today. Record exactly what is broken before you change anything, then freeze a reference for Episodes 1–5.

**Known problems (verified against the repo; re-check each and report the result):**

| # | Problem | Evidence |
| --- | --- | --- |
| 1 | `remotion/scripts/generate_tts.py` has an unresolved merge conflict (`<<<<<<< HEAD` at line 178, `=======` at 277, `>>>>>>> parent of 392afeb` at 278) | `python3 -m py_compile` fails with a SyntaxError, so no TTS can be generated at all |
| 2 | `node test.mjs` crashes | `ReferenceError: FaridApp is not defined` at line 180 (variants used but never imported) |
| 3 | `npm run verify:season1` crashes | `story/season1-debt.json` does not exist (README and rules cite it) |
| 4 | Ep 6–12 are not renderable | `remotion/src/Root.jsx` registers only `FootballMatch` and Episode1–5; `remotion/package.json` has render scripts only for Ep 1–5, while the README lists Ep 6–12 scripts |
| 5 | Viewer leaks WebGL contexts | Details in Phase 2 |

`test-pose.mjs` and `scripts/check-league.mjs` pass today; they are Season-1 tests and are deleted or rewritten in Phase 1.

**Steps**

```bash
git checkout -b reset/division5-title-run
git tag pre-reset-ep1-5          # local tag; git show pre-reset-ep1-5:<path> recovers anything purged
npm install && (cd remotion && npm install)
npm test; python3 -m py_compile remotion/scripts/generate_tts.py   # record both results, do not fix yet
```

Then render the **Ep 1–5 regression stills**. They are the proof that the purge touched nothing that ships:

```bash
cd remotion && mkdir -p out/baseline
for spec in Episode1:2245 Episode2:1260 Episode3:1260 Episode4:1530 Episode5:1359; do
  id=${spec%%:*}; n=${spec##*:}
  for f in 0 45 $((n/2)) $((n-73)) $((n-1)); do
    npx remotion still $id out/baseline/$id-$f.png --frame=$f
  done
done
```

That is 25 stills (frame 0, frame 45, the midpoint, the last dialogue frame, the last frame of the EndCard). `out/*.png` is gitignored, so they stay local. If a still render fails at baseline, record it and exclude that frame from the gate instead of hiding it.

**Exit:** commit nothing yet; write the baseline table (what passed, what failed, what you could not run) at the top of your running report.

## 4. Phase 1 — Total purge of Episodes 6–12 (no gate, commit at the end)

Delete everything the Ep 6–12 draft created or used exclusively. Use `git rm`. Work from the lists below, but trust the grep gate at the end over the lists.

**Delete**

| Path | Notes |
| --- | --- |
| `episodes/episode-6` … `episode-12` | scripts and `audio-script.json` |
| `remotion/src/Episode6` … `Episode12` | compositions and scene directors |
| `remotion/public/audio/tts/e6_*` … `e12_*` | 83 mp3 files |
| `remotion/src/Season1/` | `cameraKit.js`, `actionKit.js`, `sceneKit.js` (see the history note below) |
| `remotion/src/components/` | `SeasonEpisode`, `SeasonDebtTickerHUD`, `StartingXICard`, `LeagueTableOverlay`, `MatchHUD`, `Season2Hook` |
| `characters/` | `character-variants.js`, `character-karim-away.js` |
| `environments/` | `modular-pitch-zone.js`, `pitch-crisis-night.js`, `pitch-hero-stand.js` |
| `story/` | `division5-league.json` (the whole folder; Phase 3 recreates it with new data) |
| `scripts/` | `check-league.mjs`, `fix-scene-keys.mjs`, `retime-from-audio.mjs`, `sync-voices.mjs`, `verify-season1.mjs` |
| `test-pose.mjs` | imports `Season1/sceneKit.js`. If any part of it tests only `rig-kit.js` or Ep 1–5 rigs, rewrite that part against those and keep it; otherwise delete the file |
| `remotion/out/**` committed PNGs | `git rm -r --cached remotion/out` (already covered by `.gitignore`) |

**Edit, do not delete**

- **`remotion/scripts/generate_tts.py`**: resolve the merge conflict by removing lines 178–278. Check first that the `HEAD` side holds only `e6_`–`e12_` rows and the other side is empty, and that every `b`, `e2_`–`e5_` row above line 178 is untouched (`git diff` must show no change to them). Then remove the Season-1-only pieces: voices `farid`, `danial`, `zaki`, `pakdin`, `rayyan`, `bob`, `malik`, `besikeeper`, `pengadil`, the `narrator_s1` entries, `S1_PREFIXES`, and the `narrator_s1` branch of `voice_profile()`. Replace `NATURAL_PREFIXES` with a rule that treats every episode number ≥ 5 as natural-speed (parse the number from the prefix), so Ep 6+ need no code change. `python3 -m py_compile` must pass.
- **`test.mjs`**: delete the `KarimAwayApp` import (line 12) and everything from the `// --- Episode 12 finale: KarimAwayApp` section (line 146) to the end of the Season-1 blocks. Keep the Ep 1–5 sections and the closing summary line.
- **`package.json`**: remove `verify:season1`, `tts:sync`, `retime`, `check:league`; make `test` run only what still exists.
- **`index.html`**: it imports deleted modules, so it would be dead on arrival. In this phase only, remove the four Ep 6–12 entries everywhere they appear (`karimAway`, `pitchHeroStand`, `pitchCrisisNight`, `modularPitchZone`: the `import` lines, the `<option>`s, `characterClasses`, `characterLabels`). Phase 2 rebuilds the file properly.
- **Docs**: strip every Season 1 / Ep 6–12 passage from `README.md`, `PRODUCTION_RULES.md` (sections 7 and 10 references to `Season1/`, all of 10, 10.5 and 11), `remotion/story/storyline.md` and `remotion/story/story-guide.md`. Do not write new canon yet; Phase 4 does that.

**Keep (Ep 1–5 depend on these, whatever their names suggest)**

- `characters/rig-kit.js`: `Episode1/sceneKit.js` imports it. It sounds like a Season 1 file; it is not.
- Characters `default`, `suit`, `coach`, `soccer`, `casual`, `chairman`, `new-owner`, `sponsor`, `karim`, `azam`, `hair`; root `Inspector.js`.
- Environments `stadium`, `locker-room`, `manager-office`, `lender-boardroom`, `players-tunnel`, `sponsor-office`, `bakery`, `club-office`.
- Components `Scene3D`, `SafeArea`, `Subtitles`, `HookTitle`, `TransferOfferHUD`, `ScoreboardHUD`; `FootballMatch.jsx`; `remotion/src/scene/`.
- Audio: TTS `b*` and `e2_`–`e5_`, every file in `bgm/` and `sfx/`, and `generate_audio_beds.py` (audit it; only remove something that is exclusively Ep 6–12).

**History note.** The user chose a total purge, so the camera and action kits go too. Ep 6 will need trimmed replacements. You may read the old code with `git show pre-reset-ep1-5:remotion/src/Season1/cameraKit.js` for reference (its rules were: FOV 38–42, look-at height 1.25–1.45, at least 4.6 units of actor clearance), but rebuild only what an approved episode script needs, as new files in `remotion/src/shared/`, and say in the commit message that the idea came from history.

**Exit gates (all must pass before you commit)**

1. **Grep gate.** This returns nothing:

```bash
grep -rniE "Season1|SeasonEpisode|SeasonDebtTicker|StartingXI|LeagueTableOverlay|MatchHUD|Season2Hook|character-variants|VariantPlayer|karim-away|KarimAway|pitch-hero|PitchHero|pitch-crisis|PitchCrisis|modular-pitch|ModularPitch|division5-league|season1|Episode(6|7|8|9|10|11|12)\b|episode-(6|7|8|9|10|11|12)\b|\be(6|7|8|9|10|11|12)_[0-9]|Taktik Jaya|Otai Kampung|Vanguard Elite|Kilat Rovers|Besi Waja|Zaki|Pak Din|Rayyan|Malik|Farid|Danial|\bBob\b" . --exclude-dir=.git --exclude-dir=node_modules --exclude=package-lock.json
```

2. **Ep 1–5 regression.** Re-render the same 25 stills into `remotion/out/after/` and compare with `out/baseline/`. Identical, or at most 0.05% of pixels differing by more than 2/255. Anything else is a failure to investigate, not a threshold to loosen.
3. `npm test` is green, `python3 -m py_compile remotion/scripts/generate_tts.py` passes, `node --check` passes on every `characters/*.js` and `environments/*.js`.
4. `npx remotion compositions` lists exactly `FootballMatch` and `Episode1`–`Episode5`.
5. `index.html` loads headless with no module-import errors (the full 18-entry smoke test comes in Phase 2).

Commit: `chore: total purge of Episode 6–12 draft (Division 5 reset)`.

## 5. Phase 2 — Fix and rebuild `index.html` (commit at the end)

`index.html` is a 10,274-line 3D viewer for the characters and environments (`npm start` serves it on port 3000). I tested it at HEAD in headless Chrome by selecting every dropdown option in turn, with three.js served locally.

**What is broken (measured)**

- **WebGL context leak.** All 22 options load with no JavaScript errors, but from the 16th load on Chrome logs `Too many active WebGL contexts. Oldest context will be lost.` The loader calls `renderer.dispose()`, which frees GPU resources but does **not** release the GL context. Adding `renderer.forceContextLoss()` right after it made the same 22-option run completely clean. The comment next to that line ("free the WebGL context") is wrong.
- **About 9,800 lines are copies.** `index.html` redefines 16 classes inline (`App`, `SuitOutfitApp`, `StadiumApp`, `BakeryApp`, the inspector and more) although `characters/*.js`, `environments/*.js` and `Inspector.js` already export them. The inline `StadiumApp` is 1,666 lines against 1,664 in the module, so drift is likely small but unverified.
- Four Ep 12-only entries (already removed in Phase 1).
- Smaller issues to fix while you are there: a rapid double switch can race two `init()` calls; load errors use `alert()`; the GLTF button swaps the character without disposing the old textures.

**Target design**

```
index.html                 thin shell: importmap, styles, toolbar markup, <script type="module" src="viewer/main.js">
viewer/registry.js         ENTRIES = [{ id, label, group: 'Characters' | 'Environments', module, exportName }]
viewer/loader.js           load/unload one entry, owns the single active manager
viewer/main.js             wires toolbar, builds the <select> from the registry, deep link ?id=azam
Inspector.js (root)        the one inspector; merge the better of root vs inline versions into it
scripts/smoke-viewer.mjs   headless smoke test (below)
scripts/check-viewer-registry.mjs   fails if any characters/*.js or environments/*.js *App class is missing from the registry
```

**Rules for `loader.js`**

1. Entries load through dynamic `import()`, so a broken module breaks one entry, not the viewer.
2. Unload order: set `manager._dead = true`, call `manager.dispose()`, then `renderer.dispose()`, then `renderer.forceContextLoss()`, then remove the canvas and the inspector panel.
3. A load counter makes sure only the latest requested entry finishes; stale `init()` results are disposed immediately.
4. Errors show in an inline panel with the entry id and message. No `alert()`.
5. The GLTF button disposes the replaced character's geometries, materials and textures. Reset View, Inspector toggle and the loading indicator keep working.
6. The dropdown is generated from the registry (one `optgroup` per group). Adding a character later is one registry line. Keep the three.js importmap on the CDN so the page works without `npm install`.

**Registry content after the purge: 18 entries**

| Group | Entries |
| --- | --- |
| Characters (10) | `default`, `suit`, `coach`, `soccer`, `casual`, `chairman`, `newowner`, `sponsor`, `karim`, `azam` |
| Environments (8) | `stadium`, `locker`, `managerOffice`, `boardroom`, `playersTunnel`, `sponsorOffice`, `bakery`, `clubOffice` |

Keep the existing ids and labels so old bookmarks and the test suite keep meaning the same thing.

**Parity gate before you delete the inline classes.** For each of the 18 entries, load it from the old inline class and from the module at the same fixed camera, then compare the canvases and the mesh count. A mismatch is not yours to resolve silently: list it for the user with a screenshot pair and say which version looks newer. Only entries with no meaningful difference may switch to the module without asking.

**`scripts/smoke-viewer.mjs`**

- Add `playwright-core` as a devDependency and drive the system Chrome (`CHROME_PATH` env var, with a clear error if it is missing). Serve the repo from a tiny static server on an OS-assigned port, and intercept the three.js CDN URLs to serve `node_modules/three` so the test needs no network.
- For every registry entry: select it, wait for init, then fail on any console `error` or `warning`, page error, dialog, or a canvas that is blank.
- Cycle all 18 entries **twice** (36 loads). The old leak shows up after 16, so 36 loads prove the fix.
- Expose it as `npm run test:viewer`, **not** inside `npm test`, so the plain Node tests still run on machines without Chrome.

**Exit gates**

1. `npm run test:viewer`: 18 of 18 entries pass in both cycles, with zero WebGL context warnings.
2. Temporarily remove `forceContextLoss()` and confirm the smoke test fails with the context warning. If it still passes, the test is not testing the bug; fix the test.
3. `node scripts/check-viewer-registry.mjs` passes; `npm test` still passes (it imports `Inspector.js`).
4. `index.html` is under 200 lines; `npm start` still opens the viewer.

Commit: `fix(viewer): registry-driven viewer, release WebGL contexts on unload`.

## 6. Phase 3 — Season canon (GATE 1: stop for approval)

Write the canon as data first, prose second. Nothing in Phase 4 or 5 starts until the user approves this phase.

**Files to create**

| File | Holds |
| --- | --- |
| `story/season-bible.md` | Logline, tone, arc map, antagonist options, open questions (for humans) |
| `story/season-money.json` | Freeze terms, instalment schedule, income rules, shocks, title payout |
| `story/league.json` | 8 clubs, 14-matchday fixture list, planned results, computed standings after each matchday |
| `story/cast.json` | Every recurring character: voice, rig, outfit, quirk, first and last episode |
| `story/environments.json` | Existing and new sets, which arc needs each |
| `scripts/verify-season.mjs` | Recomputes everything above and fails on any contradiction |

**The money model**

1. Match results and gate income flow into a **kitty** (`KITI`).
2. At each month-end the kitty pays that month's instalment against the debt (`HUTANG`).
3. Fines and emergencies add to the debt directly.
4. If the kitty cannot cover an instalment, the freeze is void (a single 7-day cure window may be used once all season).
5. After Matchday 14, the title payout clears the balloon. Anything above the balloon is the club's first profit (a comedy beat; the RM5 salary joke is the obvious payoff).

**Proposed defaults.** The user has not set these numbers. Adopt them, make `verify-season.mjs` prove they close, and report any change you make.

| Parameter | Proposed value |
| --- | --- |
| Opening debt (start of Ep 6) | RM331,500 (canon) |
| Instalment | RM20,000 at each month-end, 4 months, RM80,000 in total |
| Month map | Month 1 = MD1–4, Month 2 = MD5–8, Month 3 = MD9–11, Month 4 = MD12–14 |
| Kitty income | Win RM5,000, draw RM2,000, loss RM0; home gate RM2,500 per home match |
| One-off kitty boosts | Kek Maju community fund, a Nexus mid-season top-up; plot beats worth at most RM15,000 in total |
| Shocks (fines, emergencies) | Add to debt, 2–3 events, at most RM20,000 in total |
| Title payout | RM275,000 = Champion Prize RM75,000 + Nexus Sports promotion bonus RM200,000 |

Check: the worst-case balloon is 331,500 − 80,000 + 20,000 = RM271,500, which the RM275,000 payout clears. Drama constraints: the kitty must be within RM5,000 of the instalment in at least three of the four months, and one instalment must be missed or nearly missed so the cure window is used.

**The HUD replaces "Hari X".** Show `BULAN n • MD m` as the clock, `HUTANG` always, and `KITI` only in instalment episodes. Build it as a new component in `remotion/src/shared/` modelled on Ep 5's `DebtTickerHUD`; do not edit Ep 5's. No line should merely read the HUD aloud; speak a number only when it is the joke or the decision, as Ep 4 and Ep 5 do.

**The league**

- 8 clubs: **Buluh FC**, **Hulubalang United** (Ep 3, black and orange, the main title rival) and **six new clubs**. Do not reuse any name removed in Phase 1.
- Each new club gets: name and 3-letter code, kit colours that differ from every other club (Buluh is red and white), a home-ground flavour, a captain with one clear personality hook, and a voice.
- Fixtures by the circle method, home and away balanced, 4 matches per matchday. Reorder so that **MD14 is Buluh FC vs Hulubalang United**.
- Script all 14 Buluh results; seed plausible rival results. Constraints: Buluh is never champion before MD14, has at least 2 losses and 2 draws, and the final table recomputes (points, then head-to-head, then goal difference) to Buluh on top only after MD14.

**The cast**

- **Returning from Ep 1–5:** Bos, Jurulatih, Peguam, Penaja (Nexus Sports), Kek Maju, Azam (#7, RM5), Rizal and the Ep 3 teammates.
- **New named Buluh squad: at least 6** (a goalkeeper, two defenders, two midfielders including whoever fills Karim's role, a striker). Each has a name, number, position, one personality line, a signature gesture, a voice and a rig. Resolve the captaincy early in Arc 1 (propose a candidate; Azam is the obvious one).
- **One recurring off-pitch antagonist.** Present three options with a one-line pro and con each and recommend one. Suggested set: (A) a land developer who holds an option on the stadium site and profits if the freeze breaks (recommended: it ties directly to the stakes and keeps Peguam a neutral clock-watcher); (B) the owner of Hulubalang United; (C) a league official who weaponises licence rules and fines. The user picks at this gate.
- **Voices.** The TTS provider offers only `voice_1`–`voice_6`, so differentiate by speed and pitch. Record `(voice, speed, pitch)` per character in `story/cast.json`. No two speakers in the same scene may share a voice within ±0.04 speed and ±0.04 pitch, and the narrator never shares a voice with a speaker in the same episode. `verify-season.mjs` checks this per episode.
- **Rigs.** No new skeletons. New characters are data-driven variants of the shared rig contract (`characters/rig-kit.js`: `root → pelvis → torso → head/arms`, bounce on `root`, shared face). Create one small factory file only when the first approved episode needs it, and add each new character to the viewer registry.

**Environments**

- At least one **new** environment per monthly arc (examples: a bank branch, a kampung training ground, a press room, a rival clubhouse). List them in `story/environments.json` with the arc that needs them, and build each only when its first episode script is approved.
- Reuse what exists: `club-office`, `locker-room`, `stadium`, `players-tunnel`, `bakery`, `sponsor-office`, `lender-boardroom`, `manager-office`.
- Keep every set visually distinct (PRODUCTION\_RULES section 7). For matches show 2–4 rigs per shot and carry the other players through UI cards and crowd, not 22 rigs.

**`scripts/verify-season.mjs` must check:** debt arithmetic across episodes; kitty and instalment math; fixture list (every pair twice, one home one away); standings recomputed per matchday including tiebreaks; the Buluh-not-champion-before-MD14 rule; final debt exactly zero only in the title episode; voice collisions; and that every `audio-script.json` HUD value matches these files.

**GATE 1.** Send the user a short summary and stop: logline, the money table with your verification output, the league table after each matchday, the cast sheet, the three antagonist options with your recommendation, the new environment list, the arc map expanded to one paragraph per episode, and any number you changed. Ask for approval or edits. Commit the canon files only after they approve.

Commit: `feat(story): Division 5 title-run canon (money, league, cast, environments)`.

## 7. Phase 4 — Tooling and docs reset (after Gate 1, no further gate)

The draft failed partly because the data lived in three places (the JSON, `script.md`, and a Python manifest) and drifted. Fix that now, so every new episode has one source of truth.

**Tooling**

| Task | Spec |
| --- | --- |
| TTS from JSON | For episodes ≥ 6, `generate_tts.py` reads its rows from `episodes/episode-N/audio-script.json` (`file`, `speaker`, `text`) and takes `(voice, speed, pitch)` from `story/cast.json`. The hard-coded manifest stays for `b` and `e2_`–`e5_` only, and generation for those must not change. Add `--dry-run` (lists files, voices and character counts; no network, no key needed). |
| `scripts/retime.mjs <N>` | Measures each MP3 (`npx remotion ffprobe`, which ships with Remotion), then rebuilds the frame timeline in `audio-script.json` exactly as Ep 5 was built: natural durations, a per-line `gapBefore` (default 6 frames, range 3–8), explicit `beat` pauses, the first clip starting at frame 0, then the 72-frame EndCard. It rewrites `totalFrames` and regenerates the timing table in `script.md`. |
| `scripts/verify-episode.mjs <N>` | Fails unless: JSON and `script.md` agree; every line has an MP3; no gap above 24 frames except flagged `beat` pauses; hook window is frames 0–45 and the first cut is by frame 60; runtime is 40–51s; the EndCard is the last 72 frames; the Malay and English lines are both present; HUD values match `story/*.json`. |
| `scripts/check-repo.mjs` | Fails on merge-conflict markers (`^<<<<<<<`, `^>>>>>>>`, `^=======$`) in tracked source files, on invalid JSON, and on README commands that name a script that does not exist. Part of `npm test`. This would have caught the `generate_tts.py` conflict. |
| Episode registry | New `remotion/src/episodes.js` lists `{ id, component, frames, width, height }`. `Root.jsx` maps over it. The Ep 1–5 entries keep their current ids, sizes (Ep 1–4 are 720x1280, Ep 5 is 1080x1920) and frame counts (2245, 1260, 1260, 1530, 1359) exactly. New episodes read `totalFrames` from their JSON. |
| Render scripts | Add `render:episodeN` to `remotion/package.json` only when episode N exists. Ep 1–5 scripts stay as they are. |
| Shared components | In `remotion/src/shared/`: `EndCard.jsx`, MS+EN `Subtitles.jsx`, `HookTitle.jsx`, and the `BULAN • MD` / `HUTANG` / `KITI` HUD, all sized for 1080x1920 with right padding ≥ 162px and bottom padding ≥ 480px. Create them by **copying the Ep 5 design**, not by importing from or editing Ep 1–5 files. |
| Test fixtures | Tests for `retime` and `verify-episode` generate silent MP3s with ffmpeg into a temp folder. They never call the TTS API. |

**Docs**

- `README.md`: rewrite to match reality. Layout, the commands that exist, render and TTS instructions, test commands. Every command it shows must run.
- `PRODUCTION_RULES.md`: keep sections 0–9 (update 7's camera paragraph to point at `remotion/src/shared/` once those helpers exist, and add `verify-episode` and `verify-season` to the Definition of Done). Add a new section 10, **Division 5 title-run canon**, that points at `story/*.json` and states the instalment rules in five lines. Do not copy numbers into prose where a JSON file already holds them.
- `remotion/story/storyline.md`: keep the Ep 1–5 canon as it is; add the approved title-run section, generated from the bible.
- `remotion/story/story-guide.md`: keep the format rules; replace the Season 1 quick reference with a title-run one.
- Housekeeping: record in the README that Ep 1–4 are 720x1280 and Ep 5 onward is 1080x1920, so nobody "fixes" the mismatch.

**Exit gates**

1. `npm test` green (now including `check-repo`); `python3 -m py_compile remotion/scripts/generate_tts.py` passes; `node scripts/verify-season.mjs` passes.
2. `python3 remotion/scripts/generate_tts.py --dry-run e5_` lists exactly the 16 Ep 5 rows, with no network access.
3. Re-run the Ep 1–5 regression stills against the baseline: identical within the Phase 1 tolerance.
4. `npx remotion compositions` still lists exactly `FootballMatch` and `Episode1`–`Episode5`.

Commit: `chore(tooling): single-source TTS and retime pipeline, repo checks, docs reset`.

## 8. Phase 5 — Episode pipeline and arc map (Ep 6 to the title)

**Arc map (a proposed skeleton; expand it into one paragraph per episode in the bible, which the user approves at Gate 1).** 22 episodes, 14 matchdays, four monthly arcs.

| Arc | Episodes | Matchdays | Month-end beat | Story function | New environment |
| --- | --- | --- | --- | --- | --- |
| 1. Freeze | Ep 6–11 (Ep 6 and 11 off-pitch, Ep 7–10 matches) | MD1–4 | Instalment 1 at the end of Ep 11 | Ep 6 is the deal and the new rules; the captaincy is settled by Ep 8; the new squad gels; first kitty scare | A bank-branch or deal-room set |
| 2. Antagonist | Ep 12–17 (4 matches, 2 off-pitch) | MD5–8 | Instalment 2 at the end of Ep 17 | The antagonist makes his first real move; a squad member is tempted away; Hulubalang's first leg | A rival clubhouse or press room |
| 3. The fall | Ep 18–22 (3 matches, 2 off-pitch) | MD9–11 | Instalment 3 missed or nearly missed; the cure window is used | Low point: squad rift, results dip, the kitty runs dry, the community steps in | A kampung training ground |
| 4. Champions | Ep 23–27 (3 matches, 2 off-pitch) | MD12–14 | Instalment 4, then the title payout | All-in; MD14 vs Hulubalang United decides the title; the debt clears (LUNAS); final line, then the EndCard | The final-day venue |

**The episode loop.** Run it in order for every episode. Never start step 5 before step 2 is approved.

1. **Draft.** Write `episodes/episode-N/script.md` and `audio-script.json` (Malay and English per line, speakers from `story/cast.json`, planned HUD values, cut list, SFX and BGM cues). Offer two hook options for the first 1.5 seconds.
2. **GATE 2 (every episode).** Show the user the full script with both languages, the chosen hook, the estimated runtime, the HUD change, and any new character or environment. Ask two separate questions: is the script approved, and may TTS be generated now? Stop. Allow one revision round, then ask again.
3. **Audio.** `python3 remotion/scripts/generate_tts.py --dry-run eN_` first, then the real run only after the user said yes. If `.env` has no `ILMU_API_KEY`, stop and tell the user. Then `node scripts/retime.mjs N`.
4. **Assets.** Add only what the approved script needs: new characters (data-driven rig variants, plus a registry entry in the viewer and a `story/cast.json` update), new environments (own module, distinct look, seeded, viewer entry), and shared helpers in `remotion/src/shared/` (camera, action, kick-and-goal). Anything new must load in `npm run test:viewer`.
5. **Build.** Scene directors and the composition in `remotion/src/EpisodeN/`, following PRODUCTION\_RULES section 7: face-forward dialogue shots, no static angle repeated more than twice per scene, body-language acting plus the shared face, props attached to hands, actors at least 0.95 apart, bounce on the root. Overlays stay inside the safe zones and never overlap.
6. **Verify.** `node scripts/verify-episode.mjs N`, `node scripts/verify-season.mjs`, `npm test`. Then render stills into `remotion/out/verify/`: frame 0, frame 45, the first dialogue line, every HUD appearance, each cut, the last line and the first EndCard frame. Open every still yourself and fix what you see (clipping, back-of-head shots, HUD or subtitle overlap, unreadable text at phone size) before the user sees anything. Finish with a smoke render, for example `npx remotion render EpisodeN out/epN-smoke.mp4 --frames=0-150`.
7. **Canon.** Update the `story/*.json` files (debt, kitty, standings, cast), the episode entry in `remotion/story/storyline.md`, and the render script. Commit: `ep(N): <title>`.
8. **Report.** Runtime and frames, debt and kitty change, standings after the match, assets added with their file paths, anything that departs from the standard, and the verify output. Ask whether to continue one episode at a time or one arc at a time.

**Ep 6 is the pilot** and gets every gate. It must:

- Open on action under the hook rules, not on exposition.
- Explain, in Peguam's dialogue within the first 25 seconds, why the 30-day countdown is gone: the lender would rather be paid monthly than own an empty stadium, so the freeze holds only while the instalment is paid at each month-end.
- Put the gold armband on Bos's desk as a standing motif (Karim is out of the story, so it is never explained away).
- Introduce at least one new squad member with a distinct voice and a distinct body-language gag.
- Set up the next matchday's opponent from `story/league.json` and end on a hard cut to the `Buluh FC / EPISOD 6` card.

After the user approves Ep 6, ask them for the cadence (one episode per gate or one arc per gate) and keep it until they change it.

## 9. Definition of done, and what you report

**Done means all of these are true, with evidence you can paste:**

- [ ] **Phase 0:** the baseline table (what was red and why) and the 25 baseline stills exist.
- [ ] **Phase 1:** the grep gate prints nothing; Ep 1–5 stills match the baseline; `npm test` is green; `generate_tts.py` compiles; `npx remotion compositions` lists exactly `FootballMatch` and `Episode1`–`Episode5`.
- [ ] **Phase 2:** `npm run test:viewer` passes 18 of 18 entries across two full cycles with zero WebGL context warnings; removing `forceContextLoss()` makes it fail; `index.html` is under 200 lines.
- [ ] **Phase 3:** the user approved Gate 1; `node scripts/verify-season.mjs` passes.
- [ ] **Phase 4:** the TTS, retime and verify scripts work from fixtures without network; `check-repo` is in `npm test`; README commands all run; Ep 1–5 stills still match.
- [ ] **Phase 5 (pilot):** Ep 6 passed Gate 2; `verify-episode 6` and `verify-season` pass; you opened every verification still and fixed what you saw; the render smoke test succeeded.
- [ ] No secrets committed, no Ep 1–5 file changed, no CTA anywhere, no `Math.random()` or `Date.now()` in scenes or environments.

**How to report.** After each phase, and at the end, send the user this and nothing longer:

| Phase | Status | Commit | Evidence (command and result) | Deviations from this prompt |
| --- | --- | --- | --- | --- |

Then two short lists: **risks** (what could still be wrong) and **questions** (what you need decided), and one line naming the next gate.

**When in doubt**

- A gate fails: fix the cause. Never loosen a tolerance, delete a check, or skip a test to make it pass; say what failed and what you changed.
- A statement in this document does not match the repo: trust the repo, say so, and carry on with the intent.
- A decision is not covered here and changes story, cost or a shipped file: ask. A decision that is only about code structure: decide, and note it in the report.
- Do not render a full-length video or call the TTS API unless the loop above says to; both cost time or money.
- Do not add a dependency without naming it and why in the report (`playwright-core` is already approved for the viewer test).
