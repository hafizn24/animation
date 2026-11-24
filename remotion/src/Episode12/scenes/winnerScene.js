import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, BesiKeeperApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, presetKey, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2);

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
        { from: L('e12_06'), to: END, pose: 'point' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.98, position: [-1.4, 0, 0.8], rotationY: -0.22,
      beats: [
        { from: 0, to: L('e12_06'), pose: 'stride' },
        { from: L('e12_06'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: END, pose: 'celebrate' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e12_06')) / Math.max(1, GOAL - L('e12_06')), 0, 1));
        rig.position.x = lerp(-1.4, -5.0, run);
      },
    },
    {
      name: 'besikeeper', Class: BesiKeeperApp,
      scale: 0.98, position: [-5.3, 0, 0], rotationY: 0.35,
      beats: [
        { from: 0, to: GOAL, pose: 'crouch' },
        { from: GOAL, to: END, pose: 'panic' },
      ],
      anim: ({ frame, rig }) => {
        const dive = smooth(clamp((frame - GOAL - 12) / 36, 0, 1));
        rig.rotation.z = -0.5 * dive;
        rig.position.y = 0.25 * dive;
      },
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const run = smooth(clamp((frame - L('e12_06')) / Math.max(1, GOAL - L('e12_06')), 0, 1));
    const slow = smooth(clamp((frame - GOAL + 40) / 60, 0, 1));
    ball.position.x = lerp(-1.4, -5.3, run);
    ball.position.y = 0.22 + slow * 1.5 - (frame > GOAL + 40 ? (frame - GOAL - 40) * 0.03 : 0);
    ball.position.z = lerp(0.8, -0.9, slow);
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      presetKey('MEDIUM_SPEAKER', 0, [-1.4, 1.4, 0.8], 0.12),
      presetKey('MEDIUM_SPEAKER', sec(L('e12_06')), [-1.4, 1.4, 0.8], 0.12),
      presetKey('PENALTY_BOX_1V1', sec(GOAL - 20), [-5.3, 1.4, 0], 0.18),
      presetKey('MEDIUM_SPEAKER', sec(GOAL), [-5.0, 1.4, 0], 0.25),
      presetKey('WIDE_TWO_SHOT', sec(END), [-3.0, 1.4, 0.6], 0.18),
    ],
  },
});
