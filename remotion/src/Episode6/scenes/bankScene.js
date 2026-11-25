import * as THREE from 'three';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { BankBranchApp } from '../../../../environments/bank-branch.js';
import { clamp, createSceneDirector, lerp, smooth } from '../../Episode1/sceneKit.js';
import { shotKey } from '../../shared/cameraKit.js';

const KEYS = [
  shotKey({ position: [0.2, 1.6, 7.2], lookAt: [-0.2, 1.3, -0.9], fov: 40 }, 0),
  shotKey({ position: [0.6, 1.58, 6.8], lookAt: [-0.4, 1.3, -1.0], fov: 40 }, 8),
  shotKey({ position: [2.3, 1.55, 7.6], lookAt: [2.0, 1.3, 0.7], fov: 40 }, 17),
  shotKey({ position: [2.3, 1.55, 7.6], lookAt: [2.0, 1.3, 0.7], fov: 40 }, 22),
];

export const createBankFreezeScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: BankBranchApp,
  camera: { keys: KEYS, fov: 40 },
  minSeparation: 0.95,
  extra: (scene, { env }) => {
    const band = new THREE.Group();
    band.name = 'GoldArmbandOnDesk';
    const gold = new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.6, emissive: 0x3a2602 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 10, 28), gold);
    ring.rotation.x = Math.PI / 2;
    band.add(ring);
    band.position.copy(env.characterParts.armbandDesk.position);
    band.position.y += 0.04;
    band.visible = false;
    env.scene.add(band);
    return { band };
  },
  onFrame: ({ frame, actors, env, extra }) => {
    const peguam = actors.find((actor) => actor.name === 'peguam');
    if (peguam) {
      const tap = Math.sin(frame * 0.14) * 0.06;
      if (peguam.parts.rightArm) peguam.parts.rightArm.rotation.x = -0.45 + tap;
      if (peguam.parts.head) peguam.parts.head.rotation.y = Math.sin(frame * 0.03) * 0.05;
    }
    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      const nod = Math.sin(frame * 0.06) * 0.04;
      if (boss.parts.head) boss.parts.head.rotation.x = nod;
      if (boss.parts.torso) boss.parts.torso.rotation.y = -0.04 + nod * 0.3;
    }
    if (env.characterParts?.folder) {
      env.characterParts.folder.rotation.y = lerp(-0.18, 0.04, smooth(clamp(frame / 240, 0, 1)));
    }
    if (env.characterParts?.stamp) {
      const hit = smooth(clamp((frame - 520) / 10, 0, 1));
      env.characterParts.stamp.position.y = lerp(1.24, 1.12, hit);
    }
    if (extra.band) {
      const show = frame >= 400;
      extra.band.visible = show;
      if (show) extra.band.scale.setScalar(lerp(0.6, 1, smooth(clamp((frame - 400) / 24, 0, 1))));
    }
    env.update?.(frame);
  },
  actors: [
    { name: 'peguam', Class: SuitOutfitApp, outfit: 'navyExecutive', position: [-1.3, 0, -1.9], rotationY: 0.05, scale: 1 },
    { name: 'boss', Class: NewOwnerApp, outfit: 'charcoalOwner', position: [0.3, 0, 0.3], rotationY: -0.12, scale: 0.98 },
    { name: 'azam', Class: AzamApp, position: [2.4, 0, 1.1], rotationY: -0.35, scale: 0.92 },
  ],
});
