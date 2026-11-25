import * as THREE from 'three';
import { ModularPitchZoneApp } from './modular-pitch-zone.js';

/**
 * PitchCrisisNight — Episode 9's added-debt visual hook. Reuses the shared
 * penalty-box zone and perimeter (stands, ad boards, instanced crowd) but swaps
 * to a night sky and adds one hero floodlight tower inside the camera frame.
 *
 * The tower is deliberately placed behind the goal at (-5.6, 0, -4.6) so the
 * opening close-up and the later wide shot can both see it. Sparks are seeded
 * from the tower index; no Math.random() is used anywhere in this environment.
 */
export class PitchCrisisNightApp extends ModularPitchZoneApp {
  constructor(container) {
    super(container, 'crisis');
    this.skyTop = 0x080f1c;
    this.skyBottom = 0x17263d;
    this.fogColor = 0x101a2b;
    this.heroTowerIndex = -1;
    this.heroTower = null;
    this.tapeStrips = [];
    this.sparkMaterial = null;
  }

  setupScene() {
    super.setupScene();
    this.scene.background = new THREE.Color(this.skyBottom);
    this.scene.fog = new THREE.Fog(this.fogColor, 18, 52);
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0x6a80a8, 0.72);
    ambient.name = 'nightAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0x7c9ccc, 0x1a281c, 0.8);
    hemi.name = 'nightHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    const moon = new THREE.DirectionalLight(0xa8c4ec, 0.95);
    moon.position.set(7, 12, 6);
    this.scene.add(moon);
    this.lights.moon = moon;

    const flood = new THREE.SpotLight(0xfff0c0, 11, 28, 0.7, 0.6, 1.6);
    flood.position.set(-5.6, 7.4, -4.6);
    flood.target.position.set(-4, 0, 0);
    flood.castShadow = true;
    this.scene.add(flood, flood.target);
    this.lights.flood = flood;
    this.lights.sun = flood;

    const backup = new THREE.DirectionalLight(0xb4c8e8, 0.55);
    backup.position.set(6, 5, -6);
    this.scene.add(backup);
    this.lights.fill = backup;
  }

  createProceduralCharacter() {
    const group = super.createProceduralCharacter();

    const hero = this.buildFloodlightTower(-5.6, -4.6, this.stadium.towers.length, {
      height: 7.4,
      hero: true,
    }, group);
    this.heroTowerIndex = hero.index;
    this.heroTower = hero;
    hero.group.name = 'FloodlightTower';
    this.anchors.floodTower = hero.group;
    this.anchors.floodLampMaterial = hero.panelMaterial;
    this.anchors.sparks = hero.sparks;
    this.sparkMaterial = hero.sparks.material;

    const tapeGroup = new THREE.Group();
    tapeGroup.name = 'CautionTape';
    const tapeMat = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i += 1) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.16), tapeMat);
      strip.position.set(-3 + i * 1, 0.9, 4.4);
      strip.rotation.z = (i % 2 ? 1 : -1) * 0.12;
      tapeGroup.add(strip);
      this.tapeStrips.push(strip);
    }
    group.add(tapeGroup);
    this.anchors.cautionTape = tapeGroup;

    return group;
  }

  /** Called from the scene director's onFrame so the failure reads at a glance. */
  setCrisisFrame(frame) {
    const blown = frame >= 18;
    const flicker = blown ? (Math.sin(frame * 1.7) > 0.25 ? 0.18 : 0) : 1;
    if (this.lights.flood) this.lights.flood.intensity = 11 * flicker;

    if (this.heroTowerIndex >= 0) {
      this.setFloodlightExploded(this.heroTowerIndex, blown, 18);
      this.updateFloodlights(frame);
    }

    if (this.anchors.floodLampMaterial) {
      this.anchors.floodLampMaterial.color.setHex(flicker > 0.5 ? 0xffe9a8 : 0x3a3426);
    }
    if (this.sparkMaterial) {
      this.sparkMaterial.opacity = blown
        ? 0.55 + 0.4 * Math.abs(Math.sin(frame * 0.9))
        : 0;
    }
    this.tapeStrips.forEach((strip, i) => {
      strip.rotation.z = (i % 2 ? 1 : -1) * 0.12 + Math.sin(frame * 0.2 + i * 0.8) * 0.05;
    });
    if (this.anchors.ball) this.anchors.ball.visible = frame < 18;
  }

  dispose() {
    super.dispose();
    if (this.sparkMaterial) this.sparkMaterial.dispose();
    this.sparkMaterial = null;
    this.heroTower = null;
    this.tapeStrips = [];
  }
}
