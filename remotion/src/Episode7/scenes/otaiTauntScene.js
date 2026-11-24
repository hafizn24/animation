import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { PakDinApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, lerp, pitchGrade, presetKey, sec, smooth } from '../sceneKit.js';
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
      scale: 0.97, position: [2.2, 0, 1.6], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e7_02'), pose: 'stride' },
        { from: L('e7_02'), to: L('e7_04'), pose: 'talk' },
        { from: L('e7_04'), to: END, pose: 'stride' },
      ],
      anim: ({ frame, rig }) => {
        const walk = smooth(clamp(frame / 420, 0, 1));
        rig.position.x = lerp(2.2, -1.6, walk);
        rig.position.z = lerp(1.6, 0.2, walk);
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.96, position: [-1.5, 0, 0.4], rotationY: 0.4,
      beats: [
        { from: 0, to: L('e7_03'), pose: 'idle' },
        { from: L('e7_03'), to: L('e7_04'), pose: 'talk' },
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
    keys: [
      presetKey('MEDIUM_SPEAKER', 0, [1.6, 1.4, 1.6], 0.3),
      presetKey('MEDIUM_SPEAKER', sec(54), [2.2, 1.4, 1.6], 0.2),
      presetKey('MEDIUM_SPEAKER', sec(L('e7_03')), [-1.5, 1.4, 0.4], 0.15),
      presetKey('WIDE_TWO_SHOT', sec(L('e7_04')), [-1.5, 1.4, 0.4], 0.12),
      presetKey('WIDE_TWO_SHOT', sec(END), [-1.5, 1.4, 0.3], 0.12),
    ],
  },
});
