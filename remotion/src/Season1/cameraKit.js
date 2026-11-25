import * as THREE from 'three';

/**
 * Reusable dialogue staging helpers for Season 1.
 *
 * Every helper returns { position, target, fov } and shotKey() turns that into
 * the [time, position, target, fov] tuple used by createSceneDirector().
 * Characters face +Z in their local space, so a yaw of 0 looks toward +Z.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const wrapAngle = (angle) => {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
};

const asVector = (value) => {
  if (!value) return null;
  if (value.isVector3) return value.clone();
  if (Array.isArray(value)) return new THREE.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
  if (value.rig) return value.rig.position.clone();
  if (value.position && value.position.isVector3) return value.position.clone();
  return null;
};

export const findActor = (actors = [], name) => actors.find((actor) => actor.name === name) || null;

const actorYaw = (actor) => {
  if (!actor) return 0;
  if (actor.rig) return actor.rig.rotation.y;
  return actor.rotationY ?? 0;
};

const shot = (position, target, fov = 42) => ({
  position: [position.x, position.y, position.z],
  target: [target.x, target.y, target.z],
  fov,
});

/** Three-quarter front view that guarantees the speaker's face is on camera. */
export function getSpeakerThreeQuarterShot(speaker, listener = null, {
  distance = 4.6,
  height = 1.58,
  targetHeight = 1.38,
  fov = 42,
  angle = 0.62,
  side = 1,
} = {}) {
  const speakerPos = asVector(speaker) || new THREE.Vector3();
  const yaw = actorYaw(speaker);
  let shoulderSide = side;

  if (listener) {
    const listenerPos = asVector(listener);
    if (listenerPos) {
      const toListener = Math.atan2(listenerPos.x - speakerPos.x, listenerPos.z - speakerPos.z);
      shoulderSide = wrapAngle(toListener - yaw) >= 0 ? 1 : -1;
    }
  }

  const cameraYaw = yaw + shoulderSide * angle;
  const position = new THREE.Vector3(
    speakerPos.x + Math.sin(cameraYaw) * distance,
    height,
    speakerPos.z + Math.cos(cameraYaw) * distance
  );
  const target = new THREE.Vector3(speakerPos.x, targetHeight, speakerPos.z);
  return shot(position, target, fov);
}

/** Shot / reverse-shot: camera sits behind the listener's shoulder. */
export function getOverTheShoulderShot(speaker, listener, {
  distance = 2.15,
  lateral = 0.52,
  height = 1.58,
  targetHeight = 1.36,
  fov = 42,
  side = 1,
} = {}) {
  const speakerPos = asVector(speaker) || new THREE.Vector3();
  const listenerPos = asVector(listener) || speakerPos.clone().add(new THREE.Vector3(0, 0, 2));
  const direction = new THREE.Vector3().subVectors(speakerPos, listenerPos);
  if (direction.lengthSq() < 0.0001) direction.set(0, 0, 1);
  direction.normalize();

  const lateralVector = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(lateral * side);
  const position = new THREE.Vector3(
    listenerPos.x - direction.x * distance,
    height,
    listenerPos.z - direction.z * distance
  ).add(lateralVector);

  const target = new THREE.Vector3(speakerPos.x, targetHeight, speakerPos.z);
  return shot(position, target, fov);
}

/** Angled two-shot that keeps both faces at least partially visible. */
export function getTwoShot(charA, charB, {
  distance = null,
  height = 1.62,
  targetHeight = 1.3,
  fov = 44,
  side = 1,
} = {}) {
  const a = asVector(charA) || new THREE.Vector3(-1, 0, 0);
  const b = asVector(charB) || new THREE.Vector3(1, 0, 0);
  const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const span = new THREE.Vector3().subVectors(b, a);
  const separation = Math.max(0.001, span.length());
  span.normalize();
  const perpendicular = new THREE.Vector3(-span.z, 0, span.x);
  const cameraDistance = distance ?? clamp(3.3 + separation * 0.55, 3.6, 7.2);

  const forwardA = new THREE.Vector3(Math.sin(actorYaw(charA)), 0, Math.cos(actorYaw(charA)));
  const forwardB = new THREE.Vector3(Math.sin(actorYaw(charB)), 0, Math.cos(actorYaw(charB)));

  const score = (candidate) => {
    const toA = candidate.clone().sub(a).setY(0).normalize();
    const toB = candidate.clone().sub(b).setY(0).normalize();
    return toA.dot(forwardA) + toB.dot(forwardB);
  };

  const candidates = [
    midpoint.clone().addScaledVector(perpendicular, cameraDistance * side),
    midpoint.clone().addScaledVector(perpendicular, -cameraDistance * side),
  ];
  const position = score(candidates[0]) >= score(candidates[1]) ? candidates[0] : candidates[1];
  position.y = height;
  const target = midpoint.clone().setY(targetHeight);
  return shot(position, target, fov);
}

/** Convert a shot into a createSceneDirector camera key. */
export function shotKey(cameraShot, time) {
  return [time, cameraShot.position, cameraShot.target, cameraShot.fov];
}

/**
 * Turn a character toward a target. Pass `camera` to cheat the final yaw a few
 * degrees toward the lens while keeping the body aimed at the listener.
 */
export function faceTarget(character, targetPos, { camera = null, cheat = 0.18 } = {}) {
  const rig = character?.rig || character;
  const target = asVector(targetPos);
  if (!rig || !target) return 0;
  let yaw = Math.atan2(target.x - rig.position.x, target.z - rig.position.z);
  const cameraPos = asVector(camera);
  if (cameraPos) {
    const toCamera = Math.atan2(cameraPos.x - rig.position.x, cameraPos.z - rig.position.z);
    yaw += clamp(wrapAngle(toCamera - yaw), -cheat, cheat);
  }
  rig.rotation.y = yaw;
  return yaw;
}

/** Face two conversing characters toward each other in one call. */
export function faceEachOther(charA, charB, options = {}) {
  const a = charA?.rig?.position || charA;
  const b = charB?.rig?.position || charB;
  if (!a || !b) return;
  faceTarget(charA, b, options);
  faceTarget(charB, a, options);
}
