import * as THREE from 'three';

/**
 * ModularPitchZone — one shared grass plane + lighting rig with three swappable
 * camera zones. Only the geometry that fits inside a 9:16 vertical frame is
 * built; directors toggle character.visible between cuts instead of loading a
 * full stadium. Used in Ep. 6, 7, 8, 10, 11 and 12.
 *
 * The shared perimeter adds low-poly terraced stands, ad boards, four corner
 * floodlight towers, a deterministic instanced crowd and a sky dome so the
 * pitch never floats in an infinite green/blue void.
 */

const fract = (value) => value - Math.floor(value);
const seededUnit = (seed) => fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);

export class ModularPitchZoneApp {
  constructor(container, zone = 'center') {
    this.container = container;
    this.zone = zone;
    this.scene = null;
    this.camera = null;
    this.character = null;
    this.characterParts = {};
    this.anchors = {};
    this.lights = {};
    this._dead = false;

    this.skyTop = 0x4f9cd8;
    this.skyBottom = 0xd9edf7;
    this.fogColor = 0x9ccbe8;
    this.stadium = {
      crowd: null,
      crowdBase: [],
      towers: [],
      panels: [],
    };
  }

  async init() {
    this.setupScene();
    this.addLights();
    this.createProceduralCharacter();
    return this;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.skyBottom);
    this.scene.fog = new THREE.Fog(this.fogColor, 22, 62);
    this.addSkyDome();
  }

  addSkyDome() {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color(this.skyTop) },
        bottomColor: { value: new THREE.Color(this.skyBottom) },
        exponent: { value: 0.78 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float mixAmount = pow(max(h, 0.0), exponent);
          gl_FragColor = vec4(mix(bottomColor, topColor, mixAmount), 1.0);
        }
      `,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(110, 24, 12), material);
    dome.name = 'SkyDome';
    dome.frustumCulled = false;
    dome.renderOrder = -10;
    this.scene.add(dome);
    this.anchors.skyDome = dome;
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    ambient.name = 'pitchAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x2f5b2a, 0.6);
    hemi.name = 'pitchHemi';
    this.scene.add(hemi);
    this.lights.hemi = hemi;

    const sun = new THREE.DirectionalLight(0xfff4dc, 1.6);
    sun.name = 'pitchSun';
    sun.position.set(-6, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    this.lights.sun = sun;

    const fill = new THREE.DirectionalLight(0xd8e8ff, 0.4);
    fill.name = 'pitchFill';
    fill.position.set(5, 4, -6);
    this.scene.add(fill);
    this.lights.fill = fill;
  }

  createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#2f7a3d' : '#357f43';
      ctx.fillRect(0, i * 32, 256, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 4);
    texture.needsUpdate = true;
    return texture;
  }

  lineMaterial() {
    return new THREE.MeshBasicMaterial({ color: 0xf7f4ea, side: THREE.DoubleSide });
  }

  addLine(width, depth, x, z, rotation = 0) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), this.lineMaterial());
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = rotation;
    line.position.set(x, 0.012, z);
    this.scene.add(line);
    return line;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();
    const group = new THREE.Group();
    group.name = `PitchZone-${this.zone}`;

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 40),
      new THREE.MeshStandardMaterial({ map: this.createGrassTexture(), roughness: 1 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    group.add(grass);

    if (this.zone === 'center') {
      this.addLine(0.14, 40, 0, 0, Math.PI / 2);
      const circle = new THREE.Mesh(new THREE.RingGeometry(2.85, 2.98, 64), this.lineMaterial());
      circle.rotation.x = -Math.PI / 2;
      circle.position.y = 0.014;
      group.add(circle);
      const spot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), this.lineMaterial());
      spot.rotation.x = -Math.PI / 2;
      spot.position.y = 0.015;
      group.add(spot);
      this.anchors.centerSpot = spot;
    }

    if (this.zone === 'penalty' || this.zone === 'crisis') {
      this.anchors.goal = this.buildGoal(-6.2);
      group.add(this.anchors.goal);
      this.addLine(0.14, 12, -1.2, 0, Math.PI / 2);
      const box = new THREE.Group();
      [-1.2 + 9.16, -1.2 - 9.16].forEach((x) => {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(18.32, 0.14), this.lineMaterial());
        side.rotation.x = -Math.PI / 2;
        side.position.set(x, 0.014, 0);
        box.add(side);
      });
      const front = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 18.32), this.lineMaterial());
      front.rotation.x = -Math.PI / 2;
      front.position.set(8, 0.014, 0);
      box.add(front);
      group.add(box);
      const penaltySpot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), this.lineMaterial());
      penaltySpot.rotation.x = -Math.PI / 2;
      penaltySpot.position.set(0.6, 0.015, 0);
      group.add(penaltySpot);
      this.anchors.penaltySpot = penaltySpot;
    }

    if (this.zone === 'touchline') {
      this.anchors.bench = this.buildBench();
      group.add(this.anchors.bench);
      this.anchors.adBoard = this.buildAdBoard();
      group.add(this.anchors.adBoard);
      const fence = this.buildFence();
      group.add(fence);
      this.anchors.fence = fence;
    }

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    ball.position.set(0, 0.22, 0);
    ball.castShadow = true;
    group.add(ball);
    this.anchors.ball = ball;

    this.buildStadiumPerimeter(group);

    this.character = group;
    this.scene.add(group);
    return group;
  }

  buildGoal(x) {
    const goal = new THREE.Group();
    goal.name = 'Goal';
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ea, roughness: 0.4 });
    [-1.9, 1.9].forEach((z) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 14), postMat);
      post.position.set(x, 1.2, z);
      post.castShadow = true;
      goal.add(post);
    });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.8, 14), postMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(x, 2.4, 0);
    goal.add(bar);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 16) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    const netTex = new THREE.CanvasTexture(canvas);
    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 2.4),
      new THREE.MeshBasicMaterial({ map: netTex, transparent: true, side: THREE.DoubleSide, opacity: 0.6 })
    );
    net.rotation.y = Math.PI / 2;
    net.position.set(x - 0.6, 1.2, 0);
    goal.add(net);
    this.anchors.net = net;
    return goal;
  }

  buildBench() {
    const bench = new THREE.Group();
    bench.name = 'DugoutBench';
    const metal = new THREE.MeshStandardMaterial({ color: 0x8892a6, metalness: 0.6, roughness: 0.4 });
    [-1.4, 1.4].forEach((z) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.08), metal);
      leg.position.set(0, 0.25, z);
      bench.add(leg);
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 3.4), metal);
    seat.position.y = 0.52;
    bench.add(seat);
    [1, 2, 3, 4].forEach((i) => {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0x18b8d0, transparent: true, opacity: 0.85 })
      );
      bottle.position.set(0, 0.68, -1.4 + i * 0.7);
      bench.add(bottle);
    });
    bench.position.set(0, 0, 4.5);
    return bench;
  }

  buildAdBoard() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b3121f';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#f7f4ea';
    ctx.font = 'bold 62px Arial Black, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KEK MAJU', 256, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.25),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    board.position.set(0, 0.63, 5.6);
    return board;
  }

  buildFence() {
    const fence = new THREE.Group();
    const rail = new THREE.MeshStandardMaterial({ color: 0x555c68, metalness: 0.5, roughness: 0.6 });
    [0.4, 0.9].forEach((y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 12), rail);
      bar.position.set(0, y, 6);
      fence.add(bar);
    });
    for (let z = 0; z < 12; z += 1.5) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), rail);
      post.position.set(0, 0.5, 6 - 6 + z);
      fence.add(post);
    }
    return fence;
  }

  adTexture(text, primary = '#b3121f', secondary = '#f7f4ea') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = secondary;
    ctx.font = 'bold 56px Arial Black, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 68);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  buildStadiumPerimeter(group) {
    const concrete = new THREE.MeshStandardMaterial({ color: 0x2d3745, roughness: 0.95 });
    const concreteAlt = new THREE.MeshStandardMaterial({ color: 0x364252, roughness: 0.95 });
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x1f6d4b, roughness: 0.9 });
    const stands = new THREE.Group();
    stands.name = 'Stands';

    const sides = [
      { axis: 'z', sign: -1, length: 32, offset: 16.5 },
      { axis: 'z', sign: 1, length: 32, offset: 16.5 },
      { axis: 'x', sign: -1, length: 26, offset: 26.5 },
      { axis: 'x', sign: 1, length: 26, offset: 26.5 },
    ];

    sides.forEach((side, sideIndex) => {
      for (let tier = 0; tier < 3; tier += 1) {
        const depth = 1.5;
        const height = 0.52;
        const width = side.axis === 'z' ? side.length : depth;
        const deep = side.axis === 'z' ? depth : side.length;
        const tierMesh = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, deep),
          (sideIndex + tier) % 2 ? concrete : concreteAlt
        );
        tierMesh.position.y = 0.26 + tier * 0.52;
        if (side.axis === 'z') {
          tierMesh.position.set(0, tierMesh.position.y, side.sign * (side.offset + tier * 1.25));
        } else {
          tierMesh.position.set(side.sign * (side.offset + tier * 1.25), tierMesh.position.y, 0);
        }
        tierMesh.receiveShadow = true;
        stands.add(tierMesh);
      }

      const backWidth = side.axis === 'z' ? side.length : 0.35;
      const backDeep = side.axis === 'z' ? 0.35 : side.length;
      const back = new THREE.Mesh(new THREE.BoxGeometry(backWidth, 2.1, backDeep), concrete);
      back.position.y = 1.05;
      if (side.axis === 'z') back.position.set(0, 1.05, side.sign * (side.offset + 3.8));
      else back.position.set(side.sign * (side.offset + 3.8), 1.05, 0);
      stands.add(back);

      const roofWidth = side.axis === 'z' ? side.length + 2 : 1.8;
      const roofDeep = side.axis === 'z' ? 1.8 : side.length + 2;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.16, roofDeep), concreteAlt);
      if (side.axis === 'z') roof.position.set(0, 3.1, side.sign * (side.offset + 3.4));
      else roof.position.set(side.sign * (side.offset + 3.4), 3.1, 0);
      stands.add(roof);
    });

    const rim = new THREE.Mesh(new THREE.BoxGeometry(58, 0.22, 1.2), seatMaterial);
    rim.position.set(0, 0.11, -13.4);
    stands.add(rim);
    group.add(stands);
    this.anchors.stands = stands;

    const boards = new THREE.Group();
    boards.name = 'PerimeterAdBoards';
    [
      { x: 0, z: -11.8, rotY: 0, text: 'KEK MAJU' },
      { x: 0, z: -11.8, rotY: 0, text: 'BULUH FC', offsetX: -9.4 },
      { x: 0, z: -11.8, rotY: 0, text: 'NEXUS SPORTS', offsetX: 9.4 },
      { x: -9.6, z: 0, rotY: Math.PI / 2, text: 'DIVISYEN 5' },
      { x: 12.4, z: 0, rotY: -Math.PI / 2, text: 'BULUH FC' },
    ].forEach((item, index) => {
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(8.4, 1.1),
        new THREE.MeshBasicMaterial({
          map: this.adTexture(item.text, index % 2 ? '#141821' : '#b3121f'),
          side: THREE.DoubleSide,
        })
      );
      board.position.set(item.x + (item.offsetX || 0), 0.58, item.z);
      board.rotation.y = item.rotY;
      boards.add(board);
    });
    group.add(boards);
    this.anchors.adBoards = boards;

    this.buildCrowd(group);
    this.buildFloodlightTower(-27, -16, 0, {}, group);
    this.buildFloodlightTower(27, -16, 1, {}, group);
    this.buildFloodlightTower(-27, 16, 2, {}, group);
    this.buildFloodlightTower(27, 16, 3, {}, group);
  }

  buildCrowd(group) {
    const palette = [0xb3121f, 0x1b1d22, 0xf2f2ee, 0x2b6cb0, 0xd8b26a, 0x2f7a3d];
    const sides = [
      { axis: 'z', sign: -1, length: 30, offset: 16.5, yaw: 0 },
      { axis: 'z', sign: 1, length: 30, offset: 16.5, yaw: Math.PI },
      { axis: 'x', sign: -1, length: 24, offset: 26.5, yaw: Math.PI / 2 },
      { axis: 'x', sign: 1, length: 24, offset: 26.5, yaw: -Math.PI / 2 },
    ];
    const tiers = 3;
    const perTier = 34;
    const count = sides.length * tiers * perTier;
    const geometry = new THREE.BoxGeometry(0.16, 0.42, 0.16);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const crowd = new THREE.InstancedMesh(geometry, material, count);
    crowd.name = 'Crowd';
    crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crowd.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let index = 0;
    sides.forEach((side, sideIndex) => {
      for (let tier = 0; tier < tiers; tier += 1) {
        for (let seat = 0; seat < perTier; seat += 1) {
          const seed = sideIndex * 10000 + tier * 1000 + seat * 7;
          const along = (seat / (perTier - 1) - 0.5) * side.length;
          const jitter = (seededUnit(seed) - 0.5) * 0.18;
          const depth = side.offset + tier * 1.25 + jitter;
          const x = side.axis === 'z' ? along + jitter * 0.4 : side.sign * depth;
          const z = side.axis === 'z' ? side.sign * depth : along + jitter * 0.4;
          const y = 0.82 + tier * 0.55 + seededUnit(seed + 3) * 0.08;
          const yaw = side.yaw + (seededUnit(seed + 7) - 0.5) * 0.25;
          dummy.position.set(x, y, z);
          dummy.rotation.set(0, yaw, 0);
          dummy.updateMatrix();
          crowd.setMatrixAt(index, dummy.matrix);
          color.setHex(palette[(sideIndex + tier + seat) % palette.length]);
          crowd.setColorAt(index, color);
          this.stadium.crowdBase.push({ x, y, z, yaw, phase: seededUnit(seed + 11) * Math.PI * 2 });
          index += 1;
        }
      }
    });
    crowd.instanceMatrix.needsUpdate = true;
    if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
    group.add(crowd);
    this.stadium.crowd = crowd;
    this.anchors.crowd = crowd;
  }

  buildFloodlightTower(x, z, index, { height = 8.5, hero = false } = {}, parent = null) {
    const tower = new THREE.Group();
    tower.name = `Floodlight-${index}`;
    const metal = new THREE.MeshStandardMaterial({ color: 0x3c434c, metalness: 0.6, roughness: 0.5 });
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(hero ? 0.14 : 0.1, hero ? 0.24 : 0.17, height, 10),
      metal
    );
    mast.position.y = height / 2;
    tower.add(mast);

    const rig = new THREE.Mesh(
      new THREE.BoxGeometry(hero ? 2.2 : 1.8, hero ? 0.72 : 0.56, 0.28),
      metal
    );
    rig.position.y = height;
    tower.add(rig);

    const panelMaterial = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
    const offsets = hero ? [-0.68, 0, 0.68] : [-0.56, 0, 0.56];
    offsets.forEach((offset) => {
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(hero ? 0.55 : 0.42, hero ? 0.44 : 0.34, 0.1),
        panelMaterial
      );
      lamp.position.set(offset, height, 0.2);
      tower.add(lamp);
    });

    const sparkCount = 32;
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = seededUnit(index * 1000 + i * 3) * Math.PI * 2;
      const radius = 0.2 + seededUnit(index * 1000 + i * 5) * 0.95;
      sparkPositions[i * 3] = Math.cos(angle) * radius;
      sparkPositions[i * 3 + 1] = (seededUnit(index * 1000 + i * 7) - 0.5) * 1.2;
      sparkPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMaterial = new THREE.PointsMaterial({
      color: 0xffd070,
      size: 0.06,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    sparks.name = 'FloodSparks';
    sparks.position.y = height - 0.1;
    sparks.visible = false;
    tower.add(sparks);

    const smoke = new THREE.Group();
    smoke.name = 'FloodSmoke';
    smoke.position.y = height;
    smoke.visible = false;
    for (let i = 0; i < 5; i += 1) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x2a2d31, transparent: true, opacity: 0 })
      );
      puff.position.set(
        (seededUnit(index * 500 + i) - 0.5) * 0.9,
        0.2 + i * 0.18,
        (seededUnit(index * 700 + i) - 0.5) * 0.5
      );
      smoke.add(puff);
    }
    tower.add(smoke);

    tower.position.set(x, 0, z);
    (parent || this.character).add(tower);

    const record = {
      group: tower,
      panelMaterial,
      sparks,
      smoke,
      index,
      height,
      hero,
      exploded: false,
      explodedAt: 0,
    };
    this.stadium.towers.push(record);
    this.stadium.panels.push(panelMaterial);
    this.anchors.floodTowers = this.stadium.towers;
    return record;
  }

  updateCrowd(frame, excitement = 0.08) {
    const crowd = this.stadium.crowd;
    if (!crowd) return;
    const dummy = new THREE.Object3D();
    const base = this.stadium.crowdBase;
    const amplitude = 0.012 + 0.055 * Math.max(0, excitement);
    for (let i = 0; i < base.length; i += 1) {
      const item = base[i];
      const bounce = Math.sin(frame * 0.21 + item.phase) * amplitude;
      dummy.position.set(item.x, item.y + bounce, item.z);
      dummy.rotation.set(0, item.yaw, 0);
      dummy.updateMatrix();
      crowd.setMatrixAt(i, dummy.matrix);
    }
    crowd.instanceMatrix.needsUpdate = true;
  }

  setFloodlightExploded(index, exploded, frame = 0) {
    const tower = this.stadium.towers[index];
    if (!tower) return;
    tower.exploded = exploded;
    tower.explodedAt = exploded ? frame : 0;
    if (exploded) {
      tower.panelMaterial.color.setHex(0x26251f);
      tower.group.rotation.z = 0.11;
    } else {
      tower.panelMaterial.color.setHex(0xffe9a8);
      tower.group.rotation.z = 0;
    }
    if (!exploded) {
      tower.sparks.visible = false;
      tower.smoke.visible = false;
    }
  }

  updateFloodlights(frame) {
    this.stadium.towers.forEach((tower) => {
      if (!tower.exploded) return;
      const dt = Math.max(0, frame - tower.explodedAt);
      tower.sparks.visible = dt < 48;
      tower.sparks.material.opacity = dt < 48
        ? Math.max(0, 1 - dt / 48) * (0.55 + 0.35 * Math.abs(Math.sin(frame * 0.9)))
        : 0;
      tower.sparks.rotation.y = frame * 0.04;

      tower.smoke.visible = dt < 100;
      tower.smoke.children.forEach((puff, i) => {
        const t = Math.max(0, dt - i * 5) / 70;
        puff.position.y = 0.2 + t * 2.6;
        puff.scale.setScalar(0.6 + t * 2.1);
        puff.material.opacity = Math.max(0, 0.34 * (1 - t));
      });
    });
  }

  dispose() {
    if (this.scene && this.character) this.scene.remove(this.character);
    this.character = null;
    this.stadium = { crowd: null, crowdBase: [], towers: [], panels: [] };
    this._dead = true;
  }
}

export class PitchCenterCircleApp extends ModularPitchZoneApp {
  constructor(container) { super(container, 'center'); }
}
export class PitchPenaltyBoxApp extends ModularPitchZoneApp {
  constructor(container) { super(container, 'penalty'); }
}
export class PitchTouchlineApp extends ModularPitchZoneApp {
  constructor(container) { super(container, 'touchline'); }
}
