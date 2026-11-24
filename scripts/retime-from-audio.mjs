import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
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
const OUTRO_FRAMES = 72;
// A 250ms tail keeps the last syllable and the subtitle plate from ending together.
const TAIL_FRAMES = 8;
// Short natural clips need wider (but still <= 0.8s) gaps to reach 40–45s.
// Gaps are measured before the 8-frame tail is added to each line's endFrame,
// so the effective dialogue gap stays at 4–16 frames and runtime is unchanged.
const GAPS = {
  6: [10, 13], 7: [9, 13], 8: [9, 4], 9: [24, 24],
  10: [13, 15], 11: [13, 15], 12: [10, 13],
};
const GOAL_LINE = {
  e7_08: 'act-2-first-win',
  e8_08: 'act-2-bribe-revenge',
  e10_07: 'act-2-last-gasp',
  e12_07: 'act-2-winner',
};

const ttsPath = path.join(root, 'remotion/scripts/generate_tts.py');
let ttsSource = fs.readFileSync(ttsPath, 'utf8');
const manifestSpeakers = new Map();
for (const match of ttsSource.matchAll(/\("(e(?:[6-9]|1[0-2])_[^"]+)",\s*"([^"]+)"/g)) {
  manifestSpeakers.set(match[1], match[2]);
}

const ffmpegPath = execFileSync('python', [
  '-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())',
], { encoding: 'utf8' }).trim();

const measure = (file) => {
  const { stdout, stderr } = spawnSync(ffmpegPath, ['-i', file, '-f', 'null', '-'], {
    encoding: 'utf8',
  });
  const match = `${stdout || ''}${stderr || ''}`.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
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
  const [INTERNAL_GAP, SCENE_GAP] = GAPS[ep];
  const measured = new Map();

  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      const mp3 = path.join(root, 'remotion/public/audio/tts', `${line.id}.mp3`);
      const frames = Math.max(6, Math.round(measure(mp3) * fps));
      measured.set(line.id, frames);
    }
  }

  let cursor = 0;
  for (let index = 0; index < script.scenes.length - 1; index += 1) {
    const scene = script.scenes[index];
    const newFrom = cursor;
    let t = newFrom;
    for (const line of scene.lines) {
      line.startFrame = t;
      line.endFrame = t + measured.get(line.id) + TAIL_FRAMES;
      line.start = line.startFrame / fps;
      line.end = line.endFrame / fps;
      t = t + measured.get(line.id) + INTERNAL_GAP;
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
  for (const scene of script.scenes) {
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

  // Keep the on-screen goal tied to the line that announces it.
  for (const [lineId, sceneId] of Object.entries(GOAL_LINE)) {
    const line = script.scenes.flatMap((scene) => scene.lines).find((item) => item.id === lineId);
    const scene = script.scenes.find((item) => item.id === sceneId);
    if (!line || !scene) continue;
    const netCues = (scene.cues || []).filter((cue) => cue.file === 'net.wav');
    if (!netCues.length) continue;
    const goalFrame = Math.max(0, line.startFrame - 2);
    const hud = [script.overlays.matchHUD].flat().find((config) => config && config.scene === sceneId);
    if (hud && hud.steps.length > 1) {
      hud.steps.at(-1).frame = goalFrame;
      for (let i = 0; i < hud.steps.length - 1; i += 1) {
        hud.steps[i].frame = Math.max(0, Math.min(hud.steps[i].frame, goalFrame - (hud.steps.length - 1 - i) * 10));
      }
      netCues.forEach((cue, index) => {
        const step = hud.steps[index + 1];
        if (step) cue.frame = step.frame;
      });
    } else {
      netCues.at(-1).frame = goalFrame;
      if (hud && hud.steps.length) hud.steps.at(-1).frame = goalFrame;
    }
  }

  // Mirror the new frames back into the TTS manifest.
  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      const speaker = manifestSpeakers.get(line.id);
      if (!speaker) continue;
      const pattern = new RegExp(`\\("${line.id}",\\s*"[^"]+",\\s*\\d+,\\s*\\d+,(\\s*"((?:[^"\\\\]|\\\\.)*)")\\)`);
      ttsSource = ttsSource.replace(pattern, `("${line.id}", "${speaker}", ${line.startFrame}, ${line.endFrame},$1)`);
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

fs.writeFileSync(ttsPath, ttsSource);
await import('./fix-scene-keys.mjs');
