import * as THREE from 'three';

/**
 * A stylised footballer, built from primitives in the same toon-outline
 * style as the characters in the viewer.
 */

export function buildPlayer({ shirt, trim, shorts, socks, skin, number = 9 }) {
  const group = new THREE.Group();
  group.name = 'Player';

  const material = (color, roughness = 0.75) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const mat = {
    shirt: material(shirt),
    trim: material(trim),
    shorts: material(shorts),
    socks: material(socks),
    skin: material(skin, 0.85),
    boot: material(0x14161a, 0.5),
  };

  const part = (geometry, m, x, y, z) => {
    const mesh = new THREE.Mesh(geometry, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Hips
  const hips = part(new THREE.CylinderGeometry(0.17, 0.16, 0.2, 12), mat.shorts, 0, 0.92, 0);
  group.add(hips);

  // Torso
  const torso = part(new THREE.CylinderGeometry(0.2, 0.17, 0.52, 14), mat.shirt, 0, 1.28, 0);
  torso.scale.set(1, 1, 0.72);
  group.add(torso);

  // Shirt number band
  const band = part(new THREE.CylinderGeometry(0.205, 0.205, 0.1, 14), mat.trim, 0, 1.36, 0);
  band.scale.set(1, 1, 0.72);
  group.add(band);

  // Shoulders
  const shoulders = part(new THREE.SphereGeometry(0.2, 14, 10), mat.shirt, 0, 1.5, 0);
  shoulders.scale.set(1.1, 0.6, 0.72);
  group.add(shoulders);

  // Head
  const head = part(new THREE.SphereGeometry(0.135, 18, 14), mat.skin, 0, 1.72, 0);
  group.add(head);

  const hair = part(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat.boot, 0, 1.73, 0);
  group.add(hair);

  // Arms
  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.235, 1.46, 0);

    const upper = part(new THREE.CylinderGeometry(0.055, 0.048, 0.34, 10), mat.shirt, 0, -0.17, 0);
    pivot.add(upper);

    const lower = part(new THREE.CylinderGeometry(0.048, 0.042, 0.3, 10), mat.skin, 0, -0.47, 0);
    pivot.add(lower);

    pivot.rotation.z = side * 0.18;
    group.add(pivot);
    return pivot;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // Legs
  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.095, 0.92, 0);

    const thigh = part(new THREE.CylinderGeometry(0.078, 0.062, 0.42, 10), mat.shorts, 0, -0.21, 0);
    pivot.add(thigh);

    const shin = part(new THREE.CylinderGeometry(0.058, 0.048, 0.4, 10), mat.socks, 0, -0.6, 0);
    pivot.add(shin);

    const boot = part(new THREE.BoxGeometry(0.11, 0.09, 0.24), mat.boot, 0, -0.83, 0.05);
    pivot.add(boot);

    group.add(pivot);
    return pivot;
  };
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  return {
    group,
    parts: { head, hair, torso, shoulders, armL, armR, legL, legR, hips },
    number,
  };
}

/**
 * Poses a player for a given phase.
 *
 * @param {object} player   result of buildPlayer
 * @param {number} phase    run cycle phase in radians
 * @param {number} speed    0 = standing, 1 = sprinting
 * @param {number} kick     0..1 blend into a kicking motion
 */
export function posePlayer(player, phase, speed = 1, kick = 0) {
  const { parts } = player;

  const swing = Math.sin(phase) * 0.85 * speed;
  const swingB = Math.sin(phase + Math.PI) * 0.85 * speed;

  parts.legL.rotation.x = swing;
  parts.legR.rotation.x = swingB;
  parts.armL.rotation.x = swingB * 0.8;
  parts.armR.rotation.x = swing * 0.8;

  // Upper body bob
  parts.hips.position.y = 0.92 + Math.abs(Math.sin(phase)) * 0.05 * speed;
  parts.torso.position.y = 1.28 + Math.abs(Math.sin(phase)) * 0.05 * speed;
  parts.shoulders.position.y = 1.5 + Math.abs(Math.sin(phase)) * 0.05 * speed;
  parts.head.position.y = 1.72 + Math.abs(Math.sin(phase)) * 0.05 * speed;
  parts.hair.position.y = 1.73 + Math.abs(Math.sin(phase)) * 0.05 * speed;

  if (kick > 0) {
    // Plant and swing the right leg through
    parts.legR.rotation.x = -kick * 1.5;
    parts.legL.rotation.x = swing * 0.4;
    parts.armL.rotation.x = -kick * 0.7;
    parts.armR.rotation.x = kick * 0.4;
    parts.torso.rotation.x = -kick * 0.18;
  } else {
    parts.torso.rotation.x = 0;
  }
}
