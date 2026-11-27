import * as THREE from 'three';
import { clamp, createStage, smooth } from '../../scene/stageKit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import { createArmbandTexture } from '../../../../characters/core/kits.js';
import { Episode6OfficeApp } from '../../../../environments/episode6-office.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { LawyerApp } from '../../../../characters/character-lawyer.js';

/**
 * Unworn captain's armband resting on the desk next to the finance ledger —
 * canon: the armband stays on Boss's desk and the captaincy is vacant.
 */
function createDeskArmband(env) {
  const group = new THREE.Group();
  group.name = 'CaptainsArmbandProp';
  const geoms = [];

  const bandMat = env.createToonMaterial(0xd8b26a);
  const bandGeom = new THREE.BoxGeometry(0.24, 0.045, 0.1);
  geoms.push(bandGeom);
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.position.y = 0.022;
  band.castShadow = true;
  group.add(band);

  const letterPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshBasicMaterial({ map: createArmbandTexture('C') })
  );
  geoms.push(letterPlane.geometry);
  letterPlane.position.set(0, 0.062, 0.02);
  group.add(letterPlane);

  return {
    group,
    dispose() {
      group.parent?.remove(group);
      geoms.forEach((geometry) => geometry.dispose());
      bandMat.dispose();
      letterPlane.material.map?.dispose();
      letterPlane.material.dispose();
    },
  };
}

/**
 * Scene 2 — The Agreement. Global frames 148-457 (309 frames).
 * Uses the Episode 6 office set so the RM326,500 finance ledger and the
 * conditional seizure-freeze agreement sit on the desk, framed in the
 * middle-upper half of the shot, clear of the bottom subtitle plate.
 */
export const createAgreementOfficeScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: Episode6OfficeApp,
  grade: (scene, env) => {
    applyOfficeGrade(scene, env, 'scene1');
    // Clamp the key light so the toon shading steps read instead of blowing
    // out to pure white, and keep the warm ambient for step contrast.
    if (env.lights.key) env.lights.key.intensity = Math.min(env.lights.key.intensity, 1.15);
    if (env.lights.ambient) env.lights.ambient.intensity = Math.max(env.lights.ambient.intensity, 0.32);
  },
  extra: (scene, { env }) => {
    const armband = createDeskArmband(env);
    // Desk hero prop, front-centre between the ledger and the legal paper.
    armband.group.position.set(0.12, 0.885, 0.4);
    armband.group.rotation.y = 0.68; // faces the camera side of the desk
    scene.add(armband.group);
    return { armband };
  },
  dispose: ({ extra }) => extra.armband?.dispose(),
  actors: [
    {
      name: 'boss',
      Class: BossApp,
      outfit: 'charcoalOwner',
      scale: 0.95,
      position: [0.15, 0, -1.55],
      rotationY: 0.06,
    },
    {
      name: 'lawyer',
      Class: LawyerApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [1.7, 0, -3.3],
      rotationY: 0.16,
    },
  ],
  onFrame: ({ frame, actors, env }) => {
    const t = frame / 30;
    const e7_03From = 142; // local frame where the boss starts talking

    applyOfficeGrade(undefined, env, frame < e7_03From ? 'scene1' : 'scene2');
    if (env.lights.key) env.lights.key.intensity = Math.min(env.lights.key.intensity, 1.15);
    if (env.lights.lamp) env.lights.lamp.intensity = Math.min(env.lights.lamp.intensity, 8.5) + Math.sin(t * 2.3) * 0.12;

    const boss = actors.find((a) => a.name === 'boss');
    if (boss) {
      boss.rig.position.y = Math.sin(t * 1.9 + 1) * 0.01;
      if (boss.parts.head && frame >= e7_03From) {
        boss.parts.head.rotation.y = Math.sin(t * 4.0) * 0.06;
      }
      if (boss.parts.rightArm && frame >= e7_03From) {
        boss.parts.rightArm.rotation.x =
          -0.12 - smooth(clamp((frame - e7_03From) / 40, 0, 1)) * 0.42;
      }
    }

    const lawyer = actors.find((a) => a.name === 'lawyer');
    if (lawyer) {
      lawyer.rig.position.y = Math.sin(t * 2.1) * 0.01;
      if (lawyer.parts.head) lawyer.parts.head.rotation.y = Math.sin(t * 3.4) * 0.05;
    }
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      // Desk hero shot: camera raised, target dropped to desk height so the
      // ledger / agreement / armband sit mid-frame, above the subtitle plate.
      [0, [2.6, 2.0, 3.9], [0.05, 0.9, -0.9], 46],
      [4.3, [2.1, 1.9, 3.2], [0.05, 0.9, -1.0], 44],
      // Cut to Boss — full body reads, chest well above the bottom 25%.
      [4.3, [1.7, 1.8, 2.4], [0.2, 1.02, -1.5], 42],
      [309 / 30, [1.45, 1.74, 2.05], [0.2, 1.02, -1.5], 40],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});
