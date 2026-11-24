import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, RayyanApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2, 2);

/** Act 2 — flashy skills get shut down; the counter-attack winner makes it 2-1. */
export const createBribeRevengeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'rayyan', Class: RayyanApp,
      scale: 0.96, position: [1.6, 0, 0.8], rotationY: -0.4,
      beats: [
        { from: 0, to: L('e8_07'), pose: 'stride' },
        { from: L('e8_07'), to: END, pose: 'panic' },
      ],
      anim: ({ frame, rig }) => {
        const dance = Math.sin(frame / 5) * 0.18;
        rig.rotation.z = frame < L('e8_07') ? dance : 0;
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.97, position: [0.2, 0, 0.4], rotationY: 0.16,
      beats: [
        { from: 0, to: L('e8_07'), pose: 'idle' },
        { from: L('e8_07'), to: L('e8_08'), pose: 'block' },
        { from: L('e8_08'), to: END, pose: 'intercept' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.2, 0, 1.4], rotationY: -0.2,
      beats: [
        { from: 0, to: GOAL, pose: 'stride' },
        { from: GOAL, to: END, pose: 'celebrate' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e8_07')) / Math.max(1, GOAL - L('e8_07')), 0, 1));
        rig.position.x = lerp(-1.2, -5.2, run);
      },
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const weave = Math.sin(frame / 7) * 0.4;
    const breakaway = smooth(clamp((frame - L('e8_07')) / Math.max(1, GOAL - L('e8_07')), 0, 1));
    ball.position.x = lerp(1.4 + weave, -0.4, breakaway) - breakaway * 4.8;
    ball.position.z = lerp(0.8, 0.2, breakaway);
    const goalFlash = [220, 320, GOAL].some((g) => frame >= g && frame < g + 12);
    ball.position.y = 0.22 + (goalFlash ? 0.32 : 0);
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      [0, [1.8, 1.5, 3.4], [1.6, 1.3, 0.8], 46],
      [sec(L('e8_06')), [1.2, 1.35, 2.6], [1.0, 1.15, 0.6], 42],
      [sec(L('e8_07')), [0.0, 1.6, 3.2], [0.2, 1.35, 0.5], 46],
      [sec(GOAL), [-1.6, 1.6, 4.0], [-2.4, 1.3, 0.8], 48],
      [sec(END), [-4.2, 1.5, 3.6], [-5.2, 1.35, 0], 44],
    ],
  },
});
