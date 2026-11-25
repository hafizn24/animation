import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const problems = [];

const sourceFiles = tracked.filter((file) => /\.(js|mjs|jsx|py|json|html|md|css)$/.test(file));
for (const file of sourceFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [index, line] of content.split('\n').entries()) {
    if (/^<<<<<<<|^>>>>>>>|^=======$/.test(line)) problems.push(`${file}:${index + 1}: merge-conflict marker`);
  }
}

for (const file of tracked.filter((f) => f.endsWith('.json'))) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    problems.push(`${file}: invalid JSON (${error.message})`);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const remotionPkg = JSON.parse(fs.readFileSync(path.join(root, 'remotion', 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
for (const match of readme.matchAll(/^\s*npm run ([\w:-]+)/gm)) {
  if (!pkg.scripts?.[match[1]] && !remotionPkg.scripts?.[match[1]]) {
    problems.push(`README: npm run ${match[1]} has no package.json script`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}
console.log(`check-repo: PASS (${sourceFiles.length} source files, ${tracked.filter((f) => f.endsWith('.json')).length} JSON files, README commands valid)`);
