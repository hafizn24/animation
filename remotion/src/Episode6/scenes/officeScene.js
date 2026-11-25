import * as THREE from 'three';
import { Episode6OfficeApp } from '../../../../environments/episode6-office.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { LawyerApp } from '../../../../characters/character-lawyer.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { mountRig } from './mountRig.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);

/**
 * Scene 1 & 2 (frames 0-364): Episode6OfficeApp with Lawyer, Boss, and Coach.
 * Opens bright on frame 0 with legal paper slam onto the desk (frames 0-8).
 */
export async function createOfficeScene({ width, height }) {
  const env = new Episode6OfficeApp(null);
  env.createScene();
  await env.init();
  env.scene.background = new THREE.Color(0x1b2028);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

  const lawyer = await mountRig(env.scene, LawyerApp, 'navyOwner', { x: 0.95, z: -0.95, rotY: -0.45 });
  const boss = await mountRig(env.scene, BossApp, 'navyOwner', { x: -0.95, z: 0.95, rotY: 2.65 });
  const coach = await mountRig(env.scene, SoccerCoachOutfitApp, 'navyCoach', { x: -1.85, z: 0.35, rotY: 1.9 });

  const legalPaper = env.anchors?.legalAgreement;
  const basePaperY = legalPaper ? legalPaper.position.y : 0.87;

  return {
    scene: env.scene,
    camera,
    renderer,
    update(frame) {
      const t = frame / 30;

      // Legal document slam on frames 0-8
      if (legalPaper) {
        const slamT = clamp01(frame / 8);
        legalPaper.position.y = basePaperY + (1 - easeOut(slamT)) * 0.45;
      }

      // Subtle idle breathing & speaking cues
      if (lawyer?.character) {
        lawyer.character.position.y = Math.sin(t * 2.1) * 0.01;
        if (frame < 125) {
          lawyer.character.rotation.y = -0.45 + Math.sin(t * 3.5) * 0.05;
        }
      }
      if (boss?.character) {
        boss.character.position.y = Math.sin(t * 1.9 + 1) * 0.01;
        if (frame >= 135 && frame <= 252) {
          boss.character.rotation.y = 2.65 + Math.sin(t * 4.0) * 0.06;
        }
      }
      if (coach?.character) {
        coach.character.visible = frame >= 125;
        coach.character.position.y = Math.sin(t * 2.0 + 2) * 0.01;
        if (frame >= 272 && frame <= 353) {
          coach.character.rotation.y = 1.9 + Math.sin(t * 4.2) * 0.06;
        }
      }

      // Camera choreography (9:16 vertical, never static > 2x)
      if (frame < 45) {
        // Tight on desk & legal paper slam, pushing in
        const p = easeOut(frame / 45);
        camera.position.set(0.65 - p * 0.15, 1.38 - p * 0.08, 0.75 - p * 0.25);
        camera.lookAt(0.75, 0.92, -0.2);
      } else if (frame < 125) {
        // Cut to Lawyer across the desk
        const p = easeOut((frame - 45) / 80);
        camera.position.set(-0.35 + p * 0.2, 1.58, 1.35 - p * 0.25);
        camera.lookAt(0.85, 1.45, -0.85);
      } else if (frame < 260) {
        // Scene 2: Boss looking at ledger
        const p = easeOut((frame - 125) / 135);
        camera.position.set(0.55 - p * 0.2, 1.65, -0.55 + p * 0.15);
        camera.lookAt(-0.85, 1.38, 0.75);
      } else {
        // Scene 2: Coach & Boss two-shot
        const p = easeOut((frame - 260) / 105);
        camera.position.set(0.95 - p * 0.25, 1.62, -0.65);
        camera.lookAt(-1.25, 1.42, 0.65);
      }
    },
    dispose() {
      renderer.dispose();
    },
  };
}
