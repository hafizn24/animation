import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseCharacterApp } from './core/BaseCharacterApp.js';
import { SOCCER_MOTION } from './core/motion.js';
import {
  createArmbandTexture,
  createBackNameTexture,
  createFrontNameTexture,
  createStripedTexture,
  replacePrintTexture,
} from './core/kits.js';

export class SoccerOutfitApp extends BaseCharacterApp {
  constructor(container) {
    super(container);
    this.motion = { ...SOCCER_MOTION };
    this.outlineOpts = { receiveShadow: false };

    this.headRadius = 0.47;   // head sphere radius the hair is built around
    this.headOffsetY = 0.01;  // vertical offset of the head centre
    this.hairStyle = 'crop';

    this.outfits = {
      soccerRedWhite: {
        jerseyPrimary: 0xde1326,   // Vivid Classic Red
        jerseySecondary: 0xffffff, // White Stripes
        shorts: 0xde1326,          // Red Shorts
        socks: 0xffffff,           // White Socks
        sockStripes: 0xde1326,     // Red Sock Hoops
        cleats: 0xffffff,          // White Soccer Cleats
        studs: 0xd4d4d8            // Cleat Studs
      },
      awayBlueWhite: {
        jerseyPrimary: 0x1d4ed8,
        jerseySecondary: 0xffffff,
        shorts: 0x1e3a8a,
        socks: 0xffffff,
        sockStripes: 0x1d4ed8,
        cleats: 0x111111,
        studs: 0xffffff
      },
      // Episode 3 — Hulubalang United (high-contrast rival strip, no new rig).
      hulubalangBlackOrange: {
        jerseyPrimary: 0x15171c,
        jerseySecondary: 0xff8a1f,
        shorts: 0x15171c,
        socks: 0xff8a1f,
        sockStripes: 0x15171c,
        cleats: 0x1a1a1a,
        studs: 0xff8a1f
      },
      // Episode 3 — Hulubalang United goalkeeper variant.
      hulubalangKeeper: {
        jerseyPrimary: 0xf2b41c,
        jerseySecondary: 0x201a12,
        shorts: 0x201a12,
        socks: 0xf2b41c,
        sockStripes: 0x201a12,
        cleats: 0x111111,
        studs: 0xffffff
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

  createStripedTexture(primaryHex, secondaryHex) {
    return createStripedTexture(primaryHex, secondaryHex, {
      size: 1024,
      stripes: 14,
      hemHex: 0x111111,
      hemRatio: 22 / 1024,
    });
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    const palette = this.outfits.soccerRedWhite;
    const stripedTex = this.createStripedTexture(palette.jerseyPrimary, palette.jerseySecondary);

    this.materials = {
      hair: this.createToonMaterial(0x2b2119),
      skin: this.createToonMaterial(0xf1e5d4),
      white: this.createToonMaterial(0xffffff),
      jerseyStriped: this.createToonMaterial(0xffffff, stripedTex),
      jerseySolid: this.createToonMaterial(palette.jerseyPrimary),
      shorts: this.createToonMaterial(palette.shorts),
      socks: this.createToonMaterial(palette.socks),
      sockStripes: this.createToonMaterial(palette.sockStripes),
      cleats: this.createToonMaterial(palette.cleats),
      studs: this.createToonMaterial(palette.studs),
      // Print textures stay blank until setPlayerPrint() is called; the
      // panels themselves ship hidden so existing renders are untouched.
      backName: new THREE.MeshBasicMaterial({ map: createBackNameTexture('', '') }),
      frontName: new THREE.MeshBasicMaterial({
        map: createFrontNameTexture('', ''),
        transparent: true,
        depthWrite: false,
      }),
      armband: new THREE.MeshBasicMaterial({ map: createArmbandTexture('C') }),
      black: new THREE.MeshBasicMaterial({ color: 0x0b0b0b })
    };

    // ==================== 1. FACELESS HEAD & NECK ====================
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);

    const headGeom = new THREE.SphereGeometry(0.47, 36, 36);
    const head = this.createOutlinedMesh(headGeom, this.materials.skin, 0.032);
    head.position.y = 0.37;
    headGroup.add(head);

    // Hairstyle
    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);

    const neckGeom = new THREE.CylinderGeometry(0.115, 0.125, 0.20, 20);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.skin, 0.028);
    neck.position.y = -0.04;
    headGroup.add(neck);

    group.add(headGroup);

    // ==================== 2. SEAMLESS STRIPED SOCCER JERSEY ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.44, 0);

    const torsoGeom = new THREE.CylinderGeometry(0.28, 0.32, 0.68, 36, 1, false);
    torsoGeom.rotateY(Math.PI / 14);

    const torsoMesh = new THREE.Mesh(torsoGeom, [
      this.materials.jerseyStriped,
      this.materials.jerseySolid,
      this.materials.jerseySolid
    ]);
    torsoMesh.castShadow = true;

    const torsoOutline = new THREE.Mesh(
      torsoGeom,
      new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide })
    );
    torsoOutline.scale.set(1.03, 1.02, 1.03);

    const torso = new THREE.Group();
    torso.add(torsoMesh, torsoOutline);
    torso.scale.set(1.06, 1, 0.74);
    torsoGroup.add(torso);

    const upperChestGeom = new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    upperChestGeom.rotateY(Math.PI / 14);
    const upperChest = this.createOutlinedMesh(upperChestGeom, this.materials.jerseyStriped, 0.028);
    upperChest.position.y = 0.33;
    upperChest.scale.set(1.06, 0.38, 0.74);
    torsoGroup.add(upperChest);

    const collarGeom = new THREE.TorusGeometry(0.145, 0.032, 16, 28);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.white, 0.035);
    collar.position.set(0, 0.41, 0.01);
    collar.rotation.x = Math.PI / 2 + 0.08;
    collar.scale.set(1.05, 0.95, 1.0);
    torsoGroup.add(collar);

    // Rear name plaque + front chest print. Hidden until setPlayerPrint().
    const backPanel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.30, 0.50, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56),
      this.materials.backName
    );
    backPanel.position.set(0, -0.02, -0.01);
    backPanel.scale.set(1.06, 1, 0.88);
    backPanel.visible = false;
    torsoGroup.add(backPanel);

    const frontPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), this.materials.frontName);
    frontPanel.position.set(0, -0.02, 0.225);
    frontPanel.visible = false;
    torsoGroup.add(frontPanel);

    group.add(torsoGroup);

    // ==================== 3. SOCCER SHORTS ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const hipsGeom = new THREE.CylinderGeometry(0.325, 0.34, 0.22, 28);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.shorts, 0.028);
    hips.position.y = -0.05;
    hips.scale.set(1.05, 1, 0.74);
    pelvisGroup.add(hips);

    const seamGeom = new THREE.BoxGeometry(0.018, 0.16, 0.02);
    const seam = new THREE.Mesh(seamGeom, this.materials.black);
    seam.position.set(0, -0.08, 0.255);
    pelvisGroup.add(seam);

    group.add(pelvisGroup);

    // ==================== 4. SLEEVES & GRAY SKIN ARMS ====================
    let armband = null;
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(dir * 0.29, 1.72, 0);

      const shoulderCapGeom = new THREE.SphereGeometry(0.125, 20, 16);
      const shoulderCap = this.createOutlinedMesh(shoulderCapGeom, this.materials.jerseySolid, 0.03);
      shoulderCap.position.set(dir * 0.02, -0.02, 0);
      shoulderCap.scale.set(1.05, 1.1, 0.9);
      armPivot.add(shoulderCap);

      const shortSleeveGeom = new THREE.CylinderGeometry(0.12, 0.15, 0.28, 20);
      const shortSleeve = this.createOutlinedMesh(shortSleeveGeom, this.materials.jerseySolid, 0.03);
      shortSleeve.position.set(dir * 0.02, -0.15, 0);
      armPivot.add(shortSleeve);

      if (isLeft) {
        armband = new THREE.Mesh(
          new THREE.CylinderGeometry(0.152, 0.152, 0.11, 20, 1, true),
          this.materials.armband
        );
        armband.name = 'Armband';
        armband.position.set(dir * 0.02, -0.15, 0);
        armband.visible = false;
        armPivot.add(armband);
      }

      const trimGeom = new THREE.CylinderGeometry(0.153, 0.153, 0.038, 20);
      const trim = this.createOutlinedMesh(trimGeom, this.materials.white, 0.028);
      trim.position.set(dir * 0.02, -0.28, 0);
      armPivot.add(trim);

      const forearmGeom = new THREE.CylinderGeometry(0.095, 0.105, 0.34, 20);
      const forearm = this.createOutlinedMesh(forearmGeom, this.materials.skin, 0.03);
      forearm.position.set(dir * 0.02, -0.44, 0);
      armPivot.add(forearm);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(dir * 0.02, -0.64, 0);

      const palmGeom = new THREE.SphereGeometry(0.115, 20, 20);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.skin, 0.032);
      palm.scale.set(1.12, 1.08, 0.70);
      handGroup.add(palm);

      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.28;
      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // ==================== 5. SHORTS LEGS, STRIPED SOCKS & CLEATS ====================
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(dir * 0.175, 0.90, 0);

      const shortLegGeom = new THREE.CylinderGeometry(0.155, 0.175, 0.26, 20);
      const shortLeg = this.createOutlinedMesh(shortLegGeom, this.materials.shorts, 0.03);
      shortLeg.position.y = -0.12;
      legPivot.add(shortLeg);

      const kneeGeom = new THREE.CylinderGeometry(0.115, 0.112, 0.18, 20);
      const knee = this.createOutlinedMesh(kneeGeom, this.materials.skin, 0.03);
      knee.position.y = -0.32;
      legPivot.add(knee);

      const sockGeom = new THREE.CylinderGeometry(0.12, 0.115, 0.38, 20);
      const sock = this.createOutlinedMesh(sockGeom, this.materials.socks, 0.03);
      sock.position.y = -0.58;
      legPivot.add(sock);

      [-0.45, -0.52].forEach((yPos) => {
        const hoopGeom = new THREE.CylinderGeometry(0.124, 0.124, 0.034, 20);
        const hoop = this.createOutlinedMesh(hoopGeom, this.materials.sockStripes, 0.02);
        hoop.position.y = yPos;
        legPivot.add(hoop);
      });

      const cleatGroup = new THREE.Group();
      cleatGroup.name = 'Cleats';
      cleatGroup.position.set(0, -0.80, 0.06);
      cleatGroup.rotation.y = dir * 0.18;

      const cleatFootGeom = new THREE.CapsuleGeometry(0.12, 0.18, 14, 16);
      const cleatFoot = this.createOutlinedMesh(cleatFootGeom, this.materials.cleats, 0.032);
      cleatFoot.rotation.x = Math.PI / 2;
      cleatFoot.scale.set(1.08, 1.0, 0.78);
      cleatGroup.add(cleatFoot);

      const laceGeom = new THREE.BoxGeometry(0.08, 0.02, 0.09);
      const laces = new THREE.Mesh(laceGeom, this.materials.black);
      laces.position.set(0, 0.085, -0.01);
      laces.rotation.x = 0.25;
      cleatGroup.add(laces);

      const studGeom = new THREE.CylinderGeometry(0.022, 0.016, 0.045, 10);
      [-0.08, 0.02, 0.11].forEach((zOff) => {
        [-0.055, 0.055].forEach((xOff) => {
          const stud = this.createOutlinedMesh(studGeom, this.materials.studs, 0.035);
          stud.position.set(xOff, -0.095, zOff);
          cleatGroup.add(stud);
        });
      });

      legPivot.add(cleatGroup);
      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg, rightLeg);

    const leftCleat = leftLeg.getObjectByName('Cleats');
    const rightCleat = rightLeg.getObjectByName('Cleats');
    const boots = {
      left: leftCleat,
      right: rightCleat,
      get visible() {
        return !!leftCleat && leftCleat.visible && !!rightCleat && rightCleat.visible;
      },
      set visible(value) {
        if (leftCleat) leftCleat.visible = value;
        if (rightCleat) rightCleat.visible = value;
      },
    };

    this.characterParts = {
      head: headGroup,
      torso: torsoGroup,
      pelvis: pelvisGroup,
      leftArm,
      rightArm,
      leftHand: leftArm.getObjectByName('Hand'),
      rightHand: rightArm.getObjectByName('Hand'),
      leftLeg,
      rightLeg,
      boots,
      backPanel,
      frontPanel,
      armband
    };

    this.character = group;
    this.scene.add(this.character);
    return group;
  }

  /** Stamps SURNAME + number onto the shirt and reveals the print panels. */
  setPlayerPrint(name, number, show = true) {
    if (!this.characterParts || !this.materials) return;
    replacePrintTexture(this.materials.backName, createBackNameTexture(name, number));
    replacePrintTexture(this.materials.frontName, createFrontNameTexture(name, number));
    this.characterParts.backPanel.visible = !!show;
    this.characterParts.frontPanel.visible = !!show;
  }

  /** Captaincy is vacant after Karim leaves – the squad's band stays hidden. */
  setArmbandVisible(visible) {
    if (this.characterParts.armband) this.characterParts.armband.visible = !!visible;
  }

  setBootsVisible(visible) {
    if (this.characterParts.boots) this.characterParts.boots.visible = !!visible;
  }

  changeOutfit(outfitName) {
    const palette = this.outfits[outfitName];
    if (!palette) return;

    const newStripeTex = this.createStripedTexture(palette.jerseyPrimary, palette.jerseySecondary);
    this.materials.jerseyStriped.map = newStripeTex;
    this.materials.jerseyStriped.emissiveMap = newStripeTex;
    this.materials.jerseyStriped.needsUpdate = true;

    const setMatColor = (mat, hex) => {
      mat.color.setHex(hex);
      if (mat.emissive) mat.emissive.setHex(hex);
    };

    setMatColor(this.materials.jerseySolid, palette.jerseyPrimary);
    setMatColor(this.materials.shorts, palette.shorts);
    setMatColor(this.materials.socks, palette.socks);
    setMatColor(this.materials.sockStripes, palette.sockStripes);
    setMatColor(this.materials.cleats, palette.cleats);
    setMatColor(this.materials.studs, palette.studs);
  }
}
