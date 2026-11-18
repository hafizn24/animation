import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { createDawnTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createOpeningScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    scene.background = createDawnTexture();
    scene.fog = new THREE.Fog(0xbcc4cd, 45, 175);
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.85;
      if (light.isHemisphereLight) light.intensity = 0.45;
      if (light.isDirectionalLight) {
        light.intensity = 0.8;
        light.color.setHex(0xffe3c0);
      }
    });
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'walkA',
      scale: 0.64,
      position: [0, 0, -5],
      rotationY: 0,
      animate: ({ t, rig, parts }) => {
        const move = smooth(clamp(t / 8, 0, 1));
        rig.position.z = lerp(-5, 0, move);

        const stride = 1 - smooth(clamp((t - 6.5) / 1.5, 0, 1));
        const phase = t * 7;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * stride;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * stride;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.4 * stride;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.4 * stride;

        const lookUp = smooth(clamp((t - 9) / 3.5, 0, 1));
        if (parts.head) parts.head.rotation.x = -0.3 * lookUp;
      },
    },
  ],
  camera: {
    fov: 80,
    ease: smooth,
    keys: [
      [0, [6.2, 1.4, -9.0], [0, 1.4, -4.0], 80],
      [5, [4.4, 1.5, -5.5], [0, 1.4, -1.0], 78],
      [10, [3.0, 1.65, -2.6], [0, 1.5, 1.0], 74],
      [15, [2.4, 1.9, -0.8], [0, 2.0, 2.6], 72],
    ],
  },
});
