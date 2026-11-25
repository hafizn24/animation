import { PitchPenaltyBoxApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { PakDinApp } from '../../../../characters/character-variants.js';
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

/**
 * Act 1 (rework) — hook: a shot clangs the crossbar at frame 0. Pak Din, Otai
 * Kampung's condescending veteran, mocks the RM5 wage bill; Azam answers with
 * the season's running gag ("blocks are free") and the old lion waits.
 */
export const createOtaiTauntScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchPenaltyBoxApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env, actors }) => {
    faceEachOther(findActor(actors, 'pakdin'), findActor(actors, 'azam'));
    return { ...env.anchors };
  },
  actors: [
    {
      name: 'pakdin', Class: PakDinApp,
      scale: 0.93, position: [-0.8, 0, 0.2], rotationY: 0.35,
      beats: [
        { from: 0, to: L('e7_02'), pose: 'stride' },
        { from: L('e7_02'), to: L('e7_03'), pose: 'talk', emotion: 'hyped' },
        { from: L('e7_03'), to: L('e7_04'), pose: 'idle', emotion: 'shocked' },
        { from: L('e7_04'), to: END, pose: 'point', emotion: 'angry' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [1.0, 0, 0.9], rotationY: -0.4,
      beats: [
        { from: 0, to: L('e7_03'), pose: 'idle' },
        { from: L('e7_03'), to: L('e7_04'), pose: 'talk', emotion: 'hyped' },
        { from: L('e7_04'), to: END, pose: 'block', emotion: 'neutral' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (extra && extra.ball) {
      // The hook's crossbar clang: the ball drops out of frame 0's near miss
      // and rolls to rest by the box edge.
      const drop = smooth(clamp(frame / 30, 0, 1));
      extra.ball.position.set(lerp(-3.0, -1.2, drop), 0.22 + 0.5 * (1 - drop), lerp(-1.4, 1.1, drop));
    }
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const pakdin = findActor(actors, 'pakdin');
      const azam = findActor(actors, 'azam');
      return [
        // Frame 0: crossbar clang — low angle on the goal frame as the ball hits it.
        [0, [-3.0, 1.7, 4.4], [-5.2, 2.1, 0.1], 44],
        // Hook cut: Pak Din's slow, condescending strut.
        [sec(54), [-2.2, 1.6, 3.4], [-0.8, 1.35, 0.2], 42],
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 4.2 }), sec(L('e7_02'))),
        shotKey(getSpeakerThreeQuarterShot(azam, pakdin, { distance: 4.0 }), sec(L('e7_03'))),
        // The old lion promises to wait.
        shotKey(getSpeakerThreeQuarterShot(pakdin, azam, { distance: 3.8 }), sec(L('e7_04'))),
        [sec(END), [0.6, 1.9, 6.2], [-0.4, 1.25, 0.6], 46],
      ];
    },
  },
});
