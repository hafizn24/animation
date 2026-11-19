import * as THREE from 'three';
import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { SponsorApp } from '../../../../characters/character-sponsor.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makeFolderTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e9e3d3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#9a8f74';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = '#1f2a44';
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillText('SPONSORSHIP', canvas.width / 2, 158);
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.fillText('BULUH FC', canvas.width / 2, 214);
  ctx.textAlign = 'left';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillStyle = '#5b5b5b';
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(72, 290 + i * 44, i % 2 ? 318 : 368, 12);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

export const createSponsorPitchScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.5;
      if (light.isDirectionalLight && !light.castShadow) light.intensity = 0.3;
      if (light.isPointLight) light.intensity *= 0.72;
    });
  },
  extra: (scene) => {
    const folder = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 1.12),
      new THREE.MeshStandardMaterial({
        map: makeFolderTexture(),
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    );
    folder.rotation.x = -Math.PI / 2 + 0.3;
    folder.rotation.z = -0.12;
    folder.position.set(-1.0, 0.84, -0.55);
    scene.add(folder);
    return { folder };
  },
  onFrame: ({ t, extra }) => {
    const slide = smooth(clamp((t - 3) / 3, 0, 1));
    extra.folder.position.x = lerp(-1.0, 0.45, slide);
    extra.folder.position.z = lerp(-0.55, -0.85, slide);
    extra.folder.position.y = 0.84 + Math.sin(slide * Math.PI) * 0.05;
  },
  actors: [
    {
      Class: SponsorApp,
      outfit: 'corporateNavy',
      pose: 'idle',
      scale: 0.95,
      position: [0.6, 0, -1.2],
      rotationY: -0.1,
      animate: ({ t, parts }) => {
        const leanBack = smooth(clamp((t - 5.5) / 2.5, 0, 1));
        if (parts.torso) parts.torso.rotation.x = -0.13 * leanBack;
        if (parts.head) parts.head.rotation.x = -0.08 * leanBack;

        const dismiss = smooth(clamp((t - 7) / 1.5, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.x = lerp(0.05, -0.95, dismiss);
        if (parts.rightArm) parts.rightArm.rotation.z = lerp(0.32, 0.05, dismiss);
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.2, 0, 1.7],
      rotationY: 0.25,
      animate: ({ t, parts }) => {
        const hope = smooth(clamp((t - 1.5) / 3, 0, 1)) * (1 - smooth(clamp((t - 7) / 1.5, 0, 1)));
        const drop = smooth(clamp((t - 7) / 2, 0, 1));
        if (parts.torso) parts.torso.rotation.x = lerp(0.18 * hope, 0.02, drop);
        if (parts.head) parts.head.rotation.x = 0.12 * hope - 0.22 * drop;
        if (parts.head) parts.head.rotation.z = 0.09 * hope;
        if (parts.leftArm) parts.leftArm.rotation.x = 0.12 * drop;
        if (parts.rightArm) parts.rightArm.rotation.x = 0.12 * drop;
      },
    },
  ],
  camera: {
    fov: 76,
    ease: smooth,
    keys: [
      [0, [3.0, 2.1, 5.4], [0, 1.25, -0.8], 76],
      [5, [2.3, 1.9, 4.3], [0, 1.25, -0.8], 72],
      [10, [1.6, 1.7, 3.2], [0, 1.25, -0.8], 68],
    ],
  },
});
