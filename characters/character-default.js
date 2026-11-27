import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseCharacterApp } from './core/BaseCharacterApp.js';

export class App extends BaseCharacterApp {
  constructor(container) {
    super(container);

    // 1. Senarai pilihan pakaian (Outfit Palettes)
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
      skin: this.createToonMaterial(0xf1e5d4),
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
      const palm = this.createOutlinedMesh(palmGeom, this.materials.skin, 0.035);
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
      pelvis: pelvisGroup,
      leftArm,
      rightArm,
      leftHand: leftArm.getObjectByName('Hand'),
      rightHand: rightArm.getObjectByName('Hand'),
      leftLeg,
      rightLeg
    };

    this.character = group;
    this.scene.add(this.character);
    return group;
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
}
