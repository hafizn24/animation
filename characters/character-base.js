import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle } from './character-hair.js';

/**
 * Episode 6 character base.
 * Matches the established Buluh FC asset language: stylised proportions,
 * warm toon materials, bold dark mesh outlines, shared head/hair rig and
 * soft studio shadows. Faces remain intentionally simplified.
 */
export class EpisodeCharacterApp {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;
    this.characterParts = {};
    this.clock = new THREE.Clock();
    this._dead = false;
  }

  async init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfcf9e8);
    this.camera = new THREE.PerspectiveCamera(42, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.7, 4.6);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.38, 0);

    this.scene.add(new THREE.HemisphereLight(0xfff4df, 0x6c5947, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8d8ef, 0.55);
    fill.position.set(-4, 3, -2);
    this.scene.add(fill);

    this.createCharacter();
    this.animate();
    return this;
  }

  toon(color) {
    return new THREE.MeshToonMaterial({ color, gradientMap: this.gradientMap || (this.gradientMap = this.makeGradient()) });
  }

  makeGradient() {
    const data = new Uint8Array([80, 155, 230, 255]);
    const texture = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  outlined(geometry, material, name) {
    const group = new THREE.Group();
    group.name = name;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    const outline = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x111116, side: THREE.BackSide }));
    outline.scale.set(1.035, 1.025, 1.035);
    group.add(outline);
    return group;
  }

  createCharacter() {
    const c = this.config;
    const root = new THREE.Group();
    root.name = c.name;
    const skin = this.toon(c.skin || 0xb88769);
    const hair = this.toon(c.hairColor || 0x29231f);
    const shirt = this.toon(c.shirt);
    const trousers = this.toon(c.trousers || 0x25272b);
    const shoes = this.toon(0x17191d);
    const accent = this.toon(c.accent || 0x292d33);

    const torso = this.outlined(new THREE.CylinderGeometry(0.31, 0.37, 0.72, 28), shirt, 'Torso');
    torso.position.y = 1.43;
    torso.scale.set(1.04, 1, 0.78);
    root.add(torso);

    const neck = this.outlined(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 18), skin, 'Neck');
    neck.position.set(0, 1.88, 0);
    root.add(neck);

    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.98, 0);
    const head = this.outlined(new THREE.SphereGeometry(0.46, 32, 28), skin, 'HeadShape');
    head.position.y = 0.36;
    head.scale.set(0.94, 1.08, 0.9);
    headGroup.add(head);
    headGroup.add(createHairstyle(c.hairStyle || 'sidePart', hair, this.outlined.bind(this), 0.46, 0));
    root.add(headGroup);

    const armParts = [];
    for (const side of [-1, 1]) {
      const shoulder = this.outlined(new THREE.SphereGeometry(0.19, 20, 16), shirt, side < 0 ? 'LeftShoulder' : 'RightShoulder');
      shoulder.position.set(side * 0.37, 1.68, 0);
      shoulder.scale.set(1, 1.05, 0.9);
      root.add(shoulder);
      const upper = this.outlined(new THREE.CylinderGeometry(0.105, 0.12, 0.43, 18), shirt, side < 0 ? 'LeftSleeve' : 'RightSleeve');
      upper.position.set(side * 0.43, 1.43, 0.015);
      upper.rotation.z = side * -0.13;
      root.add(upper);
      const forearm = this.outlined(new THREE.CylinderGeometry(0.075, 0.095, 0.43, 18), skin, side < 0 ? 'LeftArm' : 'RightArm');
      forearm.position.set(side * 0.47, 1.05, 0.04);
      forearm.rotation.z = side * -0.08;
      root.add(forearm);
      const hand = this.outlined(new THREE.SphereGeometry(0.095, 16, 14), skin, side < 0 ? 'LeftHand' : 'RightHand');
      hand.position.set(side * 0.48, 0.81, 0.05);
      hand.scale.set(0.8, 1.15, 0.7);
      root.add(hand);
      armParts.push(shoulder, upper, forearm, hand);
    }

    for (const side of [-1, 1]) {
      const leg = this.outlined(new THREE.CylinderGeometry(0.14, 0.12, 0.78, 20), trousers, side < 0 ? 'LeftLeg' : 'RightLeg');
      leg.position.set(side * 0.19, 0.54, 0);
      root.add(leg);
      const shoe = this.outlined(new THREE.BoxGeometry(0.2, 0.12, 0.34), shoes, side < 0 ? 'LeftShoe' : 'RightShoe');
      shoe.position.set(side * 0.19, 0.11, 0.075);
      root.add(shoe);
    }

    if (c.tie) {
      const tie = this.outlined(new THREE.BoxGeometry(0.09, 0.42, 0.045), accent, 'Tie');
      tie.position.set(0, 1.43, 0.285);
      tie.rotation.z = -0.025;
      root.add(tie);
      const knot = this.outlined(new THREE.BoxGeometry(0.1, 0.09, 0.06), accent, 'TieKnot');
      knot.position.set(0, 1.68, 0.29);
      root.add(knot);
    }
    if (c.glasses) {
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x17191d });
      for (const side of [-1, 1]) {
        const lens = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 8, 24), frameMat);
        lens.position.set(side * 0.19, 2.36, 0.395);
        root.add(lens);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.025), frameMat);
      bridge.position.set(0, 2.36, 0.4);
      root.add(bridge);
    }

    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.015;
    ground.receiveShadow = true;
    root.add(ground);

    this.character = root;
    this.characterParts = { Head: headGroup, Torso: torso, Arms: armParts };
    this.scene.add(root);
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    if (this.character) this.character.position.y = Math.sin(t * 1.7) * 0.012;
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  dispose() {
    this._dead = true;
    this.controls?.dispose();
    this.scene?.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry?.dispose();
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      mats.filter(Boolean).forEach((material) => {
        Object.values(material).forEach((value) => { if (value && value.isTexture) value.dispose(); });
        material.dispose();
      });
    });
    this.gradientMap?.dispose();
    this.character = null;
    this.characterParts = {};
  }
}
