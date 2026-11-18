import * as THREE from 'three';
import { ManagerOfficeApp } from '../../../../environments/manager-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { createNoticeTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, smooth } from '../sceneKit.js';

export const createCliffhangerScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ManagerOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.14;
      if (light.isHemisphereLight) light.intensity = 0.08;
      if (light.isDirectionalLight) light.intensity = 0.05;
      if (light.isPointLight) {
        const nearLamp = Math.abs(light.position.x + 1.65) < 0.5
          && Math.abs(light.position.z - 1.25) < 0.5;
        light.intensity = nearLamp ? 15 : 0.1;
      }
    });
  },
  extra: (scene) => {
    const notice = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 1.15),
      new THREE.MeshStandardMaterial({
        map: createNoticeTexture(),
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    );
    notice.rotation.x = -Math.PI / 2 + 0.4;
    notice.rotation.z = -0.22;
    notice.position.set(-0.9, 0.86, 1.9);
    notice.visible = false;
    scene.add(notice);
    return { notice };
  },
  onFrame: ({ t, extra }) => {
    extra.notice.visible = t > 8.2;
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-0.7, 0, 2.8],
      rotationY: 0.1,
      animate: ({ t, parts }) => {
        const down = smooth(clamp((t - 2) / 4, 0, 1));
        if (parts.head) parts.head.rotation.x = 0.42 * down;
        if (parts.torso) parts.torso.rotation.x = 0.2 * down;

        const reach = smooth(clamp((t - 7.5) / 1.5, 0, 1)) * (1 - smooth(clamp((t - 9) / 1.5, 0, 1)));
        if (parts.rightArm) parts.rightArm.rotation.x = -1.0 * reach;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 - 0.24 * reach;

        const freeze = smooth(clamp((t - 9.2) / 0.8, 0, 1));
        if (parts.head) parts.head.rotation.x += 0.08 * freeze;
      },
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [-4.6, 2.3, 6.2], [-0.5, 1.1, 1.8], 72],
      [8, [-4.2, 2.1, 5.4], [-0.6, 1.0, 1.7], 68],
      [14, [-3.8, 1.9, 4.6], [-0.7, 0.95, 1.6], 62],
    ],
  },
});
