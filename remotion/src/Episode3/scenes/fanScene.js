import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { AnotherCasualOutfitApp } from '../../../../characters/character-casual.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { getScene, localEvent } from '../timings.js';
import {
  addBakeryAdBoard,
  applyGoldenHour,
  cheerPose,
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

/**
 * Touchline celebration. The whole party sits at z ≈ -30 (well in front of the
 * goal at z = -50 and its net/railing), with the KEK MAJU board BEHIND them at
 * z = -33. The camera stays at z ≈ -20, so nothing obstructs the shot.
 * All arm motion uses phase-offset sine waves — no identical T-poses.
 */
export const createFanScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  grade: (scene) => {
    applyGoldenHour(scene);
    addBakeryAdBoard(scene, { x: 0, z: -33, width: 11 });
  },
  extra: (scene, { actors }) => {
    const crowd = createCrowd(scene, { count: 132, startX: -30, endX: 30, z: -34.5 });
    const baker = actors.find((actor) => actor.Class === AnotherCasualOutfitApp);
    const torso = baker?.parts?.torso || baker?.rig?.getObjectByName('Torso');
    if (baker && torso) torso.add(makeBakerApron());
    return { crowd };
  },
  onFrame: ({ frame, extra }) => {
    const start = JUMP ? JUMP.frame : 0;
    const energy = frame >= start ? 1 : 0.18;
    extra.crowd.update(frame, energy);
  },
  actors: [
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'beigeSweater',
      hair: 'long',
      scale: 0.94,
      position: [-3.6, 0, -30.2],
      rotationY: 0.1,
      animate: ({ t, frame, parts }) => {
        const cheer = smooth(clamp(frame / 16, 0, 1));
        const pose = cheerPose(frame, 0.5);
        const wave = Math.sin(t * 5.6) * 0.14 * cheer;
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.42, 2.55, cheer) + wave;
          parts.rightArm.rotation.x = -0.12 * cheer;
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.z = lerp(-0.42, -0.55, cheer);
          parts.leftArm.rotation.x = lerp(0, -1.25, cheer) + Math.sin(t * 8) * 0.12 * cheer;
        }
        if (parts.head) {
          parts.head.rotation.y = Math.sin(t * 2.2) * 0.14;
          parts.head.rotation.x = -0.06 * cheer;
          parts.head.position.y = 1.95 + Math.abs(Math.sin(t * 5)) * 0.05 * cheer;
        }
        if (parts.torso) parts.torso.rotation.x = -0.05 * cheer + pose.breath;
      },
    },
    {
      Class: AnotherCasualOutfitApp,
      outfit: 'oliveSweater',
      hair: 'messy',
      scale: 0.9,
      position: [-1.4, 0, -29.8],
      rotationY: -0.12,
      animate: ({ frame, parts }) => {
        const cheer = smooth(clamp((frame - 6) / 18, 0, 1));
        const pose = cheerPose(frame, 2.1);
        if (parts.rightArm) parts.rightArm.rotation.z = lerp(0.42, pose.right, cheer);
        if (parts.leftArm) parts.leftArm.rotation.z = lerp(-0.42, pose.left, cheer);
        if (parts.head) {
          parts.head.rotation.z = Math.sin(frame * 0.13 + 1) * 0.08 * cheer;
          parts.head.rotation.y = pose.head * 0.5 * cheer;
        }
        if (parts.torso) parts.torso.rotation.x = pose.breath;
      },
    },
    {
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      hair: 'afro',
      scale: 0.88,
      position: [1.0, 0, -30.1],
      rotationY: 0.16,
      animate: ({ frame, parts }) => {
        const cheer = smooth(clamp((frame - 12) / 18, 0, 1));
        const pose = cheerPose(frame, 3.6);
        if (parts.rightArm) {
          parts.rightArm.rotation.z = lerp(0.42, pose.right + 0.12, cheer);
          parts.rightArm.rotation.x = -0.1 * cheer;
        }
        if (parts.leftArm) parts.leftArm.rotation.z = lerp(-0.42, pose.left, cheer);
        if (parts.head) {
          parts.head.rotation.x = -0.14 * cheer;
          parts.head.rotation.y = pose.head * 0.4 * cheer;
        }
        if (parts.torso) parts.torso.rotation.x = pose.breath;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'maroonCoach',
      hair: 'bald',
      scale: 0.86,
      position: [3.0, 0, -29.9],
      rotationY: -0.2,
      animate: ({ frame, parts }) => {
        const cheer = smooth(clamp((frame - 18) / 18, 0, 1));
        const pose = cheerPose(frame, 5.0);
        if (parts.rightArm) parts.rightArm.rotation.z = lerp(0.42, pose.right, cheer);
        if (parts.leftArm) parts.leftArm.rotation.z = lerp(-0.42, pose.left, cheer);
        if (parts.head) parts.head.rotation.y = pose.head * 0.7 * cheer;
        if (parts.torso) parts.torso.rotation.x = pose.breath;
      },
    },
  ],
  camera: {
    fov: 72,
    ease: smooth,
    keys: [
      [0, [-1.5, 2.5, -20.8], [-0.5, 1.4, -29.6], 72],
      [4.37, [-1.2, 2.35, -21.0], [0.2, 1.4, -29.8], 68],
      [4.4, [3.0, 2.4, -21.2], [-0.8, 1.4, -30.0], 66],
      [7.17, [2.6, 2.3, -21.6], [-1.0, 1.4, -30.2], 64],
      [7.2, [0, 3.0, -19.8], [0, 1.5, -30.4], 70],
      [9.0, [0, 2.9, -20.4], [0, 1.5, -30.6], 68],
    ],
  },
});
