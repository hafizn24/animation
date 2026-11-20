import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { AnotherCasualOutfitApp } from '../../../../characters/character-casual.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { getScene, localEvent } from '../timings.js';
import {
  addBakeryAdBoard,
  applyGoldenHour,
  clamp,
  createCrowd,
  createSceneDirector,
  lerp,
  smooth,
} from '../sceneKit.js';

const SCENE = getScene('fans-believe');
const JUMP = localEvent(SCENE, 'crowdJump');

const makeBakerApron = () => {
  const apron = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0xf2e6d2, roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xb9602c, roughness: 0.85 });
  const bib = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.014), cloth);
  bib.position.set(0, 0.09, 0.262);
  apron.add(bib);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 0.014), cloth);
  skirt.position.set(0, -0.34, 0.274);
  apron.add(skirt);
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.01), trim);
  pocket.position.set(0, -0.28, 0.283);
  apron.add(pocket);
  [-1, 1].forEach((dir) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.016), cloth);
    strap.position.set(dir * 0.15, 0.31, 0.252);
    strap.rotation.z = dir * 0.18;
    apron.add(strap);
  });
  apron.traverse((child) => { if (child.isMesh) child.castShadow = true; });
  return apron;
};

/** Touchline celebration — bakery owner cameo + instanced jumping crowd. */
export const createFanScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: -3, z: -54.8, width: 10 });
  },
  extra: (scene, { actors }) => {
    const crowd = createCrowd(scene, { count: 132, startX: -30, endX: 30, z: -56.5 });
    const baker = actors.find((actor) => actor.Class === AnotherCasualOutfitApp);
    const torso = baker?.parts?.torso || baker?.rig?.getObjectByName('Torso');
    if (baker && torso) torso.add(makeBakerApron());
    return { crowd };
  },
  onFrame: ({ frame, extra }) => {
    const start = JUMP ? JUMP.frame : 0;
    const energy = frame >= start ? 1 : 0.15;
    extra.crowd.update(frame, energy);
  },
  actors: [
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'beigeSweater',
      hair: 'long',
      scale: 0.94,
      position: [-3.6, 0, -53.6],
      rotationY: 0.1,
      animate: ({ t, frame, parts }) => {
        const cheer = smooth(clamp(frame / 16, 0, 1));
        if (parts.leftArm) parts.leftArm.rotation.z = -0.35 - cheer * 1.05;
        if (parts.rightArm) parts.rightArm.rotation.z = 0.35 + cheer * 0.95;
        if (parts.head) {
          parts.head.rotation.y = Math.sin(t * 2.2) * 0.14;
          parts.head.position.y = 1.95 + Math.abs(Math.sin(t * 5)) * 0.05 * cheer;
        }
        if (parts.torso) parts.torso.rotation.x = -0.06 * cheer;
      },
    },
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'oliveSweater',
      hair: 'messy',
      scale: 0.9,
      position: [-1.4, 0, -53.2],
      rotationY: -0.12,
      animate: ({ t, frame, parts }) => {
        const cheer = smooth(clamp((frame - 6) / 18, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + cheer * 1.2;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - cheer * 0.5;
        if (parts.head) parts.head.rotation.z = Math.sin(t * 4) * 0.08 * cheer;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      hair: 'afro',
      scale: 0.88,
      position: [1.0, 0, -53.5],
      rotationY: 0.16,
      animate: ({ frame, parts }) => {
        const cheer = smooth(clamp((frame - 12) / 18, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.x = -1.35 * cheer;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - cheer * 0.8;
        if (parts.head) parts.head.rotation.x = -0.18 * cheer;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'maroonCoach',
      hair: 'bald',
      scale: 0.86,
      position: [3.0, 0, -53.3],
      rotationY: -0.2,
      animate: ({ t, frame, parts }) => {
        const cheer = smooth(clamp((frame - 18) / 18, 0, 1));
        if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + cheer * 1.15;
        if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - cheer * 0.85;
        if (parts.head) parts.head.rotation.y = lerp(0, Math.sin(t * 5) * 0.2, cheer);
      },
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [-4.5, 2.5, -46.8], [2.5, 1.4, -53.8], 72],
      [4.37, [-3.8, 2.3, -47.2], [2.8, 1.4, -53.9], 68],
      [4.4, [4.6, 2.5, -47.4], [-3.2, 1.4, -54], 66],
      [7.17, [3.8, 2.3, -47.8], [-3.4, 1.4, -54], 64],
      [7.2, [0, 3.2, -46], [0, 1.5, -55], 70],
      [9.0, [0, 3.0, -46.6], [0, 1.5, -55], 68],
    ],
  },
});
