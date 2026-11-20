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
  lerp,
  slowMoTime,
  smooth,
} from '../sceneKit.js';

const SCENE = getScene('goal-3-banger');
const GOAL = localEvent(SCENE, 'goal');
const SLOWMO = localEvent(SCENE, 'slowmo');
const SHAKE = localEvent(SCENE, 'shake');

/** Goal 3 — hero banger with 0.3x contact dip, 5-frame shake and ball trail. */
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
      animate: ({ frame, rig, parts }) => {
        const vframe = slowMoTime(frame / 30, SLOWMO || { frame: -1 }) * 30;
        const plant = smooth(clamp(vframe / GOAL.frame, 0, 1));
        rig.rotation.y = lerp(-0.5, 0.24, plant);
        if (parts.rightLeg) parts.rightLeg.rotation.x = lerp(0.5, -1.35, plant);
        if (parts.leftLeg) parts.leftLeg.rotation.x = lerp(-0.2, 0.45, plant);
        if (parts.leftArm) parts.leftArm.rotation.z = -0.45 - plant * 0.55;
        if (parts.rightArm) parts.rightArm.rotation.x = -0.4 * plant;
        if (parts.head) parts.head.rotation.x = 0.16 * plant;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangKeeper',
      scale: 0.84,
      position: [2.4, 0, 49],
      rotationY: Math.PI,
      animate: ({ frame, rig, parts }) => {
        const dive = smooth(clamp((frame - GOAL.frame) / 18, 0, 1));
        rig.rotation.z = -0.72 * dive;
        rig.position.y = dive * 0.32;
        if (parts.rightArm) parts.rightArm.rotation.z = -0.4 - dive * 1.25;
        if (parts.leftArm) parts.leftArm.rotation.z = 0.35 + dive * 0.8;
        if (parts.rightLeg) parts.rightLeg.rotation.x = dive * 0.8;
      },
    },
    ...[0, 1].map((i) => ({
      Class: SoccerOutfitApp,
      outfit: 'hulubalangBlackOrange',
      scale: 0.78,
      position: [4.3 + i * 2.6, 0, 43 + i * 1.6],
      rotationY: Math.PI * 0.82,
      animate: ({ frame, parts }) => {
        const lunge = smooth(clamp((frame - 40 - i * 8) / 24, 0, 1));
        if (parts.head) parts.head.rotation.y = Math.sin(frame * 0.15 + i) * 0.3;
        if (parts.leftLeg) parts.leftLeg.rotation.x = lunge * 0.6;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.4 + lunge * 0.5;
      },
    })),
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
      [3.0, [6.5, 1.35, 42], [6.4, 1, 45], 60],
      [3.4, [5.4, 1.25, 43], [3, 1.7, 49], 58],
      [3.97, [4.4, 1.1, 46], [2.9, 2.05, 50.3], 56],
      [4.0, [9.0, 2.8, 46], [2.9, 1.9, 50.3], 56],
      [5.7, [8.8, 2.7, 46.3], [2.9, 1.85, 50.3], 56],
      [8.3, [8.5, 3.0, 46], [2.9, 1.8, 50.3], 56],
      [13.0, [8.2, 2.8, 46.5], [2.9, 1.7, 50.3], 54],
    ],
  },
  postCamera: ({ camera, frame }) => {
    const shake = cameraShake(frame, SHAKE || { frame: -1 });
    camera.position.x += shake.x;
    camera.position.y += shake.y;
  },
});
