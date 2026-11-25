import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * PlayersTunnelApp – Procedural 3D model of the Buluh FC players' tunnel.
 * Dark brick corridor opening onto a floodlit pitch – a natural vertical
 * "emerge into the light" shot for short-form drama.
 */
export class PlayersTunnelApp {
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
    this.tunnel = { halfW: 3.0, height: 3.5, length: 20 };
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
    this.scene.background = new THREE.Color(0x0a0e14);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.1, 250);
    this.camera.position.set(0, 1.65, -8.5);
    this.homeCamera = [0, 1.65, -8.5];
    this.homeTarget = [0, 1.5, 9];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.5, 9);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 40;
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0x8fa4c0, 0.35));

    for (const z of [-8, -3, 2, 7]) {
      const strip = new THREE.PointLight(0xcfe0ff, 6, 9, 2);
      strip.position.set(0, 3.2, z);
      this.scene.add(strip);
    }

    const exitLight = new THREE.DirectionalLight(0xfff2d8, 2.4);
    exitLight.position.set(0, 14, 34);
    exitLight.castShadow = true;
    exitLight.shadow.mapSize.width = 1024;
    exitLight.shadow.mapSize.height = 1024;
    exitLight.shadow.camera.left = -16;
    exitLight.shadow.camera.right = 16;
    exitLight.shadow.camera.top = 16;
    exitLight.shadow.camera.bottom = -16;
    exitLight.shadow.camera.far = 70;
    this.scene.add(exitLight);
  }

  createStdMaterial(colorHex, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: opts.roughness ?? 0.8,
      metalness: opts.metalness ?? 0,
      ...opts,
    });
  }

  makeCanvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const root = new THREE.Group();
    root.name = 'PlayersTunnel';
    const { halfW: W, height: H, length: L } = this.tunnel;
    const halfL = L / 2;

    const mat = {
      concrete: this.createStdMaterial(0x4b4f56, { roughness: 0.95 }),
      floor: this.createStdMaterial(0x393d42, { roughness: 0.9 }),
      brick: this.createStdMaterial(0xffffff, { roughness: 0.95 }),
      metal: this.createStdMaterial(0x9aa2ac, { roughness: 0.4, metalness: 0.6 }),
      dark: this.createStdMaterial(0x1b1f26, { roughness: 0.8 }),
      yellow: this.createStdMaterial(0xd8b13a, { roughness: 0.8 }),
      pitch: this.createStdMaterial(0x2c7a3f, { roughness: 0.95 }),
      strip: this.createStdMaterial(0xeaf2ff, {
        emissive: 0x9fbbe8, emissiveIntensity: 1.1, roughness: 0.4,
      }),
    };

    const box = (w, h, d, material, x, y, z, parent = root) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const brickTex = this.makeCanvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#7a5146';
      ctx.fillRect(0, 0, w, h);
      const rows = 8;
      const bh = h / rows;
      for (let r = 0; r < rows; r++) {
        const offset = r % 2 ? 32 : 0;
        for (let x = -64; x < w + 64; x += 64) {
          ctx.fillStyle = r % 3 === 0 ? '#6d463d' : '#855a4c';
          ctx.fillRect(x + offset + 2, r * bh + 2, 60, bh - 4);
        }
      }
    });
    brickTex.wrapS = THREE.RepeatWrapping;
    brickTex.wrapT = THREE.RepeatWrapping;
    brickTex.repeat.set(4, 2);
    mat.brick.map = brickTex;

    const floor = box(W * 2, 0.12, L, mat.floor, 0, -0.06, 0);
    floor.castShadow = false;
    box(W * 2, 0.08, L, mat.dark, 0, 0.02, 0);

    for (const side of [-1, 1]) {
      const wall = box(0.18, H, L, mat.brick, side * W, H / 2, 0);
      wall.receiveShadow = true;
      const skirt = box(0.22, 0.85, L, mat.concrete, side * (W - 0.06), 0.42, 0);
      skirt.castShadow = false;
    }

    const ceiling = box(W * 2, 0.16, L, mat.concrete, 0, H, 0);
    ceiling.castShadow = false;
    for (let z = -halfL + 2; z < halfL; z += 3.2) {
      box(W * 2, 0.16, 0.2, mat.dark, 0, H - 0.14, z);
    }

    box(0.08, 0.012, L - 1, mat.yellow, 0, 0.07, 0);
    for (const side of [-1, 1]) {
      box(0.07, 0.012, L - 1, mat.yellow, side * (W - 0.5), 0.07, 0);
    }

    const strips = [];
    for (const z of [-8, -3, 2, 7]) {
      const light = box(0.5, 0.07, 2.4, mat.strip, 0, H - 0.2, z);
      light.castShadow = false;
      strips.push(light);
      box(0.62, 0.1, 2.55, mat.metal, 0, H - 0.13, z);
    }

    for (const side of [-1, 1]) {
      for (const z of [-6, 0, 5]) {
        box(0.55, 0.1, 2.0, mat.concrete, side * (W - 0.45), 0.48, z);
        box(0.08, 0.45, 0.08, mat.metal, side * (W - 0.65), 0.25, z - 0.8);
        box(0.08, 0.45, 0.08, mat.metal, side * (W - 0.65), 0.25, z + 0.8);
      }
      box(0.5, 0.45, 0.5, mat.dark, side * (W - 0.35), 0.23, 3);
    }

    const boardTex = this.makeCanvasTexture(512, 320, (ctx, w, h) => {
      ctx.fillStyle = '#16233c';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d8b26a';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      ctx.fillStyle = '#f4f1e4';
      ctx.textAlign = 'center';
      ctx.font = 'bold 66px Arial, sans-serif';
      ctx.fillText('BULUH FC', w / 2, 130);
      ctx.font = '30px Arial, sans-serif';
      ctx.fillText('PLAYERS ONLY', w / 2, 195);
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('THE TUNNEL · EST. 1954', w / 2, 245);
    });
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 1.3),
      this.createStdMaterial(0xffffff, { map: boardTex, emissive: 0x1b2b4a, emissiveIntensity: 0.4 })
    );
    board.position.set(W - 0.11, 1.9, -2);
    board.rotation.y = -Math.PI / 2;
    root.add(board);

    const portalFrame = new THREE.Group();
    box(W * 2 + 0.4, 0.35, 0.35, mat.dark, 0, H + 0.1, halfL, portalFrame);
    for (const side of [-1, 1]) {
      box(0.35, H, 0.35, mat.dark, side * (W + 0.1), H / 2, halfL, portalFrame);
    }
    root.add(portalFrame);
    const pitch = box(80, 0.06, 80, mat.pitch, 0, -0.02, halfL + 40);
    pitch.castShadow = false;

    const skyTex = this.makeCanvasTexture(32, 256, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#071024');
      g.addColorStop(0.7, '#142346');
      g.addColorStop(1, '#3a4c6e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 60),
      this.createStdMaterial(0xffffff, {
        map: skyTex,
        emissive: 0x162850,
        emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    sky.position.set(0, 24, halfL + 95);
    root.add(sky);

    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 18, 10), mat.metal);
      pole.position.set(side * 19, 9, halfL + 22);
      root.add(pole);
      const rig = box(3.2, 1.2, 0.3, mat.dark, side * 19, 18, halfL + 22);
      rig.castShadow = false;
      for (let i = 0; i < 6; i++) {
        const lamp = box(0.4, 0.7, 0.12, mat.strip, side * 19 - 1.3 + i * 0.5, 18, halfL + 22.2);
        lamp.castShadow = false;
      }
    }

    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const crowd = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.42, 0.75, 0.34),
      this.createStdMaterial(0x141a24, { roughness: 1 }),
      120
    );
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 40; c++) {
        dummy.position.set(-16 + c * 0.82 + rand() * 0.15, 1.1 + r * 0.35, halfL + 5 + r * 0.7);
        dummy.scale.setScalar(0.85 + rand() * 0.3);
        dummy.rotation.y = (rand() - 0.5) * 0.4;
        dummy.updateMatrix();
        crowd.setMatrixAt(idx++, dummy.matrix);
      }
    }
    crowd.instanceMatrix.needsUpdate = true;
    root.add(crowd);

    this.characterParts = { strips, board, pitch, crowd, portalFrame };
    this.character = root;
    this.scene.add(root);
    return root;
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
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
        if (child.isMesh) {
          child.geometry.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            if (m.gradientMap) m.gradientMap.dispose();
            m.dispose();
          });
        }
      });
    }
    this.character = null;
    this.characterParts = {};
  }
}
