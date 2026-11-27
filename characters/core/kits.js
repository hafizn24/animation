import * as THREE from 'three';

/**
 * Shared football-kit building blocks.
 *
 * Karim, Azam and the generic soccer rig all print a name / number onto the
 * jersey, so the canvas painters live here once and each rig only decides
 * *when* the print is visible.
 */

const makeTexture = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const hex = (value) => '#' + new THREE.Color(value).getHexString();

/**
 * Vertical shirt stripes. Karim / Azam use the 512px sheet; the generic
 * soccer rig historically used 1024px, so the size is configurable.
 */
export function createStripedTexture(primaryHex, secondaryHex, opts = {}) {
  const { size = 512, stripes = 12, hemHex = 0x16181d, hemRatio = 14 / 512 } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c1 = hex(primaryHex);
  const c2 = hex(secondaryHex);
  const stripeWidth = canvas.width / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? c1 : c2;
    ctx.fillRect(Math.floor(i * stripeWidth), 0, Math.ceil(stripeWidth), canvas.height);
  }
  ctx.fillStyle = hex(hemHex);
  ctx.fillRect(0, canvas.height - Math.round(size * hemRatio), canvas.width, Math.round(size * hemRatio));
  const texture = makeTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

/** Rear shirt plaque: cream card, club-coloured border, SURNAME + number. */
export function createBackNameTexture(name, number, opts = {}) {
  const {
    size = 512,
    background = '#f7f4ea',
    border = '#b80f20',
    nameFill = '#b80f20',
    numberFill = '#15171c',
  } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = border;
  ctx.lineWidth = Math.round(size * 14 / 512);
  const inset = Math.round(size * 16 / 512);
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);
  ctx.fillStyle = nameFill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(size * 86 / 512)}px Arial, sans-serif`;
  ctx.fillText(String(name).toUpperCase(), size / 2, size * 155 / 512);
  ctx.fillStyle = numberFill;
  ctx.font = `bold ${Math.round(size * 260 / 512)}px Arial Black, Arial, sans-serif`;
  ctx.fillText(String(number), size / 2, size * 350 / 512);
  return makeTexture(canvas);
}

/** Front chest print: outlined SURNAME over a big number on a clear card. */
export function createFrontNameTexture(name, number, opts = {}) {
  const { size = 256, fill = '#ffffff', stroke = '#15171c' } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 6;
  ctx.font = `bold ${Math.round(size * 46 / 256)}px Arial, sans-serif`;
  ctx.strokeText(String(name).toUpperCase(), size / 2, size * 58 / 256);
  ctx.fillText(String(name).toUpperCase(), size / 2, size * 58 / 256);
  ctx.font = `bold ${Math.round(size * 132 / 256)}px Arial Black, Arial, sans-serif`;
  ctx.strokeText(String(number), size / 2, size * 158 / 256);
  ctx.fillText(String(number), size / 2, size * 158 / 256);
  return makeTexture(canvas);
}

/** Captain's armband band texture – gold ground, single dark glyph. */
export function createArmbandTexture(letter = 'C', opts = {}) {
  const { width = 128, height = 64, background = '#d8b26a', fill = '#15171c' } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = fill;
  ctx.font = `bold ${Math.round(height * 44 / 64)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(letter), width / 2, height * 34 / 64);
  return makeTexture(canvas);
}

/**
 * Swaps a jersey print texture in place, disposing the previous one so a
 * long render never leaks canvases.
 */
export function replacePrintTexture(material, texture) {
  if (!material) return;
  if (material.map) material.map.dispose();
  material.map = texture;
  if ('emissiveMap' in material && material.emissiveMap) material.emissiveMap = texture;
  material.needsUpdate = true;
}

/**
 * Division 5 club kit palettes — locked to `remotion/story/division-5-clubs.md`.
 * `buluh` mirrors the existing red/white Buluh FC kit; the other eleven are
 * the opponent sides introduced when each club first appears on screen.
 */
export const DIVISION_5_CLUBS = {
  buluh: { name: 'Buluh FC', primary: 0xde1326, secondary: 0xffffff },
  'harimau-lembah': { name: 'Harimau Lembah FC', primary: 0xf2a71b, secondary: 0x15171c },
  'putra-pelabuhan': { name: 'Putra Pelabuhan FC', primary: 0x1d3a6e, secondary: 0xffffff },
  'metro-selatan': { name: 'Metro Selatan FC', primary: 0x0f8f8f, secondary: 0xc9ced6 },
  'kota-tua': { name: 'Kota Tua FC', primary: 0x7a1f2b, secondary: 0xf3ead8 },
  'sri-anggerik': { name: 'Sri Anggerik FC', primary: 0x6d3fa0, secondary: 0xd8b26a },
  'puncak-bumi': { name: 'Puncak Bumi FC', primary: 0x1e5c31, secondary: 0xf2c744 },
  'bintang-timur': { name: 'Bintang Timur FC', primary: 0xc21f2c, secondary: 0xffffff },
  'rimba-raya': { name: 'Rimba Raya FC', primary: 0x14532d, secondary: 0xe8641c },
  'sungai-bunyi': { name: 'Sungai Bunyi FC', primary: 0xf2c744, secondary: 0x1d4ed8 },
  'padang-lalang': { name: 'Padang Lalang FC', primary: 0xb02a2a, secondary: 0x15803d },
  'menara-gading': { name: 'Menara Gading FC', primary: 0xf3efe2, secondary: 0x1e3a6e },
};

/** Builds the striped jersey texture for one of the 12 Division 5 clubs. */
export function createClubKitTexture(clubId, opts = {}) {
  const club = DIVISION_5_CLUBS[clubId];
  if (!club) {
    throw new Error(`Unknown Division 5 club "${clubId}". Known: ${Object.keys(DIVISION_5_CLUBS).join(', ')}`);
  }
  return createStripedTexture(club.primary, club.secondary, opts);
}
