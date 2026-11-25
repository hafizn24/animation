import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.BULUH_ROOT || path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const episode = Number(process.argv[2]);
if (!Number.isInteger(episode) || episode < 6) {
  console.error('Usage: node scripts/verify-episode.mjs <N>  (N >= 6)');
  process.exit(1);
}

const dir = path.join(root, 'episodes', `episode-${episode}`);
const audioDir = path.join(root, 'remotion', 'public', 'audio', 'tts');
const data = JSON.parse(fs.readFileSync(path.join(dir, 'audio-script.json'), 'utf8'));
const markdown = fs.readFileSync(path.join(dir, 'script.md'), 'utf8');
const money = JSON.parse(fs.readFileSync(path.join(root, 'story', 'season-money.json'), 'utf8'));
const league = JSON.parse(fs.readFileSync(path.join(root, 'story', 'league.json'), 'utf8'));
const fps = data.fps || 30;
const endCard = 72;
const failures = [];
const fail = (message) => failures.push(message);

const lines = (data.scenes || []).flatMap((scene) => (scene.lines || []).map((line) => ({ scene, line })));
if (!lines.length) fail('no dialogue lines');

for (const { line } of lines) {
  if (!line.text) fail(`${line.id || line.file}: missing Malay text`);
  if (!line.translation) fail(`${line.id || line.file}: missing English translation`);
  const name = line.file || line.id;
  if (!fs.existsSync(path.join(audioDir, `${name}.mp3`))) fail(`${name}: no MP3`);
  const gap = Number(line.gapBefore ?? 0);
  if (gap > 8) fail(`${name}: gapBefore ${gap} exceeds 8 frames`);
  if (Number(line.beat ?? 0) > 24 && !line.flaggedBeat) fail(`${name}: unflagged pause over 24 frames`);
}

for (let i = 1; i < lines.length; i += 1) {
  const previous = lines[i - 1].line;
  const current = lines[i].line;
  const gap = current.startFrame - previous.endFrame;
  if (gap > 24 && !current.beat) fail(`${current.id}: ${gap}-frame gap without a beat pause`);
}

const hook = data.overlays?.hook;
if (!hook || hook.fromFrame !== 0 || hook.toFrame !== 45) fail('hook window must be frames 0–45');
const firstCut = Math.min(...(data.scenes || []).slice(1).map((s) => s.fromFrame));
if (!Number.isFinite(firstCut) || firstCut > 60) fail(`first cut ${firstCut} is after frame 60`);
if (lines[0] && lines[0].line.startFrame !== 0) fail('first clip does not start at frame 0');

const total = data.totalFrames;
if (total < 40 * fps || total > 51 * fps) fail(`runtime ${(total / fps).toFixed(1)}s outside 40–51s`);
if (data.overlays?.titleCard?.fromFrame !== total - endCard) fail('EndCard is not the last 72 frames');
if (data.overlays?.titleCard?.text?.includes('FOLLOW') || /like|subscribe|komen/i.test(markdown)) fail('CTA detected');

for (const { line } of lines) {
  if (!markdown.includes(line.text)) fail(`${line.id}: Malay line absent from script.md`);
  if (!markdown.includes(line.translation)) fail(`${line.id}: English line absent from script.md`);
}
if (!/<!-- TIMING_TABLE_START -->[\s\S]*?<!-- TIMING_TABLE_END -->/.test(markdown)) fail('script.md has no regenerated timing table');

const hud = data.overlays?.hud;
if (hud) {
  const owed = money.openingDebt
    - money.instalment * money.months.filter((m) => m.paidInEpisode < episode).length
    + money.shocks.filter((s) => s.episode < episode).reduce((sum, s) => sum + s.amount, 0);
  if (hud.debt !== undefined && hud.debt !== owed) fail(`HUD debt ${hud.debt} != ${owed}`);
  if (hud.matchday !== undefined) {
    const fixture = league.fixtures.find((f) => f.matchday === hud.matchday && (f.home === 'BLH' || f.away === 'BLH'));
    if (!fixture) fail(`HUD matchday ${hud.matchday} has no Buluh fixture`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`verify-episode ${episode}: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`verify-episode ${episode}: PASS (${lines.length} lines, ${total} frames / ${(total / fps).toFixed(1)}s)`);
