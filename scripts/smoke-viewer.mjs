import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { ENTRIES } from '../viewer/registry.js';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const chromePath = process.env.CHROME_PATH;
if (!chromePath) {
  console.error('CHROME_PATH is not set. Point it at the system Chrome executable, e.g. CHROME_PATH=/usr/bin/google-chrome npm run test:viewer');
  process.exit(1);
}
if (!fs.existsSync(chromePath)) {
  console.error(`CHROME_PATH does not exist: ${chromePath}`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(root, `.${relative}`);
  if (!file.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const failures = [];
let loads = 0;

try {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  let diagnostics = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      diagnostics.push(`console.${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => diagnostics.push(`pageerror: ${error.message}`));
  page.on('dialog', async (dialog) => {
    diagnostics.push(`dialog: ${dialog.message()}`);
    await dialog.dismiss();
  });

  await page.route('https://cdn.jsdelivr.net/npm/three@0.162.0/**', async (route) => {
    const url = new URL(route.request().url());
    const suffix = url.pathname.split('@0.162.0/')[1];
    const file = path.join(root, 'node_modules', 'three', suffix);
    if (!fs.existsSync(file)) {
      await route.abort();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/javascript; charset=utf-8',
      body: fs.readFileSync(file, 'utf8'),
    });
  });

  await page.goto(origin, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.viewer && document.querySelector('#character-selector option')), null, { timeout: 20000 });
  await page.waitForFunction(() => Boolean(window.viewer.getManager()), null, { timeout: 20000 });

  for (let cycle = 1; cycle <= 2; cycle += 1) {
    for (const entry of ENTRIES) {
      diagnostics = [];
      await page.evaluate((id) => window.viewer.select(id, { replaceUrl: false }), entry.id);
      await page.waitForFunction(() => Boolean(window.viewer.getManager()), null, { timeout: 20000 });

      const canvas = await page.evaluate(() => {
        const element = document.querySelector('#canvas-container canvas');
        const manager = window.viewer.getManager();
        if (!element || !manager?.scene || !manager?.camera) return null;
        manager.renderer.render(manager.scene, manager.camera);
        return {
          width: element.width,
          height: element.height,
          dataUrl: element.toDataURL('image/png'),
          meshes: (() => {
            let count = 0;
            manager.scene.traverse((child) => { if (child.isMesh) count += 1; });
            return count;
          })(),
        };
      });
      loads += 1;

      const problems = [];
      if (!canvas || canvas.width < 1 || canvas.height < 1) problems.push('no canvas');
      if (canvas && canvas.dataUrl.length < 5000) problems.push('blank canvas');
      if (canvas && canvas.meshes < 1) problems.push('no meshes');
      problems.push(...diagnostics);
      if (problems.length) {
        failures.push(`cycle ${cycle} ${entry.id}: ${problems.join(' | ')}`);
      }
    }
  }
} catch (error) {
  failures.push(`harness error: ${error.message}`);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`Viewer smoke test failed: ${loads} loads attempted.`);
  process.exit(1);
}
console.log(`Viewer smoke test passed: ${ENTRIES.length} entries x 2 cycles = ${loads} loads, zero console warnings/errors and no blank canvases.`);
