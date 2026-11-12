// Scroll behaviour test through Chrome's DevTools protocol: real wheel or touch-swipe gestures,
// then where the page settled. Node 22+, no dependencies.
// Usage: node tools/scroll-test.mjs <url> <wheel|touch> [width=1280] [height=800] [gestures=8] [deltaPx=120]
// Prints, per gesture, scrollY and the id of the section whose top is at the top of the screen.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, mode = 'wheel', w = '1280', h = '800', n = '8', delta = '120'] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'scroll-test-'))}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
});
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;

const mobile = mode === 'touch';
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
if (process.env.RM === '1') await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(2500);
const where = `(() => { const ids = ['intro','build','proof','projects','more','skills','contact'];
  const nav = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  let best = '-', bd = 1e9; for (const i of ids) { const el = document.getElementById(i); if (!el) continue;
  const d = Math.abs(el.getBoundingClientRect().top - nav); if (d < bd) { bd = d; best = i; } }
  return { y: Math.round(scrollY), at: bd < 40 ? best : '(between ' + best + ')', max: document.documentElement.scrollHeight - innerHeight }; })()`;
console.log('start', JSON.stringify(await evalJs(where)));
for (let g = 1; g <= +n; g++) {
  if (mode === 'wheel') {
    // A pointer move first, then the wheel as a real gesture (headless drops lone wheel events).
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: +w / 2, y: +h / 2 });
    await send('Input.synthesizeScrollGesture', { x: +w / 2, y: +h / 2, yDistance: -(+delta), speed: 2400, gestureSourceType: 'mouse' });
  } else {
    await send('Input.synthesizeScrollGesture', { x: +w / 2, y: +h * 0.7, yDistance: -(+delta), speed: 1200, gestureSourceType: 'touch' });
  }
  await sleep(1200);
  console.log(`gesture ${g}`, JSON.stringify(await evalJs(where)));
}
ws.close();
chrome.kill();
