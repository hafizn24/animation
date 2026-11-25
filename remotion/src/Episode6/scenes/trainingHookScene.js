import { AzamApp } from '../../../../characters/character-azam.js';
import { ManafApp } from '../../../../characters/character-squad.js';
import { StadiumApp } from '../../../../environments/stadium.js';
import { clamp, createSceneDirector, lerp, smooth } from '../../Episode1/sceneKit.js';
import { shotKey } from '../../shared/cameraKit.js';

const KEYS = [
  shotKey({ position: [0.2, 1.55, 6.6], lookAt: [0, 1.3, 0], fov: 40 }, 0),
  shotKey({ position: [0.9, 1.55, 6.2], lookAt: [0.1, 1.3, 0], fov: 40 }, 1.4),
];

export const createTrainingHookScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  camera: { keys: KEYS, fov: 40 },
  minSeparation: 0.95,
  onFrame: ({ frame, actors }) => {
    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam) {
      const block = 0.35 + smooth(clamp(frame / 18, 0, 1)) * 0.55;
      if (azam.parts.leftArm) azam.parts.leftArm.rotation.x = -block;
      if (azam.parts.rightArm) azam.parts.rightArm.rotation.x = -block * 0.8;
      if (azam.parts.root) azam.parts.root.position.y = Math.sin(frame * 0.16) * 0.018;
      if (azam.parts.head) azam.parts.head.rotation.y = Math.sin(frame * 0.05) * 0.05;
    }
    const manaf = actors.find((actor) => actor.name === 'manaf');
    if (manaf?.parts?.leftArm) manaf.parts.leftArm.rotation.z = -0.6;
  },
  actors: [
    { name: 'azam', Class: AzamApp, position: [-0.7, 0, 0], rotationY: 0.18, scale: 1 },
    { name: 'manaf', Class: ManafApp, position: [0.9, 0, -0.9], rotationY: -0.2, scale: 0.98 },
  ],
});
