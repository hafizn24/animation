import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseCharacterApp } from './core/BaseCharacterApp.js';
import { CHAIRMAN_MOTION } from './core/motion.js';

/**
 * ChairmanApp – The Chairman of Buluh FC.
 *
 * Built from the "PIPIN – Special Characters Collection" sheet:
 *   1. Faceless head with round gold spectacles
 *   2. Grey three-piece suit – jacket, waistcoat, white shirt, maroon tie
 *      with a red pocket square and a gold watch chain
 *   3. Grey trousers, black dress shoes, gold wristwatch
 *   4. Props – walking cane, gavel, smoking pipe
 *   5. Poses – idle, distinguished walk, stride, thoughtful beard stroke,
 *      decisive gavel point, pipe
 *
 * The body rig follows characters/character-default.js exactly, so the
 * Chairman shares the same proportions and joint positions as every other
 * character in the viewer.
 */
export class ChairmanApp extends BaseCharacterApp {
  constructor(container) {
    super(container);
    this.motion = { ...CHAIRMAN_MOTION };

    // Outfit palettes
    this.headRadius = 0.46;   // head sphere radius the hair is built around
    this.headOffsetY = 0;  // vertical offset of the head centre
    this.hairStyle = 'receding';

    this.outfits = {
      boardroomGrey: {
        jacket: 0x6e7276,      // Charcoal grey jacket
        vest: 0x585c60,        // Darker waistcoat
        lapel: 0x7d8185,        // Lighter lapels
        shirt: 0xf4f2ea,        // White dress shirt
        tie: 0x7c1f2b,         // Maroon tie
        pocket: 0xa3212f,       // Red pocket square
        pants: 0x64686c,        // Grey trousers
        cuffs: 0x55595d,        // Turned-up trouser cuffs
        shoes: 0x1b1c1e,        // Black dress shoes
        skin: 0xf1e5d4
      },
      navyBoardroom: {
        jacket: 0x333c4d,
        vest: 0x2a3140,
        lapel: 0x3f4a5e,
        shirt: 0xf4f2ea,
        tie: 0x8a6a24,
        pocket: 0xb9922f,
        pants: 0x2f3746,
        cuffs: 0x272e3b,
        shoes: 0x16181c,
        skin: 0xf1e5d4
      }
    };

    // Pose library – rotations for each rig joint
    this.poses = {
      idle: {
        head: { x: 0, y: 0, z: 0 },
        torso: { x: 0, y: 0, z: 0 },
        leftArm: { x: 0.05, y: 0, z: -0.32 },
        rightArm: { x: 0.05, y: 0, z: 0.32 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: {}
      },
      walk: {
        head: { x: 0.04, y: 0, z: 0 },
        torso: { x: 0, y: -0.10, z: 0 },
        leftArm: { x: -0.34, y: 0, z: -0.30 },
        rightArm: { x: 0.26, y: 0, z: 0.28 },
        leftLeg: { x: 0.42, y: 0, z: 0 },
        rightLeg: { x: -0.30, y: 0, z: 0 },
        props: { cane: true }
      },
      stride: {
        head: { x: 0.02, y: 0.06, z: 0 },
        torso: { x: 0, y: 0.12, z: 0 },
        leftArm: { x: 0.30, y: 0, z: -0.28 },
        rightArm: { x: -0.40, y: 0, z: 0.30 },
        leftLeg: { x: -0.34, y: 0, z: 0 },
        rightLeg: { x: 0.46, y: 0, z: 0 },
        props: { cane: true }
      },
      thoughtful: {
        head: { x: 0.22, y: -0.18, z: 0 },
        torso: { x: 0.05, y: -0.08, z: 0 },
        leftArm: { x: 0.12, y: 0, z: -0.30 },
        rightArm: { x: -2.00, y: 0, z: -0.35 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: {}
      },
      gavel: {
        head: { x: -0.06, y: 0.05, z: 0 },
        torso: { x: -0.04, y: 0.06, z: 0 },
        leftArm: { x: 0.08, y: 0, z: -0.32 },
        rightArm: { x: -1.28, y: 0, z: -0.12 },
        leftLeg: { x: 0.06, y: 0, z: 0 },
        rightLeg: { x: -0.06, y: 0, z: 0 },
        props: { gavel: true }
      },
      pipe: {
        head: { x: 0.12, y: -0.10, z: 0 },
        torso: { x: 0.03, y: -0.05, z: 0 },
        leftArm: { x: 0.10, y: 0, z: -0.30 },
        rightArm: { x: -1.85, y: 0, z: -0.30 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: { pipe: true }
      }
    };
  }

  setupScene() {
    this.scene = new THREE.Scene();

    // Soft studio backdrop – keeps the near-white skin and shirt readable
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
    group.name = 'Chairman';
    const palette = this.outfits.boardroomGrey;

    this.materials = {
      hair: this.createToonMaterial(0xb9b7b0),
      skin: this.createToonMaterial(palette.skin),
      jacket: this.createToonMaterial(palette.jacket),
      vest: this.createToonMaterial(palette.vest),
      lapel: this.createToonMaterial(palette.lapel),
      shirt: this.createToonMaterial(palette.shirt),
      tie: this.createToonMaterial(palette.tie),
      pocket: this.createToonMaterial(palette.pocket),
      pants: this.createToonMaterial(palette.pants),
      cuffs: this.createToonMaterial(palette.cuffs),
      shoes: this.createToonMaterial(palette.shoes),
      gold: this.createToonMaterial(0xd9a441),
      wood: this.createToonMaterial(0x6b4a2e),
      black: new THREE.MeshBasicMaterial({ color: 0x111111 })
    };

    this.props = {};

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

    // Round gold spectacles – seated on the face
    const rimGeom = new THREE.TorusGeometry(0.085, 0.013, 8, 20);
    [-1, 1].forEach((dir) => {
      const rim = this.createOutlinedMesh(rimGeom, this.materials.gold, 0.02);
      rim.position.set(dir * 0.155, 0.40, 0.452);
      rim.rotation.y = dir * 0.18;
      headGroup.add(rim);
    });
    const bridge = this.createOutlinedMesh(new THREE.BoxGeometry(0.085, 0.015, 0.015), this.materials.gold, 0.02);
    bridge.position.set(0, 0.412, 0.468);
    headGroup.add(bridge);
    [-1, 1].forEach((dir) => {
      const temple = this.createOutlinedMesh(new THREE.BoxGeometry(0.015, 0.015, 0.4), this.materials.gold, 0.02);
      temple.position.set(dir * 0.329, 0.412, 0.278);
      temple.rotation.y = dir > 0 ? 2.667 : -2.667;
      headGroup.add(temple);
    });

    const neckGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.skin, 0.025);
    neck.position.y = -0.02;
    headGroup.add(neck);
    group.add(headGroup);

    // ==================== 2. GREY THREE-PIECE SUIT ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.36, 0.72, 24);
    const torso = this.createOutlinedMesh(torsoGeom, this.materials.jacket, 0.028);
    torso.scale.set(1.08, 1, 0.78);
    torsoGroup.add(torso);

    // Waistcoat panel
    const vestGeom = new THREE.CylinderGeometry(0.26, 0.30, 0.68, 20);
    const vest = this.createOutlinedMesh(vestGeom, this.materials.vest, 0.015);
    vest.position.set(0, -0.01, 0.045);
    vest.scale.set(0.65, 1, 0.78);
    torsoGroup.add(vest);

    // White dress shirt V-front
    const shirtFrontGeom = new THREE.ConeGeometry(0.14, 0.30, 4);
    const shirtFront = this.createOutlinedMesh(shirtFrontGeom, this.materials.shirt, 0.02);
    shirtFront.rotation.z = Math.PI;
    shirtFront.rotation.y = Math.PI / 4;
    shirtFront.position.set(0, 0.26, 0.19);
    shirtFront.scale.set(1.1, 1, 0.5);
    torsoGroup.add(shirtFront);

    // Maroon necktie
    const knotGeom = new THREE.BoxGeometry(0.055, 0.055, 0.04);
    const tieKnot = this.createOutlinedMesh(knotGeom, this.materials.tie, 0.03);
    tieKnot.position.set(0, 0.33, 0.235);
    torsoGroup.add(tieKnot);

    const tieBladeGeom = new THREE.BoxGeometry(0.05, 0.26, 0.03);
    const tieBlade = this.createOutlinedMesh(tieBladeGeom, this.materials.tie, 0.03);
    tieBlade.position.set(0, 0.18, 0.245);
    torsoGroup.add(tieBlade);

    // Jacket lapels
    const lapelGeom = new THREE.BoxGeometry(0.08, 0.42, 0.04);
    [-1, 1].forEach((dir) => {
      const lapel = this.createOutlinedMesh(lapelGeom, this.materials.lapel, 0.03);
      lapel.position.set(dir * 0.11, 0.14, 0.235);
      lapel.rotation.z = dir * -0.22;
      torsoGroup.add(lapel);
    });

    // Waistcoat buttons
    const btnGeom = new THREE.SphereGeometry(0.018, 8, 8);
    [-0.04, -0.13, -0.22].forEach((yPos) => {
      const btn = this.createOutlinedMesh(btnGeom, this.materials.gold, 0.03);
      btn.position.set(0, yPos, 0.27);
      torsoGroup.add(btn);
    });

    // Gold watch chain across the waistcoat
    const chain = this.createOutlinedMesh(
      new THREE.TorusGeometry(0.12, 0.009, 6, 18, Math.PI),
      this.materials.gold,
      0.02
    );
    chain.rotation.z = Math.PI;
    chain.position.set(0.03, -0.02, 0.265);
    torsoGroup.add(chain);

    // Red pocket square
    const squareGeom = new THREE.ConeGeometry(0.035, 0.05, 3);
    const pocketSquare = this.createOutlinedMesh(squareGeom, this.materials.pocket, 0.03);
    pocketSquare.position.set(0.18, 0.16, 0.25);
    torsoGroup.add(pocketSquare);

    const shoulderGeom = new THREE.SphereGeometry(0.32, 24, 16);
    const shoulders = this.createOutlinedMesh(shoulderGeom, this.materials.jacket, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.12, 0.55, 0.78);
    torsoGroup.add(shoulders);
    group.add(torsoGroup);

    // ==================== 3. BELT & PELVIS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const beltGeom = new THREE.CylinderGeometry(0.355, 0.355, 0.10, 24);
    const belt = this.createOutlinedMesh(beltGeom, this.materials.shoes, 0.025);
    belt.scale.set(1.06, 1, 0.78);
    pelvisGroup.add(belt);

    const buckleGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 20);
    const buckle = this.createOutlinedMesh(buckleGeom, this.materials.gold, 0.04);
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

    // ==================== 4. SUIT SLEEVES, CUFFS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.name = isLeft ? 'LeftArm' : 'RightArm';
      armPivot.position.set(dir * 0.34, 1.74, 0);

      const sleeveGeom = new THREE.CylinderGeometry(0.11, 0.15, 0.62, 16);
      const sleeve = this.createOutlinedMesh(sleeveGeom, this.materials.jacket, 0.03);
      sleeve.position.y = -0.28;
      armPivot.add(sleeve);

      const sleeveCuffGeom = new THREE.TorusGeometry(0.115, 0.035, 12, 20);
      const sleeveCuff = this.createOutlinedMesh(sleeveCuffGeom, this.materials.shirt, 0.03);
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

      // Gold wristwatch
      const watchBand = this.createOutlinedMesh(
        new THREE.TorusGeometry(0.105, 0.018, 6, 16),
        this.materials.gold,
        0.02
      );
      watchBand.rotation.x = Math.PI / 2;
      watchBand.position.set(0, 0.09, 0);
      handGroup.add(watchBand);

      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.32;

      // ---- Props carried in the right hand ----
      if (!isLeft) {
        // Walking cane
        const cane = new THREE.Group();
        cane.name = 'Cane';
        const shaft = this.createOutlinedMesh(
          new THREE.CylinderGeometry(0.022, 0.026, 1.05, 12),
          this.materials.wood,
          0.03
        );
        shaft.position.y = -0.52;
        cane.add(shaft);
        const handle = this.createOutlinedMesh(
          new THREE.TorusGeometry(0.062, 0.021, 8, 14, Math.PI * 1.1),
          this.materials.wood,
          0.03
        );
        handle.rotation.z = -0.45;
        handle.position.set(0, -0.02, 0.02);
        cane.add(handle);
        const ferrule = this.createOutlinedMesh(
          new THREE.CylinderGeometry(0.03, 0.026, 0.07, 10),
          this.materials.shoes,
          0.03
        );
        ferrule.position.y = -1.06;
        cane.add(ferrule);
        cane.position.set(0, -0.06, 0.02);
        cane.visible = false;
        handGroup.add(cane);
        this.props.cane = cane;

        // Gavel
        const gavel = new THREE.Group();
        gavel.name = 'Gavel';
        const gavelHead = this.createOutlinedMesh(
          new THREE.CylinderGeometry(0.052, 0.052, 0.13, 14),
          this.materials.wood,
          0.03
        );
        gavelHead.rotation.z = Math.PI / 2;
        gavel.add(gavelHead);
        const gavelHandle = this.createOutlinedMesh(
          new THREE.CylinderGeometry(0.022, 0.026, 0.24, 10),
          this.materials.wood,
          0.03
        );
        gavelHandle.position.set(0, -0.16, 0);
        gavel.add(gavelHandle);
        gavel.position.set(0, -0.06, 0.06);
        gavel.rotation.x = -0.5;
        gavel.visible = false;
        handGroup.add(gavel);
        this.props.gavel = gavel;

        // Smoking pipe
        const pipe = new THREE.Group();
        pipe.name = 'Pipe';
        const bowl = this.createOutlinedMesh(
          new THREE.CylinderGeometry(0.045, 0.035, 0.08, 12),
          this.materials.wood,
          0.03
        );
        bowl.position.set(0, -0.06, 0.04);
        pipe.add(bowl);
        const stem = this.createOutlinedMesh(
          new THREE.TorusGeometry(0.06, 0.014, 6, 12, Math.PI),
          this.materials.wood,
          0.03
        );
        stem.rotation.y = Math.PI / 2;
        stem.position.set(0, -0.02, 0.0);
        pipe.add(stem);
        pipe.position.set(0, -0.04, 0.02);
        pipe.visible = false;
        handGroup.add(pipe);
        this.props.pipe = pipe;
      }

      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // ==================== 5. TROUSERS & DRESS SHOES ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.name = isLeft ? 'LeftLeg' : 'RightLeg';
      legPivot.position.set(dir * 0.18, 0.90, 0);

      const pantGeom = new THREE.CylinderGeometry(0.145, 0.155, 0.62, 18);
      const pant = this.createOutlinedMesh(pantGeom, this.materials.pants, 0.03);
      pant.position.y = -0.30;
      legPivot.add(pant);

      const cuffGeom = new THREE.CylinderGeometry(0.17, 0.17, 0.11, 20);
      const cuff = this.createOutlinedMesh(cuffGeom, this.materials.cuffs, 0.03);
      cuff.position.y = -0.60;
      legPivot.add(cuff);

      const shoeShaftGeom = new THREE.CylinderGeometry(0.135, 0.15, 0.22, 18);
      const shoeShaft = this.createOutlinedMesh(shoeShaftGeom, this.materials.shoes, 0.03);
      shoeShaft.position.y = -0.74;
      legPivot.add(shoeShaft);

      const shoeFootGeom = new THREE.CapsuleGeometry(0.13, 0.16, 12, 16);
      const shoeFoot = this.createOutlinedMesh(shoeFootGeom, this.materials.shoes, 0.03);
      shoeFoot.rotation.x = Math.PI / 2;
      shoeFoot.position.set(0, -0.82, 0.07);
      shoeFoot.scale.set(1.12, 1.0, 0.85);
      legPivot.add(shoeFoot);

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
    this.setPose('idle');
    return group;
  }

  /**
   * Applies a named pose from the pose library.
   * @param {string} poseName one of idle | walk | stride | thoughtful | gavel | pipe
   */
  setPose(poseName) {
    const pose = this.poses[poseName];
    if (!pose) {
      console.warn(`Pose "${poseName}" not found.`);
      return;
    }
    this.currentPose = poseName;
    this.isWalking = poseName === 'walk' || poseName === 'stride';

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
      this.props[key].visible = !!(pose.props && pose.props[key]);
    });
  }

  changeOutfit(outfitName) {
    const palette = this.outfits[outfitName];
    if (!palette) return;

    this.materials.jacket.color.setHex(palette.jacket);
    this.materials.vest.color.setHex(palette.vest);
    this.materials.lapel.color.setHex(palette.lapel);
    this.materials.shirt.color.setHex(palette.shirt);
    this.materials.tie.color.setHex(palette.tie);
    this.materials.pocket.color.setHex(palette.pocket);
    this.materials.pants.color.setHex(palette.pants);
    this.materials.cuffs.color.setHex(palette.cuffs);
    this.materials.shoes.color.setHex(palette.shoes);
    this.materials.skin.color.setHex(palette.skin);
  }
}
