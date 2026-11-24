import * as THREE from 'three';
import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { MalikApp, RefereeApp } from '../../../../characters/character-variants.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 — yellow card in the lens, Malik the wall, and the halftime fine. */
export const createBesiWajaScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene) => {
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.72),
      new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide })
    );
    card.position.set(0.1, 1.6, 2.1);
    card.rotation.z = -0.18;
    scene.add(card);
    return { card };
  },
  actors: [
    {
      name: 'pengadil', Class: RefereeApp,
      scale: 0.96, position: [0.1, 0, 0.4], rotationY: 0.05,
      beats: [
        { from: 0, to: L('e11_02'), pose: 'point' },
        { from: L('e11_02'), to: L('e11_03'), pose: 'talk' },
        { from: L('e11_03'), to: END, pose: 'idle' },
      ],
      anim: ({ frame, extra, parts }) => {
        if (frame < 90 && parts.rightArm) parts.rightArm.rotation.set(-2.1, 0, 0.2);
      },
    },
    {
      name: 'malik', Class: MalikApp,
      scale: 1.0, position: [-0.9, 0, -1.6], rotationY: 0.12,
      beats: [
        { from: 0, to: L('e11_03'), pose: 'idle' },
        { from: L('e11_03'), to: L('e11_04'), pose: 'block' },
        { from: L('e11_04'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.96, position: [1.4, 0, 0.8], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e11_04'), pose: 'stride' },
        { from: L('e11_04'), to: END, pose: 'block' },
      ],
    },
    {
      name: 'peg', Class: SuitOutfitApp,
      scale: 0.84, position: [3.2, 0, 3.6], rotationY: -0.3,
      beats: [{ from: L('e11_04'), to: END, pose: 'idle' }],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (extra && extra.card) {
      extra.card.visible = frame < 90;
      const pop = 1 + Math.sin(Math.min(frame, 12) / 12 * Math.PI) * 0.5;
      extra.card.scale.setScalar(pop);
    }
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [0.1, 1.62, 2.6], [0.1, 1.6, 2.1], 44],
      [sec(54), [0.6, 1.6, 2.8], [0.1, 1.5, 0.4], 46],
      [sec(L('e11_03')), [-0.4, 1.7, 2.4], [-0.9, 1.55, -1.6], 44],
      [sec(L('e11_04')), [1.8, 1.6, 3.2], [1.4, 1.4, 0.8], 48],
      [sec(END), [0.8, 1.7, 3.6], [0.4, 1.3, 0.4], 50],
    ],
  },
});
