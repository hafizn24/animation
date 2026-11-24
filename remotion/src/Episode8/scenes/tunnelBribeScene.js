import * as THREE from 'three';
import { MatchTunnelApp } from '../../../../environments/match-tunnel.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { RayyanApp } from '../../../../characters/character-variants.js';
import { clamp, createCinematicScene, lerp, sec, smooth, tunnelGrade } from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;

/** Act 1 — the envelope slap and the refusal, staged in hard corridor light. */
export const createTunnelBribeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: MatchTunnelApp,
  grade: (scene, env) => tunnelGrade(scene, env),
  extra: (scene) => {
    const envelope = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.3, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf3efdf, roughness: 0.9 })
    );
    envelope.rotation.z = 0.18;
    scene.add(envelope);
    return { envelope };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-0.7, 0, 0.4], rotationY: 0.28,
      beats: [
        { from: 0, to: L('e8_03'), pose: 'idle' },
        { from: L('e8_03'), to: L('e8_04'), pose: 'document' },
        { from: L('e8_04'), to: 480, pose: 'idle' },
      ],
    },
    {
      name: 'rayyan', Class: RayyanApp,
      scale: 0.95, position: [1.1, 0, -1.4], rotationY: -0.42,
      beats: [
        { from: 0, to: L('e8_03'), pose: 'talk' },
        { from: L('e8_03'), to: 480, pose: 'idle' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.envelope) return;
    const toss = smooth(clamp(frame / 16, 0, 1));
    const returnPass = smooth(clamp((frame - L('e8_04')) / 60, 0, 1));
    extra.envelope.position.x = lerp(1.0, -0.7, toss) + returnPass * 1.7;
    extra.envelope.position.y = lerp(1.6, 1.32, toss) + returnPass * 0.1;
    extra.envelope.position.z = lerp(-1.2, 0.45, toss) - returnPass * 1.5;
    extra.envelope.rotation.z = 0.18 + toss * 0.7 + returnPass;
  },
  camera: {
    fov: 48, ease: smooth,
    keys: [
      [0, [0.2, 1.55, 2.6], [0.0, 1.5, -0.6], 46],
      [sec(54), [1.4, 1.6, 1.6], [1.1, 1.4, -1.4], 44],
      [sec(L('e8_03')), [-0.2, 1.62, 2.2], [-0.7, 1.45, 0.4], 44],
      [sec(L('e8_04')), [0.4, 1.58, 2.0], [0.3, 1.3, -0.8], 48],
      [sec(480), [0.8, 1.6, 1.4], [0.6, 1.5, -2.0], 50],
    ],
  },
});
