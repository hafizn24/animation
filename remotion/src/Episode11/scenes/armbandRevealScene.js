import * as THREE from 'three';
import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import { clamp, createCinematicScene, lerp, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;

/** Act 3 — the vacant gold armband finally changes hands. Cliffhanger. */
export const createArmbandRevealScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene, 'reveal'),
  extra: (scene) => {
    const armband = new THREE.Group();
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.028, 12, 30),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.35, roughness: 0.5 })
    );
    band.rotation.x = Math.PI / 2;
    armband.add(band);
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.01, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x1b1d22 })
    );
    crest.position.y = 0.015;
    armband.add(crest);
    armband.position.set(-0.5, 1.3, -1.9);
    armband.scale.setScalar(0.9);
    scene.add(armband);
    return { armband };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-0.7, 0, -1.4], rotationY: 0.18,
      beats: [
        { from: 0, to: L('e11_09'), pose: 'idle' },
        { from: L('e11_09'), to: 288, pose: 'keys' },
      ],
      anim: ({ frame, parts }) => {
        if (parts.rightArm && frame >= L('e11_09')) parts.rightArm.rotation.x = -0.95;
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.8, 0, -0.7], rotationY: -0.28,
      beats: [
        { from: 0, to: L('e11_10'), pose: 'idle' },
        { from: L('e11_10'), to: 288, pose: 'point' },
      ],
      anim: ({ frame, parts }) => {
        if (parts.head && frame >= L('e11_09')) parts.head.rotation.x = -0.05;
      },
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.armband) return;
    const reveal = smooth(clamp((frame - L('e11_09') + 12) / 48, 0, 1));
    extra.armband.position.x = lerp(-0.5, 0.1, reveal);
    extra.armband.position.y = lerp(1.3, 1.42, reveal);
    extra.armband.position.z = lerp(-1.9, -0.9, reveal);
  },
  camera: {
    fov: 42, ease: smooth,
    keys: [
      [0, [0.2, 1.6, 2.6], [0.0, 1.4, -1.2], 44],
      [sec(L('e11_09')), [-0.4, 1.55, 1.9], [-0.5, 1.4, -1.4], 42],
      [sec(L('e11_10')), [0.1, 1.55, 1.6], [0.1, 1.45, -1.0], 40],
      [sec(288), [0.3, 1.6, 1.8], [0.4, 1.5, -0.8], 42],
    ],
  },
});
