import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, ZakiApp } from '../../../../characters/character-variants.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const GOALS = [goalFrame(ACT_2, 0), goalFrame(ACT_2, 1)];

/** Act 2 — StartingXI sells 11-a-side; only four rigs are actually rendered. */
export const createMatchdayOneScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.95, position: [-1.1, 0, 0.4], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e6_07'), pose: 'idle' },
        { from: L('e6_07'), to: L('e6_08'), pose: 'stride' },
        { from: L('e6_08'), to: 480, pose: 'block' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.96, position: [0.8, 0, 1.1], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e6_08'), pose: 'stride' },
        { from: L('e6_08'), to: 480, pose: 'idle' },
      ],
    },
    {
      name: 'zaki', Class: ZakiApp,
      scale: 0.97, position: [1.9, 0, -1.6], rotationY: -0.5,
      beats: [
        { from: 0, to: L('e6_06'), pose: 'stride' },
        { from: L('e6_06'), to: L('e6_07'), pose: 'talk' },
        { from: L('e6_07'), to: 480, pose: 'point' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [-3.1, 0, 3.6], rotationY: 0.45,
      beats: [
        { from: 0, to: L('e6_07'), pose: 'idle' },
        { from: L('e6_07'), to: L('e6_08'), pose: 'point' },
        { from: L('e6_08'), to: 480, pose: 'idle' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const inNet = GOALS.some((goal) => frame >= goal && frame < goal + 16);
    if (inNet) {
      const goal = GOALS.find((value) => frame >= value && frame < value + 16);
      const settle = smooth(clamp((frame - goal) / 12, 0, 1));
      ball.position.x = lerp(-4.6, -5.9, settle);
      ball.position.y = 0.22 + Math.sin(settle * Math.PI) * 0.28;
      ball.position.z = lerp(0.4, 0, settle);
    } else {
      const k = smooth(clamp((frame - L('e6_08')) / 40, 0, 1));
      ball.position.x = lerp(0, 3.2, k);
      ball.position.z = lerp(0, -1.4, k);
      ball.position.y = 0.22;
    }
    ball.rotation.x = frame * 0.12;
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      [0, [0, 1.5, 5.4], [0, 1.2, 0], 52],
      [sec(120), [1.4, 1.6, 4.8], [1.6, 1.3, -1.2], 46],
      [sec(L('e6_06')), [2.6, 1.55, 2.6], [1.9, 1.4, -1.6], 44],
      [sec(L('e6_07')), [-2.4, 1.7, 5.2], [-1.1, 1.3, 0.4], 48],
      [sec(L('e6_08')), [0.4, 1.5, 4.2], [0.6, 1.1, -0.4], 46],
      [sec(480), [1.8, 1.55, 3.4], [2.2, 1.2, -1.2], 44],
    ],
  },
});
