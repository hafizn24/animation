import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, BesiKeeperApp } from '../../../../characters/character-variants.js';
import {
  animateKickAndGoal,
  clamp,
  createCinematicScene,
  goalExcitement,
  goalFrame,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  sec,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2);
const KICK = GOAL - 24;
const CONTACT = GOAL - 8;

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
        { from: GOAL, to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e12_06')) / Math.max(1, GOAL - L('e12_06')), 0, 1));
        // Stop short of the keeper at (-5.6, 0, 0.2); the old -5.0 endpoint
        // put Farid inside the keeper's chest.
        rig.position.x = lerp(-1.4, -4.35, run);
        rig.position.z = lerp(0.8, 0.6, run);
      },
    },
    {
      name: 'besikeeper', Class: BesiKeeperApp,
      scale: 0.98, position: [-5.6, 0, 0.2], rotationY: 0.35,
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
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const farid = actors.find((actor) => actor.name === 'farid');

    if (frame < CONTACT) {
      if (frame >= L('e12_06') && farid) placeBallAtFeet(farid, ball, 0.55);
      return;
    }

    const result = animateKickAndGoal({
      frame,
      kicker: farid,
      ball,
      net: extra.net,
      start: [-3.85, 0.22, 0.6],
      target: [-6.35, 2.0, 1.45],
      kickFrame: KICK,
      contactFrame: CONTACT,
      hitFrame: GOAL,
      followThrough: 13,
      strength: 1.1,
      arc: 1.0,
      spin: 0.26,
      shake: { amplitude: 0.05, duration: 12 },
    });
    extra.shake = result.shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL, { peak: 1 });
  },
  camera: {
    fov: 50, ease: smooth,
    keys: [
      [0, [2.2, 1.7, 4.8], [-1.4, 1.35, 0.8], 42],
      [sec(L('e12_06')), [1.8, 1.65, 4.4], [-1.4, 1.35, 0.8], 42],
      [sec(GOAL - 20), [-2.0, 1.7, 4.8], [-4.6, 1.35, 0.7], 42],
      [sec(GOAL), [-2.6, 1.7, 5.2], [-5.2, 1.35, 0.8], 42],
      [sec(END), [-3.0, 1.65, 4.8], [-4.6, 1.35, 0.7], 42],
    ],
  },
});
