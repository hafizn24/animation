import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

export const createStadiumSetupScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.9;
      if (light.isHemisphereLight) light.intensity = 0.6;
      if (light.isDirectionalLight) light.intensity = 1.0;
    });
  },
  extra: (scene) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d2a5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('FRIENDLY MATCH', canvas.width / 2, 56);
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('BULUH FC vs GUEST', canvas.width / 2, 100);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.5, 0.12),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    banner.position.set(12, -2, -5.5);
    scene.add(banner);
    return { banner };
  },
  onFrame: ({ t, extra }) => {
    const rise = smooth(clamp((t - 2) / 3, 0, 1));
    extra.banner.position.y = lerp(-2, 3.8, rise);
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.64,
      position: [12, 0, -2],
      animate: ({ t, parts }) => {
        const gesture = smooth(clamp((t - 1) / 2.5, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.x = -0.9 * gesture;
        if (parts.leftArm) parts.leftArm.rotation.x = -0.35 * gesture;
        if (parts.head) parts.head.rotation.y = -0.2 * gesture;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.64,
      position: [14, 0, -1],
      animate: ({ t, parts }) => {
        if (parts.rightArm) parts.rightArm.rotation.x = -0.45 - Math.sin(t * 1.6) * 0.1;
        if (parts.head) parts.head.rotation.y = 0.15;
      },
    },
    {
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.64,
      position: [10, 0, 2],
      animate: ({ t, parts }) => {
        const phase = t * 3.2;
        if (parts.leftArm) parts.leftArm.rotation.x = -Math.sin(phase) * 0.9;
        if (parts.rightArm) parts.rightArm.rotation.x = Math.sin(phase) * 0.9;
        if (parts.leftLeg) parts.leftLeg.rotation.x = Math.max(0, Math.sin(phase)) * 0.8;
        if (parts.rightLeg) parts.rightLeg.rotation.x = Math.max(0, -Math.sin(phase)) * 0.8;
      },
    },
  ],
  camera: {
    fov: 78,
    ease: smooth,
    keys: [
      [0, [24, 4.5, 16], [12, 1.4, -2], 78],
      [8.33, [15, 2.6, 6], [12, 1.4, -2], 70],
    ],
  },
});
