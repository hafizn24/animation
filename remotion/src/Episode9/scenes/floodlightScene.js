import { PitchCrisisNightApp } from '../../../../environments/pitch-crisis-night.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { createCinematicScene, nightGrade, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 â€” the floodlight blows and the pitch falls dark behind caution tape. */
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
  onFrame: ({ frame, env, extra }) => {
    if (env && typeof env.setCrisisFrame === 'function') env.setCrisisFrame(frame);
    if (extra) extra.crowdExcitement = frame >= 18 ? 0.45 : 0.08;
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      // 0:00 tower close-up — the hero tower must actually be in frame.
      [0, [-3.6, 6.2, -1.4], [-5.6, 6.4, -4.6], 46],
      // 0:01.8 cut to Jurulatih as the pitch drops dark.
      [sec(54), [2.9, 2.5, 6.6], [1.2, 1.5, 2.4], 44],
      // 0:08 cut to the taped-off touchline, tower and stands behind.
      [sec(240), [3.2, 2.6, 10.5], [-1.6, 2.6, 1.2], 56],
      [sec(END), [2.6, 2.3, 9.6], [-1.2, 2.5, 1.4], 54],
    ],
  },
});
