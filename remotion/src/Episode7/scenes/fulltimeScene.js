import { PitchTouchlineApp } from '../../../../environments/modular-pitch-zone.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import {
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  pitchGrade,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/**
 * Act 3 (rework) — full time. The KEK MAJU board glows over a packed gate;
 * Bos holds ticket stubs — trust money, not pocket change. Jurulatih teases
 * about a raise; Bos reveals Azam refused one until the trophy. The debt
 * ticker rolls GREEN RM331,500 -> RM316,500. No digits are spoken.
 */
export const createFulltimeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env, actors }) => {
    const bos = findActor(actors, 'bos');
    const jurulatih = findActor(actors, 'jurulatih');
    if (bos && jurulatih) {
      bos.rig.rotation.y = -0.3;
      jurulatih.rig.rotation.y = Math.PI - 0.25;
    }
    return { ...env.anchors };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.93, position: [-0.5, 0, 2.6], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e7_13'), pose: 'offer' },
        { from: L('e7_13'), to: L('e7_14'), pose: 'talk' },
        { from: L('e7_14'), to: L('e7_15'), pose: 'idle' },
        { from: L('e7_15'), to: END, pose: 'point', emotion: 'happy' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [1.3, 0, 3.0], rotationY: Math.PI - 0.25,
      beats: [
        { from: 0, to: L('e7_14'), pose: 'idle' },
        { from: L('e7_14'), to: END, pose: 'talk', emotion: 'happy' },
      ],
    },
  ],
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const jurulatih = findActor(actors, 'jurulatih');
      return [
        // Full-time wide with the glowing Kek Maju board in frame.
        [0, [1.8, 1.9, 7.4], [-0.4, 1.3, 2.4], 46],
        shotKey(getTwoShot(bos, jurulatih, { distance: 4.4 }), sec(L('e7_12')) + 0.01),
        // Bos holds up the ticket stubs.
        [sec(L('e7_13')), [0.6, 1.5, 4.6], [-0.5, 1.3, 2.6], 42],
        shotKey(getSpeakerThreeQuarterShot(jurulatih, bos, { distance: 4.0 }), sec(L('e7_14'))),
        shotKey(getSpeakerThreeQuarterShot(bos, jurulatih, { distance: 3.8 }), sec(L('e7_15'))),
        [sec(END), [0.4, 1.7, 6.8], [0.2, 1.3, 2.2], 46],
      ];
    },
  },
});
