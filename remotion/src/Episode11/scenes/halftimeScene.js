import { LockerRoomApp } from '../../../../environments/locker-room.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { DanialApp, FaridApp } from '../../../../characters/character-variants.js';
import { applyLockerGrade } from '../../Episode5/sceneKit.js';
import {
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  lerp,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;

/**
 * Act 2 (rework) — the locker room at its lowest: Farid says the thing nobody
 * wants to admit (this team cannot beat Besi Waja without Karim), Azam refuses
 * to let the room die, and the door opens — Bos walks in and says nothing.
 */
export const createHalftimeScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: LockerRoomApp,
  grade: (scene) => applyLockerGrade(scene, 'act2'),
  extra: (scene, { actors }) => {
    const farid = findActor(actors, 'farid');
    const azam = findActor(actors, 'azam');
    if (farid && azam) {
      farid.rig.rotation.y = 0.25;
      azam.rig.rotation.y = -0.2;
    }
    return {};
  },
  actors: [
    {
      name: 'farid', Class: FaridApp,
      scale: 0.96, position: [-1.0, 0, -1.2], rotationY: 0.25,
      beats: [
        { from: 0, to: L('e11_07'), pose: 'idle', emotion: 'stressed' },
        { from: L('e11_07'), to: L('e11_09'), pose: 'talk', emotion: 'worried' },
        { from: L('e11_09'), to: END, pose: 'idle', emotion: 'stressed' },
      ],
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.94, position: [-2.6, 0, -1.6], rotationY: 0.2,
      beats: [{ from: 0, to: END, pose: 'crouch', emotion: 'stressed' }],
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.9, 0, -1.0], rotationY: -0.2,
      beats: [
        { from: 0, to: L('e11_09'), pose: 'idle', emotion: 'stressed' },
        { from: L('e11_09'), to: END, pose: 'talk', emotion: 'angry' },
      ],
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.94, position: [2.6, 0, 1.4], rotationY: -0.9,
      beats: [
        { from: 0, to: L('e11_10'), pose: 'idle', visible: false },
        { from: L('e11_10'), to: END, pose: 'idle', emotion: 'stressed' },
      ],
      anim: ({ frame, rig }) => {
        // Bos enters through the doorway on the door cue: steps forward and
        // turns to face the room, silent.
        const entry = smooth(clamp((frame - L('e11_10')) / 26, 0, 1));
        rig.position.z = lerp(2.2, 1.4, entry);
        rig.rotation.y = lerp(-1.35, -0.55, entry);
      },
    },
  ],
  camera: {
    fov: 46, ease: smooth,
    keys: ({ actors }) => {
      const farid = findActor(actors, 'farid');
      const azam = findActor(actors, 'azam');
      const bos = findActor(actors, 'bos');
      return [
        // The silent room: heads down, flickering light.
        [0, [1.8, 1.8, 2.2], [-1.0, 1.3, -1.3], 46],
        shotKey(getSpeakerThreeQuarterShot(farid, azam, { distance: 3.9 }), sec(L('e11_07'))),
        shotKey(getSpeakerThreeQuarterShot(azam, farid, { distance: 3.8 }), sec(L('e11_09'))),
        // The door opens — Bos fills the frame without a word.
        [sec(L('e11_10') - 8), [1.4, 1.6, 3.4], [2.4, 1.4, 1.2], 44],
        shotKey(getTwoShot(bos, azam, { distance: 4.4 }), sec(END - 30)),
        [sec(END), [0.6, 1.7, 3.0], [0.4, 1.35, -0.8], 46],
      ];
    },
  },
});
