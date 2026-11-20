import * as THREE from 'three';
import { createBallTexture, createSkyTexture, createRandom } from '../scene/textures.js';
import { clamp, forEachLight, smooth } from '../Episode1/sceneKit.js';

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

/** Lightweight InstancedMesh crowd with a deterministic sine-wave jump. */
export function createCrowd(scene, { count = 120, startX = -30, endX = 30, z = -54.5 } = {}) {
  const geometry = new THREE.CapsuleGeometry(0.17, 0.5, 4, 6);
  const material = new THREE.MeshBasicMaterial({ color: 0x111725 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
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
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const update = (frame, intensity = 1) => {
    const t = frame / 30;
    seeds.forEach((seed, i) => {
      const wave = Math.max(0, Math.sin(t * 6.4 + seed.phase));
      const bounce = wave * wave * 0.75 * intensity;
      dummy.position.set(seed.x, 0.62 * seed.scale + bounce, seed.z);
      dummy.scale.setScalar(seed.scale);
      dummy.rotation.y = Math.sin(seed.phase) * 0.3;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0, 0);
  return { mesh, update };
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
