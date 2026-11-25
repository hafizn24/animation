import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * StadiumApp – Procedural 3D model of a small English non-league football ground
 * inspired by "Buluh FC".
 *
 * Key structures (matching the reference photo):
 *   1. Green football pitch with white line markings
 *   2. Main covered grandstand with brick base, terrace, roof + signage
 *   3. Clubhouse building (left of grandstand)
 *   4. Metal perimeter railing around the pitch
 *   5. Two football goals
 *   6. Scoreboard (far side)
 *   7. Advertising boards along the grandstand
 *   8. Dirt/gravel standing area behind the railings
 *   9. Surrounding grass embankment
 */
export class StadiumApp {
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
  }

  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.addLights();
    this.createProceduralCharacter();   // builds the stadium
    this.animate();
    return this;
  }

  /* ------------------------------------------------------------------ */
  /*  Boilerplate (same pattern as existing character apps)              */
  /* ------------------------------------------------------------------ */

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);   // light sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 80, 200);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    // Bird's-eye-ish view showing the pitch, grandstand and clubhouse complex
    this.camera.position.set(-42, 27, -30);
    this.homeCamera = [-42, 27, -30];
    this.homeTarget = [-8, 2, 27];
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
    this.controls.target.set(-8, 2, 27);
    this.controls.maxPolarAngle = Math.PI / 2.05;  // prevent going underground
    this.controls.minDistance = 10;
    this.controls.maxDistance = 140;
  }

  addLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambient);

    // Sun – low afternoon light from the south-west so the clubhouse and
    // grandstand facades (which face the pitch) are lit
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(-45, 50, -32);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0003;
    this.scene.add(sun);

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0xb0d0ff, 0.6);
    fill.position.set(35, 22, 30);
    this.scene.add(fill);

    // Hemisphere for nice outdoor feeling
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x2d5a27, 0.5);
    this.scene.add(hemi);
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

  /**
   * Builds a CanvasTexture from a 2D drawing callback.
   * @param {number} width  texture width in px
   * @param {number} height texture height in px
   * @param {Function} draw receives (ctx, width, height)
   */
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
  /*  MAIN BUILD                                                        */
  /* ------------------------------------------------------------------ */

  createProceduralCharacter() {
    if (this.character) this.dispose();

    const root = new THREE.Group();
    root.name = 'Stadium';

    // ============================
    // 0. MATERIALS
    // ============================
    const mat = {
      grass:       this.createStdMaterial(0x3a8c3f, { roughness: 0.95 }),
      grassDark:   this.createStdMaterial(0x2d6e31, { roughness: 0.95 }),
      pitchLine:   this.createStdMaterial(0xffffff, { roughness: 0.8 }),
      dirt:        this.createStdMaterial(0x9e8a6e, { roughness: 1.0 }),
      brick:       this.createStdMaterial(0x8b4513, { roughness: 0.9 }),
      brickDark:   this.createStdMaterial(0x6b3410, { roughness: 0.9 }),
      concrete:    this.createStdMaterial(0xa8a8a8, { roughness: 0.85 }),
      concreteDark:this.createStdMaterial(0x808080, { roughness: 0.85 }),
      metal:       this.createStdMaterial(0xcccccc, { roughness: 0.3, metalness: 0.7 }),
      metalRail:   this.createStdMaterial(0xdddddd, { roughness: 0.4, metalness: 0.6 }),
      roofWhite:   this.createStdMaterial(0xe8e8e8, { roughness: 0.5, metalness: 0.2 }),
      roofUnder:   this.createStdMaterial(0x888888, { roughness: 0.6 }),
      signWhite:   this.createStdMaterial(0xf5f5f0, { roughness: 0.6 }),
      signGreen:   this.createStdMaterial(0x1a6b1a, { roughness: 0.7 }),
      wood:        this.createStdMaterial(0x8B7355, { roughness: 0.8 }),
      woodDark:    this.createStdMaterial(0x5c4a32, { roughness: 0.85 }),
      goalNet:     this.createStdMaterial(0xf4f4f4, {
        roughness: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      }),
      goalNetBacking: this.createStdMaterial(0xffffff, {
        roughness: 0.95,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide
      }),
      goalPost:    this.createStdMaterial(0xffffff, { roughness: 0.25, metalness: 0.1 }),
      goalBaseBar: this.createStdMaterial(0xdddddd, { roughness: 0.4, metalness: 0.3 }),
      goalTension: this.createStdMaterial(0x222222, { roughness: 0.6, metalness: 0.5 }),
      fence:       this.createStdMaterial(0xd0d0d0, { roughness: 0.5, metalness: 0.5 }),
      seat:        this.createStdMaterial(0x4a90d9, { roughness: 0.6 }),
      adBoard:     this.createStdMaterial(0xffffff, { roughness: 0.5 }),
      adBoardBlue: this.createStdMaterial(0x1a3a6b, { roughness: 0.5 }),
      scoreboard:  this.createStdMaterial(0x222222, { roughness: 0.5 }),
      red:         this.createStdMaterial(0xcc2222, { roughness: 0.7 }),
      windowGlass: this.createStdMaterial(0x6699cc, { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.5 }),
      officeGlass: this.createStdMaterial(0xffe0aa, {
        roughness: 0.15, metalness: 0.1, emissive: 0xffcf85, emissiveIntensity: 0.55,
        transparent: true, opacity: 0.85,
      }),
      lampGlass:   this.createStdMaterial(0xffffff, {
        roughness: 0.25, emissive: 0xfff6dd, emissiveIntensity: 2.4,
      }),
      tarmac:      this.createStdMaterial(0x3c3f42, { roughness: 0.95 }),
      gravel:      this.createStdMaterial(0x8d8578, { roughness: 1.0 }),
      black:       this.createStdMaterial(0x111111),
    };

    // Players' tunnel – cut through the far touchline railing, north-west side
    const tunnelX = -29.5;
    const TUNNEL_GAP = 4.4;

    // Pitch dimensions (roughly to non-league scale, in meters)
    const pitchW = 64;   // width (touchline)
    const pitchH = 100;  // length (goal line to goal line)
    const pitchY = 0.01;

    // ============================
    // 1. GROUND & SURROUNDING AREA
    // ============================

    // Large ground plane (surrounding grass)
    const groundGeom = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeom, mat.grassDark);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    root.add(ground);

    // Dirt pathway around pitch
    const dirtGeom = new THREE.PlaneGeometry(pitchW + 8, pitchH + 8);
    const dirtPlane = new THREE.Mesh(dirtGeom, mat.dirt);
    dirtPlane.rotation.x = -Math.PI / 2;
    dirtPlane.position.y = -0.02;
    dirtPlane.receiveShadow = true;
    root.add(dirtPlane);

    // Pitch surface
    const pitchGeom = new THREE.PlaneGeometry(pitchW, pitchH);
    const pitchPlane = new THREE.Mesh(pitchGeom, mat.grass);
    pitchPlane.rotation.x = -Math.PI / 2;
    pitchPlane.position.y = pitchY;
    pitchPlane.receiveShadow = true;
    root.add(pitchPlane);

    // Mowing stripes (alternating lighter/darker bands)
    const stripeCount = 12;
    const stripeW = pitchH / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) continue;  // skip every other
      const sg = new THREE.PlaneGeometry(pitchW - 0.5, stripeW - 0.3);
      const sm = new THREE.Mesh(sg, this.createStdMaterial(0x44a048, { roughness: 0.95 }));
      sm.rotation.x = -Math.PI / 2;
      sm.position.y = pitchY + 0.005;
      sm.position.z = -pitchH / 2 + stripeW * i + stripeW / 2;
      sm.receiveShadow = true;
      root.add(sm);
    }

    // ============================
    // 2. PITCH LINE MARKINGS
    // ============================
    const lineThick = 0.12;
    const lineY = pitchY + 0.015;
    const halfW = pitchW / 2;
    const halfH = pitchH / 2;

    const addLine = (x, z, w, h) => {
      const g = new THREE.PlaneGeometry(w, h);
      const m = new THREE.Mesh(g, mat.pitchLine);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, lineY, z);
      m.receiveShadow = true;
      root.add(m);
    };

    // Touchlines (long sides)
    addLine(0, -halfH, pitchW, lineThick);
    addLine(0, halfH, pitchW, lineThick);
    // Goal lines (short sides)
    addLine(-halfW, 0, lineThick, pitchH);
    addLine(halfW, 0, lineThick, pitchH);
    // Halfway line
    addLine(0, 0, pitchW, lineThick);

    // Centre circle
    const circleGeom = new THREE.RingGeometry(9.15 - lineThick / 2, 9.15 + lineThick / 2, 64);
    const circle = new THREE.Mesh(circleGeom, mat.pitchLine);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = lineY;
    circle.receiveShadow = true;
    root.add(circle);

    // Centre spot
    const spotGeom = new THREE.CircleGeometry(0.3, 16);
    const spot = new THREE.Mesh(spotGeom, mat.pitchLine);
    spot.rotation.x = -Math.PI / 2;
    spot.position.y = lineY;
    root.add(spot);

    // Penalty areas (both ends)
    const penW = 40.3;   // width of penalty area
    const penD = 16.5;   // depth
    const sixW = 18.3;
    const sixD = 5.5;

    [1, -1].forEach(side => {
      const pz = side * halfH;
      const dir = -side;  // inward direction

      // Penalty area box
      addLine(0, pz + dir * penD / 2, penW, lineThick);    // far line
      addLine(-penW / 2, pz + dir * penD / 2, lineThick, penD);  // left
      addLine(penW / 2, pz + dir * penD / 2, lineThick, penD);   // right

      // 6-yard box
      addLine(0, pz + dir * sixD / 2, sixW, lineThick);
      addLine(-sixW / 2, pz + dir * sixD / 2, lineThick, sixD);
      addLine(sixW / 2, pz + dir * sixD / 2, lineThick, sixD);

      // Penalty spot
      const ps = new THREE.Mesh(spotGeom, mat.pitchLine);
      ps.rotation.x = -Math.PI / 2;
      ps.position.set(0, lineY, pz + dir * 11);
      root.add(ps);

      // Penalty arc
      const arcGeom = new THREE.RingGeometry(9.15 - lineThick / 2, 9.15 + lineThick / 2, 32,
        1, side > 0 ? Math.PI * 0.62 : -Math.PI * 0.38, Math.PI * 0.38 * 2);
      const arcMesh = new THREE.Mesh(arcGeom, mat.pitchLine);
      arcMesh.rotation.x = -Math.PI / 2;
      arcMesh.position.set(0, lineY, pz + dir * 11);
      root.add(arcMesh);
    });

    // Corner arcs
    const cornerR = 1;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([cx, cz]) => {
      const startAngle = (cx > 0 ? (cz > 0 ? Math.PI : Math.PI / 2) : (cz > 0 ? -Math.PI / 2 : 0));
      const cGeom = new THREE.RingGeometry(cornerR - lineThick / 2, cornerR + lineThick / 2, 16,
        1, startAngle, Math.PI / 2);
      const cMesh = new THREE.Mesh(cGeom, mat.pitchLine);
      cMesh.rotation.x = -Math.PI / 2;
      cMesh.position.set(cx * halfW, lineY, cz * halfH);
      root.add(cMesh);
    });

    // ============================
    // 3. PERIMETER RAILING
    // ============================
    const railHeight = 1.1;
    const railOffset = 2.5;   // distance from pitch edge

    const createRailingSegment = (startX, startZ, endX, endZ) => {
      const dx = endX - startX;
      const dz = endZ - startZ;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const railGroup = new THREE.Group();

      // Posts
      const postCount = Math.max(2, Math.floor(length / 2.5));
      const postGeom = new THREE.CylinderGeometry(0.03, 0.03, railHeight, 8);
      for (let i = 0; i <= postCount; i++) {
        const t = i / postCount;
        const post = new THREE.Mesh(postGeom, mat.metalRail);
        post.position.set(
          startX + dx * t,
          railHeight / 2,
          startZ + dz * t
        );
        post.castShadow = true;
        railGroup.add(post);
      }

      // Horizontal rails (top and middle)
      [railHeight * 0.95, railHeight * 0.5, railHeight * 0.15].forEach(h => {
        const barGeom = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
        const bar = new THREE.Mesh(barGeom, mat.metalRail);
        bar.position.set(
          (startX + endX) / 2,
          h,
          (startZ + endZ) / 2
        );
        bar.rotation.z = Math.PI / 2;
        bar.rotation.y = -angle;
        // Actually rotate to align with the segment direction
        const quat = new THREE.Quaternion();
        const dir = new THREE.Vector3(dx, 0, dz).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, dir).normalize();
        bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        bar.castShadow = true;
        railGroup.add(bar);
      });

      root.add(railGroup);
    };

    // Near touchline (front, facing viewer in the photo – south side)
    createRailingSegment(-halfW - railOffset, -halfH - railOffset, halfW + railOffset, -halfH - railOffset);
    // Far touchline (split to leave a gap for the players' tunnel)
    createRailingSegment(-halfW - railOffset, halfH + railOffset, tunnelX - TUNNEL_GAP / 2, halfH + railOffset);
    createRailingSegment(tunnelX + TUNNEL_GAP / 2, halfH + railOffset, halfW + railOffset, halfH + railOffset);
    // Left goal line
    createRailingSegment(-halfW - railOffset, -halfH - railOffset, -halfW - railOffset, halfH + railOffset);
    // Right goal line
    createRailingSegment(halfW + railOffset, -halfH - railOffset, halfW + railOffset, halfH + railOffset);

    // ============================
    // 4. FOOTBALL GOALS
    // ============================
    const createGoal = (zPos, facingDir) => {
      const goalGroup = new THREE.Group();
      goalGroup.name = `Goal_${facingDir > 0 ? 'North' : 'South'}`;

      // Standard regulation dimensions
      const goalW = 7.32;   // width between inside of posts
      const goalH = 2.44;   // height to underside of crossbar
      const goalTopD = 0.8; // top roof net depth
      const goalBotD = 2.0; // bottom ground depth
      const postR = 0.06;   // 12cm regulation diameter (radius = 0.06m)
      const stanchionR = 0.035; // rear tension stanchion pipe
      const frameR = 0.03;      // ground and support frame tubes

      // Helper to add a cylinder bar between two 3D points
      const addBar = (p1, p2, radius, material, parent = goalGroup, castShadow = true) => {
        const v1 = new THREE.Vector3(...p1);
        const v2 = new THREE.Vector3(...p2);
        const dir = new THREE.Vector3().subVectors(v2, v1);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

        const geom = new THREE.CylinderGeometry(radius, radius, len, 16);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.copy(mid);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        mesh.castShadow = castShadow;
        parent.add(mesh);
        return mesh;
      };

      // 4.1 White Main Frame: Uprights & Crossbar & Elbow Joints
      [-1, 1].forEach(side => {
        const x = side * (goalW / 2);
        // Upright post
        const uprightGeom = new THREE.CylinderGeometry(postR, postR, goalH, 20);
        const upright = new THREE.Mesh(uprightGeom, mat.goalPost);
        upright.position.set(x, goalH / 2, 0);
        upright.castShadow = true;
        goalGroup.add(upright);

        // Ground socket base collar
        const collarGeom = new THREE.CylinderGeometry(postR * 1.35, postR * 1.35, 0.08, 16);
        const collar = new THREE.Mesh(collarGeom, mat.goalBaseBar);
        collar.position.set(x, 0.04, 0);
        collar.castShadow = true;
        goalGroup.add(collar);

        // Top corner elbow sphere
        const cornerSphere = new THREE.Mesh(
          new THREE.SphereGeometry(postR * 1.02, 16, 16),
          mat.goalPost
        );
        cornerSphere.position.set(x, goalH, 0);
        goalGroup.add(cornerSphere);
      });

      // Crossbar
      const crossGeom = new THREE.CylinderGeometry(postR, postR, goalW, 20);
      const crossbar = new THREE.Mesh(crossGeom, mat.goalPost);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, goalH, 0);
      crossbar.castShadow = true;
      goalGroup.add(crossbar);

      // 4.2 Rear Ground Frame & Bottom Net Bars
      // Left and right bottom ground bars
      [-1, 1].forEach(side => {
        const x = side * (goalW / 2);
        addBar([x, 0.03, 0], [x, 0.03, facingDir * goalBotD], frameR, mat.goalBaseBar);
      });
      // Back ground spreader bar
      addBar(
        [-goalW / 2, 0.03, facingDir * goalBotD],
        [goalW / 2, 0.03, facingDir * goalBotD],
        frameR,
        mat.goalBaseBar
      );

      // 4.3 Stanchion Net Supports (modern continental elbow / angled back posts)
      [-1, 1].forEach(side => {
        const x = side * (goalW / 2 + 0.15); // slightly outside the posts for real tensioning
        // Top horizontal roof brace from post back
        addBar(
          [side * (goalW / 2), goalH, 0],
          [x, goalH - 0.05, facingDir * goalTopD],
          stanchionR * 0.8,
          mat.goalBaseBar
        );

        // Angled stanchion pipe going down to the ground behind the net
        addBar(
          [x, goalH - 0.05, facingDir * goalTopD],
          [x, 0.02, facingDir * (goalBotD + 0.4)],
          stanchionR,
          mat.goalTension
        );

        // Ground anchor peg
        const peg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12),
          mat.black
        );
        peg.position.set(x, 0.06, facingDir * (goalBotD + 0.4));
        goalGroup.add(peg);
      });

      // Rear top horizontal tension cable/bar across the roof edge
      addBar(
        [-goalW / 2, goalH - 0.05, facingDir * goalTopD],
        [goalW / 2, goalH - 0.05, facingDir * goalTopD],
        0.015,
        mat.goalTension
      );

      // 4.4 Realistic Box-Continental Netting (Top roof, Sloping back, Sides)
      // Top roof net plane (from crossbar back to goalTopD)
      const topNetGeom = new THREE.PlaneGeometry(goalW, goalTopD, 24, 6);
      const topNetWire = new THREE.Mesh(topNetGeom, mat.goalNet);
      topNetWire.rotation.x = -Math.PI / 2;
      topNetWire.position.set(0, goalH, facingDir * (goalTopD / 2));
      goalGroup.add(topNetWire);

      const topNetBacking = new THREE.Mesh(topNetGeom, mat.goalNetBacking);
      topNetBacking.rotation.x = -Math.PI / 2;
      topNetBacking.position.set(0, goalH, facingDir * (goalTopD / 2));
      goalGroup.add(topNetBacking);

      // Back net: runs from (y=goalH, z=goalTopD) down to (y=0, z=goalBotD)
      const backDz = goalBotD - goalTopD;
      const backDy = goalH;
      const backHypot = Math.sqrt(backDz * backDz + backDy * backDy);
      const backAngle = Math.atan2(backDz, backDy); // angle tilted back from vertical

      const backNetGeom = new THREE.PlaneGeometry(goalW, backHypot, 24, 16);
      const backNetWire = new THREE.Mesh(backNetGeom, mat.goalNet);
      backNetWire.position.set(0, goalH / 2, facingDir * (goalTopD + backDz / 2));
      backNetWire.rotation.x = (facingDir > 0 ? -1 : 1) * backAngle;
      goalGroup.add(backNetWire);

      const backNetBacking = new THREE.Mesh(backNetGeom, mat.goalNetBacking);
      backNetBacking.position.set(0, goalH / 2, facingDir * (goalTopD + backDz / 2));
      backNetBacking.rotation.x = (facingDir > 0 ? -1 : 1) * backAngle;
      goalGroup.add(backNetBacking);

      // Side nets (trapezoid: upright front y=0..goalH, flat top roof z=0..goalTopD, slope down to z=goalBotD at y=0)
      [-1, 1].forEach(side => {
        const sideShape = new THREE.Shape();
        sideShape.moveTo(0, 0);
        sideShape.lineTo(0, goalH);
        sideShape.lineTo(goalTopD, goalH);
        sideShape.lineTo(goalBotD, 0);
        sideShape.closePath();

        const sideGeom = new THREE.ShapeGeometry(sideShape);
        const sideNetWire = new THREE.Mesh(sideGeom, mat.goalNet);
        sideNetWire.position.set(side * (goalW / 2), 0, 0);
        sideNetWire.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (facingDir < 0) sideNetWire.rotation.y += Math.PI;
        goalGroup.add(sideNetWire);

        const sideNetBacking = new THREE.Mesh(sideGeom, mat.goalNetBacking);
        sideNetBacking.position.set(side * (goalW / 2), 0, 0);
        sideNetBacking.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (facingDir < 0) sideNetBacking.rotation.y += Math.PI;
        goalGroup.add(sideNetBacking);
      });

      goalGroup.position.set(0, 0, zPos);
      root.add(goalGroup);
    };

    createGoal(-halfH, -1);
    createGoal(halfH, 1);

    // ============================
    // 5. MAIN GRANDSTAND (far touchline – north side)
    // ============================
    const standGroup = new THREE.Group();
    const standZ = halfH + railOffset + 3;   // behind the far railing
    const standLength = 36;
    const standHeight = 5;

    // Brick base / terrace wall
    const baseGeom = new THREE.BoxGeometry(standLength, 3, 4);
    const baseMesh = new THREE.Mesh(baseGeom, mat.brick);
    baseMesh.position.set(0, 1.5, standZ);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    standGroup.add(baseMesh);

    // Brick detail strips
    for (let i = 0; i < 3; i++) {
      const stripGeom = new THREE.BoxGeometry(standLength + 0.1, 0.08, 4.05);
      const strip = new THREE.Mesh(stripGeom, mat.brickDark);
      strip.position.set(0, 0.7 + i * 0.9, standZ);
      standGroup.add(strip);
    }

    // Concrete terrace steps (standing area)
    for (let step = 0; step < 4; step++) {
      const stepGeom = new THREE.BoxGeometry(standLength - 1, 0.25, 0.8);
      const stepMesh = new THREE.Mesh(stepGeom, mat.concrete);
      stepMesh.position.set(0, 3.0 + step * 0.25, standZ - 1.5 + step * 0.8);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      standGroup.add(stepMesh);
    }

    // Concrete back wall of terrace
    const backWallGeom = new THREE.BoxGeometry(standLength, standHeight - 1, 0.3);
    const backWall = new THREE.Mesh(backWallGeom, mat.concrete);
    backWall.position.set(0, (standHeight - 1) / 2 + 1, standZ + 2.3);
    backWall.castShadow = true;
    standGroup.add(backWall);

    // Roof structure
    const roofGroup = new THREE.Group();

    // Roof support pillars (steel columns)
    const pillarCount = 8;
    const pillarSpacing = standLength / (pillarCount - 1);
    const pillarGeom = new THREE.BoxGeometry(0.15, standHeight + 1.5, 0.15);
    for (let i = 0; i < pillarCount; i++) {
      const pillar = new THREE.Mesh(pillarGeom, mat.metal);
      pillar.position.set(
        -standLength / 2 + i * pillarSpacing,
        (standHeight + 1.5) / 2,
        standZ - 1.6
      );
      pillar.castShadow = true;
      roofGroup.add(pillar);
    }

    // Roof panel (angled slightly back)
    const roofGeom = new THREE.BoxGeometry(standLength + 2, 0.15, 6);
    const roofTop = new THREE.Mesh(roofGeom, mat.roofWhite);
    roofTop.position.set(0, standHeight + 1.3, standZ + 0.5);
    roofTop.rotation.x = 0.06;  // slight angle for drainage
    roofTop.castShadow = true;
    roofTop.receiveShadow = true;
    roofGroup.add(roofTop);

    // Roof underside
    const roofUnderGeom = new THREE.BoxGeometry(standLength + 1.8, 0.08, 5.8);
    const roofUnder = new THREE.Mesh(roofUnderGeom, mat.roofUnder);
    roofUnder.position.set(0, standHeight + 1.15, standZ + 0.5);
    roofUnder.rotation.x = 0.06;
    roofGroup.add(roofUnder);

    // Fascia board at front of roof
    const fasciaGeom = new THREE.BoxGeometry(standLength + 2, 1.2, 0.12);
    const fascia = new THREE.Mesh(fasciaGeom, mat.signWhite);
    fascia.position.set(0, standHeight + 0.85, standZ - 2.3);
    fascia.castShadow = true;
    roofGroup.add(fascia);

    // Sign text background (green band)
    const signBgGeom = new THREE.BoxGeometry(standLength, 0.8, 0.14);
    const signBg = new THREE.Mesh(signBgGeom, mat.signGreen);
    signBg.position.set(0, standHeight + 0.85, standZ - 2.35);
    roofGroup.add(signBg);

    // Text on the sign - create via canvas texture
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d');
    signCtx.fillStyle = '#1a6b1a';
    signCtx.fillRect(0, 0, 1024, 128);
    signCtx.fillStyle = '#ffffff';
    signCtx.font = 'bold 64px Arial, sans-serif';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.fillText('BULUH FC', 512, 64);
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;

    const signLabelGeom = new THREE.PlaneGeometry(standLength - 2, 0.7);
    const signLabelMat = this.createStdMaterial(0xffffff);
    signLabelMat.map = signTexture;
    const signLabel = new THREE.Mesh(signLabelGeom, signLabelMat);
    signLabel.position.set(0, standHeight + 0.85, standZ - 2.44);
    signLabel.rotation.y = Math.PI;   // face the pitch
    roofGroup.add(signLabel);

    standGroup.add(roofGroup);

    // Railing in front of terrace
    const terraceRailGeom = new THREE.CylinderGeometry(0.025, 0.025, standLength, 8);
    [3.2, 3.6, 4.0].forEach(h => {
      const tRail = new THREE.Mesh(terraceRailGeom, mat.metalRail);
      tRail.rotation.z = Math.PI / 2;
      tRail.position.set(0, h, standZ - 1.8);
      standGroup.add(tRail);
    });

    root.add(standGroup);

    // ============================
    // 6. CLUBHOUSE COMPLEX
    //    Two-storey clubhouse with the manager's office overlooking the
    //    pitch, a single storey locker-room wing and the players' tunnel.
    // ============================
    const clubGroup = new THREE.Group();
    clubGroup.name = 'Clubhouse';
    const clubX = -standLength / 2 - 8;    // -26
    const clubZ = standZ + 4;              // 59.5

    const CLUB_W = 15;      // along X
    const CLUB_D = 5.5;     // along Z
    const CLUB_H = 3.8;     // ground storey
    const OFFICE_H = 3.2;   // upper storey – manager's office
    const clubFrontZ = clubZ - CLUB_D / 2;

    // --- Ground storey ---
    const clubBody = new THREE.Mesh(new THREE.BoxGeometry(CLUB_W, CLUB_H, CLUB_D), mat.brick);
    clubBody.position.set(clubX, CLUB_H / 2, clubZ);
    clubBody.castShadow = true;
    clubBody.receiveShadow = true;
    clubGroup.add(clubBody);

    // Stone plinth around the base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(CLUB_W + 0.3, 0.5, CLUB_D + 0.3), mat.concreteDark);
    plinth.position.set(clubX, 0.25, clubZ);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    clubGroup.add(plinth);

    // --- Upper storey – manager's office (set back to leave a balcony) ---
    const OFFICE_W = CLUB_W - 1.5;
    const OFFICE_D = CLUB_D - 0.8;
    const officeBlock = new THREE.Mesh(new THREE.BoxGeometry(OFFICE_W, OFFICE_H, OFFICE_D), mat.brick);
    officeBlock.position.set(clubX + 0.4, CLUB_H + OFFICE_H / 2, clubZ + 0.4);
    officeBlock.castShadow = true;
    officeBlock.receiveShadow = true;
    clubGroup.add(officeBlock);

    // Office string course
    const stringCourse = new THREE.Mesh(
      new THREE.BoxGeometry(CLUB_W + 0.2, 0.16, CLUB_D + 0.2),
      mat.concrete
    );
    stringCourse.position.set(clubX, CLUB_H - 0.08, clubZ);
    clubGroup.add(stringCourse);

    // --- Pitched roof over the office block ---
    const ridgeY = CLUB_H + OFFICE_H + 1.7;
    const officeFrontZ = clubZ + 0.4 - OFFICE_D / 2;
    const officeBackZ = clubZ + 0.4 + OFFICE_D / 2;
    const slope = Math.sqrt(Math.pow(OFFICE_D / 2, 2) + Math.pow(1.7, 2));
    const roofAngle = Math.atan2(1.7, OFFICE_D / 2);

    const roofFront = new THREE.Mesh(
      new THREE.BoxGeometry(OFFICE_W + 0.7, 0.22, slope),
      mat.brickDark
    );
    roofFront.position.set(clubX + 0.4, CLUB_H + OFFICE_H + 0.85, officeFrontZ + OFFICE_D / 4);
    roofFront.rotation.x = -roofAngle;
    roofFront.castShadow = true;
    clubGroup.add(roofFront);

    const roofBack = new THREE.Mesh(
      new THREE.BoxGeometry(OFFICE_W + 0.7, 0.22, slope),
      mat.brickDark
    );
    roofBack.position.set(clubX + 0.4, CLUB_H + OFFICE_H + 0.85, officeBackZ - OFFICE_D / 4);
    roofBack.rotation.x = roofAngle;
    roofBack.castShadow = true;
    clubGroup.add(roofBack);

    const ridgeCap = new THREE.Mesh(
      new THREE.BoxGeometry(OFFICE_W + 0.9, 0.18, 0.45),
      mat.concreteDark
    );
    ridgeCap.position.set(clubX + 0.4, ridgeY + 0.06, clubZ + 0.4);
    ridgeCap.castShadow = true;
    clubGroup.add(ridgeCap);

    // Gable end walls
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-OFFICE_D / 2, 0);
    gableShape.lineTo(OFFICE_D / 2, 0);
    gableShape.lineTo(0, 1.7);
    gableShape.closePath();
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: 0.3, bevelEnabled: false });
    [-1, 1].forEach(side => {
      const gable = new THREE.Mesh(gableGeom, mat.brick);
      gable.rotation.y = Math.PI / 2;
      gable.position.set(clubX + 0.4 + side * (OFFICE_W / 2) - (side > 0 ? 0 : 0.3), CLUB_H + OFFICE_H, clubZ + 0.4);
      gable.castShadow = true;
      clubGroup.add(gable);
    });

    // --- Manager's office bay window ---
    const bayZ = officeFrontZ;
    const bay = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.9, 0.6), mat.brick);
    bay.position.set(clubX + 0.4, CLUB_H + 1.35, bayZ - 0.3);
    bay.castShadow = true;
    clubGroup.add(bay);

    [-2.9, 0, 2.9].forEach(dx => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 0.08), mat.concrete);
      frame.position.set(clubX + 0.4 + dx, CLUB_H + 1.35, bayZ - 0.62);
      clubGroup.add(frame);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mat.officeGlass);
      glass.position.set(clubX + 0.4 + dx, CLUB_H + 1.35, bayZ - 0.67);
      glass.rotation.y = Math.PI;      // face the pitch
      clubGroup.add(glass);

      // Window mullion
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.1), mat.concrete);
      mullion.position.set(clubX + 0.4 + dx, CLUB_H + 1.35, bayZ - 0.68);
      clubGroup.add(mullion);
    });

    // Balcony in front of the office
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.18, 1.4), mat.concrete);
    balcony.position.set(clubX + 0.4, CLUB_H - 0.09, bayZ - 0.7);
    balcony.castShadow = true;
    balcony.receiveShadow = true;
    clubGroup.add(balcony);

    // Balcony railings
    const railGroup = new THREE.Group();
    const railY = CLUB_H + 0.55;
    const railFrontZ = bayZ - 1.38;
    [-1, 1].forEach(side => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 8.8, 8), mat.metalRail);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(clubX + 0.4, railY, railFrontZ);
      railGroup.add(rail);

      const sideRail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8), mat.metalRail);
      sideRail.rotation.x = Math.PI / 2;
      sideRail.position.set(clubX + 0.4 + side * 4.35, railY, bayZ - 0.7);
      railGroup.add(sideRail);

      for (let p = 0; p <= 6; p++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), mat.metalRail);
        post.position.set(clubX + 0.4 - 4.35 + p * (8.7 / 6), CLUB_H + 0.42, railFrontZ);
        railGroup.add(post);
      }
    });
    clubGroup.add(railGroup);

    // Balcony sign board
    const officeSignTex = this.makeCanvasTexture(1024, 128, (ctx, w, h) => {
      ctx.fillStyle = '#1a4a30';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e8d9a8';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = '#f4f1e4';
      ctx.font = 'bold 54px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("MANAGER'S OFFICE", w / 2, h / 2 + 2);
    });
    const officeSignMat = this.createStdMaterial(0xffffff, { roughness: 0.75, map: officeSignTex });
    const officeSign = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 0.9), officeSignMat);
    officeSign.position.set(clubX + 0.4, CLUB_H + OFFICE_H - 0.5, officeFrontZ - 0.07);
    officeSign.rotation.y = Math.PI;   // face the pitch
    clubGroup.add(officeSign);

    // Balcony door onto the office
    const balconyDoor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.1), mat.woodDark);
    balconyDoor.position.set(clubX + 0.4 + 4.95, CLUB_H + 1.05, bayZ - 0.05);
    clubGroup.add(balconyDoor);

    // --- Ground floor windows & entrance ---
    [1.4, 4.0].forEach(dx => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 0.08), mat.concrete);
      frame.position.set(clubX + dx, 2.1, clubFrontZ - 0.05);
      clubGroup.add(frame);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.3), mat.windowGlass);
      glass.position.set(clubX + dx, 2.1, clubFrontZ - 0.1);
      glass.rotation.y = Math.PI;      // face the pitch
      clubGroup.add(glass);

      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.4, 0.09), mat.concrete);
      mullion.position.set(clubX + dx, 2.1, clubFrontZ - 0.11);
      clubGroup.add(mullion);
    });

    // Entrance door with a small canopy
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.12), mat.woodDark);
    entrance.position.set(clubX + 6.4, 1.15, clubFrontZ - 0.07);
    clubGroup.add(entrance);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 1.0), mat.concreteDark);
    canopy.position.set(clubX + 6.4, 2.45, clubFrontZ - 0.5);
    canopy.castShadow = true;
    clubGroup.add(canopy);

    // Clubhouse sign above the ground floor (below the balcony overhang)
    const clubSignTex = this.makeCanvasTexture(1024, 112, (ctx, w, h) => {
      ctx.fillStyle = '#5c4a32';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d8c79a';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 62px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BULUH FC CLUBHOUSE', w / 2, h * 0.54);
    });
    const clubSignMat = this.createStdMaterial(0xffffff, { roughness: 0.8, map: clubSignTex });
    const clubSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.59), clubSignMat);
    clubSignMesh.position.set(clubX + 2.7, 3.22, clubFrontZ - 0.06);
    clubSignMesh.rotation.y = Math.PI;   // face the pitch
    clubGroup.add(clubSignMesh);

    // --- Locker room wing (single storey, in front of the clubhouse) ---
    const WING_W = 7.5;
    const WING_D = 3.8;
    const WING_H = 3.3;
    const wingFrontZ = clubFrontZ - WING_D;
    const wingZ = wingFrontZ + WING_D / 2;
    const wingX = clubX - 3.75;

    const wingBody = new THREE.Mesh(new THREE.BoxGeometry(WING_W, WING_H, WING_D), mat.brick);
    wingBody.position.set(wingX, WING_H / 2, wingZ);
    wingBody.castShadow = true;
    wingBody.receiveShadow = true;
    clubGroup.add(wingBody);

    // Shallow pitched roof on the wing
    const wingSlope = Math.sqrt(Math.pow(WING_D / 2, 2) + Math.pow(0.75, 2));
    const wingAngle = Math.atan2(0.75, WING_D / 2);
    const wingRoofFront = new THREE.Mesh(
      new THREE.BoxGeometry(WING_W + 0.5, 0.2, wingSlope),
      mat.brickDark
    );
    wingRoofFront.position.set(wingX, WING_H + 0.375, wingFrontZ + WING_D / 4);
    wingRoofFront.rotation.x = -wingAngle;
    wingRoofFront.castShadow = true;
    clubGroup.add(wingRoofFront);
    const wingRoofBack = new THREE.Mesh(
      new THREE.BoxGeometry(WING_W + 0.5, 0.2, wingSlope),
      mat.brickDark
    );
    wingRoofBack.position.set(wingX, WING_H + 0.375, wingFrontZ + (WING_D * 3) / 4);
    wingRoofBack.rotation.x = wingAngle;
    wingRoofBack.castShadow = true;
    clubGroup.add(wingRoofBack);
    const wingRidge = new THREE.Mesh(new THREE.BoxGeometry(WING_W + 0.6, 0.14, 0.34), mat.concreteDark);
    wingRidge.position.set(wingX, WING_H + 0.82, wingZ);
    clubGroup.add(wingRidge);

    // Locker room windows flanking the tunnel mouth
    [-2.2, 2.2].forEach(dx => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.08), mat.concrete);
      frame.position.set(wingX + dx, 2.0, wingFrontZ - 0.05);
      clubGroup.add(frame);
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), mat.windowGlass);
      glass.position.set(wingX + dx, 2.0, wingFrontZ - 0.1);
      glass.rotation.y = Math.PI;      // face the pitch
      clubGroup.add(glass);
    });

    // "LOCKER ROOM" sign on the tunnel lintel
    const lockerSignTex = this.makeCanvasTexture(512, 96, (ctx, w, h) => {
      ctx.fillStyle = '#22303f';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8eef2';
      ctx.font = 'bold 50px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKER ROOM', w / 2, h * 0.54);
    });
    const lockerSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.64),
      this.createStdMaterial(0xffffff, { roughness: 0.8, map: lockerSignTex })
    );
    lockerSign.position.set(tunnelX, 2.86, wingFrontZ - 0.32);
    lockerSign.rotation.y = Math.PI;   // face the pitch
    clubGroup.add(lockerSign);

    root.add(clubGroup);

    // ============================
    // 7. ADVERTISING BOARDS
    // ============================
    const adBoardGroup = new THREE.Group();
    const adHeight = 0.8;
    const adY = adHeight / 2;
    const adZ = standZ - 2.0;  // in front of the grandstand base

    // Several ad boards along the front of the grandstand
    const adTexts = ['A&B Builders', 'The Crown Tap', 'Gulf Garage', 'Local Dental'];
    const adColors = [mat.adBoard, mat.adBoardBlue, mat.signGreen, mat.adBoard];

    adTexts.forEach((text, i) => {
      const boardGeom = new THREE.BoxGeometry(7, adHeight, 0.08);
      const board = new THREE.Mesh(boardGeom, adColors[i % adColors.length]);
      board.position.set(-standLength / 2 + 4 + i * 8.5, adY, adZ);
      board.castShadow = true;
      adBoardGroup.add(board);

      // Text on ad board
      const adCanvas = document.createElement('canvas');
      adCanvas.width = 512;
      adCanvas.height = 64;
      const adCtx = adCanvas.getContext('2d');
      const bgColor = i % 2 === 0 ? '#ffffff' : '#1a3a6b';
      const textColor = i % 2 === 0 ? '#111111' : '#ffffff';
      adCtx.fillStyle = bgColor;
      adCtx.fillRect(0, 0, 512, 64);
      adCtx.fillStyle = textColor;
      adCtx.font = 'bold 36px Arial, sans-serif';
      adCtx.textAlign = 'center';
      adCtx.textBaseline = 'middle';
      adCtx.fillText(text, 256, 32);
      const adTex = new THREE.CanvasTexture(adCanvas);
      adTex.colorSpace = THREE.SRGBColorSpace;

      const adLabelGeom = new THREE.PlaneGeometry(6.8, adHeight - 0.1);
      const adLabelMat = this.createStdMaterial(0xffffff);
      adLabelMat.map = adTex;
      const adLabel = new THREE.Mesh(adLabelGeom, adLabelMat);
      adLabel.position.set(-standLength / 2 + 4 + i * 8.5, adY, adZ - 0.05);
      adLabel.rotation.y = Math.PI;   // face the pitch
      adBoardGroup.add(adLabel);
    });

    root.add(adBoardGroup);

    // ============================
    // 8. SCOREBOARD (far right side)
    // ============================
    const scoreGroup = new THREE.Group();
    const scoreX = halfW + railOffset + 3;
    const scoreZ = 10;

    // Posts
    const sPillarGeom = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    [-1.5, 1.5].forEach(offset => {
      const sp = new THREE.Mesh(sPillarGeom, mat.metal);
      sp.position.set(scoreX, 2, scoreZ + offset);
      sp.castShadow = true;
      scoreGroup.add(sp);
    });

    // Board
    const sBoardGeom = new THREE.BoxGeometry(0.15, 2, 3.5);
    const sBoard = new THREE.Mesh(sBoardGeom, mat.scoreboard);
    sBoard.position.set(scoreX, 3.5, scoreZ);
    sBoard.castShadow = true;
    scoreGroup.add(sBoard);

    // Score text
    const scoreCanvas = document.createElement('canvas');
    scoreCanvas.width = 256;
    scoreCanvas.height = 128;
    const scoreCtx = scoreCanvas.getContext('2d');
    scoreCtx.fillStyle = '#222222';
    scoreCtx.fillRect(0, 0, 256, 128);
    scoreCtx.fillStyle = '#ffffff';
    scoreCtx.font = 'bold 24px monospace';
    scoreCtx.textAlign = 'center';
    scoreCtx.fillText('BULUH', 128, 30);
    scoreCtx.font = 'bold 48px monospace';
    scoreCtx.fillText('0 - 0', 128, 80);
    scoreCtx.font = '18px monospace';
    scoreCtx.fillText('VISITORS', 128, 115);
    const scoreTex = new THREE.CanvasTexture(scoreCanvas);
    scoreTex.colorSpace = THREE.SRGBColorSpace;

    const scoreFaceGeom = new THREE.PlaneGeometry(1.8, 3.3);
    const scoreFaceMat = this.createStdMaterial(0xffffff);
    scoreFaceMat.map = scoreTex;
    // Facing the pitch (rotated 90 degrees)
    const scoreFace = new THREE.Mesh(scoreFaceGeom, scoreFaceMat);
    scoreFace.position.set(scoreX - 0.1, 3.5, scoreZ);
    scoreFace.rotation.y = -Math.PI / 2;
    // Swap width/height to match vertical board
    scoreFace.scale.set(1, 1, 1);
    scoreGroup.add(scoreFace);

    root.add(scoreGroup);

    // ============================
    // 9. CORNER FLAGS
    // ============================
    const flagPoleGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8);
    const flagGeom = new THREE.PlaneGeometry(0.35, 0.25);

    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([cx, cz]) => {
      const flagPole = new THREE.Mesh(flagPoleGeom, mat.metal);
      flagPole.position.set(cx * halfW, 0.8, cz * halfH);
      flagPole.castShadow = true;
      root.add(flagPole);

      const flag = new THREE.Mesh(flagGeom, mat.red);
      flag.position.set(cx * halfW + 0.18, 1.45, cz * halfH);
      flag.castShadow = true;
      root.add(flag);
    });

    // ============================
    // 10. DUGOUTS (near side)
    // ============================
    [-1, 1].forEach(side => {
      const dugGroup = new THREE.Group();
      const dugX = side * 12;
      const dugZ = -halfH - railOffset - 2;

      // Shelter frame
      const shelterGeom = new THREE.BoxGeometry(6, 2.2, 1.5);
      const shelter = new THREE.Mesh(shelterGeom, mat.concrete);
      shelter.position.set(dugX, 1.1, dugZ);
      shelter.castShadow = true;
      shelter.receiveShadow = true;
      dugGroup.add(shelter);

      // Roof
      const dugRoof = new THREE.Mesh(
        new THREE.BoxGeometry(6.3, 0.1, 1.8),
        mat.roofWhite
      );
      dugRoof.position.set(dugX, 2.25, dugZ);
      dugRoof.castShadow = true;
      dugGroup.add(dugRoof);

      // Front opening (just cutaway the front by placing a dark plane)
      const openGeom = new THREE.PlaneGeometry(5.5, 1.8);
      const opening = new THREE.Mesh(openGeom, mat.black);
      opening.position.set(dugX, 1.1, dugZ - 0.77);
      dugGroup.add(opening);

      // Bench seats
      const benchGeom = new THREE.BoxGeometry(5, 0.1, 0.5);
      const bench = new THREE.Mesh(benchGeom, mat.seat);
      bench.position.set(dugX, 0.6, dugZ);
      dugGroup.add(bench);

      root.add(dugGroup);
    });

    // ============================
    // 11. SIMPLE FENCING BEHIND GOALS
    // ============================
    [1, -1].forEach(side => {
      const fenceZ = side * (halfH + railOffset + 5);
      const fencePanelGeom = new THREE.BoxGeometry(pitchW + 10, 2, 0.05);
      const fencePanel = new THREE.Mesh(fencePanelGeom, mat.fence);
      fencePanel.material = this.createStdMaterial(0xaaaaaa, {
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      fencePanel.position.set(0, 1, fenceZ);
      fencePanel.castShadow = true;
      root.add(fencePanel);

      // Fence posts
      const fPostGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
      for (let i = 0; i <= 16; i++) {
        const fp = new THREE.Mesh(fPostGeom, mat.metal);
        fp.position.set(-halfW - 5 + i * (pitchW + 10) / 16, 1.1, fenceZ);
        fp.castShadow = true;
        root.add(fp);
      }
    });

    // ============================
    // 12. SIMPLE TREES (around the ground)
    // ============================
    const createTree = (x, z, scale = 1) => {
      const treeGroup = new THREE.Group();

      // Trunk
      const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 3 * scale, 8);
      const trunk = new THREE.Mesh(trunkGeom, mat.wood);
      trunk.position.set(x, 1.5 * scale, z);
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Canopy (layered spheres)
      const canopyMat = this.createStdMaterial(0x2d7a2d, { roughness: 0.95 });
      const canopySizes = [
        { y: 3.5, r: 2.0 },
        { y: 4.5, r: 1.6 },
        { y: 5.3, r: 1.1 },
      ];
      canopySizes.forEach(c => {
        const cGeom = new THREE.SphereGeometry(c.r * scale, 12, 10);
        const cMesh = new THREE.Mesh(cGeom, canopyMat);
        cMesh.position.set(x, c.y * scale, z);
        cMesh.castShadow = true;
        treeGroup.add(cMesh);
      });

      root.add(treeGroup);
    };

    // Trees behind the grandstand
    const treePositions = [
      [-25, standZ + 8, 1.2],
      [-15, standZ + 10, 1.0],
      [-5, standZ + 9, 1.3],
      [5, standZ + 11, 1.1],
      [15, standZ + 8, 1.0],
      [25, standZ + 10, 1.2],
      [30, standZ + 6, 0.9],
      // Trees behind the goals
      [-halfW - 10, -20, 1.0],
      [-halfW - 12, 10, 1.1],
      [-halfW - 8, 30, 0.9],
      [halfW + 10, -15, 1.2],
      [halfW + 12, 20, 1.0],
      [halfW + 8, 40, 0.8],
      // Trees along the western boundary and beside the car park
      [-46, 56, 1.1],
      [-45, 62, 1.0],
      [-44, 68, 0.9],
      [-42, 74, 1.0],
      [clubX + 8, clubZ + 6, 1.0],
    ];

    treePositions.forEach(([tx, tz, ts]) => createTree(tx, tz, ts));

    // ============================
    // 13. PLAYERS' TUNNEL
    //     Links the locker room wing to the pitch, cutting through the
    //     far touchline railing.
    // ============================
    const tunnelGroup = new THREE.Group();
    tunnelGroup.name = 'PlayersTunnel';
    root.add(tunnelGroup);

    const tunnelLen = wingFrontZ - halfH;      // wing front down to the touchline
    const tunnelZ = (wingFrontZ + halfH) / 2;
    const tunnelW = 3.6;

    // Side walls
    [-1, 1].forEach(side => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.7, tunnelLen + 0.4), mat.brick);
      wall.position.set(tunnelX + side * (tunnelW / 2 + 0.16), 1.35, tunnelZ);
      wall.castShadow = true;
      wall.receiveShadow = true;
      tunnelGroup.add(wall);

      // Wall coping
      const coping = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, tunnelLen + 0.5), mat.concreteDark);
      coping.position.set(tunnelX + side * (tunnelW / 2 + 0.16), 2.76, tunnelZ);
      coping.castShadow = true;
      tunnelGroup.add(coping);
    });

    // Tunnel roof
    const tunnelRoof = new THREE.Mesh(
      new THREE.BoxGeometry(tunnelW + 1.0, 0.28, tunnelLen + 0.6),
      mat.concreteDark
    );
    tunnelRoof.position.set(tunnelX, 2.92, tunnelZ);
    tunnelRoof.castShadow = true;
    tunnelRoof.receiveShadow = true;
    tunnelGroup.add(tunnelRoof);

    // Dark opening at the locker room end
    const tunnelMouth = new THREE.Mesh(
      new THREE.BoxGeometry(tunnelW, 2.6, 0.35),
      this.createStdMaterial(0x15171a, { roughness: 1.0 })
    );
    tunnelMouth.position.set(tunnelX, 1.3, wingFrontZ - 0.12);
    tunnelGroup.add(tunnelMouth);

    // Brick surround framing the tunnel mouth
    [-1, 1].forEach(side => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.1, 0.28), mat.brick);
      jamb.position.set(tunnelX + side * (tunnelW / 2 + 0.25), 1.55, wingFrontZ - 0.16);
      jamb.castShadow = true;
      tunnelGroup.add(jamb);
    });
    const tunnelLintel = new THREE.Mesh(new THREE.BoxGeometry(tunnelW + 1.0, 0.5, 0.28), mat.brick);
    tunnelLintel.position.set(tunnelX, 2.85, wingFrontZ - 0.16);
    tunnelLintel.castShadow = true;
    tunnelGroup.add(tunnelLintel);

    // Pitch-side portal
    const portalLintel = new THREE.Mesh(
      new THREE.BoxGeometry(tunnelW + 1.0, 0.3, 0.3),
      mat.concrete
    );
    portalLintel.position.set(tunnelX, 2.62, halfH + 0.15);
    portalLintel.castShadow = true;
    tunnelGroup.add(portalLintel);

    // "PLAYERS' TUNNEL" sign hanging under the portal
    const tunnelSignTex = this.makeCanvasTexture(512, 88, (ctx, w, h) => {
      ctx.fillStyle = '#1a4a30';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e4';
      ctx.font = 'bold 46px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("PLAYERS' TUNNEL", w / 2, h * 0.54);
    });
    const tunnelSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 0.52),
      this.createStdMaterial(0xffffff, { roughness: 0.8, map: tunnelSignTex })
    );
    tunnelSign.position.set(tunnelX, 2.25, halfH + 0.02);
    tunnelSign.rotation.y = Math.PI;   // face the pitch
    tunnelGroup.add(tunnelSign);

    // ============================
    // 14. FLOODLIGHTS
    // ============================
    const floodGroup = new THREE.Group();
    floodGroup.name = 'Floodlights';
    root.add(floodGroup);

    const createFloodlight = (x, z) => {
      const pylon = new THREE.Group();
      pylon.name = `Floodlight_${x}_${z}`;
      pylon.position.set(x, 0, z);
      floodGroup.add(pylon);

      // Tapered mast
      const mastHeight = 18;
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.9, mastHeight, 10),
        mat.metal
      );
      mast.position.y = mastHeight / 2;
      mast.castShadow = true;
      pylon.add(mast);

      // Lattice bracing rings
      for (let b = 0; b < 6; b++) {
        const by = 2.4 + b * 2.8;
        const r = 0.9 - (by / mastHeight) * 0.68;
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 10), mat.metalDark);
        ring.position.y = by;
        pylon.add(ring);
      }

      // Head frame with lamp array, aimed at the centre circle
      const head = new THREE.Group();
      head.position.y = mastHeight + 0.45;
      pylon.add(head);

      const backing = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.9, 0.16), mat.metalDark);
      backing.castShadow = true;
      head.add(backing);

      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 6; i++) {
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.6, 0.22), mat.lampGlass);
          lamp.position.set(-2.65 + i * 1.06, row === 0 ? 0.45 : -0.45, 0.16);
          head.add(lamp);

          // Lamp hood
          const hood = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.72, 0.3), mat.metal);
          hood.position.set(-2.65 + i * 1.06, row === 0 ? 0.5 : -0.4, 0.26);
          head.add(hood);
        }
      }

      // Support arms from the mast to the head
      [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.3), mat.metal);
        arm.position.set(side * 3.2, -0.1, -0.5);
        arm.rotation.x = 0.5;
        head.add(arm);
      });

      // Aim the array at the centre of the pitch
      head.lookAt(0, 2, 0);
    };

    createFloodlight(-halfW - 16, -halfH - 18);
    createFloodlight(halfW + 16, -halfH - 18);
    createFloodlight(-halfW - 16, halfH + 20);
    createFloodlight(halfW + 16, halfH + 20);

    // ============================
    // 15. CAR PARK
    // ============================
    const carParkGroup = new THREE.Group();
    carParkGroup.name = 'CarPark';
    root.add(carParkGroup);

    const parkX = clubX - 1;
    const parkZ = clubZ + 11;

    const tarmac = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), mat.tarmac);
    tarmac.rotation.x = -Math.PI / 2;
    tarmac.position.set(parkX, 0.02, parkZ);
    tarmac.receiveShadow = true;
    carParkGroup.add(tarmac);

    // Gravel apron
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), mat.gravel);
    apron.rotation.x = -Math.PI / 2;
    apron.position.set(parkX, 0.005, parkZ);
    apron.receiveShadow = true;
    carParkGroup.add(apron);

    const createCar = (x, z, rot, color) => {
      const car = new THREE.Group();
      car.position.set(x, 0, z);
      car.rotation.y = rot;
      carParkGroup.add(car);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.66, 4.2),
        this.createStdMaterial(color, { roughness: 0.35, metalness: 0.35 })
      );
      body.position.y = 0.66;
      body.castShadow = true;
      car.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.6, 2.0), mat.windowGlass);
      cabin.position.set(0, 1.26, -0.2);
      cabin.castShadow = true;
      car.add(cabin);

      [[-0.85, -1.35], [0.85, -1.35], [-0.85, 1.35], [0.85, 1.35]].forEach(([ox, oz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 12), mat.black);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(ox, 0.33, oz);
        wheel.castShadow = true;
        car.add(wheel);
      });

      // Head lights & tail lights
      [-0.6, 0.6].forEach(ox => {
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.08), mat.signWhite);
        head.position.set(ox, 0.72, -2.11);
        car.add(head);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.08), mat.red);
        tail.position.set(ox, 0.72, 2.11);
        car.add(tail);
      });
    };

    const carColors = [0x8c1f1f, 0x1f3d70, 0xd8d8d8, 0x2b2b2b, 0x2f6b3d, 0xb8b2a4];
    for (let i = 0; i < 6; i++) {
      createCar(parkX - 7.5 + i * 3.0, parkZ - 1.2, 0, carColors[i]);
    }
    createCar(parkX - 5.5, parkZ + 2.6, Math.PI, carColors[2]);
    createCar(parkX + 3.5, parkZ + 2.6, Math.PI, carColors[3]);

    // Car park sign
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), mat.metal);
    signPost.position.set(parkX + 9.5, 1.6, parkZ - 4);
    signPost.castShadow = true;
    carParkGroup.add(signPost);

    const parkSignTex = this.makeCanvasTexture(512, 128, (ctx, w, h) => {
      ctx.fillStyle = '#1a4a30';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e4';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BULUH FC', w / 2, h * 0.34);
      ctx.font = '34px Arial, sans-serif';
      ctx.fillText('PLAYERS & SPECTATORS', w / 2, h * 0.68);
    });
    const parkSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.85),
      this.createStdMaterial(0xffffff, { roughness: 0.8, map: parkSignTex })
    );
    parkSign.position.set(parkX + 9.5, 2.9, parkZ - 4.05);
    parkSign.rotation.y = Math.PI;   // face the pitch
    carParkGroup.add(parkSign);

    // ============================
    // 16. CLUB CREST & FLAGS
    // ============================
    const crestGroup = new THREE.Group();
    crestGroup.name = 'ClubCrest';
    root.add(crestGroup);

    const crestTexture = this.makeCanvasTexture(256, 256, (ctx, w, h) => {
      // Shield
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.06);
      ctx.lineTo(w * 0.9, h * 0.22);
      ctx.lineTo(w * 0.9, h * 0.58);
      ctx.quadraticCurveTo(w * 0.9, h * 0.85, w * 0.5, h * 0.96);
      ctx.quadraticCurveTo(w * 0.1, h * 0.85, w * 0.1, h * 0.58);
      ctx.lineTo(w * 0.1, h * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e8d9a8';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Oak tree
      ctx.strokeStyle = '#f4f1e4';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.72);
      ctx.lineTo(w * 0.5, h * 0.42);
      ctx.stroke();

      ctx.fillStyle = '#f4f1e4';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.36, w * 0.19, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.45, w * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.65, h * 0.45, w * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Acorns
      ctx.fillStyle = '#e8d9a8';
      ctx.beginPath();
      ctx.arc(w * 0.36, h * 0.6, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.64, h * 0.6, w * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Banner with initials
      ctx.fillStyle = '#14532d';
      ctx.fillRect(w * 0.16, h * 0.76, w * 0.68, h * 0.14);
      ctx.fillStyle = '#f4f1e4';
      ctx.font = `bold ${Math.round(h * 0.11)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BULUH FC', w * 0.5, h * 0.83);
    });

    const crestMat = this.createStdMaterial(0xffffff, { roughness: 0.75, map: crestTexture });
    [-1, 1].forEach(side => {
      const crest = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), crestMat);
      crest.position.set(side * (standLength / 2 - 1.4), standHeight + 0.85, standZ - 2.46);
      crest.rotation.y = Math.PI;     // face the pitch
      crestGroup.add(crest);
    });

    // Club flags on poles behind the grandstand
    [-12, 0, 12].forEach((fx, i) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 8), mat.metal);
      pole.position.set(fx, 4.5, standZ + 5.5);
      pole.castShadow = true;
      crestGroup.add(pole);

      const flagTexture = this.makeCanvasTexture(256, 160, (ctx, w, h) => {
        ctx.fillStyle = i % 2 === 0 ? '#14532d' : '#f4f1e4';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = i % 2 === 0 ? '#f4f1e4' : '#14532d';
        ctx.font = 'bold 60px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OU', w / 2, h / 2);
      });
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.4),
        this.createStdMaterial(0xffffff, { roughness: 0.9, map: flagTexture, side: THREE.DoubleSide })
      );
      flag.position.set(fx + 1.1, 7.6, standZ + 5.5);
      flag.castShadow = true;
      crestGroup.add(flag);
    });

    // ============================
    // STORE PARTS & FINALIZE
    // ============================
    this.characterParts = {
      pitch: pitchPlane,
      grandstand: standGroup,
      clubhouse: clubGroup,
      tunnel: tunnelGroup,
      floodlights: floodGroup,
      carPark: carParkGroup,
      crest: crestGroup,
      scoreboard: scoreGroup,
      ads: adBoardGroup,
    };

    this.character = root;
    this.scene.add(this.character);
    return root;
  }

  /* ------------------------------------------------------------------ */
  /*  Animation loop                                                    */
  /* ------------------------------------------------------------------ */

  animate() {
    if (this._dead) return;
    requestAnimationFrame(() => this.animate());

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
  }
}
