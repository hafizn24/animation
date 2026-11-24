import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import { createCinematicScene, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;

/** Act 3 — the red ticker climbs while Bos stares at the vacant armband. */
export const createDebtSpikeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene2'),
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.95, position: [0.1, 0, -1.3], rotationY: 0.04,
      beats: [
        { from: 0, to: L('e9_09'), pose: 'idle' },
        { from: L('e9_09'), to: 228, pose: 'document' },
      ],
      anim: ({ frame, parts }) => {
        if (parts.head && frame > L('e9_09')) parts.head.rotation.x = 0.16;
      },
    },
  ],
  camera: {
    fov: 44, ease: smooth,
    keys: [
      [0, [0.3, 1.5, 1.8], [0.1, 1.0, -0.4], 46],
      [sec(L('e9_09')), [0.45, 1.35, 1.35], [0.42, 0.9, 0.3], 42],
      [sec(228), [0.2, 1.4, 1.5], [0.3, 0.95, -0.2], 44],
    ],
  },
});
