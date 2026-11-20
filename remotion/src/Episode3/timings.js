import script from '../../../episodes/episode-3/audio-script.json';

/**
 * Single source of truth bridge: every Episode 3 timing (scenes, subtitles,
 * TTS placement, goal impacts, slow-mo, shake, HUD flips and SFX cues) is read
 * directly from episodes/episode-3/audio-script.json.
 */
export const E3 = script;
export const FPS = script.fps;
export const TOTAL_FRAMES = script.totalFrames;
export const SCENES = script.scenes;

export const getScene = (id) => SCENES.find((scene) => scene.id === id);

export const eventsOf = (scene, type) => (scene.events || []).filter((event) => event.type === type);

export const eventsAbsolute = (scene, type) =>
  eventsOf(scene, type).map((event) => ({ ...event, absoluteFrame: scene.fromFrame + event.frame }));

export const GOALS = SCENES.flatMap((scene) =>
  eventsAbsolute(scene, 'goal').map((event) => ({ ...event, sceneId: scene.id }))
);

export const HUD_GOALS = GOALS.map(({ absoluteFrame, score, label }) => ({
  absoluteFrame,
  score,
  label,
}));

export const goalFrame = (goalsScored) => {
  const event = GOALS.find((goal) => goal.score[0] === goalsScored);
  return event ? event.absoluteFrame : 0;
};

export const localGoalFrame = (sceneId, goalsScored) => {
  const scene = getScene(sceneId);
  return scene ? goalFrame(goalsScored) - scene.fromFrame : 0;
};

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
