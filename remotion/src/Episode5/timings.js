import script from '../../../episodes/episode-5/audio-script.json';

export const E5 = script;
export const FPS = script.fps;
export const WIDTH = script.width;
export const HEIGHT = script.height;
export const TOTAL_FRAMES = script.totalFrames;
export const SCENES = script.scenes;
export const OVERLAYS = script.overlays;

export const getScene = (id) => SCENES.find((scene) => scene.id === id);
export const eventsOf = (scene, type) => (scene.events || []).filter((event) => event.type === type);

export const ALL_LINES = SCENES.flatMap((scene) => scene.lines);
export const ALL_CUES = SCENES.flatMap((scene) => (scene.cues || []).map((cue) => ({ ...cue })));

export const ACT_1 = getScene('act-1-sacrifice');
export const ACT_2 = getScene('act-2-rumor');
export const ACT_3 = getScene('act-3-reveal');
export const BLACK_CUT = getScene('black-cut');

export const HOOK = OVERLAYS.hook;
export const DEBT_HUD = OVERLAYS.debtTicker;
export const TITLE_CARD = OVERLAYS.titleCard;
export const COMMENT_CARD = OVERLAYS.commentCard;
export const HUD_FLASH = OVERLAYS.hudFlash;
export const BLACK = OVERLAYS.blackCut;

/**
 * Subtitles are local to a scene, but e5_06 is a J-cut: its AUDIO starts 15
 * frames before the visual cut while its SUBTITLE waits for the new shot.
 */
export const sceneLines = (scene) =>
  scene.lines.map((line) => ({
    ...line,
    start: (line.subtitleStartFrame ?? line.startFrame) - scene.fromFrame,
    end: line.endFrame - scene.fromFrame,
    narration: line.type === 'narrator' || line.type === 'narration',
  }));

export const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.startFrame - 2 && frame < line.endFrame + 2);

export const SCENE_DIRECTORS = {
  createAct1SacrificeScene: ACT_1.director,
  createAct2RumorScene: ACT_2.director,
  createAct3RevealScene: ACT_3.director,
};
