import { BakeryApp } from './bakery.js';
import { ClubOfficeApp } from './club-office.js';
import { Episode6OfficeApp } from './episode6-office.js';
import { LenderBoardroomApp } from './lender-boardroom.js';
import { LockerRoomApp } from './locker-room.js';
import { ManagerOfficeApp } from './manager-office.js';
import { PlayersTunnelApp } from './players-tunnel.js';
import { SponsorOfficeApp } from './sponsor-office.js';
import { StadiumApp } from './stadium.js';

export { BaseEnvironmentApp } from './core/BaseEnvironmentApp.js';

/** Every environment set, keyed by the id scenes and stageKit resolve. */
export const ENVIRONMENT_REGISTRY = {
  bakery: BakeryApp,
  clubOffice: ClubOfficeApp,
  episode6Office: Episode6OfficeApp,
  lenderBoardroom: LenderBoardroomApp,
  lockerRoom: LockerRoomApp,
  managerOffice: ManagerOfficeApp,
  playersTunnel: PlayersTunnelApp,
  sponsorOffice: SponsorOfficeApp,
  stadium: StadiumApp,
};

export const ENVIRONMENT_IDS = Object.keys(ENVIRONMENT_REGISTRY);

export function getEnvironmentClass(id) {
  const Cls = ENVIRONMENT_REGISTRY[id];
  if (!Cls) {
    throw new Error(`Unknown environment id "${id}". Expected one of: ${ENVIRONMENT_IDS.join(', ')}`);
  }
  return Cls;
}

/**
 * Builds a set deterministically, either into the caller's scene or into its
 * own, and returns the stage metadata stageKit needs.
 *
 *   const { env, scene, camera, presets } = await createEnvironment(scene, 'clubOffice');
 *
 * Follows the same order as `createSceneDirector`: scene → camera → lights →
 * set, so the result matches what a Remotion render produces.
 */
export async function createEnvironment(scene, id, opts = {}) {
  const env = new (getEnvironmentClass(id))(null);
  env._headless = true;
  if (scene) {
    env.scene = scene;
  } else {
    env.setupScene();
  }
  env.setupCamera();
  env.addLights();
  env.createProceduralCharacter();
  env.applyBounds();
  const mounted = env.mount(env.scene, opts);
  return { ...mounted, envId: id };
}
