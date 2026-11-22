import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { applyLockerGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const localLine = (id, key = 'startFrame') =>
  ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const AZAM_ENTRY = localLine('e5_11');
const AZAM_END = localLine('e5_11', 'endFrame');
const E5_12 = localLine('e5_12');
const E5_13 = localLine('e5_13');
const E5_13_END = localLine('e5_13', 'endFrame');
const E5_14 = localLine('e5_14');
const E5_15 = localLine('e5_15');
const E5_16 = localLine('e5_16');
const E5_17 = localLine('e5_17');
const STUN_FROM = ACT_3.durationFrames - 8;

export const createAct3RevealScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene, 'reveal'),
  extra: (scene) => {
    const door = scene.getObjectByName('Door');
    const points = [];
    let coolFill = null;
    scene.traverse((obj) => {
      if (obj.isPointLight) points.push(obj);
      if (obj.isDirectionalLight && !obj.castShadow) coolFill = obj;
    });
    return { door, points, coolFill };
  },
  onFrame: ({ frame, actors, extra }) => {
    const burst = smooth(clamp(frame / 12, 0, 1));
    if (extra.door) extra.door.rotation.y = lerp(-0.55, -1.32, burst);
    if (extra.coolFill) extra.coolFill.intensity = lerp(0.14, 2.4, burst);
    extra.points.forEach((point) => {
      point.intensity = lerp(5, 14, burst);
    });

    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam) {
      const enter = smooth(clamp((frame - AZAM_ENTRY) / 56, 0, 1));
      azam.rig.position.z = lerp(5.5, 2.6, enter);
      azam.rig.position.x = lerp(0.1, 0, enter);

      if (frame >= AZAM_END && azam.app.currentPose === 'stride') azam.app.setPose('reveal');

      // Immediately after "Baru lawan gerun." ease into a relaxed idle:
      // arms lowered at the sides, subtle breathing and weight shift.
      // There is no flex/T-pose phase anywhere in the final exchange.
      if (frame >= E5_13_END) {
        const relax = smooth(clamp((frame - E5_13_END) / 14, 0, 1));
        if (azam.parts.leftArm) {
          azam.parts.leftArm.rotation.x = lerp(-0.22, 0.06, relax);
          azam.parts.leftArm.rotation.z = lerp(-0.34, -0.14, relax);
        }
        if (azam.parts.rightArm) {
          azam.parts.rightArm.rotation.x = lerp(-0.18, -0.04, relax);
          azam.parts.rightArm.rotation.z = lerp(0.36, 0.14, relax);
        }
        if (azam.parts.head) {
          azam.parts.head.rotation.y = lerp(-0.1, -0.04, relax);
          azam.parts.head.rotation.x = lerp(-0.07, 0, relax);
        }
        if (azam.parts.torso) {
          azam.parts.torso.rotation.x = lerp(-0.06, 0, relax);
          azam.parts.torso.rotation.z = Math.sin(frame * 0.06) * 0.012 * relax;
        }
        azam.rig.position.y = Math.sin(frame * 0.12) * 0.01 * relax;
      }
    }

    const confusion = smooth(clamp((frame - E5_12) / 22, 0, 1)) *
      (1 - smooth(clamp((frame - E5_13) / 18, 0, 1)));
    ['teammate1', 'teammate2'].forEach((name, index) => {
      const mate = actors.find((actor) => actor.name === name);
      if (!mate) return;
      if (mate.parts.head) {
        mate.parts.head.rotation.y = Math.sin(frame * 0.16 + index) * 0.12 * confusion;
        mate.parts.head.rotation.x = 0.08 * confusion;
      }
    });

    const coach = actors.find((actor) => actor.name === 'coach');
    if (coach) {
      const lean = smooth(clamp((frame - E5_14) / 36, 0, 1));
      const wide = smooth(clamp((frame - E5_15) / 12, 0, 1)) *
        (1 - smooth(clamp((frame - E5_16) / 16, 0, 1)));
      const stun = smooth(clamp((frame - STUN_FROM) / 6, 0, 1));
      if (coach.parts.torso) coach.parts.torso.rotation.x = 0.16 * lean + 0.08 * wide;
      if (coach.parts.head) {
        coach.parts.head.rotation.x = -0.06 * lean - 0.16 * wide - 0.1 * stun;
        coach.parts.head.rotation.y = Math.sin(frame * 0.05) * 0.03 * lean;
      }
      if (coach.parts.rightArm) coach.parts.rightArm.rotation.x = -0.2 - 0.45 * lean;
      if (coach.parts.leftArm) coach.parts.leftArm.rotation.z = -0.32 - 0.2 * lean;
    }

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      const holdUp = smooth(clamp((frame - E5_17) / 20, 0, 1));
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = lerp(-0.12, -1.5, holdUp);
        boss.parts.rightArm.rotation.z = 0.3 + 0.1 * holdUp;
      }
      if (boss.parts.head) {
        boss.parts.head.rotation.y = -0.02;
        boss.parts.head.rotation.x = 0;
      }
      if (boss.parts.torso) boss.parts.torso.rotation.x = -0.02 * holdUp;
    }
  },
  actors: [
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      pose: 'stride',
      hair: 'swept',
      scale: 0.95,
      position: [0.1, 0, 5.5],
      rotationY: Math.PI,
    },
    {
      name: 'teammate1',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [-2.4, -0.35, 1.6],
      rotationY: -2.5,
    },
    {
      name: 'teammate2',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [2.2, -0.35, 1.8],
      rotationY: -2.3,
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.0, -0.35, 0.2],
      rotationY: -2.6,
    },
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.93,
      position: [1.2, 0, 0.2],
      rotationY: -2.2,
    },
  ],
  camera: {
    fov: 62,
    ease: smooth,
    keys: [
      [0, [0, 0.9, -2.8], [0, 1.5, 4.6], 64],
      [0.5, [0.1, 0.95, -2.6], [0, 1.5, 4.2], 62],
      [AZAM_ENTRY / 30, [-0.3, 1.35, -2.6], [0, 1.45, 2.6], 56],
      [E5_12 / 30, [-4.2, 2.0, -2.2], [-2.8, 1.5, 0.8], 54],
      [E5_13 / 30, [0.1, 1.8, -2.6], [0, 1.45, 2.6], 52],
      [E5_14 / 30, [-2.7, 1.8, -2.7], [0.1, 1.45, 0.3], 50],
      [E5_15 / 30, [-2.4, 1.75, -2.5], [-0.4, 1.45, 0.25], 46],
      [E5_16 / 30, [-2.0, 1.75, -2.5], [0.6, 1.45, 0.25], 46],
      [E5_17 / 30, [-2.2, 1.7, -2.3], [0.2, 1.45, 0.25], 44],
      [ACT_3.durationFrames / 30, [-2.6, 1.7, -2.3], [-0.2, 1.45, 0.25], 42],
    ],
  },
});
