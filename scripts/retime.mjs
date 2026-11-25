import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const runNpx = (args, options = {}) => {
  const prepared = process.platform === 'win32'
    ? args.map((arg) => (/[\s&|]/.test(arg) ? `"${arg}"` : arg))
    : args;
  return execFileSync(NPX, prepared, { shell: process.platform === 'win32', ...options });
};

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const root = process.env.BULUH_ROOT || repoRoot;
const episode = Number(process.argv[2]);
if (!Number.isInteger(episode) || episode < 6) {
  console.error('Usage: node scripts/retime.mjs <N>  (N >= 6)');
  process.exit(1);
}

const audioDir = path.join(root, 'remotion', 'public', 'audio', 'tts');
const scriptPath = path.join(root, 'episodes', `episode-${episode}`, 'audio-script.json');
const markdownPath = path.join(root, 'episodes', `episode-${episode}`, 'script.md');
const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const fps = data.fps || 30;
const endCardFrames = 72;

function measure(name) {
  const file = path.join(audioDir, `${name}.mp3`);
  if (!fs.existsSync(file)) throw new Error(`missing MP3: ${file}`);
  const args = NPX === 'npx.cmd' ? ['remotion', 'ffprobe', `"${file}"`] : ['remotion', 'ffprobe', file];
  const result = spawnSync(NPX, args, {
    cwd: path.join(repoRoot, 'remotion'),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`cannot read duration for ${name}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

let cursor = 0;
const rows = [];
for (const scene of data.scenes || []) {
  for (const line of scene.lines || []) {
    const name = line.file || line.id;
    const frames = Math.round(measure(name) * fps);
    if (frames < 1) throw new Error(`${name} has zero duration`);
    const gap = Math.min(8, Math.max(3, Number(line.gapBefore ?? 6)));
    const beat = Math.max(0, Number(line.beat ?? 0));
    line.gapBefore = gap;
    if (line.beat !== undefined) line.beat = beat;
    line.startFrame = cursor;
    line.endFrame = cursor + frames;
    line.start = Number((line.startFrame / fps).toFixed(3));
    line.end = Number((line.endFrame / fps).toFixed(3));
    line.durationFrames = frames;
    rows.push({ id: name, speaker: line.speaker, start: line.startFrame, end: line.endFrame, frames, gap, beat });
    cursor = line.endFrame + gap + beat;
  }
}

data.totalFrames = cursor + endCardFrames;
data.totalDurationSeconds = Number((data.totalFrames / fps).toFixed(3));
if (data.overlays?.titleCard) {
  data.overlays.titleCard.fromFrame = data.totalFrames - endCardFrames;
  data.overlays.titleCard.toFrame = data.totalFrames;
}
fs.writeFileSync(scriptPath, `${JSON.stringify(data, null, 2)}\n`);

const table = [
  '<!-- TIMING_TABLE_START -->',
  '| Line | Speaker | In | Out | Frames | Gap | Beat |',
  '| --- | --- | ---: | ---: | ---: | ---: | ---: |',
  ...rows.map((r) => `| ${r.id} | ${r.speaker} | ${r.start} | ${r.end} | ${r.frames} | ${r.gap} | ${r.beat} |`),
  `| EndCard | — | ${data.totalFrames - endCardFrames} | ${data.totalFrames} | ${endCardFrames} | — | — |`,
  '<!-- TIMING_TABLE_END -->',
].join('\n');

if (fs.existsSync(markdownPath)) {
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const marker = /<!-- TIMING_TABLE_START -->[\s\S]*?<!-- TIMING_TABLE_END -->/;
  const next = marker.test(markdown)
    ? markdown.replace(marker, table)
    : `${markdown.trimEnd()}\n\n${table}\n`;
  fs.writeFileSync(markdownPath, next);
}

console.log(`retime: Episode ${episode} -> ${data.totalFrames} frames / ${data.totalDurationSeconds}s (${rows.length} clips + ${endCardFrames}f EndCard)`);
