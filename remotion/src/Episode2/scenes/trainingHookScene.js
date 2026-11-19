import * as THREE from 'three';
import { PlayersTunnelApp } from '../../../../environments/players-tunnel.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createTrainingHookScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: PlayersTunnelApp,
  grade: (scene) => {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#5b8fd6');
    grad.addColorStop(0.55, '#bcd9f2');
    grad.addColorStop(1, '#fff2d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 1.1;
      if (light.isHemisphereLight) light.intensity = 0.8;
      if (light.isDirectionalLight) light.intensity = 1.3;
    });
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.92,
      position: [0, 0, -1.5],
      rotationY: 0,
      animate: ({ t, rig, parts }) => {
        const address = smooth(clamp((t - 0.8) / 1, 0, 1)) * (1 - smooth(clamp((t - 2.8) / 0.7, 0, 1)));
        if (parts.leftArm) parts.leftArm.rotation.x = -0.9 * address;
        if (parts.rightArm) parts.rightArm.rotation.x = -0.9 * address;

        const turn = smooth(clamp((t - 3.2) / 0.8, 0, 1));
        const stride = smooth(clamp((t - 3.2) / 2.6, 0, 1));
        rig.position.z = lerp(-1.5, 5, stride);
        rig.rotation.y = turn * Math.PI;

        const fade = 1 - smooth(clamp((t - 6.0) / 0.33, 0, 1));
        const phase = t * 7;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * turn * fade;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * turn * fade;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.42 * turn * fade;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.42 * turn * fade;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [-1.2, 0, -7],
      rotationY: 0,
      animate: ({ t, rig, parts }) => {
        const follow = smooth(clamp((t - 4) / 2.33, 0, 1));
        rig.position.z = lerp(-7, 0.5, follow);
        const phase = t * 6.5;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * follow;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * follow;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.42 * follow;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.42 * follow;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.92,
      position: [1.2, 0, -7],
      rotationY: 0,
      animate: ({ t, rig, parts }) => {
        const follow = smooth(clamp((t - 4.2) / 2.13, 0, 1));
        rig.position.z = lerp(-7, 0.8, follow);
        const phase = t * 6.5 + 1.2;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(phase) * 0.5 * follow;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(phase) * 0.5 * follow;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.42 * follow;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.42 * follow;
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [-1.2, 1.7, -5.2], [0, 1.5, 1], 74],
      [3.5, [-1.0, 1.7, -4.8], [0, 1.5, 2], 70],
      [6.33, [-1.0, 1.8, 1.0], [0, 1.5, 7], 66],
    ],
  },
});
