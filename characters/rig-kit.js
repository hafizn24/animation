import * as THREE from 'three';

/**
 * Shared Season 1 rig utilities.
 *
 * Every procedural character is authored as a flat group of part pivots so the
 * standalone viewer keeps working. createSceneDirector() calls normalizeRig()
 * once per actor to install the animation contract used by every episode:
 *
 *   characterRoot
 *     └─ pelvis
 *          ├─ torso
 *          │    ├─ head
 *          │    ├─ leftArm
 *          │    └─ rightArm
 *          ├─ leftLeg
 *          └─ rightLeg
 *
 * Vertical bounce/jump offsets must always be applied to characterRoot.position.y,
 * never to the torso. normalizeRig() also adds the shared minimalist face and a
 * collar plug so no hollow torso interior can show when the head turns.
 */

export const MIN_CHARACTER_SEPARATION = 0.95;

export const FACE_EMOTIONS = ['neutral', 'happy', 'hyped', 'angry', 'shocked', 'worried', 'stressed'];

export const POSE_EMOTION = {
  idle: 'neutral',
  talk: 'neutral',
  stride: 'neutral',
  point: 'angry',
  block: 'angry',
  intercept: 'angry',
  panic: 'shocked',
  celebrate: 'happy',
  crouch: 'worried',
  offer: 'neutral',
  document: 'worried',
  keys: 'neutral',
  coffee: 'neutral',
  phone: 'neutral',
};

const EMOTION_PRESETS = {
  neutral: { eyeX: 1, eyeY: 1, browY: 0, browAngle: 0, mouth: 'line', mouthScale: 1 },
  happy: { eyeX: 1.04, eyeY: 1.1, browY: 0.022, browAngle: 0.04, mouth: 'smile', mouthScale: 1.05 },
  hyped: { eyeX: 1.12, eyeY: 1.2, browY: 0.034, browAngle: 0.02, mouth: 'smile', mouthScale: 1.18 },
  angry: { eyeX: 1.02, eyeY: 0.64, browY: -0.006, browAngle: 0.36, mouth: 'line', mouthScale: 0.88 },
  shocked: { eyeX: 1.22, eyeY: 1.34, browY: 0.04, browAngle: 0, mouth: 'o', mouthScale: 1.12 },
  worried: { eyeX: 0.96, eyeY: 0.8, browY: 0.012, browAngle: -0.28, mouth: 'line', mouthScale: 0.9 },
  stressed: { eyeX: 0.9, eyeY: 0.72, browY: 0.008, browAngle: -0.34, mouth: 'line', mouthScale: 0.84 },
};

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

const headSphere = (headGroup) => {
  const outlined = headGroup?.children?.find((child) => child.userData && child.userData.mainMesh);
  const mesh = outlined?.userData?.mainMesh;
  if (mesh && mesh.geometry?.type === 'SphereGeometry') {
    return {
      group: outlined,
      mesh,
      radius: mesh.geometry.parameters.radius ?? 0.46,
      centerY: outlined.position.y ?? 0.36,
    };
  }
  let found = null;
  headGroup?.traverse((child) => {
    if (found || !isMesh(child) || child.geometry?.type !== 'SphereGeometry') return;
    const radius = child.geometry.parameters?.radius ?? 0;
    if (radius > 0.35 && radius < 0.62) found = child;
  });
  if (!found) return { radius: 0.46, centerY: 0.36, group: null, mesh: null };
  return {
    radius: found.geometry.parameters.radius,
    centerY: found.parent?.position?.y ?? 0.36,
    group: found.parent,
    mesh: found,
  };
};

const surfaceZ = (radius, x, y) => {
  const depth = radius * radius - x * x - y * y;
  return Math.sqrt(Math.max(0.0025, depth)) + 0.012;
};

const faceMaterial = () => new THREE.MeshBasicMaterial({
  color: 0x14171c,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
  depthWrite: false,
});

/**
 * Adds the shared 2D-on-3D face. Features sit just outside the head sphere and
 * use polygonOffset, so there is never any hair/face z-fighting.
 */
export function createFace(headGroup, { id = 'character' } = {}) {
  if (!headGroup) return null;
  const sphere = headSphere(headGroup);
  const radius = sphere.radius;
  const centerY = sphere.centerY;
  const material = faceMaterial();

  const face = new THREE.Group();
  face.name = 'Face';
  face.userData.seed = hashSeed(id);

  const makeEye = (side) => {
    const x = side * 0.145;
    const y = 0.045;
    const z = surfaceZ(radius, x, y);
    const group = new THREE.Group();
    group.name = side < 0 ? 'EyeL' : 'EyeR';
    group.position.set(x, centerY + y, z);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), material);
    eye.scale.set(1.08, 0.8, 0.3);
    eye.renderOrder = 3;
    group.add(eye);
    group.userData.base = group.position.clone();
    face.add(group);
    return group;
  };

  const makeBrow = (side) => {
    const x = side * 0.145;
    const y = 0.13;
    const z = surfaceZ(radius, x, y);
    const group = new THREE.Group();
    group.name = side < 0 ? 'BrowL' : 'BrowR';
    group.position.set(x, centerY + y, z);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.024, 0.018), material);
    brow.renderOrder = 4;
    group.add(brow);
    group.userData.base = group.position.clone();
    group.userData.side = side;
    face.add(group);
    return group;
  };

  const eyeL = makeEye(-1);
  const eyeR = makeEye(1);
  const browL = makeBrow(-1);
  const browR = makeBrow(1);

  const mouth = new THREE.Group();
  mouth.name = 'Mouth';
  mouth.position.set(0, centerY - 0.135, surfaceZ(radius, 0, -0.135));
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.018, 0.014), material);
  line.renderOrder = 3;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.011, 6, 16, Math.PI), material);
  smile.rotation.z = Math.PI;
  smile.position.y = 0.028;
  smile.renderOrder = 3;
  const oMouth = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.038, 16), material);
  oMouth.renderOrder = 3;
  mouth.add(line, smile, oMouth);
  face.add(mouth);

  headGroup.add(face);

  const faceState = {
    group: face,
    material,
    eyeL,
    eyeR,
    browL,
    browR,
    mouth,
    mouthLine: line,
    mouthSmile: smile,
    mouthO: oMouth,
    emotion: 'neutral',
    preset: EMOTION_PRESETS.neutral,
    seed: face.userData.seed,
  };
  setFaceEmotion({ face: faceState }, 'neutral');
  return faceState;
}

export function setFaceEmotion(parts, emotion = 'neutral') {
  const face = parts?.face || parts;
  if (!face || !face.group) return;
  const preset = EMOTION_PRESETS[emotion] || EMOTION_PRESETS.neutral;
  face.emotion = emotion;
  face.preset = preset;

  face.eyeL.scale.set(preset.eyeX, preset.eyeY, 1);
  face.eyeR.scale.set(preset.eyeX, preset.eyeY, 1);
  face.browL.position.y = face.browL.userData.base.y + preset.browY;
  face.browR.position.y = face.browR.userData.base.y + preset.browY;
  face.browL.rotation.z = -preset.browAngle;
  face.browR.rotation.z = preset.browAngle;

  face.mouthLine.visible = preset.mouth === 'line';
  face.mouthSmile.visible = preset.mouth === 'smile';
  face.mouthO.visible = preset.mouth === 'o';
  face.mouth.scale.setScalar(preset.mouthScale);
}

/** Deterministic blink + emotion update driven purely by the Remotion frame. */
export function updateFace(parts, frame = 0, emotion = 'neutral', seed = 'character') {
  const face = parts?.face;
  if (!face) return;
  if (emotion && emotion !== face.emotion) setFaceEmotion(parts, emotion);
  const preset = face.preset || EMOTION_PRESETS.neutral;
  const seedValue = hashSeed(seed);
  const period = 92 + (seedValue % 53);
  const phase = (frame + (seedValue % period)) % period;
  const blink = phase < 5 ? Math.sin((phase / 5) * Math.PI) : 0;
  const lid = 1 - 0.86 * blink;
  face.eyeL.scale.y = preset.eyeY * lid;
  face.eyeR.scale.y = preset.eyeY * lid;
}

export function beatEmotion(frame, beats = []) {
  const active = [...beats].reverse().find((beat) =>
    beat.emotion && frame >= beat.from && frame < beat.to
  );
  return active ? active.emotion : null;
}

export function resolveEmotion(actor, frame, pose) {
  if (actor && typeof actor.emotion === 'function') {
    return actor.emotion({ frame, pose }) || POSE_EMOTION[pose] || 'neutral';
  }
  if (actor && typeof actor.emotion === 'string') return actor.emotion;
  const fromBeat = actor ? beatEmotion(frame, actor.beats) : null;
  return fromBeat || POSE_EMOTION[pose] || 'neutral';
}

function addTorsoCap(torso, headGroup) {
  if (!torso || torso.getObjectByName('TorsoCap')) return;
  let top = 0.34;
  torso.traverse((child) => {
    if (!isMesh(child) || child.geometry?.type !== 'CylinderGeometry') return;
    const height = child.geometry.parameters?.height;
    if (height) top = Math.max(top, height / 2);
  });
  const sphere = headSphere(headGroup);
  const skin = sphere?.mesh?.material;
  const material = skin?.isMaterial ? skin.clone() : new THREE.MeshStandardMaterial({ color: 0xb08d6a });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.195, 0.11, 16), material);
  cap.name = 'TorsoCap';
  cap.position.y = top - 0.02;
  cap.scale.z = 0.82;
  torso.add(cap);
}

function restoreHierarchyOffsets(parts) {
  const rest = parts?.__rest;
  if (!rest) return;
  if (parts.torso) parts.torso.position.y = rest.torsoY;
  if (parts.head) parts.head.position.y = rest.headY;
}

/**
 * Installs the strict hierarchy and shared face on an already-built character.
 * Safe to call more than once; returns the same characterParts object.
 */
export function normalizeRig(root, parts, { app = null, id = null } = {}) {
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
  parts.face = createFace(head, { id: id || root.name || 'character' });

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
