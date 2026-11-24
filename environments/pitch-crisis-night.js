import * as THREE from 'three';
import { ModularPitchZoneApp } from './modular-pitch-zone.js';

/**
 * PitchCrisisNight — Episode 9's added-debt visual hook. Reuses the penalty-box
 * zone, swaps to a dark night sky, adds one flickering floodlight tower, spark
 * particles and yellow caution tape across the touchline. No new stadium model.
 */
export class PitchCrisisNightApp extends ModularPitchZoneApp {
  constructor(container) {
    super(container, 'crisis');
    this.sparkMaterial = null;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070a12);
    this.scene.fog = new THREE.Fog(0x070a12, 14, 40);
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0x3b4a63, 0.34);
    ambient.name = 'nightAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0x334866, 0x0b140c, 0.25);
    hemi.name = 'nightHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    const flood = new THREE.SpotLight(0xfff0c0, 11, 26, 0.7, 0.6, 1.6);
    flood.position.set(-5, 9, 8);
    flood.target.position.set(-4, 0, 0);
    flood.castShadow = true;
    this.scene.add(flood, flood.target);
    this.lights.flood = flood;
    this.lights.sun = flood;

    const backup = new THREE.DirectionalLight(0x7f94b8, 0.3);
    backup.position.set(6, 5, -6);
    this.scene.add(backup);
    this.lights.fill = backup;
  }

  createProceduralCharacter() {
    const group = super.createProceduralCharacter();

    const tower = new THREE.Group();
    tower.name = 'FloodlightTower';
    const metal = new THREE.MeshStandardMaterial({ color: 0x4a5058, metalness: 0.6, roughness: 0.5 });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 9, 12), metal);
    mast.position.y = 4.5;
    tower.add(mast);
    const rig = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.3), metal);
    rig.position.y = 9;
    tower.add(rig);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
    [-0.85, 0, 0.85].forEach((x) => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.12), lampMat);
      lamp.position.set(x, 9, 0.22);
      tower.add(lamp);
    });
    tower.position.set(-5, 0, 8);
    group.add(tower);
    this.anchors.floodTower = tower;
    this.anchors.floodLampMaterial = lampMat;

    const tapeGroup = new THREE.Group();
    tapeGroup.name = 'CautionTape';
    const tapeMat = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.16), tapeMat);
      strip.position.set(-3 + i * 1, 0.9, 4.4);
      strip.rotation.z = (i % 2 ? 1 : -1) * 0.12;
      tapeGroup.add(strip);
    }
    group.add(tapeGroup);
    this.anchors.cautionTape = tapeGroup;

    const sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(36 * 3);
    for (let i = 0; i < 36; i++) {
      positions[i * 3] = -5 + (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 1] = 8.4 + Math.random() * 1.6;
      positions[i * 3 + 2] = 8 + (Math.random() - 0.5) * 0.8;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparkMaterial = new THREE.PointsMaterial({
      color: 0xffd070,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const sparks = new THREE.Points(sparkGeo, this.sparkMaterial);
    sparks.name = 'Sparks';
    group.add(sparks);
    this.anchors.sparks = sparks;

    return group;
  }

  /** Called from the scene director's onFrame so the failure reads at a glance. */
  setCrisisFrame(frame) {
    const blown = frame >= 18;
    const flicker = blown ? (Math.sin(frame * 1.7) > 0.25 ? 0.18 : 0) : 1;
    if (this.lights.flood) this.lights.flood.intensity = 11 * flicker;
    if (this.anchors.floodLampMaterial) {
      this.anchors.floodLampMaterial.color.setHex(flicker > 0.5 ? 0xffe9a8 : 0x3a3426);
    }
    if (this.sparkMaterial) this.sparkMaterial.opacity = blown ? 0.55 + 0.4 * Math.abs(Math.sin(frame * 0.9)) : 0;
    if (this.anchors.ball) this.anchors.ball.visible = frame < 18;
  }

  dispose() {
    super.dispose();
    if (this.sparkMaterial) this.sparkMaterial.dispose();
    this.sparkMaterial = null;
  }
}
