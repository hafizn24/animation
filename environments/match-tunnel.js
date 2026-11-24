import * as THREE from 'three';

/** MatchTunnel — low-poly concrete corridor for Ep. 8 bribe offer and Ep. 11 halftime walk-off. */
export class MatchTunnelApp {
  constructor(container) {
    this.container = container;
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
    this.scene.background = new THREE.Color(0x121418);
    this.scene.fog = new THREE.Fog(0x121418, 8, 24);
  }

  addLights() {
    const ambient = new THREE.AmbientLight(0x8d97a8, 0.5);
    ambient.name = 'tunnelAmbient';
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    const strip1 = new THREE.PointLight(0xffffff, 5, 9, 2);
    strip1.position.set(0, 2.6, -2.5);
    this.scene.add(strip1);
    this.lights.strip1 = strip1;

    const strip2 = new THREE.PointLight(0xdde8ff, 4, 9, 2);
    strip2.position.set(0, 2.6, 2.5);
    this.scene.add(strip2);
    this.lights.strip2 = strip2;

    const exit = new THREE.PointLight(0xfff3d0, 9, 14, 2);
    exit.position.set(0, 1.8, -7.5);
    this.scene.add(exit);
    this.lights.exit = exit;
  }

  createProceduralCharacter() {
    if (this.character) this.dispose();
    const group = new THREE.Group();
    group.name = 'MatchTunnel';

    const concrete = new THREE.MeshStandardMaterial({ color: 0x6c737d, roughness: 0.95 });
    [-2.6, 2.6].forEach((x) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 20), concrete);
      wall.position.set(x, 1.6, 0);
      wall.receiveShadow = true;
      group.add(wall);
    });
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.25, 20), concrete);
    ceiling.position.set(0, 3.2, 0);
    group.add(ceiling);
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.1, 20),
      new THREE.MeshStandardMaterial({ color: 0x3f444c, roughness: 0.9 })
    );
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    group.add(floor);

    const fluorescent = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-3.5, 0, 3.5].forEach((z) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.22), fluorescent);
      bar.position.set(0, 3.02, z);
      group.add(bar);
    });

    const exitGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.8),
      new THREE.MeshBasicMaterial({ color: 0xeaf6ff })
    );
    exitGlow.position.set(0, 1.45, -9.8);
    group.add(exitGlow);
    this.anchors.exitGlow = exitGlow;

    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.8),
      new THREE.MeshBasicMaterial({ map: this.createBannerTexture(), side: THREE.DoubleSide })
    );
    banner.position.set(-2.42, 1.85, 0.5);
    banner.rotation.y = Math.PI / 2;
    group.add(banner);
    this.anchors.banner = banner;

    this.character = group;
    this.scene.add(group);
    return group;
  }

  createBannerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#d8b26a';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#d8b26a';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DIVISYEN 5', 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  dispose() {
    if (this.scene && this.character) this.scene.remove(this.character);
    this.character = null;
    this._dead = true;
  }
}
