import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from '../character-hair.js';
import { createOutlinedMesh, createToonMaterial, disposeMaterial } from './materials.js';
import { SHARED_POSES, WALK_POSES, applyPoseTable, captureRestPose, restPoseTable } from './poses.js';
import { DEFAULT_MOTION } from './motion.js';

/**
 * Dual-runtime base for every character in the cast.
 *
 * Browser  : `new Cls(container)` → `await init()` → scene, camera, renderer,
 *            controls, lights, rig and the RAF `animate()` loop.
 * Headless : `new Cls(null)`      → `mount(scene, opts)` → rig only, no
 *            WebGL, no clock, fully deterministic for Remotion / Node.
 *
 * Subclasses keep everything visual (outfits, rig geometry, prop dressing,
 * their own `setPose` where one already exists) and inherit the plumbing:
 * materials, hair, resize/reset/dispose, the motion driver and `mount`.
 */
export class BaseCharacterApp {
  constructor(container) {
    this.container = container || null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;
    this.characterParts = {};
    this.animations = {};
    this.props = {};
    this.clock = new THREE.Clock();

    this._dead = false;
    this._headless = false;
    this._restPose = null;
    this._baseY = undefined;

    this.isWalking = false;
    this.currentPose = 'idle';

    // Shadow-participation overrides for kits that opt out (soccer jersey).
    this.outlineOpts = {};

    // Hair framing – every rig in the cast shares the same head sphere.
    this.headRadius = 0.46;
    this.headOffsetY = 0;
    this.hairStyle = 'messy';

    this.motion = { ...DEFAULT_MOTION };
  }

  // ---------------------------------------------------------------- runtime

  /**
   * Browser entry point. With no container it degrades to the headless path
   * so `mountRig`-style callers can `await init()` safely in Node.
   */
  async init() {
    if (!this.container) {
      this._headless = true;
      if (!this.scene) this.scene = new THREE.Scene();
      this.createProceduralCharacter();
      return this;
    }
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.addLights();
    this.createProceduralCharacter();
    this.animate();
    return this;
  }

  /**
   * Deterministic headless build: inject a scene, construct the rig once and
   * apply the requested dressing. Never touches WebGL or `requestAnimationFrame`.
   *
   * @param {THREE.Scene} scene
   * @param {object} [opts]
   * @param {string} [opts.outfit] palette key for `changeOutfit`
   * @param {string} [opts.hair] HAIR_STYLES entry for `changeHairStyle`
   * @param {string} [opts.pose] pose name for `setPose`
   * @param {number[]} [opts.position] [x, y, z]
   * @param {number} [opts.rotationY]
   * @param {number} [opts.scale]
   * @returns {{app: BaseCharacterApp, rig: THREE.Group, parts: object}}
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
      // Headless init() parents the rig to a throw-away scene; move it over.
      if (this.character.parent) this.character.parent.remove(this.character);
      this.scene.add(this.character);
    }

    if (opts.outfit && typeof this.changeOutfit === 'function') this.changeOutfit(opts.outfit);
    if (opts.hair && typeof this.changeHairStyle === 'function') this.changeHairStyle(opts.hair);
    if (opts.pose && typeof this.setPose === 'function') this.setPose(opts.pose);

    const rig = this.character;
    if (opts.position) rig.position.set(...opts.position);
    if (opts.rotationY !== undefined) rig.rotation.y = opts.rotationY;
    if (opts.scale !== undefined) rig.scale.setScalar(opts.scale);
    this._baseY = rig.position.y;

    return { app: this, rig, parts: this.characterParts };
  }

  // ------------------------------------------------------------- primitives

  createToonMaterial(colorHex, map = null) {
    return createToonMaterial(colorHex, map);
  }

  createOutlinedMesh(geometry, material, outlineThickness = 0.022, opts = {}) {
    return createOutlinedMesh(geometry, material, outlineThickness, { ...this.outlineOpts, ...opts });
  }

  buildHairstyle(style) {
    return createHairstyle(
      style,
      this.materials.hair,
      (geometry, material, thickness) => this.createOutlinedMesh(geometry, material, thickness),
      this.headRadius,
      this.headOffsetY
    );
  }

  changeHairStyle(style) {
    if (!HAIR_STYLES.includes(style)) {
      console.warn(`Hair style "${style}" not found.`);
      return;
    }
    this.hairStyle = style;

    const head = this.characterParts.head;
    if (!head) return;
    if (this.hairGroup) {
      head.remove(this.hairGroup);
      this.hairGroup.traverse((child) => {
        if (child.isMesh) child.geometry.dispose();
      });
    }
    this.hairGroup = this.buildHairstyle(style);
    head.add(this.hairGroup);
  }

  setWalking(walking) {
    this.isWalking = walking;
  }

  // ------------------------------------------------------------------ poses

  /**
   * Fallback pose driver for rigs that do not ship their own library.
   * Classes with `this.poses` (Chairman / NewOwner / Sponsor) or a bespoke
   * `setPose` (Azam) override this method and are unaffected.
   *
   * `idle` restores the exact rotations captured on the first call, so a
   * class that never had `setPose` stays a no-op when handed `idle`.
   */
  setPose(poseName) {
    const parts = this.characterParts;
    if (!parts || !parts.head) return;

    let pose;
    if (this.poses) {
      pose = this.poses[poseName];
    } else {
      if (!this._restPose) this._restPose = captureRestPose(parts);
      pose = poseName === 'idle' ? restPoseTable(this._restPose) : SHARED_POSES[poseName];
    }

    if (!pose) {
      console.warn(`Pose "${poseName}" not found.`);
      return;
    }

    this.currentPose = poseName;
    this.isWalking = WALK_POSES.has(poseName);
    applyPoseTable(parts, pose, this.props);
  }

  // ---------------------------------------------------------------- motion

  /**
   * Deterministic, clock-free driver for headless runtimes.
   * @param {number} frame current frame index
   * @param {number} [fps] frames per second (default 30)
   */
  update(frame, fps = 30) {
    this.updateSeconds(frame / fps);
  }

  /**
   * Applies one instant of the shared motion profile.
   * Ground height is captured once so a stage that lifts the rig is respected
   * instead of being snapped back to y = 0 every frame.
   */
  updateSeconds(t) {
    const rig = this.character;
    const parts = this.characterParts;
    if (!rig || !parts || !parts.head) return;

    const m = this.motion;
    const { head, torso, leftArm, rightArm, leftLeg, rightLeg } = parts;
    if (this._baseY === undefined) this._baseY = rig.position.y;

    if (this.isWalking && !m.noWalk) {
      const s = m.walkSpeed;
      if (leftLeg) leftLeg.rotation.x = Math.sin(t * s) * m.legAmp;
      if (rightLeg) rightLeg.rotation.x = -Math.sin(t * s) * m.legAmp;
      if (leftArm) leftArm.rotation.x = -Math.sin(t * s) * m.armAmp;
      if (rightArm) rightArm.rotation.x = Math.sin(t * s) * m.armAmp;
      rig.position.y = this._baseY + Math.abs(Math.cos(t * s)) * m.bounce;
      return;
    }

    head.position.y = m.headBaseY + Math.sin(t * m.idleFreq) * m.headAmp;

    if (m.torsoBreathAmp && torso) {
      torso.scale.y = 1 + Math.sin(t * m.idleFreq) * m.torsoBreathAmp;
    }

    if (m.swayArms && leftArm && rightArm) {
      leftArm.rotation.z = -m.armIdleZ - Math.sin(t * m.idleFreq) * m.armSway;
      rightArm.rotation.z = m.armIdleZ + Math.sin(t * m.idleFreq) * m.armSway;
    }

    const sway = m.armXSway;
    if (sway && leftArm && rightArm && this.currentPose === sway.guard) {
      const bounce = Math.sin(t * sway.freq);
      leftArm.rotation.x = sway.left + bounce * sway.amp;
      rightArm.rotation.x = sway.right - bounce * sway.amp;
      if (torso) torso.rotation.z = Math.sin(t * sway.swayFreq) * sway.torsoSway;
      head.rotation.z = Math.sin(t * sway.swayFreq + 0.5) * sway.headSway;
    }

    rig.position.y = this._baseY;
  }

  /** Browser RAF loop – wraps `updateSeconds` with render + controls. */
  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    this.updateSeconds(this.clock.getElapsedTime());
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  // ------------------------------------------------------------- lifecycle

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  resetScene() {
    this.dispose();
    this.setupScene();
    this.addLights();
    this.createProceduralCharacter();
  }

  /**
   * Releases the rig and every GPU resource behind it.
   * Deliberately does **not** set `_dead` – `index.html` owns that flag and
   * the browser RAF loop has to survive a `resetScene()`.
   */
  dispose() {
    if (this.scene && this.character) {
      this.scene.remove(this.character);
      const materials = new Set();
      this.character.traverse((child) => {
        if (!child.isMesh) return;
        if (child.geometry) child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.filter(Boolean).forEach((material) => materials.add(material));
      });
      materials.forEach((material) => disposeMaterial(material));
    }
    this.character = null;
    this.characterParts = {};
    this.animations = {};
    this.props = {};
    this.hairGroup = null;
    this._restPose = null;
    this._baseY = undefined;
  }
}
