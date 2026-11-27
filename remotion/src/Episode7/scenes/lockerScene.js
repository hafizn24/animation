import * as THREE from 'three';
import { clamp, createStage, smooth } from '../../scene/stageKit.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import { createArmbandTexture } from '../../../../characters/core/kits.js';
import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { SoccerOutfitApp } from '../../../../characters/character-soccer.js';
import { AzamApp } from '../../../../characters/character-azam.js';

/**
 * Unworn captain's armband left on the locker bench — reinforces that the
 * captaincy stays vacant. Placed on the right bench so the reverse shot on
 * Azam catches it in the mid-ground without blocking anyone.
 */
function createBenchArmband(env) {
  const group = new THREE.Group();
  group.name = 'CaptainsArmbandProp';
  const geoms = [];

  const bandMat = env.createToonMaterial(0xd8b26a);
  const bandGeom = new THREE.BoxGeometry(0.24, 0.045, 0.1);
  geoms.push(bandGeom);
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.position.y = 0.022;
  band.castShadow = true;
  group.add(band);

  const letterPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshBasicMaterial({ map: createArmbandTexture('C') })
  );
  geoms.push(letterPlane.geometry);
  letterPlane.position.set(0, 0.062, 0.02);
  group.add(letterPlane);

  return {
    group,
    dispose() {
      group.parent?.remove(group);
      geoms.forEach((geometry) => geometry.dispose());
      bandMat.dispose();
      letterPlane.material.map?.dispose();
      letterPlane.material.dispose();
    },
  };
}

/**
 * Scene 3 — The Rumour. Global frames 457-749 (292 frames).
 * Shot A frames Rizal #10 head-to-toe with the Matchday 1 fixture notice
 * board fully inside frame behind him; shot B is the reverse on Azam #7 with
 * the unworn armband visible on the bench. Both sightlines pass clear of the
 * foreground treatment table.
 */
export const createRumourLockerScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene),
  extra: (scene, { env }) => {
    const armband = createBenchArmband(env);
    armband.group.position.set(3.0, 0.52, -3.45);
    armband.group.rotation.y = -0.66; // faces the reverse-shot camera
    scene.add(armband.group);
    return { armband };
  },
  dispose: ({ extra }) => extra.armband?.dispose(),
  actors: [
    {
      name: 'rizal',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [-3.4, 0, -1.6],
      rotationY: 1.0,
      setup: (app) => {
        app.setPlayerPrint('RIZAL', 10);
        app.setArmbandVisible(false);
      },
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.6, 0, 0.6],
      rotationY: -1.2,
      setup: (app) => app.setArmbandVisible(false),
    },
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;
    const e7_05From = 177; // local frame where Azam answers

    const rizal = actors.find((a) => a.name === 'rizal');
    if (rizal) {
      rizal.rig.position.y = Math.sin(t * 2.1) * 0.012;
      if (rizal.parts.head) {
        rizal.parts.head.rotation.y = frame < e7_05From - 22 ? Math.sin(t * 4.4) * 0.07 : 0;
      }
      if (rizal.parts.rightArm && frame < e7_05From - 22) {
        rizal.parts.rightArm.rotation.x = -0.1 - Math.sin(t * 3.2) * 0.12;
      }
    }

    const azam = actors.find((a) => a.name === 'azam');
    if (azam) {
      azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
      if (azam.parts.head && frame >= e7_05From) {
        azam.parts.head.rotation.y = Math.sin(t * 4.1) * 0.05;
      }
      if (azam.parts.rightArm && frame >= e7_05From && frame <= e7_05From + 80) {
        azam.parts.rightArm.rotation.x = -0.35 - smooth(clamp((frame - e7_05From) / 16, 0, 1)) * 0.25;
      }
    }
  },
  camera: {
    fov: 46,
    ease: smooth,
    keys: [
      // Shot A — Rizal #10 full stance with the fixture notice board
      // (PERLAWANAN 1 / BULUH FC v HARIMAU LEMBAH FC) fully inside frame.
      // Sightline passes ~1.8 units left of the treatment table.
      [0, [2.9, 1.78, 3.9], [-4.6, 1.35, -2.3], 46],
      [5.5, [2.4, 1.72, 3.3], [-4.6, 1.35, -2.3], 44],
      // Shot B — reverse on Azam #7, camera pushed forward past the
      // treatment table; the bench armband reads mid-right.
      [5.5, [-2.0, 1.7, 3.0], [0.6, 1.22, 0.6], 46],
      [292 / 30, [-1.7, 1.64, 2.7], [0.6, 1.22, 0.6], 44],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 10.7) * 0.014 * k;
  },
});
