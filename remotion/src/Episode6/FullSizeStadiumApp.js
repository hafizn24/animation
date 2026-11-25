import * as THREE from 'three';
import { StadiumApp } from '../../../environments/stadium.js';

/**
 * Remotion adapter for the existing full-size Buluh FC stadium.
 * Reuses StadiumApp's complete 64 x 100m model without starting its
 * standalone renderer, OrbitControls, or requestAnimationFrame loop.
 */
export class FullSizeStadiumApp extends StadiumApp {
  constructor(container) {
    super(container);
    this.anchors = {};
    this.lights = {};
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    ambient.name = 'pitchAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x2f5b2a, 0.6);
    hemi.name = 'pitchHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    const sun = new THREE.DirectionalLight(0xfff4dc, 1.6);
    sun.name = 'pitchSun';
    sun.position.set(-35, 45, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    this.lights.sun = sun;

    const fill = new THREE.DirectionalLight(0xd8e8ff, 0.4);
    fill.name = 'pitchFill';
    fill.position.set(35, 22, -30);
    this.scene.add(fill);
    this.lights.fill = fill;
  }

  createProceduralCharacter() {
    const root = super.createProceduralCharacter();
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.72 })
    );
    ball.name = 'Episode6Ball';
    ball.castShadow = true;
    this.scene.add(ball);

    const northGoal = root.getObjectByName('Goal_North');
    const southGoal = root.getObjectByName('Goal_South');
    this.anchors = {
      ball,
      net: northGoal || southGoal || null,
      northGoal,
      southGoal,
    };
    return root;
  }

  dispose() {
    if (this.anchors?.ball) {
      this.scene?.remove(this.anchors.ball);
      this.anchors.ball.geometry.dispose();
      this.anchors.ball.material.dispose();
    }
    this.anchors = {};
    super.dispose();
  }
}
