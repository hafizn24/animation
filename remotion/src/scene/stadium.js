import * as THREE from 'three';
import {
  createAdTexture,
  createCrestTexture,
  createNetTexture,
  createRandom,
} from './textures.js';

/**
 * The Oaks – a small floodlit football ground.
 *
 * Pitch runs along Z (-40 .. 40), the camera attacks the goal at +Z.
 */

export const PITCH = {
  halfWidth: 26,
  halfLength: 40,
  goalWidth: 7.3,
  goalHeight: 2.44,
};

export function buildStadium() {
  const group = new THREE.Group();
  group.name = 'Stadium';

  const mat = {
    grass: new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 0.95 }),
    grassLight: new THREE.MeshStandardMaterial({ color: 0x377a3c, roughness: 0.95 }),
    line: new THREE.MeshStandardMaterial({ color: 0xf2f4ef, roughness: 0.8 }),
    surround: new THREE.MeshStandardMaterial({ color: 0x1b2a1c, roughness: 1 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x555a60, roughness: 0.9 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: 0x33373c, roughness: 0.9 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x9aa2ab, roughness: 0.35, metalness: 0.7 }),
    post: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.3 }),
    lamp: new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xfff3d0, emissiveIntensity: 3.2, roughness: 0.3,
    }),
    seat: new THREE.MeshStandardMaterial({ color: 0x1f3f6b, roughness: 0.8 }),
    board: new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.7 }),
  };

  const box = (w, h, d, material, x, y, z, parent = group) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // ---------------------------------------------------------------
  // Pitch
  // ---------------------------------------------------------------
  const pw = PITCH.halfWidth * 2;
  const pl = PITCH.halfLength * 2;

  const surround = new THREE.Mesh(new THREE.PlaneGeometry(pw + 30, pl + 30), mat.surround);
  surround.rotation.x = -Math.PI / 2;
  surround.position.y = -0.02;
  surround.receiveShadow = true;
  group.add(surround);

  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(pw, pl), mat.grass);
  pitch.rotation.x = -Math.PI / 2;
  pitch.receiveShadow = true;
  group.add(pitch);

  // Mowing stripes
  const stripes = 12;
  for (let i = 0; i < stripes; i += 2) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(pw - 0.4, pl / stripes - 0.25),
      mat.grassLight
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.005, -pl / 2 + (pl / stripes) * (i + 0.5));
    stripe.receiveShadow = true;
    group.add(stripe);
  }

  // Line markings
  const lineY = 0.012;
  const addLine = (w, d, x, z) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat.line);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, lineY, z);
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  const t = 0.14;
  addLine(pw, t, 0, -PITCH.halfLength);
  addLine(pw, t, 0, PITCH.halfLength);
  addLine(t, pl, -PITCH.halfWidth, 0);
  addLine(t, pl, PITCH.halfWidth, 0);
  addLine(pw, t, 0, 0);

  const circle = new THREE.Mesh(new THREE.RingGeometry(7.5, 7.5 + t, 48), mat.line);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = lineY;
  group.add(circle);

  // Penalty areas
  [-1, 1].forEach((side) => {
    const pz = side * PITCH.halfLength;
    const dir = -side;
    addLine(24, t, 0, pz + dir * 9);
    addLine(t, 18, -12, pz + dir * 9);
    addLine(t, 18, 12, pz + dir * 9);
    addLine(9, t, 0, pz + dir * 5);
    addLine(t, 10, -4.5, pz + dir * 5);
    addLine(t, 10, 4.5, pz + dir * 5);
  });

  // ---------------------------------------------------------------
  // Goals
  // ---------------------------------------------------------------
  const netMaterial = new THREE.MeshBasicMaterial({
    map: createNetTexture(),
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const goalDepth = 2.6;
  [-1, 1].forEach((side) => {
    const goal = new THREE.Group();
    goal.name = `Goal_${side > 0 ? 'North' : 'South'}`;
    const gz = side * PITCH.halfLength;

    const post = (x) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, PITCH.goalHeight, 12),
        mat.post
      );
      mesh.position.set(x, PITCH.goalHeight / 2, gz);
      mesh.castShadow = true;
      goal.add(mesh);
    };
    post(-PITCH.goalWidth / 2);
    post(PITCH.goalWidth / 2);

    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, PITCH.goalWidth, 12),
      mat.post
    );
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, PITCH.goalHeight, gz);
    crossbar.castShadow = true;
    goal.add(crossbar);

    // Net panels
    const back = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.goalWidth, PITCH.goalHeight), netMaterial);
    back.position.set(0, PITCH.goalHeight / 2, gz + side * goalDepth);
    goal.add(back);

    [-1, 1].forEach((s) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, PITCH.goalHeight), netMaterial);
      panel.rotation.y = Math.PI / 2;
      panel.position.set(s * PITCH.goalWidth / 2, PITCH.goalHeight / 2, gz + (side * goalDepth) / 2);
      goal.add(panel);
    });

    const top = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.goalWidth, goalDepth), netMaterial);
    top.rotation.x = Math.PI / 2;
    top.position.set(0, PITCH.goalHeight, gz + (side * goalDepth) / 2);
    goal.add(top);

    group.add(goal);
  });

  // ---------------------------------------------------------------
  // Advertising hoardings
  // ---------------------------------------------------------------
  const ads = [
    ['A&B BUILDERS', '#f2f2ee', '#101216'],
    ['THE CROWN TAP', '#122b56', '#f6f6f2'],
    ['GULF GARAGE', '#f2f2ee', '#101216'],
    ['OAKHAVEN UNITED', '#14532d', '#f6f6f2'],
    ['LOCAL DENTAL', '#f2f2ee', '#101216'],
  ];

  const addHoarding = (x, z, rotY, text, bg, fg) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(9, 1.1, 0.16), mat.board);
    board.position.set(x, 0.55, z);
    board.rotation.y = rotY;
    board.castShadow = true;
    group.add(board);

    const texture = createAdTexture(text, bg, fg);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(8.8, 1),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 })
    );
    face.position.set(x, 0.55, z);
    face.rotation.y = rotY;
    face.translateZ(0.09);
    group.add(face);
  };

  ads.forEach(([text, bg, fg], i) => {
    addHoarding(-16 + i * 8, -PITCH.halfLength - 5.5, 0, text, bg, fg);
  });
  [-1, 1].forEach((side) => {
    addHoarding(side * (PITCH.halfWidth + 4), 10, Math.PI / 2, 'OAKS', '#14532d', '#f6f6f2');
  });

  // Crest on the hoarding next to the tunnel
  const crest = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshStandardMaterial({ map: createCrestTexture(), roughness: 0.8 })
  );
  crest.position.set(-24, 0.9, -PITCH.halfLength - 5.4);
  group.add(crest);

  // ---------------------------------------------------------------
  // Stands and crowd
  // ---------------------------------------------------------------
  const random = createRandom(20240115);
  const crowdColors = [0x8a2f2f, 0x27456f, 0x2f5a3a, 0xd8d4cc, 0x3b3f47, 0xb08a3a, 0x6b3a6b];

  const buildStand = (cx, cz, width, rotY, rows, name) => {
    const stand = new THREE.Group();
    stand.name = name;
    stand.position.set(cx, 0, cz);
    stand.rotation.y = rotY;
    group.add(stand);

    // Raked seating deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.6, rows * 1.1), mat.concrete);
    deck.position.set(0, 0.3, rows * 0.55);
    deck.receiveShadow = true;
    stand.add(deck);

    // Crowd – one instanced mesh for the whole stand
    const perRow = Math.floor(width / 0.75);
    const count = perRow * rows;
    const crowd = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.42, 0.62, 0.34),
      new THREE.MeshStandardMaterial({ roughness: 0.9 }),
      count
    );
    crowd.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < perRow; c++) {
        const x = -width / 2 + 0.4 + c * 0.75 + random() * 0.12;
        const y = 0.9 + r * 0.95;
        const z = 0.8 + r * 1.05;
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(0.85 + random() * 0.3);
        dummy.rotation.y = (random() - 0.5) * 0.5;
        dummy.updateMatrix();
        crowd.setMatrixAt(i, dummy.matrix);
        color.setHex(crowdColors[Math.floor(random() * crowdColors.length)]);
        crowd.setColorAt(i, color);
        i++;
      }
    }
    crowd.instanceMatrix.needsUpdate = true;
    if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
    stand.add(crowd);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 0.3, rows * 1.2 + 2), mat.concreteDark);
    roof.position.set(0, rows * 1.05 + 1.6, rows * 0.55);
    roof.castShadow = true;
    stand.add(roof);

    for (let p = 0; p < 6; p++) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.28, rows * 1.05 + 1.6, 0.28), mat.steel);
      pillar.position.set(-width / 2 + (p * width) / 5, (rows * 1.05 + 1.6) / 2, rows * 0.55);
      pillar.castShadow = true;
      stand.add(pillar);
    }
  };

  buildStand(0, PITCH.halfLength + 9, 54, Math.PI, 9, 'StandNorth');
  buildStand(-PITCH.halfWidth - 11, 0, 60, Math.PI / 2, 10, 'StandWest');

  // ---------------------------------------------------------------
  // Floodlights
  // ---------------------------------------------------------------
  const floodPositions = [
    [-PITCH.halfWidth - 9, -PITCH.halfLength - 12],
    [PITCH.halfWidth + 9, -PITCH.halfLength - 12],
    [-PITCH.halfWidth - 9, PITCH.halfLength + 14],
    [PITCH.halfWidth + 9, PITCH.halfLength + 14],
  ];

  floodPositions.forEach(([fx, fz], i) => {
    const pylon = new THREE.Group();
    pylon.position.set(fx, 0, fz);
    pylon.rotation.y = Math.atan2(-fx, -fz);
    group.add(pylon);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.75, 24, 10), mat.steel);
    mast.position.y = 12;
    mast.castShadow = true;
    pylon.add(mast);

    for (let b = 0; b < 5; b++) {
      const by = 4 + b * 4.4;
      const r = 0.75 - (by / 24) * 0.45;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 10), mat.concreteDark);
      ring.position.y = by;
      pylon.add(ring);
    }

    const head = new THREE.Group();
    head.position.y = 24.6;
    pylon.add(head);

    const backing = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 0.2), mat.concreteDark);
    head.add(backing);

    for (let row = 0; row < 2; row++) {
      for (let l = 0; l < 7; l++) {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.62, 0.24), mat.lamp);
        lamp.position.set(-3 + l * 1.0, row === 0 ? 0.5 : -0.5, 0.2);
        head.add(lamp);
      }
    }
    head.rotation.x = 0.35;
  });

  // ---------------------------------------------------------------
  // Corner flags and dugouts
  // ---------------------------------------------------------------
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), mat.post);
      pole.position.set(sx * PITCH.halfWidth, 0.8, sz * PITCH.halfLength);
      pole.castShadow = true;
      group.add(pole);

      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xd23b2e, side: THREE.DoubleSide, roughness: 0.8 })
      );
      flag.position.set(sx * PITCH.halfWidth + 0.25, 1.45, sz * PITCH.halfLength);
      group.add(flag);
    });
  });

  [-1, 1].forEach((side) => {
    const dugout = new THREE.Group();
    dugout.position.set(side * 13, 0, -PITCH.halfLength - 3.4);
    group.add(dugout);

    const shelter = new THREE.Mesh(new THREE.BoxGeometry(9, 2.1, 2), mat.concreteDark);
    shelter.position.y = 1.05;
    shelter.castShadow = true;
    dugout.add(shelter);

    const mouth = new THREE.Mesh(
      new THREE.PlaneGeometry(8.4, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x0c0e10 })
    );
    mouth.position.set(0, 1.05, -1.02);
    dugout.add(mouth);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.16, 2.3), mat.concrete);
    roof.position.y = 2.18;
    dugout.add(roof);
  });

  return group;
}
