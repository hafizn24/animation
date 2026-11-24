import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, MalikApp } from '../../../../characters/character-variants.js';
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
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;
const GOAL1 = goalFrame(ACT_1, 0); // 1-2: Farid slices the machine
const GOAL2 = goalFrame(ACT_1, 1); // 2-2: Azam's corner header

/**
 * Act 1 (rework) — the new captain speaks first: frame 0 is Azam mid-speech,
 * armband tight, finger forward. Farid slices the machine for 1-2; then the
 * corner with EVERYONE up and Azam's header makes it 2-2. Malik repeats his
 * mantra as it stops working.
 */
export const createComebackScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 1.0, position: [0.5, 0, 1.4], rotationY: -0.35,
      beats: [
        { from: 0, to: L('e12_01'), pose: 'point', emotion: 'angry' },
        { from: L('e12_01'), to: GOAL2, pose: 'stride' },
        { from: GOAL2, to: L('e12_05'), pose: 'celebrate', emotion: 'hyped' },
        { from: L('e12_05'), to: END, pose: 'point', emotion: 'hyped' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.6, 0, 0.6], rotationY: -0.2,
      beats: [
        { from: 0, to: GOAL1, pose: 'stride' },
        { from: GOAL1, to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
      anim: ({ frame, rig }) => {
        const run = smooth(clamp((frame - L('e12_01')) / Math.max(1, GOAL1 - 12 - L('e12_01')), 0, 1));
        if (frame < GOAL1 - 8) rig.position.x = lerp(-1.6, -4.4, run);
      },
    },
    {
      name: 'malik', Class: MalikApp,
      scale: 0.95, position: [-1.0, 0, -1.0], rotationY: 0.3,
      beats: [
        { from: 0, to: GOAL1, pose: 'block' },
        { from: GOAL1, to: END, pose: 'panic', emotion: 'shocked' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const azam = findActor(actors, 'azam');
    const farid = findActor(actors, 'farid');
    let shake = null;

    if (frame < GOAL1 - 8) {
      placeBallAtFeet(farid, ball, 0.55);
    } else if (frame < GOAL1 + 6) {
      const result = animateKickAndGoal({
        frame, kicker: farid, ball, net: extra.net,
        target: [-5.5, 1.2, 0.5],
        kickFrame: GOAL1 - 20, contactFrame: GOAL1 - 6, hitFrame: GOAL1,
      });
      shake = result.shake;
    } else if (frame < GOAL2 - 12) {
      // The corner: the ball waits at the flag, then loops toward the captain.
      ball.position.set(4.4, 0.22, 0.2);
    } else if (frame < GOAL2 + 6) {
      // Azam rises and buries the header — flight from the box edge.
      const t = smooth(clamp((frame - GOAL2 + 12) / 12, 0, 1));
      ball.position.set(lerp(-1.6, -5.4, t), lerp(1.3, 1.0, t) + 1.1 * 4 * t * (1 - t), lerp(1.2, 0.4, t));
      if (azam && frame < GOAL2) {
        const jump = Math.sin(clamp((frame - GOAL2 + 12) / 10, 0, 1) * Math.PI) * 0.22;
        azam.rig.position.y = jump;
      }
      shake = { x: Math.sin(frame * 1.7) * 0.012, y: 0, z: 0 };
    } else {
      if (azam) azam.rig.position.y = 0;
      ball.position.set(-5.4, 0.6, 0.4);
    }
    extra.shake = shake;
    extra.crowdExcitement = goalExcitement(frame, GOAL2, { idle: 0.14, peak: 0.9 });
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const azam = findActor(actors, 'azam');
      const farid = findActor(actors, 'farid');
      const malik = findActor(actors, 'malik');
      return [
        // Frame 0: the captain mid-speech, hook overlay covering.
        [0, [-0.9, 1.6, 4.4], [0.5, 1.4, 1.4], 42],
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 4.0 }), sec(L('e12_01')) + 0.01),
        // Farid slices the machine.
        [sec(Math.max(0, GOAL1 - 20)), [-1.4, 1.6, 5.4], [-4.2, 1.3, 0.3], 44],
        [sec(GOAL1 + 4), [-2.6, 1.7, 5.6], [-4.8, 1.3, 0.4], 42],
        // The corner: everyone up, the captain rising.
        [sec(Math.max(0, GOAL2 - 24)), [3.6, 2.0, 5.0], [-2.2, 1.3, 0.6], 46],
        [sec(GOAL2), [-1.8, 1.7, 5.6], [-5.0, 1.35, 0.4], 42],
        shotKey(getSpeakerThreeQuarterShot(azam, malik, { distance: 4.0 }), sec(L('e12_05'))),
        shotKey(getTwoShot(azam, farid, { distance: 4.4 }), sec(END - 30)),
        [sec(END), [0.8, 2.0, 6.8], [-1.0, 1.3, 0.4], 46],
      ];
    },
  },
});
