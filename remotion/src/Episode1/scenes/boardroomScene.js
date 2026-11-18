import * as THREE from 'three';
import { LenderBoardroomApp } from '../../../../environments/lender-boardroom.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { createNoticeTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, smooth } from '../sceneKit.js';

export const createBoardroomScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LenderBoardroomApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.35;
      if (light.isHemisphereLight) light.intensity = 0.28;
      if (light.isDirectionalLight) light.intensity = 0.75;
      if (light.isPointLight) light.intensity *= 0.65;
    });
  },
  extra: (scene) => {
    const notice = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1.12),
      new THREE.MeshStandardMaterial({
        map: createNoticeTexture(),
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    );
    notice.rotation.x = -Math.PI / 2 + 0.38;
    notice.rotation.z = -0.14;
    notice.position.set(-0.4, 0.87, 0.95);
    scene.add(notice);
    return { notice };
  },
  onFrame: ({ t, extra }) => {
    const push = smooth(clamp((t - 3.5) / 3, 0, 1));
    extra.notice.position.z = 0.95 - push * 0.22;
    extra.notice.position.x = -0.4 - push * 0.12;
  },
  actors: [
    {
      Class: SuitOutfitApp,
      outfit: 'navyExecutive',
      scale: 0.95,
      position: [0.7, 0, -0.5],
      rotationY: 0,
      animate: ({ t, parts }) => {
        const lean = smooth(clamp((t - 4) / 3, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.16 * lean;
        if (parts.head) parts.head.rotation.x = 0.18 * lean;
        if (parts.rightArm) parts.rightArm.rotation.x = -0.5 * lean;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 - 0.16 * lean;
      },
    },
  ],
  camera: {
    fov: 76,
    ease: smooth,
    keys: [
      [0, [3.2, 2.0, 4.2], [0.2, 1.3, 0.4], 76],
      [3, [2.4, 1.8, 3.2], [0.2, 1.2, 0.6], 70],
      [5.5, [1.4, 1.55, 2.4], [-0.2, 1.05, 0.8], 64],
      [8, [0.9, 1.45, 2.0], [-0.4, 0.95, 0.9], 60],
    ],
  },
});
