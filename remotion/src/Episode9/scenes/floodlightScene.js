import { PitchCrisisNightApp } from '../../../../environments/pitch-crisis-night.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { DanialApp } from '../../../../characters/character-variants.js';
import {
  createCinematicScene,
  nightGrade,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;
const EXPLOSION = 18; // setCrisisFrame flips the tower at frame 18 (mirrors the cue)

/**
 * Act 1 (rework) — night training in full floodlight: Azam drilling the
 * backline ("Lagi sekali!"), ten nights in. Then the hero tower blows —
 * sparks, smoke, blackness — and Danial's scream lands the panic.
 */
export const createFloodlightScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCrisisNightApp,
  grade: (scene, env) => nightGrade(scene, env),
  extra: (scene, { env }) => ({ ...env.anchors }),
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.6, 0, 1.0], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e9_02'), pose: 'stride' },
        { from: L('e9_02'), to: L('e9_03'), pose: 'point', emotion: 'hyped' },
        { from: L('e9_03'), to: END, pose: 'idle', emotion: 'worried' },
      ],
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.94, position: [-3.2, 0, 2.6], rotationY: 0.4,
      beats: [
        { from: 0, to: L('e9_03'), pose: 'crouch' },
        { from: L('e9_03'), to: END, pose: 'panic', emotion: 'shocked' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [2.6, 0, 3.2], rotationY: -0.45,
      beats: [
        { from: 0, to: L('e9_04'), pose: 'idle' },
        { from: L('e9_04'), to: END, pose: 'talk', emotion: 'stressed' },
      ],
    },
  ],
  onFrame: ({ frame, env, extra }) => {
    if (env && typeof env.setCrisisFrame === 'function') env.setCrisisFrame(frame);
    if (extra) extra.crowdExcitement = frame >= EXPLOSION ? 0.45 : 0.08;
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      // 0:00 — bright night training, the hero tower blazing in frame.
      [0, [-3.4, 5.8, -0.8], [-5.2, 5.6, -4.6], 46],
      // Hook cut: Azam's drill squad, tower behind them.
      [sec(54), [2.6, 2.3, 6.4], [0.6, 1.4, 1.0], 44],
      // Mid-scene: the tower lets go — sparks and smoke fill the frame.
      [sec(EXPLOSION), [-2.2, 4.6, 1.6], [-5.4, 5.8, -4.4], 48],
      // Danial's scream in the sudden dark.
      [sec(L('e9_03')), [-1.4, 1.6, 5.6], [-3.2, 1.4, 2.6], 44],
      shotKey({ position: [3.6, 1.7, 5.8], target: [2.6, 1.4, 3.2], fov: 44 }, sec(L('e9_04'))),
      // The taped-off dark wide.
      [sec(L('e9_05')), [3.0, 2.4, 9.8], [-1.8, 2.2, 0.8], 56],
      [sec(END), [2.6, 2.3, 9.6], [-1.2, 2.5, 1.4], 54],
    ],
  },
});
