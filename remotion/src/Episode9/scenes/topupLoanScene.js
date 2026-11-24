import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import { clamp, createCinematicScene, lerp, presetKey, sec, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;

/** Act 2 — Peguam is called back and the emergency top-up is signed. */
export const createTopupLoanScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene2'),
  extra: (scene, { env }) => {
    if (env && typeof env.setDocument === 'function') {
      env.setDocument({
        title: 'BORANG PINJAMAN KECEMASAN',
        subtitle: 'BULUH FC • KECEMASAN',
        amount: 'RM25,000',
        note: 'UNTUK: BAYAR GAJI PEMAIN',
        accent: '#9a6b12',
      });
    }
    const folder = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.44),
      new THREE.MeshBasicMaterial({ color: 0xb3121f, side: THREE.DoubleSide })
    );
    folder.rotation.x = -Math.PI / 2;
    folder.position.set(-0.5, 0.885, 0.24);
    scene.add(folder);
    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.026, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.7 })
    );
    armband.rotation.x = Math.PI / 2;
    armband.position.set(0.42, 0.89, 0.3);
    scene.add(armband);
    return { folder, armband };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.95, position: [0.2, 0, -1.4], rotationY: 0.05,
      beats: [
        { from: 0, to: L('e9_05'), pose: 'coffee' },
        { from: L('e9_05'), to: L('e9_06'), pose: 'document' },
        { from: L('e9_06'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.94, position: [-1.4, 0, -2.2], rotationY: -0.2,
      beats: [
        { from: L('e9_06'), to: L('e9_07'), pose: 'talk' },
        { from: L('e9_07'), to: END, pose: 'idle' },
      ],
      anim: ({ frame, rig }) => {
        rig.visible = frame >= 80;
        rig.position.z = lerp(-4.2, -2.2, smooth(clamp((frame - 80) / 70, 0, 1)));
      },
    },
  ],
  camera: {
    fov: 46, ease: smooth,
    keys: [
      presetKey('MEDIUM_SPEAKER', 0, [0.2, 1.4, -1.0], 0.0),
      presetKey('MEDIUM_SPEAKER', sec(L('e9_05')), [0.2, 1.4, -1.4], 0.0),
      presetKey('MEDIUM_SPEAKER', sec(L('e9_06')), [-1.4, 1.4, -2.2], -0.1),
      presetKey('WIDE_TWO_SHOT', sec(END), [0.1, 1.4, 0.1], 0.0),
    ],
  },
});
