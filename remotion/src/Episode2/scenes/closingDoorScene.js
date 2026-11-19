import * as THREE from 'three';
import { SponsorOfficeApp } from '../../../../environments/sponsor-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

/** Beat 3 — the door swings shut in front of the lens, cutting to black. */
export const createClosingDoorScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: SponsorOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.22;
      if (light.isHemisphereLight) light.intensity = 0.18;
      if (light.isDirectionalLight) light.intensity = 0.3;
      if (light.isPointLight) light.intensity *= 0.32;
    });
  },
  extra: (scene) => {
    const door = new THREE.Group();
    door.position.set(-1.35, 0, 2.55);

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 2.9, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x2a2b31, roughness: 0.62, metalness: 0.12 })
    );
    panel.position.set(1.35, 1.45, 0);
    panel.castShadow = true;
    panel.receiveShadow = true;
    door.add(panel);

    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.5, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x1a1b20, roughness: 0.5 })
    );
    inset.position.set(1.35, 1.42, 0.07);
    door.add(inset);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.72, 0.015),
      new THREE.MeshStandardMaterial({
        color: 0x6d8696, roughness: 0.16, metalness: 0.2,
        transparent: true, opacity: 0.34,
      })
    );
    glass.position.set(1.35, 2.05, 0.085);
    door.add(glass);

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xc9a24c, roughness: 0.28, metalness: 0.8 })
    );
    handle.position.set(2.42, 1.18, 0.12);
    door.add(handle);

    for (const x of [0, 2.7]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 3.0, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.7 })
      );
      post.position.set(x, 1.5, 0);
      door.add(post);
    }
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(2.82, 0.14, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.7 })
    );
    lintel.position.set(1.35, 2.98, 0);
    door.add(lintel);

    door.rotation.y = 1.15;
    scene.add(door);
    return { door };
  },
  onFrame: ({ t, extra }) => {
    const swing = smooth(clamp((t - 1.5) / 1.0, 0, 1));
    extra.door.rotation.y = lerp(1.15, 0, swing) +
      Math.sin(clamp((t - 2.5) / 0.4, 0, 1) * Math.PI) * 0.02 * (1 - swing);
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.9,
      position: [0.15, 0, 0.9],
      rotationY: Math.PI,
      animate: ({ t, parts }) => {
        const sag = smooth(clamp(t / 2.2, 0, 1));
        if (parts.head) {
          parts.head.rotation.x = -0.3 * sag;
          parts.head.position.y = 1.95 + Math.sin(t * 1.3) * 0.01;
        }
        if (parts.torso) parts.torso.rotation.x = -0.12 * sag;
        if (parts.leftArm) parts.leftArm.rotation.x = 0.18 * sag;
        if (parts.rightArm) parts.rightArm.rotation.x = 0.18 * sag;
      },
    },
  ],
  camera: {
    fov: 64,
    ease: smooth,
    keys: [
      [0, [0.25, 1.75, 4.6], [0.1, 1.5, 2.4], 64],
      [1.5, [0.12, 1.7, 4.2], [0.1, 1.5, 2.5], 62],
      [2.9, [0, 1.68, 3.7], [0, 1.52, 2.55], 58],
    ],
  },
});
