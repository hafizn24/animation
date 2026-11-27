import { App } from './character-default.js';
import { SuitOutfitApp } from './character-suit.js';
import { SoccerCoachOutfitApp } from './character-coach.js';
import { AnotherCasualOutfitApp } from './character-casual.js';
import { SoccerOutfitApp } from './character-soccer.js';
import { ChairmanApp } from './character-chairman.js';
import { SponsorApp } from './character-sponsor.js';
import { NewOwnerApp } from './character-new-owner.js';
import { KarimApp } from './character-karim.js';
import { AzamApp } from './character-azam.js';
import { BossApp } from './character-boss.js';
import { LawyerApp } from './character-lawyer.js';
import { SquadVariationsApp } from './character-squad.js';

export { BaseCharacterApp } from './core/BaseCharacterApp.js';
export { SHARED_POSES, WALK_POSES } from './core/poses.js';
export {
  createArmbandTexture,
  createBackNameTexture,
  createFrontNameTexture,
  createStripedTexture,
} from './core/kits.js';

/**
 * Every character class the project ships, keyed by the id scenes use when
 * they ask for an actor. Keep the keys stable – scene files and `stageKit`
 * resolve actors through this map.
 */
export const CHARACTER_REGISTRY = {
  default: App,
  suit: SuitOutfitApp,
  coach: SoccerCoachOutfitApp,
  casual: AnotherCasualOutfitApp,
  soccer: SoccerOutfitApp,
  chairman: ChairmanApp,
  sponsor: SponsorApp,
  newOwner: NewOwnerApp,
  karim: KarimApp,
  azam: AzamApp,
  boss: BossApp,
  lawyer: LawyerApp,
  squad: SquadVariationsApp,
};

export const CHARACTER_IDS = Object.keys(CHARACTER_REGISTRY);

export function getCharacterClass(id) {
  const Cls = CHARACTER_REGISTRY[id];
  if (!Cls) {
    throw new Error(`Unknown character id "${id}". Expected one of: ${CHARACTER_IDS.join(', ')}`);
  }
  return Cls;
}

/**
 * Builds an actor headlessly and injects it into an existing scene.
 *
 *   const { app, rig, parts } = await createActor(scene, 'karim', {
 *     pose: 'talk', position: [0, 0, 0], rotationY: Math.PI, scale: 1,
 *   });
 *
 * Returns the same shape as `BaseCharacterApp.mount` so callers can reach
 * `parts.armband` / `parts.boots` without re-querying the graph.
 */
export async function createActor(scene, id, opts = {}) {
  const app = new (getCharacterClass(id))(null);
  await app.init();
  const mounted = app.mount(scene, opts);
  return { ...mounted, actorId: id };
}
