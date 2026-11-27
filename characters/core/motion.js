/**
 * Per-character motion profiles.
 *
 * One profile drives both runtimes:
 *  - browser: `animate()` calls `updateSeconds(clock elapsed)`
 *  - Remotion: `update(frame, fps)` calls `updateSeconds(frame / fps)`
 *
 * The numbers are lifted verbatim from the original per-class `animate()`
 * implementations so the shared driver reproduces them exactly.
 */

export const DEFAULT_MOTION = {
  // Locomotion branch (entered whenever `isWalking` is true).
  walkSpeed: 6,
  legAmp: 0.5,
  armAmp: 0.4,
  bounce: 0.06,
  // Some rigs (Karim, Azam) never had a walking branch; keep it that way.
  noWalk: false,

  // Idle branch.
  headBaseY: 1.95,
  idleFreq: 2,
  headAmp: 0.015,
  torsoBreathAmp: 0,
  swayArms: true,
  armIdleZ: 0.32,
  armSway: 0.02,

  // Optional idle arm-sway (Azam's `currentPose === 'idle'` block).
  armXSway: null,
};

/** Suit – slower, tighter stride, arms resting at ±0.30. */
export const SUIT_MOTION = {
  ...DEFAULT_MOTION,
  walkSpeed: 5.5,
  legAmp: 0.45,
  armAmp: 0.35,
  bounce: 0.05,
  armIdleZ: 0.3,
};

/** Soccer jersey – quickest gait in the cast, arms resting at ±0.28. */
export const SOCCER_MOTION = {
  ...DEFAULT_MOTION,
  walkSpeed: 7,
  legAmp: 0.6,
  armAmp: 0.45,
  bounce: 0.07,
  armIdleZ: 0.28,
};

/** The Chairman – stately walk, head bob only when standing. */
export const CHAIRMAN_MOTION = {
  ...DEFAULT_MOTION,
  walkSpeed: 4.2,
  legAmp: 0.42,
  armAmp: 0.3,
  bounce: 0.05,
  swayArms: false,
};

/** Sponsor executive – measured stride, head bob only when standing. */
export const SPONSOR_MOTION = {
  ...DEFAULT_MOTION,
  walkSpeed: 4.6,
  legAmp: 0.44,
  armAmp: 0.32,
  bounce: 0.05,
  swayArms: false,
};

/** The New Owner – purposeful walk, head bob only when standing. */
export const NEW_OWNER_MOTION = {
  ...DEFAULT_MOTION,
  walkSpeed: 6.2,
  legAmp: 0.5,
  armAmp: 0.42,
  bounce: 0.06,
  swayArms: false,
};

/** Karim – no locomotion branch, 1.8 Hz breathing with torso expansion. */
export const KARIM_MOTION = {
  ...DEFAULT_MOTION,
  noWalk: true,
  idleFreq: 1.8,
  headAmp: 0.015,
  torsoBreathAmp: 0.01,
  armIdleZ: 0.28,
};

/** Azam – 2.3 Hz bounce, no arm-z sway, guarded idle arm swing. */
export const AZAM_MOTION = {
  ...DEFAULT_MOTION,
  noWalk: true,
  idleFreq: 2.3,
  headAmp: 0.018,
  torsoBreathAmp: 0.014,
  swayArms: false,
  armXSway: {
    freq: 2.3,
    left: 0.06,
    right: -0.04,
    amp: 0.035,
    guard: 'idle',
    torsoSway: 0.012,
    headSway: 0.01,
    swayFreq: 1.1,
  },
};
