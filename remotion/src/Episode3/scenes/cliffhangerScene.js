import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { addBakeryAdBoard, applyGoldenHour, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';
import { getScene, localEvent } from '../timings.js';

const WHISTLE_FRAME = (localEvent(getScene('season-kickoff-cliffhanger'), 'whistle') || { frame: 114 }).frame;

/**
 * Season-kickoff cliffhanger — golden-hour huddle with a slow heroic push-in.
 * Each of the five Buluh FC players gets a distinct heroic pose + breathing,
 * so the slow push-in no longer reads as a cloned A-pose lineup.
 */
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
      animate: ({ t, frame, rig, parts }) => {
        const resolve = smooth(clamp((frame - 24) / 90, 0, 1));
        rig.position.y = Math.sin(t * 1.7) * 0.018;
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.3, -0.82, resolve);
          parts.leftArm.rotation.x = -0.12 * resolve;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 0.82, resolve);
          parts.rightArm.rotation.x = -0.12 * resolve;
        }
        if (parts.head) parts.head.rotation.x = -0.04 - resolve * 0.1;
        if (parts.torso) {
          parts.torso.rotation.x = -0.03 * resolve;
          parts.torso.scale.y = 1 + Math.sin(t * 1.7) * 0.012;
        }
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.86,
      position: [-1.45, 0, 19.6],
      rotationY: 0.32,
      animate: ({ t, frame, rig, parts }) => {
        const settle = smooth(clamp(frame / 30, 0, 1));
        const breath = Math.sin(t * 1.5 + 0.6) * 0.014;
        rig.position.y = breath;
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.3, -1.15, settle);
          parts.leftArm.rotation.x = -1.35 * settle;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 1.12, settle);
          parts.rightArm.rotation.x = -1.28 * settle;
        }
        if (parts.head) parts.head.rotation.y = Math.sin(t * 1.1 + 0.6) * 0.08;
        if (parts.torso) parts.torso.scale.y = 1 + breath;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.86,
      position: [1.45, 0, 19.6],
      rotationY: -0.32,
      animate: ({ t, frame, rig, parts }) => {
        const settle = smooth(clamp((frame - 6) / 30, 0, 1));
        rig.position.y = Math.sin(t * 1.6 + 1.7) * 0.016;
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 2.55, settle) + Math.sin(t * 2.6) * 0.1 * settle;
          parts.rightArm.rotation.x = -0.16 * settle;
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.3, -0.72, settle);
          parts.leftArm.rotation.x = -0.1 * settle;
        }
        if (parts.head) parts.head.rotation.y = Math.sin(t * 1.2 + 1.7) * 0.1;
        if (parts.torso) parts.torso.scale.y = 1 + Math.sin(t * 1.6 + 1.7) * 0.012;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.84,
      position: [-2.7, 0, 21.2],
      rotationY: 0.48,
      animate: ({ t, frame, rig, parts }) => {
        const settle = smooth(clamp((frame - 10) / 30, 0, 1));
        rig.position.y = Math.sin(t * 1.4 + 2.4) * 0.015;
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.3, -2.6, settle) + Math.sin(t * 3.1 + 0.8) * 0.11 * settle;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 2.6, settle) + Math.sin(t * 3.1 + 2.2) * 0.11 * settle;
        }
        if (parts.head) parts.head.rotation.x = -0.08 * settle;
        if (parts.torso) parts.torso.scale.y = 1 + Math.sin(t * 1.4 + 2.4) * 0.012;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.84,
      position: [2.7, 0, 21.2],
      rotationY: -0.48,
      animate: ({ t, frame, rig, parts }) => {
        const settle = smooth(clamp((frame - 14) / 30, 0, 1));
        rig.position.y = Math.sin(t * 1.8 + 3.1) * 0.017;
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.3, -0.38, settle);
          parts.leftArm.rotation.x = -1.05 * settle;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 0.34, settle);
          parts.rightArm.rotation.x = -1.02 * settle + Math.sin(t * 2.4) * 0.05 * settle;
        }
        if (parts.head) parts.head.rotation.y = Math.sin(t * 1.3 + 3.1) * 0.09;
        if (parts.torso) parts.torso.scale.y = 1 + Math.sin(t * 1.8 + 3.1) * 0.013;
      },
    },
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
      [2.6, [0.9, 3.9, 29.2], [0, 1.5, 19], 62],
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
