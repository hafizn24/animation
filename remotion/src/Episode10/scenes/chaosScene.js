import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { DanialApp, BobApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, lerp, pitchGrade, presetKey, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 — Bob's chaos and a panicking Danial behind a 3-3 scoreline. */
export const createChaosScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'bob', Class: BobApp,
      scale: 0.97, position: [1.6, 0, 1.0], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e10_03'), pose: 'celebrate' },
        { from: L('e10_03'), to: END, pose: 'stride' },
      ],
      anim: ({ rig, frame }) => {
        rig.position.y = Math.abs(Math.sin(frame / 4)) * 0.09;
      },
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.95, position: [-5.0, 0, 0], rotationY: 0.35,
      beats: [
        { from: 0, to: L('e10_03'), pose: 'idle' },
        { from: L('e10_03'), to: END, pose: 'panic' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    ball.position.x = lerp(0, -4.8, smooth(clamp((frame % 110) / 110, 0, 1)));
    ball.position.z = Math.sin(frame / 9) * 1.2;
  },
  camera: {
    fov: 52, ease: smooth,
    keys: [
      presetKey('WIDE_TWO_SHOT', 0, [0.0, 1.4, 0.4], 0.08),
      presetKey('MEDIUM_SPEAKER', sec(54), [1.6, 1.4, 1.0], 0.05),
      presetKey('MEDIUM_SPEAKER', sec(L('e10_03')), [-5.0, 1.4, 0], 0.25),
      presetKey('WIDE_TWO_SHOT', sec(END), [-2.6, 1.4, 0.6], -0.05),
    ],
  },
});
