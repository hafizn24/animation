import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { SponsorApp } from '../../../../characters/character-sponsor.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const hardCut = (k) => (k >= 1 ? 1 : 0);

export const createSponsorRejectMontageScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity *= 0.72;
      if (light.isHemisphereLight) light.intensity *= 0.8;
      if (light.isDirectionalLight) light.intensity *= 0.8;
      if (light.isPointLight) light.intensity *= 0.65;
    });
  },
  actors: [
    {
      Class: SponsorApp,
      outfit: 'corporateNavy',
      pose: 'checkWatch',
      scale: 0.95,
      position: [0.9, 0, -1.6],
      rotationY: -0.12,
      animate: ({ t, parts }) => {
        const check = smooth(clamp((t - 0.3) / 1.2, 0, 1));
        if (parts.leftArm) {
          parts.leftArm.rotation.x = lerp(-0.35, -0.72, check);
          parts.leftArm.rotation.z = lerp(0.42, 0.28, check);
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.x = 0.08;
          parts.rightArm.rotation.z = 0.3;
        }
        if (parts.head) parts.head.rotation.x = lerp(0.08, 0.24, check);
      },
    },
    {
      Class: SponsorApp,
      outfit: 'charcoalSlim',
      pose: 'phone',
      scale: 0.95,
      position: [-1.6, 0, -2.6],
      rotationY: 0.18,
      animate: ({ t, parts }) => {
        const ignore = smooth(clamp((t - 1.6) / 1.2, 0, 1));
        if (parts.head) parts.head.rotation.x = 0.1 + 0.22 * ignore;
        if (parts.torso) parts.torso.rotation.y = -0.12 * ignore;
      },
    },
    {
      Class: SponsorApp,
      outfit: 'corporateNavy',
      pose: 'dismiss',
      scale: 0.95,
      position: [2.7, 0, -1.0],
      rotationY: -0.3,
      animate: ({ t, parts }) => {
        const wave = Math.sin(t * 4.5) * 0.12;
        if (parts.rightArm) {
          parts.rightArm.rotation.x = -0.35 + wave;
          parts.rightArm.rotation.z = 0.34 + wave * 0.3;
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.x = -0.22;
          parts.leftArm.rotation.z = -0.36;
        }
        if (parts.head) parts.head.rotation.y = -0.2 + wave * 0.4;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.92,
      position: [0, 0, 1.6],
      rotationY: 0,
      animate: ({ t, parts }) => {
        const hope = smooth(clamp(t / 1.2, 0, 1));
        const drop = smooth(clamp((t - 3.5) / 5, 0, 1));
        if (parts.torso) parts.torso.rotation.x = lerp(0.16 * hope, 0.02, drop);
        if (parts.head) parts.head.rotation.x = lerp(0.1 * hope, -0.26, drop);
        if (parts.rightArm) parts.rightArm.rotation.x = 0.1 * drop;
        if (parts.leftArm) parts.leftArm.rotation.x = 0.1 * drop;
      },
    },
  ],
  camera: {
    fov: 64,
    ease: hardCut,
    keys: [
      [0, [2.8, 1.8, 2.4], [0.85, 1.3, -1.4], 66],
      [1.4, [-3.2, 1.75, 1.4], [-1.5, 1.3, -2.3], 66],
      [2.8, [4.4, 1.75, 1.8], [2.6, 1.3, -0.8], 68],
      [4.0, [0.4, 1.75, 4.0], [0, 1.35, 1.4], 64],
      [5.2, [2.5, 1.75, 2.1], [0.85, 1.3, -1.4], 62],
      [6.6, [-2.9, 1.7, 1.1], [-1.5, 1.3, -2.3], 62],
      [7.9, [4.0, 1.7, 1.4], [2.6, 1.3, -0.8], 64],
      [9.1, [0.2, 1.7, 3.7], [0, 1.35, 1.5], 60],
      [10.3, [2.2, 1.7, 1.8], [0.85, 1.3, -1.4], 58],
      [11.6, [-2.7, 1.65, 0.9], [-1.5, 1.3, -2.3], 58],
      [12.9, [3.6, 1.65, 1.1], [2.6, 1.3, -0.8], 60],
      [14.1, [0.1, 1.65, 3.4], [0, 1.35, 1.5], 58],
      [15.2, [3.4, 1.9, 3.2], [0.4, 1.35, -0.6], 72],
    ],
  },
});
