import * as THREE from 'three';

/**
 * Deterministic football action helpers for Season 1 goal beats.
 * Nothing here reads a clock: every value is derived from the Remotion frame.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smooth = (value) => value * value * (3 - 2 * value);

const sampleScalar = (keys, frame) => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (frame <= t1) {
      const k = smooth(clamp((frame - t0) / Math.max(0.0001, t1 - t0), 0, 1));
      return v0 + (v1 - v0) * k;
    }
  }
  return keys[keys.length - 1][1];
};

const rigOf = (character) => character?.rig || (character?.position ? character : null);
const partsOf = (character) => character?.parts || character?.characterParts || character;

const ballRadiusOf = (ball, fallback = 0.22) =>
  ball?.geometry?.parameters?.radius ?? fallback;

/** Foot position in front of a character along its facing vector. */
export function ballAtFeetPosition(character, forwardOffset = 0.55, {
  sideOffset = 0,
  radius = 0.22,
} = {}) {
  const rig = rigOf(character);
  if (!rig) return new THREE.Vector3(0, radius, 0);
  const yaw = rig.rotation.y;
  const forwardX = Math.sin(yaw);
  const forwardZ = Math.cos(yaw);
  const sideX = Math.cos(yaw);
  const sideZ = -Math.sin(yaw);
  return new THREE.Vector3(
    rig.position.x + forwardX * forwardOffset + sideX * sideOffset,
    radius,
    rig.position.z + forwardZ * forwardOffset + sideZ * sideOffset
  );
}

/** Keep the ball at the character's feet, clear of the shins. */
export function placeBallAtFeet(character, ball, forwardOffset = 0.55, options = {}) {
  if (!ball) return null;
  const radius = options.radius ?? ballRadiusOf(ball);
  const position = ballAtFeetPosition(character, forwardOffset, { ...options, radius });
  ball.position.copy(position);
  return ball;
}

/**
 * Three-keyframe kick: wind-up (leg back / opposite arm forward), contact
 * (leg swings through), then follow-through. Runs after microMotion() so the
 * base pose is preserved and only the kicking side is overridden.
 */
export function applyKickPose(parts, frame, {
  kickFrame,
  contactFrame,
  followThrough = 10,
  leg = 'right',
  strength = 1,
} = {}) {
  if (!parts) return;
  const curve = sampleScalar([
    [kickFrame, 0],
    [contactFrame - 5, 1],
    [contactFrame, -0.85],
    [contactFrame + followThrough, -1.18],
    [contactFrame + followThrough + 9, 0],
  ], frame);

  if (curve === 0) return;

  const kickLeg = leg === 'left' ? parts.leftLeg : parts.rightLeg;
  const plantLeg = leg === 'left' ? parts.rightLeg : parts.leftLeg;
  const oppositeArm = leg === 'left' ? parts.rightArm : parts.leftArm;
  const sameArm = leg === 'left' ? parts.leftArm : parts.rightArm;

  if (kickLeg) kickLeg.rotation.x = curve * 0.95 * strength;
  if (plantLeg) plantLeg.rotation.x = -0.08 + Math.max(0, curve) * 0.16;
  if (oppositeArm) oppositeArm.rotation.x = -0.2 - curve * 0.72 * strength;
  if (sameArm) sameArm.rotation.x = 0.16 + curve * 0.52 * strength;
  if (parts.torso) parts.torso.rotation.y = curve * 0.14 * strength;
  if (parts.head) parts.head.rotation.y = -curve * 0.06;
}

/** Parabolic ball flight from the foot to an exact target inside the goal. */
export function updateBallFlight(ball, frame, {
  start,
  target,
  contactFrame,
  hitFrame,
  arc = 1.35,
  spin = 0.34,
} = {}) {
  if (!ball || !start || !target) return;
  const startVec = Array.isArray(start) ? new THREE.Vector3(...start) : start;
  const targetVec = Array.isArray(target) ? new THREE.Vector3(...target) : target;

  if (frame < contactFrame) return;

  if (frame <= hitFrame) {
    const t = clamp((frame - contactFrame) / Math.max(1, hitFrame - contactFrame), 0, 1);
    const eased = smooth(t);
    ball.position.x = startVec.x + (targetVec.x - startVec.x) * eased;
    ball.position.z = startVec.z + (targetVec.z - startVec.z) * eased;
    ball.position.y = startVec.y + (targetVec.y - startVec.y) * t + arc * 4 * t * (1 - t);
  } else {
    ball.position.copy(targetVec);
  }

  ball.rotation.x = spin * (frame - contactFrame);
  ball.rotation.y = spin * 0.42 * (frame - contactFrame);
}

/** Damped goal-net ripple on ball contact. */
export function updateNetRipple(net, frame, hitFrame, { strength = 1 } = {}) {
  if (!net) return;
  if (!net.userData.rippleBase) {
    net.userData.rippleBase = {
      position: net.position.clone(),
      scale: net.scale.clone(),
    };
  }
  const base = net.userData.rippleBase;
  const dt = frame - hitFrame;
  if (dt < 0 || dt > 20) {
    net.position.copy(base.position);
    net.scale.copy(base.scale);
    return;
  }
  const damp = Math.exp(-dt * 0.24) * Math.cos(dt * 1.35);
  net.scale.set(
    base.scale.x * (1 + 0.055 * damp * strength),
    base.scale.y * (1 + 0.12 * damp * strength),
    base.scale.z
  );
  net.position.x = base.position.x - 0.14 * damp * strength;
}

/** Short damped camera shake, applied after sanitizeCamera(). */
export function goalShake(frame, hitFrame, { amplitude = 0.035, duration = 9 } = {}) {
  const dt = frame - hitFrame;
  if (dt < 0 || dt > duration) return { x: 0, y: 0, z: 0 };
  const damp = Math.exp(-dt * 0.55) * (1 - dt / duration);
  return {
    x: Math.sin(dt * 2.6) * amplitude * damp,
    y: Math.cos(dt * 3.1) * amplitude * 0.72 * damp,
    z: 0,
  };
}

/**
 * One call for the complete kick + goal sequence. The scene keeps its own ball
 * animation before contactFrame; from contact onward this owns the ball.
 */
export function animateKickAndGoal({
  frame,
  kicker,
  ball,
  net = null,
  start = null,
  target,
  kickFrame,
  contactFrame,
  hitFrame,
  followThrough = 10,
  leg = 'right',
  arc = 1.35,
  spin = 0.34,
  strength = 1,
  placeBefore = false,
  footOffset = 0.55,
  ripple = true,
  shake = {},
}) {
  const parts = partsOf(kicker);
  if (parts) {
    applyKickPose(parts, frame, { kickFrame, contactFrame, followThrough, leg, strength });
  }

  if (ball) {
    if (frame < contactFrame && placeBefore) {
      placeBallAtFeet(kicker, ball, footOffset);
    } else {
      const startVec = start
        ? new THREE.Vector3(...start)
        : ballAtFeetPosition(kicker, footOffset, { radius: ballRadiusOf(ball) });
      updateBallFlight(ball, frame, {
        start: startVec,
        target,
        contactFrame,
        hitFrame,
        arc,
        spin,
      });
    }
  }

  if (net && ripple) updateNetRipple(net, frame, hitFrame);
  return {
    hit: frame >= hitFrame,
    shake: goalShake(frame, hitFrame, shake),
  };
}

/** Crowd excitement helper: ramps up on the goal, then settles. */
export function goalExcitement(frame, hitFrame, { idle = 0.08, peak = 1 } = {}) {
  if (frame < hitFrame - 2) return idle;
  const dt = frame - (hitFrame - 2);
  return idle + (peak - idle) * Math.exp(-dt * 0.045);
}
