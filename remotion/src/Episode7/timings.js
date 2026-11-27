import script from '../../../episodes/episode-7/audio-script.json';

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
export const AGREEMENT_HUD = script.overlays.agreementHud;
export const LEAGUE_BOARD = script.overlays.leagueBoard;
export const OUTRO = script.overlays.outroCard;

/** Hard cuts between scenes — used for the whoosh SFX and the CutFlash. */
export const CUTS = [SCENE_2.fromFrame, SCENE_3.fromFrame, SCENE_4.fromFrame];

export const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.fromFrame && frame <= line.toFrame);
