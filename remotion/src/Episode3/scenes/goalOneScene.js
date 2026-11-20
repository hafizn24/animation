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
  smooth,
} from '../sceneKit.js';

const SCENE = getScene('goal-1-cold-open');
const GOAL = localEvent(SCENE, 'goal');
const SHAKE = localEvent(SCENE, 'shake');

/** Cold open — frame 0 is a full-brightness low-angle mid-strike. */
export const createGoalOneScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: 8, z: -53 });
  },
  extra: (scene) => {
    const ballRig = createBallWithTrail(scene);
    const ripple = createNetRipple(scene, { z: 50.2 });
    return { ...ballRig, ripple };
  },
  onFrame: ({ frame, extra }) => {
    const strike = smooth(clamp(frame / 26, 0, 1));
    extra.update((at) => {
      const k = smooth(clamp(at / 26, 0, 1));
      return {
        x: lerp(1.9, 1.0, k),
        y: 0.24 + Math.sin(k * Math.PI) * 1.05,
        z: lerp(41.5, 50.4, k),
      };
    }, frame, true);
    extra.ripple.update(frame, GOAL.frame - 4);
  },
  actors: [
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.86,
      position: [1.9, 0, 40.6],
      rotationY: 0.06,
      animate: ({ frame, rig, parts }) => {
        const follow = smooth(clamp(frame / 22, 0, 1));
        rig.rotation.y = lerp(-0.42, 0.18, follow);
        if (parts.rightLeg) parts.rightLeg.rotation.x = lerp(-1.15, 0.85, follow);
        if (parts.leftLeg) parts.leftLeg.rotation.x = lerp(0.3, -0.4, follow);
        if (parts.rightArm) parts.rightArm.rotation.x = -0.7 * follow;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.5 - follow * 0.4;
        if (parts.head) parts.head.rotation.x = 0.12 * follow;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangKeeper',
      scale: 0.82,
      position: [1.1, 0, 48.9],
      rotationY: Math.PI,
      animate: ({ frame, rig, parts }) => {
        const dive = smooth(clamp((frame - 10) / 16, 0, 1));
        rig.rotation.z = -0.62 * dive;
        rig.position.x = 1.1 + dive * 0.9;
        if (parts.rightArm) parts.rightArm.rotation.z = -0.3 - dive * 1.2;
        if (parts.leftArm) parts.leftArm.rotation.z = 0.3 + dive * 0.9;
        if (parts.rightLeg) parts.rightLeg.rotation.x = dive * 0.7;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangBlackOrange',
      scale: 0.8,
      position: [4.6, 0, 45.5],
      rotationY: 2.7,
      animate: ({ frame, parts }) => {
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + Math.sin(frame * 0.2) * 0.18;
        if (parts.head) parts.head.rotation.y = -0.3;
      },
    },
  ],
  camera: {
    fov: 76,
    ease: smooth,
    keys: [
      [0, [3.6, 1.05, 35.8], [1.9, 1.1, 42.4], 76],
      [0.3, [3.4, 1.0, 36.4], [1.9, 1.1, 42.8], 72],
      [0.33, [5.0, 1.3, 40.5], [1.6, 1.2, 46], 66],
      [0.83, [4.6, 1.2, 42.0], [1.2, 1.2, 48.5], 62],
      [0.86, [8.2, 2.3, 44.5], [0.4, 1.25, 50.2], 60],
      [1.46, [7.8, 2.2, 45.0], [0.4, 1.25, 50.2], 58],
      [1.5, [3.0, 1.6, 45.5], [1.1, 1.3, 49], 58],
      [3.0, [2.8, 1.5, 46.0], [1.1, 1.3, 49], 56],
    ],
  },
  postCamera: ({ camera, frame }) => {
    const shake = cameraShake(frame, SHAKE || { frame: -1 });
    camera.position.x += shake.x;
    camera.position.y += shake.y;
  },
});
