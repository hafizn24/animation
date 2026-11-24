import * as THREE from 'three';

/**
 * ModularPitchZone — one shared grass plane + lighting rig with three swappable
 * camera zones. Only the geometry that fits inside a 9:16 vertical frame is
 * built; directors toggle character.visible between cuts instead of loading a
 * full stadium. Used in Ep. 6, 7, 8, 10, 11 and 12.
 */
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
  }

  async init() {
    this.setupScene();
    this.addLights();
    this.createProceduralCharacter();
    return this;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x76b7e8);
    this.scene.fog = new THREE.Fog(0x76b7e8, 18, 48);
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

  dispose() {
    if (this.scene && this.character) this.scene.remove(this.character);
    this.character = null;
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
