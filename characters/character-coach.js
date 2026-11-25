import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';

export class SoccerCoachOutfitApp {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;
    this.characterParts = {};
    this.animations = {};
    this.clock = new THREE.Clock();
    this.isWalking = false;

    this.headRadius = 0.46;   // head sphere radius the hair is built around
    this.headOffsetY = 0;  // vertical offset of the head centre
    this.hairStyle = 'buzz';

    this.outfits = {
      navyCoach: {
        tracksuit: 0x2c364c,   // Dark Navy Tracksuit Jacket & Pants
        ribbing: 0x1b2230,     // Darker Navy Ribbed Cuffs & Hem
        poloShirt: 0xffffff,   // Inner White Polo Collar
        whistle: 0xf27d31,     // Bright Orange Coach Whistle & Lanyard
        sneakers: 0x1e2536,    // Dark Navy Sneakers
        sole: 0xffffff         // White Sneaker Sole
      },
      maroonCoach: {
        tracksuit: 0x6b1d2f,
        ribbing: 0x47121e,
        poloShirt: 0xffffff,
        whistle: 0xfacc15,
        sneakers: 0x1f2937,
        sole: 0xffffff
      }
    };
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

    // Soft studio backdrop – keeps the near-white skin and trainers readable
    if (typeof document === 'undefined') {
      this.scene.background = new THREE.Color(0xd7d2c4);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#9fb0ba');
    grad.addColorStop(0.5, '#d7d2c4');
    grad.addColorStop(1, '#efe9da');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = texture;
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.8, 4.2);
    this.homeCamera = [0, 1.8, 4.2];
    this.homeTarget = [0, 1.3, 0];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.3, 0);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(4, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  createToonMaterial(colorHex) {
    const colors = new Uint8Array([215, 255]);
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

    return new THREE.MeshToonMaterial({
      color: colorHex,
      gradientMap: gradientMap
    });
  }

  createCoachBackBadgeTexture(bgColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + new THREE.Color(bgColorHex).getHexString();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('COACH', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createOutlinedMesh(geometry, material, outlineThickness = 0.022) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    group.userData = { mainMesh: mesh };

    if (outlineThickness > 0) {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: 0x0b0b0b,
        side: THREE.BackSide
      });
      const outlineMesh = new THREE.Mesh(geometry, outlineMat);
      outlineMesh.scale.setScalar(1 + outlineThickness);
      group.add(outlineMesh);
    }
    return group;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    const palette = this.outfits.navyCoach;

    this.materials = {
      hair: this.createToonMaterial(0x9a7a52),
      skin: this.createToonMaterial(0xf1e5d4),
      white: this.createToonMaterial(0xffffff),
      tracksuit: this.createToonMaterial(palette.tracksuit),
      ribbing: this.createToonMaterial(palette.ribbing),
      poloShirt: this.createToonMaterial(palette.poloShirt),
      whistle: this.createToonMaterial(palette.whistle),
      sneakers: this.createToonMaterial(palette.sneakers),
      sole: this.createToonMaterial(palette.sole),
      coachBadge: new THREE.MeshBasicMaterial({
        map: this.createCoachBackBadgeTexture(palette.tracksuit)
      })
    };

    // ==================== 1. FACELESS HEAD & NECK ====================
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);

    const headGeom = new THREE.SphereGeometry(0.46, 32, 32);
    const head = this.createOutlinedMesh(headGeom, this.materials.skin, 0.03);
    head.position.y = 0.36;
    headGroup.add(head);

    // Hairstyle
    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);

    const neckGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.skin, 0.025);
    neck.position.y = -0.02;
    headGroup.add(neck);
    group.add(headGroup);

    // ==================== 2. COACH TRACKSUIT HOODIE & WHISTLE ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    // Main Navy Tracksuit Torso
    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.35, 0.70, 24);
    const torso = this.createOutlinedMesh(torsoGeom, this.materials.tracksuit, 0.028);
    torso.scale.set(1.08, 1, 0.78);
    torsoGroup.add(torso);

    // Ribbed Waistband Hem
    const hemGeom = new THREE.CylinderGeometry(0.35, 0.34, 0.09, 24);
    const hem = this.createOutlinedMesh(hemGeom, this.materials.ribbing, 0.025);
    hem.position.y = -0.34;
    hem.scale.set(1.08, 1, 0.78);
    torsoGroup.add(hem);

    // White Inner Polo Collar V-Insert
    const poloInsertGeom = new THREE.ConeGeometry(0.13, 0.22, 4);
    const poloInsert = this.createOutlinedMesh(poloInsertGeom, this.materials.poloShirt, 0.02);
    poloInsert.rotation.z = Math.PI;
    poloInsert.rotation.y = Math.PI / 4;
    poloInsert.position.set(0, 0.28, 0.20);
    poloInsert.scale.set(1, 1, 0.5);
    torsoGroup.add(poloInsert);

    // Hood & Collar around Neck
    const collarGeom = new THREE.TorusGeometry(0.22, 0.085, 16, 24);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.tracksuit, 0.03);
    collar.position.set(0, 0.40, -0.02);
    collar.rotation.x = Math.PI / 2 + 0.15;
    collar.scale.set(1.1, 1.15, 0.9);
    torsoGroup.add(collar);

    const backHoodGeom = new THREE.SphereGeometry(0.22, 20, 20);
    const backHood = this.createOutlinedMesh(backHoodGeom, this.materials.tracksuit, 0.03);
    backHood.position.set(0, 0.36, -0.22);
    backHood.scale.set(1.05, 0.85, 0.95);
    torsoGroup.add(backHood);

    // "COACH" Back Text Plate (Visible when rotating character to the back)
    const badgeGeom = new THREE.PlaneGeometry(0.34, 0.16);
    const badgeMesh = new THREE.Mesh(badgeGeom, this.materials.coachBadge);
    badgeMesh.position.set(0, 0.10, -0.275);
    badgeMesh.rotation.y = Math.PI;
    torsoGroup.add(badgeMesh);

    // Orange Lanyard & Whistle on Front Chest
    const lanyardGeom = new THREE.TorusGeometry(0.15, 0.015, 10, 24);
    const lanyard = this.createOutlinedMesh(lanyardGeom, this.materials.whistle, 0.04);
    lanyard.position.set(0, 0.26, 0.23);
    lanyard.scale.set(0.75, 1.35, 0.5);
    torsoGroup.add(lanyard);

    const whistleBodyGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.07, 16);
    const whistleBody = this.createOutlinedMesh(whistleBodyGeom, this.materials.whistle, 0.04);
    whistleBody.rotation.z = Math.PI / 2;
    whistleBody.position.set(0, 0.04, 0.28);
    torsoGroup.add(whistleBody);

    const whistleTipGeom = new THREE.BoxGeometry(0.04, 0.05, 0.04);
    const whistleTip = this.createOutlinedMesh(whistleTipGeom, this.materials.whistle, 0.04);
    whistleTip.position.set(0, 0.07, 0.28);
    torsoGroup.add(whistleTip);

    // Rounded Shoulders
    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.tracksuit, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.12, 0.55, 0.78);
    torsoGroup.add(shoulders);

    group.add(torsoGroup);

    // ==================== 3. TRACKSUIT PANTS PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.02, 0);

    const hipsGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.18, 24);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.tracksuit, 0.025);
    hips.position.y = -0.08;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    // ==================== 4. ARMS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(dir * 0.34, 1.74, 0);

      const sleeveGeom = new THREE.CylinderGeometry(0.11, 0.15, 0.60, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.tracksuit, 0.03);
      sleeve.position.y = -0.28;
      armPivot.add(sleeve);

      const sleeveCuffGeom = new THREE.TorusGeometry(0.115, 0.035, 12, 20);
      const sleeveCuff = this.createOutlinedMesh(sleeveCuffGeom, this.materials.ribbing, 0.03);
      sleeveCuff.rotation.x = Math.PI / 2;
      sleeveCuff.position.y = -0.58;
      armPivot.add(sleeveCuff);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(0, -0.68, 0);

      const palmGeom = new THREE.SphereGeometry(0.11, 16, 16);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.skin, 0.035);
      palm.scale.set(1.08, 1.14, 0.72);
      handGroup.add(palm);


      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.32;
      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // ==================== 5. TRACKPANTS & WHITE-SOLED SNEAKERS ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(dir * 0.18, 0.90, 0);

      // Navy Tracksuit Pant Leg
      const pantGeom = new THREE.CylinderGeometry(0.15, 0.145, 0.68, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.tracksuit, 0.03);
      pant.position.y = -0.34;
      legPivot.add(pant);

      // Ribbed Ankle Jogger Cuff
      const ankleCuffGeom = new THREE.CylinderGeometry(0.14, 0.135, 0.08, 18);
      const ankleCuff = this.createOutlinedMesh(ankleCuffGeom, this.materials.ribbing, 0.03);
      ankleCuff.position.y = -0.68;
      legPivot.add(ankleCuff);

      // Dark Navy Athletic Sneaker Upper
      const sneakerGeom = new THREE.CapsuleGeometry(0.125, 0.16, 12, 16);
      const sneaker = this.createOutlinedMesh(sneakerGeom, this.materials.sneakers, 0.03);
      sneaker.rotation.x = Math.PI / 2;
      sneaker.position.set(0, -0.79, 0.07);
      sneaker.scale.set(1.1, 1.0, 0.80);
      legPivot.add(sneaker);

      // White Sneaker Sole Rim
      const soleGeom = new THREE.CapsuleGeometry(0.13, 0.17, 12, 16);
      const sole = this.createOutlinedMesh(soleGeom, this.materials.sole, 0.025);
      sole.rotation.x = Math.PI / 2;
      sole.position.set(0, -0.84, 0.07);
      sole.scale.set(1.12, 1.02, 0.28);
      legPivot.add(sole);

      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg, rightLeg);

    this.characterParts = { head: headGroup, torso: torsoGroup, pelvis: pelvisGroup, leftArm, rightArm, leftLeg, rightLeg };
    this.character = group;
    this.scene.add(this.character);
    return group;
  }

  /**
   * Builds a hairstyle for the head rig using the shared style library.
   * @param {string} style one of HAIR_STYLES
   */
  buildHairstyle(style) {
    return createHairstyle(style, this.materials.hair,
      (geometry, material, thickness) => this.createOutlinedMesh(geometry, material, thickness),
      this.headRadius, this.headOffsetY);
  }

  /**
   * Swaps the character's hairstyle.
   * @param {string} style one of HAIR_STYLES
   */
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

  changeOutfit(outfitName) {
    const palette = this.outfits[outfitName];
    if (!palette) return;

    this.materials.tracksuit.color.setHex(palette.tracksuit);
    this.materials.ribbing.color.setHex(palette.ribbing);
    this.materials.poloShirt.color.setHex(palette.poloShirt);
    this.materials.whistle.color.setHex(palette.whistle);
    this.materials.sneakers.color.setHex(palette.sneakers);
    this.materials.sole.color.setHex(palette.sole);
    this.materials.coachBadge.map = this.createCoachBackBadgeTexture(palette.tracksuit);
    this.materials.coachBadge.needsUpdate = true;
  }

  setWalking(walking) {
    this.isWalking = walking;
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();

    if (this.character && this.characterParts.head) {
      const { head, leftArm, rightArm, leftLeg, rightLeg } = this.characterParts;
      if (this.isWalking) {
        const speed = 6;
        leftLeg.rotation.x = Math.sin(elapsed * speed) * 0.5;
        rightLeg.rotation.x = -Math.sin(elapsed * speed) * 0.5;
        leftArm.rotation.x = -Math.sin(elapsed * speed) * 0.4;
        rightArm.rotation.x = Math.sin(elapsed * speed) * 0.4;
        this.character.position.y = Math.abs(Math.cos(elapsed * speed)) * 0.06;
      } else {
        head.position.y = 1.95 + Math.sin(elapsed * 2) * 0.015;
        leftArm.rotation.z = -0.32 - Math.sin(elapsed * 2) * 0.02;
        rightArm.rotation.z = 0.32 + Math.sin(elapsed * 2) * 0.02;
        this.character.position.y = 0;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
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

  dispose() {
    if (this.scene && this.character) {
      this.scene.remove(this.character);
      this.character.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material) {
            Array.isArray(child.material) ? child.material.forEach(m => m.dispose()) : child.material.dispose();
          }
        }
      });
    }
    this.character = null;
    this.characterParts = {};
    this.animations = {};
    this.props = {};
  }
}
