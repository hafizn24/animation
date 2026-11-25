import * as THREE from 'three';
import { clamp, createSceneDirector, forEachLight } from '../Episode1/sceneKit.js';
import { MIN_CHARACTER_SEPARATION } from '../../../characters/rig-kit.js';

export { clamp, lerp, smooth, sampleKeys, forEachLight, createSceneDirector } from '../Episode1/sceneKit.js';
export * from './cameraKit.js';
export * from './actionKit.js';
export {
  MIN_CHARACTER_SEPARATION,
  attachArmband,
  holdProp,
  resolveActorSeparation,
} from '../../../characters/rig-kit.js';

export const sec = (frames) => frames / 30;

/**
 * Verified 9:16 camera presets. Distances are measured from the look-at target;
 * every Season 1 shot is additionally passed through sanitizeCamera() so no
 * shot can crop into a chest, sit under a chin, or fall below a 38° FOV.
 */
export const CAMERA_PRESETS = {
  WIDE_TWO_SHOT: { distance: 6.2, fov: 42 },
  MEDIUM_SPEAKER: { distance: 4.8, fov: 40 },
  OVER_SHOULDER: { distance: 4.2, fov: 42 },
  PENALTY_BOX_1V1: { distance: 6.8, fov: 38 },
};

/** Build a camera key from a preset, an aim point and an optional yaw in radians. */
export const presetKey = (name, time, target, yaw = 0) => {
  const { distance, fov } = CAMERA_PRESETS[name];
  return [
    time,
    [
      target[0] + Math.sin(yaw) * distance,
      target[1] + 0.18,
      target[2] + Math.cos(yaw) * distance,
    ],
    target,
    fov,
  ];
};

const FOV_MIN = 38;
const FOV_MAX = 42;
const TARGET_Y_MIN = 1.25;
const TARGET_Y_MAX = 1.45;
const MIN_ACTOR_DISTANCE = 4.6;
const _target = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _cam = new THREE.Vector3();
const _actor = new THREE.Vector3();

/** Keep every Season 1 shot in the verified vertical framing envelope. */
export function sanitizeCamera({ camera, actors = [], target }) {
  if (!camera || !Array.isArray(target)) return;
  const fov = clamp(camera.fov, FOV_MIN, FOV_MAX);
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  _target.set(target[0], clamp(target[1], TARGET_Y_MIN, TARGET_Y_MAX), target[2]);
  _dir.copy(camera.position).sub(_target);
  if (_dir.lengthSq() < 0.0001) _dir.set(0, 0.2, 1);
  _dir.normalize();

  const active = (actors || [])
    .filter((actor) => actor && actor.rig && actor.rig.visible !== false)
    .map((actor) => _actor.copy(actor.rig.position).clone());

  let distance = Math.max(0.4, camera.position.distanceTo(_target));
  for (let pass = 0; pass < 2 && active.length; pass += 1) {
    let push = 0;
    _cam.copy(_target).addScaledVector(_dir, distance);
    for (const position of active) {
      const gap = MIN_ACTOR_DISTANCE - _cam.distanceTo(position);
      if (gap > push) push = gap;
    }
    if (push <= 0) break;
    distance += push * 1.05;
  }

  camera.position.copy(_target).addScaledVector(_dir, distance);
  camera.lookAt(_target);
}

/** Local frame of a scene's first net.wav cue — the authoritative goal moment. */
export const goalFrame = (scene, index = 0) => {
  const cue = (scene.cues || []).filter((item) => item.file === 'net.wav')[index];
  return cue ? cue.frame - scene.fromFrame : 0;
};

/** Daylight pitch grade — bright and punchy for the vertical match frames. */
export function pitchGrade(scene, env, mode = 'day') {
  const { ambient, hemi, sun, fill } = env.lights || {};
  if (mode === 'dusk') {
    if (sun) { sun.color.setHex(0xff9a5c); sun.intensity = 1.1; }
    if (ambient) ambient.intensity = 0.62;
    if (hemi) hemi.intensity = 0.45;
    if (fill) fill.intensity = 0.3;
  } else {
    if (sun) { sun.color.setHex(0xfff4dc); sun.intensity = 1.6; }
    if (ambient) ambient.intensity = 0.85;
    if (hemi) hemi.intensity = 0.6;
    if (fill) fill.intensity = 0.4;
  }
}

/** Concrete corridor: cool, hard contrast with a hot daylight exit. */
export function tunnelGrade(scene, env) {
  if (env.lights?.ambient) env.lights.ambient.intensity = 0.5;
  if (env.lights?.exit) env.lights.exit.intensity = 11;
  forEachLight(scene, (light) => {
    if (light.isSpotLight && light !== env.lights?.exit) light.intensity = 4;
  });
}

/** Night crisis grade — moonlight keeps silhouettes readable after the tower blows. */
export function nightGrade(scene, env) {
  if (env.lights?.ambient) env.lights.ambient.intensity = 0.8;
  if (env.lights?.hemi) env.lights.hemi.intensity = 0.9;
}

/** Pick the pose for a frame from a declarative beat list. */
export const beatPose = (frame, beats = [], fallback = 'idle') => {
  const active = [...beats].reverse().find((beat) => frame >= beat.from && frame < beat.to);
  return active ? active.pose : fallback;
};

/** Every pose name that a Season 1 scene is allowed to use. */
export const SEASON_POSES = [
  'idle', 'talk', 'panic', 'block', 'point', 'celebrate', 'stride',
  'offer', 'document', 'keys', 'intercept', 'coffee', 'phone', 'crouch',
];

// Baselines are captured once per rig (the pose set by createProceduralCharacter).
// microMotion restores them before applying a pose, so rendering frame N alone is
// identical to rendering it after frames 0..N-1.
const BASELINES = new WeakMap();

const baselineFor = (parts) => {
  let baseline = BASELINES.get(parts);
  if (!baseline) {
    baseline = {
      head: { position: parts.head.position.clone(), rotation: parts.head.rotation.clone() },
      torso: parts.torso
        ? {
            position: parts.torso.position.clone(),
            rotation: parts.torso.rotation.clone(),
            scale: parts.torso.scale.clone(),
          }
        : null,
      leftArm: parts.leftArm?.rotation.clone() ?? null,
      rightArm: parts.rightArm?.rotation.clone() ?? null,
      leftLeg: parts.leftLeg?.rotation.clone() ?? null,
      rightLeg: parts.rightLeg?.rotation.clone() ?? null,
      leftHand: parts.leftHand?.rotation.clone() ?? null,
      rightHand: parts.rightHand?.rotation.clone() ?? null,
      root: parts.root
        ? {
            position: parts.root.position.clone(),
            rotation: parts.root.rotation.clone(),
          }
        : null,
    };
    BASELINES.set(parts, baseline);
  }
  return baseline;
};

/** Restore the neutral rig state before layering a new pose on top. */
export function resetMotion(parts) {
  if (!parts || !parts.head) return;
  const base = baselineFor(parts);
  parts.head.position.copy(base.head.position);
  parts.head.rotation.copy(base.head.rotation);
  if (parts.torso && base.torso) {
    parts.torso.position.copy(base.torso.position);
    parts.torso.rotation.copy(base.torso.rotation);
    parts.torso.scale.copy(base.torso.scale);
  }
  if (parts.leftArm && base.leftArm) parts.leftArm.rotation.copy(base.leftArm);
  if (parts.rightArm && base.rightArm) parts.rightArm.rotation.copy(base.rightArm);
  if (parts.leftLeg && base.leftLeg) parts.leftLeg.rotation.copy(base.leftLeg);
  if (parts.rightLeg && base.rightLeg) parts.rightLeg.rotation.copy(base.rightLeg);
  if (parts.leftHand && base.leftHand) parts.leftHand.rotation.copy(base.leftHand);
  if (parts.rightHand && base.rightHand) parts.rightHand.rotation.copy(base.rightHand);
  if (parts.root && base.root) {
    parts.root.position.copy(base.root.position);
    parts.root.rotation.copy(base.root.rotation);
  }
}

/** Deterministic faceless body language: always reset, then apply the pose. */
export function microMotion(parts, frame, pose = 'idle') {
  if (!parts || !parts.head) return;
  resetMotion(parts);
  const { head, torso, leftArm: la, rightArm: ra } = parts;
  const w = frame / 30;

  if (pose === 'talk') {
    head.rotation.x = Math.sin(w * 5) * 0.07;
    head.rotation.y = Math.sin(w * 2.2) * 0.12;
    if (ra) ra.rotation.set(-0.45 + Math.sin(w * 6) * 0.24, 0, 0.26);
  } else if (pose === 'panic') {
    head.rotation.z = Math.sin(w * 11) * 0.09;
    if (la) la.rotation.set(-0.8 + Math.sin(w * 9) * 0.12, 0, -0.55);
    if (ra) ra.rotation.set(-0.8 - Math.sin(w * 9) * 0.12, 0, 0.55);
  } else if (pose === 'block') {
    if (torso) torso.rotation.x = 0.14;
    if (la) la.rotation.set(-0.9, 0, -0.36);
    if (ra) ra.rotation.set(-0.9, 0, 0.36);
  } else if (pose === 'point') {
    if (ra) ra.rotation.set(-1.1, 0, 0.2);
    head.rotation.y = -0.1;
  } else if (pose === 'celebrate') {
    // Jump on the character root. Moving the torso would tear it away from the
    // pelvis/shorts (the old Ep. 7/8/10 celebration bug).
    if (parts.root) parts.root.position.y += Math.abs(Math.sin(w * 7)) * 0.12;
    if (la) la.rotation.set(-2.2, 0, -0.4);
    if (ra) ra.rotation.set(-2.2, 0, 0.4);
    head.rotation.x = -0.14;
  } else if (pose === 'stride') {
    if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(w * 8) * 0.4;
    if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(w * 8) * 0.4;
    if (la) la.rotation.x = 0.32;
    if (ra) ra.rotation.x = -0.32;
  } else if (pose === 'offer') {
    head.rotation.x = 0.08;
    if (la) la.rotation.set(-0.7, 0, -0.36);
    if (ra) ra.rotation.set(-0.7, 0, 0.36);
  } else if (pose === 'document') {
    head.rotation.x = 0.22;
    if (la) la.rotation.set(-0.85, 0, -0.26);
    if (ra) ra.rotation.set(-0.85, 0, 0.26);
  } else if (pose === 'keys') {
    head.rotation.y = -0.2;
    if (ra) ra.rotation.set(-0.7, -0.3, 0.42);
    if (la) la.rotation.set(0.04, 0, -0.18);
  } else if (pose === 'intercept') {
    if (torso) torso.rotation.x = -0.16;
    if (parts.leftLeg) parts.leftLeg.rotation.x = -0.7;
    if (parts.rightLeg) parts.rightLeg.rotation.x = 0.34;
    if (ra) ra.rotation.set(-0.9, 0, 0.24);
    if (la) la.rotation.set(0.5, 0, -0.24);
  } else if (pose === 'coffee') {
    head.rotation.x = 0.05;
    if (ra) ra.rotation.set(-1.2, -0.1, 0.5);
  } else if (pose === 'phone') {
    head.rotation.y = -0.12;
    if (ra) ra.rotation.set(-1.5, -0.2, 0.35);
  } else if (pose === 'crouch') {
    if (torso) torso.rotation.x = 0.3;
    if (parts.root) parts.root.position.y -= 0.18;
    head.rotation.x = 0.12;
    if (parts.leftLeg) parts.leftLeg.rotation.x = -0.6;
    if (parts.rightLeg) parts.rightLeg.rotation.x = 0.6;
    if (la) la.rotation.set(-0.8, 0, -0.7);
    if (ra) ra.rotation.set(-0.8, 0, 0.7);
  } else {
    const breath = Math.sin(w * 2.3);
    head.position.y += breath * 0.016;
    if (torso) torso.scale.y *= 1 + breath * 0.012;
    head.rotation.y = Math.sin(w * 1.3) * 0.05;
  }
}

/**
 * Declarative scene builder. Each shot declares only actors, pose beats and
 * camera keys; the rig contract and deterministic render loop stay shared.
 */
export function createCinematicScene(renderer, size, spec) {
  const actors = (spec.actors || []).map((actor) => ({
    ...actor,
    animate: ({ frame, rig, parts, app }) => {
      const pose = beatPose(frame, actor.beats, actor.pose || 'idle');
      microMotion(parts, frame, pose);
      updateFace(parts, frame, resolveEmotion(actor, frame, pose), actor.name || actor.id || rig.name);
      if (actor.anim) actor.anim({ frame, rig, parts, app });
    },
  }));

  return createSceneDirector(renderer, {
    ...size,
    environment: spec.environment,
    grade: spec.grade,
    extra: spec.extra,
    actors,
    onFrame: (ctx) => {
      if (spec.onFrame) spec.onFrame(ctx);
      if (ctx.extra && ctx.extra.crowdExcitement === undefined) {
        ctx.extra.crowdExcitement = 0.08;
      }
    },
    postCamera: (ctx) => {
      if (spec.postCamera) spec.postCamera(ctx);
      sanitizeCamera(ctx);
      const shake = ctx.extra && ctx.extra.shake;
      if (shake) {
        ctx.camera.position.x += shake.x || 0;
        ctx.camera.position.y += shake.y || 0;
        ctx.camera.position.z += shake.z || 0;
      }
    },
    dispose: spec.dispose,
    minSeparation: spec.minSeparation ?? MIN_CHARACTER_SEPARATION,
    camera: spec.camera,
  });
}
