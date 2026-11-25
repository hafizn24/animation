import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { MalikApp, RefereeApp } from '../../../../characters/character-variants.js';
import {
  animateKickAndGoal,
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  goalFrame,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;
const GOAL1 = goalFrame(ACT_1, 0); // 0-1, minute 24
const GOAL2 = goalFrame(ACT_1, 1); // 0-2, minute 41

/**
 * Act 1 (rework) — Besi Waja play like a machine and Kapten Malik commands in
 * three-word bursts. The referee's yellow card goes to AZAM at frame 0's hook,
 * and the fine it triggers is his guilt to carry. HUD: 0-1 (24') -> 0-2 (41')
 * -> 0-2 (HT), never reversed.
 */
export const createBesiWajaScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'malik', Class: MalikApp,
      scale: 0.95, position: [-1.0, 0, -0.4], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e11_02'), pose: 'stride' },
        { from: L('e11_02'), to: L('e11_03'), pose: 'point', emotion: 'angry' },
        { from: L('e11_03'), to: END, pose: 'block', emotion: 'neutral' },
      ],
    },
    {
      name: 'pengadil', Class: RefereeApp,
      scale: 0.92, position: [1.9, 0, 1.8], rotationY: -0.55,
      beats: [
        { from: 0, to: L('e11_03'), pose: 'point', emotion: 'angry' },
        { from: L('e11_03'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.7, 0, 1.2], rotationY: -0.4,
      beats: [
        { from: 0, to: L('e11_03'), pose: 'stride' },
        { from: L('e11_03'), to: L('e11_04'), pose: 'block', emotion: 'worried' },
        { from: L('e11_04'), to: END, pose: 'idle', emotion: 'stressed' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const malik = findActor(actors, 'malik');
    let shake = null;
    if (frame < GOAL1 - 8) {
      placeBallAtFeet(malik, ball, 0.55);
    } else if (frame < GOAL1) {
      const result = animateKickAndGoal({
        frame, kicker: malik, ball, net: extra.net,
        target: [-5.5, 0.9, -0.4],
        kickFrame: GOAL1 - 24, contactFrame: GOAL1 - 8, hitFrame: GOAL1,
      });
      shake = result.shake;
    } else if (frame < GOAL2 - 8) {
      placeBallAtFeet(malik, ball, 0.55);
    } else if (frame < GOAL2 + 6) {
      const result = animateKickAndGoal({
        frame, kicker: malik, ball, net: extra.net,
        target: [-5.6, 1.6, 0.5],
        kickFrame: GOAL2 - 20, contactFrame: GOAL2 - 6, hitFrame: GOAL2,
      });
      shake = result.shake;
    } else {
      placeBallAtFeet(malik, ball, 0.55);
    }
    extra.shake = shake;
    extra.crowdExcitement = frame >= GOAL2 ? 0.5 : 0.14;
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const malik = findActor(actors, 'malik');
      const pengadil = findActor(actors, 'pengadil');
      const azam = findActor(actors, 'azam');
      return [
        // Hook: the card flashes straight into the lens.
        [0, [1.4, 1.5, 4.2], [1.9, 1.4, 1.8], 42],
        [sec(54), [-2.2, 1.7, 4.4], [-1.0, 1.35, -0.4], 42],
        shotKey(getSpeakerThreeQuarterShot(malik, azam, { distance: 4.2 }), sec(L('e11_02'))),
        shotKey(getSpeakerThreeQuarterShot(pengadil, azam, { distance: 3.8 }), sec(L('e11_03'))),
        // The card is Azam's — his guilt, his fine.
        shotKey(getSpeakerThreeQuarterShot(azam, malik, { distance: 4.0 }), sec(L('e11_04'))),
        // 0-2 and the machine closes in.
        [sec(Math.max(0, GOAL2 - 16)), [-1.6, 1.6, 5.6], [-4.6, 1.3, -0.2], 44],
        shotKey(getTwoShot(malik, azam, { distance: 4.4 }), sec(END - 40)),
        [sec(END), [0.6, 2.0, 6.8], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
