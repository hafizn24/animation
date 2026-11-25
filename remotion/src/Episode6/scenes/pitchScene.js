import {
  clamp,
  createSceneDirector,
  lerp,
  smooth,
} from '../../Episode5/sceneKit.js';
import { StadiumApp } from '../../../../environments/stadium.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SquadVariationsApp } from '../../../../characters/character-squad.js';

const SCENE_3_FROM = 365;
const E6_04 = 375 - SCENE_3_FROM;
const E6_05 = 540 - SCENE_3_FROM;
const E6_06 = 612 - SCENE_3_FROM;
const SCENE_4_FROM = 635 - SCENE_3_FROM;
const SCENE_5_FROM = 760 - SCENE_3_FROM;

export const createPitchScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: StadiumApp,
  actors: [
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.6, 0, 2.4],
      rotationY: 0.5,
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.75, 0, 0.2],
      rotationY: 0.15,
    },
    {
      name: 'squad',
      Class: SquadVariationsApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [-0.4, 0, -0.4],
      rotationY: 0.05,
    },
    {
      name: 'boss',
      Class: BossApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [1.7, 0, 1.0],
      rotationY: -0.4,
    },
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;

    const coach = actors.find((actor) => actor.name === 'coach');
    if (coach) {
      coach.rig.position.y = Math.sin(t * 2.0) * 0.012;
      if (coach.parts.head) {
        coach.parts.head.rotation.y =
          frame >= E6_04 && frame <= 157 ? Math.sin(t * 4.0) * 0.08 : 0;
      }
    }

    const azam = actors.find((actor) => actor.name === 'azam');
    if (azam) {
      azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
      if (azam.parts.head) {
        azam.parts.head.rotation.y =
          frame >= E6_05 && frame <= 233 ? Math.sin(t * 4.5) * 0.07 : 0;
      }
    }

    const squad = actors.find((actor) => actor.name === 'squad');
    if (squad) squad.rig.position.y = Math.sin(t * 1.9 + 0.4) * 0.01;

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      boss.rig.visible = frame >= SCENE_4_FROM && frame < SCENE_5_FROM;
      boss.rig.position.y = Math.sin(t * 1.8 + 1.5) * 0.01;
    }

    if (coach?.parts.rightArm) {
      const gesture =
        smooth(clamp((frame - E6_04) / 12, 0, 1)) *
        (1 - smooth(clamp((frame - E6_04 - 120) / 18, 0, 1)));
      coach.parts.rightArm.rotation.x = lerp(-0.1, -0.85, gesture);
    }
    if (azam?.parts.rightArm && frame >= E6_06 && frame <= 268) {
      azam.parts.rightArm.rotation.x = -0.4;
    }
  },
  camera: {
    fov: 42,
    ease: smooth,
    keys: [
      [0, [1.6, 1.85, 6.4], [-0.5, 1.4, 0.8], 42],
      [5.6667, [1.2, 1.85, 5.8], [-0.4, 1.4, 0.8], 42],
      [5.6667, [1.35, 1.5, 4.6], [0.55, 1.4, 0.2], 42],
      [SCENE_4_FROM / 30, [1.15, 1.5, 4.2], [0.55, 1.4, 0.2], 42],
      [SCENE_4_FROM / 30, [2.6, 1.6, 4.5], [1.7, 1.4, 1.0], 42],
      [SCENE_5_FROM / 30, [2.2, 1.5, 4.3], [1.7, 1.4, 1.0], 42],
      [SCENE_5_FROM / 30, [1.5, 1.1, 4.4], [0.45, 1.35, 0.1], 40],
      [545 / 30, [1.2, 1.1, 4.0], [0.45, 1.35, 0.1], 40],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 3 || frame >= SCENE_4_FROM) return;
    const k = 1 - frame / 3;
    camera.position.x += Math.sin(frame * 9.1) * 0.014 * k;
  },
});
