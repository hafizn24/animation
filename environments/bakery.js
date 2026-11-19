import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * BakeryApp — a small, warm Malaysian neighbourhood bakery ("KEK MAJU").
 *
 * Deliberately distinct from the Buloh FC office and the sponsor offices:
 * front counter, glass cake display, tiled floor, shelves of bread, warm
 * pendant lights and a wall-mounted KEK MAJU sign. No outdoor signposts here.
 */
export class BakeryApp {
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
    this.roomBounds = { halfW: 5, halfD: 4, height: 3.4 };
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
    this.scene.background = new THREE.Color(0x2a1d13);
    this.scene.fog = new THREE.Fog(0x2a1d13, 18, 46);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 200);
    this.camera.position.set(2.4, 1.9, 4.4);
    this.homeCamera = [2.4, 1.9, 4.4];
    this.homeTarget = [0, 1.2, 0];
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
    this.controls.target.set(0, 1.2, 0);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0xffe9c9, 0.72));

    const hemi = new THREE.HemisphereLight(0xffe3b8, 0x5a3a22, 0.55);
    this.scene.add(hemi);

    const warmKey = new THREE.DirectionalLight(0xffd9a0, 1.05);
    warmKey.position.set(-4, 7, 5);
    warmKey.castShadow = true;
    warmKey.shadow.mapSize.width = 1024;
    warmKey.shadow.mapSize.height = 1024;
    warmKey.shadow.camera.left = -8;
    warmKey.shadow.camera.right = 8;
    warmKey.shadow.camera.top = 8;
    warmKey.shadow.camera.bottom = -8;
    warmKey.shadow.camera.far = 26;
    warmKey.shadow.bias = -0.0004;
    this.scene.add(warmKey);

    for (const [x, z] of [[-2.6, -0.4], [0.2, -1.4], [2.8, -0.2]]) {
      const lamp = new THREE.PointLight(0xffc078, 7, 9, 2);
      lamp.position.set(x, 2.72, z);
      this.scene.add(lamp);
    }

    const counterGlow = new THREE.PointLight(0xffdca8, 4, 6, 2);
    counterGlow.position.set(0, 1.5, 0.9);
    this.scene.add(counterGlow);
  }

  createStdMaterial(colorHex, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: opts.roughness ?? 0.75,
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
    texture.anisotropy = 8;
    return texture;
  }

  makeSignTexture() {
    return this.makeCanvasTexture(768, 320, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#fff6e2');
      grad.addColorStop(1, '#f7e5c4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b9602c';
      ctx.lineWidth = 16;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7a3a17';
      ctx.font = 'bold 128px Georgia, serif';
      ctx.fillText('KEK MAJU', w / 2, 158);
      ctx.fillStyle = '#b9602c';
      ctx.font = 'bold 34px Arial, sans-serif';
      ctx.fillText('KEDAI KECIL  ·  SOKONGAN BESAR', w / 2, 222);
      ctx.fillStyle = '#7a3a17';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText('Sokong Buloh FC', w / 2, 278);
    });
  }

  makeTileTexture() {
    return this.makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#c98c63';
      ctx.fillRect(0, 0, w, h);
      const size = 64;
      for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
          const shade = (x / size + y / size) % 2 ? '#d89b70' : '#c07e55';
          ctx.fillStyle = shade;
          ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        }
      }
    });
  }

  // Misnamed on purpose: sceneKit.js calls this to build the environment.
  createProceduralCharacter() {
    if (this.character) this.dispose();

    const root = new THREE.Group();
    root.name = 'Bakery';
    const { halfW: W, halfD: D, height: H } = this.roomBounds;

    const mat = {
      floor: this.createStdMaterial(0xffffff, { map: this.makeTileTexture(), roughness: 0.9 }),
      wall: this.createStdMaterial(0xf6e2c4, { roughness: 0.95 }),
      wallLower: this.createStdMaterial(0xc98c63, { roughness: 0.9 }),
      trim: this.createStdMaterial(0x8b542c, { roughness: 0.7 }),
      wood: this.createStdMaterial(0xa9683a, { roughness: 0.62 }),
      woodDark: this.createStdMaterial(0x744326, { roughness: 0.7 }),
      woodTop: this.createStdMaterial(0xc98a56, { roughness: 0.42 }),
      glass: this.createStdMaterial(0xdff0f5, {
        roughness: 0.06, metalness: 0.05, transparent: true, opacity: 0.22,
        depthWrite: false, side: THREE.DoubleSide,
      }),
      metal: this.createStdMaterial(0xcbbda8, { roughness: 0.3, metalness: 0.6 }),
      bread: this.createStdMaterial(0xd8a258, { roughness: 0.92 }),
      breadLight: this.createStdMaterial(0xe8c184, { roughness: 0.92 }),
      icing: this.createStdMaterial(0xfff0dc, { roughness: 0.7 }),
      berry: this.createStdMaterial(0xc0374b, { roughness: 0.5 }),
      sign: this.createStdMaterial(0xffffff, {
        map: this.makeSignTexture(), roughness: 0.7,
        emissive: 0x4a2a10, emissiveIntensity: 0.35,
      }),
      lamp: this.createStdMaterial(0xffdca8, { emissive: 0xffb45e, emissiveIntensity: 1.3 }),
      bell: this.createStdMaterial(0xd8b45a, { roughness: 0.3, metalness: 0.75 }),
    };

    const box = (w, h, d, material, x, y, z, parent = root) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const cyl = (rTop, rBottom, height_, material, x, y, z, parent = root, segments = 16) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, height_, segments), material
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Shell (front wall omitted — this is an open film set).
    const floor = box(W * 2, 0.12, D * 2, mat.floor, 0, -0.06, 0);
    floor.castShadow = false;
    box(W * 2, H, 0.14, mat.wall, 0, H / 2, -D);
    box(0.14, H, D * 2, mat.wall, -W, H / 2, 0);
    box(0.14, H, D * 2, mat.wall, W, H / 2, 0);
    box(W * 2, 1.1, 0.15, mat.wallLower, 0, 0.55, -D + 0.02);
    box(0.15, 1.1, D * 2, mat.wallLower, -W + 0.02, 0.55, 0);
    box(0.15, 1.1, D * 2, mat.wallLower, W - 0.02, 0.55, 0);

    // Wall-mounted KEK MAJU sign (no post, no outdoor board).
    const sign = new THREE.Group();
    box(3.3, 1.36, 0.09, mat.woodDark, 0, 2.4, -D + 0.12, sign);
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(3.16, 1.22), mat.sign);
    signFace.position.set(0, 2.4, -D + 0.175);
    sign.add(signFace);
    sign.position.set(-0.4, 0, 0);
    root.add(sign);

    // Back-shelf with bread loaves.
    const shelf = new THREE.Group();
    box(3.0, 0.08, 0.5, mat.wood, 0, 1.42, -D + 0.32, shelf);
    box(3.0, 0.08, 0.5, mat.wood, 0, 1.92, -D + 0.32, shelf);
    for (let i = 0; i < 6; i++) {
      const loaf = cyl(0.1, 0.13, 0.26, i % 2 ? mat.bread : mat.breadLight,
        -1.15 + i * 0.46, 1.6, -D + 0.34, shelf, 12);
      loaf.rotation.z = 0.12 * Math.sin(i);
    }
    for (let i = 0; i < 5; i++) {
      cyl(0.11, 0.13, 0.24, i % 2 ? mat.breadLight : mat.bread,
        -0.9 + i * 0.46, 2.1, -D + 0.34, shelf, 12);
    }
    root.add(shelf);

    // Front counter.
    const counter = new THREE.Group();
    counter.position.set(0, 0, 0.15);
    box(6.2, 0.1, 1.15, mat.woodTop, 0, 0.96, 0, counter);
    box(6.0, 0.84, 0.95, mat.wood, 0, 0.5, 0, counter);
    for (let i = -2; i <= 2; i++) {
      box(0.06, 0.72, 0.99, mat.woodDark, i * 1.12, 0.5, 0, counter);
    }
    box(6.24, 0.06, 1.19, mat.trim, 0, 0.9, 0, counter);
    root.add(counter);

    // Glass display case with cakes, sitting on the counter.
    const displayCase = new THREE.Group();
    displayCase.position.set(-0.5, 0, 0.15);
    box(2.5, 0.06, 1.0, mat.woodDark, 0, 1.02, 0, displayCase);
    box(2.42, 0.04, 0.92, mat.icing, 0, 1.06, 0, displayCase);
    const cakeColors = [0xf0b26b, 0xd98650, 0xf6d2a0, 0xe0a0a0, 0xf0b26b];
    for (let i = 0; i < 5; i++) {
      const x = -0.92 + i * 0.46;
      const cake = new THREE.Group();
      cyl(0.15, 0.16, 0.16, mat.icing, 0, 1.17, 0, cake, 16);
      cyl(0.16, 0.16, 0.035, this.createStdMaterial(cakeColors[i], { roughness: 0.6 }),
        0, 1.27, 0, cake, 16);
      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mat.berry);
      cherry.position.set(0, 1.31, 0);
      cake.add(cherry);
      cake.position.x = x;
      displayCase.add(cake);
    }
    box(2.5, 0.05, 1.0, mat.metal, 0, 1.74, 0, displayCase);
    const glassFront = box(2.46, 0.68, 0.02, mat.glass, 0, 1.4, 0.5, displayCase);
    glassFront.castShadow = false;
    const glassBack = box(2.46, 0.68, 0.02, mat.glass, 0, 1.4, -0.5, displayCase);
    glassBack.castShadow = false;
    for (const x of [-1.24, 1.24]) {
      const side = box(0.02, 0.68, 0.98, mat.glass, x, 1.4, 0, displayCase);
      side.castShadow = false;
    }
    root.add(displayCase);

    // Pendant lamps over the counter.
    const pendants = new THREE.Group();
    for (const x of [-2.2, 0, 2.2]) {
      cyl(0.012, 0.012, 0.5, mat.metal, x, H - 0.32, 0.2, pendants, 8);
      const shade = cyl(0.08, 0.32, 0.28, mat.woodDark, x, H - 0.68, 0.2, pendants, 18);
      shade.castShadow = false;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), mat.lamp);
      bulb.position.set(x, H - 0.8, 0.2);
      pendants.add(bulb);
    }
    root.add(pendants);

    // Shop bell by the entrance.
    const bell = new THREE.Group();
    cyl(0.16, 0.18, 0.05, mat.woodDark, 0, 1.0, 0, bell, 16);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10,
      0, Math.PI * 2, 0, Math.PI / 2), mat.bell);
    dome.position.y = 1.04;
    bell.add(dome);
    bell.position.set(3.5, 0, 2.4);
    root.add(bell);

    // A couple of small customer stools.
    for (const x of [-2.6, 2.6]) {
      const stool = new THREE.Group();
      cyl(0.26, 0.26, 0.07, mat.wood, 0, 0.66, 0, stool, 16);
      for (let s = 0; s < 3; s++) {
        const a = (s / 3) * Math.PI * 2;
        cyl(0.03, 0.04, 0.64, mat.woodDark, Math.sin(a) * 0.16, 0.32,
          Math.cos(a) * 0.16, stool, 8);
      }
      stool.position.set(x, 0, 1.9);
      root.add(stool);
    }

    this.characterParts = { floor, counter, displayCase, sign, shelf, pendants, bell };
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
            if (m && m.map) m.map.dispose();
            if (m) m.dispose();
          });
        }
      });
    }
    this.character = null;
    this.characterParts = {};
  }
}
