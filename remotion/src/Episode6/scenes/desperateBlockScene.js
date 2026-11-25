import { FullSizeStadiumApp } from '../FullSizeStadiumApp.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { ZakiApp } from '../../../../characters/character-variants.js';
import {
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/**
 * Act 3 (rework) — minute 89. Zaki wants a third for his clipboard; Azam
 * throws himself in front of the shot ("Tak lepas. Hari ini tak lepas."), and
 * on the touchline the Peguam writes it all down without a word. The debt
 * ticker holds NEUTRAL at RM331,500 — a loss pays RM0.
 */
export const createDesperateBlockScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: FullSizeStadiumApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env, actors }) => {
    const azam = findActor(actors, 'azam');
    const zaki = findActor(actors, 'zaki');
    if (azam && zaki) {
      azam.rig.rotation.y = 0.4;
      zaki.rig.rotation.y = Math.PI + 0.15;
    }
    return { ...env.anchors };
  },
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [27.0, 0, 2.0], rotationY: 0.4,
      beats: [
        { from: 0, to: L('e6_13'), pose: 'intercept' },
        { from: L('e6_13'), to: END, pose: 'block', emotion: 'angry' },
      ],
    },
    {
      name: 'zaki', Class: ZakiApp,
      scale: 0.96, position: [23.5, 0, 1.0], rotationY: Math.PI + 0.15,
      beats: [
        { from: 0, to: L('e6_13'), pose: 'talk', emotion: 'hyped' },
        { from: L('e6_13'), to: END, pose: 'panic', emotion: 'shocked' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.92, position: [31.5, 0, 7.0], rotationY: -0.55,
      beats: [
        { from: 0, to: L('e6_14'), pose: 'idle' },
        { from: L('e6_14'), to: END, pose: 'document', emotion: 'neutral' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    const azam = findActor(actors, 'azam');
    if (!ball || !azam) return;
    // The shot flies in from Zaki's side and dies at Azam's block.
    if (frame < L('e6_13') - 6) {
      ball.position.set(22.0, 0.22, 0.2);
    } else {
      const t = smooth(clamp((frame - L('e6_13') - 6) / 10, 0, 1));
      ball.position.set(lerp(22.0, 26.6, t), lerp(0.5, 0.22, t), lerp(0.2, 2.5, t));
    }
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const azam = findActor(actors, 'azam');
      const zaki = findActor(actors, 'zaki');
      const peguam = findActor(actors, 'peguam');
      return [
        // 89th minute wide: the block is about to happen on the touchline side.
        [0, [34.0, 8.0, 10.0], [27.0, 1.3, 2.0], 42],
        shotKey(getTwoShot(azam, zaki, { distance: 4.6 }), sec(L('e6_11')) + 0.01),
        [sec(L('e6_13') - 8), [31.0, 4.5, 7.0], [27.0, 1.3, 2.0], 40],
        shotKey(getSpeakerThreeQuarterShot(azam, zaki, { distance: 3.9 }), sec(L('e6_13'))),
        // The lawyer writes it all down — no words needed.
        shotKey(getSpeakerThreeQuarterShot(peguam, azam, { distance: 4.1 }), sec(L('e6_14'))),
        [sec(END), [34.0, 7.0, 10.0], [27.0, 1.25, 3.0], 42],
      ];
    },
  },
});
