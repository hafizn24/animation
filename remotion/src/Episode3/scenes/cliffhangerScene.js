import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { addBakeryAdBoard, applyGoldenHour, clamp, createSceneDirector, smooth } from '../sceneKit.js';
import { getScene, localEvent } from '../timings.js';

const WHISTLE_FRAME = (localEvent(getScene('season-kickoff-cliffhanger'), 'whistle') || { frame: 114 }).frame;

/** Season-kickoff cliffhanger — golden-hour huddle with a slow heroic push-in. */
export const createCliffhangerScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: 14, z: -53 });
    const warmRim = new THREE.PointLight(0xffc07a, 1.4, 40, 1.6);
    warmRim.position.set(-6, 8, 14);
    scene.add(warmRim);
  },
  actors: [
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [0, 0, 18],
      rotationY: 0,
      animate: ({ frame, parts }) => {
        const resolve = smooth(clamp((frame - 24) / 90, 0, 1));
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - resolve * 0.55;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + resolve * 0.8;
        if (parts.head) parts.head.rotation.x = -0.06 - resolve * 0.1;
        if (parts.torso) parts.torso.rotation.x = -0.03 * resolve;
      },
    },
    ...[[-1.45, 19.6], [1.45, 19.6], [-2.7, 21.2], [2.7, 21.2]].map(([x, z], i) => ({
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.86,
      position: [x, 0, z],
      rotationY: i % 2 ? -0.2 : 0.2,
      animate: ({ frame, parts }) => {
        const huddle = smooth(clamp(frame / 28, 0, 1));
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - huddle * 0.35;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + huddle * 0.35;
        if (parts.head) parts.head.rotation.y = Math.sin(frame * 0.08 + i) * 0.09;
      },
    })),
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.84,
      position: [-4.4, 0, 22.5],
      rotationY: 0.35,
      animate: ({ frame, parts }) => {
        if (parts.rightArm) parts.rightArm.rotation.x = -0.35 - smooth(clamp(frame / 60, 0, 1)) * 0.5;
      },
    },
  ],
  camera: {
    fov: 66,
    ease: smooth,
    keys: [
      [0, [1.2, 4.6, 31.5], [0, 1.5, 19.5], 66],
      [2.6, [0.8, 3.6, 27.5], [0, 1.5, 19], 62],
      [4.5, [0.2, 2.9, 24.6], [0, 1.55, 18.6], 58],
      [5.6, [0, 2.4, 22.8], [0, 1.6, 18.2], 54],
    ],
  },
  onFrame: ({ frame, scene }) => {
    if (frame < WHISTLE_FRAME) return;
    const glow = smooth(clamp((frame - WHISTLE_FRAME) / 24, 0, 1));
    scene.traverse((child) => {
      if (child.isPointLight && child.color.getHex() === 0xffc07a) {
        child.intensity = 1.4 + glow * 1.8;
      }
    });
  },
});
