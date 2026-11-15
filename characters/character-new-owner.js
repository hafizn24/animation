import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * NewOwnerApp – The new owner of Oakhaven United FC.
 *
 * Built from the "PIPIN – Special Characters Collection" sheet:
 *   1. Swept brown hair with a full quiff
 *   2. Navy knitted sweater with ribbed collar, cuffs and hem
 *   3. Blue jeans and white trainers
 *   4. Brown leather messenger bag worn across the body
 *   5. Props – car keys, a document and a coffee cup
 *   6. Poses – idle, three dynamic walk poses, handshake,
 *      presenting a document, coffee and keys
 */
export class NewOwnerApp {
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
    this.currentPose = 'idle';

    // Outfit palettes
    this.outfits = {
      navyOwner: {
        sweater: 0x2b3550,      // Navy knit
        sweaterDark: 0x212a41,  // Ribbed trim
        jeans: 0x4a6a8a,        // Blue jeans
        jeansDark: 0x3b5670,    // Denim pocket / seam
        shoes: 0xf2f2ee,        // White trainers
        sole: 0xe2e2dc,         // Trainer sole
        hair: 0x5b3a25,         // Brown hair
        hairDark: 0x41291a,     // Darker hair shade
        skin: 0xf6f4ef,
        leather: 0x7a4423       // Messenger bag leather
      },
      charcoalOwner: {
        sweater: 0x3c3c42,
        sweaterDark: 0x2e2e33,
        jeans: 0x2f3640,
        jeansDark: 0x262c34,
        shoes: 0xe8e4dc,
        sole: 0xd6d2ca,
        hair: 0x5a4028,
        hairDark: 0x402c1c,
        skin: 0xf6f4ef,
        leather: 0x2f2f33
      }
    };

    // Pose library – rotations for each rig joint
    this.poses = {
      idle: {
        head: { x: 0, y: 0, z: 0 },
        torso: { x: 0, y: 0, z: 0 },
        leftArm: { x: 0.06, y: 0, z: -0.30 },
        rightArm: { x: 0.06, y: 0, z: 0.30 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: { bag: true }
      },
      walkA: {
        head: { x: 0.03, y: -0.06, z: 0 },
        torso: { x: 0.04, y: -0.12, z: 0 },
        leftArm: { x: -0.46, y: 0, z: -0.28 },
        rightArm: { x: 0.38, y: 0, z: 0.26 },
        leftLeg: { x: 0.52, y: 0, z: 0 },
        rightLeg: { x: -0.38, y: 0, z: 0 },
        props: { bag: true }
      },
      walkB: {
        head: { x: 0.02, y: 0.08, z: 0 },
        torso: { x: 0.04, y: 0.14, z: 0 },
        leftArm: { x: 0.40, y: 0, z: -0.26 },
        rightArm: { x: -0.48, y: 0, z: 0.28 },
        leftLeg: { x: -0.42, y: 0, z: 0 },
        rightLeg: { x: 0.56, y: 0, z: 0 },
        props: { bag: true }
      },
      walkC: {
        head: { x: 0.05, y: 0, z: 0 },
        torso: { x: 0.06, y: 0, z: 0 },
        leftArm: { x: -0.18, y: 0, z: -0.32 },
        rightArm: { x: 0.16, y: 0, z: 0.32 },
        leftLeg: { x: 0.12, y: 0, z: 0 },
        rightLeg: { x: -0.16, y: 0, z: 0 },
        props: { bag: true }
      },
      handshake: {
        head: { x: 0.08, y: -0.06, z: 0 },
        torso: { x: 0.02, y: -0.06, z: 0 },
        leftArm: { x: 0.10, y: 0, z: -0.32 },
        rightArm: { x: -0.78, y: 0, z: -0.18 },
        leftLeg: { x: 0.04, y: 0, z: 0 },
        rightLeg: { x: -0.04, y: 0, z: 0 },
        props: { bag: true }
      },
      document: {
        head: { x: -0.04, y: 0.04, z: 0 },
        torso: { x: -0.02, y: 0.05, z: 0 },
        leftArm: { x: 0.08, y: 0, z: -0.32 },
        rightArm: { x: -1.16, y: 0, z: -0.15 },
        leftLeg: { x: 0.02, y: 0, z: 0 },
        rightLeg: { x: -0.02, y: 0, z: 0 },
        props: { document: true, bag: true }
      },
      coffee: {
        head: { x: 0.06, y: 0, z: 0 },
        torso: { x: 0, y: 0, z: 0 },
        leftArm: { x: 0.10, y: 0, z: -0.30 },
        rightArm: { x: -1.92, y: 0, z: -0.35 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: { coffee: true }
      },
      keys: {
        head: { x: 0.10, y: 0.10, z: 0 },
        torso: { x: 0, y: 0.16, z: 0 },
        leftArm: { x: 0.08, y: 0, z: -0.30 },
        rightArm: { x: -1.20, y: 0, z: -0.22 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: { keys: true, bagBack: true }
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
    if (this.character) {
      this.dispose();
    }

    const group = new THREE.Group();
    group.name = 'NewOwner';
    const palette = this.outfits.navyOwner;

    this.materials = {
      skin: this.createToonMaterial(palette.skin),
      hair: this.createToonMaterial(palette.hair),
      hairDark: this.createToonMaterial(palette.hairDark),
      sweater: this.createToonMaterial(palette.sweater),
      sweaterDark: this.createToonMaterial(palette.sweaterDark),
      jeans: this.createToonMaterial(palette.jeans),
      jeansDark: this.createToonMaterial(palette.jeansDark),
      shoes: this.createToonMaterial(palette.shoes),
      sole: this.createToonMaterial(palette.sole),
      leather: this.createToonMaterial(palette.leather),
      leatherDark: this.createToonMaterial(0x4d2a13),
      gold: this.createToonMaterial(0xd9a441),
      silver: this.createToonMaterial(0xd7dade),
      white: this.createToonMaterial(0xfaf8f2),
      black: new THREE.MeshBasicMaterial({ color: 0x111111 })
    };

    this.props = {};

    // ==================== 1. SWEPT BROWN HAIR & HEAD ====================
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);

    const headGeom = new THREE.SphereGeometry(0.46, 32, 32);
    const head = this.createOutlinedMesh(headGeom, this.materials.skin, 0.03);
    head.position.y = 0.36;
    headGroup.add(head);

    // Hair cap – covers the crown
    const capGeom = new THREE.SphereGeometry(0.487, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const cap = this.createOutlinedMesh(capGeom, this.materials.hair, 0.022);
    cap.position.y = 0.345;
    headGroup.add(cap);

    // Swept quiff – volume brushed back off the forehead
    const quiff = this.createOutlinedMesh(new THREE.SphereGeometry(0.31, 20, 16), this.materials.hair, 0.025);
    quiff.position.set(0.03, 0.60, 0.17);
    quiff.scale.set(1.02, 0.74, 1.06);
    headGroup.add(quiff);

    const sweep = this.createOutlinedMesh(new THREE.SphereGeometry(0.22, 16, 14), this.materials.hairDark, 0.025);
    sweep.position.set(-0.17, 0.53, 0.27);
    sweep.scale.set(1.25, 0.52, 0.85);
    sweep.rotation.z = 0.5;
    headGroup.add(sweep);

    // Sideburns
    [-1, 1].forEach((dir) => {
      const burn = this.createOutlinedMesh(new THREE.BoxGeometry(0.07, 0.16, 0.1), this.materials.hair, 0.025);
      burn.position.set(dir * 0.42, 0.3, 0.04);
      headGroup.add(burn);
    });

    // Ears
    [-1, 1].forEach((dir) => {
      const ear = this.createOutlinedMesh(new THREE.SphereGeometry(0.085, 12, 12), this.materials.skin, 0.03);
      ear.position.set(dir * 0.44, 0.33, -0.02);
      ear.scale.set(0.7, 1, 0.85);
      headGroup.add(ear);
    });

    const neckGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.skin, 0.025);
    neck.position.y = -0.02;
    headGroup.add(neck);
    group.add(headGroup);

    // ==================== 2. NAVY KNITTED SWEATER ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    const sweaterGeom = new THREE.CylinderGeometry(0.30, 0.35, 0.72, 24);
    const sweater = this.createOutlinedMesh(sweaterGeom, this.materials.sweater, 0.028);
    sweater.scale.set(1.08, 1, 0.78);
    torsoGroup.add(sweater);

    // Ribbed crew collar
    const collarGeom = new THREE.TorusGeometry(0.17, 0.055, 10, 22);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.sweaterDark, 0.03);
    collar.position.set(0, 0.36, 0);
    collar.rotation.x = Math.PI / 2;
    collar.scale.set(1.15, 1.1, 1);
    torsoGroup.add(collar);

    // Ribbed hem
    const hemGeom = new THREE.TorusGeometry(0.345, 0.05, 10, 24);
    const hem = this.createOutlinedMesh(hemGeom, this.materials.sweaterDark, 0.03);
    hem.position.set(0, -0.34, 0);
    hem.rotation.x = Math.PI / 2;
    hem.scale.set(1.08, 0.78, 1);
    torsoGroup.add(hem);

    // Knit shoulder yoke
    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.sweater, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.14, 0.52, 0.78);
    torsoGroup.add(shoulders);

    // ==================== 3. MESSENGER BAG & STRAP ====================
    const bagGroup = new THREE.Group();
    bagGroup.name = 'MessengerBag';
    torsoGroup.add(bagGroup);

    const strapGeom = new THREE.BoxGeometry(0.09, 0.80, 0.03);
    const strap = this.createOutlinedMesh(strapGeom, this.materials.leatherDark, 0.025);
    strap.position.set(0, 0.02, 0.255);
    strap.rotation.z = -0.74;
    bagGroup.add(strap);

    const bagBody = this.createOutlinedMesh(new THREE.BoxGeometry(0.34, 0.27, 0.14), this.materials.leather, 0.025);
    bagBody.position.set(0.28, -0.30, 0.05);
    bagGroup.add(bagBody);

    const flap = this.createOutlinedMesh(new THREE.BoxGeometry(0.36, 0.14, 0.03), this.materials.leatherDark, 0.025);
    flap.position.set(0.28, -0.20, 0.125);
    bagGroup.add(flap);

    const buckle = this.createOutlinedMesh(new THREE.BoxGeometry(0.07, 0.05, 0.03), this.materials.gold, 0.03);
    buckle.position.set(0.28, -0.25, 0.145);
    bagGroup.add(buckle);

    group.add(torsoGroup);
    this.props.bag = bagGroup;

    // ==================== 4. JEANS PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const beltGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24);
    const belt = this.createOutlinedMesh(beltGeom, this.materials.leatherDark, 0.02);
    belt.scale.set(1.06, 1, 0.78);
    pelvisGroup.add(belt);

    const buckleGeom = new THREE.BoxGeometry(0.07, 0.05, 0.03);
    const beltBuckle = this.createOutlinedMesh(buckleGeom, this.materials.gold, 0.03);
    beltBuckle.position.set(0, 0, 0.28);
    pelvisGroup.add(beltBuckle);

    const hipsGeom = new THREE.CylinderGeometry(0.35, 0.34, 0.18, 24);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.jeans, 0.025);
    hips.position.y = -0.12;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);

    const pocketGeom = new THREE.BoxGeometry(0.13, 0.13, 0.04);
    [-1, 1].forEach((dir) => {
      const pocket = this.createOutlinedMesh(pocketGeom, this.materials.jeansDark, 0.025);
      pocket.position.set(dir * 0.2, -0.08, 0.25);
      pocket.rotation.z = dir * 0.2;
      pelvisGroup.add(pocket);
    });
    group.add(pelvisGroup);

    // ==================== 5. SWEATER SLEEVES, CUFFS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.name = isLeft ? 'LeftArm' : 'RightArm';
      armPivot.position.set(dir * 0.40, 1.74, 0);

      const sleeveGeom = new THREE.CylinderGeometry(0.11, 0.14, 0.6, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.sweater, 0.03);
      sleeve.position.y = -0.28;
      armPivot.add(sleeve);

      // Rounded shoulder cap blending the sleeve into the sweater
      const shoulderCap = this.createOutlinedMesh(new THREE.SphereGeometry(0.14, 16, 12), this.materials.sweater, 0.04);
      shoulderCap.position.y = 0.02;
      shoulderCap.scale.set(1, 0.85, 1);
      armPivot.add(shoulderCap);

      const cuffGeom = new THREE.TorusGeometry(0.125, 0.045, 10, 18);
      const cuff = this.createOutlinedMesh(cuffGeom, this.materials.sweaterDark, 0.03);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.58;
      armPivot.add(cuff);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(0, -0.68, 0);

      const palmGeom = new THREE.SphereGeometry(0.11, 16, 16);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.skin, 0.035);
      palm.scale.set(1.0, 1.05, 0.65);
      handGroup.add(palm);

      const fingerGeom = new THREE.CapsuleGeometry(0.028, 0.09, 8, 8);
      [-0.35, -0.12, 0.12, 0.35].forEach((spreadAngle) => {
        const finger = this.createOutlinedMesh(fingerGeom, this.materials.skin, 0.04);
        finger.position.set(Math.sin(spreadAngle) * 0.11, -Math.cos(spreadAngle) * 0.11 - 0.02, 0);
        finger.rotation.z = spreadAngle;
        handGroup.add(finger);
      });

      const thumb = this.createOutlinedMesh(fingerGeom, this.materials.skin, 0.04);
      thumb.position.set(-dir * 0.11, -0.02, 0.02);
      thumb.rotation.z = -dir * 0.75;
      handGroup.add(thumb);

      // Dark wristwatch
      const watchBand = this.createOutlinedMesh(
        new THREE.TorusGeometry(0.105, 0.018, 6, 16),
        this.materials.black,
        0.02
      );
      watchBand.rotation.x = Math.PI / 2;
      watchBand.position.set(0, 0.1, 0);
      handGroup.add(watchBand);

      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.30;

      // ---- Props carried in the right hand ----
      if (!isLeft) {
        // Car keys
        const keys = new THREE.Group();
        keys.name = 'CarKeys';
        const fob = this.createOutlinedMesh(new THREE.BoxGeometry(0.1, 0.16, 0.03), this.materials.black, 0.03);
        fob.position.set(0, -0.04, 0.03);
        keys.add(fob);
        [0, 1].forEach((i) => {
          const key = this.createOutlinedMesh(new THREE.BoxGeometry(0.045, 0.14, 0.014), this.materials.silver, 0.03);
          key.position.set(-0.05 + i * 0.09, -0.16, 0.03);
          key.rotation.z = 0.2 - i * 0.4;
          keys.add(key);
        });
        keys.position.set(0, -0.04, 0.02);
        keys.visible = false;
        handGroup.add(keys);
        this.props.keys = keys;

        // Presented document
        const document = new THREE.Group();
        document.name = 'Document';
        const sheet = this.createOutlinedMesh(new THREE.BoxGeometry(0.27, 0.35, 0.01), this.materials.white, 0.02);
        sheet.rotation.x = -0.35;
        document.add(sheet);
        const clip = this.createOutlinedMesh(new THREE.BoxGeometry(0.09, 0.03, 0.02), this.materials.gold, 0.03);
        clip.position.set(0, 0.15, 0.02);
        document.add(clip);
        document.position.set(0, -0.14, 0.17);
        document.visible = false;
        handGroup.add(document);
        this.props.document = document;

        // Coffee cup
        const coffee = new THREE.Group();
        coffee.name = 'CoffeeCup';
        const cup = this.createOutlinedMesh(new THREE.CylinderGeometry(0.055, 0.045, 0.12, 16), this.materials.white, 0.03);
        coffee.add(cup);
        const cupHandle = this.createOutlinedMesh(new THREE.TorusGeometry(0.035, 0.012, 8, 14), this.materials.white, 0.03);
        cupHandle.rotation.y = Math.PI / 2;
        cupHandle.position.set(0.06, 0, 0);
        coffee.add(cupHandle);
        const brew = this.createOutlinedMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16), this.materials.leatherDark, 0.02);
        brew.position.y = 0.058;
        coffee.add(brew);
        coffee.position.set(0, -0.08, 0.04);
        coffee.visible = false;
        handGroup.add(coffee);
        this.props.coffee = coffee;
      }

      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // ==================== 6. BLUE JEANS & WHITE TRAINERS ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.name = isLeft ? 'LeftLeg' : 'RightLeg';
      legPivot.position.set(dir * 0.18, 0.90, 0);

      const pantGeom = new THREE.CylinderGeometry(0.145, 0.155, 0.66, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.jeans, 0.03);
      pant.position.y = -0.32;
      legPivot.add(pant);

      const cuffGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 20);
      const cuff = this.createOutlinedMesh(cuffGeom, this.materials.jeansDark, 0.03);
      cuff.position.y = -0.63;
      legPivot.add(cuff);

      // Trainer sole
      const soleGeom = new THREE.BoxGeometry(0.22, 0.05, 0.34);
      const sole = this.createOutlinedMesh(soleGeom, this.materials.sole, 0.03);
      sole.position.set(0, -0.85, 0.06);
      legPivot.add(sole);

      // Trainer upper
      const upperGeom = new THREE.CapsuleGeometry(0.115, 0.16, 12, 16);
      const upper = this.createOutlinedMesh(upperGeom, this.materials.shoes, 0.03);
      upper.rotation.x = Math.PI / 2;
      upper.position.set(0, -0.78, 0.05);
      upper.scale.set(1.05, 1.0, 0.8);
      legPivot.add(upper);

      // Laces
      for (let l = 0; l < 3; l++) {
        const lace = this.createOutlinedMesh(new THREE.BoxGeometry(0.16, 0.012, 0.02), this.materials.white, 0.03);
        lace.position.set(0, -0.72, -0.03 + l * 0.06);
        legPivot.add(lace);
      }

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
      leftLeg,
      rightLeg
    };

    this.character = group;
    this.scene.add(this.character);
    this.setPose('idle');
    return group;
  }

  /**
   * Applies a named pose from the pose library.
   * @param {string} poseName one of idle | walkA | walkB | walkC | handshake |
   *                       document | coffee | keys
   */
  setPose(poseName) {
    const pose = this.poses[poseName];
    if (!pose) {
      console.warn(`Pose "${poseName}" not found.`);
      return;
    }
    this.currentPose = poseName;
    this.isWalking = poseName === 'walkA' || poseName === 'walkB' || poseName === 'walkC';

    const apply = (part, rot) => {
      if (!part) return;
      part.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);
    };

    apply(this.characterParts.head, pose.head);
    apply(this.characterParts.torso, pose.torso);
    apply(this.characterParts.leftArm, pose.leftArm);
    apply(this.characterParts.rightArm, pose.rightArm);
    apply(this.characterParts.leftLeg, pose.leftLeg);
    apply(this.characterParts.rightLeg, pose.rightLeg);

    Object.keys(this.props || {}).forEach((key) => {
      if (key === 'bag') return;
      this.props[key].visible = !!(pose.props && pose.props[key]);
    });

    // Messenger bag – worn across the body or slung on the back
    if (this.props.bag) {
      const bagOn = !!(pose.props && (pose.props.bag || pose.props.bagBack));
      this.props.bag.visible = bagOn;
      this.props.bag.rotation.y = (pose.props && pose.props.bagBack) ? Math.PI : 0;
    }
  }

  changeOutfit(outfitName) {
    const palette = this.outfits[outfitName];
    if (!palette) return;

    this.materials.sweater.color.setHex(palette.sweater);
    this.materials.sweaterDark.color.setHex(palette.sweaterDark);
    this.materials.jeans.color.setHex(palette.jeans);
    this.materials.jeansDark.color.setHex(palette.jeansDark);
    this.materials.shoes.color.setHex(palette.shoes);
    this.materials.sole.color.setHex(palette.sole);
    this.materials.hair.color.setHex(palette.hair);
    this.materials.hairDark.color.setHex(palette.hairDark);
    this.materials.skin.color.setHex(palette.skin);
    this.materials.leather.color.setHex(palette.leather);
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
        const speed = 6.2;
        leftLeg.rotation.x = Math.sin(elapsed * speed) * 0.5;
        rightLeg.rotation.x = -Math.sin(elapsed * speed) * 0.5;
        leftArm.rotation.x = -Math.sin(elapsed * speed) * 0.42;
        rightArm.rotation.x = Math.sin(elapsed * speed) * 0.42;
        this.character.position.y = Math.abs(Math.cos(elapsed * speed)) * 0.06;
      } else {
        head.position.y = 1.95 + Math.sin(elapsed * 2) * 0.015;
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
            Array.isArray(child.material)
              ? child.material.forEach(m => m.dispose())
              : child.material.dispose();
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
