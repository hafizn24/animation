import { PitchTouchlineApp } from '../../../../environments/modular-pitch-zone.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SuitOutfitApp } from '../../../../characters/character-suit.js';
import { NewOwnerApp } from '../../../../characters/character-new-owner.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { clamp, createCinematicScene, lerp, pitchGrade, sec, smooth } from '../sceneKit.js';
import { ACT_3 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_3.lines.find((line) => line.id === id)[key] - ACT_3.fromFrame;
const END = ACT_3.durationFrames;

/** Act 3 — fearless block, then the lawyer silently checking his watch on the bench. */
export const createDesperateBlockScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: PitchTouchlineApp,
  grade: (scene, env) => pitchGrade(scene, env, 'dusk'),
  actors: [
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [0.4, 0, 0.6], rotationY: 0.2,
      beats: [
        { from: 0, to: L('e6_10'), pose: 'stride' },
        { from: L('e6_10'), to: L('e6_11'), pose: 'block' },
        { from: L('e6_11'), to: END, pose: 'idle' },
      ],
      anim: ({ frame, rig, parts }) => {
        const lunge = smooth(clamp((frame - L('e6_10')) / 26, 0, 1)) *
          (1 - smooth(clamp((frame - L('e6_11') + 10) / 30, 0, 1)));
        rig.position.x = lerp(0.4, 1.5, lunge);
        rig.rotation.z = -0.22 * lunge;
        if (parts.head) parts.head.rotation.x = 0.16 * lunge;
      },
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.88, position: [-0.9, 0, 3.4], rotationY: 0.2,
      beats: [
        { from: 0, to: L('e6_11'), pose: 'point' },
        { from: L('e6_11'), to: END, pose: 'idle' },
      ],
    },
    {
      name: 'peguam', Class: SuitOutfitApp,
      scale: 0.86, position: [-2.2, 0, 4.6], rotationY: -0.2,
      beats: [{ from: L('e6_11'), to: END, pose: 'talk' }],
      anim: ({ frame, parts }) => {
        if (parts.rightArm && frame > L('e6_11')) {
          parts.rightArm.rotation.x = -0.8;
        }
      },
    },
    {
      name: 'bos', Class: NewOwnerApp, outfit: 'charcoalOwner',
      scale: 0.86, position: [-3.1, 0, 4.8], rotationY: 0.1,
      beats: [{ from: L('e6_11'), to: END, pose: 'idle' }],
    },
  ],
  camera: {
    fov: 48, ease: smooth,
    keys: [
      [0, [1.6, 1.3, 3.4], [0.4, 1.0, 0.6], 46],
      [sec(L('e6_10')), [1.1, 0.9, 2.2], [1.2, 0.7, 0.8], 42],
      [sec(L('e6_11')), [-1.2, 1.5, 2.4], [-2.2, 1.4, 4.6], 46],
      [sec(END), [-1.8, 1.55, 2.0], [-2.6, 1.35, 4.8], 44],
    ],
  },
});
