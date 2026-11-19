import * as THREE from 'three';
import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { SponsorApp } from '../../../../characters/character-sponsor.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makeApexLogo = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1c1c20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#8e1f2b';
  ctx.fillRect(0, 0, 26, canvas.height);
  ctx.fillStyle = '#f2f2f0';
  ctx.textAlign = 'left';
  ctx.font = 'bold 92px Arial, sans-serif';
  ctx.fillText('APEX', 52, 132);
  ctx.fillStyle = '#c03949';
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillText('CORP', 316, 132);
  ctx.fillStyle = '#9a9a9e';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('HIGH-STAKES PARTNERSHIPS', 54, 184);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

/**
 * Beat 2 — Apex Corp. A deliberately different executive: receding grey hair,
 * burgundy/charcoal suit, different skin tone. Pushes the proposal back.
 */
export const createApexRejectScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) { light.intensity = 0.4; light.color.setHex(0xf0cfcf); }
      if (light.isHemisphereLight) { light.intensity = 0.32; light.color.setHex(0xd9b6b6); }
      if (light.isDirectionalLight) { light.intensity = 0.6; light.color.setHex(0xf6dcdc); }
      if (light.isPointLight) { light.intensity *= 0.55; light.color.setHex(0xe08080); }
    });
  },
  extra: (scene, { actors }) => {
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 1.5),
      new THREE.MeshStandardMaterial({
        map: makeApexLogo(), roughness: 0.7,
        emissive: 0x3a0d12, emissiveIntensity: 0.4,
      })
    );
    logo.position.set(0, 1.95, -4.78);
    scene.add(logo);

    const exec = actors.find((actor) => actor.Class === SponsorApp);
    if (exec && exec.app && exec.app.materials) {
      exec.app.materials.hair.color.setHex(0x8d8d8d);
      exec.app.materials.jacket.color.setHex(0x4a2030);
      exec.app.materials.vest.color.setHex(0x321620);
      exec.app.materials.lapel.color.setHex(0x5e2a3a);
      exec.app.materials.pants.color.setHex(0x2b1b22);
      exec.app.materials.cuffs.color.setHex(0x211419);
      exec.app.materials.skin.color.setHex(0xd9b48f);
    }

    const folder = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.035, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xe9e3d3, roughness: 0.85 })
    );
    folder.position.set(0.85, 0.82, -1.45);
    folder.rotation.y = 0.12;
    folder.castShadow = true;
    scene.add(folder);
    return { logo, folder };
  },
  onFrame: ({ t, extra }) => {
    const push = smooth(clamp((t - 1.0) / 1.8, 0, 1));
    extra.folder.position.z = lerp(-1.45, -0.5, push);
    extra.folder.position.x = lerp(0.85, 0.7, push);
  },
  actors: [
    {
      Class: SponsorApp,
      outfit: 'charcoalSlim',
      hair: 'receding',
      pose: 'idle',
      scale: 0.97,
      position: [0.95, 0, -1.65],
      rotationY: 0.06,
      animate: ({ t, parts }) => {
        const push = smooth(clamp((t - 1.0) / 1.8, 0, 1));
        if (parts.head) {
          parts.head.position.y = 1.95 + Math.sin(t * 1.7) * 0.011;
          parts.head.rotation.x = 0.08 + 0.1 * push;
          parts.head.rotation.y = 0.16 * (1 - push);
        }
        if (parts.torso) parts.torso.rotation.x = -0.06 * push;
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(-0.2, -0.78, push);
          parts.rightArm.rotation.z = lerp(0.3, 0.12, push);
        }
        if (parts.leftArm) parts.leftArm.rotation.z = -0.31;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.9,
      position: [-1.05, 0, 1.75],
      rotationY: 0.2,
      animate: ({ t, parts }) => {
        const sag = smooth(clamp((t - 1.6) / 1.6, 0, 1));
        if (parts.head) {
          parts.head.rotation.x = -0.18 * sag;
          parts.head.position.y = 1.95 + Math.sin(t * 1.5) * 0.01;
        }
        if (parts.torso) parts.torso.rotation.x = -0.06 * sag;
        if (parts.rightArm) parts.rightArm.rotation.x = 0.12 * sag;
        if (parts.leftArm) parts.leftArm.rotation.x = 0.12 * sag;
      },
    },
  ],
  camera: {
    fov: 68,
    ease: smooth,
    keys: [
      [0, [-3.0, 2.0, 2.6], [0.6, 1.3, -1.4], 68],
      [1.6, [-2.2, 1.85, 2.2], [0.75, 1.25, -1.5], 64],
      [3.6, [-1.4, 1.75, 1.8], [0.7, 1.15, -1.2], 60],
    ],
  },
});
