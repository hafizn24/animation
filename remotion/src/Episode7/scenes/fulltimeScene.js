import { PitchTouchlineApp } from '../../../../environments/modular-pitch-zone.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { FaridApp } from '../../../../characters/character-variants.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/** Act 3 — fulltime whistle, glowing KEK MAJU board and the green debt roll. */
export const createFulltimeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env }) => {
    const board = env.anchors.adBoard;
    if (board && board.material) board.material.color.setHex(0xffffff);
    return { board };
  },
  actors: [
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [0.8, 0, 1.2], rotationY: -0.4,
      beats: [{ from: 0, to: L('e7_11'), pose: 'celebrate' }, { from: L('e7_11'), to: END, pose: 'idle' }],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.96, position: [-0.4, 0, 0.6], rotationY: 0.2,
      beats: [{ from: 0, to: L('e7_11'), pose: 'celebrate' }, { from: L('e7_11'), to: END, pose: 'idle' }],
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.92, position: [-1.8, 0, 3.4], rotationY: 0.35,
      beats: [{ from: L('e7_11'), to: END, pose: 'keys' }],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (extra && extra.board && extra.board.material) {
      const glow = 0.85 + 0.15 * Math.sin(frame / 12);
      extra.board.material.color.setRGB(glow, glow, glow);
    }
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      [0, [0.6, 1.5, 4.2], [0.4, 1.4, 1.0], 48],
      [sec(L('e7_11')), [-1.0, 1.6, 4.2], [-1.6, 1.4, 3.2], 46],
      [sec(END), [-1.4, 1.55, 3.6], [-1.0, 1.3, 3.8], 44],
    ],
  },
});
