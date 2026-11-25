import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { IskandarApp, ManafApp } from '../../../../characters/character-squad.js';
import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { clamp, createSceneDirector, lerp, smooth } from '../../Episode1/sceneKit.js';
import { shotKey } from '../../shared/cameraKit.js';

const KEYS = [
  shotKey({ position: [0.1, 1.6, 9.6], lookAt: [0, 1.3, -0.6], fov: 40 }, 0),
  shotKey({ position: [0.0, 1.56, 9.2], lookAt: [-0.2, 1.3, -0.8], fov: 40 }, 7),
  shotKey({ position: [0.2, 1.55, 9.0], lookAt: [-0.2, 1.3, -0.9], fov: 40 }, 15),
];

export const createSquadScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: LockerRoomApp,
  camera: { keys: KEYS, fov: 40 },
  minSeparation: 0.95,
  onFrame: ({ frame, actors }) => {
    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam) {
      if (frame > 110 && azam.app.setPose) azam.app.setPose('point');
      if (azam.parts.rightArm) azam.parts.rightArm.rotation.x = lerp(-0.1, -1.2, smooth(clamp((frame - 110) / 26, 0, 1)));
      if (azam.parts.root) azam.parts.root.position.y = Math.sin(frame * 0.1) * 0.014;
    }
    const iskandar = actors.find((actor) => actor.name === 'iskandar');
    if (iskandar?.parts?.head) iskandar.parts.head.rotation.y = Math.sin(frame * 0.04) * 0.07;
    const manaf = actors.find((actor) => actor.name === 'manaf');
    if (manaf?.parts?.leftArm) {
      manaf.parts.leftArm.rotation.z = -0.5 + Math.sin(frame * 0.22) * 0.28;
    }
    const jurulatih = actors.find((actor) => actor.name === 'jurulatih');
    if (jurulatih?.parts?.rightArm) {
      jurulatih.parts.rightArm.rotation.x = -0.25 + Math.sin(frame * 0.08) * 0.08;
    }
  },
  actors: [
    { name: 'azam', Class: AzamApp, position: [-0.9, 0, -2.1], rotationY: 0.15, scale: 1 },
    { name: 'iskandar', Class: IskandarApp, position: [-0.1, 0, 0.2], rotationY: 0.05, scale: 1 },
    { name: 'manaf', Class: ManafApp, position: [0.6, 0, 0.2], rotationY: -0.1, scale: 0.98 },
    { name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach', position: [0.8, 0, -2.1], rotationY: -0.22, scale: 0.96 },
    { name: 'boss', Class: NewOwnerApp, outfit: 'charcoalOwner', position: [-1.35, 0, 0.2], rotationY: 0.25, scale: 0.96 },
  ],
});
