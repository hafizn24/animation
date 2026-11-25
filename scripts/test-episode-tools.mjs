import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const runNpx = (args, options = {}) => {
  const prepared = process.platform === 'win32'
    ? args.map((arg) => (/[\s&|]/.test(arg) ? `"${arg}"` : arg))
    : args;
  return execFileSync(NPX, prepared, { shell: process.platform === 'win32', ...options });
};

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'buluh-episode-tools-'));
const episode = 99;
const episodeDir = path.join(temp, 'episodes', `episode-${episode}`);
const audioDir = path.join(temp, 'remotion', 'public', 'audio', 'tts');
fs.mkdirSync(episodeDir, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(path.join(temp, 'story'), { recursive: true });
for (const file of ['season-money.json', 'league.json']) {
  fs.copyFileSync(path.join(root, 'story', file), path.join(temp, 'story', file));
}

const count = 20;
for (let i = 1; i <= count; i += 1) {
  runNpx( ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=mono', '-t', '2', '-b:a', '160k', path.join(audioDir, `e99_${i}.mp3`)],
    { cwd: path.join(root, 'remotion'), stdio: 'ignore' });
}

const lines = Array.from({ length: count }, (_, index) => ({
  id: `e99_${index + 1}`,
  speaker: index % 2 ? 'JURULATIH' : 'BOS',
  text: `Baris ${index + 1}.`,
  translation: `Line ${index + 1}.`,
  startFrame: 0,
  endFrame: 0,
  gapBefore: 6,
}));
const data = {
  episode, fps: 30, width: 1080, height: 1920, totalFrames: 0,
  scenes: [
    { id: 'scene-1', fromFrame: 0, lines: lines.slice(0, 2) },
    { id: 'scene-2', fromFrame: 45, lines: lines.slice(2) },
  ],
  overlays: {
    hook: { title: 'BAYAR BULANAN.', fromFrame: 0, toFrame: 45 },
    titleCard: { text: `Buluh FC / EPISOD ${episode}`, fromFrame: 0, toFrame: 72 },
    hud: { month: 1, matchday: 1, debt: 269500 },
  },
};
fs.writeFileSync(path.join(episodeDir, 'audio-script.json'), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(episodeDir, 'script.md'), [
  '# Episode 99 fixture',
  ...lines.flatMap((line) => [`-${line.text}`, `-${line.translation}`]),
  '<!-- TIMING_TABLE_START -->',
  '<!-- TIMING_TABLE_END -->',
].join('\n'));

const env = { ...process.env, BULUH_ROOT: temp };
let failed = false;
try {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'retime.mjs'), String(episode)], { env, stdio: 'inherit' });
  execFileSync(process.execPath, [path.join(root, 'scripts', 'verify-episode.mjs'), String(episode)], { env, stdio: 'inherit' });
  const retimed = JSON.parse(fs.readFileSync(path.join(episodeDir, 'audio-script.json'), 'utf8'));
  const totalSeconds = retimed.totalFrames / 30;
  if (totalSeconds < 40 || totalSeconds > 51) throw new Error(`fixture runtime ${totalSeconds}s outside 40–51s`);
  if (retimed.scenes[0].lines[0].startFrame !== 0) throw new Error('first clip is not at frame 0');
  if (retimed.overlays.titleCard.fromFrame !== retimed.totalFrames - 72) throw new Error('EndCard misplaced');
} catch (error) {
  console.error(`FAIL episode tool fixtures: ${error.message}`);
  failed = true;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
if (failed) process.exit(1);
console.log('episode tool fixtures: PASS (silent MP3s, no TTS API)');
