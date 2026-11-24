import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, BesiKeeperApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;

/** Act 2 — the 90th-minute 1v1 and the slow-motion winner. */
export const createWinnerScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 1.4], rotationY: 0.1,
      beats: [
        { from: 0, to: L('e12_06'), pose: 'stride' },
        { from: L('e12_06'), to: 450, pose: 'point' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.98, position: [-1.4, 0, 0.8], rotationY: -0.22,
      beats: [
        { from: 0, to: L('e12_06'), pose: 'stride' },
        { from: L('e12_06'), to: L('e12_07'), pose: 'stride' },
        { from: L('e12_07'), to: 450, pose: 'celebrate' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e12_06')) / 200, 0, 1));
        rig.position.x = lerp(-1.4, -5.0, run);
      },
    },
    {
      name: 'besikeeper', Class: BesiKeeperApp,
      scale: 0.98, position: [-6.2, 0, 0], rotationY: Math.PI / 2,
      beats: [
        { from: 0, to: L('e12_07'), pose: 'crouch' },
        { from: L('e12_07'), to: 450, pose: 'panic' },
      ],
      anim: ({ frame, rig }) => {
        const dive = smooth(clamp((frame - L('e12_07') - 70) / 40, 0, 1));
        rig.rotation.z = -0.5 * dive;
        rig.position.y = 0.25 * dive;
      },
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const run = smooth(clamp((frame - L('e12_06')) / 200, 0, 1));
    const slow = smooth(clamp((frame - L('e12_07') - 40) / 120, 0, 1));
    ball.position.x = lerp(-1.4, -5.6, run);
    ball.position.y = 0.22 + slow * 1.5;
    ball.position.z = lerp(0.8, -0.9, slow);
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      [0, [-2.0, 1.7, 4.2], [-2.4, 1.4, 0.8], 48],
      [sec(L('e12_06')), [-1.0, 1.6, 3.6], [-3.0, 1.3, 0.6], 46],
      [sec(L('e12_07')), [-5.0, 1.45, 2.6], [-6.2, 1.5, 0], 42],
      [sec(L('e12_08')), [-4.2, 1.8, 3.8], [-5.2, 1.4, 0], 50],
      [sec(450), [-2.4, 1.9, 4.6], [-3.0, 1.5, 0.6], 52],
    ],
  },
});
