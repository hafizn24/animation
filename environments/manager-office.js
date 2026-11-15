import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * ManagerOfficeApp – Procedural 3D model of the Oakhaven United FC manager's
 * office inside the clubhouse.
 *
 * Key structures:
 *   1. Room shell – plank floor, panelled walls, ceiling with cornice
 *   2. Manager's desk with drawer pedestal, paperwork, mug and desk lamp
 *   3. High-backed office chair with swivel base
 *   4. Trophy cabinet and bookshelf with books, folders and awards
 *   5. Framed club photographs and honours on the walls
 *   6. Tactics whiteboard on a rolling stand
 *   7. Bay window overlooking the pitch, with curtains
 *   8. Armchairs, rug and coffee table for visitors
 *   9. Filing cabinet, coat stand with the manager's jacket and cap
 *  10. Pendant light, wall clock, waste bin, football and desk clock
 *
 * Walls are hidden automatically when the camera moves outside of them so the
 * office can always be inspected from any angle.
 */
export class ManagerOfficeApp {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.character = null;      // root group – named "character" for inspector compat
    this.characterParts = {};
    this.clock = new THREE.Clock();
    this._dead = false;
    this.roomBounds = { halfW: 6.2, halfD: 5.2, height: 3.3 };
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.addLights();
    this.createProceduralCharacter();   // builds the office
    this.animate();
    return this;
  }

  /* ------------------------------------------------------------------ */
  /*  Boilerplate (same pattern as existing character apps)              */
  /* ------------------------------------------------------------------ */

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a2723);   // warm interior backdrop
    this.scene.fog = new THREE.Fog(0x2a2723, 28, 65);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 200);
    this.camera.position.set(4.9, 4.1, 9.0);
    this.homeCamera = [4.9, 4.1, 9.0];
    this.homeTarget = [0, 1.2, -0.8];
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
    this.controls.target.set(0, 1.2, -0.8);
    this.controls.maxPolarAngle = Math.PI / 2.05;  // prevent going underground
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0xf0e6d8, 0.9);
    this.scene.add(ambient);

    // Warm key light from the window side
    const key = new THREE.DirectionalLight(0xfff0d6, 1.45);
    key.position.set(-6, 8, 7);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 28;
    key.shadow.bias = -0.0004;
    this.scene.add(key);

    // Cool daylight coming through the window
    const daylight = new THREE.DirectionalLight(0xbcd6f0, 0.55);
    daylight.position.set(-8, 5, -6);
    this.scene.add(daylight);

    const hemi = new THREE.HemisphereLight(0xfdf6ea, 0x4a3f33, 0.55);
    this.scene.add(hemi);

    // Desk lamp practical
    const lampLight = new THREE.PointLight(0xffd9a0, 16, 9, 2);
    lampLight.position.set(-1.65, 1.42, 1.25);
    this.scene.add(lampLight);

    // Ceiling pendant
    const pendant = new THREE.PointLight(0xffe7c0, 14, 14, 2);
    pendant.position.set(0, 2.75, 0);
    this.scene.add(pendant);
  }

  /* ------------------------------------------------------------------ */
  /*  Toon-style material helpers (matching existing codebase)          */
  /* ------------------------------------------------------------------ */

  createToonMaterial(colorHex) {
    const colors = new Uint8Array([200, 240, 255]);
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

    return new THREE.MeshToonMaterial({
      color: colorHex,
      gradientMap: gradientMap,
    });
  }

  createStdMaterial(colorHex, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: opts.roughness ?? 0.7,
      metalness: opts.metalness ?? 0.0,
      ...opts,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Small texture helpers                                              */
  /* ------------------------------------------------------------------ */

  makeCanvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  /* ------------------------------------------------------------------ */
  /*  Wall culling – hides whichever wall the camera is standing behind  */
  /* ------------------------------------------------------------------ */

  updateWallVisibility() {
    if (!this.wallCull) return;
    const p = this.camera.position;
    const { halfW, halfD, height } = this.roomBounds;

    this.wallCull.back.forEach(o => { o.visible = p.z > -halfD - 0.05; });
    this.wallCull.front.forEach(o => { o.visible = p.z < halfD + 0.05; });
    this.wallCull.left.forEach(o => { o.visible = p.x > -halfW - 0.05; });
    this.wallCull.right.forEach(o => { o.visible = p.x < halfW + 0.05; });
    this.wallCull.ceiling.forEach(o => { o.visible = p.y < height + 0.05; });
  }

  /* ------------------------------------------------------------------ */
  /*  MAIN BUILD                                                        */
  /* ------------------------------------------------------------------ */

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const root = new THREE.Group();
    root.name = 'ManagerOffice';

    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };

    // ============================
    // 0. MATERIALS
    // ============================
    const mat = {
      floor: this.createStdMaterial(0x8a6134, { roughness: 0.55 }),
      wall: this.createStdMaterial(0xd9cfb8, { roughness: 0.92 }),
      wallLower: this.createStdMaterial(0xe4dcc8, { roughness: 0.9 }),
      ceiling: this.createStdMaterial(0xf5f1e8, { roughness: 0.95 }),
      wood: this.createStdMaterial(0x6f4e2c, { roughness: 0.55 }),
      woodDark: this.createStdMaterial(0x4a331d, { roughness: 0.6 }),
      woodLight: this.createStdMaterial(0xa17c4c, { roughness: 0.55 }),
      deskTop: this.createStdMaterial(0x5c3d22, { roughness: 0.32 }),
      leather: this.createStdMaterial(0x4a2f22, { roughness: 0.6 }),
      metal: this.createStdMaterial(0xc0c4c8, { roughness: 0.3, metalness: 0.75 }),
      metalDark: this.createStdMaterial(0x5b6066, { roughness: 0.45, metalness: 0.6 }),
      gold: this.createStdMaterial(0xd9a441, { roughness: 0.25, metalness: 0.9 }),
      silver: this.createStdMaterial(0xd7dade, { roughness: 0.2, metalness: 0.95 }),
      glass: this.createStdMaterial(0xa8c8dc, {
        roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.22,
        side: THREE.DoubleSide,
      }),
      paper: this.createStdMaterial(0xf4f2e9, { roughness: 0.9 }),
      lamp: this.createStdMaterial(0xffffff, {
        roughness: 0.4, emissive: 0xffdfae, emissiveIntensity: 1.5,
      }),
      red: this.createStdMaterial(0xb52a2a, { roughness: 0.65 }),
      green: this.createStdMaterial(0x1f6b34, { roughness: 0.65 }),
      navy: this.createStdMaterial(0x21304f, { roughness: 0.7 }),
      cream: this.createStdMaterial(0xefe4cf, { roughness: 0.9 }),
      rug: this.createStdMaterial(0x7d3b2e, { roughness: 0.95 }),
      rugPattern: this.createStdMaterial(0xb08a4e, { roughness: 0.95 }),
      plantGreen: this.createStdMaterial(0x2f6b34, { roughness: 0.8 }),
      terracotta: this.createStdMaterial(0xb2603c, { roughness: 0.8 }),
      black: this.createStdMaterial(0x1a1a1c, { roughness: 0.6 }),
    };

    // ============================
    //  LOCAL BUILD HELPERS
    // ============================
    const box = (w, h, d, material, x, y, z, parent = root, cast = true, receive = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    };

    const cyl = (rTop, rBottom, height, material, x, y, z, parent = root, segments = 20) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, height, segments),
        material
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const panel = (width, height, draw, materialOpts = {}, parent = root) => {
      const texture = this.makeCanvasTexture(
        Math.max(64, Math.round(width * 256)),
        Math.max(64, Math.round(height * 256)),
        draw
      );
      const material = this.createStdMaterial(0xffffff, {
        roughness: 0.7,
        ...materialOpts,
        map: texture,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // ============================
    // 1. ROOM SHELL
    // ============================
    const shellGroup = new THREE.Group();
    shellGroup.name = 'RoomShell';
    root.add(shellGroup);

    const ROOM_W = 12.4;
    const ROOM_D = 10.4;
    const ROOM_H = 3.3;
    const HALF_W = ROOM_W / 2;   // 6.2
    const HALF_D = ROOM_D / 2;   // 5.2
    this.roomBounds = { halfW: HALF_W, halfD: HALF_D, height: ROOM_H };

    const DOOR_W = 1.1;
    const DOOR_H = 2.15;

    // Floor – plank pattern
    const plankTexture = this.makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#8a6134';
      ctx.fillRect(0, 0, w, h);
      const rows = 6;
      const rowH = h / rows;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (w / 4);
        for (let p = 0; p < 3; p++) {
          const x = offset + p * (w / 3);
          const shade = 120 + ((r * 7 + p * 13) % 30);
          ctx.fillStyle = `rgb(${shade + 40}, ${shade - 10}, ${shade - 45})`;
          ctx.fillRect(x + 2, r * rowH + 2, w / 3 - 4, rowH - 4);
        }
      }
    });
    const floorMat = this.createStdMaterial(0xffffff, { roughness: 0.5, map: plankTexture });
    const floor = box(ROOM_W, 0.12, ROOM_D, floorMat, 0, -0.06, 0, shellGroup, false, true);

    // Ceiling + cornice
    const ceilingMesh = box(ROOM_W, 0.14, ROOM_D, mat.ceiling, 0, ROOM_H + 0.07, 0, shellGroup, false, true);
    this.wallCull.ceiling.push(ceilingMesh);
    box(ROOM_W, 0.1, 0.1, mat.cream, 0, ROOM_H - 0.05, -HALF_D + 0.05, shellGroup, false, true);
    box(ROOM_W, 0.1, 0.1, mat.cream, 0, ROOM_H - 0.05, HALF_D - 0.05, shellGroup, false, true);
    box(0.1, 0.1, ROOM_D, mat.cream, -HALF_W + 0.05, ROOM_H - 0.05, 0, shellGroup, false, true);
    box(0.1, 0.1, ROOM_D, mat.cream, HALF_W - 0.05, ROOM_H - 0.05, 0, shellGroup, false, true);

    // --- Back wall ---
    const backWall = box(ROOM_W, ROOM_H, 0.22, mat.wall, 0, ROOM_H / 2, -HALF_D - 0.11, shellGroup, false, true);
    const backDado = box(ROOM_W, 1.15, 0.05, mat.wallLower, 0, 0.575, -HALF_D + 0.025, shellGroup, false, true);
    const backRail = box(ROOM_W, 0.06, 0.09, mat.wood, 0, 1.15, -HALF_D + 0.06, shellGroup, false, true);
    this.wallCull.back.push(backWall, backDado, backRail);

    // --- Left wall (window) ---
    const leftWall = box(0.22, ROOM_H, ROOM_D, mat.wall, -HALF_W - 0.11, ROOM_H / 2, 0, shellGroup, false, true);
    const leftDado = box(0.05, 1.15, ROOM_D, mat.wallLower, -HALF_W + 0.025, 0.575, 0, shellGroup, false, true);
    this.wallCull.left.push(leftWall, leftDado);

    // --- Right wall (doorway) ---
    const sideD = (ROOM_D - DOOR_W) / 2;
    const rightA = box(0.22, ROOM_H, sideD, mat.wall, HALF_W + 0.11, ROOM_H / 2, -(DOOR_W / 2 + sideD / 2), shellGroup, false, true);
    const rightB = box(0.22, ROOM_H, sideD, mat.wall, HALF_W + 0.11, ROOM_H / 2, (DOOR_W / 2 + sideD / 2), shellGroup, false, true);
    const rightLintel = box(0.22, ROOM_H - DOOR_H, DOOR_W, mat.wall, HALF_W + 0.11, DOOR_H + (ROOM_H - DOOR_H) / 2, 0, shellGroup, false, true);
    const rightDadoA = box(0.05, 1.15, sideD, mat.wallLower, HALF_W - 0.025, 0.575, -(DOOR_W / 2 + sideD / 2), shellGroup, false, true);
    const rightDadoB = box(0.05, 1.15, sideD, mat.wallLower, HALF_W - 0.025, 0.575, (DOOR_W / 2 + sideD / 2), shellGroup, false, true);
    const frameA = box(0.28, DOOR_H + 0.12, 0.12, mat.woodDark, HALF_W - 0.02, (DOOR_H + 0.12) / 2, -DOOR_W / 2 - 0.06, shellGroup);
    const frameB = box(0.28, DOOR_H + 0.12, 0.12, mat.woodDark, HALF_W - 0.02, (DOOR_H + 0.12) / 2, DOOR_W / 2 + 0.06, shellGroup);
    const frameTop = box(0.28, 0.12, DOOR_W + 0.24, mat.woodDark, HALF_W - 0.02, DOOR_H + 0.06, 0, shellGroup);
    this.wallCull.right.push(rightA, rightB, rightLintel, rightDadoA, rightDadoB, frameA, frameB, frameTop);

    // --- Front wall ---
    const frontWall = box(ROOM_W, ROOM_H, 0.22, mat.wall, 0, ROOM_H / 2, HALF_D + 0.11, shellGroup, false, true);
    const frontDado = box(ROOM_W, 1.15, 0.05, mat.wallLower, 0, 0.575, HALF_D - 0.025, shellGroup, false, true);
    const frontRail = box(ROOM_W, 0.06, 0.09, mat.wood, 0, 1.15, HALF_D - 0.06, shellGroup, false, true);
    this.wallCull.front.push(frontWall, frontDado, frontRail);

    // ============================
    // 2. WINDOW (left wall) WITH VIEW
    // ============================
    const windowGroup = new THREE.Group();
    windowGroup.name = 'Window';
    root.add(windowGroup);

    const WIN_Z = -1.2;
    const WIN_W = 3.2;      // along z
    const WIN_H = 1.7;
    const WIN_Y = 1.65;

    box(0.34, 0.1, WIN_W + 0.4, mat.woodDark, -HALF_W + 0.12, WIN_Y - WIN_H / 2 - 0.05, WIN_Z, windowGroup);
    box(0.26, 0.12, WIN_W + 0.3, mat.cream, -HALF_W + 0.06, WIN_Y + WIN_H / 2 + 0.06, WIN_Z, windowGroup);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W, WIN_H), mat.glass);
    glass.rotation.y = Math.PI / 2;
    glass.position.set(-HALF_W + 0.08, WIN_Y, WIN_Z);
    windowGroup.add(glass);

    // View through the window – the pitch and the far side of The Oaks
    const viewTexture = this.makeCanvasTexture(1024, 640, (ctx, w, h) => {
      // Sky
      const skyH = h * 0.46;
      const grad = ctx.createLinearGradient(0, 0, 0, skyH);
      grad.addColorStop(0, '#5aa9d8');
      grad.addColorStop(1, '#d7ecf5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, skyH);

      // Distant stand on the horizon
      ctx.fillStyle = '#6c6f74';
      ctx.fillRect(0, skyH - h * 0.12, w, h * 0.12);
      ctx.fillStyle = '#e9edf0';
      ctx.fillRect(0, skyH - h * 0.14, w, h * 0.03);
      ctx.fillStyle = '#4d5054';
      for (let i = 0; i < 22; i++) {
        ctx.fillRect(i * (w / 21), skyH - h * 0.11, 4, h * 0.11);
      }

      // Advertising hoardings along the far touchline
      const hoard = ['#f4f4f0', '#1a3a6b', '#1a6b1a', '#f4f4f0'];
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = hoard[i % hoard.length];
        ctx.fillRect(i * (w / 12), skyH - h * 0.035, w / 12 - 3, h * 0.035);
      }

      // Pitch with mowing stripes
      ctx.fillStyle = '#3f8c46';
      ctx.fillRect(0, skyH, w, h - skyH);
      for (let i = 0; i < 6; i++) {
        if (i % 2) continue;
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(0, skyH + i * ((h - skyH) / 6), w, (h - skyH) / 6);
      }

      // Touchline
      ctx.fillStyle = '#f2f2ee';
      ctx.fillRect(0, skyH + (h - skyH) * 0.14, w, 7);
    });
    const viewPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(WIN_W, WIN_H),
      this.createStdMaterial(0xffffff, { roughness: 0.25, map: viewTexture })
    );
    viewPanel.rotation.y = Math.PI / 2;
    viewPanel.position.set(-HALF_W + 0.06, WIN_Y, WIN_Z);
    windowGroup.add(viewPanel);

    // Outside ground so the dollhouse view shows grass beyond the window
    const viewGroup = new THREE.Group();
    viewGroup.name = 'WindowView';
    root.add(viewGroup);
    const outside = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 14),
      this.createStdMaterial(0x3f8c46, { roughness: 0.95 })
    );
    outside.rotation.x = -Math.PI / 2;
    outside.position.set(-HALF_W - 4.6, 0.01, WIN_Z);
    outside.receiveShadow = false;
    viewGroup.add(outside);

    box(0.1, WIN_H, 0.07, mat.cream, -HALF_W + 0.1, WIN_Y, WIN_Z, windowGroup);
    box(0.1, 0.07, WIN_W, mat.cream, -HALF_W + 0.1, WIN_Y, WIN_Z, windowGroup);

    // Curtains
    const curtainMat = this.createStdMaterial(0x7d2f36, { roughness: 0.95 });
    [-1, 1].forEach((side) => {
      const curtain = new THREE.Group();
      curtain.position.set(-HALF_W + 0.3, WIN_Y + WIN_H / 2, WIN_Z + side * (WIN_W / 2 + 0.25));
      windowGroup.add(curtain);
      for (let c = 0; c < 4; c++) {
        const fold = cyl(0.11, 0.13, WIN_H + 0.5, curtainMat, 0, -(WIN_H + 0.5) / 2, -0.32 + c * 0.22, curtain, 12);
        fold.castShadow = true;
      }
      box(0.1, 0.1, 1.0, mat.woodDark, 0, 0.16, -0.2, curtain);
    });
    const pole = cyl(0.03, 0.03, WIN_W + 1.6, mat.metalDark, -HALF_W + 0.3, WIN_Y + WIN_H / 2 + 0.18, WIN_Z, windowGroup, 12);
    pole.rotation.x = Math.PI / 2;

    this.wallCull.left.push(windowGroup, viewGroup);

    // ============================
    // 3. MANAGER'S DESK
    // ============================
    const deskGroup = new THREE.Group();
    deskGroup.name = 'Desk';
    root.add(deskGroup);

    const DX = -0.6;
    const DZ = 1.6;
    const DESK_W = 2.6;
    const DESK_D = 1.15;
    const DESK_H = 0.76;

    box(DESK_W, 0.07, DESK_D, mat.deskTop, DX, DESK_H, DZ, deskGroup);
    box(DESK_W - 0.14, 0.012, DESK_D - 0.12, mat.leather, DX, DESK_H + 0.04, DZ, deskGroup);

    // Pedestal of drawers on the right
    const pedestal = new THREE.Group();
    pedestal.position.set(DX + DESK_W / 2 - 0.42, 0, DZ);
    deskGroup.add(pedestal);
    box(0.78, DESK_H - 0.08, DESK_D - 0.08, mat.wood, 0, (DESK_H - 0.08) / 2, 0, pedestal);
    for (let d = 0; d < 3; d++) {
      const dy = 0.2 + d * 0.22;
      box(0.74, 0.19, 0.03, mat.woodLight, 0, dy, (DESK_D - 0.08) / 2 + 0.015, pedestal);
      box(0.2, 0.03, 0.04, mat.gold, 0, dy, (DESK_D - 0.08) / 2 + 0.05, pedestal);
    }

    // Trestle legs on the left
    box(0.08, DESK_H - 0.08, DESK_D - 0.14, mat.wood, DX - DESK_W / 2 + 0.2, (DESK_H - 0.08) / 2, DZ, deskGroup);
    box(0.08, DESK_H - 0.08, DESK_D - 0.14, mat.wood, DX - DESK_W / 2 + 0.55, (DESK_H - 0.08) / 2, DZ, deskGroup);
    box(0.5, 0.06, DESK_D - 0.14, mat.wood, DX - DESK_W / 2 + 0.37, 0.12, DZ, deskGroup);

    // Paperwork
    const stack = box(0.32, 0.03, 0.42, mat.paper, DX - 0.55, DESK_H + 0.055, DZ - 0.1, deskGroup);
    stack.rotation.y = 0.12;
    const folder = box(0.34, 0.02, 0.44, mat.green, DX - 0.5, DESK_H + 0.08, DZ - 0.08, deskGroup);
    folder.rotation.y = -0.08;
    const sheet = box(0.22, 0.006, 0.3, mat.paper, DX + 0.05, DESK_H + 0.05, DZ + 0.12, deskGroup);
    sheet.rotation.y = -0.25;

    // Mug + pen tray
    cyl(0.05, 0.045, 0.1, mat.cream, DX + 0.5, DESK_H + 0.1, DZ - 0.28, deskGroup, 18);
    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.011, 8, 16), mat.cream);
    mugHandle.position.set(DX + 0.56, DESK_H + 0.1, DZ - 0.28);
    mugHandle.rotation.y = Math.PI / 2;
    deskGroup.add(mugHandle);
    box(0.18, 0.02, 0.1, mat.woodDark, DX + 0.2, DESK_H + 0.055, DZ - 0.32, deskGroup);

    // Desk lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(DX - 1.05, DESK_H + 0.04, DZ - 0.35);
    deskGroup.add(lampGroup);
    cyl(0.11, 0.13, 0.03, mat.metalDark, 0, 0.015, 0, lampGroup, 18);
    cyl(0.02, 0.02, 0.44, mat.metalDark, 0, 0.24, 0, lampGroup, 10);
    const arm = cyl(0.02, 0.02, 0.3, mat.metalDark, 0.1, 0.45, 0, lampGroup, 10);
    arm.rotation.z = -Math.PI / 3.2;
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.13, 0.16, 16, 1, true),
      this.createStdMaterial(0x3a3d40, { roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide })
    );
    lampShade.position.set(0.22, 0.56, 0);
    lampShade.rotation.z = 0.5;
    lampGroup.add(lampShade);
    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), mat.lamp);
    lampBulb.position.set(0.23, 0.5, 0);
    lampGroup.add(lampBulb);

    // Football on the desk corner
    const ballTexture = this.makeCanvasTexture(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#f4f4f0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1c1c1c';
      const pent = (cx, cy, r, rot) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = rot + (i * Math.PI * 2) / 5;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };
      pent(w * 0.16, h * 0.35, h * 0.26, -Math.PI / 2);
      pent(w * 0.52, h * 0.72, h * 0.26, -Math.PI / 2);
      pent(w * 0.88, h * 0.35, h * 0.26, -Math.PI / 2);
    });
    const deskBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 20, 16),
      this.createStdMaterial(0xffffff, { roughness: 0.5, map: ballTexture })
    );
    deskBall.position.set(DX + 1.0, DESK_H + 0.11, DZ + 0.3);
    deskBall.castShadow = true;
    deskGroup.add(deskBall);

    // Desk clock
    const deskClock = new THREE.Group();
    deskClock.position.set(DX - 1.15, DESK_H + 0.04, DZ + 0.35);
    deskGroup.add(deskClock);
    box(0.24, 0.2, 0.09, mat.woodDark, 0, 0.1, 0, deskClock);
    const clockFace = panel(0.18, 0.14, (ctx, w, h) => {
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = Math.max(2, h * 0.08);
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.18);
      ctx.lineTo(w * 0.5, h * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.5);
      ctx.lineTo(w * 0.68, h * 0.6);
      ctx.stroke();
    }, { roughness: 0.5 });
    clockFace.position.set(0, 0.1, 0.05);
    deskClock.add(clockFace);

    // ============================
    // 4. OFFICE CHAIR
    // ============================
    const chairGroup = new THREE.Group();
    chairGroup.name = 'OfficeChair';
    chairGroup.position.set(DX, 0, DZ - 1.05);
    chairGroup.rotation.y = Math.PI;
    root.add(chairGroup);

    box(0.58, 0.14, 0.55, mat.leather, 0, 0.5, 0, chairGroup);
    box(0.54, 0.78, 0.14, mat.leather, 0, 0.95, -0.24, chairGroup);
    box(0.54, 0.24, 0.16, mat.leather, 0, 1.36, -0.26, chairGroup);
    box(0.08, 0.08, 0.46, mat.woodDark, -0.31, 0.7, -0.06, chairGroup);
    box(0.08, 0.08, 0.46, mat.woodDark, 0.31, 0.7, -0.06, chairGroup);
    box(0.07, 0.22, 0.07, mat.metalDark, -0.31, 0.58, -0.06, chairGroup);
    box(0.07, 0.22, 0.07, mat.metalDark, 0.31, 0.58, -0.06, chairGroup);
    cyl(0.05, 0.05, 0.34, mat.metalDark, 0, 0.25, 0, chairGroup, 14);
    for (let s = 0; s < 5; s++) {
      const a = (s / 5) * Math.PI * 2;
      const spoke = box(0.06, 0.05, 0.34, mat.metalDark, Math.sin(a) * 0.17, 0.08, Math.cos(a) * 0.17, chairGroup);
      spoke.rotation.y = a;
      const caster = cyl(0.04, 0.04, 0.03, mat.black, Math.sin(a) * 0.31, 0.04, Math.cos(a) * 0.31, chairGroup, 12);
      caster.rotation.z = Math.PI / 2;
      caster.rotation.y = a;
    }

    // ============================
    // 5. TROPHY CABINET (back wall)
    // ============================
    const cabinetGroup = new THREE.Group();
    cabinetGroup.name = 'TrophyCabinet';
    root.add(cabinetGroup);

    const CAB_X = 4.5;
    const CAB_Z = -4.88;

    box(2.0, 2.1, 0.5, mat.woodDark, CAB_X, 1.05, CAB_Z, cabinetGroup);
    box(1.86, 1.7, 0.42, mat.glass, CAB_X, 1.15, CAB_Z, cabinetGroup, false, false);
    box(2.06, 0.12, 0.56, mat.wood, CAB_X, 2.15, CAB_Z, cabinetGroup);
    box(2.06, 0.12, 0.56, mat.wood, CAB_X, 0.06, CAB_Z, cabinetGroup);
    [0.5, 1.1, 1.7].forEach((sy) => {
      box(1.86, 0.04, 0.42, mat.woodLight, CAB_X, sy, CAB_Z, cabinetGroup);
    });

    const trophySpots = [
      [CAB_X - 0.6, 0.62, 'cup'], [CAB_X, 0.62, 'cup'], [CAB_X + 0.6, 0.62, 'vase'],
      [CAB_X - 0.55, 1.22, 'vase'], [CAB_X + 0.45, 1.22, 'cup'],
      [CAB_X - 0.2, 1.82, 'cup'], [CAB_X + 0.35, 1.82, 'vase'],
    ];
    trophySpots.forEach(([tx, ty, type]) => {
      if (type === 'cup') {
        cyl(0.09, 0.06, 0.2, mat.gold, tx, ty + 0.13, CAB_Z, cabinetGroup, 18);
        cyl(0.13, 0.05, 0.06, mat.gold, tx, ty + 0.26, CAB_Z, cabinetGroup, 18);
        cyl(0.11, 0.11, 0.03, mat.woodDark, tx, ty + 0.015, CAB_Z, cabinetGroup, 18);
        box(0.16, 0.06, 0.09, mat.gold, tx, ty + 0.06, CAB_Z, cabinetGroup);
      } else {
        cyl(0.07, 0.09, 0.26, mat.silver, tx, ty + 0.13, CAB_Z, cabinetGroup, 16);
        cyl(0.11, 0.11, 0.03, mat.woodDark, tx, ty + 0.015, CAB_Z, cabinetGroup, 16);
        box(0.1, 0.05, 0.05, mat.silver, tx, ty + 0.3, CAB_Z, cabinetGroup);
      }
    });

    const plaque = panel(0.8, 0.26, (ctx, w, h) => {
      ctx.fillStyle = '#1d1d1f';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e3c26a';
      ctx.font = `bold ${Math.round(h * 0.45)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OAKHAVEN UNITED', w / 2, h * 0.35);
      ctx.font = `${Math.round(h * 0.28)}px Arial, sans-serif`;
      ctx.fillText('CHAMPIONS 2019 · 2023', w / 2, h * 0.7);
    }, { roughness: 0.5 });
    plaque.position.set(CAB_X, 2.32, CAB_Z + 0.2);
    plaque.rotation.x = -0.5;
    cabinetGroup.add(plaque);

    // ============================
    // 6. BOOKSHELF (back wall)
    // ============================
    const shelfGroup = new THREE.Group();
    shelfGroup.name = 'Bookshelf';
    root.add(shelfGroup);

    const SH_X = -4.6;
    const SH_Z = -4.98;
    const SH_W = 2.4;
    const SH_H = 2.3;
    const SH_D = 0.4;

    box(SH_W, 0.08, SH_D, mat.woodDark, SH_X, 0.04, SH_Z, shelfGroup);
    box(SH_W, SH_H, 0.06, mat.woodDark, SH_X, SH_H / 2, SH_Z - SH_D / 2, shelfGroup);
    box(0.08, SH_H, SH_D, mat.woodDark, SH_X - SH_W / 2, SH_H / 2, SH_Z, shelfGroup);
    box(0.08, SH_H, SH_D, mat.woodDark, SH_X + SH_W / 2, SH_H / 2, SH_Z, shelfGroup);
    box(SH_W, 0.1, SH_D, mat.wood, SH_X, SH_H, SH_Z, shelfGroup);

    const shelfYs = [0.08, 0.62, 1.16, 1.7];
    shelfYs.forEach((sy) => {
      box(SH_W - 0.16, 0.05, SH_D - 0.05, mat.woodLight, SH_X, sy, SH_Z, shelfGroup);
    });

    const bookColors = [0x8c2f2f, 0x2f4f8c, 0x2f6b3d, 0x8c6a2f, 0x4a4a55, 0x7a3f6b, 0x356b74];
    const bookMats = bookColors.map(c => this.createStdMaterial(c, { roughness: 0.8 }));
    let seed = 3;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    shelfYs.forEach((sy, si) => {
      let bx = SH_X - SH_W / 2 + 0.16;
      while (bx < SH_X + SH_W / 2 - 0.28) {
        const w = 0.05 + rand() * 0.06;
        const h = 0.28 + rand() * 0.12;
        const lean = rand() > 0.85;
        const book = box(w, h, 0.26, bookMats[Math.floor(rand() * bookMats.length)], bx + w / 2, sy + h / 2 + 0.03, SH_Z, shelfGroup);
        if (lean) book.rotation.z = 0.16;
        bx += w + 0.012;
        if (rand() > 0.9) bx += 0.1;
      }
      if (si % 2 === 0) {
        box(0.3, 0.06, 0.24, bookMats[si + 1], SH_X + 0.6, sy + 0.06, SH_Z, shelfGroup);
        box(0.28, 0.05, 0.22, bookMats[si + 3], SH_X + 0.62, sy + 0.11, SH_Z, shelfGroup);
      }
    });

    box(0.34, 0.18, 0.18, mat.woodDark, SH_X - 0.7, SH_H + 0.13, SH_Z, shelfGroup);
    cyl(0.05, 0.05, 0.03, mat.metal, SH_X - 0.6, SH_H + 0.13, SH_Z + 0.1, shelfGroup, 14).rotation.x = Math.PI / 2;

    this.wallCull.back.push(cabinetGroup, shelfGroup);

    // ============================
    // 7. WALL ART + FRAMES (back wall)
    // ============================
    const artGroup = new THREE.Group();
    artGroup.name = 'WallArt';
    root.add(artGroup);

    const makeFrame = (w, h, x, y, z, rotY, title, sub, bg, fg) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      artGroup.add(g);

      box(w, h, 0.05, mat.woodDark, 0, 0, 0, g);
      const art = panel(w - 0.1, h - 0.1, (ctx, cw, ch) => {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillRect(0, ch * 0.55, cw, ch * 0.45);
        ctx.fillStyle = fg;
        for (let i = 0; i < 5; i++) {
          const px = cw * (0.16 + i * 0.17);
          ctx.beginPath();
          ctx.arc(px, ch * 0.42, ch * 0.09, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(px - ch * 0.09, ch * 0.5, ch * 0.18, ch * 0.32);
        }
        ctx.fillStyle = fg;
        ctx.font = `bold ${Math.round(ch * 0.13)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(title, cw / 2, ch * 0.14);
        ctx.font = `${Math.round(ch * 0.09)}px Arial, sans-serif`;
        ctx.fillText(sub, cw / 2, ch * 0.93);
      }, { roughness: 0.8 });
      art.position.z = 0.03;
      g.add(art);
      return g;
    };

    makeFrame(1.1, 0.85, -1.9, 2.0, -HALF_D + 0.04, 0, 'THE OAKS', '2023 CHAMPIONS', '#1f6b34', '#f4f1e4');
    makeFrame(0.85, 1.05, -0.1, 1.95, -HALF_D + 0.04, 0, 'FINAL', '2019', '#7d2f36', '#f4f1e4');
    makeFrame(1.3, 0.7, 1.8, 2.05, -HALF_D + 0.04, 0, 'OAKHAVEN UNITED', 'FOUNDED 1954', '#21304f', '#f4f1e4');
    this.wallCull.back.push(artGroup);

    // ============================
    // 8. TACTICS WHITEBOARD (rolling stand)
    // ============================
    const tacticsGroup = new THREE.Group();
    tacticsGroup.name = 'TacticsWhiteboard';
    tacticsGroup.position.set(-4.3, 0, 1.2);
    tacticsGroup.rotation.y = 0.42;
    root.add(tacticsGroup);

    box(2.0, 1.25, 0.07, mat.metalDark, 0, 1.55, 0, tacticsGroup);
    const tacticsTexture = this.makeCanvasTexture(640, 400, (ctx, w, h) => {
      ctx.fillStyle = '#f8f8f4';
      ctx.fillRect(0, 0, w, h);
      const px = w * 0.1;
      const py = h * 0.1;
      const pw = w * 0.8;
      const ph = h * 0.8;
      ctx.fillStyle = '#2f8b45';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(px, py, pw, ph);
      ctx.beginPath();
      ctx.moveTo(px + pw / 2, py);
      ctx.lineTo(px + pw / 2, py + ph);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px + pw / 2, py + ph / 2, ph * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(px, py + ph * 0.22, pw * 0.14, ph * 0.56);
      ctx.strokeRect(px + pw * 0.86, py + ph * 0.22, pw * 0.14, ph * 0.56);
      const spots = [
        [0.5, 0.22], [0.5, 0.4], [0.26, 0.4], [0.74, 0.4],
        [0.2, 0.62], [0.4, 0.62], [0.6, 0.62], [0.8, 0.62],
        [0.38, 0.82], [0.62, 0.82],
      ];
      ctx.fillStyle = '#f2c33c';
      spots.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(px + pw * sx, py + ph * sy, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#c0272d';
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + ph * 0.13, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    const tacticsPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.84, 1.09),
      this.createStdMaterial(0xffffff, { roughness: 0.3, map: tacticsTexture })
    );
    tacticsPanel.position.set(0, 1.55, 0.045);
    tacticsGroup.add(tacticsPanel);
    box(1.6, 0.05, 0.12, mat.metal, 0, 0.86, 0.08, tacticsGroup);
    [-0.85, 0.85].forEach((lx) => {
      box(0.07, 1.0, 0.07, mat.metal, lx, 0.5, 0, tacticsGroup);
      box(0.12, 0.05, 0.5, mat.metalDark, lx, 0.03, 0.1, tacticsGroup);
      const wheel = cyl(0.05, 0.05, 0.04, mat.black, lx, 0.05, 0.32, tacticsGroup, 12);
      wheel.rotation.z = Math.PI / 2;
    });

    // ============================
    // 9. SEATING AREA + RUG
    // ============================
    const loungeGroup = new THREE.Group();
    loungeGroup.name = 'Lounge';
    root.add(loungeGroup);

    box(4.0, 0.02, 3.0, mat.rug, 2.4, 0.012, 2.4, loungeGroup, false, true);
    box(3.4, 0.022, 2.4, mat.rugPattern, 2.4, 0.013, 2.4, loungeGroup, false, true);
    box(3.9, 0.024, 2.9, mat.rug, 2.4, 0.014, 2.4, loungeGroup, false, true);

    const makeArmchair = (px, pz, ry, material) => {
      const g = new THREE.Group();
      g.position.set(px, 0, pz);
      g.rotation.y = ry;
      loungeGroup.add(g);
      box(0.85, 0.18, 0.8, material, 0, 0.42, 0, g);
      box(0.85, 0.72, 0.16, material, 0, 0.78, -0.34, g);
      box(0.16, 0.44, 0.8, material, -0.35, 0.63, 0, g);
      box(0.16, 0.44, 0.8, material, 0.35, 0.63, 0, g);
      box(0.62, 0.1, 0.6, mat.cream, 0, 0.53, 0.02, g);
      [[-0.32, -0.28], [0.32, -0.28], [-0.32, 0.28], [0.32, 0.28]].forEach(([ox, oz]) => {
        cyl(0.035, 0.03, 0.33, mat.woodDark, ox, 0.17, oz, g, 10);
      });
      return g;
    };

    makeArmchair(1.0, 2.6, 2.5, mat.green);
    makeArmchair(4.3, 3.0, -2.2, mat.navy);

    // Coffee table with newspaper and mug
    const coffeeTable = new THREE.Group();
    coffeeTable.position.set(2.7, 0, 2.5);
    loungeGroup.add(coffeeTable);
    box(1.2, 0.06, 0.65, mat.woodLight, 0, 0.44, 0, coffeeTable);
    box(1.1, 0.04, 0.55, mat.wood, 0, 0.4, 0, coffeeTable);
    [[-0.48, -0.24], [0.48, -0.24], [-0.48, 0.24], [0.48, 0.24]].forEach(([ox, oz]) => {
      box(0.06, 0.42, 0.06, mat.woodDark, ox, 0.21, oz, coffeeTable);
    });
    const newspaper = box(0.44, 0.02, 0.32, mat.paper, -0.18, 0.48, 0, coffeeTable);
    newspaper.rotation.y = 0.15;
    cyl(0.05, 0.045, 0.1, mat.white, 0.35, 0.52, 0.08, coffeeTable, 16);

    // Potted plant in the corner
    const plant = new THREE.Group();
    plant.position.set(5.3, 0, 4.2);
    loungeGroup.add(plant);
    cyl(0.28, 0.22, 0.4, mat.terracotta, 0, 0.2, 0, plant, 18);
    cyl(0.26, 0.26, 0.04, this.createStdMaterial(0x4a3524, { roughness: 1 }), 0, 0.4, 0, plant, 18);
    cyl(0.04, 0.05, 0.7, mat.woodDark, 0, 0.7, 0, plant, 10);
    for (let l = 0; l < 7; l++) {
      const a = (l / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat.plantGreen);
      leaf.scale.set(0.5, 0.28, 1);
      leaf.position.set(Math.sin(a) * 0.24, 0.95 + (l % 3) * 0.14, Math.cos(a) * 0.24);
      leaf.rotation.y = a;
      leaf.rotation.z = -0.4;
      leaf.castShadow = true;
      plant.add(leaf);
    }

    // ============================
    // 10. FILING CABINET + COAT STAND
    // ============================
    const storageGroup = new THREE.Group();
    storageGroup.name = 'Storage';
    root.add(storageGroup);

    // Filing cabinet (right wall)
    const filing = new THREE.Group();
    filing.position.set(HALF_W - 0.4, 0, -1.4);
    filing.rotation.y = -Math.PI / 2;
    storageGroup.add(filing);
    box(0.66, 1.55, 0.62, mat.metal, 0, 0.78, 0, filing);
    for (let f = 0; f < 4; f++) {
      const fy = 0.24 + f * 0.36;
      box(0.6, 0.32, 0.03, mat.metalDark, 0, fy, 0.32, filing);
      box(0.22, 0.04, 0.05, mat.metal, 0, fy + 0.1, 0.36, filing);
    }
    box(0.7, 0.05, 0.66, mat.metalDark, 0, 1.58, 0, filing);
    this.wallCull.right.push(filing);

    // Coat stand with the manager's jacket and cap (left wall)
    const stand = new THREE.Group();
    stand.position.set(-HALF_W + 0.45, 0, 1.0);
    storageGroup.add(stand);
    cyl(0.28, 0.3, 0.05, mat.woodDark, 0, 0.025, 0, stand, 18);
    cyl(0.035, 0.035, 1.85, mat.woodDark, 0, 0.95, 0, stand, 12);
    for (let h = 0; h < 4; h++) {
      const a = (h / 4) * Math.PI * 2;
      const hook = cyl(0.02, 0.02, 0.16, mat.metalDark, Math.sin(a) * 0.09, 1.78, Math.cos(a) * 0.09, stand, 8);
      hook.rotation.z = Math.PI / 2;
      hook.rotation.y = a;
    }
    const jacket = new THREE.Group();
    jacket.position.set(0.02, 1.72, 0.08);
    jacket.rotation.y = 0.3;
    stand.add(jacket);
    box(0.42, 0.62, 0.16, mat.navy, 0, -0.34, 0, jacket);
    box(0.16, 0.24, 0.16, mat.navy, -0.24, -0.08, 0, jacket);
    box(0.16, 0.24, 0.16, mat.navy, 0.24, -0.08, 0, jacket);
    const cap = new THREE.Group();
    cap.position.set(0.02, 1.84, 0.1);
    stand.add(cap);
    cyl(0.12, 0.13, 0.09, mat.green, 0, 0, 0, cap, 18);
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.015, 18, 1, false, 0, Math.PI),
      mat.green
    );
    brim.position.set(0, -0.04, 0.07);
    cap.add(brim);
    this.wallCull.left.push(stand);

    // Waste bin
    const bin = new THREE.Group();
    bin.position.set(DX + 1.7, 0, DZ + 0.3);
    storageGroup.add(bin);
    cyl(0.18, 0.15, 0.38, mat.metalDark, 0, 0.19, 0, bin, 16);
    cyl(0.19, 0.19, 0.02, mat.metal, 0, 0.39, 0, bin, 16);
    box(0.14, 0.05, 0.12, mat.paper, 0, 0.42, 0, bin);

    // ============================
    // 11. PENDANT + WALL CLOCK
    // ============================
    const fixtureGroup = new THREE.Group();
    fixtureGroup.name = 'Fixtures';
    root.add(fixtureGroup);

    cyl(0.03, 0.03, 0.6, mat.metalDark, 0, ROOM_H - 0.35, 0, fixtureGroup, 10);
    const pendantShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.34, 0.28, 24, 1, true),
      this.createStdMaterial(0xe6dcc8, { roughness: 0.7, side: THREE.DoubleSide })
    );
    pendantShade.position.set(0, ROOM_H - 0.78, 0);
    pendantShade.castShadow = true;
    fixtureGroup.add(pendantShade);
    const pendantBulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), mat.lamp);
    pendantBulb.position.set(0, ROOM_H - 0.86, 0);
    fixtureGroup.add(pendantBulb);

    // Wall clock (right wall)
    const wallClock = new THREE.Group();
    wallClock.position.set(HALF_W - 0.05, 2.35, 0);
    wallClock.rotation.y = -Math.PI / 2;
    fixtureGroup.add(wallClock);
    cyl(0.3, 0.3, 0.07, mat.woodDark, 0, 0, 0, wallClock, 24).rotation.x = Math.PI / 2;
    const face = panel(0.48, 0.48, (ctx, w, h) => {
      ctx.fillStyle = '#f6f2e7';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#22242a';
      ctx.lineWidth = Math.max(2, w * 0.035);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 + Math.cos(a) * w * 0.4, h / 2 + Math.sin(a) * h * 0.4);
        ctx.lineTo(w / 2 + Math.cos(a) * w * 0.45, h / 2 + Math.sin(a) * h * 0.45);
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(3, w * 0.045);
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2, h * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w * 0.68, h * 0.6);
      ctx.stroke();
    }, { roughness: 0.5 });
    face.position.set(0, 0, 0.04);
    wallClock.add(face);
    this.wallCull.right.push(wallClock);

    // ============================
    // 12. STORE PARTS & FINALIZE
    // ============================
    this.characterParts = {
      shell: shellGroup,
      window: windowGroup,
      windowView: viewGroup,
      desk: deskGroup,
      officeChair: chairGroup,
      trophyCabinet: cabinetGroup,
      bookshelf: shelfGroup,
      wallArt: artGroup,
      tacticsWhiteboard: tacticsGroup,
      lounge: loungeGroup,
      storage: storageGroup,
      fixtures: fixtureGroup,
      floor,
    };

    this.character = root;
    this.scene.add(this.character);
    this.updateWallVisibility();
    return root;
  }

  /* ------------------------------------------------------------------ */
  /*  Animation loop                                                    */
  /* ------------------------------------------------------------------ */

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());

    this.updateWallVisibility();
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
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
              if (m.map) m.map.dispose();
              if (m.gradientMap) m.gradientMap.dispose();
              m.dispose();
            });
          }
        }
      });
    }
    this.character = null;
    this.characterParts = {};
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
  }
}
