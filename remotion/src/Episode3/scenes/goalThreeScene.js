import { StadiumApp } from '../../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { getScene, localEvent } from '../timings.js';
import {
  addBakeryAdBoard,
  applyGoldenHour,
  cameraShake,
  clamp,
  createBallWithTrail,
  createNetRipple,
  createSceneDirector,
  kickSwing,
  lerp,
  slowMoTime,
  smooth,
} from '../sceneKit.js';

const SCENE = getScene('goal-3-banger');
const GOAL = localEvent(SCENE, 'goal');
const SLOWMO = localEvent(SCENE, 'slowmo');
const SHAKE = localEvent(SCENE, 'shake');

/**
 * Goal 3 — hero banger with a 0.3x contact dip, then THREE distinct animated
 * beats after the net bulges: impact/celebration, rival stun, Kapten close-up.
 * Every value is a pure function of frame (camera sampleKeys + sine waves).
 */
export const createGoalThreeScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: 12, z: -53 });
  },
  extra: (scene) => {
    const ballRig = createBallWithTrail(scene, { trailLength: 14 });
    const ripple = createNetRipple(scene, { x: 2.9, y: 1.95, z: 50.2 });
    return { ...ballRig, ripple };
  },
  onFrame: ({ frame, extra }) => {
    const vframe = slowMoTime(frame / 30, SLOWMO || { frame: -1 }) * 30;
    const pathAt = (at) => {
      const k = smooth(clamp((at - GOAL.frame) / 52, 0, 1));
      return {
        x: lerp(6.4, 2.9, k),
        y: lerp(0.24, 2.05, k) + Math.sin(k * Math.PI) * 0.85,
        z: lerp(39.5, 50.4, k),
      };
    };
    extra.update(pathAt, vframe, frame >= GOAL.frame - 8);
    extra.ripple.update(frame, GOAL.frame + 3);
  },
  actors: [
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.9,
      position: [6.4, 0, 38],
      rotationY: 0.1,
      animate: ({ t, frame, rig, parts }) => {
        const vframe = slowMoTime(frame / 30, SLOWMO || { frame: -1 }) * 30;
        const kick = kickSwing(vframe, GOAL.frame, { windup: 16, follow: 20 });
        rig.rotation.y = kick.torso;
        rig.position.y = Math.sin(t * 1.7) * 0.015;
        if (parts.rightLeg) parts.rightLeg.rotation.x = kick.leg;
        if (parts.leftLeg) parts.leftLeg.rotation.x = kick.plant;

        const cheer = smooth(clamp((frame - GOAL.frame - 5) / 24, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(kick.arm, -0.28, cheer);
          parts.rightArm.rotation.z = lerp(0.45, 2.35, cheer) + Math.sin(t * 6 + 1.4) * 0.13 * cheer;
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.6, -2.5, cheer) + Math.sin(t * 6) * 0.13 * cheer;
        }
        if (parts.head) parts.head.rotation.x = 0.16 * (1 - cheer) - 0.18 * cheer;
        if (parts.torso) parts.torso.rotation.x = 0.06 * (1 - cheer) - 0.1 * cheer;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangKeeper',
      scale: 0.84,
      position: [2.4, 0, 49],
      rotationY: Math.PI,
      animate: ({ frame, rig, parts }) => {
        const dive = smooth(clamp((frame - (GOAL.frame - 4)) / 18, 0, 1));
        rig.rotation.z = -0.72 * dive;
        rig.position.y = dive * 0.32;
        if (parts.rightArm) parts.rightArm.rotation.z = -0.4 - dive * 1.25;
        if (parts.leftArm) parts.leftArm.rotation.z = 0.35 + dive * 0.8;
        if (parts.rightLeg) parts.rightLeg.rotation.x = dive * 0.8;
      },
    },
    ...[[4.6, 43.0], [6.6, 44.2], [8.2, 45.2]].map(([x, z], i) => ({
      Class: SoccerOutfitApp,
      outfit: 'hulubalangBlackOrange',
      scale: 0.78,
      position: [x, 0, z],
      rotationY: Math.PI * 0.86,
      animate: ({ t, frame, parts }) => {
        const lunge = smooth(clamp((frame - 40 - i * 8) / 24, 0, 1));
        const stun = smooth(clamp((frame - GOAL.frame - 12 - i * 5) / 22, 0, 1));
        const breath = Math.sin(t * 1.8 + i * 1.4) * 0.02;
        if (parts.head) {
          parts.head.rotation.x = 0.24 * stun;
          parts.head.rotation.y = Math.sin(frame * 0.15 + i) * 0.3 * (1 - stun) + 0.12 * stun;
        }
        if (parts.torso) {
          parts.torso.rotation.x = lunge * 0.12 + 0.16 * stun;
          parts.torso.scale.y = 1 + breath;
        }
        if (parts.leftLeg) parts.leftLeg.rotation.x = lunge * 0.6 * (1 - stun);
        if (parts.leftArm) {
          parts.leftArm.rotation.x = -0.45 * stun;
          parts.leftArm.rotation.z = -0.3 - lunge * 0.5 - 2.05 * stun;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.x = -0.4 * stun;
          parts.rightArm.rotation.z = 0.3 + lunge * 0.5 + 2.05 * stun;
        }
      },
    })),
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.94,
      position: [-0.5, 0, 36.0],
      rotationY: 0.2,
      animate: ({ t, frame, rig, parts }) => {
        const gesture = smooth(clamp((frame - 276) / 36, 0, 1));
        rig.rotation.y = 0.2 - gesture * 0.12;
        rig.position.y = Math.sin(t * 1.9) * 0.018;
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.3, 1.55, gesture) + Math.sin(t * 2.2) * 0.09 * gesture;
          parts.rightArm.rotation.x = -0.18 * gesture;
        }
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - 0.16 * gesture;
        if (parts.head) {
          parts.head.rotation.y = Math.sin(t * 1.4) * 0.1 * gesture;
          parts.head.rotation.x = -0.05 * gesture;
        }
        if (parts.torso) parts.torso.rotation.x = 0.04 + Math.sin(t * 1.6) * 0.02;
      },
    },
  ],
  camera: {
    fov: 78,
    ease: smooth,
    keys: [
      [0, [13.5, 5.2, 29], [6.4, 1, 38], 78],
      [0.8, [12, 4.4, 31], [6.4, 1, 39], 74],
      [0.83, [8.4, 2.0, 36], [6.4, 1.1, 40.5], 68],
      [1.8, [8, 1.9, 37], [6.4, 1.1, 41], 66],
      [1.83, [9.5, 3.2, 39.5], [6.4, 1, 42.5], 64],
      [2.7, [6.5, 1.35, 42], [6.4, 1, 45], 60],

      [3.0, [10.5, 1.85, 35.6], [4.2, 1.5, 46.0], 60],
      [4.6, [10.0, 1.8, 36.2], [3.4, 1.7, 48.0], 58],

      [4.63, [12.5, 2.5, 44.0], [6.2, 1.4, 44.0], 60],
      [7.8, [11.9, 2.4, 44.3], [6.0, 1.45, 44.2], 58],

      [7.83, [3.0, 1.85, 39.8], [-0.5, 1.45, 36.2], 56],
      [10.0, [2.4, 1.78, 39.0], [-0.5, 1.48, 36.2], 52],
      [13.0, [1.9, 1.72, 38.4], [-0.5, 1.5, 36.2], 50],
    ],
  },
  postCamera: ({ camera, frame }) => {
    const shake = cameraShake(frame, SHAKE || { frame: -1 });
    camera.position.x += shake.x;
    camera.position.y += shake.y;
  },
});
