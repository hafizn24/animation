import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, PakDinApp } from '../../../../characters/character-variants.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const GOAL = goalFrame(ACT_2);

/** Act 2 — high press, Azam's interception and Farid's first goal. */
export const createFirstWinScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.88, position: [-3.0, 0, 3.8], rotationY: 0.4,
      beats: [{ from: 0, to: L('e7_06'), pose: 'point' }, { from: L('e7_06'), to: 450, pose: 'idle' }],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.97, position: [0.4, 0, 1.2], rotationY: 0.12,
      beats: [
        { from: 0, to: L('e7_06'), pose: 'stride' },
        { from: L('e7_06'), to: L('e7_07'), pose: 'intercept' },
        { from: L('e7_07'), to: 450, pose: 'point' },
      ],
      anim: ({ frame, rig }) => {
        const breakaway = smooth(clamp((frame - L('e7_06')) / 50, 0, 1));
        rig.position.x = lerp(0.4, -0.6, breakaway);
      },
    },
    {
      name: 'pakdin', Class: PakDinApp,
      scale: 0.96, position: [1.8, 0, 0.4], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e7_06'), pose: 'talk' },
        { from: L('e7_06'), to: 450, pose: 'idle' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.6, 0, 0.6], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e7_07'), pose: 'stride' },
        { from: L('e7_07'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: 450, pose: 'celebrate' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e7_07')) / Math.max(1, GOAL - L('e7_07')), 0, 1));
        rig.position.x = lerp(-1.6, -5.4, run);
      },
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const pass = smooth(clamp((frame - L('e7_06')) / 30, 0, 1));
    const shot = smooth(clamp((frame - L('e7_07')) / Math.max(1, GOAL - L('e7_07')), 0, 1));
    ball.position.x = lerp(1.8, -0.6, pass) - shot * 5.2;
    ball.position.z = lerp(0.4, 0.6, pass) - shot * 0.6;
    ball.position.y = 0.22 + (frame >= GOAL && frame < GOAL + 14 ? 0.35 : 0);
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      [0, [-2.6, 1.7, 4.6], [-2.8, 1.4, 3.4], 48],
      [sec(L('e7_06')), [1.4, 1.5, 3.0], [0.4, 1.1, 1.0], 44],
      [sec(L('e7_07')), [-1.0, 1.6, 3.6], [-2.4, 1.3, 0.6], 48],
      [sec(GOAL), [-5.0, 1.5, 3.2], [-6.0, 1.4, 0], 44],
      [sec(450), [-4.2, 1.7, 4.0], [-4.6, 1.35, 0], 50],
    ],
  },
});
