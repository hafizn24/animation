import * as THREE from 'three';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';

/**
 * Shared procedural player rig for every NEW Season 1 character (Ep. 6-12).
 *
 * No new skeleton is modelled: this is the same faceless 7-part rig contract as
 * character-karim.js / character-azam.js (Head, Torso, Pelvis, two arms, two
 * legs, characterParts, setPose, changeHairStyle, dispose). Characters differ
 * only by their PROFILE: jersey palette, number/name panels, scale, hair and a
 * couple of procedural prop meshes. createSceneDirector() mounts any export
 * unchanged.
 */
const DEFAULT_PROFILE = {
  id: 'variant',
  label: 'PLAYER',
  number: 10,
  primary: 0xde1326,
  secondary: 0xffffff,
  shorts: 0xb80f20,
  socks: 0xffffff,
  sockStripes: 0xde1326,
  cleats: 0x141821,
  skin: 0xb08d6a,
  hair: 'crop',
  striped: true,
  goldTrim: false,
  scale: 1,
  torsoScale: 1,
  shoulderScale: 1,
  props: {},
  crouch: false,
  fastIdle: false,
};

export class VariantPlayerApp {
  constructor(container, profile = {}) {
    this.container = container;
    this.profile = { ...DEFAULT_PROFILE, ...profile, props: { ...DEFAULT_PROFILE.props, ...(profile.props || {}) } };
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;
    this.characterParts = {};
    this.clock = new THREE.Clock();
    this._dead = false;
    this.headRadius = 0.46;
    this.headOffsetY = 0;
    this.hairStyle = this.profile.hair;
    this.currentPose = 'idle';
    this.propMeshes = {};
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.addLights();
    this.createProceduralCharacter();
    return this;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfcf9e8);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(42, 1.5, 0.1, 1000);
    this.camera.position.set(0, 1.55, 4.3);
  }

  setupRenderer() {
    if (!this.container || typeof window === 'undefined') return;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth || 800, this.container.clientHeight || 600);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.bias = -0.0005;
    this.scene.add(key);
  }

  createToonMaterial(colorHex, map = null) {
    const colors = new Uint8Array([225, 255]);
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
    const baseColor = new THREE.Color(colorHex);
    return new THREE.MeshToonMaterial({
      color: baseColor,
      map,
      gradientMap,
      emissive: baseColor,
      emissiveMap: map,
      emissiveIntensity: 0.3,
    });
  }

  createOutlinedMesh(geometry, material, outlineThickness = 0.028) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    group.userData = { mainMesh: mesh };
    if (outlineThickness > 0) {
      const outline = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide })
      );
      outline.scale.set(1 + outlineThickness, 1 + outlineThickness * 0.8, 1 + outlineThickness);
      group.add(outline);
    }
    return group;
  }

  createStripedTexture() {
    const { primary, secondary, striped, label, number, goldTrim } = this.profile;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const c1 = '#' + new THREE.Color(primary).getHexString();
    const c2 = '#' + new THREE.Color(secondary).getHexString();
    if (striped) {
      const stripes = 12;
      const w = canvas.width / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? c1 : c2;
        ctx.fillRect(Math.floor(i * w), 0, Math.ceil(w), canvas.height);
      }
    } else {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = c2;
      ctx.fillRect(0, 0, 26, canvas.height);
      ctx.fillRect(canvas.width - 26, 0, 26, canvas.height);
    }
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, canvas.height - 14, canvas.width, 14);
    if (goldTrim) {
      ctx.strokeStyle = '#d8b26a';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  createBackNameTexture() {
    const { label, number, primary } = this.profile;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#' + new THREE.Color(primary).getHexString();
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.fillStyle = '#1b1d22';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 76px Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), 256, 150);
    ctx.font = 'bold 270px Arial Black, Arial, sans-serif';
    ctx.fillText(String(number), 256, 345);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createFrontNameTexture() {
    const { label, number } = this.profile;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#15171c';
    ctx.lineWidth = 6;
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.strokeText(label.toUpperCase(), 128, 58);
    ctx.fillText(label.toUpperCase(), 128, 58);
    ctx.font = 'bold 132px Arial Black, Arial, sans-serif';
    ctx.strokeText(String(number), 128, 158);
    ctx.fillText(String(number), 128, 158);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();
    const p = this.profile;
    const group = new THREE.Group();
    group.name = p.label;

    const m = {
      hair: this.createToonMaterial(0x1a1410),
      skin: this.createToonMaterial(p.skin),
      jersey: this.createToonMaterial(0xffffff, this.createStripedTexture()),
      jerseySolid: this.createToonMaterial(p.primary),
      shorts: this.createToonMaterial(p.shorts),
      socks: this.createToonMaterial(p.socks),
      sockStripes: this.createToonMaterial(p.sockStripes),
      cleats: this.createToonMaterial(p.props.goldBoots ? 0xd8b26a : p.cleats),
      white: this.createToonMaterial(0xffffff),
      black: new THREE.MeshBasicMaterial({ color: 0x0b0b0b }),
      gold: this.createToonMaterial(0xd8b26a),
      backName: new THREE.MeshBasicMaterial({ map: this.createBackNameTexture() }),
      frontName: new THREE.MeshBasicMaterial({ map: this.createFrontNameTexture(), transparent: true, depthWrite: false }),
    };
    this.materials = m;

    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.96, 0);
    const head = this.createOutlinedMesh(new THREE.SphereGeometry(0.46, 32, 32), m.skin, 0.032);
    head.position.y = 0.37;
    headGroup.add(head);
    this.hairGroup = this.buildHairstyle(p.hair);
    headGroup.add(this.hairGroup);
    const neck = this.createOutlinedMesh(new THREE.CylinderGeometry(0.115, 0.125, 0.20, 18), m.skin, 0.028);
    neck.position.y = -0.04;
    headGroup.add(neck);
    group.add(headGroup);

    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.44, 0);
    const torsoGeom = new THREE.CylinderGeometry(0.29, 0.33, 0.68, 36, 1, false);
    torsoGeom.rotateY(Math.PI / 14);
    const torsoMesh = new THREE.Mesh(torsoGeom, [m.jersey, m.jerseySolid, m.jerseySolid]);
    torsoMesh.castShadow = true;
    const torsoOutline = new THREE.Mesh(torsoGeom, new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide }));
    torsoOutline.scale.set(1.03, 1.02, 1.03);
    const torso = new THREE.Group();
    torso.add(torsoMesh, torsoOutline);
    torso.scale.set(1.06 * p.torsoScale, 1, 0.76);
    torsoGroup.add(torso);
    const chestGeom = new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    chestGeom.rotateY(Math.PI / 14);
    const chest = this.createOutlinedMesh(chestGeom, m.jersey, 0.028);
    chest.position.y = 0.33;
    chest.scale.set(1.06 * p.torsoScale, 0.38, 0.76);
    torsoGroup.add(chest);
    const backPanel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.315, 0.35, 0.52, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56),
      m.backName
    );
    backPanel.position.set(0, 0.02, -0.012);
    backPanel.scale.set(1.06, 1, 0.86);
    torsoGroup.add(backPanel);
    const frontPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), m.frontName);
    frontPanel.position.set(0, 0.06, 0.255);
    torsoGroup.add(frontPanel);
    const collar = this.createOutlinedMesh(new THREE.TorusGeometry(0.15, 0.032, 16, 28), m.white, 0.035);
    collar.position.set(0, 0.41, 0.01);
    collar.rotation.x = Math.PI / 2 + 0.08;
    torsoGroup.add(collar);
    group.add(torsoGroup);

    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);
    const hips = this.createOutlinedMesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 28), m.shorts, 0.028);
    hips.position.y = -0.05;
    hips.scale.set(1.05 * p.torsoScale, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.name = isLeft ? 'LeftArm' : 'RightArm';
      armPivot.position.set(dir * 0.29 * p.shoulderScale, 1.72, 0);
      const cap = this.createOutlinedMesh(new THREE.SphereGeometry(0.125, 20, 16), m.jerseySolid, 0.03);
      cap.position.set(dir * 0.02, -0.02, 0);
      cap.scale.set(1.05, 1.1, 0.9);
      armPivot.add(cap);
      const sleeve = this.createOutlinedMesh(new THREE.CylinderGeometry(0.12, 0.15, 0.3, 20), m.jerseySolid, 0.03);
      sleeve.position.set(dir * 0.02, -0.16, 0);
      armPivot.add(sleeve);
      const forearm = this.createOutlinedMesh(new THREE.CylinderGeometry(0.095, 0.105, 0.34, 20), m.skin, 0.03);
      forearm.position.set(dir * 0.02, -0.47, 0);
      armPivot.add(forearm);
      if (p.props.wristTape) {
        const tape = this.createOutlinedMesh(new THREE.CylinderGeometry(0.108, 0.108, 0.12, 20), m.white, 0.02);
        tape.position.set(dir * 0.02, -0.36, 0);
        armPivot.add(tape);
      }
      if (p.props.armband) {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.15, 0.035, 12, 24),
          new THREE.MeshStandardMaterial({ color: p.props.redArmband ? 0xb3121f : 0xd8b26a, roughness: 0.7 })
        );
        band.rotation.x = Math.PI / 2;
        band.position.set(dir * 0.02, -0.22, 0);
        armPivot.add(band);
      }
      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(dir * 0.02, -0.67, 0);
      const palm = this.createOutlinedMesh(new THREE.SphereGeometry(0.115, 20, 20), m.skin, 0.032);
      palm.scale.set(1.12, 1.08, 0.7);
      handGroup.add(palm);
      if (p.props.gloves) {
        const glove = this.createOutlinedMesh(new THREE.BoxGeometry(0.2, 0.22, 0.14), m.jerseySolid, 0.03);
        glove.position.set(dir * 0.02, -0.02, 0.04);
        if (p.props.bigGloves) glove.scale.set(1.5, 1.4, 1.4);
        handGroup.add(glove);
      }
      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.28;
      return { armPivot, handGroup };
    };

    const left = createArm(true);
    const right = createArm(false);
    group.add(left.armPivot, right.armPivot);

    const boots = new THREE.Group();
    boots.name = 'Boots';
    boots.visible = false;
    left.handGroup.add(boots);

    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.name = isLeft ? 'LeftLeg' : 'RightLeg';
      legPivot.position.set(dir * 0.175, 0.90, 0);
      const shortLeg = this.createOutlinedMesh(new THREE.CylinderGeometry(0.155, 0.175, 0.26, 20), m.shorts, 0.03);
      shortLeg.position.y = -0.12;
      legPivot.add(shortLeg);
      const knee = this.createOutlinedMesh(new THREE.CylinderGeometry(0.115, 0.112, 0.18, 20), m.skin, 0.03);
      knee.position.y = -0.32;
      legPivot.add(knee);
      const sock = this.createOutlinedMesh(new THREE.CylinderGeometry(0.12, 0.115, p.props.retroSocks ? 0.52 : 0.38, 20), m.socks, 0.03);
      sock.position.y = p.props.retroSocks ? -0.66 : -0.58;
      legPivot.add(sock);
      [-0.45, -0.52].forEach((yPos) => {
        const hoop = this.createOutlinedMesh(new THREE.CylinderGeometry(0.124, 0.124, 0.034, 20), m.sockStripes, 0.02);
        hoop.position.y = yPos;
        legPivot.add(hoop);
      });
      const cleatGroup = new THREE.Group();
      cleatGroup.position.set(0, -0.8, 0.06);
      cleatGroup.rotation.y = dir * 0.18;
      const foot = this.createOutlinedMesh(new THREE.CapsuleGeometry(0.12, 0.18, 14, 16), m.cleats, 0.032);
      foot.rotation.x = Math.PI / 2;
      foot.scale.set(1.08, 1, 0.78);
      cleatGroup.add(foot);
      legPivot.add(cleatGroup);
      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg, rightLeg);

    this.characterParts = {
      head: headGroup,
      torso: torsoGroup,
      leftArm: left.armPivot,
      rightArm: right.armPivot,
      leftHand: left.handGroup,
      rightHand: right.handGroup,
      leftLeg,
      rightLeg,
      boots,
      backPanel,
      frontPanel,
    };
    this.addProps();

    this.character = group;
    this.character.scale.setScalar(p.scale);
    this.scene.add(this.character);
    this.setPose(p.crouch ? 'crouch' : 'idle');
    return group;
  }

  addProps() {
    const p = this.profile;
    const m = this.materials;
    const head = this.characterParts.head;

    if (p.props.headband || p.props.sweatband) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.465, p.props.sweatband ? 0.045 : 0.026, 12, 32),
        new THREE.MeshStandardMaterial({
          color: p.props.headband === 'neon' ? 0x39ff88 : 0xff7a00,
          roughness: 0.6,
        })
      );
      band.rotation.x = Math.PI / 2.1;
      band.position.y = 0.5;
      head.add(band);
      this.propMeshes.headband = band;
    }

    if (p.props.visor) {
      const visor = this.createOutlinedMesh(new THREE.BoxGeometry(0.72, 0.15, 0.08), m.black, 0.02);
      visor.position.set(0, 0.42, 0.42);
      head.add(visor);
      this.propMeshes.visor = visor;
    }

    if (p.props.spikyHair) {
      [0, 1, 2, 3, 4].forEach((i) => {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.09, 0.32, 8),
          new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.8 })
        );
        spike.position.set(-0.3 + i * 0.15, 0.92, -0.05);
        spike.rotation.z = (i - 2) * 0.12;
        head.add(spike);
      });
    }

    if (p.props.clipboard) {
      const board = this.createOutlinedMesh(new THREE.BoxGeometry(0.34, 0.44, 0.035), m.white, 0.025);
      board.position.set(-0.02, -0.12, 0.16);
      board.rotation.x = -0.35;
      this.characterParts.leftHand.add(board);
      this.propMeshes.clipboard = board;
    }

    if (p.props.whistle) {
      const whistle = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.07, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.4, roughness: 0.5 })
      );
      whistle.position.set(0, -0.06, 0.12);
      this.characterParts.rightHand.add(whistle);
      this.propMeshes.whistle = whistle;
    }

    if (p.props.yellowCard) {
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.23),
        new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide })
      );
      card.position.set(0, -0.02, 0.16);
      this.characterParts.rightHand.add(card);
      this.propMeshes.yellowCard = card;
    }
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
    if (!HAIR_STYLES.includes(style)) return;
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

  setPose(pose) {
    const { head, torso, leftArm, rightArm, leftHand, rightHand, leftLeg, rightLeg } = this.characterParts;
    if (!head) return;
    this.currentPose = pose;
    head.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    leftLeg.rotation.set(0, 0, 0);
    rightLeg.rotation.set(0, 0, 0);
    if (leftArm) leftArm.rotation.set(0, 0, -0.28);
    if (rightArm) rightArm.rotation.set(0, 0, 0.28);
    if (leftHand) leftHand.rotation.set(0, 0, 0);
    if (rightHand) rightHand.rotation.set(0, 0, 0);

    if (pose === 'stride') {
      torso.rotation.x = -0.04;
      head.rotation.y = -0.05;
      if (leftArm) leftArm.rotation.set(0.55, 0, -0.22);
      if (rightArm) rightArm.rotation.set(-0.6, 0, 0.22);
      if (leftLeg) leftLeg.rotation.x = -0.42;
      if (rightLeg) rightLeg.rotation.x = 0.38;
    } else if (pose === 'crouch') {
      torso.rotation.x = 0.22;
      torso.position.y = -0.2;
      head.rotation.x = -0.1;
      if (leftArm) leftArm.rotation.set(-0.5, 0, -0.5);
      if (rightArm) rightArm.rotation.set(-0.5, 0, 0.5);
      if (leftLeg) leftLeg.rotation.x = -0.5;
      if (rightLeg) rightLeg.rotation.x = 0.5;
    } else if (pose === 'block') {
      torso.rotation.x = 0.12;
      if (leftArm) leftArm.rotation.set(-1.2, 0, -0.3);
      if (rightArm) rightArm.rotation.set(-1.2, 0, 0.3);
      if (leftLeg) leftLeg.rotation.x = -0.3;
      if (rightLeg) rightLeg.rotation.x = 0.3;
    } else if (pose === 'point') {
      torso.rotation.x = -0.05;
      head.rotation.y = -0.12;
      if (rightArm) rightArm.rotation.set(-1.35, 0, 0.15);
      if (leftArm) leftArm.rotation.set(0, 0, -0.2);
    } else if (pose === 'panic') {
      torso.rotation.z = 0.08;
      head.rotation.y = 0.18;
      if (leftArm) leftArm.rotation.set(-1.1, 0, -0.7);
      if (rightArm) rightArm.rotation.set(-1.1, 0, 0.7);
    } else if (pose === 'celebrate') {
      torso.rotation.x = -0.12;
      head.rotation.x = -0.1;
      if (leftArm) leftArm.rotation.set(-2.3, 0, -0.4);
      if (rightArm) rightArm.rotation.set(-2.3, 0, 0.4);
    } else if (pose === 'intercept') {
      torso.rotation.x = -0.1;
      if (rightArm) rightArm.rotation.set(-0.9, 0, 0.2);
      if (leftArm) leftArm.rotation.set(0.4, 0, -0.2);
      if (leftLeg) leftLeg.rotation.x = -0.5;
    } else if (pose === 'talk') {
      head.rotation.y = -0.06;
      if (rightArm) rightArm.rotation.set(-0.5, 0, 0.25);
    } else {
      torso.rotation.set(0, 0, 0);
      torso.position.y = 0;
      head.rotation.y = -0.04;
      if (leftArm) leftArm.rotation.set(0.06, 0, -0.14);
      if (rightArm) rightArm.rotation.set(-0.04, 0, 0.14);
      if (leftLeg) leftLeg.rotation.z = -0.03;
      if (rightLeg) rightLeg.rotation.z = 0.03;
    }
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    const { head, torso, leftArm, rightArm } = this.characterParts;
    if (!head || !torso) return;
    const speed = this.profile.fastIdle ? 7.5 : 2.3;
    const amp = this.profile.fastIdle ? 0.06 : 0.018;
    const bounce = Math.sin(elapsed * speed);
    head.position.y = 1.96 + bounce * amp;
    torso.scale.y = 1 + bounce * amp * 0.7;
    if (leftArm && rightArm && this.currentPose === 'idle') {
      leftArm.rotation.x = 0.06 + bounce * 0.035;
      rightArm.rotation.x = -0.04 - bounce * 0.035;
    }
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
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
    this.materials = {};
    this.propMeshes = {};
    this.hairGroup = null;
    this._dead = true;
  }
}

const makeVariantClass = (profile) =>
  class Variant extends VariantPlayerApp {
    constructor(container) {
      super(container, profile);
    }
  };

export const FaridApp = makeVariantClass({
  id: 'farid', label: 'FARID', number: 9,
  primary: 0xde1326, secondary: 0xffffff, shorts: 0xb80f20,
  hair: 'messy', scale: 1.04, props: { wristTape: true },
});

export const DanialApp = makeVariantClass({
  id: 'danial', label: 'DANIAL', number: 1,
  primary: 0xf4d400, secondary: 0x18b8a6, shorts: 0x141821,
  socks: 0x18b8a6, sockStripes: 0xf4d400, striped: false,
  hair: 'crop', props: { gloves: true, bigGloves: true },
});

export const ZakiApp = makeVariantClass({
  id: 'zaki', label: 'ZAKI', number: 10,
  primary: 0x39ff88, secondary: 0x0b0b0b, shorts: 0x0b0b0b,
  socks: 0x0b0b0b, sockStripes: 0x39ff88,
  hair: 'buzz', props: { headband: 'neon', clipboard: true },
});

export const PakDinApp = makeVariantClass({
  id: 'pakdin', label: 'PAK DIN', number: 6,
  primary: 0x7b1c2b, secondary: 0xd8b26a, shorts: 0x3a0e17,
  socks: 0xd8b26a, sockStripes: 0x7b1c2b, hair: 'receding',
  torsoScale: 1.12, props: { retroSocks: true },
});

export const RayyanApp = makeVariantClass({
  id: 'rayyan', label: 'RAYAN', number: 11,
  primary: 0xffffff, secondary: 0x1e3a8a, shorts: 0x1e3a8a,
  sockStripes: 0x1e3a8a, hair: 'sidePart', goldTrim: true,
  props: { visor: true, goldBoots: true },
});

export const BobApp = makeVariantClass({
  id: 'bob', label: 'BOB', number: 9,
  primary: 0xff7a00, secondary: 0x0b0b0b, shorts: 0x0b0b0b,
  sockStripes: 0xff7a00, hair: 'spiky', fastIdle: true,
  props: { spikyHair: true, sweatband: true },
});

export const MalikApp = makeVariantClass({
  id: 'malik', label: 'MALIK', number: 4,
  primary: 0x111111, secondary: 0xb3121f, shorts: 0x111111,
  socks: 0x111111, sockStripes: 0xb3121f, hair: 'buzz',
  scale: 1.08, torsoScale: 1.12, shoulderScale: 1.14,
  props: { armband: true, redArmband: true },
});

export const BesiKeeperApp = makeVariantClass({
  id: 'besikeeper', label: 'BESI', number: 1,
  primary: 0x2b2f36, secondary: 0xb3121f, shorts: 0x111111,
  socks: 0x2b2f36, sockStripes: 0xb3121f, striped: false,
  hair: 'buzz', crouch: true,
  props: { gloves: true, bigGloves: true },
});

export const RefereeApp = makeVariantClass({
  id: 'referee', label: 'PENGADIL', number: 0,
  primary: 0x111111, secondary: 0xf2c200, shorts: 0x111111,
  socks: 0x111111, sockStripes: 0x111111, striped: false,
  hair: 'crop', cleats: 0x0b0b0b,
  props: { whistle: true, yellowCard: true },
});

export const VARIANT_CAST = {
  farid: FaridApp,
  danial: DanialApp,
  zaki: ZakiApp,
  pakdin: PakDinApp,
  rayyan: RayyanApp,
  bob: BobApp,
  malik: MalikApp,
  besikeeper: BesiKeeperApp,
  referee: RefereeApp,
};
