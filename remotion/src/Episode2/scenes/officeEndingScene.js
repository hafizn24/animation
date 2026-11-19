import * as THREE from 'three';
import { ManagerOfficeApp } from '../../../../environments/manager-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makeWhiteboardTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f7f6ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#2f6b46';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e5b39';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText('PERLAWANAN', canvas.width / 2, 120);
  ctx.fillText('AMAL', canvas.width / 2, 186);
  ctx.fillStyle = '#b9602c';
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillText('KUMPUL DANA BULUH FC', canvas.width / 2, 256);
  ctx.fillStyle = '#1e5b39';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('PELUANG TERAKHIR KITA', canvas.width / 2, 320);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

/** Scene 4 — club office, wall-mounted PERLAWANAN AMAL board, dramatic close. */
export const createOfficeEndingScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ManagerOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.5;
      if (light.isHemisphereLight) light.intensity = 0.36;
      if (light.isDirectionalLight && !light.castShadow) light.intensity = 0.3;
      if (light.isPointLight) light.intensity *= 0.85;
    });
  },
  extra: (scene) => {
    const board = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.66, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x2f6b46, roughness: 0.62 })
    );
    board.add(frame);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(2.62, 1.48),
      new THREE.MeshStandardMaterial({
        map: makeWhiteboardTexture(), roughness: 0.75,
        emissive: 0x1a2b1f, emissiveIntensity: 0.24,
      })
    );
    face.position.z = 0.05;
    board.add(face);
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.05, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1c3d2a, roughness: 0.6 })
    );
    tray.position.set(0, -0.86, 0.04);
    board.add(tray);
    board.position.set(0, 2.02, -5.05);
    scene.add(board);

    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: 0xb9602c, roughness: 0.6 })
    );
    marker.rotation.z = Math.PI / 2;
    marker.position.set(0.6, -0.86, 0.14);
    board.add(marker);

    return { board };
  },
  onFrame: ({ t, extra }) => {
    const reveal = smooth(clamp((t - 0.4) / 1.8, 0, 1));
    extra.board.rotation.y = lerp(-0.12, 0, reveal);
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.15, 0, 0.7],
      rotationY: 1.2,
      animate: ({ t, parts }) => {
        const resolve = smooth(clamp((t - 5.6) / 2.4, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.06 + 0.16 * resolve;
        if (parts.head) {
          parts.head.position.y = 1.95 + Math.sin(t * 1.6) * 0.012;
          const nod = Math.sin(t * 3) * 0.06 * resolve;
          parts.head.rotation.x = 0.02 + 0.12 * resolve + nod;
        }
        if (parts.rightArm) parts.rightArm.rotation.x = -0.1 - 0.4 * resolve;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - 0.08 * resolve;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [1.15, 0, -0.4],
      rotationY: -1.2,
      animate: ({ t, parts }) => {
        const talk = smooth(clamp((t - 0.8) / 0.6, 0, 1)) *
          (1 - smooth(clamp((t - 5.2) / 0.7, 0, 1)));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.05, -0.58, talk) + Math.sin(t * 5) * 0.12 * talk;
          parts.rightArm.rotation.z = lerp(0.32, 0.5, talk);
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.x = lerp(0.05, -0.22, talk);
          parts.leftArm.rotation.z = -0.32;
        }
        if (parts.head) {
          parts.head.position.y = 1.95 + Math.sin(t * 1.7) * 0.011;
          parts.head.rotation.y = 0.1 * (1 - talk);
          parts.head.rotation.x = Math.sin(t * 4) * 0.05 * talk;
        }
        if (parts.torso) parts.torso.rotation.x = 0.04 - 0.04 * talk;
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [3.0, 2.25, 6.0], [0, 1.35, 0.1], 76],
      [2.6, [2.4, 2.05, 5.0], [0, 1.35, 0.1], 72],
      [5.6, [1.2, 1.85, 3.9], [-0.4, 1.35, 0.5], 66],
      [8.0, [0.1, 1.72, 3.0], [-0.95, 1.35, 0.7], 60],
      [9.6, [-0.35, 1.62, 2.4], [-1.1, 1.35, 0.7], 54],
    ],
  },
});
