import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

    this.outfits = {
      grayHoodie: {
        jerseyPrimary: 0x528558,
        jerseySecondary: 0x3f6b44,
        shorts: 0x425770,
        socks: 0x677c94,
        sockStripes: 0x95583f,
        cleats: 0xf2a04f,
        studs: 0x111111
      },
      grayHoodieAlt: {
        jerseyPrimary: 0x528558,
        jerseySecondary: 0x3f6b44,
        shorts: 0x425770,
        socks: 0x677c94,
        sockStripes: 0x95583f,
        cleats: 0xf2a04f,
        studs: 0x111111
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
    // Bright hemisphere & ambient light so white stays pure white, not gray
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

  // Flat-bright 2D Toon Material with subtle cel-shading
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
      // Slight emissive boost keeps colors vibrant & prevents muddy gray shadows
      emissive: baseColor,
      emissiveMap: map,
      emissiveIntensity: 0.35
    });
  }

  // Razor-sharp vertical stripes for the torso cylinder side only
  createStripedTexture(primaryHex, secondaryHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const c1 = '#' + new THREE.Color(primaryHex).getHexString();
    const c2 = '#' + new THREE.Color(secondaryHex).getHexString();

    // 14 total stripes around cylinder = 7 crisp stripes visible on the front chest
    const stripes = 14;
    const stripeWidth = canvas.width / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.fillRect(Math.floor(i * stripeWidth), 0, Math.ceil(stripeWidth), canvas.height);
    }

    // Subtle dark hem line at the very bottom of the jersey
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, canvas.height - 22, canvas.width, 22);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // NearestFilter prevents blurry gradient bleeding between red and white stripes
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  // Improved vertex-normal outline mesh (never casts self-shadows or darkens the mesh)
  createOutlinedMesh(geometry, material, outlineThickness = 0.026) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false; // Prevents ugly self-shadowing bands across cartoon limbs
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
    const palette = this.outfits.grayHoodie;

    this.materials = {
      white: this.createToonMaterial(0xffffff),
      jerseyStriped: this.createToonMaterial(palette.jerseyPrimary),
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
    headGroup.position.set(0, 1.96, 0);

    // Large cartoon sphere head with bold outline
    const headGeom = new THREE.SphereGeometry(0.47, 36, 36);
    const head = this.createOutlinedMesh(headGeom, this.materials.white, 0.032);
    head.position.y = 0.37;
    headGroup.add(head);

    // Smooth neck cylinder tucked cleanly into collar
    const neckGeom = new THREE.CylinderGeometry(0.115, 0.125, 0.20, 20);
    const neck = this.createOutlinedMesh(neckGeom, this.materials.white, 0.028);
    neck.position.y = -0.04;
    headGroup.add(neck);

    group.add(headGroup);

    // ==================== 2. GRAY HOODIE ====================
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.44, 0);

    // Multi-material cylinder: striped on the side wall, solid red on top/bottom caps
    // so there is NO protruding shoulder bar or ugly cap distortion
    const torsoGeom = new THREE.CylinderGeometry(0.28, 0.32, 0.68, 36, 1, false);
    // Rotate UVs slightly so a white stripe is centered cleanly on the chest
    torsoGeom.rotateY(Math.PI / 14);

    const torsoMesh = new THREE.Mesh(torsoGeom, [
      this.materials.jerseyStriped, // Side wall (crisp vertical stripes)
      this.materials.jerseySolid,   // Top cap
      this.materials.jerseySolid    // Bottom cap
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

    // Rounded upper-chest/shoulder dome (striped so stripes go all the way to the neck!)
    const upperChestGeom = new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    upperChestGeom.rotateY(Math.PI / 14);
    const upperChest = this.createOutlinedMesh(upperChestGeom, this.materials.jerseyStriped, 0.028);
    upperChest.position.y = 0.33;
    upperChest.scale.set(1.06, 0.38, 0.74);
    torsoGroup.add(upperChest);

    // Crisp White Crew-Neck Collar Ring sitting on top of the jersey
    const collarGeom = new THREE.TorusGeometry(0.145, 0.032, 16, 28);
    const collar = this.createOutlinedMesh(collarGeom, this.materials.white, 0.035);
    collar.position.set(0, 0.41, 0.01);
    collar.rotation.x = Math.PI / 2 + 0.08;
    collar.scale.set(1.05, 0.95, 1.0);
    torsoGroup.add(collar);

    group.add(torsoGroup);

    // ==================== 3. SOCCER SHORTS (WAIST & LEGS) ====================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.position.set(0, 1.04, 0);

    // Upper shorts waist block tucked seamlessly under jersey hem
    const hipsGeom = new THREE.CylinderGeometry(0.325, 0.34, 0.22, 28);
    const hips = this.createOutlinedMesh(hipsGeom, this.materials.shorts, 0.028);
    hips.position.y = -0.05;
    hips.scale.set(1.05, 1, 0.74);
    pelvisGroup.add(hips);

    // Center shorts inseam divider line (matches 2D drawing)
    const seamGeom = new THREE.BoxGeometry(0.018, 0.16, 0.02);
    const seam = new THREE.Mesh(seamGeom, this.materials.black);
    seam.position.set(0, -0.08, 0.255);
    pelvisGroup.add(seam);

    group.add(pelvisGroup);

    // ==================== 3. GRAY SWEATER ARMS & HANDS ====================
    const createArm = (isLeft) => {
      const dir = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      // tucked slightly inward so shoulder cap merges seamlessly with torso
      armPivot.position.set(dir * 0.29, 1.72, 0);

      // Rounded Red Shoulder Cap (eliminates the floating corner gap!)
      const shoulderCapGeom = new THREE.SphereGeometry(0.125, 20, 16);
      const shoulderCap = this.createOutlinedMesh(shoulderCapGeom, this.materials.jerseySolid, 0.03);
      shoulderCap.position.set(dir * 0.02, -0.02, 0);
      shoulderCap.scale.set(1.05, 1.1, 0.9);
      armPivot.add(shoulderCap);

      // Flared Red Short Sleeve
      const shortSleeveGeom = new THREE.CylinderGeometry(0.12, 0.15, 0.28, 20);
      const shortSleeve = this.createOutlinedMesh(shortSleeveGeom, this.materials.jerseySolid, 0.03);
      shortSleeve.position.set(dir * 0.02, -0.15, 0);
      armPivot.add(shortSleeve);

      // White Sleeve Cuff Trim Band
      const trimGeom = new THREE.CylinderGeometry(0.153, 0.153, 0.038, 20);
      const trim = this.createOutlinedMesh(trimGeom, this.materials.white, 0.028);
      trim.position.set(dir * 0.02, -0.28, 0);
      armPivot.add(trim);

      // White Bare Forearm
      const forearmGeom = new THREE.CylinderGeometry(0.095, 0.105, 0.34, 20);
      const forearm = this.createOutlinedMesh(forearmGeom, this.materials.white, 0.03);
      forearm.position.set(dir * 0.02, -0.44, 0);
      armPivot.add(forearm);

      // Expressive Cartoon Hand (Larger palm + longer splayed fingers like the reference)
      const handGroup = new THREE.Group();
      handGroup.position.set(dir * 0.02, -0.64, 0);

      const palmGeom = new THREE.SphereGeometry(0.115, 20, 20);
      const palm = this.createOutlinedMesh(palmGeom, this.materials.white, 0.032);
      palm.scale.set(1.05, 1.0, 0.62);
      handGroup.add(palm);

      // 4 Long Splayed Cartoon Fingers
      const fingerGeom = new THREE.CapsuleGeometry(0.032, 0.11, 10, 10);
      const fingerAngles = [-0.42, -0.14, 0.14, 0.42];
      fingerAngles.forEach((spreadAngle) => {
        const finger = this.createOutlinedMesh(fingerGeom, this.materials.white, 0.038);
        const radius = 0.135;
        finger.position.set(
          Math.sin(spreadAngle) * radius,
          -Math.cos(spreadAngle) * radius - 0.01,
          0
        );
        finger.rotation.z = spreadAngle;
        handGroup.add(finger);
      });

      // Distinct Cartoon Thumb pointing inward
      const thumbGeom = new THREE.CapsuleGeometry(0.034, 0.09, 10, 10);
      const thumb = this.createOutlinedMesh(thumbGeom, this.materials.white, 0.038);
      thumb.position.set(-dir * 0.135, -0.02, 0.02);
      thumb.rotation.z = -dir * 0.85;
      handGroup.add(thumb);

      armPivot.add(handGroup);
      // Natural cartoon A-pose angle matching the 2D character sheet
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

      // Flared Red Shorts Leg
      const shortLegGeom = new THREE.CylinderGeometry(0.155, 0.175, 0.26, 20);
      const shortLeg = this.createOutlinedMesh(shortLegGeom, this.materials.shorts, 0.03);
      shortLeg.position.y = -0.12;
      legPivot.add(shortLeg);

      // Bare White Knee / Upper Shin
      const kneeGeom = new THREE.CylinderGeometry(0.115, 0.112, 0.18, 20);
      const knee = this.createOutlinedMesh(kneeGeom, this.materials.white, 0.03);
      knee.position.y = -0.32;
      legPivot.add(knee);

      // White Soccer Sock
      const sockGeom = new THREE.CylinderGeometry(0.12, 0.115, 0.38, 20);
      const sock = this.createOutlinedMesh(sockGeom, this.materials.socks, 0.03);
      sock.position.y = -0.58;
      legPivot.add(sock);

      // Two Crisp Red Sock Hoops
      [-0.45, -0.52].forEach((yPos) => {
        const hoopGeom = new THREE.CylinderGeometry(0.124, 0.124, 0.034, 20);
        const hoop = this.createOutlinedMesh(hoopGeom, this.materials.sockStripes, 0.02);
        hoop.position.y = yPos;
        legPivot.add(hoop);
      });

      // White Soccer Cleat Shoe (angled slightly outward like the 2D sheet)
      const cleatGroup = new THREE.Group();
      cleatGroup.position.set(0, -0.80, 0.06);
      cleatGroup.rotation.y = dir * 0.18;

      const cleatFootGeom = new THREE.CapsuleGeometry(0.12, 0.18, 14, 16);
      const cleatFoot = this.createOutlinedMesh(cleatFootGeom, this.materials.cleats, 0.032);
      cleatFoot.rotation.x = Math.PI / 2;
      cleatFoot.scale.set(1.08, 1.0, 0.78);
      cleatGroup.add(cleatFoot);

      // Shoe Tongue & Laces detail on top of cleat
      const laceGeom = new THREE.BoxGeometry(0.08, 0.02, 0.09);
      const laces = new THREE.Mesh(laceGeom, this.materials.black);
      laces.position.set(0, 0.085, -0.01);
      laces.rotation.x = 0.25;
      cleatGroup.add(laces);

      // Cleat Studs Underneath
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
