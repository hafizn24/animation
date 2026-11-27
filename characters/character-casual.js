import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseCharacterApp } from './core/BaseCharacterApp.js';

export class AnotherCasualOutfitApp extends BaseCharacterApp {
  constructor(container) {
    super(container);

    this.headRadius = 0.46;   // head sphere radius the hair is built around
    this.headOffsetY = 0;  // vertical offset of the head centre
    this.hairStyle = 'long';

    this.outfits = {
      beigeSweater: {
        sweater: 0xd5c1a1,     // Warm Beige Cable-Knit Sweater
        knitRibbing: 0xbeac90, // Ribbed Collar, Cuffs & Hem
        jeans: 0x7b98b2,       // Light-Wash Denim Blue Jeans
        cuffs: 0x91acc4,       // Rolled-Up Light Denim Cuffs
        belt: 0xd98a3c,        // Tan Leather Belt
        boots: 0x8b533c        // Classic Brown Boots
      },
      oliveSweater: {
        sweater: 0x848c68,
        knitRibbing: 0x6c7353,
        jeans: 0x3b4d61,
        cuffs: 0x566c85,
        belt: 0xc27830,
        boots: 0x6b3e26
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

  createCableKnitTexture(baseHex, lineHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#' + new THREE.Color(baseHex).getHexString();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#' + new THREE.Color(lineHex).getHexString();
    ctx.lineWidth = 6;

    const cols = 12;
    const colW = canvas.width / cols;
    for (let i = 0; i <= cols; i++) {
      const x = i * colW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      // Subtle cable wave pattern between ribs
      if (i < cols) {
        ctx.beginPath();
        for (let y = 0; y < canvas.height; y += 32) {
          ctx.moveTo(x + colW * 0.25, y);
          ctx.quadraticCurveTo(x + colW * 0.5, y + 16, x + colW * 0.75, y + 32);
        }
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    const palette = this.outfits.beigeSweater;
    const knitTex = this.createCableKnitTexture(palette.sweater, palette.knitRibbing);

    this.materials = {
      hair: this.createToonMaterial(0x8a4a2a),
      skin: this.createToonMaterial(0xf1e5d4),
      white: this.createToonMaterial(0xffffff),
      sweaterKnit: this.createToonMaterial(0xffffff, knitTex),
      knitRibbing: this.createToonMaterial(palette.knitRibbing),
      jeans: this.createToonMaterial(palette.jeans),
      cuffs: this.createToonMaterial(palette.cuffs),
      belt: this.createToonMaterial(palette.belt),
      boots: this.createToonMaterial(palette.boots),
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

    // ==================== 2. CABLE-KNIT SWEATER (NO HOOD) ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    // Main Knit Sweater Torso
    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.35, 0.68, 24);
    const torso = this.createOutlinedMesh(torsoGeom, this.materials.sweaterKnit, 0.028);
    torso.scale.set(1.08, 1, 0.78);
    torsoGroup.add(torso);

    // Rounded Knit Shoulders
    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.sweaterKnit, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.12, 0.55, 0.78);
    torsoGroup.add(shoulders);

    // Thick Ribbed Crew-Neck Collar (No Hood)
    const collarGeom = new THREE.TorusGeometry(0.17, 0.055, 16, 24);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.knitRibbing, 0.03);
    collar.position.set(0, 0.38, 0.0);
    collar.rotation.x = Math.PI / 2 + 0.12;
    collar.scale.set(1.05, 1.05, 0.9);
    torsoGroup.add(collar);

    // Ribbed Bottom Sweater Hem
    const hemGeom = new THREE.CylinderGeometry(0.355, 0.35, 0.10, 24);
    const hem = this.createOutlinedMesh(hemGeom, this.materials.knitRibbing, 0.025);
    hem.position.y = -0.32;
    hem.scale.set(1.08, 1, 0.78);
    torsoGroup.add(hem);

    group.add(torsoGroup);

    // ==================== 3. TAN BELT & LIGHT-WASH JEANS PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const beltGeom = new THREE.CylinderGeometry(0.355, 0.355, 0.10, 24);
    const belt = this.createOutlinedMesh(beltGeom, this.materials.belt, 0.025);
    belt.scale.set(1.06, 1, 0.78);
    pelvisGroup.add(belt);

    // Rectangular Belt Buckle
    const buckleGeom = new THREE.BoxGeometry(0.11, 0.11, 0.05);
    const buckle = this.createOutlinedMesh(buckleGeom, this.materials.belt, 0.04);
    buckle.position.set(0, 0, 0.27);
    pelvisGroup.add(buckle);

    const loopGeom = new THREE.BoxGeometry(0.035, 0.11, 0.03);
    [-0.18, 0.18].forEach((xPos) => {
      const loop = new THREE.Mesh(loopGeom, this.materials.black);
      loop.position.set(xPos, 0, 0.26);
      pelvisGroup.add(loop);
    });

    const hipsGeom = new THREE.CylinderGeometry(0.35, 0.34, 0.18, 24);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.jeans, 0.025);
    hips.position.y = -0.12;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    // ==================== 4. KNIT SLEEVES, RIBBED CUFFS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(dir * 0.34, 1.74, 0);

      const sleeveGeom = new THREE.CylinderGeometry(0.11, 0.15, 0.58, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.sweaterKnit, 0.03);
      sleeve.position.y = -0.27;
      armPivot.add(sleeve);

      const sleeveCuffGeom = new THREE.CylinderGeometry(0.125, 0.12, 0.08, 16);
      const sleeveCuff = this.createOutlinedMesh(sleeveCuffGeom, this.materials.knitRibbing, 0.03);
      sleeveCuff.position.y = -0.57;
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

    // ==================== 5. LIGHT-WASH JEANS, CUFFS & BROWN BOOTS ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(dir * 0.18, 0.90, 0);

      const pantGeom = new THREE.CylinderGeometry(0.145, 0.155, 0.62, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.jeans, 0.03);
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
    group.add(leftLeg, rightLeg);

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
    if (!palette) return;

    this.materials.sweaterKnit.map = this.createCableKnitTexture(palette.sweater, palette.knitRibbing);
    this.materials.sweaterKnit.needsUpdate = true;
    this.materials.knitRibbing.color.setHex(palette.knitRibbing);
    this.materials.jeans.color.setHex(palette.jeans);
    this.materials.cuffs.color.setHex(palette.cuffs);
    this.materials.belt.color.setHex(palette.belt);
    this.materials.boots.color.setHex(palette.boots);
  }
}
