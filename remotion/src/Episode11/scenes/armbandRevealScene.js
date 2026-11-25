import * as THREE from 'three';
import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import {
  attachArmband,
  clamp,
  createCinematicScene,
  faceEachOther,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/**
 * Act 3 (rework) — the covenant continues. Bos pulls Karim's gold armband
 * from his pocket, explains the wait, Azam confesses the yellow card, and Bos
 * explains why guilt is exactly why he chose him. The handover lands, the
 * armband goes on, hard cut. No narrator in this act.
 */
export const createArmbandRevealScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene, 'reveal'),
  extra: (scene, { actors }) => {
    const bos = findActor(actors, 'bos');
    const azam = findActor(actors, 'azam');
    faceEachOther(bos, azam);
    // The worn band is attached to Azam from the start, hidden until the
    // handover beat so the pocket reveal stays the only visible armband.
    const worn = attachArmband(azam, { arm: 'left', y: -0.2, z: 0.04 });
    if (worn) worn.visible = false;

    const armband = new THREE.Group();
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.115, 0.016, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 0.35, roughness: 0.5 })
    );
    band.rotation.x = Math.PI / 2;
    armband.add(band);
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.01, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x1b1d22 })
    );
    crest.position.y = 0.015;
    armband.add(crest);
    armband.position.set(-0.5, 1.3, -1.9);
    armband.scale.setScalar(0.9);
    scene.add(armband);
    return { armband, worn };
  },
  actors: [
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [-0.7, 0, -1.4], rotationY: 0.18,
      beats: [
        { from: 0, to: L('e11_11'), pose: 'keys', emotion: 'stressed' },
        { from: L('e11_11'), to: L('e11_12'), pose: 'offer' },
        { from: L('e11_12'), to: L('e11_13'), pose: 'point', emotion: 'angry' },
        { from: L('e11_13'), to: L('e11_14'), pose: 'idle' },
        { from: L('e11_14'), to: END, pose: 'talk', emotion: 'happy' },
      ],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.97, position: [0.9, 0, -1.0], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e11_13'), pose: 'idle', emotion: 'worried' },
        { from: L('e11_13'), to: L('e11_14'), pose: 'talk', emotion: 'worried' },
        { from: L('e11_14'), to: L('e11_15'), pose: 'idle', emotion: 'neutral' },
        { from: L('e11_15'), to: END, pose: 'talk', emotion: 'angry' },
      ],
    },
  ],
  onFrame: ({ frame, extra, actors }) => {
    if (!extra) return;
    const azam = findActor(actors, 'azam');
    // Handover: the pocket armband travels from Bos's chest to Azam's arm
    // across e11_12's last frames, then the worn band becomes visible.
    const handover = smooth(clamp((frame - (L('e11_12') - 6)) / 16, 0, 1));
    extra.armband.position.set(
      lerp(-0.5, 0.78, handover),
      lerp(1.3, 1.5, handover),
      lerp(-1.9, -1.05, handover)
    );
    if (handover >= 1) {
      extra.armband.visible = false;
      if (extra.worn) extra.worn.visible = true;
    }
    // Azam straightens into captain posture on the final line.
    if (azam && frame >= L('e11_15')) {
      azam.rig.scale.setScalar(azam.rig.scale.x + (1.0 - azam.rig.scale.x) * 0.2);
    }
  },
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const bos = findActor(actors, 'bos');
      const azam = findActor(actors, 'azam');
      return [
        // The armband comes out of the pocket — insert first.
        [0, [-0.2, 1.45, -0.4], [-0.5, 1.3, -1.9], 42],
        [sec(54), [-0.1, 1.6, -0.2], [-0.6, 1.35, -1.5], 42],
        shotKey(getSpeakerThreeQuarterShot(bos, azam, { distance: 3.6 }), sec(L('e11_11'))),
        shotKey(getSpeakerThreeQuarterShot(bos, azam, { distance: 3.4 }), sec(L('e11_12'))),
        // Azam's confession — closer.
        shotKey(getSpeakerThreeQuarterShot(azam, bos, { distance: 3.2 }), sec(L('e11_13'))),
        shotKey(getSpeakerThreeQuarterShot(bos, azam, { distance: 3.2 }), sec(L('e11_14'))),
        // The final line: two-shot, band already on the arm.
        shotKey(getTwoShot(bos, azam, { distance: 3.9 }), sec(L('e11_15'))),
        [sec(END), [0.2, 1.6, -0.1], [0.6, 1.4, -1.2], 44],
      ];
    },
  },
});
