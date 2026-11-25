import * as THREE from 'three';
import { Episode6OfficeApp } from '../../../../environments/episode6-office.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { LawyerApp } from '../../../../characters/character-lawyer.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import {
  applyOfficeGrade,
  clamp,
  createSceneDirector,
  easeOut,
  lerp,
  smooth,
} from '../../Episode5/sceneKit.js';

const E6_02 = 135;
const E6_03 = 272;
const SCENE_2_START = 125;

export const createOfficeScene = (renderer, size) => createSceneDirector(renderer, {
  ...size,
  environment: Episode6OfficeApp,
  grade: (scene, env) => {
    scene.background = new THREE.Color(0x1b2028);
    applyOfficeGrade(scene, env, 'scene1');
  },
  extra: (scene, { env }) => {
    env.addEpisode6Dressing();
    const legalPaper = env.anchors.legalAgreement;
    return { legalPaper, basePaperY: legalPaper ? legalPaper.position.y : 0.87 };
  },
  actors: [
    {
      name: 'lawyer',
      Class: LawyerApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [1.75, 0, -3.4],
      rotationY: 0.16,
    },
    {
      name: 'boss',
      Class: BossApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [0.15, 0, -1.6],
      rotationY: 0.06,
    },
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.3, 0, -2.6],
      rotationY: -0.1,
    },
  ],
  onFrame: ({ frame, scene, env, actors, extra }) => {
    const t = frame / 30;
    applyOfficeGrade(scene, env, frame < SCENE_2_START ? 'scene1' : 'scene2');

    if (extra.legalPaper) {
      const slam = easeOut(clamp(frame / 8, 0, 1));
      extra.legalPaper.position.y = lerp(extra.basePaperY + 0.45, extra.basePaperY, slam);
      extra.legalPaper.rotation.z = lerp(0.34, 0.18, slam);
    }

    const lawyer = actors.find((actor) => actor.name === 'lawyer');
    if (lawyer) {
      lawyer.rig.position.y = Math.sin(t * 2.1) * 0.01;
      if (lawyer.parts.head) {
        lawyer.parts.head.rotation.y = frame < 125 ? Math.sin(t * 3.5) * 0.05 : 0;
      }
    }

    const boss = actors.find((actor) => actor.name === 'boss');
    if (boss) {
      boss.rig.position.y = Math.sin(t * 1.9 + 1) * 0.01;
      if (boss.parts.head && frame >= E6_02 && frame <= 252) {
        boss.parts.head.rotation.y = Math.sin(t * 4.0) * 0.06;
      }
      if (boss.parts.rightArm && frame >= E6_02 && frame <= 252) {
        boss.parts.rightArm.rotation.x = -0.12 - smooth(clamp((frame - E6_02) / 40, 0, 1)) * 0.42;
      }
    }

    const coach = actors.find((actor) => actor.name === 'coach');
    if (coach) {
      coach.rig.visible = frame >= SCENE_2_START;
      coach.rig.position.y = Math.sin(t * 2.0 + 2) * 0.01;
      if (coach.parts.head && frame >= E6_03 && frame <= 353) {
        coach.parts.head.rotation.y = Math.sin(t * 4.2) * 0.06;
      }
    }
  },
  camera: {
    fov: 40,
    ease: smooth,
    keys: [
      [0, [1.0, 1.7, 1.8], [0.78, 0.9, -0.18], 48],
      [1.5, [0.9, 1.65, 1.5], [0.78, 0.9, -0.18], 46],
      [1.5, [1.9, 1.62, 0.2], [1.75, 1.4, -3.4], 44],
      [4.1667, [1.75, 1.62, -0.2], [1.75, 1.4, -3.4], 42],
      [4.1667, [0.15, 1.62, 1.5], [0.15, 1.4, -1.6], 44],
      [8.6667, [0.05, 1.62, 1.15], [0.15, 1.4, -1.6], 42],
      [8.6667, [-0.2, 1.7, 1.7], [-0.6, 1.45, -2.2], 46],
      [12.1667, [-0.35, 1.7, 1.4], [-0.6, 1.45, -2.2], 44],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 11.3) * 0.016 * k;
    camera.position.y += Math.cos(frame * 8.7) * 0.012 * k;
  },
});
