import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const seeded = (value) => {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export class BankBranchApp {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;
    this.characterParts = {};
    this.clock = new THREE.Clock();
    this._dead = false;
    this.seed = 601;
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.addLights();
    this.createProceduralCharacter();
    this.animate();
    return this;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b111c);
    this.scene.fog = new THREE.Fog(0x0b111c, 16, 44);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 200);
    this.camera.position.set(2.8, 1.65, 4.6);
    this.homeCamera = [2.8, 1.65, 4.6];
    this.homeTarget = [0, 1.24, -0.4];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(...this.homeTarget);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 18;
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0xa8bdd6, 0.65));
    const key = new THREE.DirectionalLight(0xdbe8ff, 1.2);
    key.position.set(-4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    this.scene.add(key);
    const strip = new THREE.PointLight(0xffd9a0, 0.9, 12);
    strip.position.set(1.6, 2.6, -1.4);
    this.scene.add(strip);
    this.lights = { key, strip };
  }

  material(color, emissive = 0x000000) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.08, emissive });
  }

  box(width, height, depth, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();
    const root = new THREE.Group();
    const mat = {
      wall: this.material(0x16202e),
      floor: this.material(0x1b2430),
      glass: new THREE.MeshStandardMaterial({ color: 0x8fb6c8, transparent: true, opacity: 0.28, roughness: 0.25, metalness: 0.1 }),
      counter: this.material(0x2c3846),
      metal: this.material(0x9aa6b2, 0x0a0d12),
      gold: this.material(0xd8b26a, 0x4a3208),
      paper: this.material(0xe9e2d3),
      screen: this.material(0x102a3c, 0x0b354c),
      red: this.material(0x8f1d25),
    };

    this.box(11, 3.6, 0.2, mat.wall, 0, 1.8, -3.6, root);
    this.box(0.2, 3.6, 7.2, mat.wall, -5.5, 1.8, 0, root);
    this.box(0.2, 3.6, 7.2, mat.wall, 5.5, 1.8, 0, root);
    this.box(11, 0.16, 7.2, mat.floor, 0, -0.08, 0, root);

    const counter = this.box(4.4, 1.05, 0.8, mat.counter, -0.5, 0.52, -0.9, root);
    this.box(4.5, 0.08, 0.9, mat.metal, -0.5, 1.07, -0.9, root);
    for (let i = 0; i < 5; i += 1) {
      const x = -2.3 + i * 0.9;
      this.box(0.05, 1.6, 0.05, mat.metal, x, 2.3, -1.85, root);
    }
    this.box(4.6, 1.65, 0.06, mat.glass, -0.5, 2.1, -1.85, root);
    this.box(4.7, 0.08, 0.12, mat.metal, -0.5, 2.95, -1.85, root);

    const folder = this.box(0.9, 0.07, 0.62, mat.red, -1.1, 1.13, -0.75, root);
    folder.rotation.y = -0.18;
    this.box(0.9, 0.02, 0.62, mat.paper, -1.05, 1.18, -0.7, root);
    const stamp = this.box(0.26, 0.3, 0.26, mat.gold, 1.25, 1.24, -0.8, root);

    const queueTicker = new THREE.Group();
    this.box(1.7, 0.5, 0.08, mat.screen, 3.2, 2.2, -3.48, queueTicker);
    for (let i = 0; i < 4; i += 1) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), mat.gold);
      dot.position.set(2.62 + i * 0.36, 2.2, -3.42);
      dot.userData.phase = i;
      queueTicker.add(dot);
    }
    root.add(queueTicker);

    const desk = this.box(1.5, 0.06, 0.8, mat.counter, 3.0, 0.9, 0.5, root);
    this.box(0.1, 0.9, 0.1, mat.metal, 2.4, 0.45, 0.5, root);
    this.box(0.1, 0.9, 0.1, mat.metal, 3.6, 0.45, 0.5, root);
    const armbandDesk = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 10, 24), mat.gold);
    armbandDesk.position.set(3.1, 0.98, 0.45);
    armbandDesk.rotation.x = Math.PI / 2;
    root.add(armbandDesk);

    const doorway = this.box(1.1, 2.2, 0.12, mat.metal, 4.9, 1.1, -3.5, root);
    doorway.material = this.material(0x243445, 0x101820);

    this.characterParts = {
      counter, folder, stamp, queueTicker, desk, armbandDesk, doorway,
      glass: root.children.find((child) => child.material === mat.glass),
    };
    this.character = root;
    this.scene.add(root);
    return root;
  }

  update(frame) {
    const ticker = this.characterParts?.queueTicker;
    if (!ticker) return;
    for (const child of ticker.children) {
      if (child.userData.phase === undefined) continue;
      const pulse = seeded(this.seed + child.userData.phase + Math.floor(frame / 18));
      child.scale.setScalar(0.8 + pulse * 0.45);
    }
    if (this.lights?.strip) {
      this.lights.strip.intensity = 0.85 + seeded(this.seed + Math.floor(frame / 12)) * 0.12;
    }
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    this.update(Math.floor(this.clock.getElapsedTime() * 30));
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.scene && this.character) {
      this.scene.remove(this.character);
      this.character.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (m?.map) m.map.dispose();
          m?.dispose();
        });
      });
    }
    this.character = null;
    this.characterParts = {};
  }
}
