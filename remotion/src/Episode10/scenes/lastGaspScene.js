import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, BobApp } from '../../../../characters/character-variants.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import {
  animateKickAndGoal,
  clamp,
  createCinematicScene,
  goalExcitement,
  goalFrame,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  presetKey,
  sec,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2);
const KICK = GOAL - 24;
const CONTACT = GOAL - 8;

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
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const azam = actors.find((actor) => actor.name === 'azam');
    const farid = actors.find((actor) => actor.name === 'farid');

    if (frame < CONTACT) {
      // The old free-floating ball crossed Azam's shins at 0:12. Pin it to the
      // current ball carrier's feet until Farid strikes.
      const carrier = frame < L('e10_06') ? azam : farid;
      if (carrier) placeBallAtFeet(carrier, ball, 0.55);
      return;
    }

    const result = animateKickAndGoal({
      frame,
      kicker: farid,
      ball,
      net: extra.net,
      start: [-4.4, 0.22, 0.8],
      target: [-6.35, 1.95, 1.45],
      kickFrame: KICK,
      contactFrame: CONTACT,
      hitFrame: GOAL,
      followThrough: 10,
      strength: 1.02,
      arc: 1.05,
      shake: { amplitude: 0.04, duration: 10 },
    });
    extra.shake = result.shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL, { peak: 1 });
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
