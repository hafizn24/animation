import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENTRIES } from '../viewer/registry.js';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const problems = [];
const ids = new Set();

for (const entry of ENTRIES) {
  if (ids.has(entry.id)) problems.push(`duplicate registry id: ${entry.id}`);
  ids.add(entry.id);
  const modulePath = path.resolve(root, 'viewer', entry.module);
  if (!fs.existsSync(modulePath)) {
    problems.push(`${entry.id}: module missing: ${entry.module}`);
    continue;
  }
  const source = fs.readFileSync(modulePath, 'utf8');
  if (!new RegExp(`export\\s+(?:class|const)\\s+${entry.exportName}\\b`).test(source)) {
    problems.push(`${entry.id}: ${entry.exportName} not exported by ${entry.module}`);
  }
}

for (const dir of ['characters', 'environments']) {
  const full = path.join(root, dir);
  for (const file of fs.readdirSync(full).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(full, file), 'utf8');
    for (const match of source.matchAll(/export\s+class\s+(\w*App)\b/g)) {
      const name = match[1];
      if (!ENTRIES.some((entry) => entry.exportName === name)) {
        problems.push(`${dir}/${file}: exported ${name} is missing from the viewer registry`);
      }
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`Viewer registry OK: ${ENTRIES.length} entries, all exported App classes covered.`);
