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
 * Act 3 (rework) — second place, three points behind a team that never loses.
 * Jurulatih describes the machine that never smiles; Bos answers with the
 * season's thesis: machines break, Buluh FC has a heart. MD4 table + green
 * debt roll close the act and plant the finale.
 */
export const createSecondPlaceScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { actors }) => {
    const bos = findActor(actors, 'bos');
    const jurulatih = findActor(actors, 'jurulatih');
    if (bos && jurulatih) {
      bos.rig.rotation.y = -0.3;
      jurulatih.rig.rotation.y = Math.PI - 0.25;
    }
    return {};
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.93, position: [-0.5, 0, 2.8], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e10_14'), pose: 'idle' },
        { from: L('e10_14'), to: END, pose: 'point', emotion: 'angry' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [1.3, 0, 3.2], rotationY: Math.PI - 0.25,
      beats: [
        { from: 0, to: L('e10_13'), pose: 'idle' },
        { from: L('e10_13'), to: END, pose: 'talk', emotion: 'worried' },
      ],
    },
  ],
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const jurulatih = findActor(actors, 'jurulatih');
      return [
        // LeagueTableOverlay window: the wide with the board side.
        [0, [2.0, 2.0, 7.6], [-0.4, 1.3, 2.6], 46],
        shotKey(getTwoShot(bos, jurulatih, { distance: 4.4 }), sec(L('e10_13')) - 0.01),
        shotKey(getSpeakerThreeQuarterShot(jurulatih, bos, { distance: 4.0 }), sec(L('e10_13'))),
        shotKey(getSpeakerThreeQuarterShot(bos, jurulatih, { distance: 3.8 }), sec(L('e10_14'))),
        [sec(L('e10_15')), [1.0, 1.8, 7.0], [-0.2, 1.3, 2.4], 46],
        [sec(END), [0.4, 1.7, 6.8], [0.2, 1.3, 2.4], 46],
      ];
    },
  },
});
