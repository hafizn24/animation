import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import { clamp, createCinematicScene, lerp, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;

/** Act 1 — the red NOTIS SITA stamp lands and the Bank Promise is negotiated. */
export const createBankPromiseScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env }) => {
    const folder = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.46),
      new THREE.MeshBasicMaterial({ color: 0xb3121f, side: THREE.DoubleSide })
    );
    folder.rotation.x = -Math.PI / 2;
    folder.position.set(-0.55, 0.884, 0.22);
    scene.add(folder);

    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.026, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.7 })
    );
    armband.rotation.x = Math.PI / 2;
    armband.position.set(0.42, 0.89, 0.3);
    scene.add(armband);

    const stamp = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.24, 14),
      new THREE.MeshStandardMaterial({ color: 0x2a1414, roughness: 0.6 })
    );
    handle.position.y = 0.14;
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14),
      new THREE.MeshStandardMaterial({ color: 0xb3121f, roughness: 0.5 })
    );
    stamp.add(handle, base);
    stamp.position.set(-0.55, 1.55, 0.22);
    scene.add(stamp);

    return { folder, armband, stamp };
  },
  actors: [
    {
      name: 'boss', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.95, position: [0.2, 0, -1.4], rotationY: 0.06,
      beats: [
        { from: L('e6_02'), to: L('e6_03'), pose: 'talk' },
        { from: L('e6_03'), to: L('e6_04'), pose: 'document' },
        { from: L('e6_04'), to: 420, pose: 'idle' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.94, position: [-1.35, 0, -2.3], rotationY: -0.24,
      beats: [
        { from: 0, to: L('e6_02'), pose: 'idle' },
        { from: L('e6_02'), to: L('e6_03'), pose: 'offer' },
        { from: L('e6_03'), to: 420, pose: 'talk' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.stamp) return;
    // The stamp audio hits on frame 0, so the prop is already down at frame 0
    // and only rebounds before it leaves frame.
    const rebound = smooth(clamp((frame - 2) / 12, 0, 1));
    extra.stamp.position.y = lerp(0.94, 1.12, rebound);
    extra.stamp.visible = frame < 60;
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [-0.55, 1.14, 1.1], [-0.55, 0.88, 0.2], 40],
      [sec(54), [-0.2, 1.5, 1.5], [-0.8, 1.0, -1.2], 46],
      [sec(L('e6_03')), [0.45, 1.62, 1.5], [0.2, 1.4, -1.4], 44],
      [sec(L('e6_04')), [-0.65, 1.58, 1.35], [-1.35, 1.45, -2.3], 44],
      [sec(420), [0.1, 1.6, 1.8], [0.2, 1.1, -0.6], 50],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 12.1) * 0.02 * k;
    camera.position.y += Math.cos(frame * 9.4) * 0.015 * k;
  },
});
