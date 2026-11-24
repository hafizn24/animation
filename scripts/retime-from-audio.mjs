import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Rebuilds Season 1 audio-script.json timelines from the measured natural-speed
 * MP3s. Keeps every line inside its original scene; shifts cues, events, HUD
 * steps and overlay windows by the same scene delta; regenerates script.md rows.
 *
 * Usage: node scripts/retime-from-audio.mjs
 */
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fps = 30;
const INTERNAL_GAP = 12; // 0.4s between lines in one scene
const SCENE_GAP = 18; // 0.6s between acts (<= 24f / 0.8s)
const OUTRO_FRAMES = 72;

const ffmpegPath = execFileSync('python', [
  '-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())',
], { encoding: 'utf8' }).trim();

const measure = (file) => {
  const output = execFileSync(ffmpegPath, ['-i', file, '-f', 'null', '-'], {
    encoding: 'utf8',
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`could not measure ${file}`);
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

const fmtTableRow = (line, withTime) => {
  const time = `${line.start.toFixed(1)}–${line.end.toFixed(1)}`;
  const frames = `${line.startFrame}–${line.endFrame}`;
  const cells = withTime
    ? [line.id, time, frames, line.speaker, `"${line.text}"`, `"${line.translation}"`]
    : [line.id, frames, line.speaker, `"${line.text}"`, `"${line.translation}"`];
  return `| ${cells.join(' | ')} |`;
};

for (let ep = 6; ep <= 12; ep += 1) {
  const jsonPath = path.join(root, 'episodes', `episode-${ep}`, 'audio-script.json');
  const mdPath = path.join(root, 'episodes', `episode-${ep}`, 'script.md');
  const script = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const oldSceneFrom = new Map(script.scenes.map((scene) => [scene.id, scene.fromFrame]));
  const measured = new Map();

  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      const mp3 = path.join(root, 'remotion/public/audio/tts', `${line.id}.mp3`);
      const frames = Math.max(6, Math.round(measure(mp3) * fps));
      measured.set(line.id, frames);
    }
  }

  let cursor = 0;
  for (let index = 0; index < script.scenes.length; index += 1) {
    const scene = script.scenes[index];
    const newFrom = cursor;
    let t = newFrom;
    for (const line of scene.lines) {
      line.startFrame = t;
      line.endFrame = t + measured.get(line.id);
      line.start = line.startFrame / fps;
      line.end = line.endFrame / fps;
      t = line.endFrame + INTERNAL_GAP;
    }
    if (scene.lines.length && index < script.scenes.length - 2) t += SCENE_GAP - INTERNAL_GAP;
    scene.fromFrame = newFrom;
    scene.from = newFrom / fps;
    scene.durationFrames = Math.max(1, t - newFrom);
    scene.to = (newFrom + scene.durationFrames) / fps;
    cursor = newFrom + scene.durationFrames;
  }

  const lastScene = script.scenes.at(-1);
  lastScene.fromFrame = cursor;
  lastScene.from = cursor / fps;
  lastScene.durationFrames = OUTRO_FRAMES;
  lastScene.to = (cursor + OUTRO_FRAMES) / fps;
  script.totalFrames = cursor + OUTRO_FRAMES;
  script.totalDurationSeconds = script.totalFrames / fps;
  if (script.overlays.outroCard) {
    script.overlays.outroCard.fromFrame = cursor;
    script.overlays.outroCard.toFrame = script.totalFrames;
    script.overlays.outroCard.durationFrames = OUTRO_FRAMES;
  }

  const shift = (value, sceneId) => {
    const target = script.scenes.find((scene) => scene.id === sceneId);
    return value + (target.fromFrame - oldSceneFrom.get(sceneId));
  };
  for (const scene of script.scenes.slice(0, -1)) {
    for (const cue of scene.cues || []) cue.frame = shift(cue.frame, scene.id);
    for (const event of scene.events || []) event.frame = shift(event.frame, scene.id);
  }
  for (const [key, value] of Object.entries(script.overlays)) {
    for (const config of [value].flat()) {
      if (!config || !config.scene) continue;
      const delta = script.scenes.find((scene) => scene.id === config.scene).fromFrame - oldSceneFrom.get(config.scene);
      for (const field of ['fromFrame', 'toFrame']) {
        if (config[field] != null) config[field] += delta;
      }
      for (const step of config.steps || []) step.frame += delta;
    }
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify(script, null, 2)}\n`);

  let md = fs.readFileSync(mdPath, 'utf8');
  const withTime = /\|\s*Time\s*\|/.test(md);
  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      const row = fmtTableRow(line, withTime);
      const pattern = new RegExp(`^\\|\\s*${line.id}\\*?\\s*\\|.*$`, 'm');
      if (pattern.test(md)) md = md.replace(pattern, row);
    }
  }
  fs.writeFileSync(mdPath, md);

  const status = script.totalFrames >= 1200 && script.totalFrames <= 1350 ? 'OK' : 'OUT OF RANGE';
  console.log(`Episode ${ep}: ${script.totalFrames} frames / ${script.totalDurationSeconds.toFixed(1)}s — ${status}`);
}
