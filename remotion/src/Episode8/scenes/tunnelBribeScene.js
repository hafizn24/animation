import * as THREE from 'three';
import { MatchTunnelApp } from '../../../../environments/match-tunnel.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { RayyanApp } from '../../../../characters/character-variants.js';
import { tunnelGrade } from '../../Season1/sceneKit.js';
import {
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  holdProp,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_1 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_1.lines.find((line) => line.id === id)[key] - ACT_1.fromFrame;
const END = ACT_1.durationFrames;

/**
 * Act 1 (rework) — Rayyan tosses the thick envelope onto Bos's chest at frame
 * 0. Bos's answer is the season's spine — sink standing — and he KEEPS the
 * envelope as evidence instead of throwing it back.
 */
export const createTunnelBribeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: MatchTunnelApp,
  grade: (scene, env) => tunnelGrade(scene, env),
  extra: (scene, { actors }) => {
    const bos = findActor(actors, 'bos');
    const rayyan = findActor(actors, 'rayyan');
    faceEachOther(bos, rayyan);

    // The envelope: thick, gold-clipped, slapped onto Bos's chest at frame 0.
    const envelope = new THREE.Group();
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.03, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.85 })
    );
    envelope.add(paper);
    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.012, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.7, roughness: 0.3 })
    );
    clip.position.set(0.09, 0.02, 0);
    envelope.add(clip);
    scene.add(envelope);

    // From e8_05 Bos pockets it: attach to his right hand.
    let pocketed = false;
    return {
      envelope,
      pocket() {
        if (pocketed || !bos) return;
        pocketed = true;
        holdProp(bos, 'right', envelope, { position: [0, -0.05, 0.02], rotation: [0.2, 0, 0.1] });
      },
    };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-0.4, 0, -0.6], rotationY: 0.15,
      beats: [
        { from: 0, to: L('e8_03'), pose: 'idle', emotion: 'stressed' },
        { from: L('e8_03'), to: L('e8_05'), pose: 'talk', emotion: 'angry' },
        { from: L('e8_05'), to: END, pose: 'keys', emotion: 'angry' },
      ],
    },
    {
      name: 'rayyan', Class: RayyanApp,
      scale: 0.95, position: [1.2, 0, 0.6], rotationY: -0.3,
      beats: [
        { from: 0, to: L('e8_02'), pose: 'offer', emotion: 'hyped' },
        { from: L('e8_02'), to: L('e8_03'), pose: 'talk', emotion: 'hyped' },
        { from: L('e8_03'), to: END, pose: 'idle', emotion: 'worried' },
      ],
    },
  ],
  onFrame: ({ frame, extra }) => {
    if (!extra || !extra.envelope) return;
    // Frame 0 slap: the envelope rebounds off Bos's chest.
    const rebound = smooth(clamp((frame - 2) / 10, 0, 1));
    if (frame < L('e8_05')) {
      extra.envelope.position.set(-0.28, lerp(1.28, 1.18, rebound), 0.06);
      extra.envelope.rotation.z = lerp(-0.5, -0.1, rebound);
    } else {
      extra.pocket();
    }
  },
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const rayyan = findActor(actors, 'rayyan');
      return [
        // Frame 0: the envelope slap lands in close-up.
        [0, [-0.3, 1.5, 1.7], [-0.28, 1.28, 0.06], 44],
        // Hook cut: Rayyan's gold boots and thicker offer.
        [sec(54), [1.9, 1.6, 2.6], [1.0, 1.4, 0.5], 42],
        shotKey(getSpeakerThreeQuarterShot(rayyan, bos, { distance: 3.4 }), sec(L('e8_02'))),
        shotKey(getSpeakerThreeQuarterShot(bos, rayyan, { distance: 3.4 }), sec(L('e8_03'))),
        // Bos pockets the evidence — cold insert on the hand.
        [sec(L('e8_05') - 6), [-0.7, 1.4, 0.9], [-0.2, 1.2, -0.5], 42],
        shotKey(getSpeakerThreeQuarterShot(bos, rayyan, { distance: 3.3 }), sec(L('e8_05'))),
        [sec(END), [0.4, 1.6, 3.2], [0.2, 1.3, -0.4], 46],
      ];
    },
  },
});
