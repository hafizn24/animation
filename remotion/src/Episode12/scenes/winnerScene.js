import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { BesiKeeperApp, FaridApp, MalikApp } from '../../../../characters/character-variants.js';
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
 * Act 2 (rework) — minute 90, two-all. Staged, not narrated: Azam releases
 * Farid, one narrator breath, then the slow-motion 1v1 against the giant
 * Besi Waja keeper. MASUK. The captain screams; the machine finally breaks.
 */
export const createWinnerScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 1.0, position: [1.4, 0, 2.0], rotationY: -0.35,
      beats: [
        { from: 0, to: L('e12_08'), pose: 'point', emotion: 'hyped' },
        { from: L('e12_08'), to: GOAL, pose: 'stride' },
        { from: GOAL, to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.4, 0, 1.0], rotationY: -0.15,
      beats: [
        { from: 0, to: L('e12_10'), pose: 'stride' },
        { from: L('e12_10'), to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e12_08')) / Math.max(1, CONTACT - L('e12_08')), 0, 1));
        rig.position.x = lerp(-1.4, -4.8, run);
        rig.position.z = lerp(1.0, 0.3, run);
      },
    },
    {
      name: 'besikeeper', Class: BesiKeeperApp,
      scale: 1.04, position: [-5.0, 0, 0.0], rotationY: Math.PI / 2 - 0.06,
      beats: [
        { from: 0, to: CONTACT, pose: 'crouch' },
        { from: CONTACT, to: END, pose: 'panic', emotion: 'shocked' },
      ],
    },
    {
      name: 'malik', Class: MalikApp,
      scale: 0.95, position: [-2.4, 0, -1.6], rotationY: 0.25,
      beats: [
        { from: 0, to: GOAL, pose: 'block' },
        { from: GOAL, to: END, pose: 'idle', emotion: 'stressed' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const farid = findActor(actors, 'farid');

    if (frame < CONTACT) {
      // The last attack: ball pinned to Farid's feet on the run.
      placeBallAtFeet(farid, ball, 0.55);
      return;
    }
    // Slow-motion window rides the goal: the strike goes top corner.
    const result = animateKickAndGoal({
      frame, kicker: farid, ball, net: extra.net,
      target: [-5.6, 1.85, -0.3],
      kickFrame: CONTACT - 16, contactFrame: CONTACT, hitFrame: GOAL,
      placeBefore: false,
      arc: 1.6,
    });
    extra.shake = result.shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL, { idle: 0.1, peak: 1 });
  },
  camera: {
    fov: 42, ease: smooth,
    keys: ({ actors }) => {
      const azam = findActor(actors, 'azam');
      const farid = findActor(actors, 'farid');
      const besikeeper = findActor(actors, 'besikeeper');
      const malik = findActor(actors, 'malik');
      return [
        [0, [1.6, 1.8, 6.2], [-0.8, 1.3, 0.6], 44],
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 4.1 }), sec(L('e12_08'))),
        // The one narrator breath — wide, held, quiet.
        [sec(L('e12_09')), [0.4, 2.0, 7.2], [-2.0, 1.3, 0.2], 46],
        // The 1v1: behind Farid's shoulder as the keeper waits.
        [sec(CONTACT - 10), [-2.0, 1.6, 3.6], [-4.8, 1.3, 0.0], 42],
        // Contact and net ripple, tight on the top corner.
        [sec(GOAL), [-2.6, 1.7, 4.4], [-5.2, 1.6, -0.2], 40],
        shotKey(getSpeakerThreeQuarterShot(farid, azam, { distance: 4.0 }), sec(L('e12_10'))),
        shotKey(getTwoShot(azam, farid, { distance: 4.3 }), sec(L('e12_11'))),
        // The machine breaking: Malik alone.
        shotKey(getSpeakerThreeQuarterShot(malik, azam, { distance: 4.2 }), sec(L('e12_12'))),
        [sec(END), [0.4, 2.0, 6.8], [-1.6, 1.3, 0.2], 46],
      ];
    },
  },
});
