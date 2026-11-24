import * as THREE from 'three';
import { MatchTunnelApp } from '../../../../environments/match-tunnel.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { RayyanApp } from '../../../../characters/character-variants.js';
import {
  createCinematicScene,
  faceEachOther,
  findActor,
  getOverTheShoulderShot,
  getSpeakerThreeQuarterShot,
  holdProp,
  sec,
  shotKey,
  smooth,
  tunnelGrade,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/** Act 1 — the envelope slap and the refusal, staged in hard corridor light. */
export const createTunnelBribeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: MatchTunnelApp,
  grade: (scene, env) => tunnelGrade(scene, env),
  extra: (scene, { actors }) => {
    const boss = findActor(actors, 'bos');
    const rayyan = findActor(actors, 'rayyan');
    faceEachOther(boss, rayyan);
    const envelope = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.18, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xf3efdf, roughness: 0.9 })
    );
    envelope.name = 'BribeEnvelope';
    // The envelope is a held prop, not a floating plane: it rides the boss's
    // right hand during the offer and Rayyan's hand after the refusal.
    holdProp(boss, 'right', envelope, {
      position: [0, -0.02, 0.13],
      rotation: [0, 0, 0.18],
    });
    return { envelope, boss, rayyan };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-0.7, 0, 0.4], rotationY: 2.2,
      beats: [
        { from: 0, to: L('e8_03'), pose: 'idle' },
        { from: L('e8_03'), to: L('e8_04'), pose: 'document' },
        { from: L('e8_04'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'rayyan', Class: RayyanApp,
      scale: 0.95, position: [1.1, 0, -1.4], rotationY: -2.2,
      beats: [
        { from: 0, to: L('e8_03'), pose: 'talk' },
        { from: L('e8_03'), to: END, pose: 'idle' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.envelope) return;
    const returned = frame >= L('e8_04');
    if (returned) {
      holdProp(extra.rayyan, 'right', extra.envelope, {
        position: [0, -0.02, 0.13],
        rotation: [0, 0, -0.18],
      });
    } else {
      holdProp(extra.boss, 'right', extra.envelope, {
        position: [0, -0.02, 0.13],
        rotation: [0, 0, 0.18],
      });
    }
  },
  camera: {
    fov: 48, ease: smooth,
    keys: ({ actors }) => {
      const boss = findActor(actors, 'bos');
      const rayyan = findActor(actors, 'rayyan');
      return [
        [0, [1.4, 1.6, 3.2], [0.2, 1.35, -0.4], 46],
        [sec(54), [1.6, 1.6, 2.6], [0.5, 1.35, -0.5], 44],
        shotKey(getSpeakerThreeQuarterShot(boss, rayyan, { distance: 3.9 }), sec(L('e8_02'))),
        shotKey(getSpeakerThreeQuarterShot(rayyan, boss, { distance: 3.8 }), sec(L('e8_03'))),
        shotKey(getOverTheShoulderShot(boss, rayyan, { distance: 2.1 }), sec(L('e8_04'))),
        shotKey(getOverTheShoulderShot(rayyan, boss, { distance: 2.0 }), sec(END)),
      ];
    },
  },
});
