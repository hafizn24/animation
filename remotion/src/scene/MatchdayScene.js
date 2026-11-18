import * as THREE from 'three';
import { StadiumApp } from '../../../environments/stadium.js';
import { SoccerOutfitApp } from '../../../characters/character-soccer.js';
import { SoccerCoachOutfitApp } from '../../../characters/character-coach.js';
import { SuitOutfitApp } from '../../../characters/character-suit.js';
import { ChairmanApp } from '../../../characters/character-chairman.js';
import { NewOwnerApp } from '../../../characters/character-new-owner.js';
import { createBallTexture, createRandom, createSkyTexture } from './textures.js';

/**
 * Matchday – the same cinematic football sequence, but built from the assets
 * that already live in this repository:
 *
 *   environments/stadium.js   Buluh FC (pitch, stands, clubhouse, floodlights)
 *   characters/               the squad, the bench and the directors
 *
 * The characters are used as they are – same toon materials, same back-side
 * outline meshes – just scaled down to human scale and posed for the match.
 */

export const FPS = 30;
export const DURATION = 300;
export const SHOT_LENGTH = 90;

// The stadium pitch is modelled in metres (64 x 100), the characters are not,
// so a squad gets scaled down to human size.
const PLAYER_SCALE = 0.64;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const samplePath = (keys, t) => {
  if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, z0] = keys[i];
    const [t1, x1, z1] = keys[i + 1];
    if (t <= t1) {
      const k = smooth((t - t0) / Math.max(0.0001, t1 - t0));
      return { x: lerp(x0, x1, k), z: lerp(z0, z1, k) };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last[1], z: last[2] };
};

const sampleShot = (shot, local) => {
  const keys = shot.keys;
  if (local <= keys[0][0]) return { pos: keys[0][1], target: keys[0][2], fov: keys[0][3] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, a0, f0] = keys[i];
    const [t1, p1, a1, f1] = keys[i + 1];
    if (local <= t1) {
      const raw = (local - t0) / Math.max(0.0001, t1 - t0);
      const k = shot.ease ? shot.ease(raw) : smooth(raw);
      return {
        pos: [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)],
        target: [lerp(a0[0], a1[0], k), lerp(a0[1], a1[1], k), lerp(a0[2], a1[2], k)],
        fov: lerp(f0, f1, k),
      };
    }
  }
  const last = keys[keys.length - 1];
  return { pos: last[1], target: last[2], fov: last[3] };
};

// ---------------------------------------------------------------------------
// The ball
// ---------------------------------------------------------------------------
const BALL_KEYS = [
  [0.00, 15.0, -10.0, 0.11],
  [1.40, 14.0, -1.0, 0.11],
  [1.80, 13.5, 1.5, 0.55],
  [2.10, 3.6, 5.2, 0.35],
  [2.80, 2.9, 6.8, 0.12],
  [3.15, 2.4, 7.6, 0.45],
  [9.20, 0.7, 48.0, 1.80],
  [10.00, 0.5, 50.6, 1.10],
];

const ballPosition = (t) => {
  for (let i = 0; i < BALL_KEYS.length - 1; i++) {
    const [t0, x0, z0, y0] = BALL_KEYS[i];
    const [t1, x1, z1, y1] = BALL_KEYS[i + 1];
    if (t <= t1) {
      const raw = (t - t0) / Math.max(0.0001, t1 - t0);
      const isFlight = t0 >= 3.15 && t1 <= 9.2;
      const k = isFlight ? raw : smooth(raw);
      let y = lerp(y0, y1, k);
      if (isFlight) y += Math.sin(Math.PI * raw) * 7.4;
      return { x: lerp(x0, x1, k), y, z: lerp(z0, z1, k) };
    }
  }
  const last = BALL_KEYS[BALL_KEYS.length - 1];
  return { x: last[1], y: last[3], z: last[2] };
};

// ---------------------------------------------------------------------------
// The cast on the pitch
// ---------------------------------------------------------------------------
const HOME = 'soccerRedWhite';
const AWAY = 'awayBlueWhite';

const SQUAD = [
  // --- Buluh FC (home) ---
  { role: 'carrier', outfit: HOME, path: [[0, 15, -10], [1.5, 14, -1.5], [4, 11, 9], [10, 9.5, 15]] },
  { role: 'striker', outfit: HOME, path: [[0, 4.2, -3], [1.8, 3.4, 4.6], [3.0, 2.4, 7.4], [6, 1.4, 13], [10, 1.0, 17]] },
  { role: 'left', outfit: HOME, path: [[0, -10, -12], [3, -13, -2], [7, -15, 10], [10, -16, 16]] },
  { role: 'central', outfit: HOME, path: [[0, -2, -14], [3, -1, -4], [7, 0, 6], [10, 0.5, 10]] },
  { role: 'rightback', outfit: HOME, path: [[0, 14, -22], [4, 13, -12], [8, 12, -2], [10, 12, 3]] },
  { role: 'holding', outfit: HOME, path: [[0, -18, -10], [4, -17, -2], [8, -16, 7], [10, -16, 11]] },

  // --- Visitors (away) ---
  { role: 'chaser', outfit: AWAY, path: [[0, 8, -2], [2, 6, 0], [5, 4, 3], [10, 2.6, 8]] },
  { role: 'cover', outfit: AWAY, path: [[0, -1, 0], [3, 0, 3], [7, 0.5, 8], [10, 1, 12]] },
  { role: 'presser', outfit: AWAY, path: [[0, 17, -8], [1.6, 16, -4], [4, 15, 2], [10, 13, 9]] },
  { role: 'sweeper', outfit: AWAY, path: [[0, 0.5, 16], [4, 0.2, 20], [8, -0.6, 26], [10, -1.2, 30]] },
  { role: 'wide', outfit: AWAY, path: [[0, -16, 4], [5, -15, 12], [10, -14, 20]] },
];

const KEEPER = { role: 'keeper', outfit: AWAY, path: [[0, 0, 47.5], [6, 0.3, 47.4], [9, -0.6, 47.2], [10, -1.8, 47]] };

// ---------------------------------------------------------------------------
// Camera – one hard cut every three seconds
// ---------------------------------------------------------------------------
const SHOTS = [
  {
    name: 'Touchline tracker',
    shake: 0.035,
    ease: easeOut,
    keys: [
      [0.0, [10.8, 1.55, -17.5], [15.0, 0.6, -10.0], 44],
      [1.5, [10.2, 1.35, -8.5], [14.0, 0.6, -1.5], 40],
      [2.6, [9.8, 1.15, -2.0], [3.4, 0.8, 5.4], 36],
      [3.0, [9.4, 1.10, 0.4], [2.4, 0.7, 7.0], 35],
    ],
  },
  {
    name: 'The strike',
    shake: 0.05,
    ease: (t) => t,
    keys: [
      [0.0, [6.5, 0.95, 11.6], [2.6, 0.60, 7.6], 34],
      [0.5, [5.7, 0.80, 10.2], [2.5, 0.60, 7.4], 32],
      [1.4, [5.1, 1.05, 9.0], [2.4, 1.30, 7.5], 32],
      [3.0, [4.6, 1.90, 8.4], [2.0, 6.50, 10.5], 34],
    ],
  },
  {
    name: 'Crane reveal',
    shake: 0.02,
    ease: smooth,
    keys: [
      [0.0, [20.0, 9.0, 4.0], [2.0, 8.0, 20.0], 46],
      [1.4, [16.0, 20.0, 17.0], [1.6, 8.0, 26.0], 44],
      [2.4, [12.0, 28.0, 29.0], [1.2, 5.5, 37.0], 42],
      [3.0, [9.5, 32.0, 37.0], [0.8, 2.6, 47.0], 40],
    ],
  },
  {
    name: 'The net',
    shake: 0.03,
    ease: smooth,
    keys: [
      [0.0, [8.0, 3.6, 38.0], [0.8, 2.0, 48.0], 42],
      [1.0, [4.4, 2.6, 43.0], [0.6, 1.7, 49.0], 36],
    ],
  },
];

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export function createMatchdayScene(renderer) {
  const container = document.createElement('div');

  // --- Buluh FC stadium, straight from environments/stadium.js ---
  const stadiumApp = new StadiumApp(container);
  stadiumApp.setupScene();
  stadiumApp.addLights();
  stadiumApp.createProceduralCharacter();
  const scene = stadiumApp.scene;

  // Dusk sky and floodlit haze instead of the daylight default
  scene.background = createSkyTexture();
  scene.fog = new THREE.Fog(0x18203a, 70, 210);

  // Re-grade the stadium lights for an evening kick off
  scene.traverse((child) => {
    if (!child.isLight) return;
    if (child.isAmbientLight) child.intensity = 0.55;
    if (child.isHemisphereLight) {
      child.intensity = 0.45;
      child.color.setHex(0x3d4c6b);
      child.groundColor.setHex(0x0f1a0c);
    }
    if (child.isDirectionalLight) {
      child.color.setHex(0xf4f7ff);
      child.intensity = 1.35;
      child.position.set(-28, 46, -18);
    }
  });

  // Warm rim light from behind the goal
  const rim = new THREE.DirectionalLight(0xffb877, 0.5);
  rim.position.set(14, 18, 46);
  scene.add(rim);

  // --- The crowd on the terrace ---
  addCrowd(scene);

  // --- The squad ---
  const makeRig = (Cls, outfit) => {
    const app = new Cls(container);
    app.setupScene();
    app.addLights();
    app.createProceduralCharacter();
    if (outfit) app.changeOutfit(outfit);
    const rig = app.character;
    rig.scale.setScalar(PLAYER_SCALE);
    scene.add(rig);
    return { rig, parts: app.characterParts, app };
  };

  const players = SQUAD.map((script) => {
    const built = makeRig(SoccerOutfitApp, script.outfit);
    return { ...built, script };
  });

  // The keeper wears his own green strip
  const keeper = makeRig(SoccerOutfitApp, AWAY);
  const keeperStrip = keeper.app.createStripedTexture(0x2fbf71, 0x16181c);
  keeper.app.materials.jerseyStriped.map = keeperStrip;
  keeper.app.materials.jerseyStriped.emissiveMap = keeperStrip;
  keeper.app.materials.jerseyStriped.needsUpdate = true;
  keeper.app.materials.jerseySolid.color.setHex(0x2fbf71);
  keeper.app.materials.shorts.color.setHex(0x16181c);
  keeper.app.materials.socks.color.setHex(0x2fbf71);
  keeper.app.materials.sockStripes.color.setHex(0x16181c);
  players.push({ ...keeper, script: KEEPER });

  // --- Bench and directors, straight from the character collection ---
  const coach = makeRig(SoccerCoachOutfitApp, 'navyCoach');
  coach.rig.position.set(11.5, 0, -51.5);
  coach.rig.rotation.y = 0.3;

  const referee = makeRig(SuitOutfitApp, 'navyExecutive');
  referee.rig.position.set(-1.5, 0, 14);
  referee.rig.rotation.y = Math.PI;

  const chairman = makeRig(ChairmanApp, 'boardroomGrey');
  chairman.rig.position.set(-21.5, 0, 50.5);
  chairman.rig.rotation.y = 0.5;

  const owner = makeRig(NewOwnerApp, 'navyOwner');
  owner.rig.position.set(-19.5, 0, 51);
  owner.rig.rotation.y = 0.3;

  // --- Ball ---
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 18),
    new THREE.MeshStandardMaterial({
      map: createBallTexture(),
      roughness: 0.45,
      metalness: 0.02,
    })
  );
  ball.castShadow = true;
  scene.add(ball);

  // Vertical delivery (720x1280) needs a much wider vertical FOV to keep the
  // same horizontal coverage as the original 16:9 shots.
  const VERTICAL_FOV_SCALE = 2.0;
  const camera = new THREE.PerspectiveCamera(40 * VERTICAL_FOV_SCALE, 720 / 1280, 0.1, 500);
  camera.position.set(20, 1.4, -16);

  const camTarget = new THREE.Vector3();
  const camPosition = new THREE.Vector3();
  let ballSpin = 0;

  /** Runs the character rig for a stride */
  const runCycle = (parts, phase, amount, kick = 0) => {
    if (!parts) return;
    const swing = Math.sin(phase) * 0.8 * amount;
    const swingB = Math.sin(phase + Math.PI) * 0.8 * amount;
    if (parts.leftLeg) parts.leftLeg.rotation.x = swing;
    if (parts.rightLeg) parts.rightLeg.rotation.x = swingB;
    if (parts.leftArm) parts.leftArm.rotation.x = swingB * 0.85;
    if (parts.rightArm) parts.rightArm.rotation.x = swing * 0.85;
    if (parts.leftArm) parts.leftArm.rotation.z = -0.32 - swingB * 0.05;
    if (parts.rightArm) parts.rightArm.rotation.z = 0.32 + swing * 0.05;
    if (parts.torso) parts.torso.rotation.x = 0.06 * amount;
    if (kick > 0 && parts.rightLeg) {
      parts.rightLeg.rotation.x = -kick * 1.55;
      parts.leftLeg.rotation.x = swing * 0.4;
      if (parts.rightArm) parts.rightArm.rotation.x = kick * 0.4;
      if (parts.torso) parts.torso.rotation.x = -kick * 0.2;
    }
  };

  const render = (frame) => {
    const t = frame / FPS;

    // --- ball ---
    const b = ballPosition(t);
    ball.position.set(b.x, b.y, b.z);
    ballSpin += (t > 3.15 && t < 9.2 ? 9 : 4.2) / 30;
    ball.rotation.x = ballSpin * 2.4;
    ball.rotation.y = ballSpin * 1.1;

    // --- players ---
    players.forEach((player) => {
      const pos = samplePath(player.script.path, t);
      player.rig.position.set(pos.x, 0, pos.z);

      const ahead = samplePath(player.script.path, Math.min(t + 0.35, 10));
      const dx = ahead.x - pos.x;
      const dz = ahead.z - pos.z;
      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        player.rig.rotation.y = Math.atan2(dx, dz);
      }

      const amount = clamp(Math.hypot(dx, dz) / 0.35, 0, 1);

      let kick = 0;
      if (player.script.role === 'striker') {
        if (t > 2.7 && t < 3.05) kick = (t - 2.7) / 0.35;
        else if (t >= 3.05 && t < 3.35) kick = 1 - (t - 3.05) / 0.3;
      }
      if (player.script.role === 'keeper') {
        kick = t > 8.7 ? clamp((t - 8.7) / 0.5, 0, 1) * 0.5 : 0;
      }

      runCycle(player.parts, t * 9 + player.script.path[0][1], amount, kick);

      // The keeper dives at the end
      if (player.script.role === 'keeper' && t > 8.9) {
        const dive = clamp((t - 8.9) / 0.8, 0, 1);
        player.rig.position.x -= dive * 1.6;
        player.rig.position.y = Math.sin(dive * Math.PI) * 0.45;
        player.rig.rotation.z = -dive * 0.85;
      }
    });

    // The bench and the directors react to the goal
    const celebrate = clamp((t - 9.15) / 0.85, 0, 1);
    if (celebrate > 0) {
      const bounce = Math.sin(celebrate * 27) * (1 - celebrate);
      coach.rig.position.y = bounce * 0.12;
      chairman.rig.position.y = bounce * 0.1;
      owner.rig.position.y = bounce * 0.1;
    }

    // --- camera ---
    const shotIndex = Math.min(SHOTS.length - 1, Math.floor(frame / SHOT_LENGTH));
    const local = (frame - shotIndex * SHOT_LENGTH) / FPS;
    const shot = SHOTS[shotIndex];
    const sampled = sampleShot(shot, local);

    camPosition.set(sampled.pos[0], sampled.pos[1], sampled.pos[2]);
    camTarget.set(sampled.target[0], sampled.target[1], sampled.target[2]);

    if (shot.shake) {
      const s = shot.shake;
      camPosition.x += Math.sin(t * 11.3) * s;
      camPosition.y += Math.sin(t * 8.7 + 1.3) * s * 0.7;
      camPosition.z += Math.sin(t * 6.1 + 2.1) * s;
      camTarget.x += Math.sin(t * 9.4 + 0.5) * s * 1.6;
      camTarget.y += Math.sin(t * 7.2 + 1.7) * s * 1.2;
    }

    // Impact shake when the ball hits the net
    if (t > 9.15 && t < 9.65) {
      const k = (t - 9.15) / 0.5;
      camPosition.x += Math.sin(t * 62) * 0.14 * (1 - k);
      camPosition.y += Math.cos(t * 57) * 0.1 * (1 - k);
    }

    camera.position.copy(camPosition);
    camera.lookAt(camTarget);
    if (Math.abs(camera.fov - sampled.fov) > 0.01) {
      camera.fov = sampled.fov * VERTICAL_FOV_SCALE;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
  };

  return { render, scene, camera, shots: SHOTS };
}

/**
 * Fills the grandstand terrace with a crowd.
 * The terrace steps in environments/stadium.js sit at y 3.0 - 3.75, z 54 - 56.4.
 */
function addCrowd(scene) {
  const standZ = 55.5;
  const random = createRandom(90210);
  const colors = [0x8a2f2f, 0x27456f, 0x2f5a3a, 0xd8d4cc, 0x3b3f47, 0xb08a3a, 0x6b3a6b, 0x1f1f24];

  const rows = 4;
  const perRow = 44;
  const count = rows * perRow;

  const crowd = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.44, 0.68, 0.36),
    new THREE.MeshStandardMaterial({ roughness: 0.92 }),
    count
  );
  crowd.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  crowd.castShadow = false;
  crowd.receiveShadow = false;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      const x = -17.4 + c * 0.8 + random() * 0.1;
      const y = 3.0 + r * 0.25 + 0.5;
      const z = standZ - 1.5 + r * 0.8 - 0.1;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.85 + random() * 0.3);
      dummy.rotation.y = (random() - 0.5) * 0.5;
      dummy.updateMatrix();
      crowd.setMatrixAt(i, dummy.matrix);
      color.setHex(colors[Math.floor(random() * colors.length)]);
      crowd.setColorAt(i, color);
      i++;
    }
  }
  crowd.instanceMatrix.needsUpdate = true;
  if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;

  scene.add(crowd);
}
