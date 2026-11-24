import { PitchCrisisNightApp } from '../../../../environments/pitch-crisis-night.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import {
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  nightGrade,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/**
 * Act 3 (rework) — two days later the floodlights blaze again over the same
 * penalty box, fully lit. The squad stares up at the lamps they now owe; Azam
 * asks the question, Bos owns the answer, Azam makes the season's promise:
 * these lights get paid back with a trophy. The debt ticker slams RED.
 */
export const createLightsPromiseScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCrisisNightApp,
  grade: (scene, env) => nightGrade(scene, env),
  extra: (scene, { env }) => {
    // Lights restored: the crisis state is never triggered, the tower burns.
    if (env && typeof env.setCrisisFrame === 'function') env.setCrisisFrame(-1);
    return { ...env.anchors };
  },
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 1.6], rotationY: -0.15,
      beats: [
        { from: 0, to: L('e9_12'), pose: 'idle' },
        { from: L('e9_12'), to: L('e9_13'), pose: 'talk', emotion: 'worried' },
        { from: L('e9_13'), to: L('e9_14'), pose: 'idle' },
        { from: L('e9_14'), to: END, pose: 'point', emotion: 'hyped' },
      ],
      anim: ({ frame, rig, parts }) => {
        // Staring up at the lamps they now owe.
        const look = smooth(clamp((frame - 20) / 30, 0, 1));
        if (parts && parts.head) parts.head.rotation.x = lerp(0, 0.35, look);
        if (frame >= L('e9_12') && frame < L('e9_13')) {
          if (parts && parts.head) parts.head.rotation.x = 0.28;
        }
      },
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-1.6, 0, 2.8], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e9_13'), pose: 'idle' },
        { from: L('e9_13'), to: L('e9_14'), pose: 'talk' },
        { from: L('e9_14'), to: END, pose: 'idle', emotion: 'stressed' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [2.4, 0, 3.6], rotationY: -0.5,
      beats: [{ from: 0, to: END, pose: 'idle', emotion: 'worried' }],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (extra) extra.crowdExcitement = 0.06;
  },
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const azam = findActor(actors, 'azam');
      const bos = findActor(actors, 'bos');
      return [
        // The lamps blazing again — hero tower hot in frame.
        [0, [-2.6, 3.4, 2.2], [-5.4, 5.4, -4.5], 48],
        // Cut down to the squad staring up.
        [sec(54), [2.8, 1.8, 6.2], [0.4, 1.4, 1.6], 44],
        shotKey(getSpeakerThreeQuarterShot(azam, bos, { distance: 4.1 }), sec(L('e9_12'))),
        shotKey(getSpeakerThreeQuarterShot(bos, azam, { distance: 4.2 }), sec(L('e9_13'))),
        // Azam's promise — low angle, lamps burning behind him.
        [sec(L('e9_14')), [-1.4, 1.55, 4.6], [0.6, 1.4, 1.4], 42],
        shotKey(getTwoShot(bos, azam, { distance: 4.6 }), sec(END - 60)),
        [sec(END), [0.8, 2.2, 7.0], [-1.0, 1.6, 0.4], 48],
      ];
    },
  },
});
