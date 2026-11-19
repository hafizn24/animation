import * as THREE from 'three';
import { LenderBoardroomApp } from '../../../../environments/lender-boardroom.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { createNoticeTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createRecapScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LenderBoardroomApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.32;
      if (light.isHemisphereLight) light.intensity = 0.24;
      if (light.isDirectionalLight) light.intensity = 0.8;
      if (light.isPointLight) light.intensity *= 0.6;
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
    notice.position.set(-0.4, 1.4, 0.95);
    scene.add(notice);
    return { notice };
  },
  onFrame: ({ t, extra }) => {
    const slam = smooth(clamp(t / 0.4, 0, 1));
    const bounce = Math.sin(clamp((t - 0.4) / 0.45, 0, 1) * Math.PI) * 0.035;
    extra.notice.position.y = lerp(1.4, 1.02, slam) + bounce;
    const push = smooth(clamp((t - 1.1) / 2.8, 0, 1));
    extra.notice.position.z = 0.95 - push * 0.2;
    extra.notice.position.x = -0.4 - push * 0.1;
  },
  actors: [
    {
      Class: SuitOutfitApp,
      outfit: 'navyExecutive',
      scale: 0.95,
      position: [0.7, 0, -0.5],
      rotationY: 0,
      animate: ({ t, parts }) => {
        const lean = smooth(clamp((t - 0.5) / 2, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.16 * lean;
        if (parts.head) parts.head.rotation.x = 0.18 * lean;
        if (parts.rightArm) {
          parts.rightArm.rotation.x = -0.5 * lean;
          parts.rightArm.rotation.z = 0.32 - 0.16 * lean;
        }
      },
    },
  ],
  camera: {
    fov: 76,
    ease: smooth,
    keys: [
      [0, [2.6, 2.0, 4.2], [-0.1, 1.2, 0.7], 76],
      [1.1, [2.1, 1.85, 3.4], [-0.2, 1.1, 0.8], 72],
      [5, [1.5, 1.7, 2.7], [-0.35, 1.0, 0.9], 66],
    ],
  },
});
