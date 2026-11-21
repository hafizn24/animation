import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { KarimApp } from '../../../../characters/character-karim.js';
import { applyOfficeGrade, clamp, createSceneDirector, lerp, penReach, smooth } from '../sceneKit.js';

export const createDoorwayScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'silence'),
  extra: (scene) => {
    const karimKey = new THREE.SpotLight(0xffe0bd, 0, 12, 0.72, 1.0, 1.0);
    karimKey.name = 'karimJerseyKey';
    karimKey.position.set(1.35, 2.6, -1.1);
    karimKey.target.position.set(1.75, 1.3, -4.15);
    scene.add(karimKey, karimKey.target);

    return { karimKey };
  },
  onFrame: ({ frame, env, actors, extra }) => {
    const reveal = smooth(clamp((frame - 33) / 18, 0, 1));
    if (env.lights) {
      env.lights.hallway.intensity = lerp(2.0, 8.0, reveal);
      env.lights.lamp.intensity = lerp(3.2, 2.4, reveal);
      env.lights.ambient.intensity = lerp(0.1, 0.16, reveal);
      env.lights.hemi.intensity = lerp(0.08, 0.12, reveal);
      env.lights.fill.intensity = lerp(0.06, 0.22, reveal);
    }
    if (extra.karimKey) extra.karimKey.intensity = lerp(0, 4.2, reveal);

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = lerp(-0.1, -0.92, penReach(frame));
        boss.parts.rightArm.rotation.z = 0.34;
      }
      if (boss.parts.head) boss.parts.head.rotation.y = lerp(0, -0.09, reveal);
      if (boss.parts.torso) boss.parts.torso.rotation.x = -0.07 * penReach(frame);
    }

    const karim = actors.find((actor) => actor.name === 'karim');
    if (karim) {
      karim.rig.position.z = lerp(-4.25, -4.02, reveal);
      karim.rig.position.y = Math.sin((frame / 30) * 1.5) * 0.008;
      if (karim.parts.head) {
        karim.parts.head.rotation.x = lerp(0.14, -0.05, reveal);
        karim.parts.head.rotation.y = Math.sin(frame * 0.045) * 0.05;
      }
      if (karim.parts.rightArm) karim.parts.rightArm.rotation.z = 0.28 + reveal * 0.08;
      if (karim.parts.leftArm) {
        karim.parts.leftArm.rotation.z = -0.28;
        karim.parts.leftArm.rotation.x = -0.12;
      }
    }
  },
  actors: [
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.95,
      position: [0.15, 0, -1.4],
      rotationY: 0.06,
    },
    {
      name: 'karim',
      Class: KarimApp,
      outfit: 'matchJersey',
      scale: 0.93,
      position: [1.75, 0, -4.25],
      rotationY: 0.12,
    },
  ],
  dispose: ({ scene, extra }) => {
    if (extra.karimKey) {
      scene.remove(extra.karimKey, extra.karimKey.target);
      extra.karimKey.shadow?.dispose?.();
    }
  },
  camera: {
    fov: 52,
    ease: smooth,
    keys: [
      [0, [0.9, 1.62, 1.9], [0.15, 1.5, -1.4], 54],
      [1.3, [1.0, 1.6, 1.85], [0.25, 1.35, -1.8], 52],
      [1.33, [1.15, 1.62, 1.8], [1.3, 1.5, -3.0], 50],
      [2.6, [1.55, 1.66, 0.9], [1.75, 1.5, -4.0], 48],
      [3.6, [1.62, 1.62, 0.15], [1.75, 1.48, -4.15], 46],
      [4.1, [1.6, 1.6, -0.1], [1.75, 1.45, -4.2], 44],
    ],
  },
});
