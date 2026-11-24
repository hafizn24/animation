import { PitchTouchlineApp } from '../../../../environments/modular-pitch-zone.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { createCinematicScene, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/** Act 3 — standings card and the round-number RM300,000 debt drop. */
export const createSecondPlaceScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => {
    if (env.lights?.sun) env.lights.sun.intensity = 1.1;
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.92, position: [-1.2, 0, 2.6], rotationY: 0.32,
      beats: [{ from: L('e10_10'), to: END, pose: 'document' }],
    },
  ],
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [-0.4, 1.6, 4.8], [-1.2, 1.4, 2.2], 48],
      [sec(L('e10_10')), [-1.0, 1.58, 4.0], [-1.2, 1.4, 2.6], 44],
      [sec(END), [-1.2, 1.55, 3.6], [-1.2, 1.35, 2.6], 44],
    ],
  },
});
