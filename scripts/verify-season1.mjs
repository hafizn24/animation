import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Cross-checks Season 1 machine-readable sources.
 * Run `node scripts/verify-season1.mjs --audio` once the e6_–e12_ MP3s exist.
 */
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const requireAudio = process.argv.includes('--audio');
const problems = [];
const check = (label, fn) => {
  try {
    fn();
  } catch (error) {
    problems.push(`${label}: ${error.message}`);
  }
};

const debt = JSON.parse(fs.readFileSync(path.join(root, 'story/season1-debt.json'), 'utf8'));
const league = JSON.parse(fs.readFileSync(path.join(root, 'story/division5-league.json'), 'utf8'));
const ttsSource = fs.readFileSync(path.join(root, 'remotion/scripts/generate_tts.py'), 'utf8');
const manifest = new Map();
for (const match of ttsSource.matchAll(/\("(e(?:[6-9]|1[0-2])_[^"]+)",\s*"([^"]+)",\s*(\d+),\s*(\d+),\s*"((?:[^"\\]|\\.)*)"\)/g)) {
  manifest.set(match[1], { speaker: match[2], start: Number(match[3]), end: Number(match[4]), text: match[5] });
}

const VOICE_BY_SPEAKER = {
  NARRATOR: 'voice_6',
  BOS: 'voice_3',
  JURULATIH: 'voice_2',
  PEGUAM: 'voice_2',
  AZAM: 'voice_5',
  FARID: 'voice_4',
  DANIAL: 'voice_6',
  'KAPTEN ZAKI': 'voice_2',
  'PAK DIN': 'voice_1',
  RAYYAN: 'voice_4',
  'KAPTEN BOB': 'voice_5',
  'KAPTEN MALIK': 'voice_3',
  'PENJAGA GOL BESI': 'voice_2',
  PENGADIL: 'voice_2',
};

const audioDir = path.join(root, 'remotion/public/audio');
const sfxDir = path.join(audioDir, 'sfx');

for (let ep = 6; ep <= 12; ep += 1) {
  const file = path.join(root, 'episodes', `episode-${ep}`, 'audio-script.json');
  const mdFile = path.join(root, 'episodes', `episode-${ep}`, 'script.md');
  const script = JSON.parse(fs.readFileSync(file, 'utf8'));
  const md = fs.readFileSync(mdFile, 'utf8');
  const lines = script.scenes.flatMap((scene) => scene.lines);
  const tag = `Ep${ep}`;

  check(`${tag} runtime 40–45s`, () => {
    const seconds = script.totalFrames / script.fps;
    assert.ok(seconds >= 40 && seconds <= 45, `${seconds.toFixed(1)}s`);
  });
  check(`${tag} scene frame continuity`, () => {
    let cursor = 0;
    for (const scene of script.scenes) {
      assert.equal(scene.fromFrame, cursor, `${scene.id} fromFrame`);
      assert.equal(scene.durationFrames, scene.durationFrames, `${scene.id} duration`);
      cursor += scene.durationFrames;
    }
    assert.equal(cursor, script.totalFrames, 'totalFrames');
  });
  check(`${tag} 72-frame EndCard`, () => {
    const outro = script.scenes.at(-1);
    assert.equal(outro.durationFrames, 72);
    assert.equal(outro.director, null);
  });
  check(`${tag} first cut <= 60`, () => {
    const firstCut = script.scenes[0].events.find((event) => event.type === 'cut');
    assert.ok(firstCut, 'no cut event in first scene');
    assert.ok(firstCut.frame <= 60, `first cut at frame ${firstCut.frame}`);
  });
  check(`${tag} hook title 3–5 words`, () => {
    const words = script.overlays.hook.title.trim().split(/[\s,]+/).filter(Boolean);
    assert.ok(words.length >= 3 && words.length <= 5, `${words.length}: ${script.overlays.hook.title}`);
  });
  check(`${tag} JSON <-> manifest text/frames`, () => {
    for (const line of lines) {
      const row = manifest.get(line.id);
      assert.ok(row, `${line.id} missing from MANIFEST`);
      assert.equal(row.text, line.text, `${line.id} text`);
      assert.equal(row.start, line.startFrame, `${line.id} startFrame`);
      assert.equal(row.end, line.endFrame, `${line.id} endFrame`);
    }
  });
  check(`${tag} JSON <-> script.md`, () => {
    for (const line of lines) {
      assert.ok(md.includes(line.text), `${line.id} text missing from script.md`);
      assert.ok(md.includes(line.translation), `${line.id} translation missing from script.md`);
    }
  });
  check(`${tag} voices match`, () => {
    for (const line of lines) {
      assert.equal(line.voice, VOICE_BY_SPEAKER[line.speaker], `${line.id} (${line.speaker})`);
    }
  });
  check(`${tag} debt HUD matches season1-debt.json`, () => {
    const entry = debt.episodes.find((row) => row.ep === ep);
    const hud = script.overlays.debtTicker;
    assert.ok(hud, 'no debtTicker overlay');
    assert.equal(hud.from, entry.start, 'from');
    assert.equal(hud.to, entry.end, 'to');
    const expectedDirection = entry.delta < 0 ? 'down' : entry.delta > 0 ? 'up' : 'flat';
    assert.equal(hud.direction, expectedDirection, 'direction');
  });
  check(`${tag} cue files exist`, () => {
    for (const scene of script.scenes) {
      for (const cue of scene.cues || []) {
        assert.ok(fs.existsSync(path.join(sfxDir, cue.file)), `${cue.file} missing`);
      }
    }
  });
  check(`${tag} HUD final score matches league`, () => {
    const huds = [script.overlays.matchHUD].flat().filter(Boolean);
    if (!huds.length) return;
    const finalStep = huds.at(-1).steps.at(-1);
    const matchday = huds[0].matchday;
    const fixture = league.schedule.find((day) => day.matchday === matchday).fixtures[0];
    if (finalStep.clock === 'HT') {
      const ht = String(fixture[4] || '').match(/(\d+)\s*-\s*(\d+)/);
      assert.ok(ht, `no HT score in MD${matchday} fixture`);
      assert.equal(finalStep.home, Number(ht[1]), `home HT MD${matchday}`);
      assert.equal(finalStep.away, Number(ht[2]), `away HT MD${matchday}`);
    } else {
      assert.equal(finalStep.home, fixture[1], `home score MD${matchday}`);
      assert.equal(finalStep.away, fixture[3], `away score MD${matchday}`);
    }
  });
  if (requireAudio) {
    check(`${tag} MP3s exist`, () => {
      for (const line of lines) {
        const mp3 = path.join(audioDir, 'tts', `${line.id}.mp3`);
        assert.ok(fs.existsSync(mp3), `${line.id}.mp3 missing`);
      }
    });
  }
}

// Line gaps inside a single scene must never exceed 0.8s (24 frames).
for (let ep = 6; ep <= 12; ep += 1) {
  const script = JSON.parse(fs.readFileSync(path.join(root, 'episodes', `episode-${ep}`, 'audio-script.json'), 'utf8'));
  check(`Ep${ep} line gaps <= 24 frames`, () => {
    for (const scene of script.scenes) {
      const lines = scene.lines;
      for (let i = 1; i < lines.length; i += 1) {
        const gap = lines[i].startFrame - lines[i - 1].endFrame;
        assert.ok(gap <= 24, `${lines[i - 1].id} -> ${lines[i].id}: ${gap} frames`);
      }
    }
  });
}

if (problems.length) {
  console.log(`SEASON 1 VERIFY — ${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  FAIL ${problem}`);
  process.exitCode = 1;
} else {
  console.log('SEASON 1 VERIFY PASSED');
}
