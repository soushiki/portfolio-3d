import * as THREE from 'three';
import { comicMaterial as M, addOutlines } from './comic.js';

// Tinta: the hero. An original tuxedo cat in a space-courier kit (yellow scarf, red jet pack).
// The same builder makes the 12 hidden cats with other coats (see COATS) and no gear.
// The model faces +x (walking right); +y is up. About 1.6 units tall.

export const COATS = {
  tuxedo: { fur: '#22203A', belly: '#F7F1E3', socks: '#F7F1E3', tip: '#F7F1E3', inner: '#F29BB0' },
  orange: { fur: '#F08A2E', belly: '#FBE3C2', socks: '#FBE3C2', tip: '#C9611A', inner: '#F29BB0' },
  grey: { fur: '#8C93A8', belly: '#DCE0EA', socks: '#DCE0EA', tip: '#5E6478', inner: '#F29BB0' },
  calico: { fur: '#F7F1E3', belly: '#F7F1E3', socks: '#E58A3A', tip: '#2B2840', inner: '#F29BB0' },
  black: { fur: '#2B2840', belly: '#2B2840', socks: '#2B2840', tip: '#2B2840', inner: '#B07A9C' },
  cream: { fur: '#EED9B4', belly: '#FFF6E5', socks: '#FFF6E5', tip: '#C8A979', inner: '#F29BB0' },
};

const sphere = (r, m, w = 16, h = 12) => new THREE.Mesh(new THREE.SphereGeometry(r, w, h), m);
const cone = (r, h, m, s = 4) => new THREE.Mesh(new THREE.ConeGeometry(r, h, s), m);
const capsule = (r, len, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), m);
const place = (o, x, y, z, sx = 1, sy = sx, sz = sx) => {
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
};

export function makeCat({ coat = 'tuxedo', gear = true, outline = 1.4 } = {}) {
  const c = COATS[coat] ?? COATS.tuxedo;
  const fur = M(c.fur);
  const belly = M(c.belly);
  const white = M('#FFFFFF');
  const ink = M('#16122E');

  const root = new THREE.Group(); // stays upright on the surface; animations squash this
  const body = new THREE.Group(); // bobs and leans
  root.add(body);

  // Torso: a short horizontal capsule with a pale chest.
  const torso = capsule(0.34, 0.5, fur);
  torso.rotation.z = Math.PI / 2;
  body.add(place(torso, 0, 0.62, 0));
  body.add(place(sphere(0.3, belly), 0.28, 0.58, 0, 0.8, 0.95, 0.9));

  // Head: big and round (chibi proportions read at small sizes).
  const head = new THREE.Group();
  head.position.set(0.52, 1.12, 0);
  body.add(head);
  head.add(sphere(0.46, fur, 20, 14));
  head.add(place(sphere(0.25, belly), 0.27, -0.12, 0, 0.8, 0.7, 1.15)); // muzzle
  head.add(place(sphere(0.06, M('#F06A8A'), 8, 6), 0.47, -0.02, 0)); // nose
  for (const z of [-0.17, 0.17]) {
    // Comic eyes: white ovals, big pupils with a white glint.
    head.add(place(sphere(0.12, white, 12, 10), 0.37, 0.1, z, 0.55, 1.15, 1));
    head.add(place(sphere(0.075, ink, 10, 8), 0.43, 0.1, z * 1.04, 0.5, 1.1, 1));
    head.add(place(sphere(0.025, white, 6, 4), 0.47, 0.15, z * 1.04));
    const ear = cone(0.17, 0.32, fur);
    head.add(place(ear, 0.02, 0.43, z * 1.55));
    ear.rotation.x = z > 0 ? 0.35 : -0.35;
    const inner = cone(0.09, 0.18, M(c.inner));
    head.add(place(inner, 0.09, 0.42, z * 1.55));
    inner.rotation.x = ear.rotation.x;
  }

  // Legs: four stubby capsules with socks.
  const legs = [];
  for (const [x, z] of [[0.3, 0.17], [0.3, -0.17], [-0.3, 0.17], [-0.3, -0.17]]) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.45, z);
    leg.add(place(capsule(0.1, 0.22, fur), 0, -0.14, 0));
    leg.add(place(sphere(0.12, M(c.socks), 10, 8), 0.02, -0.34, 0, 1.2, 0.75, 1));
    body.add(leg);
    legs.push(leg);
  }

  // Tail: a curling tube with a coloured tip.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, 0.7, 0),
    new THREE.Vector3(-0.85, 0.85, 0),
    new THREE.Vector3(-0.95, 1.25, 0),
    new THREE.Vector3(-0.75, 1.5, 0),
  ]);
  const tail = new THREE.Group();
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.085, 8), fur));
  tail.add(place(sphere(0.11, M(c.tip), 10, 8), -0.75, 1.5, 0));
  body.add(tail);

  let flame = null;
  if (gear) {
    // Yellow scarf with a flapping end, red jet pack with two nozzles.
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 18), M('#FFD23F'));
    scarf.rotation.y = Math.PI / 2;
    scarf.rotation.x = 0.25;
    body.add(place(scarf, 0.42, 0.86, 0));
    const tailEnd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.2), M('#FFD23F'));
    tailEnd.position.set(0.05, 0.92, 0.18);
    tailEnd.rotation.z = 0.35;
    body.add(tailEnd);
    root.userData.scarfEnd = tailEnd;
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.42), M('#E63946'));
    body.add(place(pack, -0.12, 1.02, 0));
    for (const z of [-0.12, 0.12]) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 10), M('#3A3557'));
      body.add(place(nozzle, -0.12, 0.78, z));
    }
    flame = new THREE.Group();
    for (const z of [-0.12, 0.12]) {
      const f = cone(0.08, 0.36, M('#FF8A3D', { emissive: true }), 8);
      f.rotation.z = Math.PI;
      flame.add(place(f, -0.12, 0.54, z));
    }
    flame.visible = false;
    body.add(flame);
  }

  addOutlines(root, outline, { bias: 0.25 });

  // Animation state, driven by game.js each frame.
  const anim = { walk: 0, phase: 0, squash: 0, air: 0 };
  const update = (dt, t) => {
    anim.phase += dt * 14 * anim.walk;
    const s = Math.sin(anim.phase);
    legs[0].rotation.z = legs[3].rotation.z = s * 0.7 * anim.walk;
    legs[1].rotation.z = legs[2].rotation.z = -s * 0.7 * anim.walk;
    body.position.y = Math.abs(s) * 0.06 * anim.walk;
    tail.rotation.z = Math.sin(t * 2.4) * 0.12 + anim.walk * 0.2;
    head.rotation.z = Math.sin(t * 1.3) * 0.05;
    if (root.userData.scarfEnd) root.userData.scarfEnd.rotation.z = 0.35 + Math.sin(t * 9) * 0.15 * (0.4 + anim.walk);
    // Squash and stretch: squash > 0 flattens, < 0 stretches.
    const k = anim.squash;
    root.scale.set(1 + k * 0.35, 1 - k * 0.45, 1 + k * 0.35);
    anim.squash *= Math.exp(-dt * 10);
    if (flame) flame.visible = anim.air > 0.5;
  };

  return { group: root, anim, update, legs, head };
}
