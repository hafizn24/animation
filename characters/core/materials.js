import * as THREE from 'three';

/**
 * One cached source gradient shared by every toon material.
 * Each material gets its own clone so a single material disposing its
 * `gradientMap` can never invalidate the rest of the cast.
 */
let gradientSource = null;

function getGradientSource() {
  if (!gradientSource) {
    const colors = new Uint8Array([215, 255]);
    gradientSource = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientSource.minFilter = THREE.NearestFilter;
    gradientSource.magFilter = THREE.NearestFilter;
    gradientSource.needsUpdate = true;
  }
  return gradientSource;
}

/** Fresh two-band toon gradient, safe to dispose with its material. */
export function createGradientMap() {
  const clone = getGradientSource().clone();
  clone.minFilter = THREE.NearestFilter;
  clone.magFilter = THREE.NearestFilter;
  clone.needsUpdate = true;
  return clone;
}

/**
 * Shared MeshToonMaterial factory.
 *
 * When a `map` is supplied the emissive channel mirrors it at intensity 0 so
 * `changeOutfit()` can tint `material.emissive` without ever glowing – the
 * exact contract the Karim / Azam / soccer kits already rely on. Without a
 * map the emissive contribution is identically black, so plain materials are
 * visually unchanged from the per-class originals.
 */
export function createToonMaterial(colorHex, map = null) {
  const baseColor = new THREE.Color(colorHex);
  return new THREE.MeshToonMaterial({
    color: baseColor,
    map: map || null,
    gradientMap: createGradientMap(),
    emissive: baseColor,
    emissiveMap: map || null,
    emissiveIntensity: 0,
  });
}

/**
 * Flat-shaded mesh wrapped in a black back-face outline shell.
 * `opts` covers the kits that opt out of shadow participation.
 */
export function createOutlinedMesh(geometry, material, outlineThickness = 0.022, opts = {}) {
  const {
    castShadow = true,
    receiveShadow = true,
    outlineCastShadow = false,
    outlineReceiveShadow = false,
  } = opts;

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  group.add(mesh);
  group.userData = { mainMesh: mesh };

  if (outlineThickness > 0) {
    const outlineMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide })
    );
    outlineMesh.scale.setScalar(1 + outlineThickness);
    outlineMesh.castShadow = outlineCastShadow;
    outlineMesh.receiveShadow = outlineReceiveShadow;
    group.add(outlineMesh);
  }

  return group;
}

/** Disposes a material plus every texture slot it holds (idempotent). */
export function disposeMaterial(material) {
  if (!material) return;
  ['map', 'emissiveMap', 'gradientMap', 'alphaMap', 'normalMap', 'aoMap'].forEach((key) => {
    if (material[key]) material[key].dispose();
  });
  material.dispose();
}
