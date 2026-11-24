import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { BobApp, FaridApp } from '../../../../characters/character-variants.js';
import {
  animateKickAndGoal,
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  goalExcitement,
  goalFrame,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL = goalFrame(ACT_2);
const CONTACT = GOAL - 8;

/**
 * Act 2 (rework) — minute 88: Jurulatih sends everyone forward, Kilat attack
 * once more, Azam reads it, blocks it clean, and releases Farid for 4-3.
 * Bob discovers the RM5 legend; Azam's answer makes it a warning.
 */
export const createLastGaspScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.88, position: [-3.0, 0, 3.6], rotationY: 0.45,
      beats: [
        { from: 0, to: L('e10_05'), pose: 'point', emotion: 'hyped' },
        { from: L('e10_05'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.6, 0, 1.2], rotationY: 0.14,
      beats: [
        { from: 0, to: L('e10_06'), pose: 'stride' },
        { from: L('e10_06'), to: L('e10_07'), pose: 'block', emotion: 'angry' },
        { from: L('e10_07'), to: GOAL, pose: 'point', emotion: 'hyped' },
        { from: GOAL, to: END, pose: 'celebrate' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.6, 0, 0.8], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e10_07'), pose: 'stride' },
        { from: L('e10_07'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: L('e10_09'), pose: 'celebrate' },
        { from: L('e10_09'), to: END, pose: 'idle', emotion: 'happy' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e10_07')) / Math.max(1, CONTACT - L('e10_07')), 0, 1));
        rig.position.x = lerp(-1.6, -5.0, run);
      },
    },
    {
      name: 'bob', Class: BobApp,
      scale: 0.95, position: [2.4, 0, -1.0], rotationY: -0.5,
      beats: [
        { from: 0, to: L('e10_07'), pose: 'stride' },
        { from: L('e10_07'), to: L('e10_09'), pose: 'panic', emotion: 'shocked' },
        { from: L('e10_09'), to: END, pose: 'talk', emotion: 'shocked' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const azam = findActor(actors, 'azam');
    const farid = findActor(actors, 'farid');

    if (frame < CONTACT) {
      // The old free-floating ball crossed Azam's shins: pin it to the
      // current carrier's feet until Farid strikes.
      const carrier = frame < L('e10_07') ? azam : farid;
      if (carrier) placeBallAtFeet(carrier, ball, 0.55);
      return;
    }
    const result = animateKickAndGoal({
      frame, kicker: farid, ball, net: extra.net,
      target: [-5.5, 1.1, 0.4],
      kickFrame: CONTACT - 16, contactFrame: CONTACT, hitFrame: GOAL,
      placeBefore: false,
    });
    extra.shake = result.shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL, { idle: 0.14, peak: 1 });
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const jurulatih = findActor(actors, 'jurulatih');
      const azam = findActor(actors, 'azam');
      const farid = findActor(actors, 'farid');
      const bob = findActor(actors, 'bob');
      return [
        [0, [2.4, 1.9, 6.6], [-0.6, 1.25, 0.4], 44],
        shotKey(getSpeakerThreeQuarterShot(jurulatih, azam, { distance: 4.3 }), sec(L('e10_05'))),
        // Kilat attack again — Azam reads it.
        [sec(L('e10_06')), [1.9, 1.6, 5.4], [-0.6, 1.3, 0.6], 44],
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 4.0 }), sec(L('e10_07'))),
        [sec(CONTACT - 6), [-1.4, 1.6, 5.4], [-4.4, 1.3, 0.2], 44],
        [sec(GOAL), [-2.8, 1.7, 5.8], [-5.0, 1.3, 0.2], 42],
        shotKey(getSpeakerThreeQuarterShot(bob, azam, { distance: 4.2 }), sec(L('e10_11'))),
        shotKey(getTwoShot(azam, bob, { distance: 4.4 }), sec(L('e10_11'))),
        [sec(END), [0.6, 2.0, 6.8], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
