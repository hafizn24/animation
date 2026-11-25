import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ClubOfficeApp {
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
    this.roomBounds = { halfW: 4.2, halfD: 4.7, height: 3.0 };
    this.anchors = {};
    this.lights = {};
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
    this.scene.background = new THREE.Color(0x0d0e12);
    this.scene.fog = new THREE.Fog(0x0d0e12, 12, 30);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(56, aspect, 0.1, 200);
    this.camera.position.set(2.4, 1.7, 3.0);
    this.camera.lookAt(0, 1.35, -1.0);
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
    this.controls.target.set(0, 1.35, -1.0);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 14;
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0x6b7280, 0.34);
    ambient.name = 'officeAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0x8fa0b8, 0x3a2a1c, 0.32);
    hemi.name = 'officeHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    const lamp = new THREE.PointLight(0xffc078, 7.5, 9, 2);
    lamp.name = 'deskLamp';
    lamp.position.set(-1.05, 1.5, -0.35);
    lamp.castShadow = true;
    lamp.shadow.mapSize.width = 1024;
    lamp.shadow.mapSize.height = 1024;
    lamp.shadow.bias = -0.001;
    this.scene.add(lamp);
    this.lights.lamp = lamp;

    const hallway = new THREE.SpotLight(0xbcd4f0, 4.2, 16, 0.58, 0.75, 1.4);
    hallway.name = 'hallway';
    hallway.position.set(1.75, 2.1, -5.15);
    hallway.target.position.set(1.35, 1.0, -1.6);
    this.scene.add(hallway, hallway.target);
    this.lights.hallway = hallway;

    const fill = new THREE.DirectionalLight(0x8892a6, 0.28);
    fill.name = 'officeFill';
    fill.position.set(3, 3.4, 6);
    this.scene.add(fill);
    this.lights.fill = fill;
  }

  createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6b4a30';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) {
      const y = i * 32;
      ctx.fillStyle = i % 2 ? '#62432c' : '#715036';
      ctx.fillRect(0, y, 256, 31);
      ctx.strokeStyle = 'rgba(30,18,10,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y + 31);
      ctx.lineTo(256, y + 31);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(210,170,120,0.08)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + 7 + g * 6);
        ctx.bezierCurveTo(80, y + 4 + g * 6, 170, y + 11 + g * 6, 256, y + 6 + g * 6);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.4, 2.4);
    texture.needsUpdate = true;
    return texture;
  }

  createOfferTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3efdf';
    ctx.fillRect(0, 0, 512, 360);
    ctx.strokeStyle = '#9a8252';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, 476, 324);
    ctx.fillStyle = '#24211b';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('TAWARAN PEMINDAHAN', 256, 74);
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#5c5548';
    ctx.fillText('KELAB DIVISYEN 4', 256, 112);
    ctx.fillStyle = '#b3121f';
    ctx.font = 'bold 74px Arial Black, Arial, sans-serif';
    ctx.fillText('RM50,000', 256, 214);
    ctx.fillStyle = '#5c5548';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('UNTUK: KARIM  •  #8', 256, 268);
    ctx.strokeStyle = '#b3121f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 320, 26, 0, Math.PI * 2);
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createWhiteboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 288;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9ecec';
    ctx.fillRect(0, 0, 512, 288);
    ctx.fillStyle = '#1d3b5c';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('BULUH FC • RAMPIKAN PADANG', 20, 34);
    ctx.strokeStyle = 'rgba(30,60,90,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 48, 480, 224);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 240);
    ctx.lineTo(160, 120);
    ctx.lineTo(256, 196);
    ctx.lineTo(360, 90);
    ctx.stroke();
    ctx.fillStyle = '#b3121f';
    [[160, 120], [256, 196], [360, 90]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = '#1d3b5c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 176, 58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#1d3b5c';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.fillText('8', 240, 190);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const group = new THREE.Group();
    group.name = 'ClubOffice';
    const { halfW, halfD, height } = this.roomBounds;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x272a31, roughness: 0.96, metalness: 0 });
    const floorMat = new THREE.MeshStandardMaterial({ map: this.createWoodTexture(), roughness: 0.82 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.8 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2, halfD * 2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2, halfD * 2), wallMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    group.add(ceiling);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, height, halfD * 2), wallMat);
    leftWall.position.set(-halfW, height / 2, 0);
    leftWall.receiveShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, height, halfD * 2), wallMat);
    rightWall.position.set(halfW, height / 2, 0);
    rightWall.receiveShadow = true;
    group.add(rightWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, height, 0.16), wallMat);
    frontWall.position.set(0, height / 2, halfD);
    group.add(frontWall);

    const doorLeftX = 1.175;
    const doorRightX = 2.325;
    const backLeft = new THREE.Mesh(new THREE.BoxGeometry(doorLeftX + halfW, height, 0.16), wallMat);
    backLeft.position.set((-halfW + doorLeftX) / 2, height / 2, -halfD);
    backLeft.receiveShadow = true;
    group.add(backLeft);

    const backRight = new THREE.Mesh(new THREE.BoxGeometry(halfW - doorRightX, height, 0.16), wallMat);
    backRight.position.set((doorRightX + halfW) / 2, height / 2, -halfD);
    backRight.receiveShadow = true;
    group.add(backRight);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorRightX - doorLeftX, height - 2.3, 0.16), wallMat);
    lintel.position.set((doorLeftX + doorRightX) / 2, 2.3 + (height - 2.3) / 2, -halfD);
    group.add(lintel);

    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.7 });
    [-1, 1].forEach((dir) => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.3, 0.2), doorFrameMat);
      jamb.position.set(dir < 0 ? doorLeftX : doorRightX, 1.15, -halfD + 0.08);
      group.add(jamb);
    });
    const headJamb = new THREE.Mesh(new THREE.BoxGeometry(doorRightX - doorLeftX + 0.18, 0.09, 0.2), doorFrameMat);
    headJamb.position.set((doorLeftX + doorRightX) / 2, 2.3, -halfD + 0.08);
    group.add(headJamb);

    const doorHinge = new THREE.Group();
    doorHinge.position.set(doorLeftX, 0, -halfD + 0.08);
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.08, 2.26, 0.06), doorFrameMat);
    doorLeaf.position.set(0.54, 1.13, 0);
    doorLeaf.castShadow = true;
    doorHinge.add(doorLeaf);
    const doorHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xc9b070, roughness: 0.35, metalness: 0.7 })
    );
    doorHandle.rotation.x = Math.PI / 2;
    doorHandle.position.set(0.96, 1.05, 0.07);
    doorHinge.add(doorHandle);
    doorHinge.rotation.y = -0.62;
    group.add(doorHinge);
    this.anchors.doorHinge = doorHinge;

    const hallwayGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(doorRightX - doorLeftX, 2.3),
      new THREE.MeshBasicMaterial({ color: 0xa8c2e0, transparent: true, opacity: 0.9 })
    );
    hallwayGlow.position.set((doorLeftX + doorRightX) / 2, 1.15, -halfD - 0.18);
    group.add(hallwayGlow);
    this.anchors.hallwayGlow = hallwayGlow;

    const floorWedge = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 2.9),
      new THREE.MeshBasicMaterial({
        color: 0x9fbad8,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    floorWedge.rotation.x = -Math.PI / 2;
    floorWedge.position.set(1.8, 0.014, -3.4);
    group.add(floorWedge);
    this.anchors.floorWedge = floorWedge;

    const deskWood = new THREE.MeshStandardMaterial({ map: this.createWoodTexture(), roughness: 0.7 });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.13, 1.5), deskWood);
    deskTop.position.set(0, 0.78, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);

    const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x3b2719, roughness: 0.8 });
    [[-1.3, -0.6], [1.3, -0.6], [-1.3, 0.6], [1.3, 0.6]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.72, 0.15), deskLegMat);
      leg.position.set(x, 0.36, z);
      leg.castShadow = true;
      group.add(leg);
    });

    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.64, 1.1), deskWood);
    pedestal.position.set(-0.98, 0.34, -0.05);
    pedestal.castShadow = true;
    group.add(pedestal);
    [-0.18, 0.06, 0.3].forEach((y) => {
      const drawerLine = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.012, 0.02), trimMat);
      drawerLine.position.set(-0.98, y, 0.51);
      group.add(drawerLine);
    });

    const offerSheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.014, 0.55),
      [
        new THREE.MeshStandardMaterial({ color: 0xe8e2cd, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ color: 0xe8e2cd, roughness: 0.9 }),
        new THREE.MeshBasicMaterial({ map: this.createOfferTexture() }),
        new THREE.MeshStandardMaterial({ color: 0xe8e2cd, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ color: 0xe8e2cd, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ color: 0xe8e2cd, roughness: 0.9 }),
      ]
    );
    offerSheet.position.set(0.34, 0.856, 0.16);
    offerSheet.rotation.y = -0.12;
    group.add(offerSheet);
    this.anchors.offerSheet = offerSheet;

    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.34, 10),
      new THREE.MeshStandardMaterial({ color: 0xc9b070, roughness: 0.35, metalness: 0.6 })
    );
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.22;
    pen.position.set(0.95, 0.858, 0.34);
    group.add(pen);
    this.anchors.pen = pen;

    const whiteboardGroup = new THREE.Group();
    whiteboardGroup.position.set(-halfW + 0.14, 1.78, -0.6);
    whiteboardGroup.rotation.y = Math.PI / 2;
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.24, 0.07), trimMat);
    whiteboardGroup.add(boardFrame);
    const boardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.98, 1.12),
      new THREE.MeshBasicMaterial({ map: this.createWhiteboardTexture() })
    );
    boardFace.position.z = 0.042;
    whiteboardGroup.add(boardFace);
    group.add(whiteboardGroup);
    this.anchors.whiteboard = whiteboardGroup;

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 20), trimMat);
    lampBase.position.set(-1.05, 0.88, -0.35);
    group.add(lampBase);
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.62, 12), trimMat);
    lampStem.position.set(-1.05, 1.2, -0.35);
    group.add(lampStem);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xc4643a, roughness: 0.55, side: THREE.DoubleSide });
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.28, 24, 1, true), shadeMat);
    lampShade.position.set(-1.05, 1.56, -0.35);
    lampShade.rotation.x = Math.PI;
    group.add(lampShade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
    );
    bulb.position.set(-1.05, 1.44, -0.35);
    group.add(bulb);

    const skirting = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.12, 0.05), trimMat);
    skirting.position.set(0, 0.06, -halfD + 0.12);
    group.add(skirting);

    const backShelves = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.28), deskLegMat);
    backShelves.position.set(-2.6, 1.65, -halfD + 0.2);
    group.add(backShelves);

    this.character = group;
    this.characterParts = { ...this.anchors };
    this.scene.add(this.character);
    return group;
  }

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    if (this.lights.lamp) this.lights.lamp.intensity = 7.5 + Math.sin(elapsed * 2.3) * 0.12;
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
    Object.values(this.lights || {}).forEach((light) => light?.shadow?.dispose?.());
    if (this.scene) {
      [...this.scene.children]
        .filter((child) => child.isLight)
        .forEach((light) => {
          light.shadow?.dispose?.();
          this.scene.remove(light);
        });
    }
    this.character = null;
    this.characterParts = {};
    this.anchors = {};
    this.lights = {};
    this._dead = true;
  }
}
