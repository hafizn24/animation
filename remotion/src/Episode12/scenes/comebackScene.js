import * as THREE from 'three';
import { PitchCenterCircleApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { FaridApp, MalikApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, goalFrame, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const GOALS = [goalFrame(ACT_1, 0), goalFrame(ACT_1, 1)];

/** Act 1 — armband close-up hook, then the vocal comeback. */
export const createComebackScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchCenterCircleApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  extra: (scene, { env, actors }) => {
    const azam = actors.find((actor) => actor.name === 'azam');
    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.032, 12, 30),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.35, roughness: 0.5 })
    );
    armband.rotation.x = Math.PI / 2;
    armband.scale.setScalar(1.25);
    // Worn on the upper left arm, not floating in front of the lens.
    if (azam && azam.parts.leftArm) azam.parts.leftArm.add(armband);
    armband.position.set(0, -0.2, 0);
    return { armband, ball: env.anchors.ball };
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
    if (!extra) return;
    if (extra.armband) {
      const tighten = smooth(clamp(frame / 24, 0, 1));
      extra.armband.scale.setScalar(lerp(1.25, 0.92, tighten));
    }
    const ball = extra.ball;
    if (!ball) return;
    const goal = GOALS.find((value) => frame >= value && frame < value + 14);
    if (goal) {
      const settle = smooth(clamp((frame - goal) / 12, 0, 1));
      ball.position.x = lerp(-5.2, -6.0, settle);
      ball.position.y = 0.22 + Math.sin(settle * Math.PI) * 0.3;
      ball.position.z = lerp(0.3, 0, settle);
    } else {
      ball.position.x = 0;
      ball.position.y = 0.22;
      ball.position.z = 0;
    }
  },
  camera: {
    fov: 46, ease: smooth,
    keys: [
      [0, [0.3, 1.72, 1.55], [0.11, 1.62, 0.62], 40],
      [sec(54), [0.8, 1.62, 2.8], [0.4, 1.45, 0.6], 44],
      [sec(L('e12_03')), [-0.8, 1.6, 3.2], [-0.6, 1.3, 0.8], 48],
      [sec(L('e12_04')), [-1.4, 1.55, 3.4], [-1.2, 1.4, 1.0], 46],
      [sec(450), [0.2, 1.7, 3.8], [0.4, 1.3, 0.4], 50],
    ],
  },
});
