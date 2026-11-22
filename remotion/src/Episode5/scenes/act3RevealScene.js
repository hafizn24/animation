import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { applyLockerGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';

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
    const burst = smooth(clamp(frame / 14, 0, 1));
    if (extra.door) extra.door.rotation.y = lerp(-0.55, -1.32, burst);
    if (extra.coolFill) extra.coolFill.intensity = lerp(0.14, 2.4, burst);
    extra.points.forEach((point) => {
      point.intensity = lerp(5, 14, burst);
    });

    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam) {
      const enter = smooth(clamp(frame / 72, 0, 1));
      azam.rig.position.z = lerp(5.5, 2.6, enter);
      azam.rig.position.x = lerp(0.1, 0, enter);
      azam.rig.position.y = Math.sin((frame / 30) * 2.3) * 0.012 * (1 - enter * 0.5);

      if (frame < 60 && azam.app.currentPose !== 'stride') azam.app.setPose('stride');
      if (frame >= 60 && frame < 300 && azam.app.currentPose !== 'reveal') azam.app.setPose('reveal');
      if (frame >= 300 && frame < 375 && azam.app.currentPose !== 'point') azam.app.setPose('point');
      if (frame >= 375 && azam.app.currentPose !== 'flex') azam.app.setPose('flex');

      const first = smooth(clamp((frame - 15) / 14, 0, 1)) * (1 - smooth(clamp((frame - 55) / 20, 0, 1)));
      if (azam.parts.rightArm && azam.app.currentPose !== 'flex') {
        azam.parts.rightArm.rotation.x -= first * 1.35;
        azam.parts.rightArm.rotation.z += first * 0.12;
      }
      if (azam.parts.head && azam.app.currentPose === 'reveal') {
        azam.parts.head.rotation.y = -0.1 + Math.sin(frame * 0.06) * 0.05;
      }
    }

    const confusion = smooth(clamp((frame - 180) / 30, 0, 1)) * (1 - smooth(clamp((frame - 300) / 30, 0, 1)));
    ['teammate1', 'teammate2'].forEach((name, index) => {
      const mate = actors.find((actor) => actor.name === name);
      if (!mate) return;
      if (mate.parts.head) {
        mate.parts.head.rotation.y = Math.sin(frame * 0.16 + index) * 0.13 * confusion;
        mate.parts.head.rotation.x = 0.08 * confusion;
      }
      if (mate.parts.torso) mate.parts.torso.rotation.y = Math.sin(frame * 0.1 + index) * 0.05 * confusion;
    });

    const coach = actors.find((actor) => actor.name === 'coach');
    if (coach) {
      const lean = smooth(clamp((frame - 375) / 45, 0, 1));
      const wide = smooth(clamp((frame - 594) / 18, 0, 1)) * (1 - smooth(clamp((frame - 660) / 24, 0, 1)));
      const stun = smooth(clamp((frame - 799) / 8, 0, 1));
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
      const holdUp = smooth(clamp((frame - 672) / 26, 0, 1));
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = lerp(-0.12, -1.5, holdUp);
        boss.parts.rightArm.rotation.z = 0.34 + 0.1 * holdUp;
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
      rotationY: 3.05,
    },
    {
      name: 'teammate2',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [2.2, -0.35, 1.8],
      rotationY: 3.1,
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-1.0, -0.35, 0.2],
      rotationY: 3.0,
    },
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.93,
      position: [1.2, 0, 0.2],
      rotationY: 3.15,
    },
  ],
  camera: {
    fov: 62,
    ease: smooth,
    keys: [
      [0, [0, 0.9, -2.8], [0, 1.5, 4.6], 64],
      [0.5, [0.1, 0.95, -2.6], [0, 1.5, 4.2], 62],
      [5.0, [-0.3, 1.35, -2.6], [0, 1.45, 2.6], 56],
      [6.0, [-4.2, 2.0, -2.2], [-2.8, 1.5, 0.8], 54],
      [10.0, [0.1, 1.8, -2.6], [0, 1.45, 2.6], 52],
      [12.5, [0.1, 1.85, -3.4], [0.1, 1.45, 0.3], 50],
      [16.0, [-1.0, 1.8, -2.7], [-1.0, 1.45, 0.2], 46],
      [17.5, [1.2, 1.8, -2.7], [1.2, 1.45, 0.2], 46],
      [19.0, [-1.0, 1.78, -2.6], [-1.0, 1.45, 0.2], 44],
      [20.5, [1.2, 1.78, -2.6], [1.2, 1.45, 0.2], 44],
      [22.4, [1.2, 1.76, -2.55], [1.2, 1.45, 0.2], 44],
      [27.0, [-1.0, 1.76, -2.5], [-1.0, 1.45, 0.2], 42],
    ],
  },
});
