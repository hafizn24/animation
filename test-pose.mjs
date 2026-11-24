import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import {
  SEASON_POSES,
  beatPose,
  microMotion,
  resetMotion,
} from './remotion/src/Season1/sceneKit.js';

/** Build a minimal rig-part set with a non-trivial neutral baseline. */
const makeParts = () => {
  const head = new THREE.Group();
  head.position.set(0, 1.96, 0);
  const torso = new THREE.Group();
  torso.position.set(0, 1.44, 0);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.29, 1.72, 0);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.29, 1.72, 0);
  const leftLeg = new THREE.Group();
  const rightLeg = new THREE.Group();
  const leftHand = new THREE.Group();
  const rightHand = new THREE.Group();
  torso.scale.set(1.06, 1, 0.76);
  return { head, torso, leftArm, rightArm, leftLeg, rightLeg, leftHand, rightHand };
};

const snapshot = (parts) => {
  const rotation = (obj) => obj ? [obj.rotation.x, obj.rotation.y, obj.rotation.z] : null;
  return JSON.stringify({
    headPosition: parts.head.position.toArray(),
    headRotation: rotation(parts.head),
    torsoPosition: parts.torso.position.toArray(),
    torsoRotation: rotation(parts.torso),
    torsoScale: parts.torso.scale.toArray(),
    leftArm: rotation(parts.leftArm),
    rightArm: rotation(parts.rightArm),
    leftLeg: rotation(parts.leftLeg),
    rightLeg: rotation(parts.rightLeg),
  });
};

// --- Determinism: frame 200 standalone must equal frame 200 after 0..199 ---
const beats = [
  { from: 0, to: 80, pose: 'block' },
  { from: 80, to: 160, pose: 'point' },
  { from: 160, to: 300, pose: 'idle' },
];

const sequential = makeParts();
for (let frame = 0; frame <= 200; frame += 1) {
  microMotion(sequential, frame, beatPose(frame, beats));
}
const sequentialFrame200 = snapshot(sequential);

const fresh = makeParts();
microMotion(fresh, 200, 'idle');
const freshFrame200 = snapshot(fresh);
assert.equal(
  sequentialFrame200,
  freshFrame200,
  'frame 200 must be identical whether rendered alone or after frames 0..199'
);

// A second fresh rig with a different history must also converge.
const otherHistory = makeParts();
for (let frame = 150; frame <= 200; frame += 1) {
  microMotion(otherHistory, frame, 'celebrate');
}
microMotion(otherHistory, 200, 'idle');
assert.equal(snapshot(otherHistory), freshFrame200, 'result must not depend on prior poses');

// --- Every declared pose is a real, reset-safe gesture ---
for (const pose of SEASON_POSES) {
  const parts = makeParts();
  const neutral = snapshot(parts);
  microMotion(parts, 97, pose);
  const result = snapshot(parts);
  if (pose !== 'idle') {
    assert.notEqual(result, neutral, `pose "${pose}" must change body language`);
  }
  resetMotion(parts);
  assert.equal(snapshot(parts), neutral, `resetMotion restores the baseline after "${pose}"`);
}

// --- Every pose used by a Season 1 scene is implemented ---
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const used = new Set();
for (let ep = 6; ep <= 12; ep += 1) {
  const sceneDir = path.join(root, 'remotion', 'src', `Episode${ep}`, 'scenes');
  if (!fs.existsSync(sceneDir)) continue;
  for (const file of fs.readdirSync(sceneDir).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(sceneDir, file), 'utf8');
    for (const match of source.matchAll(/pose:\s*['"]([A-Za-z]+)['"]/g)) used.add(match[1]);
  }
}
for (const pose of used) {
  assert.ok(SEASON_POSES.includes(pose), `scene pose "${pose}" is implemented in microMotion`);
}

console.log('POSE / DETERMINISM CHECKS PASSED');
