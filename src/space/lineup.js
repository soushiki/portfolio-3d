import * as THREE from 'three';
import { setPixelRatio, comicMaterial as M, addOutlines, bannerSprite } from './comic.js';
import { createBackdrop } from './backdrop.js';
import { CATS, makeSecretCat, setPose, updateCat, collect } from './cats.js';
import { makeCat } from './hero.js';

// Model sheet for the cats (?lineup=cats): idle pose on the top row, found pose below,
// Tinta on the left for scale. A design and review tool; the tour never loads it.
// ?lineup=cats&play=1 plays every collect animation on a loop.

export function startLineup(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  setPixelRatio(renderer.getPixelRatio());
  const scene = new THREE.Scene();
  const backdrop = createBackdrop({ low: false });
  scene.add(backdrop.mesh);
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 400);

  const params = new URLSearchParams(location.search);
  const only = params.get('only')?.split(',');
  const list = only ? CATS.filter((c) => only.includes(c.id)) : CATS;
  const COLS = Math.min(7, only ? list.length : 7);
  const GAP_X = 2.6;
  const GAP_Y = 3.4;
  const play = params.get('play') === '1';
  const items = [];

  const plinth = () => {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.25, 20), M('#3A2E78'));
    g.position.y = -0.125;
    return addOutlines(g, 1);
  };

  const all = only ? list : [{ hero: true }, ...CATS];
  all.forEach((spec, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    for (const found of [false, true]) {
      if (spec.hero && found) continue;
      const x = (col - (COLS - 1) / 2) * GAP_X;
      const y = -(row * 2 + (found ? 1 : 0)) * GAP_Y;
      const holder = new THREE.Group();
      holder.position.set(x, y, 0);
      holder.add(plinth());
      let cat;
      if (spec.hero) {
        const h = makeCat({ coat: 'tuxedo', gear: true, outline: 1.5 });
        h.group.rotation.y = -0.55;
        holder.add(h.group);
        items.push({ update: (dt, t) => h.update(dt, t) });
      } else {
        cat = makeSecretCat(spec);
        cat.root.rotation.y = -0.5;
        if (found) setPose(cat, spec.found);
        holder.add(cat.root);
        items.push({ cat, found, spec });
      }
      const label = bannerSprite(spec.hero ? 'Tinta' : `${spec.name}${found ? ' ✓' : ''}`, { color: found ? '#8EDB5A' : '#FFD23F' });
      label.scale.multiplyScalar(0.55);
      label.position.set(0, -0.75, 0.6);
      holder.add(label);
      scene.add(holder);
    }
  });

  const rows = Math.ceil(all.length / COLS) * 2;
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Fit the whole sheet.
    const needW = COLS * GAP_X + 1;
    const needH = rows * GAP_Y;
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const D = Math.max(needH / (2 * tan), needW / (2 * tan * camera.aspect));
    camera.position.set(0, -(rows - 1) * GAP_Y * 0.5 + 0.6, D + 2);
    camera.lookAt(0, -(rows - 1) * GAP_Y * 0.5 + 0.6, 0);
    camera.updateProjectionMatrix();
    backdrop.resize(w, h, renderer.getPixelRatio());
  };
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  const t0 = last;
  let loopAt = 0;
  const tick = (dt, now) => {
    const t = (now - t0) / 1000;
    if (play && t > loopAt) {
      loopAt = t + 2.5;
      for (const it of items) {
        if (!it.cat || !it.found) continue;
        it.cat.found = false;
        setPose(it.cat, it.spec.idle);
        collect(it.cat);
      }
    }
    for (const it of items) (it.cat ? updateCat(it.cat, dt, t) : it.update(dt, t));
    backdrop.update(0, 0, t);
    renderer.render(scene, camera);
  };
  const frame = (now) => {
    tick(Math.min(0.05, Math.max(0, (now - last) / 1000)), now);
    last = now;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  window.__lineup = {
    advance(s) {
      let now = performance.now();
      for (let i = 0; i < Math.round(s * 60); i++) tick(1 / 60, (now += 1000 / 60));
    },
    collectAll() {
      for (const it of items) if (it.cat && it.found) (it.cat.found = false), setPose(it.cat, it.spec.idle), collect(it.cat);
    },
  };
}
