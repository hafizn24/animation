import * as THREE from 'three';

export const CAMERA_LIMITS = {
  fov: [38, 42],
  lookAtY: [1.25, 1.45],
  clearance: 4.6,
};

const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value));

export function findActor(actors, id) {
  return actors.find((actor) => actor.id === id || actor.name === id || actor.userData?.id === id);
}

export function faceTarget(actor, point, { camera = true } = {}) {
  const object = actor?.object ?? actor;
  if (!object?.position) return;
  const dx = point.x - object.position.x;
  const dz = point.z - object.position.z;
  object.rotation.y = Math.atan2(dx, dz) + (camera ? 0.12 : 0);
}

export function faceEachOther(a, b) {
  const first = a?.object ?? a;
  const second = b?.object ?? b;
  if (!first?.position || !second?.position) return;
  faceTarget(first, second.position, { camera: false });
  faceTarget(second, first.position, { camera: false });
}

function positionOf(actor) {
  const object = actor?.object ?? actor;
  return object?.position ?? new THREE.Vector3();
}

export function getSpeakerThreeQuarterShot(speaker, listener) {
  const from = positionOf(speaker);
  const to = positionOf(listener);
  const side = from.x <= to.x ? -1 : 1;
  return {
    position: [from.x + side * 2.1, 1.42, from.z + 3.8],
    lookAt: [from.x, clamp(1.32, CAMERA_LIMITS.lookAtY), from.z],
  };
}

export function getOverTheShoulderShot(speaker, listener) {
  const from = positionOf(speaker);
  const to = positionOf(listener);
  const dx = from.x - to.x;
  const dz = from.z - to.z;
  const length = Math.hypot(dx, dz) || 1;
  return {
    position: [to.x + (dx / length) * 1.2, 1.5, to.z + (dz / length) * 1.2],
    lookAt: [from.x, clamp(1.32, CAMERA_LIMITS.lookAtY), from.z],
  };
}

export function getTwoShot(a, b) {
  const first = positionOf(a);
  const second = positionOf(b);
  const midX = (first.x + second.x) / 2;
  const midZ = (first.z + second.z) / 2;
  return {
    position: [midX, 1.6, midZ + 5.4],
    lookAt: [midX, clamp(1.34, CAMERA_LIMITS.lookAtY), midZ],
  };
}

export function sanitizeCamera(shot) {
  const lookAtY = clamp(Number(shot?.lookAt?.[1] ?? 1.32), CAMERA_LIMITS.lookAtY);
  const fov = clamp(Number(shot?.fov ?? 40), CAMERA_LIMITS.fov);
  const [x, , z] = shot?.position ?? [0, 1.5, 5];
  const target = shot?.lookAt ?? [0, lookAtY, 0];
  const distance = Math.hypot(x - target[0], z - target[2]);
  const scale = distance < CAMERA_LIMITS.clearance ? CAMERA_LIMITS.clearance / (distance || 1) : 1;
  return {
    ...shot,
    fov,
    position: [target[0] + (x - target[0]) * scale, shot?.position?.[1] ?? 1.5, target[2] + (z - target[2]) * scale],
    lookAt: [target[0], lookAtY, target[2]],
  };
}

export function shotKey(shot, time = 0) {
  const safe = sanitizeCamera(shot);
  return [time, safe.position, safe.lookAt, safe.fov];
}
