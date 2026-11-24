import * as THREE from 'three';
import { ModularPitchZoneApp } from './modular-pitch-zone.js';

/**
 * PitchHeroStandApp — the Episode 12 finale set.
 *
 * Reuses the shared penalty-box zone and stadium perimeter, then adds the one
 * thing Season 1 never had: a close, floodlit grandstand the camera can shoot
 * INTO. Karim watches the final from the second tier (anchors.heroSpot), the
 * Buluh FC banner flips to "JUARA" after the payout (setBanner / flipBanner),
 * and seeded confetti falls once the title is won (updateConfetti).
 *
 * Deterministic: every flag, confetti piece and crowd seat is placed from
 * seededUnit(); no Math.random() anywhere.
 */

const seededUnit = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Floodlit-finale grade: cool night key, hot white flood key on the stand. */
export function heroStandGrade(scene, env) {
  if (env.lights?.ambient) env.lights.ambient.intensity = 0.62;
  if (env.lights?.hemi) env.lights.hemi.intensity = 0.42;
  if (env.lights?.flood) env.lights.flood.intensity = 12;
  if (env.lights?.fill) env.lights.fill.intensity = 0.5;
}

export class PitchHeroStandApp extends ModularPitchZoneApp {
  constructor(container) {
    // Reuse the tested 'penalty' zone geometry (goal, box lines, spot) as the
    // pitch floor; the hero stand, flags, crowd and confetti are added on top.
    // No change to modular-pitch-zone.js is required.
    super(container, 'penalty');
    this.skyTop = 0x0a1226;
    this.skyBottom = 0x1b2a4a;
    this.fogColor = 0x131f36;
    this.heroCrowd = null;
    this.heroCrowdBase = [];
    this.flags = [];
    this.confetti = null;
    this.confettiBase = [];
    this._confettiActive = false;
  }

  setupScene() {
    super.setupScene();
    this.scene.background = new THREE.Color(this.skyBottom);
    this.scene.fog = new THREE.Fog(this.fogColor, 20, 58);
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0x7d92b8, 0.62);
    ambient.name = 'heroAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0x8aa6d8, 0x1c2a1e, 0.42);
    hemi.name = 'heroHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    // Floodlight rig on the stand side: hot white key aimed at the pitch.
    const flood = new THREE.SpotLight(0xfff2d0, 12, 34, 0.72, 0.55, 1.5);
    flood.position.set(-2.5, 9.2, -9.5);
    flood.target.position.set(-1, 0, 1.5);
    flood.castShadow = true;
    this.scene.add(flood, flood.target);
    this.lights.flood = flood;
    this.lights.sun = flood;

    const fill = new THREE.DirectionalLight(0xbcd0f0, 0.5);
    fill.position.set(7, 6, 8);
    this.scene.add(fill);
    this.lights.fill = fill;
  }

  createProceduralCharacter() {
    const group = super.createProceduralCharacter();
    this.buildHeroStand(group);
    this.buildHeroCrowd(group);
    this.buildFlags(group);
    this.buildConfetti(group);
    return group;
  }

  /** The close grandstand: three tiers, roof, railing and the JUARA banner. */
  buildHeroStand(group) {
    const stand = new THREE.Group();
    stand.name = 'HeroStand';

    const concrete = new THREE.MeshStandardMaterial({ color: 0x2a3444, roughness: 0.95 });
    const concreteAlt = new THREE.MeshStandardMaterial({ color: 0x334054, roughness: 0.95 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f6d4b, roughness: 0.9 });

    const tiers = [
      { y: 0.75, z: -7.4 },
      { y: 1.35, z: -8.3 },
      { y: 1.95, z: -9.2 },
    ];
    tiers.forEach((tier, index) => {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 1.9), index % 2 ? concreteAlt : concrete);
      slab.position.set(0, tier.y, tier.z);
      slab.castShadow = true;
      slab.receiveShadow = true;
      stand.add(slab);

      const seatRow = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.1, 0.5), seatMat);
      seatRow.position.set(0, tier.y + 0.24, tier.z + 0.45);
      stand.add(seatRow);
    });

    // Front wall under tier 1 so the pitch side reads as solid architecture.
    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 0.62, 0.3), concrete);
    wall.position.set(0, 0.31, -6.9);
    stand.add(wall);

    // Railing along every tier front.
    const railMat = new THREE.MeshStandardMaterial({ color: 0x8792a3, metalness: 0.6, roughness: 0.45 });
    const rail = new THREE.Group();
    rail.name = 'HeroRail';
    tiers.forEach((tier) => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 13.6, 10), railMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, tier.y + 0.62, tier.z + 0.85);
      rail.add(bar);
      for (let i = 0; i < 12; i += 1) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 8), railMat);
        post.position.set(-6.5 + i * 1.18, tier.y + 0.31, tier.z + 0.85);
        rail.add(post);
      }
    });
    stand.add(rail);

    // Roof on two leaning pylons.
    const roof = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.16, 3.4), concreteAlt);
    roof.position.set(0, 3.7, -8.7);
    roof.rotation.x = 0.08;
    stand.add(roof);
    [-6.6, 6.6].forEach((x) => {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.4, 10), railMat);
      pylon.position.set(x, 2.0, -9.9);
      stand.add(pylon);
      const backPylon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.0, 10), railMat);
      backPylon.position.set(x, 1.8, -7.6);
      stand.add(backPylon);
    });

    // The JUARA banner, canvas-driven and flip-ready (setBanner / flipBanner).
    this.bannerTexture = this.makeBannerTexture('BULUH FC', '#de1326');
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(9.2, 1.5),
      new THREE.MeshBasicMaterial({ map: this.bannerTexture, side: THREE.DoubleSide })
    );
    banner.name = 'HeroBanner';
    banner.position.set(0, 2.62, -9.85);
    banner.rotation.x = -0.06;
    stand.add(banner);

    group.add(stand);
    this.anchors.heroStand = stand;
    this.anchors.rail = rail;
    this.anchors.banner = banner;

    // Karim's seat on the second tier, centre-left of the goal mouth.
    const heroSpot = new THREE.Object3D();
    heroSpot.name = 'HeroSpot';
    heroSpot.position.set(0.9, 1.62, -8.35);
    group.add(heroSpot);
    this.anchors.heroSpot = heroSpot;
  }

  makeBannerTexture(text, primary = '#de1326') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 168;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f7f4ea';
    ctx.fillRect(0, 10, canvas.width, 6);
    ctx.fillRect(0, canvas.height - 16, canvas.width, 6);
    ctx.font = 'bold 92px Arial Black, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /** Swap the stand banner copy (e.g. BULUH FC -> JUARA after the payout). */
  setBanner(text, primary = '#de1326') {
    const texture = this.makeBannerTexture(text, primary);
    if (this.bannerTexture) this.bannerTexture.dispose();
    this.bannerTexture = texture;
    if (this.anchors.banner) this.anchors.banner.material.map = texture;
  }

  flipBanner() {
    this.setBanner('JUARA DIVISYEN 5', '#f7f4ea');
  }

  /** Seeded supporters on the three tiers, mixed Buluh red / street clothes. */
  buildHeroCrowd(group) {
    const palette = [0xde1326, 0xf2f2ee, 0x1b1d22, 0xd8b26a, 0x2b6cb0, 0xde1326];
    const tiers = [
      { y: 0.98, z: -7.4, count: 30 },
      { y: 1.58, z: -8.3, count: 30 },
      { y: 2.18, z: -9.2, count: 30 },
    ];
    const total = tiers.reduce((sum, tier) => sum + tier.count, 0);
    const geometry = new THREE.BoxGeometry(0.16, 0.42, 0.16);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const crowd = new THREE.InstancedMesh(geometry, material, total);
    crowd.name = 'HeroCrowd';
    crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crowd.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let index = 0;
    tiers.forEach((tier, tierIndex) => {
      for (let seat = 0; seat < tier.count; seat += 1) {
        const seed = tierIndex * 1000 + seat * 13;
        const x = -6.3 + (seat / (tier.count - 1)) * 12.6 + (seededUnit(seed) - 0.5) * 0.22;
        const z = tier.z + 0.42 + (seededUnit(seed + 3) - 0.5) * 0.2;
        const y = tier.y + 0.3;
        const yaw = (seededUnit(seed + 7) - 0.5) * 0.3;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, yaw, 0);
        dummy.updateMatrix();
        crowd.setMatrixAt(index, dummy.matrix);
        color.setHex(palette[(tierIndex + seat) % palette.length]);
        crowd.setColorAt(index, color);
        this.heroCrowdBase.push({ x, y, z, yaw, phase: seededUnit(seed + 11) * Math.PI * 2 });
        index += 1;
      }
    });
    crowd.instanceMatrix.needsUpdate = true;
    if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
    group.add(crowd);
    this.heroCrowd = crowd;
    this.anchors.heroCrowd = crowd;
  }

  /** Six corner flags along the stand roof line, seeded sway in updateFlags. */
  buildFlags(group) {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8792a3, metalness: 0.5, roughness: 0.5 });
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xde1326, side: THREE.DoubleSide });
    const flags = new THREE.Group();
    flags.name = 'HeroFlags';
    for (let i = 0; i < 6; i += 1) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), poleMat);
      pole.position.set(-6.2 + i * 2.48, 4.4, -9.9);
      flags.add(pole);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.4), flagMat.clone());
      cloth.position.set(pole.position.x + 0.34, 4.95, -9.9);
      cloth.userData.baseY = 4.95;
      cloth.userData.phase = i * 1.3;
      flags.add(cloth);
      this.flags.push(cloth);
    }
    group.add(flags);
    this.anchors.flags = flags;
  }

  updateFlags(frame) {
    this.flags.forEach((cloth) => {
      cloth.rotation.y = Math.sin(frame * 0.06 + cloth.userData.phase) * 0.28;
      cloth.position.y = cloth.userData.baseY + Math.sin(frame * 0.1 + cloth.userData.phase) * 0.045;
    });
  }

  /** Seeded falling confetti; activate after the title is won. */
  buildConfetti(group) {
    const count = 240;
    const geometry = new THREE.PlaneGeometry(0.09, 0.13);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const confetti = new THREE.InstancedMesh(geometry, material, count);
    confetti.name = 'Confetti';
    confetti.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    confetti.frustumCulled = false;
    confetti.visible = false;

    const color = new THREE.Color();
    const palette = [0xde1326, 0xf7f4ea, 0xd8b26a, 0x8fd6ff];
    for (let i = 0; i < count; i += 1) {
      const seed = i * 17;
      this.confettiBase.push({
        x: (seededUnit(seed) - 0.5) * 16,
        z: -6.5 + seededUnit(seed + 3) * 9,
        y: 3.4 + seededUnit(seed + 5) * 4.4,
        fall: 0.014 + seededUnit(seed + 7) * 0.02,
        swayPhase: seededUnit(seed + 9) * Math.PI * 2,
        swayAmp: 0.3 + seededUnit(seed + 11) * 0.5,
        spin: 0.04 + seededUnit(seed + 13) * 0.08,
      });
      color.setHex(palette[i % palette.length]);
      confetti.setColorAt(i, color);
    }
    if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
    group.add(confetti);
    this.confetti = confetti;
    this.anchors.confetti = confetti;
  }

  updateConfetti(frame, active) {
    if (!this.confetti) return;
    this._confettiActive = !!active;
    this.confetti.visible = this._confettiActive;
    if (!this._confettiActive) return;

    const dummy = new THREE.Object3D();
    const base = this.confettiBase;
    for (let i = 0; i < base.length; i += 1) {
      const item = base[i];
      const y = 3.4 + ((item.y - 3.4 - frame * item.fall) % 4.4 + 4.4) % 4.4;
      dummy.position.set(
        item.x + Math.sin(frame * 0.03 + item.swayPhase) * item.swayAmp,
        y,
        item.z
      );
      dummy.rotation.set(frame * item.spin, item.swayPhase + frame * item.spin * 0.6, 0);
      dummy.updateMatrix();
      this.confetti.setMatrixAt(i, dummy.matrix);
    }
    this.confetti.instanceMatrix.needsUpdate = true;
  }

  /** Central hook: hero-stand crowd + flags + confetti ride the shared loop. */
  updateCrowd(frame, excitement = 0.08) {
    super.updateCrowd(frame, excitement);

    if (this.heroCrowd) {
      const dummy = new THREE.Object3D();
      const base = this.heroCrowdBase;
      const amplitude = 0.02 + 0.09 * Math.max(0, excitement);
      for (let i = 0; i < base.length; i += 1) {
        const item = base[i];
        dummy.position.set(item.x, item.y + Math.sin(frame * 0.23 + item.phase) * amplitude, item.z);
        dummy.rotation.set(0, item.yaw, 0);
        dummy.updateMatrix();
        this.heroCrowd.setMatrixAt(i, dummy.matrix);
      }
      this.heroCrowd.instanceMatrix.needsUpdate = true;
    }

    this.updateFlags(frame);
    if (this._confettiActive) this.updateConfetti(frame, true);
  }

  dispose() {
    super.dispose();
    this.heroCrowd = null;
    this.heroCrowdBase = [];
    this.flags = [];
    this.confetti = null;
    this.confettiBase = [];
    if (this.bannerTexture) {
      this.bannerTexture.dispose();
      this.bannerTexture = null;
    }
  }
}
