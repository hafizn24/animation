import { AzamApp } from '../../../../characters/character-azam.js';
import { ManafApp } from '../../../../characters/character-squad.js';
import { StadiumApp } from '../../../../environments/stadium.js';
import { clamp, createSceneDirector, lerp, smooth } from '../../Episode1/sceneKit.js';
import { shotKey } from '../../shared/cameraKit.js';

const KEYS = [
  shotKey({ position: [-1.0, 1.6, 6.6], lookAt: [0.2, 1.3, -0.4], fov: 40 }, 0),
  shotKey({ position: [-0.4, 1.55, 6.2], lookAt: [0.6, 1.3, -0.6], fov: 40 }, 3.8),
];

export const createTrainingCutScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  camera: { keys: KEYS, fov: 40 },
  minSeparation: 0.95,
  onFrame: ({ frame, actors }) => {
    const manaf = actors.find((actor) => actor.name === 'manaf');
    if (manaf) {
      const wave = Math.sin(frame * 0.32) * 0.55;
      if (manaf.parts.leftArm) {
        manaf.parts.leftArm.rotation.z = -1.1 + wave * 0.25;
        manaf.parts.leftArm.rotation.x = -0.2 + wave;
      }
      if (manaf.parts.rightArm) manaf.parts.rightArm.rotation.z = 0.9;
      if (manaf.parts.head) manaf.parts.head.rotation.y = -0.12 + wave * 0.08;
      if (manaf.parts.root) manaf.parts.root.position.y = Math.abs(wave) * 0.02;
    }
    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam?.parts?.leftArm) {
      azam.parts.leftArm.rotation.x = lerp(-0.7, -1.0, smooth(clamp(frame / 80, 0, 1)));
    }
  },
  actors: [
    { name: 'manaf', Class: ManafApp, position: [0.7, 0, -0.8], rotationY: -0.25, scale: 1 },
    { name: 'azam', Class: AzamApp, position: [-0.9, 0, 0.4], rotationY: 0.2, scale: 1 },
  ],
});
