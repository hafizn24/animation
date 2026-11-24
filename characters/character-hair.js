import * as THREE from 'three';

/**
 * Shared hairstyle builder used by every character in the viewer.
 *
 * Styles are built against the standard head rig used across the codebase:
 * a 0.46 radius sphere centred at y = 0.36 inside a head group placed at
 * y = 1.95. Every style therefore sits correctly on any character.
 */

export const HAIR_STYLES = [
  'crop',
  'messy',
  'buzz',
  'swept',
  'sidePart',
  'long',
  'afro',
  'receding',
  'bald'
];

/**
 * Builds a hairstyle group.
 *
 * @param {string} style        one of HAIR_STYLES
 * @param {THREE.Material} material  hair material (toon, shared per character)
 * @param {Function} createOutlinedMesh  (geometry, material, thickness) => Object3D
 * @param {number} radius       head radius, so the hair scales with the head
 * @param {number} offsetY      vertical offset of the head centre
 * @returns {THREE.Group} the hair group, parented to the head group
 */
export function createHairstyle(style, material, createOutlinedMesh, radius = 0.46, offsetY = 0) {
  const group = new THREE.Group();
  group.name = 'Hair';

  // Hair sits on the same head sphere as the scalp. Keep the hair material
  // biased toward the camera so the shared scalp/hair surface never z-fights.
  if (material) {
    material.polygonOffset = true;
    material.polygonOffsetFactor = -1;
    material.polygonOffsetUnits = -1;
    material.needsUpdate = true;
  }

  const add = (geometry, thickness = 0.028) => {
    const mesh = createOutlinedMesh(geometry, material, thickness);
    group.add(mesh);
    return mesh;
  };

  switch (style) {
    // Very short, close to the scalp
    case 'buzz': {
      const cap = add(new THREE.SphereGeometry(0.484, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.30));
      cap.position.y = 0.352;
      break;
    }

    // Short hair with an even fringe
    case 'crop': {
      const cap = add(new THREE.SphereGeometry(0.484, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.40));
      cap.position.y = 0.348;
      const fringe = add(new THREE.SphereGeometry(0.2, 16, 12));
      fringe.position.set(0, 0.47, 0.31);
      fringe.scale.set(1.55, 0.55, 0.75);
      break;
    }

    // Short hair pushed up and out of place
    case 'messy': {
      const cap = add(new THREE.SphereGeometry(0.484, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.40));
      cap.position.y = 0.348;
      const tufts = [
        [0.16, 0.60, 0.16, 0.19],
        [-0.22, 0.55, 0.02, 0.17],
        [0.04, 0.62, -0.24, 0.16],
        [-0.08, 0.58, 0.26, 0.15]
      ];
      tufts.forEach(([tx, ty, tz, r]) => {
        const tuft = add(new THREE.SphereGeometry(r, 14, 12));
        tuft.position.set(tx, ty, tz);
        tuft.scale.set(1, 0.7, 1);
      });
      break;
    }

    // Volume swept back off the forehead
    case 'swept': {
      const cap = add(new THREE.SphereGeometry(0.488, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.38));
      cap.position.y = 0.345;
      const quiff = add(new THREE.SphereGeometry(0.30, 20, 16));
      quiff.position.set(0.03, 0.60, 0.17);
      quiff.scale.set(1.02, 0.72, 1.06);
      const sweep = add(new THREE.SphereGeometry(0.22, 16, 14));
      sweep.position.set(-0.17, 0.53, 0.26);
      sweep.scale.set(1.25, 0.52, 0.85);
      sweep.rotation.z = 0.5;
      break;
    }

    // Neat side part
    case 'sidePart': {
      const cap = add(new THREE.SphereGeometry(0.484, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.38));
      cap.position.y = 0.348;
      const parting = add(new THREE.SphereGeometry(0.23, 16, 14));
      parting.position.set(0.13, 0.50, 0.30);
      parting.scale.set(1.3, 0.55, 0.85);
      parting.rotation.z = -0.35;
      break;
    }

    // Longer hair falling past the ears
    case 'long': {
      const cap = add(new THREE.SphereGeometry(0.498, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.46));
      cap.position.y = 0.345;
      [-1, 1].forEach((dir) => {
        const side = add(new THREE.SphereGeometry(0.22, 16, 14));
        side.position.set(dir * 0.40, 0.16, -0.02);
        side.scale.set(0.85, 1.5, 1.05);
        const fringe = add(new THREE.SphereGeometry(0.19, 16, 14));
        fringe.position.set(dir * 0.19, 0.45, 0.30);
        fringe.scale.set(1.1, 0.6, 0.8);
        fringe.rotation.z = dir * 0.25;
      });
      break;
    }

    // Rounded volume
    case 'afro': {
      const cap = add(new THREE.SphereGeometry(0.568, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56));
      cap.position.y = 0.325;
      cap.scale.set(1, 0.92, 1);
      const bumps = [
        [0.28, 0.66, 0.16, 0.20],
        [-0.30, 0.60, -0.10, 0.18],
        [0.05, 0.74, -0.26, 0.19]
      ];
      bumps.forEach(([bx, by, bz, r]) => {
        const bump = add(new THREE.SphereGeometry(r, 14, 12));
        bump.position.set(bx, by, bz);
      });
      break;
    }

    // High hairline with hair only at the sides and back
    case 'receding': {
      const band = add(new THREE.SphereGeometry(
        0.484, 26, 20,
        Math.PI * 0.72, Math.PI * 1.56,
        Math.PI * 0.30, Math.PI * 0.70
      ));
      band.position.y = 0.348;
      const sideBurn = add(new THREE.BoxGeometry(0.09, 0.15, 0.14));
      sideBurn.position.set(-0.40, 0.28, 0.10);
      const sideBurn2 = add(new THREE.BoxGeometry(0.09, 0.15, 0.14));
      sideBurn2.position.set(0.40, 0.28, 0.10);
      break;
    }

    // Deliberately bald
    case 'bald':
    default:
      break;
  }

  // Match the hairstyle to the head it sits on
  group.scale.setScalar(radius / 0.46);
  group.position.y = offsetY;

  return group;
}
