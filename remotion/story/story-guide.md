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

## Season 1 Quick Reference (Episodes 6–12, reworked)

- **Format:** 1080x1920 @ 30fps, 40–45s, 0–2s pattern-interrupt hook, first cut by frame 60, standard 72-frame EndCard, no CTAs.
- **Storytelling standard:** dialogue carries the story; the narrator only bridges. HUD digits are never spoken — numbers live in overlays and at most one narrator line. Rivals get real personalities and the RM5 salary is a running gag.
- **Cast:** BOS (`voice_3`), JURULATIH (`voice_2`), PEGUAM (`voice_2`), AZAM #7 (`voice_5`), FARID #9 (`voice_4`), DANIAL #1 GK (`voice_5`), KAPTEN ZAKI (`voice_2`), PAK DIN (`voice_2`), RAYYAN (`voice_4`), KAPTEN BOB (`voice_5`), KAPTEN MALIK (`voice_3`), PENJAGA GOL BESI (`voice_2`), PENGADIL (`voice_2`), KARIM away cameo (`voice_4`, `characters/character-karim-away.js`).
- **Episode one-liners:**
  - **Ep. 6 Janji Bank** — armband covenant + 0–2 loss; "Armband tak bayar hutang. Gol yang bayar."
  - **Ep. 7 Menang Pertama** — otai mind games; first goal told in-scene; Azam refuses a raise until the trophy.
  - **Ep. 8 Duit vs Maruah** — tunnel bribe; Bos keeps the envelope as evidence; Farid's double wins it with pride.
  - **Ep. 9 Hutang Naik Balik** — night-training motif; floodlight blows; the phone call; Azam's trophy promise.
  - **Ep. 10 Hidup Mati** — 4–3 chaos; Azam-block → Farid-winner; the RM5 legend spreads; Besi Waja planted.
  - **Ep. 11 Separuh Masa Neraka** — Malik's machine; AZAM's costly yellow; locker-room despair; the armband handover cliffhanger.
  - **Ep. 12 Juara Divisyen 5** — Azam's corner header 2-2; staged 1v1 winner; LUNAS; Karim in the tribun: "Aku kata dulu — jangan jual kapten aku."
- **Settings:** `ClubOffice`, `LockerRoomApp`, `ModularPitchZone` (center/penalty/touchline), `MatchTunnel`, `PitchCrisisNight`, and the new `PitchHeroStandApp` finale grandstand (`environments/pitch-hero-stand.js`).
- **Ending:** every episode hard-cuts to the black `Buluh FC / EPISOD X` card. Zero CTA.
