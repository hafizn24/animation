import * as THREE from 'three';

/**
 * Canvas textures used by the matchday scene.
 * Everything is procedural - no external assets.
 */

export function makeCanvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Dusk sky behind the floodlights */
export function createSkyTexture() {
  return makeCanvasTexture(64, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#0b1430');
    grad.addColorStop(0.42, '#1d2c52');
    grad.addColorStop(0.68, '#4a4a6b');
    grad.addColorStop(0.86, '#9a6a52');
    grad.addColorStop(1.0, '#d69a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // A soft band of stadium haze near the horizon
    const haze = ctx.createLinearGradient(0, h * 0.78, 0, h);
    haze.addColorStop(0, 'rgba(255,190,120,0)');
    haze.addColorStop(1, 'rgba(255,190,120,0.35)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
  });
}

/** Classic football – white with black pentagons */
export function createBallTexture() {
  return makeCanvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f6f6f2';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#14161a';
    const pent = (cx, cy, r, rot) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * Math.PI * 2) / 5;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };
    for (let x = 26; x < w + 40; x += 62) {
      pent(x, h * 0.3, h * 0.22, -Math.PI / 2);
      pent(x + 31, h * 0.76, h * 0.22, -Math.PI / 2);
    }
  });
}

/** Advertising hoarding */
export function createAdTexture(text, bg = '#f2f2ee', fg = '#101216') {
  return makeCanvasTexture(512, 96, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.globalAlpha = 1;
    ctx.fillStyle = fg;
    ctx.font = 'bold 46px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 2);
  });
}

/** Goal net – a transparent grid */
export function createNetTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(236,240,245,0.85)';
    ctx.lineWidth = 2;
    const cell = 16;
    for (let x = 0; x <= w; x += cell) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += cell) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  });
}

/** Club crest for the hoardings */
export function createCrestTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.06);
    ctx.lineTo(w * 0.9, h * 0.22);
    ctx.lineTo(w * 0.9, h * 0.58);
    ctx.quadraticCurveTo(w * 0.9, h * 0.85, w * 0.5, h * 0.96);
    ctx.quadraticCurveTo(w * 0.1, h * 0.85, w * 0.1, h * 0.58);
    ctx.lineTo(w * 0.1, h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8d9a8';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = '#f4f1e4';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.36, w * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f4f1e4';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.7);
    ctx.lineTo(w * 0.5, h * 0.44);
    ctx.stroke();
  });
}

/** Deterministic pseudo random generator (no Math.random in renders) */
export function createRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
