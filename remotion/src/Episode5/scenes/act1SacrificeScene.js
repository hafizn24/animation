import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { KarimApp } from '../../../../characters/character-karim.js';
import { applyOfficeGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';
import { ACT_1, DEBT_HUD } from '../timings.js';

const localLine = (id, key = 'startFrame') =>
  ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const HUD_FROM = DEBT_HUD.fromFrame - ACT_1.fromFrame;
const HUD_TO = DEBT_HUD.toFrame - ACT_1.fromFrame;
const E5_02 = localLine('e5_02');
const E5_02_END = localLine('e5_02', 'endFrame');
const E5_03 = localLine('e5_03');
const E5_04 = localLine('e5_04');
const E5_05 = localLine('e5_05');
const E5_05_END = localLine('e5_05', 'endFrame');

export const createAct1SacrificeScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env }) => {
    const sheet = env.anchors.offerSheet;
    const pen = env.anchors.pen;

    // Physical captain armband laid flat on the desk beside the offer paper.
    const armband = new THREE.Group();
    armband.name = 'CaptainArmband';
    const gold = new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.72 });
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.026, 10, 28), gold);
    band.rotation.x = Math.PI / 2;
    band.castShadow = true;
    armband.add(band);
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.008, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.6 })
    );
    crest.position.set(0, 0.012, 0.13);
    armband.add(crest);
    armband.position.set(-0.18, 0.882, 0.3);
    armband.scale.setScalar(0.001);
    armband.visible = false;
    scene.add(armband);

    return { sheet, pen, armband };
  },
  onFrame: ({ frame, actors, env, extra }) => {
    const karim = actors.find((actor) => actor.name === 'karim');
    if (karim) {
      const toDesk = smooth(clamp((frame - E5_02) / Math.max(1, E5_03 - E5_02), 0, 1));
      const backToDoor = smooth(clamp((frame - E5_04) / Math.max(1, E5_05_END - E5_04), 0, 1));
      karim.rig.position.x = lerp(lerp(1.75, 1.05, toDesk), 1.75, backToDoor);
      karim.rig.position.z = lerp(lerp(-4.1, -1.15, toDesk), -4.15, backToDoor);
      karim.rig.visible = frame < HUD_FROM + 8;

      // No detached boot prop: the carried boots are hidden, only the clean
      // armband-on-desk action remains (worn cleats stay part of the legs).
      if (karim.parts.boots) karim.parts.boots.visible = false;

      const place =
        smooth(clamp((frame - E5_02 - 10) / 26, 0, 1)) *
        (1 - smooth(clamp((frame - E5_02_END - 2) / 18, 0, 1)));
      if (karim.parts.rightArm) {
        karim.parts.rightArm.rotation.x = lerp(-0.08, -1.12, place);
        karim.parts.rightArm.rotation.z = 0.3;
      }
      if (karim.parts.leftArm) {
        karim.parts.leftArm.rotation.z = -0.3;
        karim.parts.leftArm.rotation.x = -0.06;
      }
      if (karim.parts.head) {
        karim.parts.head.rotation.x = lerp(0.04, 0.18, place) - backToDoor * 0.1;
        karim.parts.head.rotation.y = Math.sin(frame * 0.035) * 0.035;
      }
      if (karim.parts.torso) karim.parts.torso.rotation.x = -0.03 * toDesk + 0.04 * backToDoor;
    }

    if (extra.armband) {
      const placed = frame >= E5_02_END - 8;
      extra.armband.visible = placed;
      if (placed) {
        const settle = smooth(clamp((frame - (E5_02_END - 8)) / 10, 0, 1));
        extra.armband.scale.setScalar(lerp(0.55, 1, settle));
        extra.armband.position.y = lerp(0.94, 0.882, settle);
      }
    }

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      const reach = smooth(clamp((frame - HUD_FROM) / 40, 0, 1));
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = -0.18 - reach * 0.55;
        boss.parts.rightArm.rotation.z = 0.32;
      }
      if (boss.parts.head) boss.parts.head.rotation.y = Math.sin(frame * 0.022) * 0.035 - reach * 0.06;
      if (boss.parts.torso) boss.parts.torso.rotation.x = -0.04 * reach;
    }

    if (env.anchors.doorHinge) {
      const close = smooth(clamp((frame - HUD_FROM - 4) / 26, 0, 1));
      env.anchors.doorHinge.rotation.y = lerp(-0.62, 0.02, close);
    }
    if (extra.sheet) {
      extra.sheet.rotation.y = lerp(-0.12, 0.04, smooth(clamp((frame - HUD_FROM) / 40, 0, 1)));
    }
    if (env.lights && frame > HUD_FROM) {
      const dim = smooth(clamp((frame - HUD_FROM) / 40, 0, 1));
      env.lights.lamp.intensity = lerp(8.5, 3.1, dim);
      env.lights.hallway.intensity = lerp(1.4, 5.6, dim);
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
      position: [1.75, 0, -4.1],
      rotationY: 0.16,
    },
  ],
  dispose: ({ scene, extra }) => {
    if (!extra.armband) return;
    scene.remove(extra.armband);
    extra.armband.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      [0, [2.05, 1.62, 0.2], [1.75, 1.5, -4.1], 42],
      [1.5, [1.95, 1.6, 0.0], [1.75, 1.5, -4.15], 40],
      [E5_02 / 30, [1.6, 1.62, 1.2], [1.45, 1.4, -2.6], 44],
      [E5_02_END / 30, [0.9, 1.72, 1.55], [0.08, 0.86, 0.23], 48],
      [E5_04 / 30, [0.15, 1.6, 1.35], [1.0, 1.4, -1.15], 44],
      [E5_05 / 30, [0.35, 1.62, 1.5], [1.65, 1.45, -3.0], 46],
      [E5_05_END / 30, [0.95, 1.62, 1.9], [1.6, 1.42, -3.9], 48],
      [HUD_FROM / 30, [0.7, 1.6, 1.7], [0.4, 1.0, -0.1], 50],
      [HUD_TO / 30, [0.5, 1.58, 1.55], [0.35, 0.95, 0.06], 48],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 11.3) * 0.016 * k;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});
