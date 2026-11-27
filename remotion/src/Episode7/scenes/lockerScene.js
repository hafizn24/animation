import { createStage, smooth } from '../../scene/stageKit.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { AzamApp } from '../../../../characters/character-azam.js';

/** Scene 3 — The Rumour. Global frames 457-749 (292 frames). */
export const createRumourLockerScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene),
  actors: [
    {
      name: 'rizal',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [-0.85, 0, -0.55],
      rotationY: 0.4,
      setup: (app) => app.setPlayerPrint('RIZAL', 10),
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.95, 0, -0.25],
      rotationY: -0.3,
    },
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;
    const e7_05From = 177; // local frame where Azam answers

    const rizal = actors.find((a) => a.name === 'rizal');
    if (rizal) {
      rizal.rig.position.y = Math.sin(t * 2.1) * 0.012;
      if (rizal.parts.head) {
        rizal.parts.head.rotation.y = frame < e7_05From - 22 ? Math.sin(t * 4.4) * 0.07 : 0;
      }
      if (rizal.parts.rightArm && frame < e7_05From - 22) {
        rizal.parts.rightArm.rotation.x = -0.1 - Math.sin(t * 3.2) * 0.12;
      }
    }

    const azam = actors.find((a) => a.name === 'azam');
    if (azam) {
      azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
      if (azam.parts.head && frame >= e7_05From) {
        azam.parts.head.rotation.y = Math.sin(t * 4.1) * 0.05;
      }
    }
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      [0, [3.6, 1.9, 4.4], [-0.8, 1.3, -0.6], 46],
      [5.5, [3.1, 1.8, 3.8], [-0.8, 1.3, -0.6], 44],
      [5.5, [2.4, 1.72, 3.3], [0.9, 1.3, -0.25], 42],
      [292 / 30, [2.0, 1.66, 2.9], [0.9, 1.3, -0.25], 40],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 10.7) * 0.014 * k;
  },
});
