import * as THREE from 'three';
import { ClubOfficeApp } from '../../../../environments/club-office.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { applyOfficeGrade } from '../../Episode5/sceneKit.js';
import {
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 — the red NOTIS SITA stamp lands and the Bank Promise is negotiated. */
export const createBankPromiseScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: ClubOfficeApp,
  grade: (scene, env) => applyOfficeGrade(scene, env, 'scene1'),
  extra: (scene, { env, actors }) => {
    faceEachOther(findActor(actors, 'boss'), findActor(actors, 'peguam'));
    if (env && typeof env.setDocument === 'function') {
      env.setDocument({
        title: 'NOTIS SITA BANK',
        subtitle: 'MAHKAMAH • BULUH FC',
        amount: 'RM331,500',
        note: 'TARIKH: 7 HARI • HUBUNGI PEGUAM',
      });
    }
    const folder = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.46),
      new THREE.MeshBasicMaterial({ color: 0xb3121f, side: THREE.DoubleSide })
    );
    folder.rotation.x = -Math.PI / 2;
    folder.position.set(-0.55, 0.884, 0.22);
    scene.add(folder);

    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.026, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: 0.7 })
    );
    armband.rotation.x = Math.PI / 2;
    armband.position.set(0.42, 0.89, 0.3);
    scene.add(armband);

    const stamp = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.055, 0.16, 14),
      new THREE.MeshStandardMaterial({ color: 0x2a1414, roughness: 0.6 })
    );
    handle.position.y = 0.1;
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.045, 14),
      new THREE.MeshStandardMaterial({ color: 0xb3121f, roughness: 0.5 })
    );
    stamp.add(handle, base);
    stamp.position.set(-0.55, 1.55, 0.22);
    scene.add(stamp);

    return { folder, armband, stamp };
  },
  actors: [
    {
      name: 'boss', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.95, position: [0.2, 0, -1.4], rotationY: 0.06,
      beats: [
        { from: L('e6_02'), to: L('e6_03'), pose: 'talk' },
        { from: L('e6_03'), to: L('e6_04'), pose: 'document', emotion: 'worried' },
        { from: L('e6_04'), to: END, pose: 'idle', emotion: 'stressed' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.94, position: [-1.35, 0, -2.3], rotationY: -0.24,
      beats: [
        { from: 0, to: L('e6_02'), pose: 'idle' },
        { from: L('e6_02'), to: L('e6_03'), pose: 'offer' },
        { from: L('e6_03'), to: L('e6_04'), pose: 'talk' },
        { from: L('e6_04'), to: END, pose: 'talk', emotion: 'angry' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.stamp) return;
    // The stamp audio hits on frame 0, so the prop is already down at frame 0
    // and only rebounds before it leaves frame.
    const rebound = smooth(clamp((frame - 2) / 12, 0, 1));
    extra.stamp.position.y = lerp(0.94, 1.12, rebound);
    extra.stamp.visible = frame < 60;
  },
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const boss = findActor(actors, 'boss');
      const peguam = findActor(actors, 'peguam');
      return [
        [0, [-0.4, 1.5, 2.7], [-0.5, 0.9, 0.2], 42],
        [sec(54), [-0.2, 1.5, 1.5], [-0.8, 1.0, -1.2], 42],
        shotKey(getSpeakerThreeQuarterShot(peguam, boss, { distance: 3.7 }), sec(L('e6_02'))),
        shotKey(getSpeakerThreeQuarterShot(boss, peguam, { distance: 3.8 }), sec(L('e6_03'))),
        shotKey(getSpeakerThreeQuarterShot(peguam, boss, { distance: 3.6 }), sec(L('e6_04'))),
        [sec(END), [0.1, 1.6, 1.8], [0.2, 1.1, -0.6], 42],
      ];
    },
  },
  postCamera: ({ camera, frame }) => {
    if (frame > 4) return;
    const k = 1 - frame / 4;
    camera.position.x += Math.sin(frame * 12.1) * 0.02 * k;
    camera.position.y += Math.cos(frame * 9.4) * 0.015 * k;
  },
});
