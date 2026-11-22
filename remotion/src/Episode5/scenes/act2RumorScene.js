import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { applyLockerGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const localLine = (id) => ACT_2.lines.find((line) => line.id === id).startFrame - ACT_2.fromFrame;
const E5_07 = localLine('e5_07');
const E5_08 = localLine('e5_08');
const E5_09 = localLine('e5_09');

export const createAct2RumorScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene),
  onFrame: ({ frame, actors }) => {
    const t1 = actors.find((actor) => actor.name === 'teammate1');
    const t2 = actors.find((actor) => actor.name === 'teammate2');
    const coach = actors.find((actor) => actor.name === 'coach');
    const boss = actors.find((actor) => actor.name === 'boss');

    const hype = smooth(clamp(frame / 60, 0, 1));
    [t1, t2].forEach((teammate, index) => {
      if (!teammate) return;
      const bounce = Math.sin(frame * 0.11 + index * 1.4) * 0.02 * hype;
      teammate.rig.position.y = bounce;
      if (teammate.parts.rightArm) {
        teammate.parts.rightArm.rotation.x = lerp(-0.15, -1.05, hype) + Math.sin(frame * 0.13 + index) * 0.1 * hype;
        teammate.parts.rightArm.rotation.z = 0.32;
      }
      if (teammate.parts.leftArm) {
        teammate.parts.leftArm.rotation.x = -0.3 * hype;
        teammate.parts.leftArm.rotation.z = -0.32;
      }
      if (teammate.parts.head) teammate.parts.head.rotation.y = Math.sin(frame * 0.05 + index) * 0.07 * hype;
    });

    if (coach) {
      const suspect = smooth(clamp((frame - E5_08) / 36, 0, 1));
      if (coach.parts.head) {
        coach.parts.head.rotation.y = Math.sin(frame * 0.085) * 0.06 * suspect;
        coach.parts.head.rotation.x = -0.05 * suspect;
      }
      if (coach.parts.torso) coach.parts.torso.rotation.y = -0.04 * suspect;
      if (coach.parts.rightArm) coach.parts.rightArm.rotation.x = -0.12 - 0.18 * suspect;
    }

    if (boss) {
      // Kept three-quarter FRONT to the camera and squad for both lines —
      // never a back-of-head / lockers-only silhouette.
      const smile = smooth(clamp((frame - E5_08) / 30, 0, 1));
      const gesture = smooth(clamp((frame - E5_09) / 22, 0, 1));
      boss.rig.rotation.y = lerp(0.35, 0.28, smile);
      if (boss.parts.head) {
        boss.parts.head.rotation.y = 0.05 + 0.05 * smile;
        boss.parts.head.rotation.x = -0.04 * smile;
      }
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = lerp(-0.12, -1.0, gesture);
        boss.parts.rightArm.rotation.z = 0.3 + 0.1 * gesture;
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
      rotationY: 0.55,
    },
    {
      name: 'teammate2',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [0.0, -0.35, 0.9],
      rotationY: 0.2,
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.3, -0.35, -1.2],
      rotationY: 0.3,
    },
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.93,
      position: [3.0, 0, -1.9],
      rotationY: 0.35,
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [0.6, 2.65, 4.4], [-0.4, 1.35, 1.0], 74],
      [E5_07 / 30, [0.2, 2.5, 4.1], [-0.6, 1.35, 0.9], 70],
      [E5_08 / 30, [4.8, 2.3, 2.6], [3.0, 1.45, -1.9], 60],
      [E5_08 / 30 + 0.7, [-5.2, 2.2, 1.8], [-1.3, 1.45, -1.2], 56],
      [E5_09 / 30, [4.2, 2.2, 2.2], [3.0, 1.45, -1.9], 54],
      [ACT_2.durationFrames / 30, [3.6, 2.15, 2.0], [3.0, 1.45, -1.9], 52],
    ],
  },
});
