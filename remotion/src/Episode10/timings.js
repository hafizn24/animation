import script from '../../../episodes/episode-10/audio-script.json';
export const E10 = script;
export const FPS = script.fps;
export const WIDTH = script.width;
export const HEIGHT = script.height;
export const TOTAL_FRAMES = script.totalFrames;
export const SCENES = script.scenes;
export const OVERLAYS = script.overlays;
export const getScene = (id) => SCENES.find((scene) => scene.id === id);
export const ACT_1 = getScene('act-1-chaos');
export const ACT_2 = getScene('act-2-last-gasp');
export const ACT_3 = getScene('act-3-second-place');
export const OUTRO = OVERLAYS.outroCard;
export const ALL_LINES = SCENES.flatMap((scene) => scene.lines);
export const ALL_CUES = SCENES.flatMap((scene) => (scene.cues || []).map((cue) => ({ ...cue })));
export const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.startFrame - 2 && frame < line.endFrame + 2);
