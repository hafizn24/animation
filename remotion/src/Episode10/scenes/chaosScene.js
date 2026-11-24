import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { DanialApp, BobApp } from '../../../../characters/character-variants.js';
import {
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  lerp,
  pitchGrade,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 — Bob's chaos and a panicking Danial behind a 3-3 scoreline. */
export const createChaosScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env, actors }) => {
    faceEachOther(findActor(actors, 'bob'), findActor(actors, 'danial'));
    return { ...env.anchors, crowdExcitement: 0.24 };
  },
  actors: [
    {
      name: 'bob', Class: BobApp,
      scale: 0.97, position: [1.6, 0, 1.0], rotationY: -1.7,
      beats: [
        { from: 0, to: L('e10_03'), pose: 'celebrate' },
        { from: L('e10_03'), to: END, pose: 'stride' },
      ],
      anim: ({ rig, frame }) => {
        rig.position.y = Math.abs(Math.sin(frame / 4)) * 0.09;
      },
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.95, position: [-5.0, 0, 0], rotationY: 1.4,
      beats: [
        { from: 0, to: L('e10_03'), pose: 'idle' },
        { from: L('e10_03'), to: END, pose: 'panic' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    ball.position.x = lerp(0, -4.8, smooth(clamp((frame % 110) / 110, 0, 1)));
    ball.position.z = Math.sin(frame / 9) * 1.2;
  },
  camera: {
    fov: 52, ease: smooth,
    keys: ({ actors }) => {
      const bob = findActor(actors, 'bob');
      const danial = findActor(actors, 'danial');
      return [
        [0, [0.0, 1.6, 5.2], [-1.4, 1.35, 0.4], 42],
        shotKey(getSpeakerThreeQuarterShot(bob, danial, { distance: 4.2 }), sec(54)),
        shotKey(getSpeakerThreeQuarterShot(bob, danial, { distance: 4.0 }), sec(L('e10_02'))),
        shotKey(getSpeakerThreeQuarterShot(danial, bob, { distance: 4.4 }), sec(L('e10_03'))),
        [sec(END), [2.2, 1.65, 4.8], [-2.4, 1.35, 0.8], 42],
      ];
    },
  },
});
