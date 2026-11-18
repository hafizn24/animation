import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { createScoreTexture, createSkyTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, smooth } from '../sceneKit.js';

const slumped = ({ parts, t, offset = 0, handsOnHips = false }) => {
  const sag = clamp((t - 1) / 4, 0, 1);
  if (parts.head) parts.head.rotation.x = 0.34 * sag;
  if (parts.torso) parts.torso.rotation.x = 0.16 * sag;
  if (parts.leftArm) {
    parts.leftArm.rotation.x = -0.05 + Math.sin(t * 1.4 + offset) * 0.02;
    if (handsOnHips) parts.leftArm.rotation.z = -0.55;
  }
  if (parts.rightArm) {
    parts.rightArm.rotation.x = -0.05 - Math.sin(t * 1.4 + offset) * 0.02;
    if (handsOnHips) parts.rightArm.rotation.z = 0.55;
  }
};

export const createMatchdayScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene, env) => {
    scene.background = createSkyTexture();
    scene.fog = new THREE.Fog(0x1a2138, 55, 190);
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.6;
      if (light.isHemisphereLight) {
        light.intensity = 0.45;
        light.color.setHex(0x3d4c6b);
      }
      if (light.isDirectionalLight) {
        light.intensity = 1.15;
        light.color.setHex(0xe9efff);
        light.position.set(-28, 40, -18);
      }
    });

    const score = createScoreTexture('BULUH', 0, 'GUEST', 3);
    if (env.characterParts.scoreboard) {
      env.characterParts.scoreboard.traverse((child) => {
        const image = child.material && child.material.map && child.material.map.image;
        if (child.isMesh && image && image.width === 256 && image.height === 128) {
          child.material.map = score;
          child.material.needsUpdate = true;
        }
      });
    }
  },
  actors: [
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.64,
      position: [7, 0, -3],
      rotationY: 1.6,
      animate: ({ parts, t }) => slumped({ parts, t, offset: 0 }),
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.64,
      position: [3.5, 0, 4],
      rotationY: 1.2,
      animate: ({ parts, t }) => slumped({ parts, t, offset: 1.7 }),
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.64,
      position: [10, 0, 7],
      rotationY: 2.1,
      animate: ({ parts, t }) => slumped({ parts, t, offset: 3.3 }),
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.64,
      position: [11.5, 0, -6.5],
      rotationY: 1.3,
      animate: ({ parts, t }) => slumped({ parts, t, handsOnHips: true }),
    },
  ],
  camera: {
    fov: 82,
    ease: smooth,
    keys: [
      [0, [11.5, 1.6, -15], [6, 1.2, -4], 84],
      [2, [9.5, 1.7, -7], [3, 1.1, 2], 82],
      [4, [24, 4.2, 16], [36.5, 3.5, 10], 74],
      [6, [27, 3.6, 13.5], [36.5, 3.5, 10], 70],
    ],
  },
});
