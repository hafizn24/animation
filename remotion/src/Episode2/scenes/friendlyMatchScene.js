import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { createScoreTexture, createSkyTexture } from '../../scene/textures.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createFriendlyMatchScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene, env) => {
    scene.background = createSkyTexture();
    scene.fog = new THREE.Fog(0x101a33, 55, 190);
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.55;
      if (light.isHemisphereLight) {
        light.intensity = 0.4;
        light.color.setHex(0x33415f);
      }
      if (light.isDirectionalLight) {
        light.intensity = 1.2;
        light.color.setHex(0xdce6ff);
        light.position.set(-28, 40, -18);
      }
    });

    const score = createScoreTexture('BULUH', 1, 'GUEST', 0);
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
  extra: (scene) => {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    ball.position.set(6, 0.22, 0);
    scene.add(ball);
    return { ball };
  },
  onFrame: ({ t, extra }) => {
    const flight = smooth(clamp((t - 0.8) / 2.2, 0, 1));
    extra.ball.position.x = lerp(6, 12, flight);
    extra.ball.position.z = lerp(0, -1.5, flight);
    extra.ball.position.y = 0.22 + Math.sin(flight * Math.PI) * 1.4;
    extra.ball.rotation.x = t * 5;
    extra.ball.rotation.z = t * 3;
  },
  actors: [
    ...[0, 1, 2, 3].map((i) => ({
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.64,
      position: [6 + i * 1.8, 0, -2 + (i % 2) * 4],
      rotationY: 1.4,
      animate: ({ t, rig, parts }) => {
        const move = smooth(clamp(t / 4, 0, 1));
        rig.position.x = lerp(6 + i * 1.8, 11 + i * 1.8, move);
        const phase = t * 8 + i * 1.3;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.6;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.6;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.5;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.5;
      },
    })),
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.64,
      position: [11.5, 0, -6.5],
      rotationY: 1.3,
      animate: ({ t, parts }) => {
        if (parts.rightArm) parts.rightArm.rotation.x = -1.05 - Math.sin(t * 4.5) * 0.45;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.64,
      position: [9.5, 0, -7.5],
      rotationY: 1.1,
      animate: ({ t, parts }) => {
        const cheer = smooth(clamp((t - 3) / 1.5, 0, 1));
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - cheer * 0.9;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + cheer * 0.9;
      },
    },
  ],
  camera: {
    fov: 80,
    ease: smooth,
    keys: [
      [0, [28, 4.0, 16], [6, 1.2, 0], 80],
      [3.0, [20, 3.0, 10], [9, 1.2, 1], 78],
      [3.35, [12, 2.2, 5], [11, 1.4, 2], 70],
      [7, [11, 2.0, 4], [12, 1.4, 2], 68],
    ],
  },
});
