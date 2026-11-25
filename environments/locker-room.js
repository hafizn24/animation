import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * LockerRoomApp – Procedural 3D model of a football club locker room
 * belonging to "Buluh FC".
 *
 * Key structures:
 *   1. Room shell – vinyl floor, painted walls with dado, ceiling
 *   2. Locker bank – timber cubbies with doors, vents, numbers and handles
 *   3. Benches, kit hooks, hanging jerseys and shorts
 *   4. Shower area – tiled stalls, dividers, shower heads and drains
 *   5. Wash basins – counter, mirrors, taps and soap dispensers
 *   6. Treatment table with towels, bolster and a medical trolley
 *   7. Tactics whiteboard, notice board, clock and exit sign
 *   8. Drinks station – water cooler, bottle crates
 *   9. Kit bags, ball crate, boots scattered by the benches
 *  10. Ceiling strip lights, coach's armchair and cleaning corner
 *
 * Walls are hidden automatically when the camera moves outside of them so the
 * room can always be inspected from any angle.
 */
export class LockerRoomApp {
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
    this.roomBounds = { halfW: 7.2, halfD: 5.2, height: 3.5 };
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.addLights();
    this.createProceduralCharacter();   // builds the locker room
    this.animate();
    return this;
  }

  /* ------------------------------------------------------------------ */
  /*  Boilerplate (same pattern as existing character apps)              */
  /* ------------------------------------------------------------------ */

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2c3138);   // dim interior backdrop
    this.scene.fog = new THREE.Fog(0x2c3138, 24, 60);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 200);
    this.camera.position.set(5.6, 4.3, 9.4);
    this.homeCamera = [5.6, 4.3, 9.4];
    this.homeTarget = [0, 1.2, -1.4];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.2, -1.4);
    this.controls.maxPolarAngle = Math.PI / 2.05;  // prevent going underground
    this.controls.minDistance = 2;
    this.controls.maxDistance = 32;
  }

  addLights() {
    // Ambient base so the room never goes fully black
    const ambient = new THREE.AmbientLight(0xdfe6ef, 1.0);
    this.scene.add(ambient);

    // Main ceiling wash – shadow caster
    const main = new THREE.DirectionalLight(0xfff3dd, 1.5);
    main.position.set(4, 9, 6);
    main.castShadow = true;
    main.shadow.mapSize.width = 2048;
    main.shadow.mapSize.height = 2048;
    main.shadow.camera.left = -12;
    main.shadow.camera.right = 12;
    main.shadow.camera.top = 12;
    main.shadow.camera.bottom = -12;
    main.shadow.camera.near = 0.5;
    main.shadow.camera.far = 30;
    main.shadow.bias = -0.0004;
    this.scene.add(main);

    // Cool fill from the doorway side
    const fill = new THREE.DirectionalLight(0xa9c4e8, 0.55);
    fill.position.set(-7, 5, 8);
    this.scene.add(fill);

    // Warm bounce off the floor
    const hemi = new THREE.HemisphereLight(0xf3f6ff, 0x4a4f57, 0.6);
    this.scene.add(hemi);

    // Practical strip lights
    const strip1 = new THREE.PointLight(0xfff0d2, 26, 18, 2);
    strip1.position.set(-3.5, 3.1, -2.2);
    this.scene.add(strip1);

    const strip2 = new THREE.PointLight(0xfff0d2, 26, 18, 2);
    strip2.position.set(3.5, 3.1, 2.2);
    this.scene.add(strip2);
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
    root.name = 'LockerRoom';

    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };

    // ============================
    // 0. MATERIALS
    // ============================
    const mat = {
      floor: this.createStdMaterial(0x9ea4a9, { roughness: 0.7, metalness: 0.03 }),
      floorTrim: this.createStdMaterial(0x767c82, { roughness: 0.8 }),
      wall: this.createStdMaterial(0xe4e8ec, { roughness: 0.9 }),
      wallLower: this.createStdMaterial(0x2e4a3c, { roughness: 0.7 }),
      ceiling: this.createStdMaterial(0xf1f3f5, { roughness: 0.95 }),
      wood: this.createStdMaterial(0x9a7b52, { roughness: 0.72 }),
      woodDark: this.createStdMaterial(0x6b5233, { roughness: 0.76 }),
      woodLight: this.createStdMaterial(0xc09a68, { roughness: 0.7 }),
      metal: this.createStdMaterial(0xc4c8cc, { roughness: 0.32, metalness: 0.7 }),
      metalDark: this.createStdMaterial(0x646a70, { roughness: 0.45, metalness: 0.55 }),
      plastic: this.createStdMaterial(0xd9dde0, { roughness: 0.55 }),
      bench: this.createStdMaterial(0xa8804f, { roughness: 0.7 }),
      red: this.createStdMaterial(0xc0272d, { roughness: 0.62 }),
      green: this.createStdMaterial(0x1f7a3a, { roughness: 0.62 }),
      navy: this.createStdMaterial(0x22355e, { roughness: 0.7 }),
      yellow: this.createStdMaterial(0xe3b23c, { roughness: 0.6 }),
      white: this.createStdMaterial(0xf7f7f5, { roughness: 0.78 }),
      black: this.createStdMaterial(0x16181a, { roughness: 0.6 }),
      towel: this.createStdMaterial(0xe2e8ec, { roughness: 0.95 }),
      towelBlue: this.createStdMaterial(0x4a7fb5, { roughness: 0.95 }),
      glass: this.createStdMaterial(0xbcd6e4, {
        roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.26,
        side: THREE.DoubleSide,
      }),
      mirror: this.createStdMaterial(0xbdd3de, { roughness: 0.12, metalness: 0.18 }),
      boardWhite: this.createStdMaterial(0xf7f7f4, { roughness: 0.22 }),
      lamp: this.createStdMaterial(0xffffff, {
        roughness: 0.4, emissive: 0xfff3d6, emissiveIntensity: 1.5,
      }),
      tile: this.createStdMaterial(0xccd6db, { roughness: 0.3 }),
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

    // Text / graphic panel built from a canvas
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

    const ROOM_W = 14.4;
    const ROOM_D = 10.4;
    const ROOM_H = 3.5;
    const HALF_W = ROOM_W / 2;   // 7.2
    const HALF_D = ROOM_D / 2;   // 5.2
    this.roomBounds = { halfW: HALF_W, halfD: HALF_D, height: ROOM_H };

    const DOOR_W = 1.9;
    const DOOR_H = 2.4;

    // Floor
    const floor = box(ROOM_W, 0.12, ROOM_D, mat.floor, 0, -0.06, 0, shellGroup, false, true);

    // Skirting boards
    box(ROOM_W, 0.12, 0.06, mat.floorTrim, 0, 0.06, -HALF_D + 0.03, shellGroup, false, true);
    box(0.06, 0.12, ROOM_D, mat.floorTrim, -HALF_W + 0.03, 0.06, 0, shellGroup, false, true);
    box(0.06, 0.12, ROOM_D, mat.floorTrim, HALF_W - 0.03, 0.06, 0, shellGroup, false, true);

    // Ceiling (hidden when the camera rises above it)
    const ceilingMesh = box(ROOM_W, 0.14, ROOM_D, mat.ceiling, 0, ROOM_H + 0.07, 0, shellGroup, false, true);
    this.wallCull.ceiling.push(ceilingMesh);

    // --- Back wall (locker wall) ---
    const backWall = box(ROOM_W, ROOM_H, 0.22, mat.wall, 0, ROOM_H / 2, -HALF_D - 0.11, shellGroup, false, true);
    const backDado = box(ROOM_W, 1.0, 0.05, mat.wallLower, 0, 0.5, -HALF_D + 0.02, shellGroup, false, true);
    this.wallCull.back.push(backWall, backDado);

    // --- Front wall with a central doorway ---
    const sideW = (ROOM_W - DOOR_W) / 2;
    const frontLeft = box(sideW, ROOM_H, 0.22, mat.wall, -(DOOR_W / 2 + sideW / 2), ROOM_H / 2, HALF_D + 0.11, shellGroup, false, true);
    const frontRight = box(sideW, ROOM_H, 0.22, mat.wall, (DOOR_W / 2 + sideW / 2), ROOM_H / 2, HALF_D + 0.11, shellGroup, false, true);
    const frontLintel = box(DOOR_W, ROOM_H - DOOR_H, 0.22, mat.wall, 0, DOOR_H + (ROOM_H - DOOR_H) / 2, HALF_D + 0.11, shellGroup, false, true);
    const frontDadoLeft = box(sideW, 1.0, 0.05, mat.wallLower, -(DOOR_W / 2 + sideW / 2), 0.5, HALF_D - 0.02, shellGroup, false, true);
    const frontDadoRight = box(sideW, 1.0, 0.05, mat.wallLower, (DOOR_W / 2 + sideW / 2), 0.5, HALF_D - 0.02, shellGroup, false, true);

    // Door frame + open door leaf
    const frameL = box(0.12, DOOR_H + 0.14, 0.28, mat.woodDark, -DOOR_W / 2 - 0.06, (DOOR_H + 0.14) / 2, HALF_D, shellGroup);
    const frameR = box(0.12, DOOR_H + 0.14, 0.28, mat.woodDark, DOOR_W / 2 + 0.06, (DOOR_H + 0.14) / 2, HALF_D, shellGroup);
    const frameTop = box(DOOR_W + 0.24, 0.14, 0.28, mat.woodDark, 0, DOOR_H + 0.07, HALF_D, shellGroup);

    const doorLeaf = new THREE.Group();
    doorLeaf.name = 'Door';
    doorLeaf.position.set(-DOOR_W / 2 + 0.05, 0, HALF_D - 0.02);
    doorLeaf.rotation.y = -0.55;
    shellGroup.add(doorLeaf);
    box(0.06, DOOR_H - 0.05, 0.9, mat.wood, 0.9, (DOOR_H - 0.05) / 2, 0.45, doorLeaf);
    box(0.09, 0.09, 0.16, mat.metal, 0.84, 1.05, 0.86, doorLeaf);

    // Sign above the doorway
    const doorSign = panel(2.0, 0.42, (ctx, w, h) => {
      ctx.fillStyle = '#1a4a30';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#f4f4ef';
      ctx.lineWidth = Math.max(2, h * 0.045);
      ctx.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);
      ctx.fillStyle = '#f4f4ef';
      ctx.font = `bold ${Math.round(h * 0.44)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKER ROOM', w / 2, h * 0.52);
    }, { roughness: 0.8 });
    doorSign.position.set(0, DOOR_H + 0.42, HALF_D - 0.01);
    doorSign.rotation.y = Math.PI;
    shellGroup.add(doorSign);

    this.wallCull.front.push(
      frontLeft, frontRight, frontLintel, frontDadoLeft, frontDadoRight,
      frameL, frameR, frameTop, doorLeaf, doorSign
    );

    // --- Side walls ---
    const leftWall = box(0.22, ROOM_H, ROOM_D, mat.wall, -HALF_W - 0.11, ROOM_H / 2, 0, shellGroup, false, true);
    const leftDado = box(0.05, 1.0, ROOM_D, mat.wallLower, -HALF_W + 0.02, 0.5, 0, shellGroup, false, true);
    this.wallCull.left.push(leftWall, leftDado);

    const rightWall = box(0.22, ROOM_H, ROOM_D, mat.wall, HALF_W + 0.11, ROOM_H / 2, 0, shellGroup, false, true);
    const rightDado = box(0.05, 1.0, ROOM_D, mat.wallLower, HALF_W - 0.02, 0.5, 0, shellGroup, false, true);
    this.wallCull.right.push(rightWall, rightDado);

    // ============================
    // 2. LOCKER BANK
    // ============================
    const lockerGroup = new THREE.Group();
    lockerGroup.name = 'Lockers';
    root.add(lockerGroup);

    const COLS = 10;
    const COL_W = 1.15;
    const COL_GAP = 0.05;
    const COL_PITCH = COL_W + COL_GAP;
    const BANK_W = COLS * COL_PITCH;
    const BANK_X0 = -BANK_W / 2 + COL_W / 2;
    const LOCKER_Z = -HALF_D + 0.3;
    const LOCKER_D = 0.55;
    const LOCKER_H = 2.05;

    const jerseyColors = [mat.red, mat.green, mat.navy, mat.white, mat.yellow];

    for (let i = 0; i < COLS; i++) {
      const cx = BANK_X0 + i * COL_PITCH;
      const colGroup = new THREE.Group();
      colGroup.name = `Locker_${i + 1}`;
      lockerGroup.add(colGroup);

      // Carcass
      box(COL_W, LOCKER_H, LOCKER_D, mat.woodDark, cx, LOCKER_H / 2, LOCKER_Z, colGroup);

      // Two doors (lower + upper)
      const doorW = COL_W - 0.06;
      const doorH = LOCKER_H / 2 - 0.05;
      const doorZ = LOCKER_Z + LOCKER_D / 2 + 0.02;
      box(doorW, doorH, 0.04, mat.wood, cx, doorH / 2 + 0.03, doorZ, colGroup);
      box(doorW, doorH, 0.04, mat.wood, cx, LOCKER_H - doorH / 2 - 0.03, doorZ, colGroup);

      // Handles
      box(0.05, 0.16, 0.06, mat.metal, cx + doorW / 2 - 0.09, 0.62, doorZ + 0.05, colGroup);
      box(0.05, 0.16, 0.06, mat.metal, cx + doorW / 2 - 0.09, LOCKER_H - 0.52, doorZ + 0.05, colGroup);

      // Vent slats on the upper door
      for (let v = 0; v < 3; v++) {
        box(doorW - 0.3, 0.025, 0.03, mat.metalDark, cx, LOCKER_H - 0.16 - v * 0.06, doorZ + 0.03, colGroup);
      }

      // Number plate
      const numPlate = panel(0.26, 0.16, (ctx, w, h) => {
        ctx.fillStyle = '#f2efe6';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#23303f';
        ctx.font = `bold ${Math.round(h * 0.7)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), w / 2, h * 0.55);
      }, { roughness: 0.6 });
      numPlate.position.set(cx - doorW / 2 + 0.16, LOCKER_H - 0.42, doorZ + 0.03);
      colGroup.add(numPlate);

      // Kit hanging inside a few open lockers
      if (i % 3 === 1) {
        const kitMat = jerseyColors[i % jerseyColors.length];
        const kitGroup = new THREE.Group();
        kitGroup.name = `Kit_${i + 1}`;
        kitGroup.position.set(cx, 0, LOCKER_Z - 0.05);
        colGroup.add(kitGroup);

        const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.66, 0.12), kitMat);
        shirt.position.set(0, 1.32, 0);
        shirt.castShadow = true;
        kitGroup.add(shirt);
        box(0.16, 0.26, 0.12, kitMat, -0.32, 1.5, 0, kitGroup);
        box(0.16, 0.26, 0.12, kitMat, 0.32, 1.5, 0, kitGroup);

        const num = panel(0.24, 0.24, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = '#f6f6f2';
          ctx.font = `bold ${Math.round(h * 0.9)}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), w / 2, h * 0.55);
        }, { roughness: 0.6, transparent: true });
        num.position.set(0, 1.32, 0.07);
        kitGroup.add(num);

        box(0.46, 0.3, 0.12, kitMat, 0, 0.86, 0, kitGroup);
        cyl(0.02, 0.02, COL_W - 0.12, mat.metal, 0, 1.72, 0.04, kitGroup, 10).rotation.z = Math.PI / 2;
      }
    }
    this.wallCull.back.push(lockerGroup);

    // ============================
    // 3. BENCHES + BOOTS + KIT BAGS
    // ============================
    const benchGroup = new THREE.Group();
    benchGroup.name = 'Benches';
    root.add(benchGroup);

    const makeBench = (cx, cz, length) => {
      const bench = new THREE.Group();
      bench.position.set(cx, 0, cz);
      benchGroup.add(bench);

      for (let s = 0; s < 4; s++) {
        box(length, 0.07, 0.11, mat.bench, 0, 0.46, -0.18 + s * 0.12, bench);
      }
      const legCount = Math.max(2, Math.round(length / 2.2));
      for (let l = 0; l < legCount; l++) {
        const lx = -length / 2 + 0.35 + (l * (length - 0.7)) / (legCount - 1);
        box(0.06, 0.44, 0.06, mat.metalDark, lx, 0.22, -0.15, bench);
        box(0.06, 0.44, 0.06, mat.metalDark, lx, 0.22, 0.15, bench);
        box(0.06, 0.05, 0.4, mat.metalDark, lx, 0.44, 0, bench);
      }
      return bench;
    };

    makeBench(-3.6, -3.55, 6.2);
    makeBench(3.6, -3.55, 6.2);

    // Towels draped over the benches
    const towelPositions = [
      [-4.6, 0.66, -3.72, 0.2],
      [-2.1, 0.66, -3.38, -0.1],
      [1.4, 0.66, -3.72, 0.35],
      [4.9, 0.66, -3.38, -0.25],
    ];
    towelPositions.forEach(([tx, ty, tz, rot], i) => {
      const towel = box(0.5, 0.42, 0.05, i % 2 ? mat.towel : mat.towelBlue, tx, ty, tz, benchGroup);
      towel.rotation.y = rot;
    });

    // Boots scattered along the floor by the benches
    const bootColors = [mat.black, mat.white, mat.navy, mat.red];
    const bootSpots = [
      [-5.4, -3.0, 0.3], [-5.1, -2.85, -0.2], [-3.9, -2.95, 0.5],
      [-2.3, -3.05, -0.4], [0.4, -3.0, 0.2], [2.6, -2.9, -0.35],
      [5.2, -3.05, 0.45], [5.5, -2.9, -0.15],
    ];
    bootSpots.forEach(([bx, bz, rot], i) => {
      const boot = new THREE.Group();
      boot.position.set(bx, 0, bz);
      boot.rotation.y = rot;
      benchGroup.add(boot);
      box(0.13, 0.11, 0.3, bootColors[i % bootColors.length], 0, 0.055, 0, boot);
      box(0.13, 0.03, 0.3, mat.black, 0, 0.015, 0, boot);
      box(0.1, 0.015, 0.05, mat.white, 0, 0.11, 0.02, boot);
    });

    // Kit bags under the bench
    const bagSpots = [
      [-5.6, -3.0, 0x1f3a5f],
      [3.9, -3.05, 0x8a2f2f],
      [0.9, -2.95, 0x2d5a3a],
    ];
    bagSpots.forEach(([bx, bz, color]) => {
      box(0.62, 0.36, 0.3, this.createStdMaterial(color, { roughness: 0.85 }), bx, 0.18, bz, benchGroup);
      box(0.66, 0.06, 0.1, mat.black, bx, 0.37, bz, benchGroup);
      box(0.1, 0.24, 0.06, mat.black, bx + 0.24, 0.32, bz, benchGroup);
    });

    // ============================
    // 4. SHOWER AREA (right wall)
    // ============================
    const showerGroup = new THREE.Group();
    showerGroup.name = 'Showers';
    root.add(showerGroup);

    const tileTexture = this.makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#d6e0e4';
      ctx.fillRect(0, 0, w, h);
      const cell = w / 8;
      ctx.strokeStyle = '#aab8be';
      ctx.lineWidth = 3;
      for (let r = 0; r <= 8; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cell);
        ctx.lineTo(w, r * cell);
        ctx.stroke();
      }
      for (let c = 0; c <= 8; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cell, 0);
        ctx.lineTo(c * cell, h);
        ctx.stroke();
      }
    });
    const tileMat = this.createStdMaterial(0xffffff, { roughness: 0.3, map: tileTexture });
    const tileWall = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.9), tileMat);
    tileWall.position.set(HALF_W - 0.04, 1.45, 2.0);
    tileWall.rotation.y = -Math.PI / 2;
    tileWall.receiveShadow = true;
    showerGroup.add(tileWall);

    // Shower partitions
    const stallXs = [3.4, 4.7, 6.0];
    stallXs.forEach((sx) => {
      box(0.09, 2.4, 1.7, mat.glass, sx, 1.2, 3.1, showerGroup, false, false);
      box(0.09, 2.4, 0.12, mat.metal, sx, 1.2, 3.95, showerGroup);
    });
    box(2.7, 2.4, 0.08, mat.glass, 4.7, 1.2, 2.25, showerGroup, false, false);
    box(2.8, 0.08, 0.1, mat.metal, 4.7, 2.42, 2.25, showerGroup);

    // Shower heads + risers
    [3.9, 5.2, 6.4].forEach((sx) => {
      cyl(0.035, 0.035, 1.1, mat.metal, sx, 1.55, HALF_D - 0.14, showerGroup, 12);
      const head = cyl(0.13, 0.09, 0.09, mat.metal, sx, 2.12, HALF_D - 0.26, showerGroup, 16);
      head.rotation.x = Math.PI / 5;
      box(0.11, 0.09, 0.09, mat.metalDark, sx, 1.08, HALF_D - 0.2, showerGroup);
    });

    // Drain grates + floor mat
    box(2.8, 0.02, 1.7, mat.floorTrim, 4.7, 0.012, 3.1, showerGroup, false, true);
    [3.9, 5.2, 6.4].forEach((sx) => {
      box(0.5, 0.02, 0.5, mat.metalDark, sx, 0.026, 3.2, showerGroup, false, true);
    });
    this.wallCull.right.push(showerGroup);

    // ============================
    // 5. WASH BASINS (left wall)
    // ============================
    const basinGroup = new THREE.Group();
    basinGroup.name = 'WashBasins';
    root.add(basinGroup);

    const BASIN_Z = [-0.6, 0.5, 1.6];
    box(0.62, 0.1, 3.3, mat.plastic, -HALF_W + 0.33, 0.88, 0.5, basinGroup);
    box(0.6, 0.8, 3.2, mat.woodLight, -HALF_W + 0.32, 0.44, 0.5, basinGroup);

    BASIN_Z.forEach((bz) => {
      const basin = cyl(0.3, 0.26, 0.12, mat.white, -HALF_W + 0.36, 0.92, bz, basinGroup, 24);
      basin.scale.set(1, 1, 0.85);
      cyl(0.3, 0.3, 0.02, mat.white, -HALF_W + 0.36, 0.98, bz, basinGroup, 24);
      cyl(0.028, 0.028, 0.3, mat.metal, -HALF_W + 0.2, 1.1, bz, basinGroup, 12);
      const spout = cyl(0.024, 0.024, 0.24, mat.metal, -HALF_W + 0.3, 1.24, bz, basinGroup, 12);
      spout.rotation.z = Math.PI / 2;
      const mirror = box(0.04, 0.8, 0.62, mat.mirror, -HALF_W + 0.04, 1.62, bz, basinGroup, false, false);
      mirror.receiveShadow = false;
      box(0.09, 0.16, 0.09, mat.white, -HALF_W + 0.06, 1.15, bz + 0.42, basinGroup);
    });
    this.wallCull.left.push(basinGroup);

    // ============================
    // 6. TREATMENT TABLE
    // ============================
    const tableGroup = new THREE.Group();
    tableGroup.name = 'TreatmentTable';
    root.add(tableGroup);

    const TX = 1.4;
    const TZ = 2.2;
    box(0.85, 0.12, 2.0, mat.white, TX, 0.72, TZ, tableGroup);
    box(0.9, 0.16, 0.3, mat.towelBlue, TX, 0.86, TZ - 0.7, tableGroup);
    const bolster = cyl(0.13, 0.13, 0.6, mat.towel, TX, 0.92, TZ - 0.72, tableGroup, 16);
    bolster.rotation.z = Math.PI / 2;
    [[-0.32, -0.8], [0.32, -0.8], [-0.32, 0.8], [0.32, 0.8]].forEach(([ox, oz]) => {
      box(0.06, 0.68, 0.06, mat.metal, TX + ox, 0.34, TZ + oz, tableGroup);
    });
    box(0.78, 0.05, 1.9, mat.metalDark, TX, 0.3, TZ, tableGroup);

    // Trolley with medical kit
    box(0.6, 0.06, 0.4, mat.metal, TX + 0.95, 0.72, TZ + 0.4, tableGroup);
    box(0.6, 0.06, 0.4, mat.metal, TX + 0.95, 0.4, TZ + 0.4, tableGroup);
    [[-0.26, -0.16], [0.26, -0.16], [-0.26, 0.16], [0.26, 0.16]].forEach(([ox, oz]) => {
      cyl(0.03, 0.03, 0.74, mat.metal, TX + 0.95 + ox, 0.37, TZ + 0.4 + oz, tableGroup, 8);
    });
    box(0.3, 0.18, 0.22, mat.white, TX + 0.9, 0.83, TZ + 0.4, tableGroup);
    box(0.2, 0.12, 0.16, mat.red, TX + 1.05, 0.81, TZ + 0.38, tableGroup);

    // ============================
    // 7. WALL FURNITURE
    // ============================
    const artGroup = new THREE.Group();
    artGroup.name = 'WallFurniture';
    root.add(artGroup);

    // Tactics whiteboard – right wall
    const boardGroup = new THREE.Group();
    boardGroup.name = 'TacticsBoard';
    boardGroup.position.set(HALF_W - 0.05, 1.95, -1.2);
    boardGroup.rotation.y = -Math.PI / 2;
    artGroup.add(boardGroup);

    box(2.6, 1.5, 0.07, mat.metalDark, 0, 0, 0, boardGroup);
    const tacticsTexture = this.makeCanvasTexture(768, 448, (ctx, w, h) => {
      ctx.fillStyle = '#f7f7f2';
      ctx.fillRect(0, 0, w, h);
      const px = w * 0.12;
      const py = h * 0.1;
      const pw = w * 0.76;
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
      ctx.arc(px + pw / 2, py + ph / 2, ph * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(px, py + ph * 0.25, pw * 0.12, ph * 0.5);
      ctx.strokeRect(px + pw * 0.88, py + ph * 0.25, pw * 0.12, ph * 0.5);
      const spots = [
        [0.5, 0.2], [0.32, 0.36], [0.68, 0.36], [0.22, 0.55], [0.5, 0.55], [0.78, 0.55],
        [0.28, 0.78], [0.72, 0.78], [0.5, 0.85],
      ];
      ctx.fillStyle = '#f2c33c';
      spots.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(px + pw * sx, py + ph * sy, 7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#c0272d';
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + ph * 0.3, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    const tacticsPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.44, 1.34),
      this.createStdMaterial(0xffffff, { roughness: 0.3, map: tacticsTexture })
    );
    tacticsPanel.position.set(0, 0, 0.04);
    boardGroup.add(tacticsPanel);
    box(2.2, 0.05, 0.12, mat.metal, 0, -0.78, 0.09, boardGroup);

    // Notice board – left wall
    const noticeGroup = new THREE.Group();
    noticeGroup.name = 'NoticeBoard';
    noticeGroup.position.set(-HALF_W + 0.05, 1.9, -3.3);
    noticeGroup.rotation.y = Math.PI / 2;
    artGroup.add(noticeGroup);
    box(1.5, 1.1, 0.06, mat.woodDark, 0, 0, 0, noticeGroup);
    const noticeTexture = this.makeCanvasTexture(448, 320, (ctx, w, h) => {
      ctx.fillStyle = '#b99a63';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f7f4e8';
      ctx.fillRect(w * 0.05, h * 0.08, w * 0.4, h * 0.36);
      ctx.fillRect(w * 0.52, h * 0.08, w * 0.43, h * 0.26);
      ctx.fillRect(w * 0.05, h * 0.54, w * 0.9, h * 0.38);
      ctx.fillStyle = '#3a3a3a';
      ctx.font = `bold ${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText('FIXTURES', w * 0.08, h * 0.2);
      ctx.fillText('SQUAD LIST', w * 0.55, h * 0.2);
      ctx.fillText('MATCH REPORT v BULUH FC', w * 0.08, h * 0.66);
    });
    const noticePanel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.34, 0.96),
      this.createStdMaterial(0xffffff, { roughness: 0.9, map: noticeTexture })
    );
    noticePanel.position.set(0, 0, 0.04);
    noticeGroup.add(noticePanel);

    // Wall clock – left wall
    const clockGroup = new THREE.Group();
    clockGroup.name = 'Clock';
    clockGroup.position.set(-HALF_W + 0.06, 2.45, 2.6);
    clockGroup.rotation.y = Math.PI / 2;
    artGroup.add(clockGroup);
    cyl(0.3, 0.3, 0.06, mat.white, 0, 0, 0, clockGroup, 24).rotation.x = Math.PI / 2;
    cyl(0.26, 0.26, 0.07, mat.black, 0, 0, 0.01, clockGroup, 24).rotation.x = Math.PI / 2;
    box(0.02, 0.16, 0.02, mat.white, 0, 0.08, 0.06, clockGroup);
    const minuteHand = box(0.015, 0.22, 0.015, mat.white, 0.05, 0.05, 0.06, clockGroup);
    minuteHand.rotation.z = -0.4;

    // Exit sign above the door
    const exitSign = panel(0.7, 0.24, (ctx, w, h) => {
      ctx.fillStyle = '#0f8a45';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(h * 0.6)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EXIT', w / 2, h * 0.55);
    }, { roughness: 0.5, emissive: 0x0f8a45, emissiveIntensity: 0.8 });
    exitSign.position.set(0, DOOR_H + 0.92, HALF_D - 0.02);
    exitSign.rotation.y = Math.PI;
    artGroup.add(exitSign);

    this.wallCull.left.push(noticeGroup, clockGroup);
    this.wallCull.right.push(boardGroup);
    this.wallCull.front.push(exitSign);

    // ============================
    // 8. DRINKS STATION
    // ============================
    const drinksGroup = new THREE.Group();
    drinksGroup.name = 'Drinks';
    root.add(drinksGroup);

    const cooler = new THREE.Group();
    cooler.position.set(6.3, 0, -1.9);
    drinksGroup.add(cooler);
    box(0.42, 0.95, 0.42, mat.plastic, 0, 0.48, 0, cooler);
    cyl(0.22, 0.26, 0.5, mat.glass, 0, 1.2, 0, cooler, 20);
    cyl(0.24, 0.24, 0.06, mat.white, 0, 1.46, 0, cooler, 20);
    box(0.06, 0.05, 0.12, mat.red, 0, 0.98, 0.22, cooler);
    box(0.06, 0.05, 0.12, mat.navy, 0, 0.88, 0.22, cooler);

    const crateSpots = [[-6.4, -2.6], [5.9, -2.6], [6.4, -0.6]];
    crateSpots.forEach(([cx, cz], ci) => {
      const crate = new THREE.Group();
      crate.position.set(cx, 0, cz);
      drinksGroup.add(crate);
      box(0.56, 0.26, 0.38, ci % 2 ? mat.red : mat.navy, 0, 0.13, 0, crate);
      for (let b = 0; b < 6; b++) {
        const bx = -0.18 + (b % 3) * 0.18;
        const bz = -0.09 + Math.floor(b / 3) * 0.18;
        cyl(0.055, 0.06, 0.3, mat.white, bx, 0.41, bz, crate, 12);
        cyl(0.03, 0.03, 0.04, ci % 2 ? mat.red : mat.navy, bx, 0.57, bz, crate, 10);
      }
    });

    // ============================
    // 9. BALL CRATE + MATCH BALLS
    // ============================
    const ballGroup = new THREE.Group();
    ballGroup.name = 'Balls';
    root.add(ballGroup);

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
    const ballMat = this.createStdMaterial(0xffffff, { roughness: 0.55, map: ballTexture });

    const crate = new THREE.Group();
    crate.position.set(6.4, 0, 1.0);
    ballGroup.add(crate);
    box(0.7, 0.32, 0.46, mat.woodDark, 0, 0.16, 0, crate);
    box(0.74, 0.05, 0.06, mat.wood, 0, 0.3, -0.22, crate);
    box(0.74, 0.05, 0.06, mat.wood, 0, 0.3, 0.22, crate);
    for (let b = 0; b < 5; b++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), ballMat);
      ball.position.set(-0.22 + (b % 3) * 0.22, 0.38 + Math.floor(b / 3) * 0.19, -0.1 + (b % 2) * 0.2);
      ball.castShadow = true;
      crate.add(ball);
    }

    [[-6.2, 3.6], [5.4, 3.9]].forEach(([bx, bz]) => {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), ballMat);
      ball.position.set(bx, 0.115, bz);
      ball.castShadow = true;
      ballGroup.add(ball);
    });

    // ============================
    // 10. COACH'S CORNER
    // ============================
    const cornerGroup = new THREE.Group();
    cornerGroup.name = 'CoachCorner';
    root.add(cornerGroup);

    const chair = new THREE.Group();
    chair.position.set(-5.4, 0, 3.4);
    chair.rotation.y = 0.7;
    cornerGroup.add(chair);
    box(0.9, 0.16, 0.85, mat.navy, 0, 0.42, 0, chair);
    box(0.9, 0.7, 0.16, mat.navy, 0, 0.75, -0.36, chair);
    box(0.16, 0.45, 0.85, mat.navy, -0.38, 0.62, 0, chair);
    box(0.16, 0.45, 0.85, mat.navy, 0.38, 0.62, 0, chair);
    [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]].forEach(([ox, oz]) => {
      cyl(0.03, 0.03, 0.34, mat.woodDark, ox, 0.17, oz, chair, 10);
    });

    const coffeeTable = new THREE.Group();
    coffeeTable.position.set(-4.0, 0, 4.1);
    cornerGroup.add(coffeeTable);
    box(1.0, 0.06, 0.6, mat.wood, 0, 0.46, 0, coffeeTable);
    [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]].forEach(([ox, oz]) => {
      box(0.05, 0.44, 0.05, mat.metalDark, ox, 0.23, oz, coffeeTable);
    });
    cyl(0.06, 0.055, 0.11, mat.white, -0.2, 0.55, 0.05, coffeeTable, 16);
    box(0.3, 0.02, 0.22, mat.red, 0.2, 0.5, 0, coffeeTable);

    // Mop bucket
    const bucket = new THREE.Group();
    bucket.position.set(-6.5, 0, 4.4);
    cornerGroup.add(bucket);
    cyl(0.24, 0.19, 0.34, mat.yellow, 0, 0.17, 0, bucket, 18);
    cyl(0.21, 0.21, 0.02, mat.towelBlue, 0, 0.3, 0, bucket, 18);
    const mop = cyl(0.025, 0.025, 1.3, mat.woodLight, 0.05, 0.72, 0.06, bucket, 10);
    mop.rotation.z = 0.2;
    cyl(0.07, 0.05, 0.22, mat.towel, 0.18, 0.12, 0.12, bucket, 12);

    // Fire extinguisher – left wall
    const ext = new THREE.Group();
    ext.position.set(-HALF_W + 0.18, 0, 2.9);
    cornerGroup.add(ext);
    cyl(0.09, 0.09, 0.42, mat.red, 0, 0.75, 0, ext, 16);
    cyl(0.03, 0.03, 0.1, mat.metalDark, 0, 1.0, 0, ext, 10);
    box(0.05, 0.03, 0.14, mat.black, 0.05, 0.98, 0, ext);
    this.wallCull.left.push(ext);

    // ============================
    // 11. CEILING LIGHTS
    // ============================
    const lightGroup = new THREE.Group();
    lightGroup.name = 'CeilingLights';
    root.add(lightGroup);

    [[-3.6, -2.2], [3.6, -2.2], [-3.6, 2.2], [3.6, 2.2]].forEach(([lx, lz]) => {
      box(2.6, 0.1, 0.34, mat.metal, lx, ROOM_H - 0.06, lz, lightGroup);
      box(2.4, 0.04, 0.26, mat.lamp, lx, ROOM_H - 0.12, lz, lightGroup, false, false);
    });

    // ============================
    // 12. STORE PARTS & FINALIZE
    // ============================
    this.characterParts = {
      shell: shellGroup,
      lockers: lockerGroup,
      benches: benchGroup,
      showers: showerGroup,
      basins: basinGroup,
      treatmentTable: tableGroup,
      wallFurniture: artGroup,
      drinks: drinksGroup,
      balls: ballGroup,
      coachCorner: cornerGroup,
      ceilingLights: lightGroup,
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
