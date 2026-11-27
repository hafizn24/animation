import { clamp, createStage, smooth } from '../../scene/stageKit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { LawyerApp } from '../../../../characters/character-lawyer.js';

/** Scene 2 — The Agreement. Global frames 148-457 (309 frames). */
export const createAgreementOfficeScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  actors: [
    {
      name: 'boss',
      Class: BossApp,
      outfit: 'navyOwner',
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
    if (env.lights.lamp) env.lights.lamp.intensity += Math.sin(t * 2.3) * 0.12;

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
      [0, [2.5, 1.85, 3.8], [0.1, 1.15, -1.0], 46],
      [4.3, [2.0, 1.75, 3.1], [0.1, 1.15, -1.1], 44],
      [4.3, [1.6, 1.7, 2.3], [0.2, 1.32, -1.55], 42],
      [309 / 30, [1.35, 1.65, 1.95], [0.2, 1.32, -1.55], 40],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});
