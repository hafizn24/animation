import * as THREE from 'three';
import { AzamApp } from './character-azam.js';

function makeSquadApp(name, number, { hair = 'crop', keeper = false } = {}) {
  return class SquadVariantApp extends AzamApp {
    constructor(container) {
      super(container);
      this.hairStyle = hair;
      if (keeper) {
        this.outfits.matchJersey = {
          ...this.outfits.matchJersey,
          jerseyPrimary: 0x182433,
          jerseySecondary: 0xf2b41c,
          shorts: 0x111827,
          socks: 0xf2b41c,
          sockStripes: 0x182433,
          cleats: 0x111111,
        };
      }
    }

    createBackNameTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#de1326';
      ctx.lineWidth = 14;
      ctx.strokeRect(16, 16, 480, 480);
      ctx.fillStyle = '#b80f20';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 78px Arial, sans-serif';
      ctx.fillText(name, 256, 155);
      ctx.fillStyle = '#15171c';
      ctx.font = 'bold 260px Arial Black, Arial, sans-serif';
      ctx.fillText(String(number), 256, 350);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    }

    createFrontNameTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 256);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#15171c';
      ctx.lineWidth = 6;
      ctx.font = `bold ${name.length > 6 ? 30 : 38}px Arial, sans-serif`;
      ctx.strokeText(name, 128, 58);
      ctx.fillText(name, 128, 58);
      ctx.font = 'bold 132px Arial Black, Arial, sans-serif';
      ctx.strokeText(String(number), 128, 158);
      ctx.fillText(String(number), 128, 158);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    }
  };
}

export const ManafApp = makeSquadApp('MANAF', 1, { hair: 'crop', keeper: true });
export const IskandarApp = makeSquadApp('ISKANDAR', 8, { hair: 'crop' });
