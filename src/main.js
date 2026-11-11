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
// ?motion=reduce forces the reduced-motion path (handy for testing it).
const reducedMotion =
  new URLSearchParams(location.search).get('motion') === 'reduce' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.toggle('is-reduced', reducedMotion);

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
    if (import.meta.env.DEV) window.__game = game;
  } catch (err) {
    console.error(err);
    ui.showFallback(t('startFailed'));
  }
}

boot();
