import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SuitOutfitApp {
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
    this.hairStyle = 'sidePart';

    this.outfits = {
      classicGraySuit: {
        jacket: 0x4f5054,   // Tailored Charcoal Gray
        vest: 0x3e3f42,     // Darker Gray Waistcoat
        lapel: 0x444549,    // Suit Lapels
        shirt: 0xffffff,    // Crisp White Dress Shirt
        tie: 0x151517,      // Black Necktie
        pants: 0x4f5054,    // Matching Suit Trousers
        shoes: 0x141416     // Polished Black Dress Shoes
      },
      navyExecutive: {
        jacket: 0x1e293b,
        vest: 0x0f172a,
        lapel: 0x1e293b,
        shirt: 0xffffff,
        tie: 0x991b1b,
        pants: 0x1e293b,
        shoes: 0x451a03
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
    this.scene.background = new THREE.Color(0xfcf9e8);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.8, 4.2);
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
    const palette = this.outfits.classicGraySuit;

    this.materials = {
      hair: this.createToonMaterial(0x3f2b1c),
      white: this.createToonMaterial(0xffffff),
      jacket: this.createToonMaterial(palette.jacket),
      vest: this.createToonMaterial(palette.vest),
      lapel: this.createToonMaterial(palette.lapel),
      shirt: this.createToonMaterial(palette.shirt),
      tie: this.createToonMaterial(palette.tie),
      pants: this.createToonMaterial(palette.pants),
      shoes: this.createToonMaterial(palette.shoes)
    };

    // ==================== 1. FACELESS HEAD & NECK ====================
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);

    const headGeom = new THREE.SphereGeometry(0.46, 32, 32);
    const head = this.createOutlinedMesh(headGeom, this.materials.white, 0.03);
    head.position.y = 0.36;
    headGroup.add(head);

    // Hairstyle
    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);

    const neckGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.white, 0.025);
    neck.position.y = -0.02;
    headGroup.add(neck);
    group.add(headGroup);

    // ==================== 2. THREE-PIECE SUIT TORSO ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    // Main Tailored Jacket Body
    const jacketGeom = new THREE.CylinderGeometry(0.30, 0.35, 0.74, 24);
    const jacket = this.createOutlinedMesh(jacketGeom, this.materials.jacket, 0.028);
    jacket.scale.set(1.08, 1, 0.76);
    torsoGroup.add(jacket);

    // Inner Waistcoat (Vest) Center Panel
    const vestGeom = new THREE.CylinderGeometry(0.26, 0.30, 0.68, 20);
    const vest = this.createOutlinedMesh(vestGeom, this.materials.vest, 0.015);
    vest.position.set(0, -0.01, 0.045);
    vest.scale.set(0.65, 1, 0.78);
    torsoGroup.add(vest);

    // White Dress Shirt V-Front & Collar
    const shirtFrontGeom = new THREE.ConeGeometry(0.14, 0.30, 4);
    const shirtFront = this.createOutlinedMesh(shirtFrontGeom, this.materials.shirt, 0.02);
    shirtFront.rotation.z = Math.PI;
    shirtFront.rotation.y = Math.PI / 4;
    shirtFront.position.set(0, 0.23, 0.20);
    shirtFront.scale.set(1.1, 1, 0.5);
    torsoGroup.add(shirtFront);

    // Black Necktie (Knot + Blade)
    const knotGeom = new THREE.BoxGeometry(0.055, 0.055, 0.04);
    const tieKnot = this.createOutlinedMesh(knotGeom, this.materials.tie, 0.03);
    tieKnot.position.set(0, 0.31, 0.24);
    torsoGroup.add(tieKnot);

    const tieBladeGeom = new THREE.BoxGeometry(0.05, 0.26, 0.03);
    const tieBlade = this.createOutlinedMesh(tieBladeGeom, this.materials.tie, 0.03);
    tieBlade.position.set(0, 0.16, 0.25);
    torsoGroup.add(tieBlade);

    // Tailored Jacket Lapels (Left & Right)
    const lapelGeom = new THREE.BoxGeometry(0.08, 0.42, 0.04);
    [-1, 1].forEach((dir) => {
      const lapel = this.createOutlinedMesh(lapelGeom, this.materials.lapel, 0.03);
      lapel.position.set(dir * 0.11, 0.14, 0.25);
      lapel.rotation.z = dir * -0.22;
      torsoGroup.add(lapel);
    });

    // Three Vest Buttons
    const btnGeom = new THREE.SphereGeometry(0.018, 8, 8);
    [-0.04, -0.13, -0.22].forEach((yPos) => {
      const btn = new THREE.Mesh(btnGeom, this.materials.tie);
      btn.position.set(0, yPos, 0.27);
      torsoGroup.add(btn);
    });

    // White Pocket Square on Left Chest
    const squareGeom = new THREE.ConeGeometry(0.035, 0.05, 3);
    const pocketSquare = this.createOutlinedMesh(squareGeom, this.materials.shirt, 0.03);
    pocketSquare.position.set(0.18, 0.16, 0.25);
    torsoGroup.add(pocketSquare);

    // Structured Suit Shoulders
    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.jacket, 0.025);
    shoulders.position.y = 0.27;
    shoulders.scale.set(1.14, 0.50, 0.76);
    torsoGroup.add(shoulders);

    group.add(torsoGroup);

    // ==================== 3. SUIT TROUSER PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.02, 0);

    const hipsGeom = new THREE.CylinderGeometry(0.33, 0.33, 0.18, 24);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.pants, 0.025);
    hips.position.y = -0.08;
    hips.scale.set(1.04, 1, 0.74);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    // ==================== 4. SUIT SLEEVES, WHITE SHIRT CUFFS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(dir * 0.34, 1.74, 0);

      // Tailored Suit Sleeve
      const sleeveGeom = new THREE.CylinderGeometry(0.105, 0.13, 0.58, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.jacket, 0.03);
      sleeve.position.y = -0.27;
      armPivot.add(sleeve);

      // Crisp White Shirt Cuff Peeking Out
      const shirtCuffGeom = new THREE.CylinderGeometry(0.115, 0.115, 0.05, 16);
      const shirtCuff = this.createOutlinedMesh(shirtCuffGeom, this.materials.shirt, 0.03);
      shirtCuff.position.y = -0.58;
      armPivot.add(shirtCuff);

      // Cartoon Hand
      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(0, -0.68, 0);

      const palmGeom = new THREE.SphereGeometry(0.11, 16, 16);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.white, 0.035);
      palm.scale.set(1.08, 1.14, 0.72);
      handGroup.add(palm);


      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.30;
      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // ==================== 5. STRAIGHT TROUSERS & BLACK DRESS SHOES ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(dir * 0.18, 0.90, 0);

      // Straight Tailored Trouser Leg (no rolled cuffs)
      const pantGeom = new THREE.CylinderGeometry(0.145, 0.15, 0.72, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.pants, 0.03);
      pant.position.y = -0.36;
      legPivot.add(pant);

      // Black Formal Dress Shoe
      const shoeFootGeom = new THREE.CapsuleGeometry(0.12, 0.18, 12, 16);
      const shoeFoot = this.createOutlinedMesh(shoeFootGeom, this.materials.shoes, 0.03);
      shoeFoot.rotation.x = Math.PI / 2;
      shoeFoot.position.set(0, -0.80, 0.08);
      shoeFoot.scale.set(1.08, 1.05, 0.75);
      legPivot.add(shoeFoot);

      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg, rightLeg);

    this.characterParts = { head: headGroup, torso: torsoGroup, leftArm, rightArm, leftLeg, rightLeg };
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

    this.materials.jacket.color.setHex(palette.jacket);
    this.materials.vest.color.setHex(palette.vest);
    this.materials.lapel.color.setHex(palette.lapel);
    this.materials.shirt.color.setHex(palette.shirt);
    this.materials.tie.color.setHex(palette.tie);
    this.materials.pants.color.setHex(palette.pants);
    this.materials.shoes.color.setHex(palette.shoes);
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
        const speed = 5.5;
        leftLeg.rotation.x = Math.sin(elapsed * speed) * 0.45;
        rightLeg.rotation.x = -Math.sin(elapsed * speed) * 0.45;
        leftArm.rotation.x = -Math.sin(elapsed * speed) * 0.35;
        rightArm.rotation.x = Math.sin(elapsed * speed) * 0.35;
        this.character.position.y = Math.abs(Math.cos(elapsed * speed)) * 0.05;
      } else {
        head.position.y = 1.95 + Math.sin(elapsed * 2) * 0.015;
        leftArm.rotation.z = -0.30 - Math.sin(elapsed * 2) * 0.02;
        rightArm.rotation.z = 0.30 + Math.sin(elapsed * 2) * 0.02;
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
  }
}
