import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { clamp, createSceneDirector, forEachLight, smooth } from '../sceneKit.js';

export const createLockerRoomScene = (renderer, size) => createSceneDirector(renderer, {
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
        const lean = smooth(clamp((t - 3) / 3, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.1 * lean;
        if (parts.head) parts.head.rotation.x = 0.14 * lean;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.5, -0.35, -2.0],
      rotationY: 0.7,
      animate: ({ t, parts }) => {
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.35;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.35;
        if (parts.torso) parts.torso.rotation.x = 0.28;
        if (parts.head) parts.head.rotation.x = 0.3;
        const shrug = clamp((t - 6.5) / 2, 0, 1);
        if (parts.leftArm) parts.leftArm.rotation.z = -0.2 - shrug * 0.35;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.2 + shrug * 0.35;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [0.4, -0.35, 1.4],
      rotationY: 2.6,
      animate: ({ parts }) => {
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.3;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.3;
        if (parts.torso) parts.torso.rotation.x = 0.3;
        if (parts.head) parts.head.rotation.x = 0.34;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [3.8, -0.35, 1.4],
      rotationY: 2.9,
      animate: ({ parts }) => {
        if (parts.leftLeg) parts.leftLeg.rotation.x = -1.3;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -1.3;
        if (parts.torso) parts.torso.rotation.x = 0.3;
        if (parts.head) parts.head.rotation.x = 0.34;
      },
    },
  ],
  camera: {
    fov: 78,
    ease: smooth,
    keys: [
      [0, [5.6, 3.2, 8.8], [0, 1.4, -1.4], 78],
      [4, [4.2, 2.8, 6.2], [1.0, 1.3, -1.8], 76],
      [8, [2.8, 2.4, 3.6], [2.0, 1.3, -1.6], 72],
      [12, [2.2, 2.2, 2.4], [1.8, 1.3, -1.6], 70],
    ],
  },
});
