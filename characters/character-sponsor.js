import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';

/**
 * SponsorApp – a slick corporate sponsor (Malaysian sports sponsorship exec).
 * Sharp navy/charcoal suit, gold tie, slicked side part, smartphone,
 * slim sponsorship folder and an expensive gold wristwatch.
 */
export class SponsorApp {
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

    this.headRadius = 0.46;
    this.headOffsetY = 0;
    this.hairStyle = 'sidePart';

    this.outfits = {
      corporateNavy: {
        jacket: 0x1f2b47,
        vest: 0x172138,
        lapel: 0x2c3c60,
        shirt: 0xf6f4ee,
        tie: 0xd4af37,
        pocket: 0xe3c765,
        pants: 0x1c2740,
        cuffs: 0x151d31,
        shoes: 0x141519,
        skin: 0xf1e5d4
      },
      charcoalSlim: {
        jacket: 0x33353c,
        vest: 0x27292f,
        lapel: 0x44474f,
        shirt: 0xf6f4ee,
        tie: 0xd4af37,
        pocket: 0xe3c765,
        pants: 0x2c2e34,
        cuffs: 0x22242a,
        shoes: 0x101114,
        skin: 0xf1e5d4
      }
    };

    this.poses = {
      idle: {
        head: { x: 0, y: 0, z: 0 },
        torso: { x: 0, y: 0, z: 0 },
        leftArm: { x: 0.05, y: 0, z: -0.30 },
        rightArm: { x: 0.05, y: 0, z: 0.30 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: {}
      },
      walk: {
        head: { x: 0.03, y: 0, z: 0 },
        torso: { x: 0, y: -0.08, z: 0 },
        leftArm: { x: -0.38, y: 0, z: -0.28 },
        rightArm: { x: 0.30, y: 0, z: 0.26 },
        leftLeg: { x: 0.46, y: 0, z: 0 },
        rightLeg: { x: -0.34, y: 0, z: 0 },
        props: {}
      },
      dismiss: {
        head: { x: -0.04, y: -0.32, z: 0 },
        torso: { x: 0, y: 2.55, z: 0 },
        leftArm: { x: -1.35, y: 0, z: -0.42 },
        rightArm: { x: -1.55, y: 0, z: 0.38 },
        leftLeg: { x: 0.06, y: 0, z: 0 },
        rightLeg: { x: -0.06, y: 0, z: 0 },
        props: {}
      },
      offer: {
        head: { x: -0.05, y: 0.05, z: 0 },
        torso: { x: 0.12, y: 0.04, z: 0 },
        leftArm: { x: 0.08, y: 0, z: -0.30 },
        rightArm: { x: -1.16, y: 0, z: -0.12 },
        leftLeg: { x: 0.02, y: 0, z: 0 },
        rightLeg: { x: -0.02, y: 0, z: 0 },
        props: { folder: true }
      },
      phone: {
        head: { x: 0.06, y: -0.12, z: 0 },
        torso: { x: 0, y: -0.06, z: 0 },
        leftArm: { x: 0.10, y: 0, z: -0.30 },
        rightArm: { x: -2.00, y: 0, z: -0.18 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: { smartphone: true }
      },
      checkWatch: {
        head: { x: 0.34, y: 0.10, z: 0 },
        torso: { x: 0.04, y: 0, z: 0 },
        leftArm: { x: -1.42, y: 0, z: 0.42 },
        rightArm: { x: 0.06, y: 0, z: 0.32 },
        leftLeg: { x: 0, y: 0, z: 0 },
        rightLeg: { x: 0, y: 0, z: 0 },
        props: {}
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

  createFolderLabelMaterial() {
    if (typeof document === 'undefined') {
      return new THREE.MeshBasicMaterial({ color: 0xf6f4ee });
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6f4ee';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#1f2b47';
    ctx.fillRect(0, 0, 256, 46);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(0, 232, 256, 24);
    ctx.fillStyle = '#f6f4ee';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('BULUH FC', 18, 32);
    ctx.fillStyle = '#1f2b47';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('SPONSORSHIP', 16, 96);
    ctx.font = '18px sans-serif';
    ctx.fillText('PARTNERSHIP', 16, 132);
    ctx.fillText('PROPOSAL 2026', 16, 162);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: texture });
  }

  createProceduralCharacter() {
    if (this.character) {
      this.dispose();
    }

    const group = new THREE.Group();
    group.name = 'Sponsor';
    const palette = this.outfits.corporateNavy;

    this.materials = {
      hair: this.createToonMaterial(0x2b211a),
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
      folder: this.createToonMaterial(0x24304d),
      phone: this.createToonMaterial(0x16181d),
      screen: new THREE.MeshBasicMaterial({ color: 0x2e4a72 }),
      dial: new THREE.MeshBasicMaterial({ color: 0x14161c }),
      label: this.createFolderLabelMaterial(),
      black: new THREE.MeshBasicMaterial({ color: 0x111111 })
    };

    this.props = {};

    // Head
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);

    const headGeom = new THREE.SphereGeometry(0.46, 32, 32);
    const head = this.createOutlinedMesh(headGeom, this.materials.skin, 0.03);
    head.position.y = 0.36;
    headGroup.add(head);

    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);

    const neckGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.skin, 0.025);
    neck.position.y = -0.02;
    headGroup.add(neck);
    group.add(headGroup);

    // Sharp navy suit
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.45, 0);

    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.36, 0.72, 24);
    const torso = this.createOutlinedMesh(torsoGeom, this.materials.jacket, 0.028);
    torso.scale.set(1.08, 1, 0.78);
    torsoGroup.add(torso);

    const vestGeom = new THREE.CylinderGeometry(0.26, 0.30, 0.68, 20);
    const vest = this.createOutlinedMesh(vestGeom, this.materials.vest, 0.015);
    vest.position.set(0, -0.01, 0.045);
    vest.scale.set(0.65, 1, 0.78);
    torsoGroup.add(vest);

    const shirtFrontGeom = new THREE.ConeGeometry(0.14, 0.30, 4);
    const shirtFront = this.createOutlinedMesh(shirtFrontGeom, this.materials.shirt, 0.02);
    shirtFront.rotation.z = Math.PI;
    shirtFront.rotation.y = Math.PI / 4;
    shirtFront.position.set(0, 0.26, 0.19);
    shirtFront.scale.set(1.1, 1, 0.5);
    torsoGroup.add(shirtFront);

    const tieKnot = this.createOutlinedMesh(new THREE.BoxGeometry(0.055, 0.055, 0.04), this.materials.tie, 0.03);
    tieKnot.position.set(0, 0.33, 0.235);
    torsoGroup.add(tieKnot);

    const tieBlade = this.createOutlinedMesh(new THREE.BoxGeometry(0.05, 0.26, 0.03), this.materials.tie, 0.03);
    tieBlade.position.set(0, 0.18, 0.245);
    torsoGroup.add(tieBlade);

    const lapelGeom = new THREE.BoxGeometry(0.08, 0.42, 0.04);
    [-1, 1].forEach((dir) => {
      const lapel = this.createOutlinedMesh(lapelGeom, this.materials.lapel, 0.03);
      lapel.position.set(dir * 0.11, 0.14, 0.235);
      lapel.rotation.z = dir * -0.22;
      torsoGroup.add(lapel);
    });

    const btnGeom = new THREE.SphereGeometry(0.018, 8, 8);
    [-0.04, -0.13, -0.22].forEach((yPos) => {
      const btn = this.createOutlinedMesh(btnGeom, this.materials.gold, 0.03);
      btn.position.set(0, yPos, 0.27);
      torsoGroup.add(btn);
    });

    const pocketSquare = this.createOutlinedMesh(new THREE.ConeGeometry(0.035, 0.05, 3), this.materials.pocket, 0.03);
    pocketSquare.position.set(0.18, 0.16, 0.25);
    torsoGroup.add(pocketSquare);

    const shoulders = this.createOutlinedMesh(new THREE.SphereGeometry(0.32, 24, 16), this.materials.jacket, 0.025);
    shoulders.position.y = 0.26;
    shoulders.scale.set(1.12, 0.55, 0.78);
    torsoGroup.add(shoulders);
    group.add(torsoGroup);

    // Belt and pelvis
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);

    const belt = this.createOutlinedMesh(new THREE.CylinderGeometry(0.355, 0.355, 0.10, 24), this.materials.shoes, 0.025);
    belt.scale.set(1.06, 1, 0.78);
    pelvisGroup.add(belt);

    const buckle = this.createOutlinedMesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 20), this.materials.gold, 0.04);
    buckle.rotation.x = Math.PI / 2;
    buckle.position.set(0, 0, 0.27);
    pelvisGroup.add(buckle);

    const loopGeom = new THREE.BoxGeometry(0.035, 0.11, 0.03);
    [-0.18, 0.18].forEach((xPos) => {
      const loop = new THREE.Mesh(loopGeom, this.materials.black);
      loop.position.set(xPos, 0, 0.26);
      pelvisGroup.add(loop);
    });

    const hips = this.createOutlinedMesh(new THREE.CylinderGeometry(0.35, 0.34, 0.18, 24), this.materials.pants, 0.025);
    hips.position.y = -0.12;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    // Suit sleeves, cuffs and hands (mittens, with watch and hand-held props)
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.name = isLeft ? 'LeftArm' : 'RightArm';
      armPivot.position.set(dir * 0.34, 1.74, 0);

      const sleeve = this.createOutlinedMesh(new THREE.CylinderGeometry(0.11, 0.15, 0.62, 16), this.materials.jacket, 0.03);
      sleeve.position.y = -0.28;
      armPivot.add(sleeve);

      const sleeveCuff = this.createOutlinedMesh(new THREE.TorusGeometry(0.115, 0.035, 12, 20), this.materials.shirt, 0.03);
      sleeveCuff.rotation.x = Math.PI / 2;
      sleeveCuff.position.y = -0.58;
      armPivot.add(sleeveCuff);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(0, -0.68, 0);

      const palm = this.createOutlinedMesh(new THREE.SphereGeometry(0.11, 16, 16), this.materials.skin, 0.035);
      palm.scale.set(1.08, 1.14, 0.72);
      handGroup.add(palm);

      if (isLeft) {
        const watch = new THREE.Group();
        watch.name = 'Wristwatch';
        const band = this.createOutlinedMesh(new THREE.TorusGeometry(0.105, 0.022, 8, 20), this.materials.gold, 0.02);
        band.rotation.x = Math.PI / 2;
        watch.add(band);
        const caseMesh = this.createOutlinedMesh(new THREE.CylinderGeometry(0.072, 0.072, 0.03, 20), this.materials.gold, 0.02);
        caseMesh.rotation.x = Math.PI / 2;
        caseMesh.position.set(0, 0, 0.075);
        watch.add(caseMesh);
        const dial = new THREE.Mesh(new THREE.CircleGeometry(0.055, 20), this.materials.dial);
        dial.position.set(0, 0, 0.093);
        watch.add(dial);
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.042, 0.004), this.materials.gold);
        marker.position.set(0, 0.014, 0.096);
        watch.add(marker);
        watch.position.set(0, 0.10, 0);
        handGroup.add(watch);
        this.props.watch = watch;
      } else {
        const smartphone = new THREE.Group();
        smartphone.name = 'Smartphone';
        const body = this.createOutlinedMesh(new THREE.BoxGeometry(0.12, 0.22, 0.018), this.materials.phone, 0.03);
        smartphone.add(body);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.204, 0.004), this.materials.screen);
        screen.position.set(0, 0, 0.012);
        smartphone.add(screen);
        smartphone.position.set(0, -0.04, 0.06);
        smartphone.rotation.x = -0.25;
        smartphone.visible = false;
        handGroup.add(smartphone);
        this.props.smartphone = smartphone;

        const folder = new THREE.Group();
        folder.name = 'SponsorshipFolder';
        const cover = this.createOutlinedMesh(new THREE.BoxGeometry(0.34, 0.44, 0.04), this.materials.folder, 0.03);
        folder.add(cover);
        const label = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.37, 0.006), this.materials.label);
        label.position.set(0, 0, 0.024);
        folder.add(label);
        const clip = this.createOutlinedMesh(new THREE.BoxGeometry(0.09, 0.028, 0.02), this.materials.gold, 0.03);
        clip.position.set(0, 0.20, 0.032);
        folder.add(clip);
        folder.position.set(0, -0.16, 0.12);
        folder.rotation.x = -0.35;
        folder.visible = false;
        handGroup.add(folder);
        this.props.folder = folder;
      }

      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.32;
      return armPivot;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    group.add(leftArm, rightArm);

    // Tailored trousers and dress shoes
    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.name = isLeft ? 'LeftLeg' : 'RightLeg';
      legPivot.position.set(dir * 0.18, 0.90, 0);

      const pant = this.createOutlinedMesh(new THREE.CylinderGeometry(0.145, 0.155, 0.62, 18), this.materials.pants, 0.03);
      pant.position.y = -0.30;
      legPivot.add(pant);

      const cuff = this.createOutlinedMesh(new THREE.CylinderGeometry(0.17, 0.17, 0.11, 20), this.materials.cuffs, 0.03);
      cuff.position.y = -0.60;
      legPivot.add(cuff);

      const shoeShaft = this.createOutlinedMesh(new THREE.CylinderGeometry(0.135, 0.15, 0.22, 18), this.materials.shoes, 0.03);
      shoeShaft.position.y = -0.74;
      legPivot.add(shoeShaft);

      const shoeFoot = this.createOutlinedMesh(new THREE.SphereGeometry(0.15, 18, 12), this.materials.shoes, 0.03);
      shoeFoot.position.set(0, -0.84, 0.08);
      shoeFoot.scale.set(0.95, 0.55, 1.55);
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
      leftLeg,
      rightLeg
    };

    this.character = group;
    this.scene.add(this.character);
    this.setPose('idle');
    return group;
  }

  setPose(poseName) {
    const pose = this.poses[poseName];
    if (!pose) {
      console.warn(`Pose "${poseName}" not found.`);
      return;
    }
    this.currentPose = poseName;
    this.isWalking = poseName === 'walk';

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
      if (key === 'watch') return;
      this.props[key].visible = !!(pose.props && pose.props[key]);
    });
  }

  buildHairstyle(style) {
    return createHairstyle(style, this.materials.hair,
      (geometry, material, thickness) => this.createOutlinedMesh(geometry, material, thickness),
      this.headRadius, this.headOffsetY);
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
        const speed = 4.6;
        leftLeg.rotation.x = Math.sin(elapsed * speed) * 0.44;
        rightLeg.rotation.x = -Math.sin(elapsed * speed) * 0.44;
        leftArm.rotation.x = -Math.sin(elapsed * speed) * 0.32;
        rightArm.rotation.x = Math.sin(elapsed * speed) * 0.32;
        this.character.position.y = Math.abs(Math.cos(elapsed * speed)) * 0.05;
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
