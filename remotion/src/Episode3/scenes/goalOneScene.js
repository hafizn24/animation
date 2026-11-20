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
        const kick = kickSwing(frame, 6, { windup: 8, follow: 16 });
        rig.rotation.y = kick.torso;
        if (parts.rightLeg) parts.rightLeg.rotation.x = kick.leg;
        if (parts.leftLeg) parts.leftLeg.rotation.x = kick.plant;
        if (parts.rightArm) parts.rightArm.rotation.x = kick.arm;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.5 - kick.arm * 0.5;
        if (parts.head) parts.head.rotation.x = 0.12 * smooth(clamp(frame / 18, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.08 * smooth(clamp(frame / 18, 0, 1));
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangKeeper',
      scale: 0.82,
      position: [1.1, 0, 48.9],
      rotationY: Math.PI,
      animate: ({ frame, rig, parts }) => {
        const dive = smooth(clamp((frame - 6) / 18, 0, 1));
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
      [0, [6.4, 0.72, 43.4], [2.0, 1.25, 41.0], 76],
      [0.45, [6.0, 0.7, 43.8], [2.0, 1.3, 41.2], 72],
      [1.5, [5.6, 0.7, 44.2], [1.9, 1.35, 41.6], 68],
      [1.53, [3.4, 0.95, 45.4], [1.1, 1.35, 49.6], 64],
      [2.4, [3.2, 0.95, 46.0], [1.1, 1.4, 50.0], 60],
      [3.0, [3.0, 0.95, 46.2], [1.1, 1.45, 50.2], 58],
    ],
  },
  postCamera: ({ camera, frame }) => {
    const shake = cameraShake(frame, SHAKE || { frame: -1 });
    camera.position.x += shake.x;
    camera.position.y += shake.y;
  },
});
