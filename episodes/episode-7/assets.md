# Episode 7 — Character & Environment Assets

This asset map follows the established Buluh FC design language. New assets must match the existing stylised 3D toon look: rounded proportions, warm skin palettes, dark mesh outlines, simple readable silhouettes, and soft cinematic shadows. Do not switch to photorealistic character rendering.

## Episode context

Final pre-season training and pre-Matchday preparation. **Matchday 1 kicks off in Episode 8** — nothing in this episode shows a competitive match being played.

## Character continuity

| Asset | Episode 7 use | Design direction |
|---|---|---|
| `SoccerCoachOutfitApp` (JURULATIH) | Scenes 1, 4 and 5 | Navy tracksuit, orange whistle; `talk` pose with live arm gesture; full body inside frame in the hook shot |
| `BossApp` (BOS) | Scene 2 (dark `charcoalOwner` blazer) and Scene 4 (sideline technical area, off the drill grid) | Salt-and-pepper side-part hair; the new higher-contrast dark blazer keeps the toon shading steps readable in the warm office light |
| `SoccerOutfitApp` — Rizal (#10, print `RIZAL`) | Scenes 1, 3 and 5 | Back/front print via `setPlayerPrint('RIZAL', 10)`; `stride` pose in drill shots; `setArmbandVisible(false)` — captaincy is vacant |
| `AzamApp` (#7) | Scenes 1, 3 and 5 | Swept quiff, Buluh FC match jersey; `armband.visible = false`; faceless body language carries the rumour exchange |
| Unnamed squad players (`SoccerOutfitApp`) | Scenes 1, 4 and 5 | Red/white kit, `stride` pose, blank print, no armband |

All players are explicitly `setArmbandVisible(false)` and Karim (#8) never appears. `LawyerApp` (navyOwner) sits opposite Boss in the office scene.

## Environment continuity

- **Scenes 1, 4, 5 — `StadiumApp`** with Episode 7 training props built procedurally in `remotion/src/Episode7/scenes/pitchScene.js`:
  - 6 bright orange cones (`ConeGeometry`, whistle-orange `0xf27d31`) in two drill lanes;
  - 3 footballs (sphere + seam torus) on the grass;
  - water crate with two bottles by the coach's spot;
  - all props use the environment's own toon/std material helpers and are disposed on teardown.
- **Scene 2 — `Episode6OfficeApp`**: reuses the Episode 6 office dressing — finance ledger (`RM326,500`), `PERJANJIAN BERSYARAT` conditional agreement, stadium-view window — plus a new unworn captain's armband prop on the desk. Key light clamped to ≤1.15 so the toon steps do not blow out.
- **Scene 3 — `LockerRoomApp`**: the left-wall notice board reads `PERLAWANAN 1 / BULUH FC / v HARIMAU LEMBAH FC` (locked against `division-5-clubs.md` Matchday 1); the treatment table stays clear of both camera sightlines; a new unworn captain's armband prop sits on the right bench.

## Viewer library

No new viewer entries. The props and armband are scene-level procedural dressing, not reusable character modules.

## Story continuity props

- Finance ledger shows the unchanged debt: **RM326,500**. No result or verbal offer changes it.
- The conditional paper keeps the stadium-seizure freeze until the end of the Division 5 season.
- The unworn captain's armband appears twice (desk + locker bench): the captaincy remains vacant.
- Notice board fixture is locked to Matchday 1: `Buluh FC vs Harimau Lembah FC` (see `remotion/story/division-5-fixtures.md`).
- Metro Selatan's foreign-striker rumour is dialogue only — no opposing players are shown.

## Render handoff

Scenes mount the shared modules through `remotion/src/scene/stageKit.js` (`createStage`) with the declarative actor specs plus the `setup` hook for kit prints. Check framing, prop placement and continuity with still renders before the final `npm run render:ep7` output.
