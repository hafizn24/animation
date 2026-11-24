import { PitchCrisisNightApp } from '../../../../environments/pitch-crisis-night.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, lerp, nightGrade, presetKey, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

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
        { from: L('e9_03'), to: END, pose: 'point' },
      ],
    },
  ],
  onFrame: ({ frame, env }) => {
    if (env && typeof env.setCrisisFrame === 'function') env.setCrisisFrame(frame);
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      presetKey('MEDIUM_SPEAKER', 0, [1.2, 1.4, 2.4], 0.35),
      presetKey('MEDIUM_SPEAKER', sec(54), [1.2, 1.4, 2.4], 0.2),
      presetKey('MEDIUM_SPEAKER', sec(L('e9_03')), [1.2, 1.4, 2.4], -0.1),
      presetKey('WIDE_TWO_SHOT', sec(END), [0.6, 1.4, 3.0], 0.1),
    ],
  },
});
