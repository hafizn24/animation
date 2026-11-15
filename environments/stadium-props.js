import * as THREE from 'three';

/**
 * Helper to generate a Standard Material with sensible PBR defaults
 */
function createStdMaterial(colorHex, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.0,
    ...opts,
  });
}

/**
 * Creates all match broadcast hardware, pitchside equipment, lighting stanchions,
 * and media/backstage storytelling sets.
 *
 * @param {THREE.Group} root - The parent root group to add props to.
 * @param {Object} ctx - Pitch configuration parameters & existing materials:
 *   { pitchW, pitchH, halfW, halfH, lineY, railOffset, standZ, clubX, clubZ }
 * @returns {Object} Dictionary of created groups/parts for the inspector.
 */
export function createBroadcastProps(root, ctx) {
  const { halfW, halfH, lineY, railOffset, clubX, clubZ } = ctx;

  // Dedicated Materials
  const mat = {
    metal:           createStdMaterial(0xcccccc, { roughness: 0.3, metalness: 0.7 }),
    silverMetal:     createStdMaterial(0xd5dbdb, { roughness: 0.25, metalness: 0.8 }),
    darkGrey:        createStdMaterial(0x222222, { roughness: 0.7 }),
    black:           createStdMaterial(0x111111),
    signWhite:       createStdMaterial(0xf5f5f0, { roughness: 0.6 }),
    signGreen:       createStdMaterial(0x1a6b1a, { roughness: 0.7 }),
    red:             createStdMaterial(0xcc2222, { roughness: 0.7 }),
    yellow:          createStdMaterial(0xf5b041, { roughness: 0.6 }),
    wood:            createStdMaterial(0x8B7355, { roughness: 0.8 }),
    woodDark:        createStdMaterial(0x5c4a32, { roughness: 0.85 }),
    bluePlastic:     createStdMaterial(0x1b4f72, { roughness: 0.5 }),
    orangeCone:      createStdMaterial(0xe67e22, { roughness: 0.6 }),
    windowGlass:     createStdMaterial(0x6699cc, { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.5 }),
    lensGlass:       createStdMaterial(0x0a1020, { roughness: 0.1, metalness: 0.9 }),
    brick:           createStdMaterial(0x8b4513, { roughness: 0.9 }),
    foamWhite:       createStdMaterial(0xf8f9fa, { roughness: 0.9, transparent: true, opacity: 0.85 }),
    whiteboardFrame: createStdMaterial(0x95a5a6, { roughness: 0.4, metalness: 0.6 }),
    floodlightEmissive: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffaed,
      emissiveIntensity: 2.2,
      roughness: 0.2
    }),
  };

  const parts = {};

  // ====================================================================
  // 1. ON-PITCH MATCH EQUIPMENT & OBJECTS
  // ====================================================================

  // 1.1 The Football (Soccer Ball) at Centre Spot
  const ballRadius = 0.22;
  const ballCanvas = document.createElement('canvas');
  ballCanvas.width = 512;
  ballCanvas.height = 256;
  const bctx = ballCanvas.getContext('2d');
  bctx.fillStyle = '#ffffff';
  bctx.fillRect(0, 0, 512, 256);
  bctx.fillStyle = '#111111';
  const drawPentagon = (x, y, r) => {
    bctx.beginPath();
    for (let p = 0; p < 5; p++) {
      const a = (p * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = x + r * Math.cos(a);
      const py = y + r * Math.sin(a);
      if (p === 0) bctx.moveTo(px, py);
      else bctx.lineTo(px, py);
    }
    bctx.closePath();
    bctx.fill();
  };
  for (let bx = 42; bx < 512; bx += 85) {
    drawPentagon(bx, 64, 22);
    drawPentagon(bx + 42, 192, 22);
  }
  const ballTexture = new THREE.CanvasTexture(ballCanvas);
  ballTexture.colorSpace = THREE.SRGBColorSpace;

  const ballMat = createStdMaterial(0xffffff, { roughness: 0.35, metalness: 0.05 });
  ballMat.map = ballTexture;

  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 32, 24), ballMat);
  ballMesh.name = 'MatchFootball';
  ballMesh.position.set(0, ballRadius + 0.01, 0);
  ballMesh.castShadow = true;
  root.add(ballMesh);
  parts.football = ballMesh;

  // 1.2 Free-Kick Spray Line & Referee Whistle
  const sprayLineGeom = new THREE.PlaneGeometry(9.15, 0.14);
  const sprayLine = new THREE.Mesh(sprayLineGeom, mat.foamWhite);
  sprayLine.rotation.x = -Math.PI / 2;
  sprayLine.position.set(4, lineY + 0.002, 18);
  root.add(sprayLine);

  const whistleGroup = new THREE.Group();
  whistleGroup.position.set(0.5, 0.04, 0.5);
  const whistleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), mat.silverMetal);
  whistleBody.rotation.z = Math.PI / 2;
  whistleGroup.add(whistleBody);
  const whistleChamber = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), mat.silverMetal);
  whistleChamber.position.set(-0.025, 0, 0);
  whistleGroup.add(whistleChamber);
  root.add(whistleGroup);

  // 1.3 Substitution Board (Fourth Official Board)
  const subBoardGroup = new THREE.Group();
  subBoardGroup.name = 'SubstitutionBoard';
  const subBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.06), mat.black);
  subBoardGroup.add(subBody);

  const subCanvas = document.createElement('canvas');
  subCanvas.width = 512;
  subCanvas.height = 256;
  const sctx = subCanvas.getContext('2d');
  sctx.fillStyle = '#0a0a0a';
  sctx.fillRect(0, 0, 512, 256);
  sctx.font = 'bold 120px monospace';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillStyle = '#ff2222';
  sctx.fillText('09', 140, 128); // Player OUT (Red)
  sctx.fillStyle = '#22ff44';
  sctx.fillText('17', 370, 128); // Player IN (Green)
  const subTex = new THREE.CanvasTexture(subCanvas);
  subTex.colorSpace = THREE.SRGBColorSpace;
  const subDisplayMat = new THREE.MeshBasicMaterial({ map: subTex });

  [-1, 1].forEach(side => {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), subDisplayMat);
    face.position.z = side * 0.032;
    if (side < 0) face.rotation.y = Math.PI;
    subBoardGroup.add(face);
  });
  subBoardGroup.position.set(0, 1.0, -halfH - railOffset * 0.5);
  const subStand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), mat.metal);
  subStand.position.set(0, 0.45, -halfH - railOffset * 0.5);
  root.add(subStand);
  root.add(subBoardGroup);
  parts.substitutionBoard = subBoardGroup;

  // 1.4 VAR Monitor & Pitchside Review Booth
  const varGroup = new THREE.Group();
  varGroup.name = 'VARBooth';
  const varZ = -halfH - railOffset - 1.2;
  const varShelter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.9), mat.darkGrey);
  varShelter.position.set(0, 0.95, varZ);
  varShelter.castShadow = true;
  varGroup.add(varShelter);

  const varInnerCut = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.8), mat.black);
  varInnerCut.position.set(0, 0.95, varZ + 0.1);
  varGroup.add(varInnerCut);

  const varScreenCanvas = document.createElement('canvas');
  varScreenCanvas.width = 256;
  varScreenCanvas.height = 160;
  const vctx = varScreenCanvas.getContext('2d');
  vctx.fillStyle = '#0d1b2a';
  vctx.fillRect(0, 0, 256, 160);
  vctx.fillStyle = '#415a77';
  vctx.fillRect(10, 10, 236, 140);
  vctx.fillStyle = '#e0e1dd';
  vctx.font = 'bold 28px sans-serif';
  vctx.textAlign = 'center';
  vctx.fillText('VAR REVIEW', 128, 70);
  vctx.fillStyle = '#e63946';
  vctx.fillText('● REC [CAM 04]', 128, 110);
  const varScreenTex = new THREE.CanvasTexture(varScreenCanvas);
  varScreenTex.colorSpace = THREE.SRGBColorSpace;
  const varScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshBasicMaterial({ map: varScreenTex }));
  varScreen.position.set(0, 1.25, varZ + 0.35);
  varGroup.add(varScreen);

  const varPed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 12), mat.silverMetal);
  varPed.position.set(0, 0.45, varZ + 0.25);
  varGroup.add(varPed);
  root.add(varGroup);
  parts.varBooth = varGroup;

  // ====================================================================
  // 2. PITCHSIDE & TECHNICAL AREA BROADCAST OBJECTS
  // ====================================================================

  // 2.1 LED Digital Advertising Boards
  const ledBoardGroup = new THREE.Group();
  ledBoardGroup.name = 'LEDDigitalBoards';
  const ledCanvas = document.createElement('canvas');
  ledCanvas.width = 1024;
  ledCanvas.height = 128;
  const lctx = ledCanvas.getContext('2d');
  const grad = lctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#0052cc');
  grad.addColorStop(0.3, '#ffcc00');
  grad.addColorStop(0.5, '#d90429');
  grad.addColorStop(0.8, '#00b4d8');
  grad.addColorStop(1, '#0052cc');
  lctx.fillStyle = grad;
  lctx.fillRect(0, 0, 1024, 128);
  lctx.fillStyle = '#ffffff';
  lctx.font = 'bold 52px sans-serif';
  lctx.textAlign = 'center';
  lctx.textBaseline = 'middle';
  lctx.fillText('★ THE OAKS PREMIER LEAGUE ★ LIVE BROADCAST ★ OFFICIAL PARTNERS ★', 512, 64);
  const ledTexture = new THREE.CanvasTexture(ledCanvas);
  ledTexture.colorSpace = THREE.SRGBColorSpace;
  ledTexture.wrapS = THREE.RepeatWrapping;
  ledTexture.repeat.set(4, 1);

  const ledScreenMat = new THREE.MeshStandardMaterial({
    map: ledTexture,
    emissive: 0x335588,
    emissiveMap: ledTexture,
    emissiveIntensity: 0.9,
    roughness: 0.3
  });

  const ledRibbonGeom = new THREE.BoxGeometry(ctx.pitchW + 2, 0.75, 0.12);
  const ledNorthRibbon = new THREE.Mesh(ledRibbonGeom, ledScreenMat);
  ledNorthRibbon.position.set(0, 0.38, halfH + railOffset - 0.15);
  ledNorthRibbon.castShadow = true;
  ledBoardGroup.add(ledNorthRibbon);

  [-halfH, halfH].forEach(endZ => {
    const dirZ = endZ > 0 ? -1 : 1;
    [-1, 1].forEach(side => {
      const ledEndGeom = new THREE.BoxGeometry(22, 0.75, 0.12);
      const ledEnd = new THREE.Mesh(ledEndGeom, ledScreenMat);
      ledEnd.position.set(side * 20, 0.38, endZ + dirZ * (railOffset - 0.2));
      ledEnd.castShadow = true;
      ledBoardGroup.add(ledEnd);
    });
  });
  root.add(ledBoardGroup);
  parts.ledBoards = ledBoardGroup;

  // 2.2 Broadcast TV Cameras & Crane
  const cameraGroup = new THREE.Group();
  cameraGroup.name = 'BroadcastCameras';

  const createTripodCamera = (x, z, rotY, isTelephoto = true) => {
    const cam = new THREE.Group();
    cam.position.set(x, 0, z);

    for (let leg = 0; leg < 3; leg++) {
      const legAngle = (leg * 2 * Math.PI) / 3;
      const legGeom = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8);
      const legMesh = new THREE.Mesh(legGeom, mat.darkGrey);
      legMesh.position.set(Math.cos(legAngle) * 0.35, 0.65, Math.sin(legAngle) * 0.35);
      legMesh.rotation.z = Math.cos(legAngle) * 0.28;
      legMesh.rotation.x = Math.sin(legAngle) * 0.28;
      legMesh.castShadow = true;
      cam.add(legMesh);
    }

    const headGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 10);
    const head = new THREE.Mesh(headGeom, mat.metal);
    head.position.y = 1.25;
    cam.add(head);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.45), mat.darkGrey);
    body.position.set(0, 1.42, 0);
    body.castShadow = true;
    cam.add(body);

    const vf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.04), mat.bluePlastic);
    vf.position.set(-0.14, 1.5, -0.1);
    cam.add(vf);

    const lensLen = isTelephoto ? 0.45 : 0.2;
    const lensGeom = new THREE.CylinderGeometry(0.08, 0.07, lensLen, 16);
    const lens = new THREE.Mesh(lensGeom, mat.darkGrey);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.42, lensLen / 2 + 0.22);
    lens.castShadow = true;
    cam.add(lens);

    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), mat.lensGlass);
    glass.position.set(0, 1.42, lensLen + 0.225);
    cam.add(glass);

    cam.rotation.y = rotY;
    return cam;
  };

  cameraGroup.add(createTripodCamera(-5, -halfH - railOffset * 0.7, 0, true));
  cameraGroup.add(createTripodCamera(5, -halfH - railOffset * 0.7, 0, true));
  cameraGroup.add(createTripodCamera(-10, halfH + railOffset * 0.6, Math.PI, false));
  cameraGroup.add(createTripodCamera(10, -halfH - railOffset * 0.6, 0, false));

  // Jib / Crane Camera rig
  const jibGroup = new THREE.Group();
  jibGroup.position.set(16, 0, -halfH - railOffset - 3.5);
  const jibBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 12), mat.darkGrey);
  jibBase.position.y = 0.4;
  jibGroup.add(jibBase);

  const boomGeom = new THREE.BoxGeometry(0.12, 0.12, 5.5);
  const boom = new THREE.Mesh(boomGeom, mat.yellow);
  boom.position.set(0, 2.5, 1.5);
  boom.rotation.x = -0.35;
  boom.castShadow = true;
  jibGroup.add(boom);

  const jibCam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.35), mat.darkGrey);
  jibCam.position.set(0, 3.4, 3.6);
  jibGroup.add(jibCam);
  cameraGroup.add(jibGroup);
  root.add(cameraGroup);
  parts.broadcastCameras = cameraGroup;

  // 2.3 Field Parabolic Microphones
  const micGroup = new THREE.Group();
  micGroup.name = 'FieldMicrophones';
  const createParabolicMic = (x, z, rotY) => {
    const pm = new THREE.Group();
    pm.position.set(x, 0, z);

    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 8), mat.metal);
    stand.position.y = 0.45;
    pm.add(stand);

    const dishMat = createStdMaterial(0xffffff, { roughness: 0.2, transparent: true, opacity: 0.55 });
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), dishMat);
    dish.position.set(0, 0.95, 0);
    dish.rotation.x = Math.PI / 2;
    pm.add(dish);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), mat.black);
    tip.position.set(0, 0.95, 0.12);
    tip.rotation.x = Math.PI / 2;
    pm.add(tip);

    pm.rotation.y = rotY;
    return pm;
  };

  micGroup.add(createParabolicMic(-18, -halfH - railOffset * 0.4, 0));
  micGroup.add(createParabolicMic(18, -halfH - railOffset * 0.4, 0));
  micGroup.add(createParabolicMic(-18, halfH + railOffset * 0.4, Math.PI));
  micGroup.add(createParabolicMic(18, halfH + railOffset * 0.4, Math.PI));
  root.add(micGroup);
  parts.fieldMicrophones = micGroup;

  // 2.4 Ball Boy Stools & Spare Ball Cones
  const ballBoyGroup = new THREE.Group();
  ballBoyGroup.name = 'BallBoyStations';
  const stoolGeom = new THREE.CylinderGeometry(0.18, 0.16, 0.35, 12);
  const coneGeom = new THREE.ConeGeometry(0.16, 0.12, 12);

  const ballBoyPositions = [
    [-halfW - 1.2, -30],
    [-halfW - 1.2, 30],
    [halfW + 1.2, -30],
    [halfW + 1.2, 30],
    [-22, halfH + 1.5],
    [22, halfH + 1.5],
    [-22, -halfH - 1.5],
    [22, -halfH - 1.5]
  ];

  ballBoyPositions.forEach(([bx, bz]) => {
    const stool = new THREE.Mesh(stoolGeom, mat.bluePlastic);
    stool.position.set(bx, 0.175, bz);
    stool.castShadow = true;
    ballBoyGroup.add(stool);

    const cone = new THREE.Mesh(coneGeom, mat.orangeCone);
    cone.position.set(bx + (bx > 0 ? -0.5 : 0.5), 0.06, bz);
    ballBoyGroup.add(cone);

    const spareBall = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 16, 12), ballMat);
    spareBall.position.set(bx + (bx > 0 ? -0.5 : 0.5), 0.06 + ballRadius * 0.9, bz);
    spareBall.castShadow = true;
    ballBoyGroup.add(spareBall);
  });
  root.add(ballBoyGroup);
  parts.ballBoyStations = ballBoyGroup;

  // 2.5 Coolers & Water Bottle Crates (Dugouts)
  const dugoutPropsGroup = new THREE.Group();
  dugoutPropsGroup.name = 'DugoutProps';
  [-1, 1].forEach(side => {
    const dugX = side * 12;
    const dugZ = -halfH - railOffset - 2;

    const cooler = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45), mat.bluePlastic);
    cooler.position.set(dugX - 2.2, 0.225, dugZ + 0.4);
    cooler.castShadow = true;
    dugoutPropsGroup.add(cooler);
    const coolerLid = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.47), mat.signWhite);
    coolerLid.position.set(dugX - 2.2, 0.46, dugZ + 0.4);
    dugoutPropsGroup.add(coolerLid);

    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.3), mat.yellow);
    crate.position.set(dugX + 2.2, 0.09, dugZ + 0.4);
    crate.castShadow = true;
    dugoutPropsGroup.add(crate);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), mat.signWhite);
        bottle.position.set(dugX + 2.2 - 0.12 + c * 0.12, 0.18, dugZ + 0.4 - 0.06 + r * 0.12);
        dugoutPropsGroup.add(bottle);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), mat.red);
        cap.position.set(dugX + 2.2 - 0.12 + c * 0.12, 0.28, dugZ + 0.4 - 0.06 + r * 0.12);
        dugoutPropsGroup.add(cap);
      }
    }
  });
  root.add(dugoutPropsGroup);
  parts.dugoutProps = dugoutPropsGroup;

  // ====================================================================
  // 3. LIGHTING & ARCHITECTURAL STADIUM ASSETS
  // ====================================================================

  // 3.1 Four Corner Floodlight Towers
  const floodlightGroup = new THREE.Group();
  floodlightGroup.name = 'FloodlightTowers';
  const towerH = 26;
  const towerPositions = [
    [-halfW - 9, -halfH - 7, Math.PI / 4],
    [halfW + 9, -halfH - 7, -Math.PI / 4],
    [-halfW - 9, halfH + 7, (3 * Math.PI) / 4],
    [halfW + 9, halfH + 7, -(3 * Math.PI) / 4],
  ];

  towerPositions.forEach(([tx, tz, rotY]) => {
    const tower = new THREE.Group();
    tower.position.set(tx, 0, tz);

    const baseSpread = 2.4;
    const topSpread = 0.8;
    const legRadius = 0.06;

    [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ].forEach(([lx, lz]) => {
      const p1 = [lx * baseSpread * 0.5, 0, lz * baseSpread * 0.5];
      const p2 = [lx * topSpread * 0.5, towerH, lz * topSpread * 0.5];
      const v1 = new THREE.Vector3(...p1);
      const v2 = new THREE.Vector3(...p2);
      const dir = new THREE.Vector3().subVectors(v2, v1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

      const legGeom = new THREE.CylinderGeometry(legRadius * 0.8, legRadius, len, 8);
      const leg = new THREE.Mesh(legGeom, mat.metal);
      leg.position.copy(mid);
      leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      leg.castShadow = true;
      tower.add(leg);
    });

    const stages = 8;
    for (let s = 1; s <= stages; s++) {
      const h = (s / stages) * towerH;
      const spread = baseSpread + (topSpread - baseSpread) * (s / stages);
      const ringGeom = new THREE.BoxGeometry(spread, 0.08, spread);
      const ring = new THREE.Mesh(ringGeom, mat.metal);
      ring.position.y = h;
      tower.add(ring);
    }

    const headBank = new THREE.Group();
    headBank.position.set(0, towerH + 0.8, 0);
    headBank.rotation.y = rotY;
    headBank.rotation.x = 0.35;

    const frameBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.3), mat.darkGrey);
    headBank.add(frameBack);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.08), mat.floodlightEmissive);
        bulb.position.set(-1.35 + col * 0.9, 0.7 - row * 0.7, 0.18);
        headBank.add(bulb);
      }
    }

    const spot = new THREE.SpotLight(0xfffaed, 2.5);
    spot.position.set(0, 0, 0.2);
    spot.target.position.set(0, -towerH, -20);
    spot.angle = 0.65;
    spot.penumbra = 0.4;
    spot.castShadow = false;
    headBank.add(spot);
    headBank.add(spot.target);

    tower.add(headBank);
    floodlightGroup.add(tower);
  });
  root.add(floodlightGroup);
  parts.floodlights = floodlightGroup;

  // 3.2 Player Tunnel / Retractable Bellows
  const tunnelGroup = new THREE.Group();
  tunnelGroup.name = 'PlayerTunnel';
  const bellowsRibCount = 9;
  const bellowsLen = 6.5;
  const startTunnelZ = clubZ - 2.5;

  for (let r = 0; r < bellowsRibCount; r++) {
    const tz = startTunnelZ - (r / (bellowsRibCount - 1)) * bellowsLen;
    const archGeom = new THREE.BoxGeometry(2.2, 2.3, 0.12);
    const rib = new THREE.Mesh(archGeom, r % 2 === 0 ? mat.signGreen : mat.signWhite);
    rib.position.set(clubX + 3, 1.15, tz);
    rib.castShadow = true;
    tunnelGroup.add(rib);
  }
  const tunnelVoid = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.05, bellowsLen), mat.black);
  tunnelVoid.position.set(clubX + 3, 1.05, startTunnelZ - bellowsLen / 2);
  tunnelGroup.add(tunnelVoid);
  root.add(tunnelGroup);
  parts.playerTunnel = tunnelGroup;

  // 3.3 Turnstiles & Exterior Ticket Gates
  const turnstileGroup = new THREE.Group();
  turnstileGroup.name = 'Turnstiles';
  const gateZ = halfH + railOffset + 5.1;
  const gateX = -halfW + 4;

  const gateHut = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 1.8), mat.brick);
  gateHut.position.set(gateX, 1.2, gateZ);
  gateHut.castShadow = true;
  turnstileGroup.add(gateHut);

  const winMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), mat.windowGlass);
  winMesh.position.set(gateX, 1.3, gateZ + 0.91);
  turnstileGroup.add(winMesh);

  const rotorAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), mat.silverMetal);
  rotorAxis.position.set(gateX + 2.2, 0.8, gateZ);
  turnstileGroup.add(rotorAxis);

  for (let arm = 0; arm < 4; arm++) {
    const armGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const armMesh = new THREE.Mesh(armGeom, mat.silverMetal);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.set(gateX + 2.2 + 0.35 * Math.cos(arm * (Math.PI / 2)), 0.6 + (arm % 2) * 0.35, gateZ + 0.35 * Math.sin(arm * (Math.PI / 2)));
    turnstileGroup.add(armMesh);
  }
  root.add(turnstileGroup);
  parts.turnstiles = turnstileGroup;

  // ====================================================================
  // 4. MEDIA & BACKSTAGE SCENE OBJECTS
  // ====================================================================
  const mediaStudioGroup = new THREE.Group();
  mediaStudioGroup.name = 'MediaBackstageProps';
  const studioX = clubX - 4.5;
  const studioZ = clubZ + 8.5;

  // 4.1 Press Conference Desk & Sponsor Backdrop
  const pressBackdropCanvas = document.createElement('canvas');
  pressBackdropCanvas.width = 512;
  pressBackdropCanvas.height = 256;
  const pctx = pressBackdropCanvas.getContext('2d');
  pctx.fillStyle = '#111827';
  pctx.fillRect(0, 0, 512, 256);
  for (let ty = 0; ty < 256; ty += 64) {
    for (let tx = 0; tx < 512; tx += 128) {
      pctx.fillStyle = (tx + ty) % 256 === 0 ? '#1f2937' : '#111827';
      pctx.fillRect(tx, ty, 128, 64);
      pctx.fillStyle = '#60a5fa';
      pctx.font = 'bold 18px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('OAKHAVEN FC', tx + 64, ty + 28);
      pctx.fillStyle = '#9ca3af';
      pctx.font = '12px sans-serif';
      pctx.fillText('OFFICIAL SPONSOR', tx + 64, ty + 46);
    }
  }
  const pressTex = new THREE.CanvasTexture(pressBackdropCanvas);
  pressTex.colorSpace = THREE.SRGBColorSpace;
  const pressBackdropMat = createStdMaterial(0xffffff, { roughness: 0.5 });
  pressBackdropMat.map = pressTex;

  const pressWall = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), pressBackdropMat);
  pressWall.position.set(studioX, 1.2, studioZ);
  pressWall.castShadow = true;
  mediaStudioGroup.add(pressWall);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 1.0), mat.black);
  desk.position.set(studioX, 0.4, studioZ - 1.1);
  desk.castShadow = true;
  mediaStudioGroup.add(desk);

  [-0.8, 0, 0.8].forEach(mx => {
    const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 8), mat.darkGrey);
    micBase.position.set(studioX + mx, 0.815, studioZ - 0.9);
    mediaStudioGroup.add(micBase);

    const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 6), mat.silverMetal);
    micStem.position.set(studioX + mx, 0.9, studioZ - 0.9);
    micStem.rotation.x = -0.3;
    mediaStudioGroup.add(micStem);

    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mat.bluePlastic);
    micHead.position.set(studioX + mx, 0.98, studioZ - 0.94);
    mediaStudioGroup.add(micHead);

    const drink = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), mat.signGreen);
    drink.position.set(studioX + mx + 0.16, 0.89, studioZ - 0.85);
    mediaStudioGroup.add(drink);
  });

  // 4.2 Flash Interview Backdrop
  const flashWallCanvas = document.createElement('canvas');
  flashWallCanvas.width = 256;
  flashWallCanvas.height = 256;
  const fctx2 = flashWallCanvas.getContext('2d');
  fctx2.fillStyle = '#0f172a';
  fctx2.fillRect(0, 0, 256, 256);
  fctx2.fillStyle = '#38bdf8';
  fctx2.font = 'bold 22px sans-serif';
  fctx2.textAlign = 'center';
  fctx2.fillText('POST-MATCH', 128, 80);
  fctx2.fillText('FLASH ZONE', 128, 130);
  fctx2.fillStyle = '#ffffff';
  fctx2.font = '16px sans-serif';
  fctx2.fillText('TV INTERVIEW', 128, 175);
  const flashTex = new THREE.CanvasTexture(flashWallCanvas);
  flashTex.colorSpace = THREE.SRGBColorSpace;
  const flashMat = createStdMaterial(0xffffff, { roughness: 0.5 });
  flashMat.map = flashTex;

  const flashBoard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.08), flashMat);
  flashBoard.position.set(clubX + 6.2, 1.1, clubZ - 7.5);
  flashBoard.rotation.y = 0.35;
  mediaStudioGroup.add(flashBoard);

  // 4.3 Locker Room Benches & Lockers
  const lockerX = studioX + 6.0;
  const lockerZ = studioZ + 0.2;
  for (let cub = 0; cub < 4; cub++) {
    const cx = lockerX + cub * 0.7;
    const cubMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.0, 0.5), mat.woodDark);
    cubMesh.position.set(cx, 1.0, lockerZ);
    cubMesh.castShadow = true;
    mediaStudioGroup.add(cubMesh);

    const cubHollow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.85, 0.45), mat.wood);
    cubHollow.position.set(cx, 1.0, lockerZ - 0.05);
    mediaStudioGroup.add(cubHollow);

    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.1), mat.signWhite);
    plate.position.set(cx, 1.85, lockerZ - 0.26);
    mediaStudioGroup.add(plate);

    const jersey = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 0.1), cub % 2 === 0 ? mat.signGreen : mat.red);
    jersey.position.set(cx, 1.25, lockerZ - 0.1);
    mediaStudioGroup.add(jersey);
  }

  const lockerBench = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.5), mat.wood);
  lockerBench.position.set(lockerX + 1.05, 0.225, lockerZ - 1.2);
  lockerBench.castShadow = true;
  mediaStudioGroup.add(lockerBench);

  // 4.4 Tactical Rolling Whiteboard
  const tacticsGroup = new THREE.Group();
  tacticsGroup.position.set(studioX + 2.8, 0, studioZ - 2.8);

  const wFrameGeom = new THREE.BoxGeometry(1.6, 1.2, 0.05);
  const wCanvas = document.createElement('canvas');
  wCanvas.width = 512;
  wCanvas.height = 384;
  const wctx = wCanvas.getContext('2d');
  wctx.fillStyle = '#ffffff';
  wctx.fillRect(0, 0, 512, 384);
  wctx.strokeStyle = '#1e7b1e';
  wctx.lineWidth = 6;
  wctx.strokeRect(30, 30, 452, 324);
  wctx.beginPath();
  wctx.moveTo(256, 30);
  wctx.lineTo(256, 354);
  wctx.stroke();
  wctx.beginPath();
  wctx.arc(256, 192, 50, 0, Math.PI * 2);
  wctx.stroke();
  wctx.fillStyle = '#2563eb';
  [[140, 90], [140, 190], [140, 290], [210, 140], [210, 240]].forEach(([px, py]) => {
    wctx.beginPath();
    wctx.arc(px, py, 14, 0, Math.PI * 2);
    wctx.fill();
  });
  wctx.fillStyle = '#dc2626';
  [[320, 140], [320, 240], [380, 90], [380, 190], [380, 290]].forEach(([px, py]) => {
    wctx.beginPath();
    wctx.arc(px, py, 14, 0, Math.PI * 2);
    wctx.fill();
  });

  const wTex = new THREE.CanvasTexture(wCanvas);
  wTex.colorSpace = THREE.SRGBColorSpace;
  const wMat = createStdMaterial(0xffffff, { roughness: 0.3 });
  wMat.map = wTex;

  const boardMesh = new THREE.Mesh(wFrameGeom, wMat);
  boardMesh.position.y = 1.35;
  boardMesh.castShadow = true;
  tacticsGroup.add(boardMesh);

  const standBarL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), mat.whiteboardFrame);
  standBarL.position.set(-0.75, 0.7, 0);
  tacticsGroup.add(standBarL);
  const standBarR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), mat.whiteboardFrame);
  standBarR.position.set(0.75, 0.7, 0);
  tacticsGroup.add(standBarR);

  [-0.75, 0.75].forEach(wx => {
    const baseBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.6), mat.whiteboardFrame);
    baseBar.position.set(wx, 0.04, 0);
    tacticsGroup.add(baseBar);
    [-0.25, 0.25].forEach(wz => {
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mat.black);
      wheel.position.set(wx, 0.03, wz);
      tacticsGroup.add(wheel);
    });
  });

  mediaStudioGroup.add(tacticsGroup);
  root.add(mediaStudioGroup);
  parts.mediaBackstage = mediaStudioGroup;

  return parts;
}
