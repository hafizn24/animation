import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createBroadcastProps } from './stadium-props.js';

/**
 * StadiumApp – Procedural 3D model of a small English non-league football ground
 * inspired by "Oakhaven United FC – The Oaks".
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
    // Bird's-eye-ish view matching photo angle
    this.camera.position.set(-30, 22, 40);
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
    this.controls.target.set(0, 2, 0);
    this.controls.maxPolarAngle = Math.PI / 2.05;  // prevent going underground
  }

  addLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambient);

    // Sun
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(30, 40, 20);
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
    fill.position.set(-20, 15, -10);
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
      yellow:      this.createStdMaterial(0xf5b041, { roughness: 0.6 }),
      windowGlass: this.createStdMaterial(0x6699cc, { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.5 }),
      black:       this.createStdMaterial(0x111111),
      darkGrey:    this.createStdMaterial(0x222222, { roughness: 0.7 }),
      lensGlass:   this.createStdMaterial(0x0a1020, { roughness: 0.1, metalness: 0.9 }),
      floodlightEmissive: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfffaed,
        emissiveIntensity: 2.2,
        roughness: 0.2
      }),
      ledEmissive: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x2244aa,
        emissiveIntensity: 0.9,
        roughness: 0.3
      }),
      foamWhite: this.createStdMaterial(0xf8f9fa, { roughness: 0.9, transparent: true, opacity: 0.85 }),
      bluePlastic: this.createStdMaterial(0x1b4f72, { roughness: 0.5 }),
      orangeCone: this.createStdMaterial(0xe67e22, { roughness: 0.6 }),
      silverMetal: this.createStdMaterial(0xd5dbdb, { roughness: 0.25, metalness: 0.8 }),
      whiteboardFrame: this.createStdMaterial(0x95a5a6, { roughness: 0.4, metalness: 0.6 }),
    };

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
    // Far touchline
    createRailingSegment(-halfW - railOffset, halfH + railOffset, halfW + railOffset, halfH + railOffset);
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
    signCtx.fillText('OAKHAVEN UNITED FC - THE OAKS', 512, 64);
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;

    const signLabelGeom = new THREE.PlaneGeometry(standLength - 2, 0.7);
    const signLabelMat = this.createStdMaterial(0xffffff);
    signLabelMat.map = signTexture;
    const signLabel = new THREE.Mesh(signLabelGeom, signLabelMat);
    signLabel.position.set(0, standHeight + 0.85, standZ - 2.44);
    roofGroup.add(signLabel);

    // Tree logo on the sign (green circle)
    const treeLogo = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 24),
      mat.signWhite
    );
    treeLogo.position.set(-standLength / 2 + 2, standHeight + 0.85, standZ - 2.46);
    roofGroup.add(treeLogo);

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
    // 6. CLUBHOUSE (left of grandstand)
    // ============================
    const clubGroup = new THREE.Group();
    const clubX = -standLength / 2 - 8;
    const clubZ = standZ + 0.5;

    // Main building
    const clubBodyGeom = new THREE.BoxGeometry(12, 4, 5);
    const clubBody = new THREE.Mesh(clubBodyGeom, mat.brick);
    clubBody.position.set(clubX, 2, clubZ);
    clubBody.castShadow = true;
    clubBody.receiveShadow = true;
    clubGroup.add(clubBody);

    // Clubhouse roof
    const clubRoofGeom = new THREE.BoxGeometry(12.5, 0.2, 5.5);
    const clubRoof = new THREE.Mesh(clubRoofGeom, mat.concreteDark);
    clubRoof.position.set(clubX, 4.1, clubZ);
    clubRoof.castShadow = true;
    clubGroup.add(clubRoof);

    // Sloped roof top
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-6.5, 0);
    roofShape.lineTo(6.5, 0);
    roofShape.lineTo(6.5, 1.5);
    roofShape.lineTo(-6.5, 1.5);
    roofShape.closePath();
    // Simple pitched roof using a prism-ish box
    const pitchedRoof = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 1.8, 5.5),
      mat.brickDark
    );
    pitchedRoof.position.set(clubX, 5.0, clubZ);
    pitchedRoof.castShadow = true;
    clubGroup.add(pitchedRoof);

    // Windows on the front face
    for (let w = 0; w < 3; w++) {
      const winGeom = new THREE.PlaneGeometry(1.6, 1.2);
      const win = new THREE.Mesh(winGeom, mat.windowGlass);
      win.position.set(clubX - 4 + w * 4, 2.5, clubZ - 2.52);
      clubGroup.add(win);

      // Window frame
      const frameGeom = new THREE.BoxGeometry(1.8, 1.4, 0.08);
      const frame = new THREE.Mesh(frameGeom, mat.concrete);
      frame.position.set(clubX - 4 + w * 4, 2.5, clubZ - 2.53);
      clubGroup.add(frame);
    }

    // Door
    const doorGeom = new THREE.PlaneGeometry(1.2, 2.2);
    const door = new THREE.Mesh(doorGeom, mat.woodDark);
    door.position.set(clubX + 3, 1.1, clubZ - 2.52);
    clubGroup.add(door);

    // Clubhouse sign
    const clubSignCanvas = document.createElement('canvas');
    clubSignCanvas.width = 512;
    clubSignCanvas.height = 64;
    const clubSignCtx = clubSignCanvas.getContext('2d');
    clubSignCtx.fillStyle = '#5c4a32';
    clubSignCtx.fillRect(0, 0, 512, 64);
    clubSignCtx.fillStyle = '#ffffff';
    clubSignCtx.font = 'bold 28px Arial, sans-serif';
    clubSignCtx.textAlign = 'center';
    clubSignCtx.textBaseline = 'middle';
    clubSignCtx.fillText('OAKHAVEN UTD CLUBHOUSE', 256, 22);
    clubSignCtx.font = '22px Arial, sans-serif';
    clubSignCtx.fillText('REFRESHMENTS', 256, 48);
    const clubSignTex = new THREE.CanvasTexture(clubSignCanvas);
    clubSignTex.colorSpace = THREE.SRGBColorSpace;

    const clubSignGeom = new THREE.PlaneGeometry(8, 1);
    const clubSignMat = this.createStdMaterial(0xffffff);
    clubSignMat.map = clubSignTex;
    const clubSignMesh = new THREE.Mesh(clubSignGeom, clubSignMat);
    clubSignMesh.position.set(clubX, 3.8, clubZ - 2.53);
    clubGroup.add(clubSignMesh);

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
    scoreCtx.fillText('OAKHAVEN', 128, 30);
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
    // 9. CORNER FLAGS (WITH SPRING BASES)
    // ============================
    const flagGroup = new THREE.Group();
    flagGroup.name = 'CornerFlags';
    const flagPoleGeom = new THREE.CylinderGeometry(0.015, 0.015, 1.5, 12);
    const flagGeom = new THREE.PlaneGeometry(0.38, 0.26);

    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([cx, cz]) => {
      const singleFlag = new THREE.Group();
      singleFlag.position.set(cx * halfW, 0, cz * halfH);

      // Ground turf socket collar
      const socketGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.04, 12);
      const socket = new THREE.Mesh(socketGeom, mat.black);
      socket.position.y = 0.02;
      singleFlag.add(socket);

      // Flexible spring coil base
      const springGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.12, 10);
      const spring = new THREE.Mesh(springGeom, mat.darkGrey);
      spring.position.y = 0.08;
      singleFlag.add(spring);

      // Yellow/fluorescent flexible pole
      const flagPole = new THREE.Mesh(flagPoleGeom, mat.yellow);
      flagPole.position.y = 0.82;
      flagPole.castShadow = true;
      singleFlag.add(flagPole);

      // Vibrant red & yellow checkered flag cloth
      const flagCanvas = document.createElement('canvas');
      flagCanvas.width = 128;
      flagCanvas.height = 128;
      const fctx = flagCanvas.getContext('2d');
      fctx.fillStyle = '#cc2222';
      fctx.fillRect(0, 0, 128, 128);
      fctx.fillStyle = '#f1c40f';
      fctx.fillRect(0, 0, 64, 64);
      fctx.fillRect(64, 64, 64, 64);
      const flagTex = new THREE.CanvasTexture(flagCanvas);
      flagTex.colorSpace = THREE.SRGBColorSpace;

      const cFlagMat = this.createStdMaterial(0xffffff, { roughness: 0.6, side: THREE.DoubleSide });
      cFlagMat.map = flagTex;

      const flag = new THREE.Mesh(flagGeom, cFlagMat);
      flag.position.set(cx * 0.19, 1.42, 0);
      flag.castShadow = true;
      singleFlag.add(flag);

      flagGroup.add(singleFlag);
    });
    root.add(flagGroup);

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
      // Trees behind clubhouse
      [clubX - 8, clubZ + 6, 1.1],
      [clubX - 2, clubZ + 8, 1.0],
      [clubX + 5, clubZ + 7, 0.9],
    ];

    treePositions.forEach(([tx, tz, ts]) => createTree(tx, tz, ts));

    // ============================
    // 13. BROADCAST EQUIPMENT, PITCHSIDE HARDWARE & MEDIA SUITE
    // (Imported from separate modular file: environments/stadium-props.js)
    // ============================
    const broadcastParts = createBroadcastProps(root, {
      pitchW,
      pitchH,
      halfW,
      halfH,
      lineY,
      railOffset,
      standZ,
      clubX,
      clubZ,
    });

    // ============================
    // STORE PARTS & FINALIZE
    // ============================
    this.characterParts = {
      pitch: pitchPlane,
      grandstand: standGroup,
      clubhouse: clubGroup,
      scoreboard: scoreGroup,
      ads: adBoardGroup,
      ...broadcastParts,
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
