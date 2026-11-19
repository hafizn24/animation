import * as THREE from 'three';
import { ManagerOfficeApp } from '../../../../environments/manager-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createSceneDirector, forEachLight, lerp, smooth } from '../sceneKit.js';

const makePaperBall = () => {
  const geometry = new THREE.IcosahedronGeometry(0.12, 1);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const crumple = 1 + 0.2 * Math.sin(i * 12.9898) * Math.cos(i * 4.1414);
    positions.setXYZ(
      i,
      positions.getX(i) * crumple,
      positions.getY(i) * crumple,
      positions.getZ(i) * crumple
    );
  }
  geometry.computeVertexNormals();
  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0xece7d8, roughness: 0.95, flatShading: true })
  );
};

export const createOfficePlanScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ManagerOfficeApp,
  grade: (scene) => {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.55;
      if (light.isDirectionalLight && !light.castShadow) light.intensity = 0.3;
      if (light.isPointLight) light.intensity *= 0.85;
    });
  },
  extra: (scene) => {
    const prop = new THREE.Group();
    const clipboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.022, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x8b6b4a, roughness: 0.75 })
    );
    const paper = makePaperBall();
    paper.position.set(0.02, 0.11, 0.04);
    prop.add(clipboard, paper);
    prop.position.set(-0.65, 0.82, 1.5);
    prop.rotation.y = 0.2;
    scene.add(prop);
    return { prop };
  },
  onFrame: ({ t, extra }) => {
    const lift = smooth(clamp((t - 5) / 1.4, 0, 1)) * (1 - smooth(clamp((t - 8) / 2, 0, 1)));
    extra.prop.position.y = lerp(0.82, 1.02, lift);
    extra.prop.rotation.z = lerp(0, 0.18, lift);
  },
  actors: [
    {
      Class: NewOwnerApp,
      outfit: 'navyOwner',
      pose: 'idle',
      scale: 0.95,
      position: [-0.2, 0, 1.6],
      rotationY: 0.15,
      animate: ({ t, rig, parts }) => {
        const lean = smooth(clamp((t - 5) / 3, 0, 1));
        if (parts.torso) parts.torso.rotation.x = 0.22 * lean;
        if (parts.head) parts.head.rotation.x = 0.1 * lean;
        if (parts.rightArm) parts.rightArm.rotation.x = -0.5 * lean;
        rig.position.y = -0.02 * lean;
      },
    },
    {
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [0.9, 0, -1.2],
      rotationY: -0.2,
      animate: ({ t, parts }) => {
        const open = smooth(clamp((t - 8) / 2, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(0.05, -0.5, open);
          parts.rightArm.rotation.z = lerp(0.32, 0.52, open);
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.x = lerp(0.05, 0.02, open);
          parts.leftArm.rotation.z = lerp(-0.32, -0.3, open);
        }
        if (parts.head) parts.head.rotation.y = lerp(0.12, 0, open);
        if (parts.torso) parts.torso.rotation.x = lerp(0.05, -0.04, open);
      },
    },
  ],
  camera: {
    fov: 74,
    ease: smooth,
    keys: [
      [0, [3.4, 2.25, 6.4], [0.2, 1.3, 0.3], 78],
      [5.5, [3.0, 2.1, 5.6], [0.2, 1.3, 0.2], 74],
      [11, [2.6, 1.95, 4.8], [0.2, 1.3, 0.1], 70],
      [15, [2.4, 1.9, 4.4], [0.2, 1.3, 0], 68],
    ],
  },
});
