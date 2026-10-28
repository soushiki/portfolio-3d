import { PROJECTS, CONTACT_ZONE, DATA_SCIENCE, DATA_SCIENCE_HUB } from './data.js';
import { createUI } from './ui.js';

const ui = createUI({ projects: [...PROJECTS, DATA_SCIENCE_HUB, ...DATA_SCIENCE] });

const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
document.body.classList.toggle('is-touch', isTouch);

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
    shadows: !low,
    shadowMapSize: 2048,
    antialias: !low,
    pixelRatio: low ? Math.min(dpr, 1.25) : Math.min(dpr, 2),
    trees: low ? 55 : 110,
  };
}

async function loadFonts() {
  if (!document.fonts) return;
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  await Promise.race([
    Promise.all([
      document.fonts.load('600 64px "Mozilla Headline"'),
      document.fonts.load('600 40px "Outfit"'),
      document.fonts.load('500 40px "Outfit"'),
    ]),
    timeout,
  ]).catch(() => {});
}

async function boot() {
  if (!hasWebGL()) {
    ui.showFallback("Your browser can't run the 3D world (WebGL is unavailable), so here are all the projects.");
    return;
  }
  try {
    ui.progress(0.1, 'Loading fonts…');
    await loadFonts();
    ui.progress(0.3, 'Loading the engine…');
    const { startGame } = await import('./game.js');
    const game = await startGame({
      canvas: document.getElementById('scene'),
      quality: pickQuality(),
      isTouch,
      ui,
      projects: PROJECTS,
      contact: CONTACT_ZONE,
      dataScience: { hub: DATA_SCIENCE_HUB, projects: DATA_SCIENCE },
    });
    if (import.meta.env.DEV) window.__game = game;
  } catch (err) {
    console.error(err);
    ui.showFallback('Something went wrong while starting the 3D world, so here are all the projects.');
  }
}

boot();
