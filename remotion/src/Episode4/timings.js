import script from '../../../episodes/episode-4/audio-script.json';

export const E4 = script;
export const FPS = script.fps;
export const TOTAL_FRAMES = script.totalFrames;
export const SCENES = script.scenes;

export const getScene = (id) => SCENES.find((scene) => scene.id === id);

export const eventsOf = (scene, type) => (scene.events || []).filter((event) => event.type === type);

export const eventsAbsolute = (scene, type) =>
  eventsOf(scene, type).map((event) => ({ ...event, absoluteFrame: scene.fromFrame + event.frame }));

export const localEvent = (scene, type) => eventsOf(scene, type)[0] || null;

export const sceneLines = (scene) =>
  scene.lines.map((line) => ({
    ...line,
    start: line.startFrame - scene.fromFrame,
    end: line.endFrame - scene.fromFrame,
    narration: line.type === 'narrator',
  }));

export const sceneAudio = (scene) =>
  scene.lines.map((line) => ({ file: `${line.id}.mp3`, frame: line.startFrame - scene.fromFrame }));

export const sceneCues = (scene) => (scene.cues || []).map((cue) => ({ ...cue }));

export const TITLE_CARD = SCENES[SCENES.length - 1];

export const HUD_SCENE = getScene('heart-vs-survival');
export const HUD_FROM = HUD_SCENE.lines.find((line) => line.id === 'e4_05').startFrame;
export const HUD_TO = HUD_SCENE.lines.find((line) => line.id === 'e4_06').endFrame;

export const DOORWAY_SCENE = getScene('doorway-cliffhanger');
export const SILENCE_BEAT = localEvent(DOORWAY_SCENE, 'silence');
export const SILENCE_FROM = DOORWAY_SCENE.fromFrame + (SILENCE_BEAT ? SILENCE_BEAT.frame : 0);
export const SILENCE_TO = SILENCE_FROM + (SILENCE_BEAT ? SILENCE_BEAT.durationFrames : 39);
export const BASS_HIT = localEvent(DOORWAY_SCENE, 'bassHit');
export const BASS_FRAME = DOORWAY_SCENE.fromFrame + (BASS_HIT ? BASS_HIT.frame : 39);
