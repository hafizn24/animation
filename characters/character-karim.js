import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseCharacterApp } from './core/BaseCharacterApp.js';
import { KARIM_MOTION } from './core/motion.js';
import {
  createArmbandTexture,
  createBackNameTexture,
  createFrontNameTexture,
  createStripedTexture,
} from './core/kits.js';

export class KarimApp extends BaseCharacterApp {
  constructor(container) {
    super(container);
    this.motion = { ...KARIM_MOTION };

    this.headRadius = 0.46;
    this.headOffsetY = 0;
    this.hairStyle = 'crop';

    this.outfits = {
      matchJersey: {
        jerseyPrimary: 0xde1326,
        jerseySecondary: 0xffffff,
        shorts: 0xb80f20,
        socks: 0xffffff,
        sockStripes: 0xde1326,
        cleats: 0x1b1e26,
        studs: 0xf2f2ee,
        armband: 0xd8b26a,
        skin: 0xf1e5d4,
      },
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
    return createStripedTexture(primaryHex, secondaryHex);
  }

  createBackNameTexture() {
    return createBackNameTexture('KARIM', 8);
  }

  createFrontNameTexture() {
    return createFrontNameTexture('KARIM', 8);
  }

  createArmbandTexture() {
    return createArmbandTexture('C');
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    group.name = 'Karim';
    const palette = this.outfits.matchJersey;
    const stripedTex = this.createStripedTexture(palette.jerseyPrimary, palette.jerseySecondary);

    this.materials = {
      hair: this.createToonMaterial(0x241a12),
      skin: this.createToonMaterial(palette.skin),
      jerseyStriped: this.createToonMaterial(0xffffff, stripedTex),
      jerseySolid: this.createToonMaterial(palette.jerseyPrimary),
      shorts: this.createToonMaterial(palette.shorts),
      socks: this.createToonMaterial(palette.socks),
      sockStripes: this.createToonMaterial(palette.sockStripes),
      cleats: this.createToonMaterial(palette.cleats),
      studs: this.createToonMaterial(palette.studs),
      white: this.createToonMaterial(0xffffff),
      armband: new THREE.MeshBasicMaterial({ map: this.createArmbandTexture() }),
      backName: new THREE.MeshBasicMaterial({ map: this.createBackNameTexture() }),
      frontName: new THREE.MeshBasicMaterial({
        map: this.createFrontNameTexture(),
        transparent: true,
        depthWrite: false,
      }),
      black: new THREE.MeshBasicMaterial({ color: 0x0b0b0b }),
    };

    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.95, 0);
    const head = this.createOutlinedMesh(new THREE.SphereGeometry(0.46, 32, 32), this.materials.skin, 0.032);
    head.position.y = 0.37;
    headGroup.add(head);
    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);
    const neck = this.createOutlinedMesh(new THREE.CylinderGeometry(0.115, 0.125, 0.20, 18), this.materials.skin, 0.028);
    neck.position.y = -0.04;
    headGroup.add(neck);
    group.add(headGroup);

    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    torsoGroup.position.set(0, 1.44, 0);
    const torsoGeom = new THREE.CylinderGeometry(0.29, 0.33, 0.68, 36, 1, false);
    torsoGeom.rotateY(Math.PI / 14);
    const torsoMesh = new THREE.Mesh(torsoGeom, [
      this.materials.jerseyStriped,
      this.materials.jerseySolid,
      this.materials.jerseySolid,
    ]);
    torsoMesh.castShadow = true;
    const torsoOutline = new THREE.Mesh(
      torsoGeom,
      new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide })
    );
    torsoOutline.scale.set(1.03, 1.02, 1.03);
    const torso = new THREE.Group();
    torso.add(torsoMesh, torsoOutline);
    torso.scale.set(1.06, 1, 0.76);
    torsoGroup.add(torso);

    const upperChestGeom = new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    upperChestGeom.rotateY(Math.PI / 14);
    const upperChest = this.createOutlinedMesh(upperChestGeom, this.materials.jerseyStriped, 0.028);
    upperChest.position.y = 0.33;
    upperChest.scale.set(1.06, 0.38, 0.76);
    torsoGroup.add(upperChest);

    const backPanel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.315, 0.35, 0.52, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56),
      this.materials.backName
    );
    backPanel.position.set(0, 0.02, -0.012);
    backPanel.scale.set(1.06, 1, 0.86);
    torsoGroup.add(backPanel);

    const frontPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), this.materials.frontName);
    frontPanel.position.set(0, 0.06, 0.255);
    torsoGroup.add(frontPanel);

    const collar = this.createOutlinedMesh(new THREE.TorusGeometry(0.15, 0.032, 16, 28), this.materials.white, 0.035);
    collar.position.set(0, 0.41, 0.01);
    collar.rotation.x = Math.PI / 2 + 0.08;
    collar.scale.set(1.05, 0.95, 1);
    torsoGroup.add(collar);
    group.add(torsoGroup);

    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);
    const hips = this.createOutlinedMesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 28), this.materials.shorts, 0.028);
    hips.position.y = -0.05;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

    let armband = null;
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.name = isLeft ? 'LeftArm' : 'RightArm';
      armPivot.position.set(dir * 0.29, 1.72, 0);
      const shoulderCap = this.createOutlinedMesh(new THREE.SphereGeometry(0.125, 20, 16), this.materials.jerseySolid, 0.03);
      shoulderCap.position.set(dir * 0.02, -0.02, 0);
      shoulderCap.scale.set(1.05, 1.1, 0.9);
      armPivot.add(shoulderCap);
      const sleeve = this.createOutlinedMesh(new THREE.CylinderGeometry(0.12, 0.15, 0.3, 20), this.materials.jerseySolid, 0.03);
      sleeve.position.set(dir * 0.02, -0.16, 0);
      armPivot.add(sleeve);
      if (isLeft) {
        armband = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.11, 20, 1, true), this.materials.armband);
        armband.name = 'Armband';
        armband.position.set(dir * 0.02, -0.15, 0);
        armPivot.add(armband);
      }
      const trim = this.createOutlinedMesh(new THREE.CylinderGeometry(0.153, 0.153, 0.038, 20), this.materials.white, 0.028);
      trim.position.set(dir * 0.02, -0.31, 0);
      armPivot.add(trim);
      const forearm = this.createOutlinedMesh(new THREE.CylinderGeometry(0.095, 0.105, 0.34, 20), this.materials.skin, 0.03);
      forearm.position.set(dir * 0.02, -0.47, 0);
      armPivot.add(forearm);
      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(dir * 0.02, -0.67, 0);
      const palm = this.createOutlinedMesh(new THREE.SphereGeometry(0.115, 20, 20), this.materials.skin, 0.032);
      palm.scale.set(1.12, 1.08, 0.7);
      handGroup.add(palm);
      armPivot.add(handGroup);
      armPivot.rotation.z = dir * 0.28;
      return { armPivot, handGroup };
    };

    const left = createArm(true);
    const right = createArm(false);
    group.add(left.armPivot, right.armPivot);

    const boots = new THREE.Group();
    boots.name = 'Boots';
    [-0.13, 0.13].forEach((xOff, idx) => {
      const boot = new THREE.Group();
      boot.position.set(xOff, -0.26, 0.02);
      boot.rotation.set(0.25, idx ? -0.18 : 0.18, idx ? -0.22 : 0.22);
      const upper = this.createOutlinedMesh(new THREE.CapsuleGeometry(0.095, 0.16, 10, 14), this.materials.cleats, 0.03);
      upper.rotation.x = Math.PI / 2;
      upper.scale.set(1, 1, 0.8);
      boot.add(upper);
      const sole = this.createOutlinedMesh(new THREE.CapsuleGeometry(0.1, 0.17, 10, 14), this.materials.studs, 0.02);
      sole.rotation.x = Math.PI / 2;
      sole.scale.set(1, 1, 0.3);
      sole.position.y = -0.08;
      boot.add(sole);
      boots.add(boot);
    });
    boots.position.set(0.02, -0.2, 0.12);
    boots.scale.setScalar(0.9);
    left.handGroup.add(boots);

    const createLeg = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.name = isLeft ? 'LeftLeg' : 'RightLeg';
      legPivot.position.set(dir * 0.175, 0.90, 0);
      const shortLeg = this.createOutlinedMesh(new THREE.CylinderGeometry(0.155, 0.175, 0.26, 20), this.materials.shorts, 0.03);
      shortLeg.position.y = -0.12;
      legPivot.add(shortLeg);
      const knee = this.createOutlinedMesh(new THREE.CylinderGeometry(0.115, 0.112, 0.18, 20), this.materials.skin, 0.03);
      knee.position.y = -0.32;
      legPivot.add(knee);
      const sock = this.createOutlinedMesh(new THREE.CylinderGeometry(0.12, 0.115, 0.38, 20), this.materials.socks, 0.03);
      sock.position.y = -0.58;
      legPivot.add(sock);
      [-0.45, -0.52].forEach((yPos) => {
        const hoop = this.createOutlinedMesh(new THREE.CylinderGeometry(0.124, 0.124, 0.034, 20), this.materials.sockStripes, 0.02);
        hoop.position.y = yPos;
        legPivot.add(hoop);
      });
      const cleatGroup = new THREE.Group();
      cleatGroup.position.set(0, -0.8, 0.06);
      cleatGroup.rotation.y = dir * 0.18;
      const cleatFoot = this.createOutlinedMesh(new THREE.CapsuleGeometry(0.12, 0.18, 14, 16), this.materials.cleats, 0.032);
      cleatFoot.rotation.x = Math.PI / 2;
      cleatFoot.scale.set(1.08, 1, 0.78);
      cleatGroup.add(cleatFoot);
      const laces = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.09), this.materials.black);
      laces.position.set(0, 0.085, -0.01);
      laces.rotation.x = 0.25;
      cleatGroup.add(laces);
      legPivot.add(cleatGroup);
      return legPivot;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    group.add(leftLeg, rightLeg);

    this.characterParts = {
      head: headGroup,
      torso: torsoGroup,
      pelvis: pelvisGroup,
      leftArm: left.armPivot,
      rightArm: right.armPivot,
      leftHand: left.handGroup,
      rightHand: right.handGroup,
      leftLeg,
      rightLeg,
      boots,
      backPanel,
      frontPanel,
      armband,
    };
    this.character = group;
    this.scene.add(this.character);
    return group;
  }

  setBootsVisible(visible) {
    if (this.characterParts.boots) this.characterParts.boots.visible = visible;
  }

  /**
   * Karim is club captain through Episode 4, so the band ships visible and
   * stays visible for every earlier episode's continuity.
   */
  setArmbandVisible(visible) {
    if (this.characterParts.armband) this.characterParts.armband.visible = !!visible;
  }

  changeOutfit(outfitName) {
    const palette = this.outfits[outfitName];
    if (!palette) return;

    if (this.materials.jerseyStriped && this.materials.jerseyStriped.map) {
      this.materials.jerseyStriped.map.dispose();
    }
    const newStripeTex = this.createStripedTexture(palette.jerseyPrimary, palette.jerseySecondary);
    if (this.materials.jerseyStriped) {
      this.materials.jerseyStriped.map = newStripeTex;
      this.materials.jerseyStriped.emissiveMap = newStripeTex;
      this.materials.jerseyStriped.needsUpdate = true;
    }

    const setMatColor = (mat, hex) => {
      if (!mat) return;
      mat.color.setHex(hex);
      if (mat.emissive) mat.emissive.setHex(hex);
    };

    setMatColor(this.materials.skin, palette.skin);
    setMatColor(this.materials.jerseySolid, palette.jerseyPrimary);
    setMatColor(this.materials.shorts, palette.shorts);
    setMatColor(this.materials.socks, palette.socks);
    setMatColor(this.materials.sockStripes, palette.sockStripes);
    setMatColor(this.materials.cleats, palette.cleats);
    setMatColor(this.materials.studs, palette.studs);
  }
}
