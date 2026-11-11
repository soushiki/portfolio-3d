import { PROJECTS } from './data.js';
import { createUI } from './ui.js';
import { t, applyStaticText } from './i18n.js';
import { ROUTE, STOPS, LIST_ONLY } from './space/route.js';

applyStaticText();

const ui = createUI({
  featured: STOPS.filter((s) => !['hello'].includes(s.item.id)).map((s) => ({ item: s.item, planet: s.planet })),
  earlier: LIST_ONLY.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean),
  planets: ROUTE,
});

const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
document.body.classList.toggle('is-touch', isTouch);
// Motion: ?motion=reduce|full (tests) > the visitor's saved choice > the OS setting.
// Android reports "reduce" when animations are removed in system settings or by some battery savers,
// which turns the hop between planets into a cut; the Animations toggle lets the visitor override it.
const osReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let savedMotion = null;
try {
  savedMotion = localStorage.getItem('p3d-motion');
} catch {}
const forcedMotion = new URLSearchParams(location.search).get('motion');
const reducedMotion = forcedMotion ? forcedMotion === 'reduce' : savedMotion ? savedMotion === 'reduced' : osReduced;
const motionSource = forcedMotion ? 'url' : savedMotion ? 'saved' : 'OS';
document.body.classList.toggle('is-reduced', reducedMotion);
for (const b of document.querySelectorAll('[data-motion-toggle]')) {
  b.textContent = t(reducedMotion ? 'motionReduced' : 'motionFull');
  b.setAttribute('aria-pressed', String(!reducedMotion));
  b.title = t('motionHelp');
  b.addEventListener('click', () => {
    try {
      localStorage.setItem('p3d-motion', reducedMotion ? 'full' : 'reduced');
    } catch {}
    location.reload();
  });
}

function hasWebGL() {
  // ?webgl=0 forces the fallback list, handy for testing it.
  if (new URLSearchParams(location.search).get('webgl') === '0') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Phones, tablets and low-core machines get the cheap path. ?quality=low|high overrides it.
function pickQuality() {
  const forced = new URLSearchParams(location.search).get('quality');
  const small = Math.min(window.innerWidth, window.innerHeight) < 768;
  const weak = (navigator.hardwareConcurrency || 8) <= 4;
  const low = forced ? forced === 'low' : isTouch || small || weak;
  const dpr = window.devicePixelRatio || 1;
  return {
    low,
    antialias: !low,
    pixelRatio: low ? Math.min(dpr, 1.5) : Math.min(dpr, 2),
  };
}

async function loadFonts() {
  if (!document.fonts) return;
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  await Promise.race([
    Promise.all([document.fonts.load('64px "Bangers"'), document.fonts.load('500 16px "Outfit"')]),
    timeout,
  ]).catch(() => {});
}

async function boot() {
  // ?lineup=cats: the cat model sheet (design and review tool, no tour).
  if (new URLSearchParams(location.search).get('lineup') === 'cats' && hasWebGL()) {
    document.getElementById('loader').hidden = true;
    const { startLineup } = await import('./space/lineup.js');
    startLineup(document.getElementById('scene'));
    return;
  }
  if (!hasWebGL()) {
    ui.showFallback(t('noWebgl'));
    return;
  }
  try {
    ui.progress(0.1, t('loadingFonts'));
    await loadFonts();
    ui.progress(0.3, t('loadingEngine'));
    const { startGame } = await import('./space/game.js');
    ui.progress(0.5, t('buildingWorld'));
    const game = await startGame({
      canvas: document.getElementById('scene'),
      quality: pickQuality(),
      isTouch,
      ui,
      reducedMotion,
    });
    window.__game = game; // test hooks (advance, travelTo, next); harmless in production
    const params = new URLSearchParams(location.search);
    if (params.get('debug') === '1') {
      // On-device diagnosis: what the browser reports and how the last hop ran.
      const box = Object.assign(document.createElement('p'), { className: 'debug-readout' });
      document.body.append(box);
      setInterval(() => {
        const s = game.stats;
        box.textContent = `motion: ${reducedMotion ? 'reduced' : 'full'} (${motionSource}; OS says ${osReduced ? 'reduce' : 'no-preference'})\nquality: ${pickQuality().low ? 'low' : 'high'}  fps: ${s.fps.toFixed(0)}\nlast hop: ${s.lastHop ? s.lastHop.toFixed(2) + ' s' : '-'} (${s.lastHopKind})`;
      }, 500);
    }
    if (params.get('selftest') === 'hop') {
      const { runHopTest } = await import('./space/selftest.js');
      runHopTest(game, { reducedMotion });
    }
  } catch (err) {
    console.error(err);
    ui.showFallback(t('startFailed'));
  }
}

boot();
