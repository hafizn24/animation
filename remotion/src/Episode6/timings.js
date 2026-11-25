import script from '../../../episodes/episode-6/audio-script.json';

export const E6 = script;
export const FPS = script.fps;
export const WIDTH = script.width;
export const HEIGHT = script.height;
export const TOTAL_FRAMES = script.totalFrames;
export const SCENES = script.scenes;
export const OVERLAYS = script.overlays;

export const ALL_LINES = SCENES.flatMap((scene) => scene.lines);
export const ALL_CUES = SCENES.flatMap((scene) => (scene.cues || []).map((cue) => ({ ...cue })));
export const HOOK = OVERLAYS.hook;
export const HUD = OVERLAYS.hud;
export const END_CARD = OVERLAYS.titleCard;

export const getScene = (id) => SCENES.find((scene) => scene.id === id);
export const sceneLines = (scene) => scene.lines.map((line) => ({
  ...line,
  start: line.startFrame - scene.fromFrame,
  end: line.endFrame - scene.fromFrame,
  narration: line.type === 'narration',
}));

export const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.startFrame - 2 && frame < line.endFrame + 2);
