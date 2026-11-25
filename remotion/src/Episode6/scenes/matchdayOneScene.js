import { FullSizeStadiumApp } from '../FullSizeStadiumApp.js';
import { AzamApp } from '../../../../characters/character-azam.js';
import { SoccerCoachOutfitApp } from '../../../../characters/character-coach.js';
import { DanialApp, ZakiApp } from '../../../../characters/character-variants.js';
import {
  animateKickAndGoal,
  applyKickPose,
  clamp,
  createCinematicScene,
  findActor,
  getSpeakerThreeQuarterShot,
  getTwoShot,
  goalExcitement,
  goalFrame,
  lerp,
  pitchGrade,
  placeBallAtFeet,
  presetKey,
  sec,
  shotKey,
  smooth,
} from '../sceneKit.js';
import { ACT_2 } from '../timings.js';

const L = (id, key = 'startFrame') => ACT_2.lines.find((line) => line.id === id)[key] - ACT_2.fromFrame;
const END = ACT_2.durationFrames;
const GOAL1 = goalFrame(ACT_2, 0);
const GOAL2 = goalFrame(ACT_2, 1);

/**
 * Act 2 (rework) — Matchday 1 vs Taktik Jaya. Zaki struts with his clipboard,
 * Azam answers, and both conceded goals land in-scene: Zaki strikes, Danial
 * screams at his backline, Jurulatih refuses to let the heads drop.
 */
export const createMatchdayOneScene = (renderer, size) => createCinematicScene(renderer, size, {
  environment: FullSizeStadiumApp,
  grade: (scene, env) => pitchGrade(scene, env, 'day'),
  extra: (scene, { env, actors }) => ({
    ...env.anchors,
    ballStart: null,
  }),
  actors: [
    {
      name: 'zaki', Class: ZakiApp,
      scale: 0.96, position: [-5.5, 0, -39.0], rotationY: 0.5,
      beats: [
        { from: 0, to: L('e6_07'), pose: 'stride' },
        { from: L('e6_07'), to: L('e6_08'), pose: 'talk', emotion: 'hyped' },
        { from: L('e6_08'), to: END, pose: 'idle' },
      ],
      anim: ({ frame, rig, parts }) => {
        // Zaki drifts into shooting range before each conceded goal.
        const run1 = smooth(clamp((frame - L('e6_08')) / Math.max(1, GOAL1 - 24 - L('e6_08')), 0, 1));
        const run2 = smooth(clamp((frame - L('e6_09')) / Math.max(1, GOAL2 - 24 - L('e6_09')), 0, 1));
        if (frame < GOAL1 - 20) {
          rig.position.x = lerp(-5.5, -2.6, run1);
        } else if (frame < GOAL2 - 20) {
          rig.position.x = lerp(-2.6, -2.2, run2 * 0.4);
        }
        if (frame >= GOAL1 - 24 && frame < GOAL1 - 8) {
          applyKickPose(parts, frame, { kickFrame: GOAL1 - 24, contactFrame: GOAL1 - 8, followThrough: 8 });
        }
        if (frame >= GOAL2 - 24 && frame < GOAL2 - 8) {
          applyKickPose(parts, frame, { kickFrame: GOAL2 - 24, contactFrame: GOAL2 - 8, followThrough: 8 });
        }
      },
    },
    {
      name: 'azam', Class: AzamApp, outfit: 'matchJersey',
      scale: 0.98, position: [2.5, 0, -37.5], rotationY: -0.45,
      beats: [
        { from: 0, to: L('e6_08'), pose: 'stride' },
        { from: L('e6_08'), to: END, pose: 'block', emotion: 'worried' },
      ],
    },
    {
      name: 'danial', Class: DanialApp,
      scale: 0.94, position: [-1.5, 0, -43.0], rotationY: 0.35,
      beats: [
        { from: 0, to: L('e6_09'), pose: 'crouch' },
        { from: L('e6_09'), to: END, pose: 'panic', emotion: 'angry' },
      ],
    },
    {
      name: 'jurulatih', Class: SoccerCoachOutfitApp, outfit: 'navyCoach',
      scale: 0.9, position: [5.5, 0, -40.5], rotationY: -0.5,
      beats: [
        { from: 0, to: L('e6_10'), pose: 'idle' },
        { from: L('e6_10'), to: END, pose: 'point', emotion: 'angry' },
      ],
    },
  ],
  onFrame: ({ frame, actors, extra }) => {
    const ball = extra && extra.ball;
    if (!ball) return;
    const zaki = findActor(actors, 'zaki');
    const goalTarget = [0, 1.0, -50.0];

    if (frame < GOAL1 - 8) {
      placeBallAtFeet(zaki, ball, 0.55);
    } else if (frame < GOAL1) {
      animateKickAndGoal({
        frame, kicker: zaki, ball, net: extra.net,
        target: goalTarget,
        kickFrame: GOAL1 - 24, contactFrame: GOAL1 - 8, hitFrame: GOAL1,
        placeBefore: false,
      });
    } else if (frame < GOAL2 - 8) {
      // Reset to Zaki's feet for the second strike.
      placeBallAtFeet(zaki, ball, 0.55);
      extra.shake = null;
    } else {
      const result = animateKickAndGoal({
        frame, kicker: zaki, ball, net: extra.net,
        target: [0.8, 1.2, -50.0],
        kickFrame: GOAL2 - 24, contactFrame: GOAL2 - 8, hitFrame: GOAL2,
        placeBefore: false,
      });
      extra.shake = result.shake;
    }
    extra.crowdExcitement = goalExcitement(frame, GOAL2, { idle: 0.1, peak: 0.55 });
  },
  camera: {
    fov: 44, ease: smooth,
    keys: ({ actors }) => {
      const zaki = findActor(actors, 'zaki');
      const azam = findActor(actors, 'azam');
      const danial = findActor(actors, 'danial');
      const jurulatih = findActor(actors, 'jurulatih');
      return [
        // Hook window: kickoff wide at the centre circle.
        [0, [8.5, 12.0, -28.0], [0, 1.3, -39.0], 42],
        // XI card clear -> Zaki struts in with the clipboard energy.
        [sec(120), [-0.5, 3.0, -32.0], [-5.5, 1.35, -39.0], 40],
        shotKey(getSpeakerThreeQuarterShot(zaki, azam, { distance: 4.4 }), sec(L('e6_07'))),
        shotKey(getSpeakerThreeQuarterShot(azam, zaki, { distance: 4.2 }), sec(L('e6_08'))),
        // First conceded goal: the ball beats Danial at his near post.
        [sec(Math.max(0, GOAL1 - 26)), [-5.0, 5.0, -31.0], [0, 1.2, -47.0], 42],
        shotKey(getSpeakerThreeQuarterShot(danial, azam, { distance: 4.0 }), sec(L('e6_09'))),
        // Second goal, then the Coach refuses to let heads drop.
        [sec(Math.max(0, GOAL2 - 26)), [5.0, 5.0, -31.0], [0, 1.3, -47.0], 42],
        shotKey(getSpeakerThreeQuarterShot(jurulatih, azam, { distance: 4.3 }), sec(L('e6_10'))),
        [sec(END), [7.0, 9.0, -27.0], [0, 1.2, -39.0], 42],
      ];
    },
  },
});
