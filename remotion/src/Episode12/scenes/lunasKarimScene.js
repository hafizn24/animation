import { PitchHeroStandApp, heroStandGrade } from '../../../../environments/pitch-hero-stand.js';
import { KarimAwayApp } from '../../../../characters/character-karim-away.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import {
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;
const HERO = [0.9, 1.62, -8.35]; // Karim's spot on the second tier

/**
 * Act 3 (rework) — the payout lands through the Peguam's phone (no narrator
 * arithmetic), Bos screams the club back to life, and the camera finds the
 * tribun: Karim in his Divisyen 4 kit with a Buluh scarf, clapping. His line
 * completes Episode 5's promise. The banner flips to JUARA and seeded
 * confetti falls. Season2Hook card follows on the overlay layer.
 */
export const createLunasKarimScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchHeroStandApp,
  grade: (scene, env) => heroStandGrade(scene, env),
  extra: (scene, { env, actors }) => {
    const azam = findActor(actors, 'azam');
    const peguam = findActor(actors, 'peguam');
    const karim = findActor(actors, 'karim');
    if (azam && peguam) faceEachOther(azam, peguam);
    if (karim) {
      // He watches the pitch: turned toward the celebration below.
      karim.rig.rotation.y = -0.5;
    }
    return { ...(env && env.anchors ? env.anchors : {}), bannerFlipped: false };
  },
  actors: [
    {
      name: 'karim', Class: KarimAwayApp, outfit: 'div4Away',
      scale: 0.96, position: HERO, rotationY: -0.5,
      beats: [
        { from: 0, to: L('e12_15'), pose: 'idle' },
        { from: L('e12_15'), to: L('e12_16'), pose: 'talk', emotion: 'happy' },
        { from: L('e12_16'), to: L('e12_18'), pose: 'idle', emotion: 'happy' },
        { from: L('e12_18'), to: END, pose: 'celebrate', emotion: 'happy' },
      ],
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-1.3, 0, 2.6], rotationY: 0.3,
      beats: [
        { from: 0, to: L('e12_14'), pose: 'point', emotion: 'shocked' },
        { from: L('e12_14'), to: L('e12_16'), pose: 'idle' },
        { from: L('e12_16'), to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.92, position: [1.5, 0, 3.0], rotationY: -0.45,
      beats: [
        { from: 0, to: L('e12_16'), pose: 'phone', emotion: 'neutral' },
        { from: L('e12_16'), to: END, pose: 'offer', emotion: 'happy' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 1.4], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e12_15'), pose: 'celebrate', emotion: 'hyped' },
        { from: L('e12_15'), to: L('e12_18'), pose: 'point', emotion: 'happy' },
        { from: L('e12_18'), to: END, pose: 'celebrate', emotion: 'hyped' },
      ],
    },
  ],
  onFrame: ({ frame, env, extra }) => {
    if (!env) return;
    // The banner flips to JUARA the moment the LUNAS line lands.
    const flipFrame = L('e12_16') + 24;
    if (frame >= flipFrame && !extra.bannerFlipped) {
      env.flipBanner();
      extra.bannerFlipped = true;
    }
    // Confetti from the flip onward; flags and hero crowd ride updateCrowd.
    env.updateConfetti(frame, frame >= flipFrame);
    if (extra) extra.crowdExcitement = frame >= L('e12_16') ? 0.9 : 0.5;
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const peguam = findActor(actors, 'peguam');
      const azam = findActor(actors, 'azam');
      const karim = findActor(actors, 'karim');
      return [
        // Open wide: trophy lift energy, banner reading BULUH FC.
        [0, [1.0, 1.9, 7.2], [-0.4, 1.4, 1.6], 46],
        shotKey(getSpeakerThreeQuarterShot(peguam, bos, { distance: 3.8 }), sec(L('e12_14')) - 0.01),
        // Bos spots the tribun — whip toward the stand.
        [sec(L('e12_14')), [0.6, 1.6, 0.2], [0.9, 1.45, -8.35], 42],
        // Karim's reveal: low angle up into the stand.
        shotKey({ position: [1.6, 1.35, -3.4], target: HERO, fov: 42 }, sec(L('e12_15'))),
        // The LUNAS call lands below while confetti starts.
        shotKey(getSpeakerThreeQuarterShot(peguam, azam, { distance: 3.9 }), sec(L('e12_16'))),
        shotKey(getSpeakerThreeQuarterShot(bos, azam, { distance: 3.8 }), sec(L('e12_17'))),
        // Final line: Karim in the stand, banner now JUARA behind him.
        shotKey({ position: [2.2, 1.4, -3.0], target: HERO, fov: 40 }, sec(L('e12_18'))),
        shotKey(getTwoShot(azam, bos, { distance: 4.4 }), sec(END - 24)),
        [sec(END), [1.0, 2.1, 7.4], [-0.4, 1.6, -2.0], 46],
      ];
    },
  },
  postCamera: ({ frame }) => {
    // Soft trophy-day float on the reveal windows.
    if (frame > 12) return;
    const k = 1 - frame / 12;
    // No-op: shake lives in actionKit; kept for symmetric signature.
  },
});
