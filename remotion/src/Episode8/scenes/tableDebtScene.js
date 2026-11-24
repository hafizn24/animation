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
 * Act 3 (rework) — two straight wins, this one with pride. Bos taps the drawer
 * with Rayyan's envelope inside; the LeagueTableOverlay climbs and the debt
 * ticker rolls GREEN under RM300k. Nobody reads a digit aloud.
 */
export const createTableDebtScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { actors }) => {
    const bos = findActor(actors, 'bos');
    const jurulatih = findActor(actors, 'jurulatih');
    if (bos && jurulatih) {
      bos.rig.rotation.y = -0.35;
      jurulatih.rig.rotation.y = Math.PI - 0.3;
    }
    return {};
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.93, position: [-0.5, 0, 2.8], rotationY: -0.35,
      beats: [
        { from: 0, to: L('e8_16'), pose: 'idle' },
        { from: L('e8_16'), to: END, pose: 'keys', emotion: 'happy' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [1.3, 0, 3.2], rotationY: Math.PI - 0.3,
      beats: [
        { from: 0, to: L('e8_15'), pose: 'idle' },
        { from: L('e8_15'), to: END, pose: 'talk', emotion: 'happy' },
      ],
    },
  ],
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const jurulatih = findActor(actors, 'jurulatih');
      return [
        // Table overlay window: wide with the board side of the pitch.
        [0, [2.0, 2.0, 7.6], [-0.4, 1.3, 2.6], 46],
        shotKey(getTwoShot(bos, jurulatih, { distance: 4.4 }), sec(L('e8_15')) - 0.01),
        shotKey(getSpeakerThreeQuarterShot(jurulatih, bos, { distance: 4.0 }), sec(L('e8_15'))),
        shotKey(getSpeakerThreeQuarterShot(bos, jurulatih, { distance: 3.8 }), sec(L('e8_16'))),
        [sec(END), [0.4, 1.7, 6.8], [0.2, 1.3, 2.4], 46],
      ];
    },
  },
});
