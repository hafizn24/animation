import * as THREE from 'three';
import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { SponsorApp } from '../../../../characters/character-sponsor.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

/** Beat 1 — Nexus Sports: cool blue lighting, dismissive head shake + wave. */
export const createNexusRejectScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) { light.intensity = 0.38; light.color.setHex(0x9fc6e8); }
      if (light.isHemisphereLight) { light.intensity = 0.3; light.color.setHex(0x7fb0d8); }
      if (light.isDirectionalLight) { light.intensity = 0.55; light.color.setHex(0xbcd8f5); }
      if (light.isPointLight) { light.intensity *= 0.5; light.color.setHex(0xa8d2f0); }
    });
  },
  extra: (scene) => {
    const proposal = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.03, 0.68),
      new THREE.MeshStandardMaterial({ color: 0xeee8d8, roughness: 0.85 })
    );
    proposal.position.set(-0.55, 0.8, -0.95);
    proposal.rotation.y = -0.14;
    proposal.castShadow = true;
    scene.add(proposal);
    return { proposal };
  },
  onFrame: ({ t, extra }) => {
    const nudge = smooth(clamp((t - 3.3) / 0.6, 0, 1)) *
      (1 - smooth(clamp((t - 5.8) / 0.5, 0, 1)));
    extra.proposal.position.z = -0.95 - nudge * 0.12;
  },
  actors: [
    {
      Class: SponsorApp,
      outfit: 'corporateNavy',
      hair: 'sidePart',
      pose: 'idle',
      scale: 0.95,
      position: [0.9, 0, -1.55],
      rotationY: -0.1,
      animate: ({ t, parts }) => {
        const breath = Math.sin(t * 1.8) * 0.012;
        if (parts.head) parts.head.position.y = 1.95 + breath;
        const talk = smooth(clamp((t - 3.3) / 0.4, 0, 1)) *
          (1 - smooth(clamp((t - 6.2) / 0.5, 0, 1)));
        const shake = Math.sin((t - 3.3) * 7.5) * 0.26 * talk;
        if (parts.head) parts.head.rotation.y = shake;
        if (parts.torso) parts.torso.rotation.y = shake * 0.35;
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.05, -0.55, talk) + Math.sin(t * 6) * 0.1 * talk;
          parts.rightArm.rotation.z = lerp(0.32, 0.08, talk);
        }
        if (parts.leftArm) parts.leftArm.rotation.z = -0.3;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.92,
      position: [0, 0, 1.6],
      rotationY: 0,
      animate: ({ t, parts }) => {
        const drop = smooth(clamp((t - 3.3) / 2, 0, 1));
        if (parts.head) {
          parts.head.rotation.x = -0.1 * drop;
          parts.head.position.y = 1.95 + Math.sin(t * 1.6) * 0.012;
        }
        if (parts.torso) parts.torso.rotation.x = -0.05 * drop;
      },
    },
  ],
  camera: {
    fov: 70,
    ease: smooth,
    keys: [
      [0, [2.6, 1.9, 3.6], [0.7, 1.25, -1.2], 70],
      [2.6, [1.9, 1.8, 2.7], [0.85, 1.25, -1.4], 66],
      [4.2, [0.2, 1.75, 3.2], [0.4, 1.3, 0.4], 62],
      [6.5, [0.1, 1.7, 2.6], [0.5, 1.3, -0.6], 60],
    ],
  },
});
