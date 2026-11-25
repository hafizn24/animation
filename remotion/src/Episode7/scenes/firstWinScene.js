import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { FaridApp, PakDinApp } from '../../../../characters/character-variants.js';
import {
  animateKickAndGoal,
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
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
 * Act 2 (rework) — the press works: Jurulatih shouts it, Pak Din plays the
 * easy pass, Azam reads it five steps early, calls Farid's name, and one touch
 * goes into the top corner. Buluh FC's first goal of the season lands in-scene.
 */
export const createFirstWinScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.88, position: [3.0, 0, 3.6], rotationY: -0.5,
      beats: [
        { from: 0, to: L('e7_06'), pose: 'idle' },
        { from: L('e7_06'), to: END, pose: 'point', emotion: 'hyped' },
      ],
    },
    {
      name: 'pakdin', Class: PakDinApp,
      scale: 0.93, position: [-0.6, 0, -0.8], rotationY: 0.4,
      beats: [
        { from: 0, to: L('e7_07'), pose: 'stride' },
        { from: L('e7_07'), to: END, pose: 'panic', emotion: 'shocked' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 1.0], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e7_08'), pose: 'intercept' },
        { from: L('e7_08'), to: GOAL, pose: 'point', emotion: 'hyped' },
        { from: GOAL, to: END, pose: 'celebrate' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-2.0, 0, 0.4], rotationY: -0.15,
      beats: [
        { from: 0, to: L('e7_08'), pose: 'stride' },
        { from: L('e7_08'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: L('e7_10'), pose: 'celebrate' },
        { from: L('e7_10'), to: END, pose: 'point', emotion: 'hyped' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e7_08')) / Math.max(1, CONTACT - L('e7_08')), 0, 1));
        rig.position.x = lerp(-2.0, -4.6, run);
        rig.position.z = lerp(0.4, 0.2, run);
      },
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const azam = findActor(actors, 'azam');
    const farid = findActor(actors, 'farid');

    if (frame < CONTACT) {
      // Ball pinned to the current carrier until the strike (no floating).
      const carrier = frame < L('e7_08') ? azam : farid;
      if (carrier) placeBallAtFeet(carrier, ball, 0.55);
      return;
    }
    const result = animateKickAndGoal({
      frame, kicker: farid, ball, net: extra.net,
      target: [-5.5, 1.75, 0.2],
      kickFrame: CONTACT - 16, contactFrame: CONTACT, hitFrame: GOAL,
      placeBefore: false,
    });
    extra.shake = result.shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL, { idle: 0.12, peak: 1 });
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const jurulatih = findActor(actors, 'jurulatih');
      const azam = findActor(actors, 'azam');
      const pakdin = findActor(actors, 'pakdin');
      const farid = findActor(actors, 'farid');
      return [
        [0, [2.2, 1.9, 6.4], [-0.4, 1.25, 0.4], 44],
        shotKey(getSpeakerThreeQuarterShot(jurulatih, azam, { distance: 4.3 }), sec(L('e7_06'))),
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 4.2 }), sec(L('e7_07'))),
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 4.1 }), sec(L('e7_08'))),
        // The counter run: camera tracks Farid into the box.
        [sec(CONTACT - 6), [-1.2, 1.6, 5.2], [-4.2, 1.3, 0.2], 44],
        // Net ripple + roar from behind the strike.
        [sec(GOAL), [-2.6, 1.7, 5.8], [-5.0, 1.35, 0.1], 42],
        shotKey(getSpeakerThreeQuarterShot(farid, azam, { distance: 4.2 }), sec(L('e7_10'))),
        [sec(END), [0.6, 2.0, 6.6], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
