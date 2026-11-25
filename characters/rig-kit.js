import * as THREE from 'three';

/**
 * Shared Season 1 rig utilities. Characters remain fully faceless; emotion is
 * communicated through body language and pose animation.
 */

export const MIN_CHARACTER_SEPARATION = 0.95;

const fract = (value) => value - Math.floor(value);

/** Deterministic 0..1 hash used for blinks, crowd jitter and spark seeds. */
export function seededUnit(seed = 0) {
  return fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);
}

export function hashSeed(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.abs(Math.floor(value));
  const text = String(value ?? 'buluh');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const isMesh = (object) => object && object.isMesh;
const asVector = (value) => {
  if (!value) return null;
  if (value.isVector3) return value.clone();
  if (Array.isArray(value)) return new THREE.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
  if (value.rig) return value.rig.position.clone();
  if (value.position && value.position.isVector3) return value.position.clone();
  return null;
};

const findPart = (root, parts, key, name, predicate) => {
  if (parts[key]) return parts[key];
  const named = root.getObjectByName(name);
  if (named) return named;
  if (!predicate) return null;
  return root.children.find((child) => child.isGroup && predicate(child));
};

const namePart = (part, name) => {
  if (part && !part.name) part.name = name;
  return part;
};

/**
 * Installs the strict hierarchy on an already-built faceless character.
 * Safe to call more than once; returns the same characterParts object.
 */
export function normalizeRig(root, parts, { app = null } = {}) {
  if (!root || !parts) return parts;
  if (parts.__normalized) return parts;

  const head = findPart(root, parts, 'head', 'Head');
  const torso = findPart(root, parts, 'torso', 'Torso');
  const pelvis = findPart(root, parts, 'pelvis', 'Pelvis');
  if (!head || !torso || !pelvis) return parts;

  const leftArm = findPart(root, parts, 'leftArm', 'LeftArm', (child) =>
    child.position.x < -0.05 && child.position.y > 1.35
  );
  const rightArm = findPart(root, parts, 'rightArm', 'RightArm', (child) =>
    child.position.x > 0.05 && child.position.y > 1.35
  );
  const leftLeg = findPart(root, parts, 'leftLeg', 'LeftLeg', (child) =>
    child.position.x < -0.05 && child.position.y < 1.15
  );
  const rightLeg = findPart(root, parts, 'rightLeg', 'RightLeg', (child) =>
    child.position.x > 0.05 && child.position.y < 1.15
  );

  namePart(head, 'Head');
  namePart(torso, 'Torso');
  namePart(pelvis, 'Pelvis');
  namePart(leftArm, 'LeftArm');
  namePart(rightArm, 'RightArm');
  namePart(leftLeg, 'LeftLeg');
  namePart(rightLeg, 'RightLeg');

  const torsoBase = torso.position.clone();
  const pelvisBase = pelvis.position.clone();

  if (torso.parent !== pelvis) {
    pelvis.add(torso);
    torso.position.copy(torsoBase).sub(pelvisBase);
  }
  if (head.parent !== torso) {
    torso.add(head);
    head.position.copy(head.position).sub(torsoBase);
  }
  if (leftArm && leftArm.parent !== torso) {
    torso.add(leftArm);
    leftArm.position.copy(leftArm.position).sub(torsoBase);
  }
  if (rightArm && rightArm.parent !== torso) {
    torso.add(rightArm);
    rightArm.position.copy(rightArm.position).sub(torsoBase);
  }
  if (leftLeg && leftLeg.parent !== pelvis) {
    pelvis.add(leftLeg);
    leftLeg.position.copy(leftLeg.position).sub(pelvisBase);
  }
  if (rightLeg && rightLeg.parent !== pelvis) {
    pelvis.add(rightLeg);
    rightLeg.position.copy(rightLeg.position).sub(pelvisBase);
  }

  parts.root = root;
  parts.pelvis = pelvis;
  parts.leftArm = leftArm || parts.leftArm;
  parts.rightArm = rightArm || parts.rightArm;
  parts.leftLeg = leftLeg || parts.leftLeg;
  parts.rightLeg = rightLeg || parts.rightLeg;
  parts.leftHand = parts.leftHand || leftArm?.getObjectByName('Hand') || null;
  parts.rightHand = parts.rightHand || rightArm?.getObjectByName('Hand') || null;

  parts.__rest = {
    torsoY: torso.position.y,
    headY: head.position.y,
    torso: torso.position.clone(),
  };

  addTorsoCap(torso, head);

  if (app && typeof app.setPose === 'function' && !app.__rigPosePatched) {
    const originalSetPose = app.setPose.bind(app);
    app.setPose = (pose) => {
      originalSetPose(pose);
      restoreHierarchyOffsets(parts);
    };
    app.__rigPosePatched = true;
  }

  parts.__normalized = true;
  root.userData.rigParts = parts;
  return parts;
}

/** Attach a prop mesh to a hand pivot so it moves with the arm. */
export function holdProp(character, hand, mesh, { position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 } = {}) {
  const parts = character?.parts || character?.characterParts || character;
  if (!parts || !mesh) return null;
  const key = hand === 'left' || hand === 'leftHand' ? 'leftHand' : 'rightHand';
  const pivot = parts[key];
  if (!pivot) return null;
  pivot.add(mesh);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.setScalar(scale);
  return mesh;
}

/** Attach the gold captain's armband to a player's upper arm. */
export function attachArmband(character, {
  arm = 'left',
  radius = 0.155,
  tube = 0.02,
  y = -0.2,
  z = 0,
  color = 0xd8b26a,
} = {}) {
  const parts = character?.parts || character?.characterParts || character;
  const pivot = arm === 'right' ? parts?.rightArm : parts?.leftArm;
  if (!pivot) return null;
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 10, 28),
    new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.5 })
  );
  band.name = 'CaptainArmband';
  band.rotation.x = Math.PI / 2;
  band.position.set(0, y, z);
  band.scale.set(1, 1, 0.85);
  pivot.add(band);
  return band;
}

/**
 * Push actors apart on the XZ plane after their waypoint animations run.
 * Deterministic: the same frame always resolves to the same positions.
 */
export function resolveActorSeparation(actors = [], minDistance = MIN_CHARACTER_SEPARATION) {
  if (!minDistance) return;
  const list = actors.filter((actor) => actor && actor.rig && actor.rig.visible !== false);
  for (let pass = 0; pass < 3; pass += 1) {
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i].rig;
        const b = list[j].rig;
        const required = minDistance * ((a.scale.x + b.scale.x) / 2);
        const dx = b.position.x - a.position.x;
        const dz = b.position.z - a.position.z;
        const distance = Math.hypot(dx, dz);
        if (distance >= required) continue;
        const seed = hashSeed(`${list[i].name || i}-${list[j].name || j}`);
        const angle = distance > 0.0001 ? Math.atan2(dz, dx) : seededUnit(seed) * Math.PI * 2;
        const push = (required - distance) * 0.5;
        const nx = Math.cos(angle);
        const nz = Math.sin(angle);
        a.position.x -= nx * push;
        a.position.z -= nz * push;
        b.position.x += nx * push;
        b.position.z += nz * push;
      }
    }
  }
}

export { asVector };
