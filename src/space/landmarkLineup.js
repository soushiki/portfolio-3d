import * as THREE from 'three';
import { setPixelRatio, comicMaterial as M, addOutlines, bannerSprite } from './comic.js';
import { createBackdrop } from './backdrop.js';
import { makeLandmark } from '../landmarks.js';
import { LANDMARK_OUTLINE } from './planets.js';

// Model sheet for the landmarks (?lineup=landmarks), built and outlined exactly as on the planets.
// &only=streetClock,vault narrows it; &zoom=2 moves closer; &old=1 shows the previous outline style
// (no depth push, hulls on every part) for comparison.
const KINDS = ['welcome', 'vault', 'bank', 'dataTower', 'mailbox', 'windTurbine', 'streetClock', 'hospital', 'gachaMachine', 'beacon'];

export function startLandmarkLineup(canvas) {
  const params = new URLSearchParams(location.search);
  const only = params.get('only')?.split(',');
  const kinds = only ? KINDS.filter((k) => only.includes(k)) : KINDS;
  const old = params.get('old') === '1';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  setPixelRatio(renderer.getPixelRatio());
  const scene = new THREE.Scene();
  const backdrop = createBackdrop({ low: false });
  scene.add(backdrop.mesh);
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 400);
  const COLS = Math.min(5, kinds.length);
  const GAP = 6;
  const updaters = [];
  kinds.forEach((kind, i) => {
    const lm = makeLandmark(kind, M);
    const s = 4.4 / Math.max(lm.w, lm.h * 0.85); // same fit as on a planet
    lm.group.scale.setScalar(s);
    const holder = new THREE.Group();
    holder.add(lm.group);
    holder.rotation.y = -0.35;
    holder.position.set(((i % COLS) - (COLS - 1) / 2) * GAP, -Math.floor(i / COLS) * GAP, 0);
    if (old) addOutlines(holder, 1);
    else addOutlines(holder, 1, LANDMARK_OUTLINE);
    const label = bannerSprite(kind, { color: '#FFD23F' });
    label.scale.multiplyScalar(0.6);
    label.position.set(0, -0.9, 1);
    holder.add(label);
    scene.add(holder);
    if (lm.update) updaters.push(lm.update);
  });
  const rows = Math.ceil(kinds.length / COLS);
  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const zoom = Number(params.get('zoom')) || 1;
    const D = Math.max((rows * GAP) / (2 * tan), (COLS * GAP) / (2 * tan * camera.aspect)) / zoom;
    const cy = -((rows - 1) * GAP) / 2 + 2;
    camera.position.set(0, cy, D + 2);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
    backdrop.resize(w, h, renderer.getPixelRatio());
  };
  addEventListener('resize', resize);
  resize();
  const t0 = performance.now();
  const frame = (now) => {
    const t = (now - t0) / 1000;
    for (const u of updaters) u(t);
    backdrop.update(0, 0, t);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
