import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;

/** Act 3 — a quiet battlefield shot behind the league table and debt overlays. */
export const createTableDebtScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.92, position: [-1.4, 0, 2.4], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e8_11'), pose: 'idle' },
        { from: L('e8_11'), to: L('e8_12'), pose: 'document' },
        { from: L('e8_12'), to: 288, pose: 'idle' },
      ],
    },
  ],
  onFrame: ({ frame, actors }) => {
    const boss = actors.find((actor) => actor.name === 'bos');
    if (!boss) return;
    boss.rig.position.z = lerp(2.4, 1.2, smooth(clamp((frame - L('e8_11')) / 80, 0, 1)));
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [-0.6, 1.6, 4.6], [-1.2, 1.4, 2.0], 48],
      [sec(L('e8_11')), [-1.0, 1.58, 4.0], [-1.4, 1.4, 2.4], 44],
      [sec(288), [-1.2, 1.55, 3.6], [-1.3, 1.35, 1.6], 44],
    ],
  },
});
