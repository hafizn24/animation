import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createLockerAfterScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.42;
      if (light.isHemisphereLight) light.intensity = 0.28;
      if (light.isDirectionalLight) light.intensity = light.castShadow ? 0.35 : 0.12;
      if (light.isPointLight) light.intensity *= 0.45;
    });
  },
  extra: (scene) => {
    let strip = null;
    scene.traverse((child) => {
      if (child.isPointLight && child.position.x < 0 && child.position.y > 2.8) strip = child;
    });
    return { strip };
  },
  onFrame: ({ t, extra }) => {
    if (!extra.strip) return;
    const flicker = 0.82 + 0.12 * Math.sin(t * 23.3) + 0.06 * Math.sin(t * 61.7 + 1.2);
    extra.strip.intensity = 11 * flicker;
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.92,
      position: [2.8, 0, -1.6],
      rotationY: -0.75,
      animate: ({ t, parts }) => {
        const count = smooth(clamp(t / 4, 0, 1)) * (1 - smooth(clamp((t - 7.5) / 1.5, 0, 1)));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = -1.1 * count;
          parts.rightArm.rotation.z = 0.32 - Math.sin(t * 9) * 0.12 * count;
        }
        const shake = smooth(clamp((t - 8) / 1, 0, 1));
        if (parts.head) parts.head.rotation.y = 0.45 * shake;
        if (parts.torso) parts.torso.rotation.x = 0.12 * shake;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.5, -0.35, -2.0],
      rotationY: 0.7,
      animate: ({ t, rig, parts }) => {
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.35;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.35;
        if (parts.torso) parts.torso.rotation.x = 0.28;
        if (parts.head) parts.head.rotation.x = 0.3;
        const turn = smooth(clamp((t - 7) / 2, 0, 1));
        rig.rotation.y = 0.7 + turn * 0.8;
        const shrug = smooth(clamp((t - 7) / 1.5, 0, 1));
        if (parts.leftArm) parts.leftArm.rotation.z = -0.2 - shrug * 0.4;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.2 + shrug * 0.4;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [0.4, -0.35, 1.4],
      rotationY: 2.6,
      animate: ({ t, parts }) => {
        const lift = smooth(clamp((t - 6) / 2, 0, 1));
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.3;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.3;
        if (parts.torso) parts.torso.rotation.x = 0.3 - lift * 0.22;
        if (parts.head) parts.head.rotation.x = 0.34 - lift * 0.2;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.28 - lift * 0.8;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.28 + lift * 0.8;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [3.8, -0.35, 1.4],
      rotationY: 2.9,
      animate: ({ t, parts }) => {
        const lift = smooth(clamp((t - 6.3) / 2, 0, 1));
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.3;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.3;
        if (parts.torso) parts.torso.rotation.x = 0.3 - lift * 0.22;
        if (parts.head) parts.head.rotation.x = 0.34 - lift * 0.2;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.28 - lift * 0.7;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.28 + lift * 0.7;
      },
    },
  ],
  camera: {
    fov: 78,
    ease: smooth,
    keys: [
      [0, [5.6, 3.2, 8.8], [0, 1.4, -1.4], 78],
      [5, [4.2, 2.8, 6.0], [0.5, 1.3, -1.4], 73],
      [10.67, [2.6, 2.2, 3.2], [0.8, 1.3, -1.4], 68],
    ],
  },
});
