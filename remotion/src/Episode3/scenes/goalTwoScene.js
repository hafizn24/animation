import { StadiumApp } from '../../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { getScene, localEvent } from '../timings.js';
import {
  addBakeryAdBoard,
  applyGoldenHour,
  clamp,
  createBallWithTrail,
  createNetRipple,
  createSceneDirector,
  kickSwing,
  lerp,
  smooth,
} from '../sceneKit.js';

const SCENE = getScene('goal-2-teamwork');
const GOAL = localEvent(SCENE, 'goal');

/**
 * Goal 2 — four snappy cuts: 1–2 pass, split defenders, close-range finish,
 * net ripple. Timing comes from the scene's cut/goal events in the JSON.
 */
export const createGoalTwoScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: 10, z: -53 });
  },
  extra: (scene) => {
    const ballRig = createBallWithTrail(scene, { trailLength: 9 });
    const ripple = createNetRipple(scene, { x: 0.6, z: 50.2 });
    return { ...ballRig, ripple };
  },
  onFrame: ({ frame, extra }) => {
    const pathAt = (at) => {
      const f = clamp(at, 0, 260);
      if (f < 30) {
        const k = smooth(clamp(f / 30, 0, 1));
        return { x: lerp(2.2, 4.4, k), y: 0.24, z: lerp(27.5, 30.5, k) };
      }
      if (f < 90) {
        const k = smooth(clamp((f - 30) / 60, 0, 1));
        return { x: lerp(4.4, 6.2, k), y: 0.24 + Math.sin(k * Math.PI) * 0.45, z: lerp(30.5, 36.5, k) };
      }
      if (f < 150) {
        const k = smooth(clamp((f - 90) / 60, 0, 1));
        return { x: lerp(6.2, 1.6, k), y: 0.24 + Math.sin(k * Math.PI) * 0.25, z: lerp(36.5, 43.5, k) };
      }
      const k = smooth(clamp((f - 150) / 56, 0, 1));
      return { x: lerp(1.6, 0.6, k), y: 0.24 + Math.sin(k * Math.PI) * 0.9, z: lerp(43.5, 50.3, k) };
    };
    extra.update(pathAt, frame, true);
    extra.ripple.update(frame, GOAL.frame - 3);
  },
  actors: [
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.78,
      position: [2.2, 0, 26.5],
      rotationY: 0.3,
      animate: ({ frame, rig, parts }) => {
        const pass = smooth(clamp((frame - 18) / 18, 0, 1));
        rig.rotation.y = lerp(0.3, 0.75, pass);
        if (parts.rightLeg) parts.rightLeg.rotation.x = -0.7 * Math.sin(pass * Math.PI);
        if (parts.leftArm) parts.leftArm.rotation.z = -0.42 - pass * 0.25;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.82,
      position: [6.2, 0, 35.5],
      rotationY: 0.18,
      animate: ({ frame, rig, parts }) => {
        const run = smooth(clamp((frame - 90) / 60, 0, 1));
        rig.position.x = lerp(6.2, 1.6, run);
        rig.position.z = lerp(35.5, 43.6, run);
        const phase = frame * 0.62;
        const stride = Math.max(0.55, run);
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.55 * stride;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.55 * stride;
        if (parts.torso) parts.torso.rotation.x = 0.16 * stride;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.4 * stride;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.4 * stride;
        const kick = kickSwing(frame, 152, { windup: 14, follow: 18 });
        if (frame >= 138) {
          if (parts.rightLeg) parts.rightLeg.rotation.x = kick.leg;
          if (parts.leftLeg) parts.leftLeg.rotation.x = kick.plant;
          if (parts.rightArm) parts.rightArm.rotation.x = kick.arm;
          if (parts.torso) parts.torso.rotation.x = 0.16 * (1 - smooth(clamp((frame - 138) / 14, 0, 1))) + kick.torso * 0.6;
          rig.rotation.y = kick.torso * 0.7;
        }
      },
    },
    ...[[2.6, 33], [8.6, 36.5]].map(([x, z], i) => ({
      Class: SoccerOutfitApp,
      outfit: 'hulubalangBlackOrange',
      scale: 0.78,
      position: [x, 0, z],
      rotationY: Math.PI - 0.3,
      animate: ({ frame, rig, parts }) => {
        const phase = frame * 0.58 + i * 1.7;
        const track = smooth(clamp((frame - 24 - i * 6) / 26, 0, 1));
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * track;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * track;
        if (parts.torso) parts.torso.rotation.x = 0.14 * track;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.32 * track;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.32 * track;
        if (parts.head) parts.head.rotation.y = Math.sin(frame * 0.12 + i) * 0.35;
        rig.position.x = x + Math.sin(phase) * 0.18 * track;
      },
    })),
    {
      Class: SoccerOutfitApp,
      outfit: 'hulubalangKeeper',
      scale: 0.8,
      position: [0.8, 0, 49.1],
      rotationY: Math.PI,
      animate: ({ frame, rig, parts }) => {
        const dive = smooth(clamp((frame - 186) / 20, 0, 1));
        rig.rotation.z = 0.5 * dive;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.3 - dive;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.3 + dive * 0.6;
      },
    },
  ],
  camera: {
    fov: 76,
    ease: smooth,
    keys: [
      [0, [17, 6.5, 19], [3, 1, 28], 76],
      [0.96, [15, 5.5, 21], [3, 1, 30], 72],
      [1.0, [12.0, 2.6, 32.5], [7.0, 1.2, 35.3], 68],
      [3.0, [11.4, 2.4, 33.2], [7.0, 1.2, 36.0], 66],
      [3.03, [12, 3.4, 35], [2, 1, 44], 64],
      [5.0, [10, 3.0, 37], [1.5, 1.1, 45], 62],
      [5.03, [5, 1.7, 42.5], [1, 1.2, 49], 60],
      [6.8, [4.4, 1.6, 43.5], [0.8, 1.2, 50], 58],
      [6.83, [9, 2.6, 45], [0.5, 1.2, 50], 58],
      [9.0, [8.4, 2.5, 45.5], [0.5, 1.2, 50], 56],
    ],
  },
});
