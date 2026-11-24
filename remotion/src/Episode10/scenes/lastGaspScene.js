import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, BobApp } from '../../../../characters/character-variants.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, presetKey, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2);

/** Act 2 — 88th minute: block, release, winner. */
export const createLastGaspScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.88, position: [-3.0, 0, 3.6], rotationY: 0.45,
      beats: [{ from: 0, to: L('e10_05'), pose: 'point' }, { from: L('e10_05'), to: END, pose: 'idle' }],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.6, 0, 1.2], rotationY: 0.14,
      beats: [
        { from: 0, to: L('e10_05'), pose: 'stride' },
        { from: L('e10_05'), to: L('e10_06'), pose: 'block' },
        { from: L('e10_06'), to: END, pose: 'point' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.6, 0, 0.8], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e10_06'), pose: 'stride' },
        { from: L('e10_06'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: END, pose: 'celebrate' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e10_06')) / Math.max(1, GOAL - L('e10_06')), 0, 1));
        rig.position.x = lerp(-1.6, -5.0, run);
      },
    },
    {
      name: 'bob', Class: BobApp,
      scale: 0.95, position: [2.4, 0, -1.0], rotationY: -0.5,
      beats: [
        { from: 0, to: L('e10_07'), pose: 'stride' },
        { from: L('e10_07'), to: END, pose: 'panic' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const run = smooth(clamp((frame - L('e10_06')) / Math.max(1, GOAL - L('e10_06')), 0, 1));
    ball.position.x = lerp(0.6, -5.2, run);
    ball.position.z = lerp(1.2, 0, run);
    ball.position.y = 0.22 + (frame >= GOAL && frame < GOAL + 12 ? 0.34 : 0);
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      presetKey('WIDE_TWO_SHOT', 0, [-2.8, 1.4, 3.4], 0.02),
      presetKey('MEDIUM_SPEAKER', sec(L('e10_05')), [0.6, 1.4, 1.0], 0.18),
      presetKey('MEDIUM_SPEAKER', sec(L('e10_06')), [-2.0, 1.4, 0.8], 0.28),
      presetKey('MEDIUM_SPEAKER', sec(GOAL), [-5.0, 1.4, 0], 0.25),
      presetKey('WIDE_TWO_SHOT', sec(END), [-4.4, 1.4, 0], 0.2),
    ],
  },
});
