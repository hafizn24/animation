import * as THREE from 'three';
import { ManagerOfficeApp } from '../../../../environments/manager-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { AnotherCasualOutfitApp } from '../../../../characters/character-casual.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makeBakerySign = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff4dc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#c8702f';
  ctx.lineWidth = 14;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a3f19';
  ctx.font = 'bold 84px Arial, sans-serif';
  ctx.fillText('KEK MAJU', canvas.width / 2, 132);
  ctx.fillStyle = '#c8702f';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('KEDAI KECIL · SOKONGAN BESAR', canvas.width / 2, 206);
  ctx.fillStyle = '#7a3f19';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('Sokong Buluh FC', canvas.width / 2, 268);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

export const createBakerySponsorScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ManagerOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.9;
      if (light.isHemisphereLight) light.intensity = 0.65;
      if (light.isDirectionalLight) light.intensity = 0.95;
      if (light.isPointLight) light.intensity *= 1.15;
    });
  },
  extra: (scene) => {
    const sign = new THREE.Group();

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.07, 1.28, 12),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 })
    );
    post.position.y = 0.64;
    sign.add(post);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.92, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeBakerySign(),
        roughness: 0.7,
        emissive: 0x3a230e,
        emissiveIntensity: 0.25,
      })
    );
    board.position.y = 1.74;
    sign.add(board);

    sign.position.set(-0.7, 0, -1.9);
    sign.rotation.y = -0.14;
    scene.add(sign);

    const cakeBox = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.12, 0.36),
      new THREE.MeshStandardMaterial({ color: 0xf3e3c4, roughness: 0.85 })
    );
    cakeBox.add(base);
    for (let i = 0; i < 3; i++) {
      const cake = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.07, 14),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd98650 : 0xf0b26b, roughness: 0.75 })
      );
      cake.position.set(-0.13 + i * 0.13, 0.095, 0);
      cakeBox.add(cake);
    }
    cakeBox.position.set(0.15, 0.86, 1.45);
    scene.add(cakeBox);

    return { sign, cakeBox };
  },
  onFrame: ({ t, extra }) => {
    const reveal = smooth(clamp((t - 0.6) / 2.2, 0, 1));
    extra.sign.rotation.y = lerp(-0.34, -0.14, reveal);
    extra.cakeBox.position.y = 0.86 + Math.sin(clamp((t - 4) / 3, 0, 1) * Math.PI) * 0.03;
  },
  actors: [
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'beigeSweater',
      scale: 0.95,
      position: [1.3, 0, -0.9],
      rotationY: -0.28,
      animate: ({ t, parts }) => {
        const offer = smooth(clamp((t - 2.5) / 2, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.05, -1.05, offer);
          parts.rightArm.rotation.z = lerp(0.32, 0.12, offer);
        }
        if (parts.head) parts.head.rotation.x = lerp(0, -0.1, offer);
        if (parts.torso) parts.torso.rotation.x = lerp(0, 0.08, offer);
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.0, 0, 1.4],
      rotationY: 0.12,
      animate: ({ t, parts }) => {
        const lift = smooth(clamp((t - 4.5) / 2.5, 0, 1));
        if (parts.torso) parts.torso.rotation.x = lerp(0.04, 0.18, lift);
        if (parts.head) parts.head.rotation.x = lerp(0, 0.12, lift);
        if (parts.rightArm) parts.rightArm.rotation.x = lerp(0.05, -0.7, lift);
        if (parts.leftArm) parts.leftArm.rotation.x = lerp(0.05, -0.35, lift);
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [2.4, 2.0, 4.4], [0.3, 1.4, 0.2], 74],
      [5.9, [2.05, 1.87, 3.85], [0.25, 1.4, -0.08], 70],
      [6.0, [1.05, 1.2, 2.45], [0.15, 0.92, 1.4], 56],
      [6.8, [1.05, 1.2, 2.45], [0.15, 0.92, 1.4], 56],
      [6.9, [2.0, 1.85, 3.8], [0.25, 1.4, -0.1], 70],
      [14, [1.6, 1.75, 3.3], [0.2, 1.4, -0.3], 66],
    ],
  },
});
