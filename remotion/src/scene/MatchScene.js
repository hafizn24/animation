import * as THREE from 'three';
import { buildPlayer, posePlayer } from './player.js';
import { buildStadium, PITCH } from './stadium.js';
import { createBallTexture, createSkyTexture } from './textures.js';

export const FPS = 30;
export const DURATION = 300;          // 10 seconds
export const SHOT_LENGTH = 90;         // one cut every 3 seconds

const KITS = {
  home: { shirt: 0xd23b2e, trim: 0xf4f1e4, shorts: 0xf4f1e4, socks: 0xd23b2e, skin: 0xe8b48c },
  away: { shirt: 0x1f3f7a, trim: 0xf4f1e4, shorts: 0x1f3f7a, socks: 0x1f3f7a, skin: 0xc99468 },
  keeper: { shirt: 0x2fbf71, trim: 0x101318, shorts: 0x101318, socks: 0x2fbf71, skin: 0xe8b48c },
};

// ---------------------------------------------------------------------------
// Small maths helpers (deterministic - no Math.random in renders)
// ---------------------------------------------------------------------------
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
  if (local <= keys[0][0]) {
    const k = keys[0];
    return { pos: k[1], target: k[2], fov: k[3] };
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, t0v, f0] = keys[i];
    const [t1, p1, t1v, f1] = keys[i + 1];
    if (local <= t1) {
      const raw = (local - t0) / Math.max(0.0001, t1 - t0);
      const k = shot.ease ? shot.ease(raw) : smooth(raw);
      return {
        pos: [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)],
        target: [lerp(t0v[0], t1v[0], k), lerp(t0v[1], t1v[1], k), lerp(t0v[2], t1v[2], k)],
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
  [0.00, 11.2, -27.0, 0.11],
  [1.40, 11.0, -17.2, 0.11],
  [1.70, 10.4, -15.6, 0.55],
  [2.05, 2.6, -13.0, 0.34],
  [2.45, 1.6, -12.4, 0.12],
  [2.80, 1.2, -12.0, 0.12],
  [3.15, 1.0, -11.7, 0.42],
  [9.20, 0.45, 41.5, 1.70],
  [10.00, 0.30, 42.1, 1.05],
];

const ballPosition = (t) => {
  for (let i = 0; i < BALL_KEYS.length - 1; i++) {
    const [t0, x0, z0, y0] = BALL_KEYS[i];
    const [t1, x1, z1, y1] = BALL_KEYS[i + 1];
    if (t <= t1) {
      const raw = (t - t0) / Math.max(0.0001, t1 - t0);
      // Flight between the strike and the net arcs up and drops back down
      const isFlight = t0 >= 3.15 && t1 <= 9.2;
      const k = isFlight ? raw : smooth(raw);
      const x = lerp(x0, x1, k);
      const z = lerp(z0, z1, k);
      let y = lerp(y0, y1, k);
      if (isFlight) y += Math.sin(Math.PI * raw) * 6.2;
      return { x, y, z };
    }
  }
  const last = BALL_KEYS[BALL_KEYS.length - 1];
  return { x: last[1], y: last[3], z: last[2] };
};

// ---------------------------------------------------------------------------
// Player scripts - [time, x, z]
// ---------------------------------------------------------------------------
const PLAYER_SCRIPTS = [
  { kit: 'home', num: 9, name: 'Carrier', path: [[0, 11.2, -27], [1.5, 11.0, -17.4], [4, 8.6, -6.5], [10, 7.4, -1.5]] },
  { kit: 'home', num: 10, name: 'Striker', path: [[0, 3.0, -20.5], [1.6, 2.6, -15.5], [2.9, 1.2, -12.1], [6, 0.9, -6.5], [10, 0.6, -2.0]] },
  { kit: 'home', num: 7, name: 'Left run', path: [[0, -14, -25], [3, -16, -12], [6.5, -17, 3], [10, -17, 9]] },
  { kit: 'home', num: 4, name: 'Central', path: [[0, -5, -21], [3, -4, -11], [7, -3.5, -1], [10, -3, 4]] },
  { kit: 'home', num: 1, name: 'Right back', path: [[0, 9.5, -31], [4, 8.5, -20], [8, 8, -9], [10, 8, -4]] },
  { kit: 'home', num: 6, name: 'Holding', path: [[0, -21, -19], [4, -19, -11], [8, -17, -3], [10, -16, 1]] },

  { kit: 'away', num: 4, name: 'Chaser', path: [[0, 6.5, -13], [2, 5.2, -13.5], [5, 3.6, -10], [10, 2.4, -3]] },
  { kit: 'away', num: 5, name: 'Cover', path: [[0, -3.5, -10], [3, -2.6, -12.5], [7, -1.6, -8], [10, -1.2, -3]] },
  { kit: 'away', num: 2, name: 'Presser', path: [[0, 13.5, -22], [1.6, 13.0, -19], [4, 12.0, -14], [10, 11, -8]] },
  { kit: 'away', num: 1, name: 'Sweeper', path: [[0, 0.5, 4], [4, 0.2, 6], [8, -0.4, 9], [10, -1, 11]] },
  { kit: 'away', num: 6, name: 'Wide', path: [[0, -18, -6], [5, -16, -2], [10, -15, 2]] },
];

const KEEPER = { kit: 'keeper', num: 1, name: 'Keeper', path: [[0, 0, 37.6], [6, 0.2, 37.4], [9.0, -0.6, 37.2], [10, -1.6, 37.0]] };

// ---------------------------------------------------------------------------
// Camera shots - one cut every three seconds
// ---------------------------------------------------------------------------
const SHOTS = [
  {
    name: 'Touchline tracker',
    shake: 0.035,
    ease: easeOut,
    keys: [
      [0.0, [18.0, 1.45, -34.0], [11.2, 0.5, -26.5], 44],
      [1.5, [15.2, 1.25, -26.5], [11.0, 0.5, -17.5], 40],
      [2.6, [13.4, 1.05, -21.5], [3.0, 0.7, -13.2], 36],
      [3.0, [12.6, 1.00, -19.6], [1.4, 0.6, -12.5], 35],
    ],
  },
  {
    name: 'The strike',
    shake: 0.05,
    ease: (t) => t,
    keys: [
      [0.0, [5.0, 0.80, -16.8], [1.2, 0.9, -12.4], 36],
      [0.5, [4.2, 0.62, -14.6], [1.1, 0.7, -12.0], 33],
      [1.4, [3.6, 0.85, -13.2], [1.1, 1.5, -11.4], 32],
      [3.0, [3.2, 1.60, -11.6], [0.9, 6.4, -5.6], 34],
    ],
  },
  {
    name: 'Crane reveal',
    shake: 0.02,
    ease: smooth,
    keys: [
      [0.0, [16.0, 4.5, -20.0], [0.8, 6.6, 11.0], 48],
      [1.4, [14.0, 14.0, -4.0], [0.7, 7.4, 16.0], 46],
      [2.4, [11.0, 22.0, 14.0], [0.6, 5.6, 29.0], 44],
      [3.0, [8.5, 25.0, 24.0], [0.5, 2.4, 37.0], 42],
    ],
  },
  {
    name: 'The net',
    shake: 0.03,
    ease: smooth,
    keys: [
      [0.0, [6.0, 3.4, 29.0], [0.4, 1.9, 40.0], 42],
      [1.0, [3.2, 2.4, 34.0], [0.3, 1.6, 41.0], 36],
    ],
  },
];

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export function createMatchScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = createSkyTexture();
  scene.fog = new THREE.Fog(0x161d30, 55, 165);

  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 400);
  camera.position.set(15, 1, -30);

  // --- lights ---
  scene.add(new THREE.AmbientLight(0x8fa3c6, 0.42));

  const hemi = new THREE.HemisphereLight(0x3d4c6b, 0x101a0d, 0.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2dc, 1.9);
  key.position.set(-22, 34, -14);
  key.castShadow = true;
  key.shadow.mapSize.width = 2048;
  key.shadow.mapSize.height = 2048;
  key.shadow.camera.left = -45;
  key.shadow.camera.right = 45;
  key.shadow.camera.top = 55;
  key.shadow.camera.bottom = -55;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 120;
  key.shadow.bias = -0.0006;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8fb4ff, 0.75);
  rim.position.set(18, 16, 40);
  scene.add(rim);

  // --- stadium ---
  const stadium = buildStadium();
  scene.add(stadium);

  // --- ball ---
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

  // --- players ---
  const players = PLAYER_SCRIPTS.map((script) => {
    const built = buildPlayer({ ...KITS[script.kit], number: script.num });
    scene.add(built.group);
    return { ...built, script };
  });

  const keeper = buildPlayer({ ...KITS.keeper, number: 1 });
  scene.add(keeper.group);
  players.push({ ...keeper, script: KEEPER });

  const camTarget = new THREE.Vector3();
  const camPosition = new THREE.Vector3();

  let ballSpin = 0;

  const render = (frame) => {
    const t = frame / FPS;

    // --- ball ---
    const b = ballPosition(t);
    ball.position.set(b.x, b.y, b.z);
    const speed = t > 3.15 && t < 9.2 ? 9 : 4.2;
    ballSpin += speed / 30;
    ball.rotation.x = ballSpin * 2.4;
    ball.rotation.y = ballSpin * 1.1;

    // --- players ---
    players.forEach((player) => {
      const pos = samplePath(player.script.path, t);
      player.group.position.set(pos.x, 0, pos.z);

      // Face the direction of travel
      const ahead = samplePath(player.script.path, Math.min(t + 0.35, 10));
      const dx = ahead.x - pos.x;
      const dz = ahead.z - pos.z;
      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        const targetAngle = Math.atan2(dx, dz);
        player.group.rotation.y = targetAngle;
      }

      const moved = Math.hypot(dx, dz);
      const running = clamp(moved / 0.35, 0, 1);

      // The striker winds up and hits the ball
      let kick = 0;
      if (player.script.name === 'Striker') {
        if (t > 2.7 && t < 3.05) kick = (t - 2.7) / 0.35;
        else if (t >= 3.05 && t < 3.35) kick = 1 - (t - 3.05) / 0.3;
      }
      if (player.script.name === 'Keeper' && t > 8.6) {
        kick = clamp((t - 8.6) / 0.5, 0, 1) * 0.6;
      }

      const phase = t * 9 + player.script.num;
      posePlayer(player, phase, running, kick);

      // The keeper dives at the end
      if (player.script.name === 'Keeper' && t > 8.9) {
        const dive = clamp((t - 8.9) / 0.8, 0, 1);
        player.group.position.x -= dive * 1.6;
        player.group.position.y = Math.sin(dive * Math.PI) * 0.5;
        player.group.rotation.z = -dive * 0.9;
      }
    });

    // --- camera ---
    const shotIndex = Math.min(SHOTS.length - 1, Math.floor(frame / SHOT_LENGTH));
    const local = (frame - shotIndex * SHOT_LENGTH) / FPS;
    const shot = SHOTS[shotIndex];
    const sampled = sampleShot(shot, local);

    camPosition.set(sampled.pos[0], sampled.pos[1], sampled.pos[2]);
    camTarget.set(sampled.target[0], sampled.target[1], sampled.target[2]);

    // Handheld drift
    if (shot.shake) {
      const s = shot.shake;
      camPosition.x += Math.sin(t * 11.3) * s;
      camPosition.y += Math.sin(t * 8.7 + 1.3) * s * 0.7;
      camPosition.z += Math.sin(t * 6.1 + 2.1) * s;
      camTarget.x += Math.sin(t * 9.4 + 0.5) * s * 1.6;
      camTarget.y += Math.sin(t * 7.2 + 1.7) * s * 1.2;
    }

    camera.position.copy(camPosition);
    camera.lookAt(camTarget);
    if (Math.abs(camera.fov - sampled.fov) > 0.01) {
      camera.fov = sampled.fov;
      camera.updateProjectionMatrix();
    }

    // --- the crowd goes up when the ball hits the net ---
    const standNorth = stadium.getObjectByName('StandNorth');
    const standWest = stadium.getObjectByName('StandWest');
    if (standNorth && standWest) {
      const excite = clamp((t - 9.15) / 0.85, 0, 1);
      const bounce = Math.sin(excite * 27) * (1 - excite) * 0.14;
      standNorth.position.y = bounce;
      standWest.position.y = bounce * 0.6;
    }

    // --- impact shake ---
    if (t > 9.15 && t < 9.65) {
      const k = (t - 9.15) / 0.5;
      camPosition.x += Math.sin(t * 62) * 0.14 * (1 - k);
      camPosition.y += Math.cos(t * 57) * 0.1 * (1 - k);
    }

    // --- net ripple after the goal ---
    const goalNet = stadium.getObjectByName('Goal_North');
    if (goalNet) {
      const impact = clamp((t - 9.2) / 0.8, 0, 1);
      if (impact > 0) {
        const wobble = Math.sin(impact * 22) * (1 - impact) * 0.22;
        goalNet.children.forEach((child, i) => {
          if (i === 2) {
            child.position.z = PITCH.halfLength + 2.6 + wobble * 0.4;
            child.position.x = wobble * 0.5;
          }
        });
      }
    }

    renderer.render(scene, camera);
  };

  return { render, scene, camera, shots: SHOTS };
}
