import { createSceneDirector, forEachLight } from '../Episode1/sceneKit.js';

export { clamp, lerp, smooth, sampleKeys, forEachLight, createSceneDirector } from '../Episode1/sceneKit.js';

export const sec = (frames) => frames / 30;

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

/** Night crisis grade — the single flickering tower is driven in onFrame. */
export function nightGrade(scene, env) {
  if (env.lights?.ambient) env.lights.ambient.intensity = 0.34;
  if (env.lights?.hemi) env.lights.hemi.intensity = 0.25;
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
    if (la) la.rotation.set(-1.1 + Math.sin(w * 9) * 0.18, 0, -0.6);
    if (ra) ra.rotation.set(-1.1 - Math.sin(w * 9) * 0.18, 0, 0.6);
  } else if (pose === 'block') {
    if (torso) torso.rotation.x = 0.14;
    if (la) la.rotation.set(-1.15, 0, -0.34);
    if (ra) ra.rotation.set(-1.15, 0, 0.34);
  } else if (pose === 'point') {
    if (ra) ra.rotation.set(-1.35, 0, 0.16);
    head.rotation.y = -0.1;
  } else if (pose === 'celebrate') {
    if (torso) torso.position.y += Math.abs(Math.sin(w * 7)) * 0.12;
    if (la) la.rotation.set(-2.2, 0, -0.4);
    if (ra) ra.rotation.set(-2.2, 0, 0.4);
    head.rotation.x = -0.14;
  } else if (pose === 'stride') {
    if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(w * 8) * 0.4;
    if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(w * 8) * 0.4;
    if (la) la.rotation.x = 0.5;
    if (ra) ra.rotation.x = -0.5;
  } else if (pose === 'offer') {
    head.rotation.x = 0.08;
    if (la) la.rotation.set(-0.82, 0, -0.34);
    if (ra) ra.rotation.set(-0.82, 0, 0.34);
  } else if (pose === 'document') {
    head.rotation.x = 0.22;
    if (la) la.rotation.set(-1.02, 0, -0.22);
    if (ra) ra.rotation.set(-1.02, 0, 0.22);
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
    if (torso) {
      torso.rotation.x = 0.3;
      torso.position.y -= 0.22;
    }
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
      if (actor.anim) actor.anim({ frame, rig, parts, app });
    },
  }));

  return createSceneDirector(renderer, {
    ...size,
    environment: spec.environment,
    grade: spec.grade,
    extra: spec.extra,
    actors,
    onFrame: spec.onFrame,
    postCamera: spec.postCamera,
    dispose: spec.dispose,
    camera: spec.camera,
  });
}
