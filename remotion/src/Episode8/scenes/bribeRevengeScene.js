import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, RayyanApp } from '../../../../characters/character-variants.js';
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
const GOAL1 = goalFrame(ACT_2, 0);   // 0-1: Rayyan, "for the envelope"
const GOAL2 = goalFrame(ACT_2, 1);   // 1-1: Farid counter
const GOAL3 = goalFrame(ACT_2, 2);   // 2-1: Farid winner

/**
 * Act 2 (rework) — Rayyan plays pretty and scores first "for the envelope";
 * Azam answers ("Kelas? Saya jaga kelas, bro."), shuts every lane, and sends
 * Farid twice the other way. Pride is not for sale — goals are.
 */
export const createBribeRevengeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'rayyan', Class: RayyanApp,
      scale: 0.95, position: [-1.4, 0, -0.4], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e8_07'), pose: 'stride' },
        { from: L('e8_07'), to: GOAL1, pose: 'stride' },
        { from: GOAL1, to: L('e8_09'), pose: 'celebrate', emotion: 'hyped' },
        { from: L('e8_09'), to: END, pose: 'panic', emotion: 'shocked' },
      ],
      anim: ({ frame, rig }) => {
        // Rayyan drifts into shooting range before the opener, then fades away.
        const run = smooth(clamp((frame - L('e8_06')) / Math.max(1, GOAL1 - 24 - L('e8_06')), 0, 1));
        if (frame < GOAL1 - 20) rig.position.x = lerp(-1.4, -3.4, run);
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.6, 0, 1.2], rotationY: -0.35,
      beats: [
        { from: 0, to: L('e8_09'), pose: 'stride' },
        { from: L('e8_09'), to: L('e8_10'), pose: 'talk', emotion: 'hyped' },
        { from: L('e8_10'), to: END, pose: 'point', emotion: 'hyped' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.8, 0, 1.0], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e8_10'), pose: 'stride' },
        { from: L('e8_10'), to: GOAL2, pose: 'stride' },
        { from: GOAL2, to: L('e8_12'), pose: 'celebrate' },
        { from: L('e8_12'), to: GOAL3, pose: 'stride' },
        { from: GOAL3, to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
      anim: ({ frame, rig }) => {
        const run1 = smooth(clamp((frame - L('e8_10')) / Math.max(1, GOAL2 - 10 - L('e8_10')), 0, 1));
        const run2 = smooth(clamp((frame - L('e8_12')) / Math.max(1, GOAL3 - 10 - L('e8_12')), 0, 1));
        if (frame < GOAL2 - 8) rig.position.x = lerp(-1.8, -4.2, run1);
        else if (frame >= GOAL2 && frame < GOAL3 - 8) rig.position.x = lerp(-1.2, -4.0, run2);
      },
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const rayyan = findActor(actors, 'rayyan');
    const azam = findActor(actors, 'azam');
    const farid = findActor(actors, 'farid');
    let shake = null;

    if (frame < GOAL1 - 8) {
      placeBallAtFeet(rayyan, ball, 0.55);
    } else if (frame < GOAL1) {
      const result = animateKickAndGoal({
        frame, kicker: rayyan, ball, net: extra.net,
        target: [-5.6, 0.8, -0.5],
        kickFrame: GOAL1 - 24, contactFrame: GOAL1 - 8, hitFrame: GOAL1,
      });
      shake = result.shake;
    } else if (frame < GOAL2 - 8) {
      placeBallAtFeet(azam, ball, 0.55);
    } else if (frame < GOAL2) {
      placeBallAtFeet(farid, ball, 0.55);
    } else if (frame < GOAL2 + 8) {
      const result = animateKickAndGoal({
        frame, kicker: farid, ball, net: extra.net,
        target: [-5.5, 1.4, 0.6],
        kickFrame: GOAL2 - 16, contactFrame: GOAL2 - 2, hitFrame: GOAL2 + 6,
      });
      shake = result.shake;
    } else if (frame < GOAL3 - 8) {
      placeBallAtFeet(azam, ball, 0.55);
    } else if (frame < GOAL3) {
      placeBallAtFeet(farid, ball, 0.55);
    } else {
      const result = animateKickAndGoal({
        frame, kicker: farid, ball, net: extra.net,
        target: [-5.7, 1.8, -0.2],
        kickFrame: GOAL3 - 16, contactFrame: GOAL3 - 2, hitFrame: GOAL3 + 4,
      });
      shake = result.shake;
    }
    extra.shake = shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL3, { idle: 0.12, peak: 1 });
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const rayyan = findActor(actors, 'rayyan');
      const azam = findActor(actors, 'azam');
      const farid = findActor(actors, 'farid');
      return [
        [0, [2.4, 1.9, 6.6], [-0.8, 1.25, 0.2], 44],
        shotKey(getSpeakerThreeQuarterShot(rayyan, azam, { distance: 4.3 }), sec(L('e8_06'))),
        shotKey(getSpeakerThreeQuarterShot(rayyan, azam, { distance: 4.0 }), sec(L('e8_07'))),
        // The opener goes in "for the envelope".
        [sec(Math.max(0, GOAL1 - 20)), [-1.6, 1.6, 5.4], [-4.6, 1.2, -0.3], 44],
        shotKey(getSpeakerThreeQuarterShot(azam, rayyan, { distance: 4.2 }), sec(L('e8_09'))),
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 4.0 }), sec(L('e8_10'))),
        [sec(Math.max(0, GOAL2 - 12)), [-1.4, 1.6, 5.2], [-4.2, 1.3, 0.3], 44],
        // Farid's equaliser celebration rides the goal frame (e8_11 is a
        // reserve line — the camera keys never reference dropped dialogue).
        [sec(GOAL2 + 18), [-2.4, 1.7, 5.0], [-4.4, 1.35, 0.3], 42],
        [sec(Math.max(0, GOAL3 - 12)), [-1.6, 1.7, 5.0], [-4.5, 1.4, -0.1], 44],
        shotKey(getSpeakerThreeQuarterShot(farid, azam, { distance: 4.0 }), sec(L('e8_13'))),
        [sec(END), [0.8, 2.0, 6.8], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
