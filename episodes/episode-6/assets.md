# Episode 6 — Character & Environment Assets

This asset map follows the established Buluh FC design language. New assets must match the existing stylised 3D toon look: rounded proportions, warm skin palettes, dark mesh outlines, simple readable silhouettes, and soft cinematic shadows. Do not switch to photorealistic character rendering.

## Character continuity

| Asset | Episode 6 use | Design direction |
|---|---|---|
| `BossApp` | Scenes 1, 2 and 4 | Salt-and-pepper side-part hair, warm off-white polo, dark trousers; same stylised proportions and outlined toon shading as the existing cast |
| `LawyerApp` | Scene 1 | Charcoal suit, white shirt, dark tie and glasses; formal silhouette in the same toon style |
| Existing Coach | Scenes 2 and 3 | Preserve the current Coach identity and model |
| Existing Azam (#7) | Scenes 3–5 | Preserve the current Azam identity, swept hairstyle and Buluh FC kit |
| `SquadVariationsApp` | Scenes 3 and 4 | Reusable background lineup with varied shirt shades, skin tones and body scale; no need to create 12 individually unique player assets yet |

The new character modules share `characters/character-base.js`, which uses the project's existing hairstyle builder and the same outlined toon-rendering approach as Karim and Azam.

## Environment continuity

- Use the existing stadium asset for training and team-huddle shots.
- Use `Episode6OfficeApp` for the office scenes. It inherits the existing Buluh FC office layout and adds a stadium-view window, finance record book and conditional legal agreement.
- The original `ClubOfficeApp` remains unchanged for earlier episode continuity.

## Viewer library

The following assets are selectable from the root `index.html` viewer:

- Boss — `boss`
- Lawyer — `lawyer`
- Background squad variations — `squad`
- Episode 6 office dressing — `office6`
- Existing Coach, Azam, stadium and other established assets remain available.

## Story continuity props

- Finance record book displays the Episode 6 opening debt: **RM326,500**.
- Kek Maju's RM5,000 contribution is already deducted and must not be deducted again.
- The legal paper represents the conditional stadium-seizure freeze through the end of the Division 5 season.
- Do not display Karim as a current squad member; he has departed.
- Captaincy remains vacant after Karim's departure.

## Render handoff

These modules are reusable viewer assets. Episode 6 composition scenes should mount the same modules through the project's scene/character integration conventions, then be checked in Remotion for framing, prop placement and continuity before final render.
