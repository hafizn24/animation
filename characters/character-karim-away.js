import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHairstyle, HAIR_STYLES } from './character-hair.js';

/**
 * KarimAwayApp — Karim in his Divisyen 4 club kit (Episode 12 stands cameo).
 *
 * Same faceless 7-part rig contract as character-karim.js (7 root children,
 * Head/Torso/Pelvis + two arms + two legs, hairstyle, name panels, hand groups,
 * dispose). Differences:
 *   - Divisyen 4 away kit: deep navy with sky trim, "KARIM 8" panels, no
 *     captain's armband (the gold band stayed at Buluh FC).
 *   - A Buluh FC supporters' scarf around the neck — he left the club, not the
 *     badge. The scarf is the emotional tell in the tribun reveal.
 *   - The carried-boots slot is kept for API parity but hidden by default.
 * Fully deterministic: no Math.random() anywhere.
 */
export class KarimAwayApp {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;
    this.characterParts = {};
    this.clock = new THREE.Clock();
    this._dead = false;
    this.headRadius = 0.46;
    this.headOffsetY = 0;
    this.hairStyle = 'crop';

    this.outfits = {
      div4Away: {
        jerseyPrimary: 0x1d2a52,
        jerseySecondary: 0x8fd6ff,
        shorts: 0x10182e,
        socks: 0x1d2a52,
        sockStripes: 0x8fd6ff,
        cleats: 0x141821,
        studs: 0xf2f2ee,
        skin: 0xa9aab0,
        scarfPrimary: '#de1326',
        scarfSecondary: '#f7f4ea',
      },
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
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
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

  setupControls() {
    if (!this.renderer) return;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.35, 0);
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

  createStripedTexture(primaryHex, secondaryHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const c1 = '#' + new THREE.Color(primaryHex).getHexString();
    const c2 = '#' + new THREE.Color(secondaryHex).getHexString();
    const stripes = 12;
    const stripeWidth = canvas.width / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.fillRect(Math.floor(i * stripeWidth), 0, Math.ceil(stripeWidth), canvas.height);
    }
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, canvas.height - 14, canvas.width, 14);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  createBackNameTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8f2ff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#8fd6ff';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.fillStyle = '#8fd6ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 86px Arial, sans-serif';
    ctx.fillText('KARIM', 256, 155);
    ctx.fillStyle = '#f7f4ea';
    ctx.font = 'bold 260px Arial Black, Arial, sans-serif';
    ctx.fillText('8', 256, 350);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createFrontNameTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8f2ff';
    ctx.strokeStyle = '#10182e';
    ctx.lineWidth = 6;
    ctx.font = 'bold 46px Arial, sans-serif';
    ctx.strokeText('KARIM', 128, 58);
    ctx.fillText('KARIM', 128, 58);
    ctx.font = 'bold 132px Arial Black, Arial, sans-serif';
    ctx.strokeText('8', 128, 158);
    ctx.fillText('8', 128, 158);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /** Buluh FC supporters' scarf: red base, cream hoops, gold BULUH FC lettering. */
  createScarfTexture() {
    const palette = this.outfits.div4Away;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = palette.scarfPrimary;
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = palette.scarfSecondary;
    [10, 42].forEach((y) => ctx.fillRect(0, y, 256, 8));
    ctx.fillStyle = '#d8b26a';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BULUH FC', 128, 32);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createOutlinedMesh(geometry, material, outlineThickness = 0.028) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    group.userData = { mainMesh: mesh };
    if (outlineThickness > 0) {
      const outlineMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.BackSide })
      );
      outlineMesh.scale.set(1 + outlineThickness, 1 + outlineThickness * 0.8, 1 + outlineThickness);
      group.add(outlineMesh);
    }
    return group;
  }

  buildScarf() {
    const palette = this.outfits.div4Away;
    const scarfMaterial = new THREE.MeshToonMaterial({
      color: new THREE.Color(palette.scarfPrimary),
      map: this.createScarfTexture(),
      gradientMap: (() => {
        const colors = new Uint8Array([225, 255]);
        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
        gradientMap.minFilter = THREE.NearestFilter;
        gradientMap.magFilter = THREE.NearestFilter;
        gradientMap.needsUpdate = true;
        return gradientMap;
      })(),
    });

    const scarf = new THREE.Group();
    scarf.name = 'Scarf';

    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.058, 12, 32), scarfMaterial);
    loop.position.set(0, 0.16, 0.02);
    loop.rotation.x = Math.PI / 2 + 0.16;
    loop.scale.set(1.08, 1, 0.9);
    scarf.add(loop);

    const tailGeometry = new THREE.BoxGeometry(0.13, 0.52, 0.045);
    const uv = tailGeometry.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setY(i, uv.getY(i) * 2.4);
    [-0.11, 0.11].forEach((x, index) => {
      const tail = new THREE.Mesh(tailGeometry, scarfMaterial);
      tail.position.set(x, -0.12, 0.14 - index * 0.02);
      tail.rotation.z = x > 0 ? -0.08 : 0.1;
      tail.rotation.x = 0.05;
      scarf.add(tail);
      for (let f = 0; f < 3; f += 1) {
        const fringe = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.07, 0.04),
          scarfMaterial
        );
        fringe.position.set(x - 0.045 + f * 0.045, -0.41, 0.14 - index * 0.02);
        scarf.add(fringe);
      }
    });

    return scarf;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    group.name = 'KarimAway';
    const palette = this.outfits.div4Away;
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
    headGroup.position.set(0, 1.96, 0);
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

    const scarf = this.buildScarf();
    scarf.position.set(0, 0.18, 0.02);
    torsoGroup.add(scarf);
    group.add(torsoGroup);

    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'Pelvis';
    pelvisGroup.position.set(0, 1.04, 0);
    const hips = this.createOutlinedMesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 28), this.materials.shorts, 0.028);
    hips.position.y = -0.05;
    hips.scale.set(1.05, 1, 0.76);
    pelvisGroup.add(hips);
    group.add(pelvisGroup);

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

    // Spectator: the carried-boots slot exists for API parity with KarimApp
    // but stays hidden — he came to watch, not to play.
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
      boots.add(boot);
    });
    boots.position.set(0.02, -0.2, 0.12);
    boots.scale.setScalar(0.9);
    boots.visible = false;
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
      leftArm: left.armPivot,
      rightArm: right.armPivot,
      leftHand: left.handGroup,
      rightHand: right.handGroup,
      leftLeg,
      rightLeg,
      boots,
      backPanel,
      frontPanel,
      scarf,
    };
    this.character = group;
    this.scene.add(this.character);
    return group;
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

  setBootsVisible(visible) {
    if (this.characterParts.boots) this.characterParts.boots.visible = visible;
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    if (this.character && this.characterParts.head) {
      const { head, torso, leftArm, rightArm } = this.characterParts;
      head.position.y = 1.96 + Math.sin(elapsed * 1.8) * 0.015;
      torso.scale.y = 1 + Math.sin(elapsed * 1.8) * 0.01;
      leftArm.rotation.z = -0.28 - Math.sin(elapsed * 1.8) * 0.02;
      rightArm.rotation.z = 0.28 + Math.sin(elapsed * 1.8) * 0.02;
    }
    if (this.controls) this.controls.update();
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
    this.hairGroup = null;
    this._dead = true;
  }
}
