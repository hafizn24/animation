import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { PakDinApp } from '../../../../characters/character-variants.js';
import {
  clamp,
  createCinematicScene,
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

/** Act 1 — Pak Din strolls past the press and needles Azam about his RM5 wage. */
export const createOtaiTauntScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env }) => env.anchors,
  actors: [
    {
      name: 'pakdin', Class: PakDinApp,
      scale: 0.97, position: [2.2, 0, 1.6], rotationY: -1.5,
      beats: [
        { from: 0, to: L('e7_02'), pose: 'stride' },
        { from: L('e7_02'), to: L('e7_04'), pose: 'talk', emotion: 'angry' },
        { from: L('e7_04'), to: END, pose: 'stride' },
      ],
      anim: ({ frame, rig }) => {
        const walk = smooth(clamp(frame / 420, 0, 1));
        // End wide of Azam at (-1.5, 0, 0.2): the old (-1.6, 0.2) waypoint
        // walked Pak Din straight through Azam's chest.
        rig.position.x = lerp(2.2, -1.4, walk);
        rig.position.z = lerp(1.6, 2.2, walk);
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.96, position: [-1.5, 0, 0.2], rotationY: 1.5,
      beats: [
        { from: 0, to: L('e7_03'), pose: 'idle' },
        { from: L('e7_03'), to: L('e7_04'), pose: 'talk', emotion: 'angry' },
        { from: L('e7_04'), to: END, pose: 'idle' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    ball.position.x = lerp(0, 3.6, smooth(clamp(frame / 45, 0, 1)));
    ball.position.y = 0.22 + Math.sin(clamp(frame / 45, 0, 1) * Math.PI) * 0.5;
  },
  camera: {
    fov: 50, ease: smooth,
    keys: ({ actors }) => {
      const pakdin = findActor(actors, 'pakdin');
      const azam = findActor(actors, 'azam');
      return [
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 4.4 }), 0),
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 4.2 }), sec(54)),
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 4.2 }), sec(L('e7_02'))),
        shotKey(getSpeakerThreeQuarterShot(azam, pakdin, { distance: 4.3 }), sec(L('e7_03'))),
        // Pak Din has walked to (-1, 2) by this beat; frame him from the -X
        // side so his face is toward lens and Azam stays in the background.
        [sec(L('e7_04')), [-5.2, 1.65, 3.1], [-0.8, 1.35, 2.0], 42],
        [sec(END), [-5.4, 1.65, 3.3], [-1.1, 1.35, 2.1], 42],
      ];
    },
  },
});
