import * as THREE from 'three';
import { createBallTexture, createSkyTexture, createRandom } from '../scene/textures.js';
import { clamp, forEachLight, lerp, smooth } from '../Episode1/sceneKit.js';

export { clamp, lerp, smooth, sampleKeys, createSceneDirector, forEachLight } from '../Episode1/sceneKit.js';

const GOLD = 0xd8b26a;

/** Golden-hour sun + cool floodlights; reused by every Episode 3 pitch shot. */
export function applyGoldenHour(scene) {
  scene.background = createSkyTexture();
  scene.fog = new THREE.Fog(0x22243a, 60, 210);
  forEachLight(scene, (light) => {
    if (light.isAmbientLight) {
      light.intensity = 0.72;
      light.color.setHex(0xffd7a8);
    }
    if (light.isHemisphereLight) {
      light.intensity = 0.55;
      light.color.setHex(0x6b5a7a);
      light.groundColor?.setHex(0x1d2a1c);
    }
    if (light.isDirectionalLight) {
      light.intensity = 1.45;
      light.color.setHex(0xffb866);
      light.position.set(-40, 18, -22);
    }
  });

  const floodGroup = new THREE.Group();
  [[-24, 26], [24, 26], [-24, -26], [24, -26]].forEach(([x, z]) => {
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x2c3038, roughness: 0.6 })
    );
    mast.position.set(x, 6, z);
    floodGroup.add(mast);
    const lamp = new THREE.SpotLight(0xdce6ff, 2.6, 90, Math.PI / 5, 0.6, 1.2);
    lamp.position.set(x, 12, z);
    lamp.target.position.set(0, 0, 0);
    floodGroup.add(lamp, lamp.target);
  });
  scene.add(floodGroup);
  return { floodGroup };
}

/** Sideline ad-board with the Ep. 2 bakery name (continuity beat). */
export function addBakeryAdBoard(scene, { x = 4, z = -53, width = 9 } = {}) {
  const group = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(width, 1.1, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x193b2b, roughness: 0.6 })
  );
  board.position.y = 0.55;
  group.add(board);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#193b2b';
  ctx.fillRect(0, 0, 512, 64);
  ctx.strokeStyle = '#e8d9a8';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 52);
  ctx.fillStyle = '#f6e7bc';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KEK MAJU  •  BAKERY', 256, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.2, 0.95),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  face.position.set(0, 0.55, 0.07);
  group.add(face);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

/**
 * Deterministic phase-offset cheering arms. ~145° from the hanging rest pose,
 * so silhouettes read as raised fists instead of horizontal T-poles.
 */
export function cheerPose(frame, phase = 0, { raise = 2.55, pump = 0.16, speed = 5.2 } = {}) {
  const t = frame / 30;
  return {
    left: -(raise + pump * Math.sin(t * speed + phase)),
    right: raise + pump * Math.sin(t * speed + phase + 1.35),
    head: Math.sin(t * 2.4 + phase) * 0.12,
    breath: Math.sin(t * 1.8 + phase) * 0.02,
  };
}

/**
 * Deterministic kick cycle: wind-up -> strike contact -> follow-through.
 * `contactFrame` is the local frame of foot-to-ball contact for that goal.
 */
export function kickSwing(frame, contactFrame, { windup = 12, follow = 18 } = {}) {
  const wind = smooth(clamp((frame - (contactFrame - windup)) / windup, 0, 1));
  const strike = smooth(clamp((frame - contactFrame + 2) / 4, 0, 1));
  const recover = smooth(clamp((frame - contactFrame - 5) / follow, 0, 1));
  const swing = lerp(lerp(0.08, -1.18, wind), 1.12, strike);
  return {
    leg: lerp(swing, 0.42, recover),
    plant: lerp(-0.1, 0.34, wind) * (1 - 0.72 * strike),
    torso: lerp(lerp(-0.34, -0.06, wind), 0.36, strike) * (1 - 0.55 * recover),
    arm: lerp(-0.3, 0.62, strike) * (1 - 0.45 * recover),
  };
}

/** Lightweight InstancedMesh crowd with deterministic cheering arms + jump. */
export function createCrowd(scene, { count = 120, startX = -30, endX = 30, z = -54.5 } = {}) {
  const material = new THREE.MeshBasicMaterial({ color: 0x111725 });
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.5, 4, 6), material, count);
  const armGeom = new THREE.CapsuleGeometry(0.06, 0.36, 3, 6);
  armGeom.translate(0, -0.24, 0);
  const leftArms = new THREE.InstancedMesh(armGeom, material, count);
  const rightArms = new THREE.InstancedMesh(armGeom, material, count);
  const meshes = [body, leftArms, rightArms];
  meshes.forEach((mesh) => {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
  });

  const dummy = new THREE.Object3D();
  const rnd = createRandom(731);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    const row = i % 3;
    const col = Math.floor(i / 3);
    const cols = Math.ceil(count / 3);
    seeds.push({
      x: startX + (col / Math.max(1, cols - 1)) * (endX - startX) + (rnd() - 0.5) * 0.5,
      z: z - row * 1.1,
      phase: rnd() * Math.PI * 2,
      scale: 0.85 + rnd() * 0.35,
    });
  }

  const update = (frame, intensity = 1) => {
    const t = frame / 30;
    seeds.forEach((seed, i) => {
      const cheer = cheerPose(frame, seed.phase, { raise: 2.5, pump: 0.18, speed: 5.8 });
      const wave = Math.max(0, Math.sin(t * 6.4 + seed.phase));
      const bounce = wave * wave * 0.75 * intensity;
      const yaw = Math.sin(seed.phase) * 0.3;
      const shoulderY = 0.95 * seed.scale + bounce;

      dummy.position.set(seed.x, 0.62 * seed.scale + bounce, seed.z);
      dummy.scale.setScalar(seed.scale);
      dummy.rotation.set(0, yaw, Math.sin(t * 2 + seed.phase) * 0.05 * intensity);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      dummy.position.set(seed.x - 0.17 * seed.scale, shoulderY, seed.z);
      dummy.rotation.set(0, yaw, cheer.left * intensity);
      dummy.updateMatrix();
      leftArms.setMatrixAt(i, dummy.matrix);

      dummy.position.set(seed.x + 0.17 * seed.scale, shoulderY, seed.z);
      dummy.rotation.set(0, yaw, cheer.right * intensity);
      dummy.updateMatrix();
      rightArms.setMatrixAt(i, dummy.matrix);
    });
    meshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });
  };
  update(0, 0);
  return { mesh: body, meshes, update };
}

/** Ball plus a deterministic glowing motion trail (no frame history needed). */
export function createBallWithTrail(scene, { trailLength = 12 } = {}) {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 16),
    new THREE.MeshStandardMaterial({ map: createBallTexture(), roughness: 0.45 })
  );
  ball.castShadow = true;
  scene.add(ball);

  const trailGroup = new THREE.Group();
  const trail = [];
  for (let i = 0; i < trailLength; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: i < 3 ? 0xfff2c4 : GOLD,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2 - i * 0.011, 10, 8), material);
    trailGroup.add(dot);
    trail.push(dot);
  }
  scene.add(trailGroup);

  const update = (pathAt, frame, visible = true) => {
    ball.position.copy(pathAt(frame));
    ball.rotation.x = frame * 0.28;
    ball.rotation.z = frame * 0.16;
    ball.visible = visible;
    trailGroup.visible = visible;
    trail.forEach((dot, i) => {
      const lag = (i + 1) * 1.6;
      dot.position.copy(pathAt(frame - lag));
      dot.material.opacity = visible ? 0.5 * (1 - i / trailLength) ** 1.6 : 0;
    });
  };
  return { ball, trail, trailGroup, update };
}

/** Procedural net ripple: a wireframe grid whose vertices wobble after impact. */
export function createNetRipple(scene, { x = 0, y = 1.2, z = 50, width = 7.32, height = 2.44 } = {}) {
  const geometry = new THREE.PlaneGeometry(width, height, 18, 10);
  const base = geometry.attributes.position.array.slice();
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const update = (frame, impactFrame) => {
    const since = frame - impactFrame;
    if (since < 0 || since > 26) {
      material.opacity = 0;
      return;
    }
    const decay = 1 - since / 26;
    material.opacity = 0.72 * decay;
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = base[i * 3];
      const py = base[i * 3 + 1];
      const dist = Math.sqrt(px * px + py * py);
      const wobble = Math.sin(dist * 2.4 - since * 0.85) * 0.55 * decay;
      pos.setZ(i, wobble);
    }
    pos.needsUpdate = true;
  };
  return { mesh, update };
}

/** Deterministic 5-frame strike shake, driven by the audio-script event. */
export function cameraShake(frame, { frame: start, durationFrames = 5, amount = 14 } = {}) {
  if (!start || frame < start || frame >= start + durationFrames) return { x: 0, y: 0 };
  const k = 1 - (frame - start) / durationFrames;
  return {
    x: Math.sin(frame * 12.9898) * amount * k * 0.01,
    y: Math.cos(frame * 7.233) * amount * k * 0.007,
  };
}

/**
 * Returns a slowed local time (seconds) around foot-to-ball contact.
 * rate 0.3 over 12 frames ≈ a 0.3x slow-motion dip.
 */
export function slowMoTime(t, { frame: impactFrame, durationFrames = 12, rate = 0.3 } = {}) {
  if (!impactFrame) return t;
  const fps = 30;
  const start = impactFrame / fps;
  const end = (impactFrame + durationFrames) / fps;
  if (t < start) return t;
  if (t > end) return t + (end - start) * (1 / rate - 1);
  return start + (t - start) * rate;
}

export const easeOut = (v) => 1 - (1 - smooth(clamp(v, 0, 1))) ** 2;
