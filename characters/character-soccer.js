import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SoccerOutfitApp {
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
    this._dead = false;

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
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.55, 4.3);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.35, 0);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(3, 6, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.bias = -0.0005;
    this.scene.add(directionalLight);
  }

  createToonMaterial(colorHex, map = null) {
    const colors = new Uint8Array([230, 255]);
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

    const baseColor = new THREE.Color(colorHex);

    return new THREE.MeshToonMaterial({
      color: baseColor,
      map: map,
      gradientMap: gradientMap,
      emissive: baseColor,
      emissiveMap: map,
      emissiveIntensity: 0.35
    });
  }

  createStripedTexture(primaryHex, secondaryHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const c1 = '#' + new THREE.Color(primaryHex).getHexString();
    const c2 = '#' + new THREE.Color(secondaryHex).getHexString();

    const stripes = 14;
    const stripeWidth = canvas.width / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.fillRect(Math.floor(i * stripeWidth), 0, Math.ceil(stripeWidth), canvas.height);
    }

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, canvas.height - 22, canvas.width, 22);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  createOutlinedMesh(geometry, material, outlineThickness = 0.026) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    group.add(mesh);
    group.userData = { mainMesh: mesh };

    if (outlineThickness > 0) {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: 0x0b0b0b,
        side: THREE.BackSide
      });
      const outlineMesh = new THREE.Mesh(geometry, outlineMat);
      outlineMesh.scale.set(
        1 + outlineThickness,
        1 + outlineThickness * 0.85,
        1 + outlineThickness
      );
      outlineMesh.castShadow = false;
      outlineMesh.receiveShadow = false;
      group.add(outlineMesh);
    }
    return group;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    const palette = this.outfits.soccerRedWhite;
    const stripedTex = this.createStripedTexture(palette.jerseyPrimary, palette.jerseySecondary);

    this.materials = {
      hair: this.createToonMaterial(0x2b2119),
      graySkin: this.createToonMaterial(0x9ca3af), // Warna kulit kelabu kartun
      white: this.createToonMaterial(0xffffff),
      jerseyStriped: this.createToonMaterial(0xffffff, stripedTex),
      jerseySolid: this.createToonMaterial(palette.jerseyPrimary),
      shorts: this.createToonMaterial(palette.shorts),
      socks: this.createToonMaterial(palette.socks),
      sockStripes: this.createToonMaterial(palette.sockStripes),
      cleats: this.createToonMaterial(palette.cleats),
      studs: this.createToonMaterial(palette.studs),
      black: new THREE.MeshBasicMaterial({ color: 0x0b0b0b })
    };

    // ==================== 1. FACELESS HEAD & NECK ====================
    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headGroup.position.set(0, 1.96, 0);

    const headGeom = new THREE.SphereGeometry(0.47, 36, 36);
    const head = this.createOutlinedMesh(headGeom, this.materials.graySkin, 0.032);
    head.position.y = 0.37;
    headGroup.add(head);

    // Hairstyle
    this.hairGroup = this.buildHairstyle(this.hairStyle);
    headGroup.add(this.hairGroup);

    const neckGeom = new THREE.CylinderGeometry(0.115, 0.125, 0.20, 20);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.graySkin, 0.028);
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

      const trimGeom = new THREE.CylinderGeometry(0.153, 0.153, 0.038, 20);
      const trim = this.createOutlinedMesh(trimGeom, this.materials.white, 0.028);
      trim.position.set(dir * 0.02, -0.28, 0);
      armPivot.add(trim);

      const forearmGeom = new THREE.CylinderGeometry(0.095, 0.105, 0.34, 20);
      const forearm = this.createOutlinedMesh(forearmGeom, this.materials.graySkin, 0.03);
      forearm.position.set(dir * 0.02, -0.44, 0);
      armPivot.add(forearm);

      const handGroup = new THREE.Group();
      handGroup.name = 'Hand';
      handGroup.position.set(dir * 0.02, -0.64, 0);

      const palmGeom = new THREE.SphereGeometry(0.115, 20, 20);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.graySkin, 0.032);
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
      const knee = this.createOutlinedMesh(kneeGeom, this.materials.graySkin, 0.03);
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
        const speed = 7;
        leftLeg.rotation.x = Math.sin(elapsed * speed) * 0.6;
        rightLeg.rotation.x = -Math.sin(elapsed * speed) * 0.6;
        leftArm.rotation.x = -Math.sin(elapsed * speed) * 0.45;
        rightArm.rotation.x = Math.sin(elapsed * speed) * 0.45;
        this.character.position.y = Math.abs(Math.cos(elapsed * speed)) * 0.07;
      } else {
        head.position.y = 1.96 + Math.sin(elapsed * 2) * 0.015;
        leftArm.rotation.z = -0.28 - Math.sin(elapsed * 2) * 0.02;
        rightArm.rotation.z = 0.28 + Math.sin(elapsed * 2) * 0.02;
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
