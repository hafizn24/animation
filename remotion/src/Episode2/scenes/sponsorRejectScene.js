import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { SponsorApp } from '../../../../characters/character-sponsor.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createSponsorRejectScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity *= 0.8;
      if (light.isHemisphereLight) light.intensity *= 0.85;
      if (light.isDirectionalLight) light.intensity *= 0.85;
      if (light.isPointLight) light.intensity *= 0.75;
    });
  },
  actors: [
    {
      Class: SponsorApp,
      outfit: 'charcoalSlim',
      pose: 'checkWatch',
      scale: 0.95,
      position: [0.7, 0, -1.2],
      rotationY: 0.05,
      animate: ({ t, rig, parts }) => {
        const watch = smooth(clamp((t - 1) / 1.5, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.x = lerp(-0.45, -0.95, watch);
        if (parts.rightArm) parts.rightArm.rotation.z = lerp(0.2, 0.42, watch);
        if (parts.head) parts.head.rotation.x = 0.16 * watch;

        const turn = smooth(clamp((t - 2.2) / 1.6, 0, 1));
        rig.rotation.y = lerp(0.05, -0.42, turn);
        if (parts.torso) parts.torso.rotation.y = -0.12 * turn;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.3, 0, 1.9],
      rotationY: 0.2,
      animate: ({ t, parts }) => {
        const drop = smooth(clamp((t - 3) / 2, 0, 1));
        if (parts.head) parts.head.rotation.x = -0.28 * drop;
        if (parts.torso) parts.torso.rotation.x = -0.06 * drop;
        if (parts.leftArm) parts.leftArm.rotation.x = 0.1 * drop;
        if (parts.rightArm) parts.rightArm.rotation.x = 0.1 * drop;
      },
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [2.4, 1.9, 4.4], [0, 1.25, -0.8], 72],
      [3, [1.8, 1.8, 3.7], [0, 1.25, -0.8], 67],
      [6.67, [1.2, 1.7, 3.0], [0, 1.25, -0.8], 62],
    ],
  },
});
