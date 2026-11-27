/**
 * Shared pose library and pose helpers.
 *
 * Characters that ship their own `this.poses` table (Chairman, NewOwner,
 * Sponsor) keep it and are only ever driven by that table. Characters without
 * one fall back to `SHARED_POSES`, so `setPose()` is safe to call on every
 * rig in the cast without a regression for the classes that never had it.
 */

const rot = (x = 0, y = 0, z = 0) => ({ x, y, z });

/** Pose names that switch the rig into the locomotion branch of `update()`. */
export const WALK_POSES = new Set(['walk', 'walkA', 'walkB', 'walkC', 'stride', 'run']);

/**
 * Fallback pose table for the standard 7-part body rig.
 * `idle` mirrors the rest pose (arms z = ±0.32) so applying it is a no-op on
 * a freshly built character; the real idle restore uses `captureRestPose()`
 * so per-class arm angles (0.30 / 0.28) survive untouched.
 */
export const SHARED_POSES = {
  idle: {
    head: rot(),
    torso: rot(),
    leftArm: rot(0, 0, -0.32),
    rightArm: rot(0, 0, 0.32),
    leftLeg: rot(),
    rightLeg: rot(),
  },
  walkA: {
    head: rot(0.03, -0.06, 0),
    torso: rot(0.04, -0.12, 0),
    leftArm: rot(-0.46, 0, -0.30),
    rightArm: rot(0.38, 0, 0.28),
    leftLeg: rot(0.52, 0, 0),
    rightLeg: rot(-0.38, 0, 0),
  },
  walkB: {
    head: rot(0.02, 0.08, 0),
    torso: rot(0.04, 0.14, 0),
    leftArm: rot(0.40, 0, -0.28),
    rightArm: rot(-0.48, 0, 0.30),
    leftLeg: rot(-0.42, 0, 0),
    rightLeg: rot(0.56, 0, 0),
  },
  walkC: {
    head: rot(0.05, 0, 0),
    torso: rot(0.06, 0, 0),
    leftArm: rot(-0.18, 0, -0.32),
    rightArm: rot(0.16, 0, 0.32),
    leftLeg: rot(0.12, 0, 0),
    rightLeg: rot(-0.16, 0, 0),
  },
  stride: {
    head: rot(0.02, -0.05, 0),
    torso: rot(-0.04, 0, 0),
    leftArm: rot(0.50, 0, -0.24),
    rightArm: rot(-0.55, 0, 0.24),
    leftLeg: rot(-0.40, 0, 0),
    rightLeg: rot(0.36, 0, 0),
  },
  talk: {
    head: rot(-0.02, 0.06, 0),
    torso: rot(0, -0.04, 0),
    leftArm: rot(0.04, 0, -0.30),
    rightArm: rot(-0.42, 0, 0.16),
    leftLeg: rot(),
    rightLeg: rot(),
  },
  thought: {
    head: rot(-0.05, 0.10, 0),
    torso: rot(-0.02, 0.05, 0),
    leftArm: rot(0.05, 0, -0.30),
    rightArm: rot(-0.55, 0, -0.10),
    leftLeg: rot(),
    rightLeg: rot(),
  },
};

const JOINTS = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

/** Snapshots the live joint rotations of a freshly built rig. */
export function captureRestPose(parts) {
  const rest = {};
  JOINTS.forEach((joint) => {
    const part = parts && parts[joint];
    rest[joint] = part
      ? { x: part.rotation.x, y: part.rotation.y, z: part.rotation.z }
      : rot();
  });
  return rest;
}

/** Wraps a snapshot so it can be fed straight to `applyPoseTable`. */
export function restPoseTable(rest) {
  const table = {};
  JOINTS.forEach((joint) => {
    table[joint] = { ...(rest[joint] || rot()) };
  });
  return table;
}

/**
 * Applies a pose table to the rig and syncs optional prop visibility.
 * Missing joints are skipped so partial tables are allowed.
 */
export function applyPoseTable(parts, pose, props) {
  if (!parts || !pose) return;
  JOINTS.forEach((joint) => {
    const part = parts[joint];
    const r = pose[joint];
    if (!part || !r) return;
    part.rotation.set(r.x || 0, r.y || 0, r.z || 0);
  });

  if (!props) return;
  Object.keys(props).forEach((key) => {
    if (key === 'bag') return;
    if (!props[key]) return;
    const prop = props[key];
    if (prop && 'visible' in prop) prop.visible = !!(pose.props && pose.props[key]);
  });

  if (props.bag) {
    const bagOn = !!(pose.props && (pose.props.bag || pose.props.bagBack));
    props.bag.visible = bagOn;
    props.bag.rotation.y = pose.props && pose.props.bagBack ? Math.PI : 0;
  }
}

/**
 * Adds a looping conversational lift to the right arm on top of the current
 * pose. Used by Episode 7 speakers; call once per frame after `setPose`.
 *
 * @param {object} app character instance exposing `characterParts`
 * @param {number} t seconds since the shot started
 * @param {object} [opts]
 * @param {number} [opts.amplitude] radians of swing (default 0.28)
 * @param {number} [opts.speed] cycles per second (default 1.6)
 * @param {number} [opts.base] resting rotation.x of the right arm
 */
export function applyTalkGesture(app, t, opts = {}) {
  const { amplitude = 0.28, speed = 1.6, base = -0.06 } = opts;
  const parts = app && app.characterParts;
  if (!parts || !parts.rightArm) return;
  const swing = Math.sin(t * Math.PI * 2 * speed);
  parts.rightArm.rotation.x = base + swing * amplitude;
  parts.rightArm.rotation.z = 0.18 + Math.cos(t * Math.PI * 2 * speed) * 0.05;
  if (parts.head) parts.head.rotation.y = Math.sin(t * Math.PI * 2 * (speed * 0.5)) * 0.06;
}
