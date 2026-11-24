import * as THREE from 'three';
import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, MalikApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;

/** Act 1 — armband close-up hook, then the vocal comeback. */
export const createComebackScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene) => {
    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.032, 12, 30),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.35, roughness: 0.5 })
    );
    armband.position.set(0.2, 1.45, 1.3);
    armband.rotation.set(0.4, 0.2, -0.3);
    scene.add(armband);
    return { armband };
  },
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 0.6], rotationY: 0.1,
      beats: [
        { from: 0, to: L('e12_03'), pose: 'point' },
        { from: L('e12_03'), to: L('e12_04'), pose: 'talk' },
        { from: L('e12_04'), to: 450, pose: 'block' },
      ],
    },
    {
      name: 'farid', Class: FaridApp,
      scale: 0.97, position: [-1.2, 0, 1.0], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e12_04'), pose: 'stride' },
        { from: L('e12_04'), to: 450, pose: 'talk' },
      ],
    },
    {
      name: 'malik', Class: MalikApp,
      scale: 1.0, position: [1.8, 0, -1.4], rotationY: -0.3,
      beats: [{ from: L('e12_03'), to: 450, pose: 'idle' }],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.armband) return;
    extra.armband.visible = frame < 90;
    const tighten = smooth(clamp(frame / 36, 0, 1));
    extra.armband.scale.setScalar(lerp(1.18, 0.9, tighten));
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [0.2, 1.5, 2.2], [0.2, 1.45, 1.3], 42],
      [sec(54), [0.8, 1.62, 2.8], [0.4, 1.45, 0.6], 44],
      [sec(L('e12_03')), [-0.8, 1.6, 3.2], [-0.6, 1.3, 0.8], 48],
      [sec(L('e12_04')), [-1.4, 1.55, 3.4], [-1.2, 1.4, 1.0], 46],
      [sec(450), [0.2, 1.7, 3.8], [0.4, 1.3, 0.4], 50],
    ],
  },
});
