import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;

/** Act 3 — prize lands, debt hits zero, and the Divisyen 4 tease. */
export const createLunasScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  actors: [
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.9, position: [1.4, 0, 2.0], rotationY: -0.4,
      beats: [
        { from: 0, to: L('e12_10'), pose: 'idle' },
        { from: L('e12_10'), to: 378, pose: 'phone' },
      ],
      anim: ({ frame, parts }) => {
        if (parts.rightArm && frame >= L('e12_09')) parts.rightArm.rotation.x = -0.75;
      },
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.92, position: [-0.8, 0, 2.2], rotationY: 0.25,
      beats: [
        { from: 0, to: L('e12_10'), pose: 'idle' },
        { from: L('e12_10'), to: L('e12_11'), pose: 'phone' },
        { from: L('e12_11'), to: 378, pose: 'keys' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.97, position: [0.3, 0, 0.9], rotationY: -0.1,
      beats: [
        { from: 0, to: L('e12_12'), pose: 'celebrate' },
        { from: L('e12_12'), to: 378, pose: 'point' },
      ],
    },
  ],
  onFrame: ({ frame, actors }) => {
    const boss = actors.find((actor) => actor.name === 'bos');
    if (!boss) return;
    const buzz = smooth(clamp((frame - L('e12_11')) / 30, 0, 1));
    boss.rig.rotation.y = lerp(0.25, -0.15, buzz);
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [0.6, 1.6, 4.4], [0.4, 1.4, 1.4], 48],
      [sec(L('e12_09')), [1.2, 1.6, 3.6], [1.4, 1.4, 2.0], 44],
      [sec(L('e12_10')), [-0.4, 1.6, 3.8], [-0.8, 1.45, 2.2], 44],
      [sec(L('e12_11')), [-0.6, 1.58, 3.4], [-0.8, 1.4, 2.2], 42],
      [sec(378), [0.2, 1.65, 3.6], [0.2, 1.5, 1.2], 46],
    ],
  },
});
