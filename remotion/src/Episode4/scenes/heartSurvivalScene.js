import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { applyOfficeGrade, clamp, createSceneDirector, lerp, smooth } from '../sceneKit.js';

export const createHeartSurvivalScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene2'),
  actors: [
    {
      name: 'boss',
      Class: NewOwnerApp,
      outfit: 'charcoalOwner',
      scale: 0.95,
      position: [0.15, 0, -1.4],
      rotationY: 0.06,
      animate: ({ frame, t, parts }) => {
        const argue = smooth(clamp((frame - 411) / 40, 0, 1));
        const spread = smooth(clamp((frame - 900) / 60, 0, 1));
        const final = smooth(clamp((frame - 1110) / 60, 0, 1));
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(-0.15, -0.72, argue) + spread * 0.35 - final * 0.2;
          parts.rightArm.rotation.z = lerp(0.34, 0.62, spread);
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.x = -0.1 * argue - spread * 0.3;
          parts.leftArm.rotation.z = lerp(-0.36, -0.6, spread);
        }
        if (parts.head) {
          parts.head.rotation.x = lerp(0, -0.09, argue);
          parts.head.rotation.y = Math.sin(frame * 0.035) * 0.05 + final * 0.06;
        }
        if (parts.torso) {
          parts.torso.rotation.x = -0.05 * argue;
          parts.torso.rotation.y = Math.sin(frame * 0.028) * 0.035;
          parts.torso.scale.y = 1 + Math.sin(t * 1.8) * 0.01;
        }
      },
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.92,
      position: [-2.25, 0, 0.1],
      rotationY: 1.18,
      animate: ({ frame, t, parts }) => {
        const lean = smooth(clamp((frame - 135) / 60, 0, 1));
        const challenge = smooth(clamp((frame - 909) / 50, 0, 1));
        const shake = Math.sin(frame * 0.13) * 0.09 * lean;
        if (parts.rightArm) {
          parts.rightArm.rotation.x = lerp(-0.12, -0.85, lean) - challenge * 0.55;
          parts.rightArm.rotation.z = 0.32 + challenge * 0.4;
        }
        if (parts.leftArm) {
          parts.leftArm.rotation.x = -0.5 * lean - challenge * 0.4;
          parts.leftArm.rotation.z = -0.34 - challenge * 0.28;
        }
        if (parts.head) {
          parts.head.rotation.y = shake;
          parts.head.rotation.x = -0.06 * lean;
        }
        if (parts.torso) {
          parts.torso.rotation.x = -0.08 * lean;
          parts.torso.rotation.y = -0.06 * lean;
          parts.torso.scale.y = 1 + Math.sin(t * 1.9) * 0.012;
        }
      },
    },
  ],
  camera: {
    fov: 56,
    ease: smooth,
    keys: [
      [0, [2.5, 1.75, 2.7], [0.0, 1.5, -0.7], 60],
      [0.38, [2.35, 1.72, 2.5], [0.0, 1.5, -0.7], 58],
      [0.4, [0.55, 1.68, 1.35], [-2.2, 1.52, 0.1], 56],
      [4.47, [0.35, 1.66, 1.15], [-2.25, 1.52, 0.1], 52],
      [4.5, [-0.35, 1.66, 1.5], [-2.25, 1.52, 0.1], 48],
      [10.77, [-0.45, 1.64, 1.4], [-2.25, 1.52, 0.1], 46],
      [10.8, [-1.55, 1.68, 1.5], [0.15, 1.52, -1.4], 54],
      [13.67, [-1.45, 1.66, 1.35], [0.15, 1.52, -1.42], 50],
      [13.7, [-0.25, 1.64, 1.6], [0.15, 1.52, -1.45], 46],
      [19.67, [-0.15, 1.62, 1.5], [0.15, 1.52, -1.45], 44],
      [19.7, [1.6, 1.72, 2.5], [0.15, 1.45, -1.0], 56],
      [25.97, [1.45, 1.7, 2.35], [0.15, 1.45, -1.05], 54],
      [26.0, [-0.85, 1.64, 2.15], [-2.25, 1.52, 0.1], 50],
      [29.77, [-0.8, 1.62, 2.05], [-2.25, 1.52, 0.1], 48],
      [29.8, [-0.15, 1.6, 1.45], [0.15, 1.5, -1.5], 44],
      [34.07, [-0.1, 1.58, 1.35], [0.15, 1.5, -1.52], 42],
      [34.1, [0.0, 1.56, 1.2], [0.15, 1.48, -1.55], 40],
      [39.9, [0.0, 1.56, 1.15], [0.15, 1.48, -1.55], 40],
    ],
  },
});
