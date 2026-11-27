import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BaseEnvironmentApp } from './core/BaseEnvironmentApp.js';

/**
 * SponsorOfficeApp – Procedural 3D model of "NEXUS SPORTS'" modern glass-walled
 * headquarters, used as a bright corporate film location.
 */
export class SponsorOfficeApp extends BaseEnvironmentApp {
  constructor(container) {
    super(container);
    this.envId = 'sponsor-office';
    this.isIndoor = true;
    this.roomBounds = { halfW: 6, halfD: 5, height: 3.6 };
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };
  }


  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbe7f0);
    this.scene.fog = new THREE.Fog(0xdbe7f0, 26, 62);
  }

  setupCamera() {
    const aspect = this.cameraAspect();
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 200);
    this.camera.position.set(3.2, 2.0, 4.8);
    this.homeCamera = [3.2, 2.0, 4.8];
    this.homeTarget = [0, 1.2, -0.8];
  }


  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.2, -0.8);
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0xdfeaf5, 0.85));

    const key = new THREE.DirectionalLight(0xf2f8ff, 1.6);
    key.position.set(-6, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 28;
    key.shadow.bias = -0.0004;
    this.scene.add(key);

    const hemi = new THREE.HemisphereLight(0xeaf4ff, 0x9aa6b2, 0.7);
    this.scene.add(hemi);

    const ceilingA = new THREE.PointLight(0xeaf4ff, 9, 13, 2);
    ceilingA.position.set(-2.6, 3.15, 0.5);
    this.scene.add(ceilingA);

    const ceilingB = new THREE.PointLight(0xeaf4ff, 9, 13, 2);
    ceilingB.position.set(2.6, 3.15, -1.2);
    this.scene.add(ceilingB);

    const deskFill = new THREE.PointLight(0xdcecff, 5, 7, 2);
    deskFill.position.set(0, 1.9, -1.0);
    this.scene.add(deskFill);
  }




  // Misnamed on purpose: sceneKit.js calls this to build the environment.
  createProceduralCharacter() {
    if (this.character) this.disposeCharacter();

    const root = new THREE.Group();
    root.name = 'SponsorOffice';
    this.wallCull = { back: [], front: [], left: [], right: [], ceiling: [] };

    const { halfW: W, halfD: D, height: H } = this.roomBounds;

    const concreteTex = this.makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#cbd5dd';
      ctx.fillRect(0, 0, w, h);
      let seed = 23;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let i = 0; i < 2600; i++) {
        const s = rand() > 0.5 ? '#d8e0e6' : '#bcc7d0';
        ctx.globalAlpha = 0.25 + rand() * 0.35;
        ctx.fillStyle = s;
        ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
      }
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#b3bfc9';
      ctx.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 4, 0);
        ctx.lineTo((i * w) / 4, h);
        ctx.moveTo(0, (i * h) / 4);
        ctx.lineTo(w, (i * h) / 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });

    const cityTex = this.makeCanvasTexture(1024, 512, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#7fb6dc');
      sky.addColorStop(0.6, '#c4e0f2');
      sky.addColorStop(1, '#eaf5fb');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 6; i++) ctx.fillRect((i * 180) % w, 30 + (i % 3) * 25, 120, 14);
      let seed = 11;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const shades = ['#8ba6bb', '#7d9ab2', '#9db3c5', '#6f8ba5'];
      let x = -20;
      while (x < w + 20) {
        const bw = 28 + rand() * 70;
        const bh = h * (0.22 + rand() * 0.5);
        const by = h - bh;
        ctx.fillStyle = shades[Math.floor(rand() * shades.length)];
        ctx.fillRect(x, by, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        for (let wy = by + 8; wy < h - 6; wy += 12) {
          for (let wx = x + 5; wx < x + bw - 4; wx += 9) {
            if (rand() > 0.45) ctx.fillRect(wx, wy, 3, 5);
          }
        }
        x += bw + 4;
      }
      ctx.fillStyle = 'rgba(220,235,245,0.35)';
      ctx.fillRect(0, h - 30, w, 30);
    });

    const ballTex = this.makeCanvasTexture(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#f4f6f5';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#26313c';
      const pent = (cx, cy, r, rot) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = rot + (i * Math.PI * 2) / 5;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };
      pent(w * 0.16, h * 0.35, h * 0.26, -Math.PI / 2);
      pent(w * 0.52, h * 0.72, h * 0.26, -Math.PI / 2);
      pent(w * 0.88, h * 0.35, h * 0.26, -Math.PI / 2);
    });

    const jerseyTex = this.makeCanvasTexture(384, 512, (ctx, w, h) => {
      ctx.fillStyle = '#eef3f7';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1d2b3a';
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.16);
      ctx.lineTo(w * 0.4, h * 0.1);
      ctx.lineTo(w * 0.6, h * 0.1);
      ctx.lineTo(w * 0.72, h * 0.16);
      ctx.lineTo(w * 0.9, h * 0.34);
      ctx.lineTo(w * 0.75, h * 0.46);
      ctx.lineTo(w * 0.68, h * 0.36);
      ctx.lineTo(w * 0.68, h * 0.9);
      ctx.lineTo(w * 0.32, h * 0.9);
      ctx.lineTo(w * 0.32, h * 0.36);
      ctx.lineTo(w * 0.25, h * 0.46);
      ctx.lineTo(w * 0.1, h * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#37b6d6';
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.2);
      ctx.lineTo(w * 0.42, h * 0.1);
      ctx.lineTo(w * 0.9, h * 0.5);
      ctx.lineTo(w * 0.9, h * 0.66);
      ctx.lineTo(w * 0.1, h * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#eef3f7';
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(w * 0.13)}px Arial, sans-serif`;
      ctx.fillText('NEXUS', w / 2, h * 0.28);
      ctx.font = `bold ${Math.round(w * 0.3)}px Arial, sans-serif`;
      ctx.fillText('10', w / 2, h * 0.68);
    });

    const clockTex = this.makeCanvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#f7fafc';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#4a5966';
      ctx.fillStyle = '#4a5966';
      ctx.lineWidth = 5;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38);
        ctx.lineTo(w / 2 + Math.cos(a) * w * 0.45, h / 2 + Math.sin(a) * h * 0.45);
        ctx.stroke();
      }
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2, h * 0.26);
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w * 0.72, h * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    const mat = {
      floor: this.createStdMaterial(0xffffff, { map: concreteTex, roughness: 0.34, metalness: 0.12 }),
      wall: this.createStdMaterial(0xe7edf2, { roughness: 0.9 }),
      panel: this.createStdMaterial(0xf4f7fa, { roughness: 0.85 }),
      ceiling: this.createStdMaterial(0xf7fafc, { roughness: 0.95 }),
      desk: this.createStdMaterial(0xf2f5f7, { roughness: 0.4 }),
      deskEdge: this.createStdMaterial(0xd6dfe6, { roughness: 0.5 }),
      metal: this.createStdMaterial(0xb6c2cc, { roughness: 0.28, metalness: 0.7 }),
      metalDark: this.createStdMaterial(0x6b7884, { roughness: 0.4, metalness: 0.6 }),
      leather: this.createStdMaterial(0x2e3a46, { roughness: 0.55 }),
      leatherLight: this.createStdMaterial(0x546675, { roughness: 0.6 }),
      glass: this.createStdMaterial(0xbcd8ea, {
        roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.24,
        depthWrite: false, side: THREE.DoubleSide,
      }),
      city: this.createStdMaterial(0xffffff, {
        map: cityTex, roughness: 1, emissive: 0x6f93b3, emissiveIntensity: 0.35,
      }),
      led: this.createStdMaterial(0xffffff, {
        emissive: 0xbfe0ff, emissiveIntensity: 1.4, roughness: 0.3,
      }),
      screen: this.createStdMaterial(0x1d2733, {
        roughness: 0.2, metalness: 0.3, emissive: 0x0f2130, emissiveIntensity: 0.4,
      }),
      silver: this.createStdMaterial(0xdfe6ec, { roughness: 0.2, metalness: 0.85 }),
      plantGreen: this.createStdMaterial(0x3f7d52, { roughness: 0.85 }),
      pot: this.createStdMaterial(0xd7dde2, { roughness: 0.6 }),
    };

    const box = (w, h, d, material, x, y, z, parent = root) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const cyl = (rTop, rBottom, height_, material, x, y, z, parent = root, segments = 16) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, height_, segments),
        material
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const quad = (w, h, material, x, y, z, parent = root) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // Shell
    const floor = box(W * 2, 0.12, D * 2, mat.floor, 0, -0.06, 0);
    floor.castShadow = false;

    const back = box(W * 2, H, 0.14, mat.wall, 0, H / 2, -D);
    this.wallCull.back.push(back);
    const right = box(0.14, H, D * 2, mat.wall, W, H / 2, 0);
    this.wallCull.right.push(right);

    const ceiling = box(W * 2, 0.12, D * 2, mat.ceiling, 0, H + 0.02, 0);
    ceiling.castShadow = false;
    this.wallCull.ceiling.push(ceiling);

    // Linear LED strips
    const ceilingLights = new THREE.Group();
    for (const x of [-4.2, -1.4, 1.4, 4.2]) {
      const strip = box(0.1, 0.06, 8.4, mat.led, x, H - 0.08, -0.2, ceilingLights);
      strip.castShadow = false;
      box(0.16, 0.04, 8.5, mat.metal, x, H - 0.04, -0.2, ceilingLights).castShadow = false;
    }
    root.add(ceilingLights);
    this.wallCull.ceiling.push(ceilingLights);

    // Glass curtain walls with a daylight city skyline
    const glassWall = new THREE.Group();
    root.add(glassWall);

    const leftGlass = new THREE.Group();
    glassWall.add(leftGlass);
    const leftCity = quad(D * 2 - 0.1, H - 0.1, mat.city, -W - 0.06, H / 2, 0, leftGlass);
    leftCity.rotation.y = Math.PI / 2;
    const leftPane = quad(D * 2 - 0.1, H - 0.1, mat.glass, -W + 0.02, H / 2, 0, leftGlass);
    leftPane.rotation.y = Math.PI / 2;
    for (let i = 0; i <= 5; i++) {
      box(0.09, H, 0.09, mat.metalDark, -W + 0.04, H / 2, -D + (i * D * 2) / 5, leftGlass);
    }
    box(0.14, 0.14, D * 2, mat.metalDark, -W + 0.04, 0.12, 0, leftGlass);
    box(0.14, 0.14, D * 2, mat.metalDark, -W + 0.04, H - 0.12, 0, leftGlass);
    this.wallCull.left.push(leftGlass);

    const frontGlass = new THREE.Group();
    glassWall.add(frontGlass);
    const frontCity = quad(W * 2 - 0.1, H - 0.1, mat.city, 0, H / 2, D + 0.06, frontGlass);
    frontCity.rotation.y = Math.PI;
    const frontPane = quad(W * 2 - 0.1, H - 0.1, mat.glass, 0, H / 2, D - 0.02, frontGlass);
    frontPane.rotation.y = Math.PI;
    for (let i = 0; i <= 6; i++) {
      box(0.09, H, 0.09, mat.metalDark, -W + (i * W * 2) / 6, H / 2, D - 0.04, frontGlass);
    }
    box(W * 2, 0.14, 0.14, mat.metalDark, 0, 0.12, D - 0.04, frontGlass);
    box(W * 2, 0.14, 0.14, mat.metalDark, 0, H - 0.12, D - 0.04, frontGlass);
    this.wallCull.front.push(frontGlass);

    // Feature wall with sponsor logo
    const logoWall = new THREE.Group();
    box(W * 1.1, 2.3, 0.05, mat.panel, 0, 1.9, -D + 0.1, logoWall);
    box(W * 1.1, 0.04, 0.07, mat.metal, 0, 0.75, -D + 0.14, logoWall);
    const logoTexture = this.makeCanvasTexture(768, 256, (ctx, w, h) => {
      ctx.fillStyle = '#f4f7fa';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1d2b3a';
      ctx.beginPath();
      ctx.moveTo(h * 0.2, h * 0.18);
      ctx.lineTo(h * 0.52, h * 0.5);
      ctx.lineTo(h * 0.2, h * 0.82);
      ctx.lineTo(h * 0.04, h * 0.64);
      ctx.lineTo(h * 0.04, h * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#37b6d6';
      ctx.beginPath();
      ctx.moveTo(h * 0.56, h * 0.18);
      ctx.lineTo(h * 0.88, h * 0.5);
      ctx.lineTo(h * 0.56, h * 0.82);
      ctx.lineTo(h * 0.4, h * 0.64);
      ctx.lineTo(h * 0.4, h * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1d2b3a';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(h * 0.4)}px Arial, sans-serif`;
      ctx.fillText('NEXUS', h * 1.02, h * 0.52);
      ctx.fillStyle = '#5b6b79';
      ctx.font = `bold ${Math.round(h * 0.17)}px Arial, sans-serif`;
      ctx.fillText('S P O R T S', h * 1.04, h * 0.76);
    });
    const logo = quad(4.2, 1.4, this.createStdMaterial(0xffffff, {
      map: logoTexture, roughness: 0.7, emissive: 0x243647, emissiveIntensity: 0.12,
    }), 0, 1.95, -D + 0.15, logoWall);
    logo.castShadow = false;
    root.add(logoWall);
    this.wallCull.back.push(logoWall);

    // Long minimalist desk
    const desk = new THREE.Group();
    desk.position.set(0, 0, -1.0);
    box(3.8, 0.06, 1.3, mat.desk, 0, 0.76, 0, desk);
    box(3.82, 0.02, 1.32, mat.deskEdge, 0, 0.72, 0, desk);
    box(0.08, 0.72, 1.0, mat.metal, -1.62, 0.36, 0, desk);
    box(0.08, 0.72, 1.0, mat.metal, 1.62, 0.36, 0, desk);
    box(0.7, 0.04, 1.05, mat.metalDark, -1.62, 0.03, 0, desk);
    box(0.7, 0.04, 1.05, mat.metalDark, 1.62, 0.03, 0, desk);
    box(2.9, 0.38, 0.04, mat.panel, 0, 0.5, -0.55, desk);
    const monitor = new THREE.Group();
    monitor.position.set(-0.95, 0.8, -0.22);
    desk.add(monitor);
    box(0.5, 0.02, 0.24, mat.silver, 0, 0.01, 0, monitor);
    box(0.05, 0.26, 0.05, mat.metalDark, 0, 0.14, 0, monitor);
    const screen = box(1.1, 0.64, 0.04, mat.screen, 0, 0.56, -0.02, monitor);
    screen.rotation.x = -0.08;
    const laptop = new THREE.Group();
    laptop.position.set(0.95, 0.8, 0.12);
    desk.add(laptop);
    box(0.72, 0.02, 0.48, mat.silver, 0, 0, 0, laptop);
    const lid = box(0.72, 0.46, 0.02, mat.silver, 0, 0.23, -0.24, laptop);
    lid.rotation.x = -0.32;
    box(0.34, 0.008, 0.44, mat.screen, 0, 0.01, 0, laptop);
    box(0.42, 0.008, 0.3, mat.panel, -0.05, 0.8, 0.32, desk).rotation.y = 0.16;
    cyl(0.05, 0.045, 0.1, mat.panel, 1.5, 0.81, 0.28, desk, 16);
    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.01, 8, 16), mat.panel);
    mugHandle.position.set(1.56, 0.81, 0.28);
    mugHandle.rotation.y = Math.PI / 2;
    desk.add(mugHandle);
    root.add(desk);

    // Leather chairs
    const chairs = new THREE.Group();
    const makeChair = (x, z, ry, material) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      chairs.add(g);
      box(0.62, 0.12, 0.6, material, 0, 0.5, 0, g);
      box(0.6, 0.72, 0.12, material, 0, 0.92, -0.26, g);
      box(0.1, 0.05, 0.46, mat.metalDark, -0.34, 0.72, 0, g);
      box(0.1, 0.05, 0.46, mat.metalDark, 0.34, 0.72, 0, g);
      box(0.05, 0.22, 0.05, mat.metalDark, -0.34, 0.6, 0, g);
      box(0.05, 0.22, 0.05, mat.metalDark, 0.34, 0.6, 0, g);
      cyl(0.05, 0.05, 0.36, mat.metalDark, 0, 0.26, 0, g, 12);
      for (let s = 0; s < 5; s++) {
        const a = (s / 5) * Math.PI * 2;
        box(0.05, 0.04, 0.34, mat.metalDark, Math.sin(a) * 0.16, 0.08, Math.cos(a) * 0.16, g).rotation.y = a;
      }
      return g;
    };
    makeChair(0, -2.25, 0, mat.leather);
    makeChair(-1.15, 0.75, Math.PI, mat.leatherLight);
    makeChair(1.15, 0.75, Math.PI, mat.leatherLight);
    root.add(chairs);

    // Merchandise display shelf and framed jersey
    const displayShelf = new THREE.Group();
    displayShelf.position.set(3.7, 0, -D + 0.35);
    box(2.2, 1.9, 0.42, mat.panel, 0, 0.95, 0, displayShelf);
    box(2.1, 1.8, 0.02, mat.glass, 0, 0.95, 0.23, displayShelf).castShadow = false;
    box(2.24, 0.06, 0.46, mat.metal, 0, 1.92, 0, displayShelf);
    for (const sy of [0.62, 1.22]) {
      box(2.05, 0.05, 0.38, mat.desk, 0, sy, 0.02, displayShelf);
    }
    for (let i = 0; i < 3; i++) {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 18, 14),
        this.createStdMaterial(0xffffff, { map: ballTex, roughness: 0.55 })
      );
      ball.position.set(-0.65 + i * 0.55, 0.78, 0.05);
      ball.rotation.set(i * 0.7, i * 0.9, i * 0.3);
      ball.castShadow = true;
      displayShelf.add(ball);
    }
    for (let i = 0; i < 2; i++) {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 18, 14),
        this.createStdMaterial(0xffffff, { map: ballTex, roughness: 0.55 })
      );
      ball.position.set(-0.35 + i * 0.7, 1.38, 0.05);
      ball.rotation.set(i * 0.5, i * 1.1, 0.4);
      ball.castShadow = true;
      displayShelf.add(ball);
    }
    box(1.15, 1.45, 0.06, mat.metalDark, 0, 2.72, -0.08, displayShelf);
    quad(1.0, 1.3, this.createStdMaterial(0xffffff, { map: jerseyTex, roughness: 0.75 }),
      0, 2.72, -0.04, displayShelf);
    root.add(displayShelf);
    this.wallCull.back.push(displayShelf);

    // Potted plant
    const plant = new THREE.Group();
    plant.position.set(-4.7, 0, 3.6);
    cyl(0.3, 0.24, 0.52, mat.pot, 0, 0.26, 0, plant, 18);
    cyl(0.27, 0.27, 0.03, mat.metalDark, 0, 0.52, 0, plant, 18);
    cyl(0.04, 0.05, 0.9, mat.plantGreen, 0, 0.95, 0, plant, 10);
    for (let l = 0; l < 8; l++) {
      const a = (l / 8) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), mat.plantGreen);
      leaf.scale.set(0.55, 0.3, 1);
      leaf.position.set(Math.sin(a) * 0.28, 1.15 + (l % 3) * 0.16, Math.cos(a) * 0.28);
      leaf.rotation.y = a;
      leaf.rotation.z = -0.4;
      leaf.castShadow = true;
      plant.add(leaf);
    }
    root.add(plant);

    // Wall clock
    const clock = new THREE.Group();
    clock.position.set(W - 0.08, 2.6, 0.6);
    clock.rotation.y = -Math.PI / 2;
    cyl(0.32, 0.32, 0.06, mat.silver, 0, 0, 0, clock, 24).rotation.x = Math.PI / 2;
    quad(0.56, 0.56, this.createStdMaterial(0xffffff, { map: clockTex, roughness: 0.6 }),
      0, 0, 0.035, clock);
    root.add(clock);
    this.wallCull.right.push(clock);

    this.characterParts = {
      floor, desk, logoWall, glassWall, chairs, displayShelf, clock,
      ceilingLights, plant,
    };
    this.character = root;
    this.scene.add(root);
    this.updateWallVisibility();
    this.applyDressing(this.character);
    return root;
  }




}
