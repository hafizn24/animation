import * as THREE from 'three';
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

/**
 * Pre-season training props: two orange cone drill lanes, footballs and a
 * water crate by the coach's spot. Built from the stadium's own material
 * helpers so the toon look matches, and disposed cleanly on teardown.
 */
function createTrainingProps(env) {
  const group = new THREE.Group();
  group.name = 'Episode7TrainingProps';
  const geoms = [];

  const coneMat = env.createToonMaterial(0xf27d31);
  const ballMat = env.createStdMaterial(0xf5f5f0, { roughness: 0.6 });
  const seamMat = env.createStdMaterial(0x15171c, { roughness: 0.7 });
  const crateMat = env.createStdMaterial(0x3f6f4f, { roughness: 0.85 });
  const crateDarkMat = env.createStdMaterial(0x2c4f39, { roughness: 0.85 });
  const materials = [coneMat, ballMat, seamMat, crateMat, crateDarkMat];

  // 6 bright orange cones in two drill lanes.
  const coneGeom = new THREE.ConeGeometry(0.09, 0.28, 12);
  geoms.push(coneGeom);
  [-1.85, 1.9].forEach((x) => {
    [-2.4, -1.2, 0.0].forEach((z) => {
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.set(x, 0.14, z);
      cone.castShadow = true;
      group.add(cone);
    });
  });

  // 3 footballs resting on the grass near the lanes.
  const ballGeom = new THREE.SphereGeometry(0.11, 18, 14);
  const seamGeom = new THREE.TorusGeometry(0.11, 0.012, 6, 18);
  geoms.push(ballGeom, seamGeom);
  [[-0.6, -1.8], [1.0, -2.3], [2.6, 0.9]].forEach(([x, z], index) => {
    const ball = new THREE.Mesh(ballGeom, ballMat);
    ball.position.set(x, 0.11, z);
    ball.castShadow = true;
    group.add(ball);
    const seam = new THREE.Mesh(seamGeom, seamMat);
    seam.rotation.x = Math.PI / 2 + (index - 1) * 0.4;
    seam.position.set(x, 0.11, z);
    group.add(seam);
  });

  // Water crate with two bottles by the coach's spot.
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.36), crateMat);
  crate.position.set(-3.35, 0.17, 1.7);
  crate.castShadow = true;
  crate.receiveShadow = true;
  group.add(crate);
  geoms.push(crate.geometry);
  const lidGeom = new THREE.BoxGeometry(0.54, 0.06, 0.38);
  geoms.push(lidGeom);
  const lid = new THREE.Mesh(lidGeom, crateDarkMat);
  lid.position.set(-3.35, 0.37, 1.7);
  group.add(lid);
  const bottleGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.24, 10);
  geoms.push(bottleGeom);
  [-0.12, 0.12].forEach((oz) => {
    const bottle = new THREE.Mesh(bottleGeom, ballMat);
    bottle.position.set(-3.35, 0.52, 1.7 + oz);
    bottle.castShadow = true;
    group.add(bottle);
  });

  return {
    group,
    dispose() {
      group.parent?.remove(group);
      geoms.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

/** Shared Buluh FC outfield rig: kit, no armband (captaincy is vacant). */
const playerSpec = (name, position, rotationY, pose = 'stride') => ({
  name,
  Class: SoccerOutfitApp,
  outfit: 'soccerRedWhite',
  scale: 0.95,
  position,
  rotationY,
  pose,
  setup: (app) => {
    app.setArmbandVisible(false);
    app.setBootsVisible(true);
  },
});

/** Scene 1 — Matchday Mindset. Global frames 0-148, hook cut on frame 45. */
export const createHookPitchScene = (renderer, size) => createStage(renderer, {
  ...size,
  environment: StadiumApp,
  extra: (scene, { env }) => {
    const props = createTrainingProps(env);
    scene.add(props.group);
    return { props };
  },
  dispose: ({ extra }) => extra.props?.dispose(),
  actors: [
    {
      // Shot 1A subject: full body, talk pose, live arm gesture on frame 0.
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.75, 0, 2.35],
      rotationY: 0.55,
      pose: 'talk',
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.9, 0, 0.15],
      rotationY: 0.15,
      setup: (app) => app.setArmbandVisible(false),
    },
    {
      name: 'rizal',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [1.7, 0, -0.9],
      rotationY: -0.5,
      pose: 'stride',
      setup: (app) => {
        app.setPlayerPrint('RIZAL', 10);
        app.setArmbandVisible(false);
      },
    },
    playerSpec('runnerA', [-0.4, 0, -1.6], 0.4),
    playerSpec('runnerB', [1.55, 0, -1.5], -0.7),
  ],
  onFrame: ({ frame, actors }) => {
    const t = frame / 30;

    const coach = actors.find((a) => a.name === 'coach');
    if (coach) {
      coach.rig.position.y = Math.sin(t * 2.0) * 0.012;
      if (coach.parts.head) coach.parts.head.rotation.y = Math.sin(t * 4.0) * 0.07;
      if (coach.parts.rightArm) {
        const shout = smooth(clamp(frame / 14, 0, 1)) *
          (1 - smooth(clamp((frame - 100) / 18, 0, 1)));
        coach.parts.rightArm.rotation.x = lerp(-0.42, -1.15, shout);
        coach.parts.rightArm.rotation.z = lerp(0.16, 0.42, shout);
      }
    }

    const azam = actors.find((a) => a.name === 'azam');
    if (azam) azam.rig.position.y = Math.sin(t * 2.2 + 0.8) * 0.012;
  },
  camera: {
    fov: 44,
    ease: smooth,
    keys: [
      // Shot 1A — OTS wide-medium over the coach's shoulder into the drill;
      // coach ~5 deg off-axis (fully inside frame, left third), cones and
      // footballs mid-frame, squad jogging behind.
      [0, [-3.6, 1.75, 5.2], [1.4, 1.2, -1.2], 44],
      [1.5, [-3.3, 1.7, 4.8], [1.4, 1.2, -1.2], 43],
      // Shot 1B — reverse angle on Azam #7 / Rizal #10 mid-drill.
      [1.5, [-2.6, 1.6, 0.6], [1.3, 1.25, -0.4], 44],
      [148 / 30, [-2.15, 1.55, 0.15], [1.35, 1.22, -0.45], 42],
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
  extra: (scene, { env }) => {
    const props = createTrainingProps(env);
    scene.add(props.group);
    return { props };
  },
  dispose: ({ extra }) => extra.props?.dispose(),
  actors: [
    {
      name: 'coach',
      Class: SoccerCoachOutfitApp,
      outfit: 'navyCoach',
      scale: 0.95,
      position: [-1.75, 0, 2.35],
      rotationY: 0.55,
      pose: 'talk',
    },
    {
      // Boss watches from the sideline technical area — off the drill grid,
      // just outside the centre-circle chalk, never in front of the squad.
      name: 'boss',
      Class: BossApp,
      outfit: 'navyOwner',
      scale: 0.95,
      position: [7.6, 0, 5.2],
      rotationY: -2.17,
    },
    {
      name: 'azam',
      Class: AzamApp,
      outfit: 'matchJersey',
      scale: 0.95,
      position: [0.9, 0, 0.15],
      rotationY: 0.15,
      setup: (app) => app.setArmbandVisible(false),
    },
    {
      name: 'rizal',
      Class: SoccerOutfitApp,
      outfit: 'soccerRedWhite',
      scale: 0.95,
      position: [0.4, 0, -1.0],
      rotationY: 0.41,
      pose: 'stride',
      setup: (app) => {
        app.setPlayerPrint('RIZAL', 10);
        app.setArmbandVisible(false);
      },
    },
    playerSpec('runnerA', [0.2, 0, -0.7], 0.3),
    playerSpec('runnerB', [-0.9, 0, -2.1], 0.6),
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
        coach.parts.rightArm.rotation.x = lerp(-0.42, -1.1, gesture);
        coach.parts.rightArm.rotation.z = lerp(0.16, 0.4, gesture);
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
      // S4 open — wide of the whole drill grid: coach plus every player
      // mid-stride between the cone lanes.
      [0, [2.6, 2.3, 8.6], [-1.0, 1.1, 0.6], 44],
      [3.3, [2.3, 2.2, 8.0], [-1.0, 1.1, 0.6], 43],
      // S4 cut — Boss on the sideline, pulled back so his chest clears the
      // bottom subtitle zone while the squad drills behind him.
      [3.3, [8.7, 1.78, 8.5], [7.6, 1.08, 5.2], 41],
      [8.5, [8.35, 1.72, 8.0], [7.6, 1.08, 5.2], 40],
      // S5 — brand-new heroic low-angle dolly push on Rizal #10 / Azam #7 /
      // the squad. Coach sits ~24 deg off-axis and Boss ~39 deg, both far
      // outside the ~13 deg half-horizontal FOV: no cropped sleeve on screen.
      [8.5, [-2.2, 0.85, 5.2], [1.0, 1.45, 0.2], 46],
      [436 / 30, [-1.8, 0.8, 4.3], [1.0, 1.45, 0.2], 44],
    ],
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 3 || frame >= 99) return;
    const k = 1 - frame / 3;
    camera.position.x += Math.sin(frame * 9.1) * 0.014 * k;
  },
});
