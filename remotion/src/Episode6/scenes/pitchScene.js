import * as THREE from 'three';
import { StadiumApp } from '../../../../environments/stadium.js';
import { BossApp } from '../../../../characters/character-boss.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SquadVariationsApp } from '../../../../characters/character-squad.js';
import { mountRig } from './mountRig.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);

/**
 * Scene 3, 4 & 5 (frames 365-909): StadiumApp pitch with Coach, Boss, Azam (#7),
 * and SquadVariationsApp. Karim is absent and no captain armband is rendered.
 */
export async function createPitchScene({ width, height }) {
  const env = new StadiumApp(null);
  env.createScene();
  await env.init();

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);

  const coach = await mountRig(env.scene, SoccerCoachOutfitApp, 'navyCoach', { x: 0, z: 2.8, rotY: Math.PI });
  const azam = await mountRig(env.scene, AzamApp, 'matchJersey', { x: 0.75, z: 0.2, rotY: 0.15 });
  const squad = await mountRig(env.scene, SquadVariationsApp, 'navyOwner', { x: -0.4, z: -0.4, rotY: 0.05 });
  const boss = await mountRig(env.scene, BossApp, 'navyOwner', { x: -3.2, z: 1.6, rotY: 1.1 });

  return {
    scene: env.scene,
    camera,
    renderer,
    update(frame) {
      const t = frame / 30;

      if (coach?.character) {
        coach.character.position.y = Math.sin(t * 2.0) * 0.012;
        if (frame >= 375 && frame <= 522) {
          coach.character.rotation.y = Math.PI + Math.sin(t * 4.0) * 0.08;
        }
      }
      if (azam?.character) {
        azam.character.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
        if (frame >= 540 && frame <= 598) {
          azam.character.rotation.y = 0.15 + Math.sin(t * 4.5) * 0.07;
        }
      }
      if (boss?.character) {
        boss.character.visible = frame >= 635;
        boss.character.position.y = Math.sin(t * 1.8 + 1.5) * 0.01;
      }
      if (squad?.character) {
        squad.character.position.y = Math.sin(t * 1.9 + 0.4) * 0.01;
      }

      if (frame < 535) {
        // Scene 3: Coach addressing squad
        const p = easeOut((frame - 365) / 170);
        camera.position.set(1.8 - p * 0.5, 1.85, 5.2 - p * 0.6);
        camera.lookAt(0.1, 1.3, 0.8);
      } else if (frame < 635) {
        // Scene 3: Azam #7 & Coach exchange
        const p = easeOut((frame - 535) / 100);
        camera.position.set(1.35 - p * 0.25, 1.45, 2.35 - p * 0.35);
        camera.lookAt(0.55, 1.35, 0.2);
      } else if (frame < 760) {
        // Scene 4: Wide-to-medium grass-level unity + push-in on Azam #7
        const p = easeOut((frame - 635) / 125);
        camera.position.set(-1.5 + p * 1.8, 0.85 + p * 0.45, 4.5 - p * 2.2);
        camera.lookAt(0.35, 1.25, 0.2);
      } else {
        // Scene 5: Dramatic low-angle hero hold on Azam #7 & squad
        const p = easeOut((frame - 760) / 150);
        camera.position.set(0.95 - p * 0.2, 1.05, 2.4 - p * 0.5);
        camera.lookAt(0.45, 1.35, 0.1);
      }
    },
    dispose() {
      renderer.dispose();
    },
  };
}
