import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import {
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;

/**
 * Act 2 (rework) — the office at its lowest. Bos lifts the phone to the one
 * name he never wanted to call again; the Peguam's proverb lands cold, then
 * one degree warmer for the kids training at night. Bos vows: never again.
 */
export const createTopupLoanScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env, actors }) => {
    faceEachOther(findActor(actors, 'boss'), findActor(actors, 'peguam'));
    if (env && typeof env.setDocument === 'function') {
      env.setDocument({
        title: 'PERJANJIAN TOP-UP',
        subtitle: 'BANK • BULUH FC',
        amount: '+RM25,000',
        note: 'LAMPU STADIUM — KECEMASAN',
      });
    }
    // The phone: a dark slab on the desk that Bos lifts on the call.
    const phone = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.02, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.4, metalness: 0.2 })
    );
    phone.position.set(0.45, 0.9, 0.05);
    scene.add(phone);
    return { phone };
  },
  actors: [
    {
      name: 'boss', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.95, position: [0.2, 0, -1.4], rotationY: 0.06,
      beats: [
        { from: 0, to: L('e9_07'), pose: 'phone', emotion: 'stressed' },
        { from: L('e9_07'), to: L('e9_08'), pose: 'phone', emotion: 'worried' },
        { from: L('e9_08'), to: L('e9_09'), pose: 'idle', emotion: 'stressed' },
        { from: L('e9_09'), to: END, pose: 'keys', emotion: 'worried' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.94, position: [-1.35, 0, -2.3], rotationY: -0.24,
      beats: [
        { from: 0, to: L('e9_08'), pose: 'idle' },
        { from: L('e9_08'), to: L('e9_09'), pose: 'talk', emotion: 'angry' },
        { from: L('e9_09'), to: END, pose: 'offer', emotion: 'neutral' },
      ],
    },
  ],
  onFrame: ({ frame, extra, actors }) => {
    // Bos picks the phone up off the desk on his first word, sets it down
    // after the Peguam's final term.
    if (extra && extra.phone) {
      const boss = findActor(actors, 'boss');
      const lift = smooth(clamp((frame - L('e9_07')) / 14, 0, 1));
      const drop = smooth(clamp((frame - L('e9_09') - 40) / 14, 0, 1));
      const handY = lerp(0.9, 1.45, lift) - drop * 0.55;
      const handZ = lerp(0.05, -0.5, lift) + drop * 0.55;
      extra.phone.position.set(lerp(0.45, 0.32, lift), handY, handZ);
      if (boss && lift >= 1) {
        boss.rig.rotation.y = 0.06 + Math.sin(frame * 0.03) * 0.02;
      }
    }
  },
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const boss = findActor(actors, 'boss');
      const peguam = findActor(actors, 'peguam');
      return [
        // Open on the phone on the desk — the call he never wanted to make.
        [0, [0.35, 1.35, 0.85], [0.45, 0.92, 0.05], 42],
        [sec(54), [-0.2, 1.5, 1.5], [-0.7, 1.05, -1.2], 42],
        shotKey(getSpeakerThreeQuarterShot(boss, peguam, { distance: 3.7 }), sec(L('e9_07'))),
        shotKey(getSpeakerThreeQuarterShot(peguam, boss, { distance: 3.7 }), sec(L('e9_08'))),
        // The one degree of warmth lands on the reverse shot.
        shotKey(getSpeakerThreeQuarterShot(peguam, boss, { distance: 3.4 }), sec(L('e9_09'))),
        shotKey(getSpeakerThreeQuarterShot(boss, peguam, { distance: 3.6 }), sec(END - 40)),
        [sec(END), [0.1, 1.6, 1.8], [0.2, 1.1, -0.6], 42],
      ];
    },
  },
});
