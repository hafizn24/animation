import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { KarimApp } from '../../../../characters/character-karim.js';
import { applyOfficeGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';

export const createAct1SacrificeScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env }) => ({ sheet: env.anchors.offerSheet, pen: env.anchors.pen }),
  onFrame: ({ frame, actors, env, extra }) => {
    const karim = actors.find((actor) => actor.name === 'karim');
    if (karim) {
      const toDesk = smooth(clamp((frame - 130) / 100, 0, 1));
      const backToDoor = smooth(clamp((frame - 380) / 200, 0, 1));
      karim.rig.position.x = lerp(lerp(1.75, 1.05, toDesk), 1.75, backToDoor);
      karim.rig.position.z = lerp(lerp(-4.1, -1.15, toDesk), -4.15, backToDoor);
      karim.rig.visible = frame < 612;

      const placeArmband =
        smooth(clamp((frame - 175) / 55, 0, 1)) *
        (1 - smooth(clamp((frame - 240) / 45, 0, 1)));
      if (karim.parts.rightArm) {
        karim.parts.rightArm.rotation.x = lerp(-0.08, -1.18, placeArmband);
        karim.parts.rightArm.rotation.z = 0.3;
      }
      if (karim.parts.leftArm) {
        karim.parts.leftArm.rotation.z = -0.3;
        karim.parts.leftArm.rotation.x = -0.06;
      }
      if (karim.parts.head) {
        karim.parts.head.rotation.x = lerp(0.04, 0.18, placeArmband) - backToDoor * 0.1;
        karim.parts.head.rotation.y = Math.sin(frame * 0.035) * 0.035;
      }
      if (karim.parts.torso) karim.parts.torso.rotation.x = -0.03 * toDesk + 0.04 * backToDoor;
    }

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      const reach = smooth(clamp((frame - 600) / 55, 0, 1));
      if (boss.parts.rightArm) {
        boss.parts.rightArm.rotation.x = -0.18 - reach * 0.55;
        boss.parts.rightArm.rotation.z = 0.32;
      }
      if (boss.parts.head) boss.parts.head.rotation.y = Math.sin(frame * 0.022) * 0.035 - reach * 0.06;
      if (boss.parts.torso) boss.parts.torso.rotation.x = -0.04 * reach;
    }

    if (env.anchors.doorHinge) {
      const close = smooth(clamp((frame - 590) / 35, 0, 1));
      env.anchors.doorHinge.rotation.y = lerp(-0.62, 0.02, close);
    }
    if (extra.sheet) extra.sheet.rotation.y = lerp(-0.12, 0.04, smooth(clamp((frame - 600) / 60, 0, 1)));
    if (env.lights && frame > 600) {
      const dim = smooth(clamp((frame - 600) / 70, 0, 1));
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
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      [0, [2.05, 1.62, 0.2], [1.75, 1.5, -4.1], 42],
      [1.5, [1.95, 1.6, 0.0], [1.75, 1.5, -4.15], 40],
      [4.3, [1.6, 1.62, 1.2], [1.45, 1.4, -2.6], 44],
      [7.8, [0.9, 1.55, 1.6], [1.0, 1.25, -1.1], 46],
      [12.2, [0.15, 1.6, 1.35], [1.0, 1.4, -1.15], 44],
      [14.7, [0.35, 1.62, 1.5], [1.65, 1.45, -3.0], 46],
      [19.5, [0.95, 1.62, 1.9], [1.6, 1.42, -3.9], 48],
      [20.0, [0.7, 1.6, 1.7], [0.4, 1.0, -0.1], 50],
      [28.0, [0.5, 1.58, 1.55], [0.35, 0.95, 0.06], 48],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 11.3) * 0.016 * k;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});
