import script from '../../../episodes/episode-6/audio-script.json';

export const FPS = script.fps;
export const TOTAL_FRAMES = script.totalFrames;

export const SCENES = script.scenes;
export const SCENE_1 = SCENES[0];
export const SCENE_2 = SCENES[1];
export const SCENE_3 = SCENES[2];
export const SCENE_4 = SCENES[3];
export const SCENE_5 = SCENES[4];

export const ALL_LINES = SCENES.flatMap((scene) => (scene.lines || []).map((line) => ({
  ...line,
  speaker: line.label,
  start: line.fromFrame,
  end: line.toFrame,
  translation: line.en,
  narration: line.type === 'narration' || line.type === 'narrator',
})));

export const HOOK = script.overlays.hook;
export const DEBT_LEDGER = script.overlays.debtLedger;
export const DIVISION_HUD = script.overlays.divisionHud;
export const FIXTURE_REVEAL = script.overlays.fixtureReveal;
export const OUTRO = script.overlays.outroCard;

export const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.fromFrame && frame <= line.toFrame);
