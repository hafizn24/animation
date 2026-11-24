import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { FaridApp } from '../../../../characters/character-variants.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import { createCinematicScene, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;

/** Act 2 — heads down at halftime; Farid voices the doubt, Azam refuses it. */
export const createHalftimeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene, 'reveal'),
  actors: [
    {
      name: 'farid', Class: FaridApp,
      scale: 0.94, position: [-1.6, 0, -0.8], rotationY: 0.35,
      beats: [
        { from: 0, to: L('e11_06'), pose: 'idle' },
        { from: L('e11_06'), to: L('e11_07'), pose: 'talk' },
        { from: L('e11_07'), to: END, pose: 'idle' },
      ],
      anim: ({ frame, parts }) => {
        if (parts.head && frame < L('e11_07')) parts.head.rotation.x = 0.2;
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.96, position: [0.6, 0, -0.6], rotationY: -0.25,
      beats: [
        { from: 0, to: L('e11_07'), pose: 'idle' },
        { from: L('e11_07'), to: L('e11_08'), pose: 'talk' },
        { from: L('e11_08'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [1.8, 0, -1.4], rotationY: -0.4,
      beats: [{ from: L('e11_08'), to: END, pose: 'idle' }],
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.92, position: [-0.2, 0, -3.4], rotationY: 0.05,
      beats: [{ from: L('e11_08'), to: END, pose: 'idle' }],
      anim: ({ frame, rig }) => {
        rig.visible = frame >= L('e11_08') - 12;
      },
    },
  ],
  camera: {
    fov: 44, ease: smooth,
    keys: [
      [0, [0.2, 1.6, 3.6], [-0.4, 1.35, -0.8], 46],
      [sec(L('e11_06')), [-1.2, 1.55, 2.4], [-1.6, 1.4, -0.8], 44],
      [sec(L('e11_07')), [0.8, 1.6, 2.6], [0.6, 1.45, -0.6], 44],
      [sec(L('e11_08')), [0.0, 1.65, 3.0], [-0.2, 1.5, -2.4], 48],
      [sec(END), [-0.2, 1.6, 2.4], [-0.2, 1.4, -1.6], 46],
    ],
  },
});
