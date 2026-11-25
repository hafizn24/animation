import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * LenderBoardroomApp – Procedural 3D model of the solicitor's boardroom where
 * Buluh FC's default notice was issued. Cold, corporate and deliberately
 * unlike the warm club manager's office.
 */
export class LenderBoardroomApp {
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
    this.roomBounds = { halfW: 5.5, halfD: 4.8, height: 3.4 };
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
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
    this.scene.background = new THREE.Color(0x111722);
    this.scene.fog = new THREE.Fog(0x111722, 22, 55);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 200);
    this.camera.position.set(3.4, 2.1, 4.6);
    this.homeCamera = [3.4, 2.1, 4.6];
    this.homeTarget = [0, 1.2, -0.6];
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
    this.controls.target.set(0, 1.2, -0.6);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0xc8d4e8, 0.55));

    const key = new THREE.DirectionalLight(0xdce8ff, 1.15);
    key.position.set(-5, 7, 6);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.left = -9;
    key.shadow.camera.right = 9;
    key.shadow.camera.top = 9;
    key.shadow.camera.bottom = -9;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 26;
    key.shadow.bias = -0.0004;
    this.scene.add(key);

    const hemi = new THREE.HemisphereLight(0xa8bcd8, 0x1a1a20, 0.5);
    this.scene.add(hemi);

    const deskLamp = new THREE.PointLight(0xffd9a0, 11, 7, 2);
    deskLamp.position.set(1.5, 1.5, 0.4);
    this.scene.add(deskLamp);

    const ceiling = new THREE.PointLight(0xe8f0ff, 9, 12, 2);
    ceiling.position.set(0, 3.1, -1.2);
    this.scene.add(ceiling);
  }

  createStdMaterial(colorHex, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: opts.roughness ?? 0.7,
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

  updateWallVisibility() {
    if (!this.camera || !this.wallCull) return;
    const p = this.camera.position;
    const { halfW, halfD, height } = this.roomBounds;
    this.wallCull.back.forEach((o) => { o.visible = p.z > -halfD - 0.05; });
    this.wallCull.front.forEach((o) => { o.visible = p.z < halfD + 0.05; });
    this.wallCull.left.forEach((o) => { o.visible = p.x > -halfW - 0.05; });
    this.wallCull.right.forEach((o) => { o.visible = p.x < halfW + 0.05; });
    this.wallCull.ceiling.forEach((o) => { o.visible = p.y < height + 0.05; });
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const root = new THREE.Group();
    root.name = 'LenderBoardroom';
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };

    const mat = {
      floor: this.createStdMaterial(0x2b2622, { roughness: 0.55 }),
      wall: this.createStdMaterial(0x2e323a, { roughness: 0.92 }),
      panel: this.createStdMaterial(0x4a3526, { roughness: 0.6 }),
      ceiling: this.createStdMaterial(0xd8dde4, { roughness: 0.95 }),
      desk: this.createStdMaterial(0x3a2618, { roughness: 0.35 }),
      leather: this.createStdMaterial(0x16181c, { roughness: 0.5 }),
      metal: this.createStdMaterial(0xb9bec6, { roughness: 0.3, metalness: 0.75 }),
      paper: this.createStdMaterial(0xe8e4d8, { roughness: 0.9 }),
      red: this.createStdMaterial(0x8d1f22, { roughness: 0.75 }),
      glass: this.createStdMaterial(0x8fb4d8, { roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.35 }),
    };

    const box = (w, h, d, material, x, y, z, parent = root) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const { halfW: W, halfD: D, height: H } = this.roomBounds;

    // Shell
    const floor = box(W * 2, 0.12, D * 2, mat.floor, 0, -0.06, 0);
    floor.castShadow = false;

    const back = box(W * 2, H, 0.14, mat.wall, 0, H / 2, -D);
    this.wallCull.back.push(back);
    const front = box(W * 2, H, 0.14, mat.wall, 0, H / 2, D);
    this.wallCull.front.push(front);
    const left = box(0.14, H, D * 2, mat.wall, -W, H / 2, 0);
    this.wallCull.left.push(left);
    const right = box(0.14, H, D * 2, mat.wall, W, H / 2, 0);
    this.wallCull.right.push(right);
    const ceiling = box(W * 2, 0.12, D * 2, mat.ceiling, 0, H, 0);
    ceiling.castShadow = false;
    this.wallCull.ceiling.push(ceiling);

    // Dark wood panelling and a rail
    for (let i = 0; i < 10; i++) {
      const x = -W + 0.5 + i * 1.0;
      box(0.82, 2.1, 0.06, mat.panel, x, 1.05, -D + 0.1);
      box(0.82, 2.1, 0.06, mat.panel, x, 1.05, D - 0.1);
    }
    box(W * 2, 0.09, 0.12, mat.metal, 0, 2.2, -D + 0.14);
    box(W * 2, 0.09, 0.12, mat.metal, 0, 2.2, D - 0.14);

    // Ceiling light panels
    for (const x of [-2.2, 2.2]) {
      const panel = box(1.5, 0.06, 0.55, this.createStdMaterial(0xeef4ff, {
        emissive: 0x8fa8c8, emissiveIntensity: 0.8,
      }), x, H - 0.09, -1.2);
      panel.castShadow = false;
    }

    // Window with blinds on the left wall – cold city night
    const cityTex = this.makeCanvasTexture(512, 320, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0a1224');
      sky.addColorStop(1, '#1d3050');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      let seed = 7;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = rand() > 0.6 ? '#f2d79a' : '#7fa6d8';
        ctx.globalAlpha = 0.25 + rand() * 0.6;
        ctx.fillRect(rand() * w, h * 0.3 + rand() * h * 0.7, 3 + rand() * 5, 4 + rand() * 9);
      }
      ctx.globalAlpha = 1;
    });
    const windowGroup = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.7), this.createStdMaterial(0xffffff, {
      map: cityTex, emissive: 0x2c4a78, emissiveIntensity: 0.55,
    }));
    glass.rotation.y = Math.PI / 2;
    glass.position.set(-W + 0.12, 1.95, 0.4);
    windowGroup.add(glass);
    for (let i = 0; i < 7; i++) {
      const slat = box(0.04, 0.1, 3.2, mat.metal, -W + 0.16, 1.25 + i * 0.23, 0.4, windowGroup);
      slat.rotation.x = 0.12;
    }
    root.add(windowGroup);

    // Main desk
    const desk = new THREE.Group();
    box(3.2, 0.1, 1.5, mat.desk, 0, 0.78, 0.8, desk);
    box(0.16, 0.75, 1.35, mat.desk, -1.45, 0.38, 0.8, desk);
    box(0.16, 0.75, 1.35, mat.desk, 1.45, 0.38, 0.8, desk);
    box(2.9, 0.6, 0.08, mat.desk, 0, 0.44, 0.1, desk);
    root.add(desk);

    // Desk lamp
    const lamp = new THREE.Group();
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.04, 16), mat.metal);
    lamp.add(lampBase);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 8), mat.metal);
    arm.position.set(0.12, 0.28, 0);
    arm.rotation.z = -0.35;
    lamp.add(arm);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.24, 16, 1, true), mat.metal);
    shade.position.set(0.28, 0.54, 0);
    shade.rotation.z = Math.PI + 0.3;
    lamp.add(shade);
    lamp.position.set(1.5, 0.84, 0.4);
    root.add(lamp);

    // Red default-notice folder on the desk
    const folder = new THREE.Group();
    box(0.78, 0.03, 1.0, mat.red, 0, 0, 0, folder);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.54, 0.28),
      this.createStdMaterial(0xffffff, { map: this.makeCanvasTexture(512, 256, (ctx, w, h) => {
        ctx.fillStyle = '#f3efe3';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8d1f22';
        ctx.textAlign = 'center';
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.fillText('DEFAULT NOTICE', w / 2, h / 2 + 18);
      }) })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.02, 0);
    folder.add(label);
    folder.position.set(-0.4, 0.85, 0.85);
    folder.rotation.y = -0.16;
    root.add(folder);

    // Paper stacks, telephone, clock
    for (let i = 0; i < 3; i++) {
      box(0.5, 0.015, 0.7, mat.paper, 0.7, 0.84 + i * 0.014, 1.15, root);
    }
    box(0.36, 0.1, 0.24, mat.leather, -1.05, 0.88, 0.55, root);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.26, 32),
      this.createStdMaterial(0xf2efe6)
    );
    clockFace.position.set(0, 2.5, -D + 0.18);
    root.add(clockFace);
    const hand = box(0.018, 0.18, 0.01, mat.leather, 0, 2.58, -D + 0.2);
    hand.rotation.z = -0.6;
    root.add(hand);

    // Framed certificates and a wall safe
    const certTex = this.makeCanvasTexture(384, 512, (ctx, w, h) => {
      ctx.fillStyle = '#efe9d8';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#8d7a52';
      ctx.lineWidth = 10;
      ctx.strokeRect(22, 22, w - 44, h - 44);
      ctx.fillStyle = '#33302a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 40px Georgia, serif';
      ctx.fillText('BULUH FC', w / 2, 130);
      ctx.font = '26px Georgia, serif';
      ctx.fillText('LOAN AGREEMENT', w / 2, 220);
      ctx.font = '20px Georgia, serif';
      ctx.fillText('PRIVATE & CONFIDENTIAL', w / 2, 280);
      ctx.fillStyle = '#8d1f22';
      ctx.fillRect(w / 2 - 70, 360, 140, 2);
    });
    for (const x of [-3.5, -2.2]) {
      const frame = box(0.82, 1.1, 0.06, mat.metal, x, 1.75, -D + 0.2);
      frame.castShadow = false;
      const cert = new THREE.Mesh(
        new THREE.PlaneGeometry(0.72, 1.0),
        this.createStdMaterial(0xffffff, { map: certTex })
      );
      cert.position.set(x, 1.75, -D + 0.24);
      root.add(cert);
    }
    box(0.9, 0.9, 0.4, mat.metal, 3.9, 0.55, -D + 0.32, root);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), mat.leather);
    dial.position.set(3.9, 0.62, -D + 0.53);
    root.add(dial);

    // Bookshelf
    for (let i = 0; i < 3; i++) {
      box(1.9, 0.07, 0.42, mat.panel, 3.4, 0.9 + i * 0.55, -D + 0.35, root);
      for (let j = 0; j < 8; j++) {
        const bx = 2.6 + j * 0.2;
        box(0.14, 0.36 + (j % 3) * 0.04, 0.3,
          this.createStdMaterial([0x5b2c2c, 0x273b52, 0x3a4a36, 0x6b5b3a][j % 4]),
          bx, 1.12 + i * 0.55, -D + 0.35, root);
      }
    }

    // Leather chairs
    const chair = (x, z, ry) => {
      const g = new THREE.Group();
      box(0.72, 0.12, 0.7, mat.leather, 0, 0.5, 0, g);
      box(0.72, 0.9, 0.14, mat.leather, 0, 0.95, -0.3, g);
      box(0.08, 0.48, 0.08, mat.metal, -0.28, 0.24, 0.25, g);
      box(0.08, 0.48, 0.08, mat.metal, 0.28, 0.24, 0.25, g);
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      root.add(g);
      return g;
    };
    const solicitorChair = chair(0.7, -0.5, Math.PI);
    chair(-1.3, 2.6, 0);

    this.characterParts = {
      desk, folder, solicitorChair,
      window: windowGroup,
      ceilingLights: ceiling,
    };
    this.character = root;
    this.scene.add(root);
    this.updateWallVisibility();
    return root;
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    if (this.wallCull) this.updateWallVisibility();
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

  resetScene() {
    this.dispose();
    this.setupScene();
    this.addLights();
    this.createProceduralCharacter();
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
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
  }
}
