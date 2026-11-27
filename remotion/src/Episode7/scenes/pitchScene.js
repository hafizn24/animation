import {
  clamp,
  createStage,
  lerp,
  smooth,
} from '../../scene/stageKit.js';
import { StadiumApp } from '../../../../environments/stadium.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { AzamApp } from '../../../../characters/character-azam.js';

/** Scene 1 — Matchday Mindset. Global frames 0-148, first cut on frame 50. */
export const createHookPitchScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: StadiumApp,
  actors: [
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.75, 0, 2.35],
      rotationY: 0.55,
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.9, 0, 0.15],
      rotationY: 0.15,
    },
    {
      name: 'runnerA',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [-1.0, 0, -0.7],
      rotationY: 0.4,
      pose: 'stride',
    },
    {
      name: 'runnerB',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [1.55, 0, -1.5],
      rotationY: -0.7,
      pose: 'stride',
    },
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;

    const coach = actors.find((a) => a.name === 'coach');
    if (coach) {
      coach.rig.position.y = Math.sin(t * 2.0) * 0.012;
      if (coach.parts.head) coach.parts.head.rotation.y = Math.sin(t * 4.0) * 0.07;
      if (coach.parts.rightArm) {
        const shout = smooth(clamp((frame - 8) / 14, 0, 1)) *
          (1 - smooth(clamp((frame - 96) / 18, 0, 1)));
        coach.parts.rightArm.rotation.x = lerp(-0.1, -0.95, shout);
        coach.parts.rightArm.rotation.z = lerp(0.28, 0.5, shout);
      }
    }

    const azam = actors.find((a) => a.name === 'azam');
    if (azam) azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      [0, [3.4, 2.0, 7.8], [-0.5, 1.3, 0.2], 46],
      [1.667, [2.7, 1.8, 6.6], [-0.7, 1.3, 0.6], 44],
      [1.667, [-3.0, 1.75, 5.6], [-1.7, 1.35, 2.3], 42],
      [148 / 30, [-2.5, 1.68, 4.9], [-1.7, 1.35, 2.35], 40],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 11.3) * 0.016 * k;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});

/** Scenes 4 & 5 — Like Matchday + The League. Global frames 749-1185. */
export const createTrainingPitchScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: StadiumApp,
  actors: [
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.75, 0, 2.35],
      rotationY: 0.55,
    },
    {
      name: 'boss',
      Class: BossApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [1.7, 0, 1.05],
      rotationY: -0.42,
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.9, 0, 0.15],
      rotationY: 0.15,
    },
    {
      name: 'runnerA',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [-1.0, 0, -0.7],
      rotationY: 0.4,
      pose: 'stride',
    },
    {
      name: 'runnerB',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [1.55, 0, -1.5],
      rotationY: -0.7,
      pose: 'stride',
    },
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;
    const e7_06End = 91;   // local frame where the coach stops talking
    const e7_07From = 113; // local frame where the boss starts talking
    const e7_07End = 251;
    const e7_08From = 273; // local frame where the league board takes over

    const coach = actors.find((a) => a.name === 'coach');
    if (coach) {
      coach.rig.position.y = Math.sin(t * 2.0) * 0.012;
      if (coach.parts.head) {
        coach.parts.head.rotation.y = frame <= e7_06End ? Math.sin(t * 4.0) * 0.07 : 0;
      }
      if (coach.parts.rightArm) {
        const gesture = smooth(clamp(frame / 12, 0, 1)) *
          (1 - smooth(clamp((frame - 70) / 16, 0, 1)));
        coach.parts.rightArm.rotation.x = lerp(-0.1, -0.9, gesture);
        coach.parts.rightArm.rotation.z = lerp(0.28, 0.5, gesture);
      }
    }

    const boss = actors.find((a) => a.name === 'boss');
    if (boss) {
      boss.rig.visible = frame < e7_08From;
      boss.rig.position.y = Math.sin(t * 1.8 + 1.5) * 0.01;
      if (boss.parts.head && frame >= e7_07From && frame <= e7_07End) {
        boss.parts.head.rotation.y = Math.sin(t * 4.2) * 0.06;
      }
      if (boss.parts.rightArm && frame >= e7_07From && frame <= e7_07End) {
        boss.parts.rightArm.rotation.x =
          -0.12 - smooth(clamp((frame - e7_07From) / 40, 0, 1)) * 0.42;
      }
    }

    const azam = actors.find((a) => a.name === 'azam');
    if (azam) azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      [0, [2.6, 1.8, 7.2], [-0.6, 1.3, 0.5], 44],
      [3.3, [2.0, 1.7, 6.0], [-1.1, 1.32, 1.4], 42],
      [3.3, [3.1, 1.7, 5.2], [1.7, 1.35, 1.05], 41],
      [8.5, [2.7, 1.62, 4.5], [1.7, 1.35, 1.05], 39],
      [8.5, [0.5, 1.6, 8.2], [-0.3, 1.25, -0.3], 47],
      [436 / 30, [0.2, 1.45, 7.0], [-0.3, 1.25, -0.3], 45],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 3 || frame >= 99) return;
    const k = 1 - frame / 3;
    camera.position.x += Math.sin(frame * 9.1) * 0.014 * k;
  },
});
