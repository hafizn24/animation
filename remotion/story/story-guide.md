# Buluh FC — YouTube Shorts Story & Pacing Guide

> **Production rules govern every storytelling decision:**
> [`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md).
> The old "no captions / spoken CTA" approach is **retired** — Episode 1's dual
> subtitle design and clean gold-divider title card are now the standard.
> Episode 5 follows the standard title-card rule; its runtime was rebuilt from
> natural-speed TTS and now sits at 45.3s (no exceptions active).

## Target Metrics & Format
- **Target Runtime:** ~42–55 seconds (strictly under 60s). Episode 5: **45.3s / 1,359 frames** from natural 1.0x audio, no stretch padding.
- **Aspect Ratio:** 9:16 vertical, 720x1280 @ 30fps. **Episode 5 master: 1080x1920 @ 30fps**, with the same overlay design scaled 1.5x.
- **Language:** casual spoken Malaysian Malay (*Bahasa Melayu santai*).
- **Structure:** alternating NARRATOR + CHARACTER DIALOGUE lines. Episode 5 runs character dialogue only (Bos / Karim / Jurulatih / teammates / Azam) — no narrator-only stretches.
- **Series canon after Ep. 5:** debt **RM331,500** (from RM450,000 → RM381,500; `KOS GAJI: -35%`). **Karim (#8) departed**; **Azam (#7, Defender, @akudingin-d1f, RM5)** joins with *"Assalamualaikum. Saya Azam. Defender baru."* See [`storyline.md`](./storyline.md) for the full canon snapshot.

## The 4-Beat Episode Structure
1. **Hook (0:00–0:04)** — start on the stakes. Hard SFX on frame 1. Gold italic
   narrator subtitle. No slow atmospheric intro.
2. **Escalation (0:04–0:18)** — reach the confrontation before 0:15. Distinct
   locations, hard cuts, no dead air. Character dialogue with gold speaker
   labels.
3. **Emotional Turn (0:18–0:30)** — warmth/hope beats against the cold setup.
4. **Dramatic Close (0:30–0:42)** — sharp final line, then a **hard cut** to the
   clean black `Buluh FC / EPISOD X` title card. **No CTA, ever.**

## Subtitle Design (Episode 1 standard)
- Narration → italic warm gold serif at bottom of frame.
- Dialogue → white sans-serif with uppercase gold speaker label above.
- Both timed to the audio; no permanent overlay, no engagement bait.

## Audio-Driven Pacing
- Durations come from `episodes/episode-X/audio-script.json`.
- Max 0.5–0.8s gap between lines. Zero 5–9 second silent gaps.
- TTS voices are assigned per character in `scripts/generate_tts.py`.

## Visual Storytelling
Because characters are faceless, exaggerate body language: head shakes,
nods, slumped shoulders, hand gestures, breathing. Environments must be
visually distinct (e.g. cold sponsor office vs warm bakery vs club office).

## 0–2s Pattern-Interrupt Hook (Episode 3+)
Frame 0 opens at full brightness on action — never a fade from black or a held
wide shot. A bold 3–5 word `HookTitle` spring-pops inside `SafeArea` for 1.5s;
the first camera cut lands by frame 45. The first TTS clip (`_01`) has its
leading silence trimmed and a sharp SFX transient fires on frame 0. See
[`PRODUCTION_RULES.md`](../../PRODUCTION_RULES.md) section 0.

## Factions & Rivals
| Faction | Role | Look / Notes |
|---|---|---|
| **Buluh FC** | The underdog home side | Red/white striped shirts; the division-5 club fighting for survival. |
| **Hulubalang United** | Heavy favourites / rival in Ep. 3 | High-contrast black-and-orange strip with a gold-clad goalkeeper. Arrogant favourites humbled 3–0 in the friendly. Only 2–3 rivals appear per shot. |

## Episode 3 Quick Reference
- **Title:** Perlawanan Persahabatan: Buluh FC vs Hulubalang United (3–0).
- **Five beats:** cold-open Goal 1 (0–3s) → stakes + Goal 2 (3–12s) → banger Goal 3 (12–25s) → fans believe (25–34s) → season-kickoff cliffhanger (34–42s).
- **Continuity:** the Kek Maju bakery owner from Ep. 2 is on the touchline; her shop name sits on the sideline ad-board.
- **Subtitles:** casual Malay line plus a smaller English translation line, both above the Shorts bottom/right dead zones.
- **Ending:** captain's final line → referee whistle + triumphant BGM swell → hard cut to the `Buluh FC / EPISOD 3` title card. Zero CTA.

## Episode 4 Quick Reference
- **Title:** *RM50,000 Untuk Karim*. **Runtime:** 1,530 frames / 51.0s @ 30fps.
- **Setting:** `ClubOffice` — dim plaster room, warm desk lamp, tactics whiteboard, half-open backlit doorway.
- **Beats:** bomb drops (`e4_01`, hook `RM50,000 UNTUK KARIM.`) → heart vs survival (`e4_02`–`e4_09`, `TransferOfferHUD` on `e4_05`–`e4_06`) → 1.3s dead silence + slow reveal pan to Karim in his `KARIM 8` jersey (`e4_10`) → hard cut.
- **Cast:** Boss (`voice_3`), Coach (`voice_2`), Karim (`voice_4`, then-captain / CM #8 / friendly MVP / highest earner — departed in Ep. 5). All `e4_` clips are lead-silence trimmed.
- **Ending:** muted low bass hit on `e4_10` → hard cut to the `Buluh FC / EPISOD 4` title card. Zero CTA.

## Episode 5 Quick Reference
- **Title:** *Pengorbanan & Nombor 7 Baru*. **Runtime:** 1,359 frames / 45.3s @ 30fps, 1080x1920 (format upgrade only; runtime in the normal band). Natural 1.0x TTS, tight 5–8 frame gaps, 90-frame debt ticker, 3-frame rapid-fire punchline.
- **Continuity:** Karim (#8) sacrifices himself and accepts the **RM50,000** Division 4 transfer so the club survives; the full fee goes to debt. **Debt: RM381,500 → RM331,500**, **KOS GAJI: -35%**.
- **Roster after this episode:** **Karim (#8, former captain) departed.** **Azam (#7, Defender, fan character @akudingin-d1f, salary RM5)** joins on **"Assalamualaikum. Saya Azam. Defender baru."** — his fan card reads *"Bang saya nak masuk Buluh FC"*, never a "comment below" prompt. No new captain named.
- **Settings:** `ClubOffice` (Act 1) → `LockerRoomApp` (Acts 2–3). Azam (#7, defender) is a new rig sharing Karim's proportions.
- **Beats:** Karim's sacrifice and debt ticker (`RM381,500 → RM331,500`, `KOS GAJI: -35%`) → `ESOKNYA...` + #7 rumour → Azam's reveal + 1.5s fan comment card → `Lima ringgit.` punchline.
- **Audio:** Bos (`voice_3`), Karim (`voice_4`), Jurulatih (`voice_2`), teammates, Azam (`voice_5`). `e5_06` J-cuts 0.5s into Act 2.
- **Ending:** 0.25s stunned beat → comedic percussion hit → standard 72-frame **Buluh FC / EPISOD 5** EndCard. No CTA.

## Division 5 title-run quick reference (Episode 6 onward)

- **Format:** 1080x1920 @ 30fps, 40–46s target (never above 51s), 0–2s
  pattern-interrupt hook, first cut by frame 60, 72-frame EndCard, no CTAs.
- **Language:** casual Malay plus a smaller English line under every subtitle;
  narration bridges at most twice per episode on an unused voice.
- **Sources of truth:** `audio-script.json` wins over `script.md` and code;
  `story/*.json` wins over prose. TTS rows and `(voice, speed, pitch)` come
  from the JSON and `story/cast.json` for Episode 6+.
- **Clock:** `BULAN n • MD m`, `HUTANG` always, `KITI` only in instalment
  episodes. No line merely reads the HUD aloud.
- **Arcs:** Freeze (6–11), Antagonist (12–17), The fall (18–22), Champions
  (23–27). Champion is decided on MD14, Buluh vs Hulubalang United.
- **Cast:** returning Bos, Jurulatih, Peguam, Penaja, Kek Maju, Azam (#7), Rizal
  and the Ep 3 teammates; at least six new named Buluh players; one recurring
  off-pitch antagonist. No Karim.
- **Settings:** reuse `ClubOffice`, `LockerRoomApp`, `StadiumApp`,
  `PlayersTunnelApp`, `BakeryApp`, `SponsorOfficeApp`, `LenderBoardroomApp`,
  `ManagerOfficeApp`; add one new set per arc from `story/environments.json`.
- **Verification:** `node scripts/verify-episode.mjs N`, `npm run verify:season`,
  `npm test`, `CHROME_PATH=... npm run test:viewer`.
