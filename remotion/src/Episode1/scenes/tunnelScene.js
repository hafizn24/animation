import { PlayersTunnelApp } from '../../../../environments/players-tunnel.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';

export const createTunnelScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: PlayersTunnelApp,
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'walkA',
      scale: 0.92,
      position: [0, 0, -6],
      rotationY: 0,
      animate: ({ t, rig, parts }) => {
        const move = smooth(clamp(t / 7.5, 0, 1));
        rig.position.z = lerp(-6, 8.5, move);

        const fade = 1 - smooth(clamp((t - 6.8) / 1.2, 0, 1));
        const phase = t * 7.4;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * fade;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * fade;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.42 * fade;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.42 * fade;
        if (parts.head) parts.head.rotation.x = -0.12 * smooth(clamp((t - 4) / 3, 0, 1));
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [0.9, 1.5, -8.5], [0, 1.5, -4], 74],
      [3, [0.6, 1.45, -5.5], [0, 1.5, 0], 72],
      [6, [0.3, 1.5, -1.5], [0, 1.6, 6], 70],
      [8, [0, 1.7, 2.0], [0, 1.8, 11], 68],
    ],
  },
});
