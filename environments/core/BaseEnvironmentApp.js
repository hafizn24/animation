import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const emptyWallCull = () => ({ back: [], front: [], left: [], right: [], ceiling: [] });

/**
 * Shared lifecycle for every environment set.
 *
 * Subclasses keep the parts that actually differ – `setupScene`,
 * `setupCamera`, `setupControls`, `addLights`, `createProceduralCharacter`
 * and any set-specific helpers – and inherit everything else:
 *
 *   init()            headless-aware (no renderer/controls without a container)
 *   mount(scene)      inject into an existing scene for Remotion
 *   animate()         RAF loop with an `onAnimateFrame(elapsed)` hook
 *   dispose()         full teardown; disposeCharacter() is the rebuild-safe part
 *   getCameraPresets() four derived shots for stageKit
 */
export class BaseEnvironmentApp {
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
    this._headless = false;

    // --- stage metadata (consumed by stageKit / test.mjs) ---
    this.envId = '';
    this.isIndoor = true;
    this.roomBounds = null;
    this.bounds = null;
    this.anchors = {};
    this.lights = {};
    this.wallCull = emptyWallCull();
    this.homeCamera = [0, 3, 8];
    this.homeTarget = [0, 1.2, 0];
    this.cameraPresets = null;
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    if (this.container) {
      this.setupRenderer();
      this.setupControls();
    } else {
      this._headless = true;
    }
    this.addLights();
    this.createProceduralCharacter();
    this.applyBounds();
    if (!this._headless) this.animate();
    return this;
  }

  /** Browser containers give a real aspect ratio; headless falls back to 16:9. */
  cameraAspect() {
    if (this.container && this.container.clientWidth && this.container.clientHeight) {
      return this.container.clientWidth / this.container.clientHeight;
    }
    return 16 / 9;
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
    this.controls.target.set(...this.homeTarget);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
  }

  // ------------------------------------------------------------- materials

  createToonMaterial(colorHex, map = null) {
    const colors = new Uint8Array([200, 240, 255]);
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
    return new THREE.MeshToonMaterial({ color: colorHex, gradientMap, map });
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
    if (typeof document === 'undefined') return null;
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

  // ------------------------------------------------------------ wall culling

  updateWallVisibility() {
    if (!this.wallCull || !this.camera || !this.roomBounds) return;
    const p = this.camera.position;
    const { halfW, halfD, height } = this.roomBounds;
    this.wallCull.back.forEach((o) => { o.visible = p.z > -halfD - 0.05; });
    this.wallCull.front.forEach((o) => { o.visible = p.z < halfD + 0.05; });
    this.wallCull.left.forEach((o) => { o.visible = p.x > -halfW - 0.05; });
    this.wallCull.right.forEach((o) => { o.visible = p.x < halfW + 0.05; });
    this.wallCull.ceiling.forEach((o) => { o.visible = p.y < height + 0.05; });
  }

  // -------------------------------------------------------------- lifecycle

  onAnimateFrame() {}

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    this.onAnimateFrame(elapsed);
    if (this.roomBounds) this.updateWallVisibility();
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  resetScene() {
    this.dispose();
    this.setupScene();
    this.addLights();
    this.createProceduralCharacter();
    this.applyBounds();
  }

  /**
   * Rebuild-safe teardown: drops the set and its props but leaves lighting
   * alone, because `createProceduralCharacter()` starts with this call.
   */
  disposeCharacter() {
    if (this.scene && this.character) {
      this.scene.remove(this.character);
      const materials = new Set();
      this.character.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.filter(Boolean).forEach((material) => materials.add(material));
        }
      });
      materials.forEach((material) => {
        ['map', 'emissiveMap', 'gradientMap', 'alphaMap', 'normalMap', 'aoMap'].forEach((key) => {
          if (material[key]) material[key].dispose();
        });
        material.dispose();
      });
    }
    this.character = null;
    this.characterParts = {};
    this.anchors = {};
    this.wallCull = emptyWallCull();
  }

  /** Full teardown: the set plus every light it owns. */
  dispose() {
    this.disposeCharacter();
    Object.values(this.lights || {}).forEach((light) => light?.shadow?.dispose?.());
    if (this.scene) {
      [...this.scene.children]
        .filter((child) => child.isLight)
        .forEach((light) => {
          light.shadow?.dispose?.();
          this.scene.remove(light);
        });
    }
    this.lights = {};
  }

  // -------------------------------------------------------------- injection

  /**
   * Builds the set into an existing scene (Remotion path).
   *   const { env, scene, camera, presets } = mount(existingScene);
   */
  mount(scene, opts = {}) {
    if (scene) {
      this.scene = scene;
      this._headless = true;
    }
    if (!this.scene) throw new Error('mount() requires a THREE.Scene');

    if (!this.character) {
      this.createProceduralCharacter();
    } else if (this.character.parent !== this.scene) {
      if (this.character.parent) this.character.parent.remove(this.character);
      this.scene.add(this.character);
    }
    this.applyBounds();

    if (opts.position) this.character.position.set(...opts.position);
    if (opts.rotationY !== undefined) this.character.rotation.y = opts.rotationY;
    if (opts.scale !== undefined) this.character.scale.setScalar(opts.scale);

    return { env: this, scene: this.scene, camera: this.camera, presets: this.getCameraPresets() };
  }

  // --------------------------------------------------------------- metadata

  applyBounds() {
    if (this.bounds) return this.bounds;
    if (this.roomBounds) {
      const { halfW, halfD, height } = this.roomBounds;
      this.bounds = {
        minX: -halfW, maxX: halfW,
        minZ: -halfD, maxZ: halfD,
        floorY: 0, ceilingY: height,
      };
    } else {
      this.bounds = { minX: -60, maxX: 60, minZ: -60, maxZ: 60, floorY: 0, ceilingY: 40 };
    }
    return this.bounds;
  }

  getCameraPresets() {
    if (!this.cameraPresets) this.cameraPresets = this.defaultCameraPresets();
    return this.cameraPresets;
  }

  /**
   * Four deterministic shots derived from `homeCamera` / `homeTarget`, so a
   * set never has to hand-author preset numbers to be stage-ready.
   */
  defaultCameraPresets() {
    const [px, py, pz] = this.homeCamera;
    const [tx, ty, tz] = this.homeTarget;
    const dx = px - tx;
    const dz = pz - tz;
    const dist = Math.hypot(dx, dz) || 1;
    const nx = dx / dist;
    const nz = dz / dist;
    const fov = this.camera ? this.camera.fov : 50;

    const orbit = (scale, height, target = [tx, ty, tz], twist = 0) => {
      const c = Math.cos(twist);
      const s = Math.sin(twist);
      const ox = nx * c - nz * s;
      const oz = nx * s + nz * c;
      return {
        pos: [tx + ox * dist * scale, height, tz + oz * dist * scale],
        target,
        fov,
      };
    };

    return {
      wideEstablish: orbit(1.7, py + dist * 0.3, [tx, ty * 0.6, tz]),
      mediumA: orbit(1.0, py, [tx, ty, tz]),
      mediumB: orbit(0.85, py * 0.8 + ty * 0.2, [tx, ty, tz], Math.PI / 5),
      detailClose: orbit(0.45, ty + 0.5, [tx, ty + 0.15, tz]),
    };
  }

  /**
   * Story-specific dressing hook. Runs at the end of every
   * `createProceduralCharacter()`; base implementation does nothing.
   */
  applyDressing() {}
}
