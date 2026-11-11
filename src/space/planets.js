import * as THREE from 'three';
import { comicMaterial as M, addOutlines, bannerSprite } from './comic.js';
import { makeLandmark } from '../landmarks.js';
import { CATS, makeSecretCat } from './cats.js';

const DEG = Math.PI / 180;

// Point on a planet's rim (z = 0 plane) at `deg` degrees, `lift` above the surface.
export function rimPoint(planet, deg, lift = 0, out = new THREE.Vector3()) {
  const a = deg * DEG;
  const r = planet.radius + lift;
  return out.set(planet.x + Math.cos(a) * r, planet.y + Math.sin(a) * r, 0);
}

// Stand an object on the rim: its +y points away from the centre, its front (+z) faces the camera.
function standOnRim(obj, planet, deg, sink = 0) {
  rimPoint(planet, deg, -sink, obj.position);
  obj.rotation.set(0, 0, (deg - 90) * DEG);
}

function planetBody(p, low) {
  const g = new THREE.Group();
  const R = p.radius;
  const seg = low ? 28 : 40;
  const main = M(p.color);
  const dark = M(p.accent);
  switch (p.style) {
    case 'facet': {
      // Minoscreto: a cut gem, privacy as a locked crystal.
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 1), main));
      break;
    }
    case 'banded': {
      // Ingresos: a coin-green world wrapped in a receipt-paper ribbon.
      g.add(new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2), main));
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, R * 0.09, 8, seg), M('#FFFDF6'));
      ribbon.rotation.set(1.25, 0.35, 0);
      g.add(ribbon);
      break;
    }
    case 'pill': {
      // Formato Médico: a two-tone capsule pill with a white half.
      const top = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2), main);
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#FFFDF6'));
      const tilt = new THREE.Group();
      tilt.add(top, bottom);
      tilt.rotation.z = -0.5;
      tilt.rotation.x = 0.6;
      g.add(tilt);
      break;
    }
    case 'capsule': {
      // Whisker Gacha: a gacha capsule, pink top, white bottom, a seam band.
      const top = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2), main);
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#FFFDF6'));
      const seam = new THREE.Mesh(new THREE.TorusGeometry(R * 1.01, R * 0.05, 6, seg), dark);
      seam.rotation.x = Math.PI / 2;
      const tilt = new THREE.Group();
      tilt.add(top, bottom, seam);
      tilt.rotation.x = 0.45;
      g.add(tilt);
      break;
    }
    case 'cratered':
    case 'moon':
    default: {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2), main));
      // Flat craters on the camera-facing side.
      const craters = p.style === 'cratered' ? 7 : 4;
      for (let i = 0; i < craters; i++) {
        const a = i * 2.39 + 0.6;
        const tilt = 0.25 + (i % 3) * 0.22;
        const n = new THREE.Vector3(Math.cos(a) * Math.sin(tilt * 2), Math.sin(a) * Math.sin(tilt * 2), Math.cos(tilt * 2)).normalize();
        const c = new THREE.Mesh(new THREE.CircleGeometry(R * (0.12 + (i % 3) * 0.05), 14), dark);
        c.position.copy(n).multiplyScalar(R * 1.002);
        c.lookAt(n.clone().multiplyScalar(R * 2));
        c.material = dark;
        g.add(c);
      }
      break;
    }
  }
  return g;
}

// Spring pad for the hop to the next planet: a yellow star that pulses when the hero is near.
function launchPad() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.45 : 1.0;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false }), M('#FFD23F'));
  star.rotation.x = -Math.PI / 2;
  star.position.y = 0.15;
  const g = new THREE.Group();
  const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.3, 10), M('#3A3557'));
  spring.position.y = 0.05;
  g.add(spring, star);
  return { group: g, star };
}

// Landmark ink: silhouette only. Hulls are pushed back so lines where parts cross disappear,
// and parts smaller than 0.22 units get none (the clock's ticks and hands, windows, buttons).
export const LANDMARK_OUTLINE = { bias: 0.22, minSize: 0.22 };

export function buildPlanets({ scene, route, low }) {
  const planets = [];
  const updaters = [];
  for (const p of route) {
    const root = new THREE.Group();
    const body = planetBody(p, low);
    body.position.set(p.x, p.y, 0);
    addOutlines(body, 1.3);
    root.add(body);

    // Landmarks for each stop, scaled to fit the planet.
    const fit = p.radius >= 10 ? 3.6 : 4.4;
    p.stops.forEach((stop) => {
      const lm = makeLandmark(stop.landmark, M);
      if (!lm) return;
      const s = fit / Math.max(lm.w, lm.h * 0.85);
      lm.group.scale.setScalar(s);
      const holder = new THREE.Group();
      holder.add(lm.group);
      standOnRim(holder, p, stop.angle, 0.3);
      // Set back from the hero's lane (z = 0) so the hero walks in front of it.
      holder.position.z = -(lm.d * s) / 2 - 0.15;
      addOutlines(holder, 1, LANDMARK_OUTLINE);
      root.add(holder);
      stop.object = holder;
      stop.height = lm.h * s;
      if (lm.update) updaters.push(lm.update);
    });

    // Launch pad.
    let pad = null;
    if (p.launch != null) {
      pad = launchPad();
      standOnRim(pad.group, p, p.launch, 0.05);
      addOutlines(pad.group, 1.1);
      root.add(pad.group);
    }

    let backPad = null;
    if (p.back != null) {
      backPad = launchPad();
      standOnRim(backPad.group, p, p.back, 0.05);
      addOutlines(backPad.group, 1.1);
      root.add(backPad.group);
    }

    // Banner with the planet number and name, above the top of the planet.
    const banner = bannerSprite(p.stops[0].item.title, { color: p.color, number: p.number });
    const tallest = Math.max(...p.stops.map((st) => (Math.abs(st.angle - 90) < 20 ? st.height ?? 0 : 0)), 3);
    banner.position.set(p.x, p.y + p.radius + tallest + 1.8, -2);
    root.add(banner);

    // Secret cats on the underside: easter eggs, never on the route.
    const hidden = [];
    for (const { id, angle } of p.cats ?? []) {
      const cat = makeSecretCat({ ...CATS.find((c) => c.id === id), low }); // low preset: half the fur tufts
      cat.root.rotation.y = -0.5; // three-quarter view toward the camera
      cat.root.scale.setScalar(1.1);
      const holder = new THREE.Group();
      holder.add(cat.root);
      standOnRim(holder, p, angle, 0.05);
      cat.place = (offsetDeg) => standOnRim(holder, p, angle + offsetDeg, 0.05); // zoomies run around the rim
      root.add(holder);
      hidden.push({ angle, holder, cat, found: false });
    }
    scene.add(root);
    planets.push({ ...p, root, body, pad, backPad, banner, hidden });
  }
  return {
    planets,
    update(t) {
      for (const u of updaters) u(t);
    },
  };
}
