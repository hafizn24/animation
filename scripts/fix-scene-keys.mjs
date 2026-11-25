import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Keeps scene beat/camera end keys tied to the scene's live duration after a
 * re-time. The first-cut key (54f) and the single XI-card key (120f) are fixed
 * story beats and are left alone. Goal keys use GOAL constants and are safe.
 */
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
let changed = 0;

for (let ep = 6; ep <= 12; ep += 1) {
  const script = JSON.parse(
    fs.readFileSync(path.join(root, 'episodes', `episode-${ep}`, 'audio-script.json'), 'utf8')
  );
  const dir = path.join(root, 'remotion', 'src', `Episode${ep}`, 'scenes');
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.js'))) {
    const file_path = path.join(dir, file);
    let source = fs.readFileSync(file_path, 'utf8');
    const director = script.scenes.find((scene) => source.includes(`export const ${scene.director}`));
    if (!director) continue;

    const act = source.match(/import\s*\{\s*(ACT_\d+)\s*\}/)?.[1];
    if (!act) continue;
    if (!source.includes('const END =')) {
      const anchor = source.match(/const L = \([^\n]+\n/);
      if (anchor) {
        source = source.replace(anchor[0], `${anchor[0]}const END = ${act}.durationFrames;\n`);
      }
    }

    const before = source;
    source = source.replace(/to:\s*\d+/g, 'to: END');
    source = source.replace(/sec\((?!54\)|120\)|GOAL|L\()\d+\)/g, 'sec(END)');
    if (source !== before) {
      fs.writeFileSync(file_path, source);
      changed += 1;
      console.log(`scene keys synced: Episode${ep}/${file}`);
    }
  }
}

console.log(`SCENE KEY CHECK DONE — ${changed} file(s) updated`);
