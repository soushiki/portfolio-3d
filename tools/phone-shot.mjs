// Phone-sized screenshot through Chrome's DevTools protocol (real device emulation; headless
// --window-size can't go below ~500 px). Node 22+ (built-in WebSocket), no dependencies.
// Usage: node tools/phone-shot.mjs <url> <out.png> [width=360] [height=740] [waitMs=4000]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, w = '360', h = '740', wait = '4000'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node tools/phone-shot.mjs <url> <out.png> [width] [height] [waitMs]');
  process.exit(2);
}
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'phone-shot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {}
}
if (!target) {
  chrome.kill();
  throw new Error('Chrome did not start');
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
});
const send = (method, params = {}) => new Promise((r) => {
  pending.set(++id, r);
  ws.send(JSON.stringify({ id, method, params }));
});

await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(+wait);
const iw = await send('Runtime.evaluate', { expression: 'innerWidth', returnByValue: true });
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`saved ${out} (innerWidth ${iw.result.result.value})`);
ws.close();
chrome.kill();
