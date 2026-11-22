import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { applyLockerGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';

export const createAct2RumorScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene),
  onFrame: ({ frame, actors }) => {
    const t1 = actors.find((actor) => actor.name === 'teammate1');
    const t2 = actors.find((actor) => actor.name === 'teammate2');
    const coach = actors.find((actor) => actor.name === 'coach');
    const boss = actors.find((actor) => actor.name === 'boss');

    const hype = smooth(clamp(frame / 90, 0, 1));
    [t1, t2].forEach((teammate, index) => {
      if (!teammate) return;
      const bounce = Math.sin(frame * 0.11 + index * 1.4) * 0.02 * hype;
      teammate.rig.position.y = bounce;
      if (teammate.parts.rightArm) {
        teammate.parts.rightArm.rotation.x = lerp(-0.15, -1.15, hype) + Math.sin(frame * 0.13 + index) * 0.12 * hype;
        teammate.parts.rightArm.rotation.z = 0.36;
      }
      if (teammate.parts.leftArm) {
        teammate.parts.leftArm.rotation.x = -0.35 * hype;
        teammate.parts.leftArm.rotation.z = -0.34;
      }
      if (teammate.parts.head) teammate.parts.head.rotation.y = Math.sin(frame * 0.05 + index) * 0.08 * hype;
    });

    if (coach) {
      const suspect = smooth(clamp((frame - 351) / 50, 0, 1));
      if (coach.parts.head) {
        coach.parts.head.rotation.y = Math.sin(frame * 0.085) * 0.07 * suspect;
        coach.parts.head.rotation.x = -0.05 * suspect;
      }
      if (coach.parts.torso) coach.parts.torso.rotation.y = -0.05 * suspect;
      if (coach.parts.rightArm) coach.parts.rightArm.rotation.x = -0.12 - 0.18 * suspect;
    }

    if (boss) {
      const smile = smooth(clamp((frame - 351) / 40, 0, 1));
      const gesture = smooth(clamp((frame - 351) / 30, 0, 1));
      if (boss.parts.head) {
        boss.parts.head.rotation.y = -0.05 + 0.07 * smile;
        boss.parts.head.rotation.x = -0.04 * smile;
      }
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = lerp(-0.12, -1.0, gesture);
        boss.parts.rightArm.rotation.z = 0.34 + 0.12 * gesture;
      }
      if (boss.parts.torso) boss.parts.torso.rotation.x = -0.03 * smile;
    }
  },
  actors: [
    {
      name: 'teammate1',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [-2.8, -0.35, 0.8],
      rotationY: 3.05,
    },
    {
      name: 'teammate2',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [0.0, -0.35, 0.9],
      rotationY: 2.85,
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.3, -0.35, -1.2],
      rotationY: 2.7,
    },
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.93,
      position: [3.0, 0, -1.9],
      rotationY: 3.25,
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [0.6, 2.65, 4.4], [-0.4, 1.35, 1.0], 74],
      [8.0, [0.2, 2.5, 4.1], [-0.6, 1.35, 0.9], 70],
      [11.3, [2.4, 2.35, 3.9], [3.0, 1.45, -1.9], 60],
      [13.1, [0.4, 2.2, 3.6], [-1.3, 1.45, -1.2], 56],
      [16.0, [1.8, 2.15, 3.5], [3.0, 1.45, -1.9], 54],
    ],
  },
});
