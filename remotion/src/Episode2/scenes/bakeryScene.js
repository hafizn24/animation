import * as THREE from 'three';
import { BakeryApp } from '../../../../environments/bakery.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { AnotherCasualOutfitApp } from '../../../../characters/character-casual.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makeApron = () => {
  const apron = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0xf2e6d2, roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xb9602c, roughness: 0.85 });

  const bib = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.03), cloth);
  bib.position.set(0, 0.09, 0.285);
  apron.add(bib);

  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 0.03), cloth);
  skirt.position.set(0, -0.34, 0.285);
  apron.add(skirt);

  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.025), trim);
  pocket.position.set(0, -0.28, 0.31);
  apron.add(pocket);

  [-1, 1].forEach((dir) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.03), cloth);
    strap.position.set(dir * 0.15, 0.31, 0.24);
    strap.rotation.z = dir * 0.18;
    apron.add(strap);
  });

  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 8, 16), trim);
  neck.position.set(0, 0.36, 0.24);
  neck.rotation.x = Math.PI / 2.4;
  apron.add(neck);

  apron.traverse((child) => { if (child.isMesh) child.castShadow = true; });
  return apron;
};

const makeEnvelope = () => {
  const envelope = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.19, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf1e4c6, roughness: 0.85 })
  );
  envelope.add(body);
  const flap = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.09, 0.01),
    new THREE.MeshStandardMaterial({ color: 0xe4d2ac, roughness: 0.85 })
  );
  flap.position.set(0, 0.05, 0.016);
  flap.rotation.x = -0.35;
  envelope.add(flap);
  envelope.position.set(0, -0.06, 0.1);
  envelope.visible = false;
  return envelope;
};

/** Scene 3 — a genuinely distinct warm bakery with a KEK MAJU wall sign. */
export const createBakeryScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: BakeryApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.92;
      if (light.isHemisphereLight) light.intensity = 0.7;
      if (light.isDirectionalLight) light.intensity = 1.0;
      if (light.isPointLight) light.intensity *= 1.15;
    });
  },
  extra: (scene, { env, actors }) => {
    const baker = actors.find((actor) => actor.Class === AnotherCasualOutfitApp);
    const apron = baker ? makeApron() : null;
    if (apron && baker.parts.torso) baker.parts.torso.add(apron);

    let envelope = null;
    if (baker && baker.parts.rightArm) {
      const hand = baker.parts.rightArm.getObjectByName('Hand');
      if (hand) {
        envelope = makeEnvelope();
        hand.add(envelope);
      }
    }

    return {
      apron,
      envelope,
      bell: env.characterParts.bell,
      sign: env.characterParts.sign,
    };
  },
  onFrame: ({ t, extra }) => {
    if (extra.bell) {
      const ring = Math.sin(clamp((t - 0.4) / 1.3, 0, 1) * Math.PI * 5) *
        (1 - clamp((t - 0.4) / 1.3, 0, 1)) * 0.32;
      extra.bell.rotation.z = ring;
    }
    if (extra.envelope) extra.envelope.visible = t > 4.0;
  },
  actors: [
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'beigeSweater',
      hair: 'long',
      scale: 0.95,
      position: [1.25, 0, -0.85],
      rotationY: -0.28,
      animate: ({ t, parts }) => {
        const offer = smooth(clamp((t - 5.0) / 2.5, 0, 1)) *
          (1 - smooth(clamp((t - 9.8) / 1.2, 0, 1)));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.05, -1.0, offer);
          parts.rightArm.rotation.z = lerp(0.32, 0.1, offer);
        }
        const nod = Math.sin((t - 4.2) * 3.2) * 0.1 *
          smooth(clamp((t - 4.2) / 0.5, 0, 1)) *
          (1 - smooth(clamp((t - 8.4) / 0.8, 0, 1)));
        if (parts.head) {
          parts.head.rotation.x = -0.04 + nod;
          parts.head.position.y = 1.95 + Math.sin(t * 1.9) * 0.012;
        }
        if (parts.torso) parts.torso.rotation.x = 0.04 + 0.07 * offer;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-1.15, 0, 1.25],
      rotationY: 0.2,
      animate: ({ t, parts }) => {
        const receive = smooth(clamp((t - 7.0) / 2.5, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.06, -0.62, receive);
          parts.rightArm.rotation.z = lerp(0.32, 0.16, receive);
        }
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32;
        if (parts.head) {
          parts.head.rotation.x = 0.1 * receive + Math.sin(t * 1.6) * 0.01;
          parts.head.position.y = 1.95 + Math.sin(t * 1.6) * 0.012;
        }
        if (parts.torso) parts.torso.rotation.x = 0.02 + 0.14 * receive;
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [3.2, 2.2, 4.8], [0, 1.3, 0], 74],
      [3.2, [2.4, 1.95, 3.9], [0.2, 1.35, -0.2], 70],
      [7.4, [1.5, 1.5, 2.6], [0.9, 1.2, -0.6], 60],
      [9.6, [0.5, 1.62, 2.9], [-0.7, 1.3, 0.9], 58],
      [12, [0.15, 1.55, 2.4], [-0.9, 1.3, 1.1], 54],
    ],
  },
});
