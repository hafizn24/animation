import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { applyOfficeGrade, clamp, createSceneDirector, deskSlide, lerp, smooth } from '../sceneKit.js';

export const createBombDropScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env }) => ({ sheet: env.anchors.offerSheet, pen: env.anchors.pen }),
  onFrame: ({ frame, extra }) => {
    const slide = smooth(clamp(frame / 34, 0, 1));
    if (extra.sheet) {
      extra.sheet.position.x = deskSlide(frame);
      extra.sheet.rotation.y = lerp(-0.12, 0.06, slide);
    }
    if (extra.pen) extra.pen.rotation.y = 0.22 - slide * 0.12;
  },
  actors: [
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.95,
      position: [0.15, 0, -1.4],
      rotationY: 0.06,
      animate: ({ frame, t, rig, parts }) => {
        const settle = smooth(clamp(frame / 28, 0, 1));
        const withdraw = smooth(clamp((frame - 48) / 22, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(-0.2, -1.0, settle) * (1 - 0.45 * withdraw);
          parts.rightArm.rotation.z = 0.34;
        }
        if (parts.leftArm) parts.leftArm.rotation.z = -0.36;
        if (parts.head) parts.head.rotation.x = lerp(0.02, -0.11, settle);
        if (parts.torso) {
          parts.torso.rotation.x = -0.05 * settle;
          parts.torso.scale.y = 1 + Math.sin(t * 1.7) * 0.01;
        }
        rig.position.y = Math.sin(t * 1.7) * 0.008;
      },
    },
  ],
  camera: {
    fov: 62,
    ease: smooth,
    keys: [
      [0, [0.85, 1.35, 2.55], [0.25, 0.9, 0.05], 64],
      [0.5, [0.7, 1.35, 2.45], [0.2, 0.92, 0.0], 62],
      [1.5, [0.5, 1.4, 2.35], [0.15, 0.95, -0.15], 58],
      [1.53, [-0.05, 1.78, 3.25], [0.15, 1.5, -1.35], 58],
      [3.0, [-0.15, 1.74, 3.05], [0.15, 1.5, -1.4], 55],
      [4.6, [-0.25, 1.72, 2.85], [0.15, 1.48, -1.4], 52],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 11.7) * 0.018 * k;
    camera.position.y += Math.cos(frame * 8.3) * 0.012 * k;
  },
});
