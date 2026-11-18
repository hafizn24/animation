import * as THREE from 'three';
import { ManagerOfficeApp } from '../../../../environments/manager-office.js';
import { ChairmanApp } from '../../../../characters/character-chairman.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, smooth } from '../sceneKit.js';

export const createHandoverScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ManagerOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.62;
      if (light.isDirectionalLight && !light.castShadow) light.intensity = 0.25;
    });
  },
  extra: (scene) => {
    const keys = new THREE.Group();
    const brass = new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), brass);
    ring.rotation.x = Math.PI / 2;
    keys.add(ring);
    for (let i = 0; i < 2; i++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.008, 0.022), brass);
      key.position.set(0.08 + i * 0.02, 0, i * 0.035 - 0.018);
      keys.add(key);
    }
    keys.position.set(0.3, 0.84, 1.6);
    scene.add(keys);
    return { keys };
  },
  onFrame: ({ t, extra }) => {
    const slide = smooth(clamp((t - 4) / 4, 0, 1));
    extra.keys.position.x = 0.3 - slide * 1.35;
    extra.keys.position.z = 1.6 + slide * 0.35;
  },
  actors: [
    {
      Class: ChairmanApp,
      outfit: 'boardroomGrey',
      pose: 'idle',
      scale: 0.95,
      position: [0.8, 0, -2.4],
      rotationY: 0.05,
      animate: ({ t, rig, parts }) => {
        const offer = smooth(clamp((t - 2.5) / 2, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.x = -0.55 * offer;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 - 0.18 * offer;

        const stand = smooth(clamp((t - 9) / 2.5, 0, 1));
        rig.position.y = stand * 0.05;
        if (parts.torso) parts.torso.rotation.x = -0.05 * stand;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.1, 0, 3.0],
      rotationY: 0.12,
      animate: ({ t, parts }) => {
        const reach = smooth(clamp((t - 5.5) / 2, 0, 1)) * (1 - smooth(clamp((t - 8.5) / 2, 0, 1)));
        if (parts.rightArm) parts.rightArm.rotation.x = -0.8 * reach;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 - 0.2 * reach;
        if (parts.head) parts.head.rotation.x = 0.16 * smooth(clamp((t - 2) / 3, 0, 1));
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [-2.8, 2.0, 5.2], [0.6, 1.3, -2.2], 74],
      [5, [-2.5, 1.95, 4.5], [0.7, 1.3, -2.3], 72],
      [12, [-2.2, 1.9, 3.9], [0.8, 1.3, -2.4], 68],
    ],
  },
});
