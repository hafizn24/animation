import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { BobApp, DanialApp } from '../../../../characters/character-variants.js';
import {
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  pitchGrade,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/**
 * Act 1 (rework) — the hook flips the scoreboard 1-0 -> 1-1 -> 2-2 -> 3-3 in
 * 1.4 seconds. Kapten Bob laughs through the chaos; Danial is DONE shouting;
 * Azam takes command of the backline like a captain who hasn't been handed
 * the armband yet.
 */
export const createChaosScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'bob', Class: BobApp,
      scale: 0.95, position: [-1.2, 0, -0.2], rotationY: 0.4,
      beats: [
        { from: 0, to: L('e10_02'), pose: 'stride' },
        { from: L('e10_02'), to: L('e10_03'), pose: 'celebrate', emotion: 'hyped' },
        { from: L('e10_03'), to: END, pose: 'talk', emotion: 'happy' },
      ],
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.94, position: [-3.8, 0, 2.8], rotationY: 0.35,
      beats: [
        { from: 0, to: L('e10_03'), pose: 'crouch' },
        { from: L('e10_03'), to: END, pose: 'panic', emotion: 'angry' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.8, 0, 1.4], rotationY: -0.4,
      beats: [
        { from: 0, to: L('e10_04'), pose: 'stride' },
        { from: L('e10_04'), to: END, pose: 'point', emotion: 'angry' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (extra) extra.crowdExcitement = 0.5 + Math.abs(Math.sin(frame * 0.2)) * 0.3;
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const bob = findActor(actors, 'bob');
      const danial = findActor(actors, 'danial');
      const azam = findActor(actors, 'azam');
      return [
        // Hook: the scoreboard chaos — wide shake across the box.
        [0, [2.8, 2.0, 7.0], [-0.8, 1.3, 0.2], 46],
        [sec(20), [-2.6, 1.8, 6.2], [-3.8, 1.35, 2.6], 46],
        [sec(42), [2.6, 1.8, 6.6], [0.8, 1.3, 1.4], 46],
        shotKey(getSpeakerThreeQuarterShot(bob, azam, { distance: 4.2 }), sec(L('e10_02'))),
        shotKey(getSpeakerThreeQuarterShot(danial, azam, { distance: 4.0 }), sec(L('e10_03'))),
        shotKey(getTwoShot(azam, bob, { distance: 4.4 }), sec(L('e10_04'))),
        shotKey(getSpeakerThreeQuarterShot(azam, danial, { distance: 4.0 }), sec(L('e10_04') + 40)),
        [sec(END), [0.6, 2.0, 6.8], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
