import { PitchCrisisNightApp } from '../../../../environments/pitch-crisis-night.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, lerp, nightGrade, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;

/** Act 1 — the floodlight blows and the pitch falls dark behind caution tape. */
export const createFloodlightScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCrisisNightApp,
  grade: (scene, env) => nightGrade(scene, env),
  actors: [
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.94, position: [1.2, 0, 2.4], rotationY: -0.35,
      beats: [
        { from: 0, to: L('e9_02'), pose: 'idle' },
        { from: L('e9_02'), to: L('e9_03'), pose: 'panic' },
        { from: L('e9_03'), to: 420, pose: 'point' },
      ],
    },
  ],
  onFrame: ({ frame, env }) => {
    if (env && typeof env.setCrisisFrame === 'function') env.setCrisisFrame(frame);
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      [0, [-4.2, 3.2, 6.0], [-5.0, 8.2, 8.0], 54],
      [sec(54), [1.8, 1.7, 4.0], [1.2, 1.5, 2.4], 46],
      [sec(L('e9_03')), [-0.5, 1.9, 4.6], [-2.0, 1.2, 4.4], 50],
      [sec(420), [0.8, 1.7, 4.2], [-3.0, 2.4, 6.0], 52],
    ],
  },
});
