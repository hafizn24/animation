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

/** Subtle faceless body language layered on top of the discrete pose. */
export function microMotion(parts, frame, pose = 'idle') {
  if (!parts || !parts.head) return;
  const head = parts.head;
  const torso = parts.torso;
  const la = parts.leftArm;
  const ra = parts.rightArm;
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
    if (torso) torso.position.y = Math.abs(Math.sin(w * 7)) * 0.12;
    if (la) la.rotation.set(-2.2, 0, -0.4);
    if (ra) ra.rotation.set(-2.2, 0, 0.4);
    head.rotation.x = -0.14;
  } else if (pose === 'stride') {
    if (parts.leftLeg) parts.leftLeg.rotation.x = Math.sin(w * 8) * 0.4;
    if (parts.rightLeg) parts.rightLeg.rotation.x = -Math.sin(w * 8) * 0.4;
    if (la) la.rotation.x = 0.5;
    if (ra) ra.rotation.x = -0.5;
  } else {
    const breath = Math.sin(w * 2.3);
    head.position.y = 1.96 + breath * 0.016;
    if (torso) torso.scale.y = 1 + breath * 0.012;
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
