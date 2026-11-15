import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class App {
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

    // 1. Mentakrifkan senarai pilihan pakaian (Outfit Palettes)
    this.headRadius = 0.46;   // head sphere radius the hair is built around
    this.headOffsetY = 0;  // vertical offset of the head centre
    this.hairStyle = 'messy';

    this.outfits = {
      default: {
        hoodie: 0x528558,      // Forest Green
        pocket: 0x3f6b44,      // Dark Forest Green
        pants: 0x425770,       // Dark Slate Blue
        cuffs: 0x677c94,       // Lighter Blue Cuffs
        boots: 0x95583f,       // Brown Boots
        belt: 0xf2a04f         // Orange Belt
      },
      casualRed: {
        hoodie: 0xd9534f,      // Crimson Red
        pocket: 0xa94442,      // Dark Burgundy
        pants: 0x2b2b2b,       // Charcoal Black
        cuffs: 0x555555,       // Grey Cuffs
        boots: 0x111111,       // Dark Boots
        belt: 0xf0ad4e         // Golden Yellow Belt
      },
      neonCyber: {
        hoodie: 0x00f0ff,      // Electric Cyan
        pocket: 0x008fa0,      // Dark Cyan
        pants: 0x1a1a2e,       // Cyber Blue-Purple
        cuffs: 0xff007f,       // Neon Pink Cuffs
        boots: 0xff007f,       // Neon Pink Boots
        belt: 0x39ff14         // Lime Green Belt
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
    this.scene.background = new THREE.Color(0xfcf9e8); // Latar belakang krim
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

    // Simpan rujukan mesh asal untuk dikemas kini warnanya nanti
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
    if (this.character) {
      this.dispose();
    }

    const group = new THREE.Group();

    // 2. Gunakan pakaian lalai (default) semasa permulaan
    const defaultColors = this.outfits.default;

    // Membina Materials
    this.materials = {
      hair: this.createToonMaterial(0x6b4a2f),
      white: this.createToonMaterial(0xffffff),
      hoodie: this.createToonMaterial(defaultColors.hoodie),
      pocket: this.createToonMaterial(defaultColors.pocket),
      pants: this.createToonMaterial(defaultColors.pants),
      cuffs: this.createToonMaterial(defaultColors.cuffs),
      boots: this.createToonMaterial(defaultColors.boots),
      belt: this.createToonMaterial(defaultColors.belt),
      black: new THREE.MeshBasicMaterial({ color: 0x111111 })
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

    // ==================== 2. GREEN HOODIE ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.36, 0.72, 24);
    const torso = this.createOutlinedMesh(torsoGeom, this.materials.hoodie, 0.028);
    torso.scale.set(1.08, 1, 0.78);
    torsoGroup.add(torso);

    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.hoodie, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.12, 0.55, 0.78);
    torsoGroup.add(shoulders);

    const collarGeom = new THREE.TorusGeometry(0.22, 0.09, 16, 24);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.hoodie, 0.03);
    collar.position.set(0, 0.40, -0.02);
    collar.rotation.x = Math.PI / 2 + 0.15;
    collar.scale.set(1.1, 1.15, 0.9);
    torsoGroup.add(collar);

    const backHoodGeom = new THREE.SphereGeometry(0.22, 20, 20);
    const backHood = this.createOutlinedMesh(backHoodGeom, this.materials.hoodie, 0.03);
    backHood.position.set(0, 0.36, -0.22);
    backHood.scale.set(1.05, 0.85, 0.95);
    torsoGroup.add(backHood);

    const pocketGeom = new THREE.BoxGeometry(0.36, 0.17, 0.08);
    const pocket = this.createOutlinedMesh(pocketGeom, this.materials.pocket, 0.025);
    pocket.position.set(0, -0.18, 0.25);
    torsoGroup.add(pocket);
    group.add(torsoGroup);

    // ==================== 3. BELT & PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const beltGeom = new THREE.CylinderGeometry(0.355, 0.355, 0.10, 24);
    const belt = this.createOutlinedMesh(beltGeom, this.materials.belt, 0.025);
    belt.scale.set(1.06, 1, 0.78);
    pelvisGroup.add(belt);

    const buckleGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 20);
    const buckle = this.createOutlinedMesh(buckleGeom, this.materials.belt, 0.04);
    buckle.rotation.x = Math.PI / 2;
    buckle.position.set(0, 0, 0.27);
    pelvisGroup.add(buckle);

    const loopGeom = new THREE.BoxGeometry(0.035, 0.11, 0.03);
    [-0.18, 0.18].forEach((xPos) => {
      const loop = new THREE.Mesh(loopGeom, this.materials.black);
      loop.position.set(xPos, 0, 0.26);
      pelvisGroup.add(loop);
    });

    const hipsGeom = new THREE.CylinderGeometry(0.35, 0.34, 0.18, 24);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.pants, 0.025);
    hips.position.y = -0.12;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    // ==================== 4. ARMS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(dir * 0.34, 1.74, 0);

      const sleeveGeom = new THREE.CylinderGeometry(0.11, 0.15, 0.62, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.hoodie, 0.03);
      sleeve.position.y = -0.28;
      armPivot.add(sleeve);

      const sleeveCuffGeom = new THREE.TorusGeometry(0.115, 0.035, 12, 20);
      const sleeveCuff = this.createOutlinedMesh(sleeveCuffGeom, this.materials.hoodie, 0.03);
      sleeveCuff.rotation.x = Math.PI / 2;
      sleeveCuff.position.y = -0.58;
      armPivot.add(sleeveCuff);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(0, -0.68, 0);

      const palmGeom = new THREE.SphereGeometry(0.11, 16, 16);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.white, 0.035);
      palm.scale.set(1.08, 1.14, 0.72);
      handGroup.add(palm);


      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.32;

      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm);
    group.add(rightArm);

    // ==================== 5. JEANS & BOOTS ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(dir * 0.18, 0.90, 0);

      const pantGeom = new THREE.CylinderGeometry(0.145, 0.155, 0.62, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.pants, 0.03);
      pant.position.y = -0.30;
      legPivot.add(pant);

      const cuffGeom = new THREE.CylinderGeometry(0.17, 0.17, 0.11, 20);
      const cuff = this.createOutlinedMesh(cuffGeom, this.materials.cuffs, 0.03);
      cuff.position.y = -0.60;
      legPivot.add(cuff);

      const bootShaftGeom = new THREE.CylinderGeometry(0.135, 0.15, 0.22, 18);
      const bootShaft = this.createOutlinedMesh(bootShaftGeom, this.materials.boots, 0.03);
      bootShaft.position.y = -0.74;
      legPivot.add(bootShaft);

      const bootFootGeom = new THREE.CapsuleGeometry(0.13, 0.16, 12, 16);
      const bootFoot = this.createOutlinedMesh(bootFootGeom, this.materials.boots, 0.03);
      bootFoot.rotation.x = Math.PI / 2;
      bootFoot.position.set(0, -0.82, 0.07);
      bootFoot.scale.set(1.12, 1.0, 0.85);
      legPivot.add(bootFoot);

      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg);
    group.add(rightLeg);

    this.characterParts = {
      head: headGroup,
      torso: torsoGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg
    };

    this.character = group;
    this.scene.add(this.character);
    return group;
  }

  // 3. Fungsi Utama untuk Menukar Pakaian
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
    if (!palette) {
      console.warn(`Pakaian bernama "${outfitName}" tidak dijumpai.`);
      return;
    }

    // Kemas kini warna materials secara langsung
    this.materials.hoodie.color.setHex(palette.hoodie);
    this.materials.pocket.color.setHex(palette.pocket);
    this.materials.pants.color.setHex(palette.pants);
    this.materials.cuffs.color.setHex(palette.cuffs);
    this.materials.boots.color.setHex(palette.boots);
    this.materials.belt.color.setHex(palette.belt);
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
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }
    this.character = null;
    this.characterParts = {};
    this.animations = {};
  }
}
