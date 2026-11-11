import * as THREE from 'three';
import { comicMaterial as M, addOutlines } from './comic.js';

// The 13 secret cats, modelled on Sebastian's own cats (likeness from coat, markings, eyes and size;
// shapes stay simple and comic). Each has an idle pose, a short collect animation and a found pose.
// See docs/fable/ART-BIBLE.md §2b. The cat faces +x, +y is up, about 1 unit tall sitting.

const DEG = Math.PI / 180;

// Coat specs. patches: [part, x, y, z, radius, colour, squashY]; part = 'head' | 'body'.
export const CATS = [
  {
    id: 'ash', name: 'Ash', fur: '#8E95A8', belly: '#A9AFC0', socks: '#8E95A8', eyes: '#C8D45A', nose: '#E8A0AE',
    fluffy: 1.08, idle: 'loaf', collect: 'slowBlink', found: 'sit',
  },
  {
    id: 'charlie', name: 'Charlie', fur: '#24202E', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    blaze: true, patches: [['body', -0.1, 0.25, 0.22, 0.2, '#D9792E', 0.7], ['body', 0.2, 0.3, -0.2, 0.17, '#D9792E', 0.7], ['head', -0.15, 0.25, 0.2, 0.14, '#D9792E', 0.8]],
    idle: 'side', collect: 'headBump', found: 'knead',
  },
  {
    id: 'collie', name: 'Collie', fur: '#2A2230', belly: '#4A3A40', socks: '#3A2E36', eyes: '#E2C23A', nose: '#4A3A44',
    patches: [['body', 0, 0.25, 0.24, 0.16, '#8A4A22', 0.6], ['body', -0.25, 0.2, -0.22, 0.14, '#A35A26', 0.6], ['body', 0.25, 0.15, 0.25, 0.1, '#8A4A22', 0.6], ['head', 0.1, 0.3, -0.18, 0.12, '#8A4A22', 0.8]],
    chin: '#E8E2D8', idle: 'bellyUp', collect: 'slowBlink', found: 'groom',
  },
  {
    id: 'duly', name: 'Duly', fur: '#6B6A70', belly: '#F7F3EA', socks: '#F7F3EA', eyes: '#3A2E2A', nose: '#E8A0AE',
    stripes: '#45444C', blaze: true, size: 0.82, idle: 'sit', collect: 'pounce', found: 'tailUp',
  },
  {
    id: 'hazel', name: 'Hazel', fur: '#7A6650', belly: '#F7F3EA', socks: '#F7F3EA', eyes: '#B8B04A', nose: '#F0A8B4',
    stripes: '#4A3A2C', blaze: true, idle: 'peek', collect: 'headBump', found: 'sit',
  },
  {
    id: 'java', name: 'Java', fur: '#7C6A55', belly: '#A8977E', socks: '#7C6A55', eyes: '#B9C64A', nose: '#B07A6A',
    stripes: '#3E3328', idle: 'loaf', collect: 'stretch', found: 'sploot',
  },
  {
    id: 'nara', name: 'Nara', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#A9C25A', nose: '#F0A8B4',
    patches: [['head', -0.1, 0.3, 0.16, 0.17, '#D9792E', 0.7], ['head', -0.12, 0.3, -0.16, 0.15, '#2E2A34', 0.7], ['body', -0.3, 0.3, 0, 0.14, '#8A7A66', 0.6]],
    idle: 'sit', collect: 'slowBlink', found: 'knead',
  },
  {
    id: 'orange', name: 'Orange', fur: '#E39A45', belly: '#FBF2E2', socks: '#FBF2E2', eyes: '#A9BE6A', nose: '#E8A0AE',
    stripes: '#C26E22', size: 0.95, slim: true, idle: 'curled', collect: 'pounce', found: 'tailUp',
  },
  {
    id: 'oreo', name: 'Oreo', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    patches: [['head', -0.05, 0.25, 0, 0.36, '#24202E', 0.75], ['body', -0.15, 0.3, 0, 0.22, '#24202E', 0.6], ['body', 0.2, 0.2, 0.24, 0.12, '#24202E', 0.7]],
    tail: '#24202E', idle: 'side', collect: 'stretch', found: 'bellyUp',
  },
  {
    id: 'panda', name: 'Panda', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    patches: [['head', -0.05, 0.22, 0.16, 0.24, '#24202E', 0.8], ['body', -0.2, 0.3, 0, 0.24, '#24202E', 0.6], ['body', 0.18, 0.28, -0.2, 0.14, '#24202E', 0.7]],
    tail: '#24202E', size: 1.12, chunky: true, idle: 'loaf', collect: 'headBump', found: 'bellyUp',
  },
  {
    id: 'pelusa', name: 'Pelusa', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#A9C25A', nose: '#E8A0AE',
    patches: [['head', -0.1, 0.25, 0.1, 0.25, '#6E7384', 0.75], ['head', 0.32, 0.1, 0.16, 0.08, '#6E7384', 1], ['body', -0.2, 0.32, 0, 0.2, '#6E7384', 0.6]],
    tail: '#6E7384', fluffy: 1.12, idle: 'loaf', collect: 'slowBlink', found: 'knead',
  },
  {
    id: 'rosie', name: 'Rosie', fur: '#5C5450', belly: '#7A706A', socks: '#5C5450', eyes: '#C9B14A', nose: '#8A6A60',
    stripes: '#2E2826', idle: 'curled', collect: 'stretch', found: 'sploot',
  },
  {
    id: 'skipper', name: 'Skipper', fur: '#1F1C28', belly: '#FBF7EE', socks: '#1F1C28', eyes: '#E2C23A', nose: '#E8A0AE',
    longTail: true, slim: true, idle: 'sit', collect: 'headBump', found: 'tailUp',
  },
];

const sphere = (r, m, w = 14, h = 10) => new THREE.Mesh(new THREE.SphereGeometry(r, w, h), m);
const capsule = (r, len, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), m);
const put = (o, x, y, z, sx = 1, sy = sx, sz = sx) => {
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
};

function tube(points, r, m) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 14, r, 7), m);
}

// Tail shapes, all starting at the rump pivot (0, 0, 0) and pointing back (-x).
const TAILS = {
  up: [[0, 0], [-0.2, 0.25], [-0.22, 0.65], [-0.08, 0.85]], // tail-up greeting, hooked tip
  wrap: [[0, 0], [-0.15, -0.3], [0.1, -0.45, 0.25], [0.55, -0.42, 0.3]], // around the front paws
  curl: [[0, 0], [-0.1, -0.25, 0.1], [0.25, -0.35, 0.3], [0.6, -0.2, 0.3]], // nose tucked in
  back: [[0, 0], [-0.3, -0.05], [-0.6, -0.12], [-0.85, -0.1]], // straight back
  hang: [[0, 0], [-0.3, 0.1], [-0.55, 0.05], [-0.75, -0.1]],
};

export function makeSecretCat(spec) {
  const fur = M(spec.fur);
  const belly = M(spec.belly);
  const socks = M(spec.socks);
  const tailMat = M(spec.tail ?? spec.fur);
  const fluffy = spec.fluffy ?? 1;
  const bodyW = (spec.chunky ? 1.15 : spec.slim ? 0.88 : 1) * fluffy;

  const root = new THREE.Group(); // stays on the surface
  const rig = new THREE.Group(); // scaled per cat, animated by poses
  root.add(rig);
  rig.scale.setScalar(spec.size ?? 1);

  // Torso pivots at the back hips so sitting tilts it up around the rump.
  const torso = new THREE.Group();
  rig.add(torso);
  const trunk = capsule(0.27 * bodyW, 0.42, fur);
  trunk.rotation.z = Math.PI / 2;
  torso.add(put(trunk, 0.32, 0, 0, 1, 1, bodyW > 1 ? 1.1 : 1));
  torso.add(put(sphere(0.24 * bodyW, belly), 0.55, -0.06, 0, 0.8, 0.9, 0.95)); // chest
  if (spec.stripes) {
    for (const x of [0.12, 0.3, 0.48]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.27 * bodyW + 0.005, 0.03, 5, 16, Math.PI * 1.1), M(spec.stripes));
      band.rotation.y = Math.PI / 2;
      band.rotation.x = -Math.PI * 0.05;
      torso.add(put(band, x, 0, 0));
    }
  }
  for (const [part, x, y, z, r, c, sy] of spec.patches ?? []) {
    if (part !== 'body') continue;
    torso.add(put(sphere(r, M(c), 10, 8), 0.32 + x, y * bodyW * 0.9, z * bodyW, 1.2, sy, 1));
  }

  // Haunches: hidden inside the trunk in most poses, they round out the rump when sitting.
  for (const z of [-0.13, 0.13]) torso.add(put(sphere(0.19 * bodyW, fur, 10, 8), 0.1, -0.06, z));

  // Legs: shoulder/hip pivots inside the torso so they follow it.
  const leg = (x, z, front) => {
    const g = new THREE.Group();
    g.position.set(x, -0.08, z);
    g.add(put(capsule(0.085 * bodyW, 0.2, front ? fur : fur), 0, -0.16, 0));
    g.add(put(sphere(0.1 * bodyW, socks, 8, 6), 0.03, -0.32, 0, 1.25, 0.7, 1));
    torso.add(g);
    return g;
  };
  const legs = {
    fl: leg(0.6, 0.13, true),
    fr: leg(0.6, -0.13, true),
    bl: leg(0.06, 0.14, false),
    br: leg(0.06, -0.14, false),
  };

  // Tail: one tube per shape, toggled by the pose.
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-0.02, 0.02, 0);
  torso.add(tailPivot);
  const tailLen = spec.longTail ? 1.25 : 1;
  const tails = {};
  for (const [k, pts] of Object.entries(TAILS)) {
    const g = new THREE.Group();
    g.add(tube(pts.map(([x, y, z = 0]) => [x * tailLen, y * tailLen, z]), 0.065 * fluffy, tailMat));
    g.visible = false;
    tailPivot.add(g);
    tails[k] = g;
  }

  // Head with ears, muzzle, real eye colour and slit pupils.
  const head = new THREE.Group();
  rig.add(head);
  head.add(sphere(0.33 * fluffy, fur, 18, 12));
  for (const [part, x, y, z, r, c, sy] of spec.patches ?? []) {
    if (part !== 'head') continue;
    head.add(put(sphere(r, M(c), 10, 8), x, y * 0.9, z, 1, sy, 1));
  }
  head.add(put(sphere(0.17, belly, 12, 8), 0.2, -0.1, 0, 0.8, 0.65, 1.2)); // muzzle
  if (spec.chin) head.add(put(sphere(0.07, M(spec.chin), 8, 6), 0.27, -0.18, 0));
  if (spec.blaze) head.add(put(sphere(0.07, belly, 8, 6), 0.27, 0.06, 0, 0.5, 1.8, 0.8)); // white stripe up the nose
  head.add(put(sphere(0.045, M(spec.nose), 8, 6), 0.33, -0.03, 0));
  const eyes = [];
  for (const z of [-0.12, 0.12]) {
    const eye = new THREE.Group();
    eye.position.set(0.25, 0.06, z);
    eye.add(put(sphere(0.085, M(spec.eyes), 10, 8), 0, 0, 0, 0.55, 1, 1));
    eye.add(put(sphere(0.06, M('#16122E'), 8, 6), 0.03, 0, 0, 0.5, 1, 0.35)); // vertical slit
    eye.add(put(sphere(0.018, M('#FFFFFF'), 6, 4), 0.05, 0.035, 0));
    head.add(eye);
    eyes.push(eye);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), z > 0 ? earMat(spec, 'L') : earMat(spec, 'R'));
    head.add(put(ear, 0.0, 0.28, z * 1.45));
    ear.rotation.x = z > 0 ? 0.3 : -0.3;
  }

  addOutlines(root, 1.1);

  const cat = { spec, root, rig, torso, legs, tails, head, eyes, pose: null, anim: null, time: 0, found: false };
  setPose(cat, spec.idle);
  return cat;
}

// Ear colour: patched cats get the patch colour on the side the patch covers.
function earMat(spec, side) {
  const headPatch = (spec.patches ?? []).find((p) => p[0] === 'head' && (side === 'L' ? p[3] >= 0 : p[3] <= 0) && p[4] > 0.13);
  return M(headPatch ? headPatch[5] : spec.fur);
}

// --- Poses -------------------------------------------------------------------------------------
// Each pose sets the rig directly. Values are hand-tuned for the side-on camera.
const POSES = {
  loaf(c) {
    c.torso.position.set(-0.3, 0.27, 0);
    c.torso.rotation.set(0, 0, 0);
    for (const l of Object.values(c.legs)) l.rotation.set(0, 0, 0), l.scale.set(1, 0.35, 1);
    c.head.position.set(0.33, 0.5, 0);
    c.head.rotation.set(0, 0, 0);
    showTail(c, 'wrap');
  },
  sit(c) {
    c.torso.position.set(-0.25, 0.3, 0);
    c.torso.rotation.set(0, 0, 0.85);
    resetLegs(c);
    c.legs.fl.rotation.z = c.legs.fr.rotation.z = -0.85; // front legs stay vertical
    // Back legs fold away under the haunches; only the paws show in front.
    c.legs.bl.rotation.z = c.legs.br.rotation.z = -2.2;
    c.legs.bl.scale.set(1, 0.45, 1);
    c.legs.br.scale.set(1, 0.45, 1);
    c.head.position.set(0.18, 1.0, 0);
    c.head.rotation.set(0, 0, 0);
    showTail(c, 'wrap');
  },
  peek(c) {
    // Only head and ears above the surface, as if behind a crater rim.
    c.torso.position.set(-0.3, -0.6, 0);
    c.torso.rotation.set(0, 0, 0);
    resetLegs(c);
    c.head.position.set(0.15, 0.08, 0);
    c.head.rotation.set(0, 0, 0.15);
    showTail(c, 'up');
    c.tails.up.visible = true;
    c.torso.position.y = -0.55;
  },
  curled(c) {
    c.torso.position.set(-0.35, 0.24, 0);
    c.torso.rotation.set(0, 0, 0);
    for (const l of Object.values(c.legs)) l.rotation.set(0, 0, 0), l.scale.set(1, 0.3, 1);
    c.head.position.set(0.28, 0.32, 0.12);
    c.head.rotation.set(0.2, 0, -0.5);
    showTail(c, 'curl');
    closeEyes(c, 0.1);
  },
  side(c) {
    // Lying on its side: legs reach toward the camera.
    c.torso.position.set(-0.35, 0.24, 0);
    c.torso.rotation.set(-1.25, 0, 0);
    resetLegs(c);
    c.legs.fl.rotation.z = -0.5;
    c.legs.fr.rotation.z = -0.3;
    c.legs.bl.rotation.z = 0.4;
    c.legs.br.rotation.z = 0.6;
    c.head.position.set(0.32, 0.36, 0.15);
    c.head.rotation.set(-0.5, 0, 0.1);
    showTail(c, 'back');
  },
  bellyUp(c) {
    c.torso.position.set(-0.3, 0.3, 0);
    c.torso.rotation.set(Math.PI * 0.78, 0, 0); // belly turned partly toward the camera
    resetLegs(c);
    for (const l of Object.values(c.legs)) l.scale.set(1.1, 1.15, 1.1);
    c.legs.fl.rotation.z = -0.35;
    c.legs.fr.rotation.z = -1.0;
    c.legs.bl.rotation.z = 0.25;
    c.legs.br.rotation.z = 0.8;
    c.head.position.set(0.36, 0.3, 0);
    c.head.rotation.set(Math.PI * 0.85, 0, 0.2);
    showTail(c, 'back');
  },
  sploot(c) {
    c.torso.position.set(-0.3, 0.22, 0);
    c.torso.rotation.set(0, 0, 0);
    resetLegs(c);
    c.legs.fl.rotation.z = c.legs.fr.rotation.z = -1.35; // front paws forward
    c.legs.bl.rotation.z = c.legs.br.rotation.z = 1.45; // back legs straight behind
    c.head.position.set(0.38, 0.42, 0);
    c.head.rotation.set(0, 0, -0.1);
    showTail(c, 'back');
  },
  tailUp(c) {
    c.torso.position.set(-0.3, 0.52, 0);
    c.torso.rotation.set(0, 0, 0);
    resetLegs(c);
    c.head.position.set(0.38, 0.86, 0);
    c.head.rotation.set(0, 0, 0.1);
    showTail(c, 'up');
  },
  knead(c) {
    POSES.loaf(c);
    c.torso.position.y = 0.32;
    c.legs.fl.scale.set(1, 1, 1);
    c.legs.fr.scale.set(1, 1, 1);
    c.legs.fl.rotation.z = -0.9;
    c.legs.fr.rotation.z = -0.6;
    c.head.position.set(0.36, 0.6, 0);
    closeEyes(c, 0.35); // content, half-closed
  },
  groom(c) {
    POSES.sit(c);
    c.legs.fl.rotation.z = -2.5; // paw raised to the mouth
    c.legs.fl.position.y = 0.05;
    c.head.rotation.set(0.15, 0, -0.35);
  },
};

function resetLegs(c) {
  for (const l of Object.values(c.legs)) {
    l.rotation.set(0, 0, 0);
    l.scale.set(1, 1, 1);
    l.position.y = -0.08;
  }
}
function showTail(c, k) {
  for (const [name, g] of Object.entries(c.tails)) g.visible = name === k;
}
function closeEyes(c, open) {
  for (const e of c.eyes) e.scale.y = open;
}

export function setPose(cat, name) {
  for (const e of cat.eyes) e.scale.y = 1;
  (POSES[name] ?? POSES.loaf)(cat);
  cat.pose = name;
  cat.base = { torsoY: cat.torso.position.y, headY: cat.head.position.y, headX: cat.head.position.x, headRz: cat.head.rotation.z };
}

// --- Collect animations (about 1.2 s), then the found pose --------------------------------------
const COLLECT_TIME = 1.2;

export function collect(cat, { reducedMotion = false } = {}) {
  if (cat.found) return;
  cat.found = true;
  if (reducedMotion) {
    // Calm version: a slow blink, then the found pose.
    cat.anim = { name: 'slowBlink', t: 0, duration: 0.6 };
  } else {
    cat.anim = { name: cat.spec.collect, t: 0, duration: COLLECT_TIME };
  }
}

const ANIMS = {
  slowBlink(c, u) {
    const k = u < 0.5 ? 1 - u * 1.6 : 0.2 + (u - 0.5) * 1.6;
    closeEyes(c, Math.max(0.15, Math.min(1, k)));
  },
  stretch(c, u) {
    const s = Math.sin(u * Math.PI);
    c.torso.rotation.z = -0.35 * s; // front down, rear up
    c.legs.fl.rotation.z = c.legs.fr.rotation.z = -1.2 * s;
    c.head.position.y = c.base.headY - 0.25 * s;
    c.head.position.x = c.base.headX + 0.2 * s;
    showTail(c, s > 0.3 ? 'up' : c.tails.up.visible ? 'up' : currentTail(c));
  },
  pounce(c, u) {
    if (u < 0.6) {
      c.torso.rotation.y = Math.sin(u * 40) * 0.12; // rear wiggle
      c.torso.position.y = c.base.torsoY - 0.08;
    } else {
      const h = Math.sin(((u - 0.6) / 0.4) * Math.PI);
      c.rig.position.y = h * 0.5;
      c.torso.rotation.y = 0;
    }
  },
  headBump(c, u) {
    const s = Math.sin(u * Math.PI * 2) * (1 - u);
    c.head.position.x = c.base.headX + 0.18 * Math.max(0, s);
    c.head.rotation.z = c.base.headRz - 0.3 * Math.max(0, s);
    closeEyes(c, 1 - 0.7 * Math.max(0, s));
  },
};

function currentTail(c) {
  return Object.keys(c.tails).find((k) => c.tails[k].visible) ?? 'back';
}

// Call every frame. `t` is seconds (0 under reduced motion), dt the frame time.
export function updateCat(cat, dt, t) {
  if (cat.anim) {
    const a = cat.anim;
    a.t += dt;
    const u = Math.min(1, a.t / a.duration);
    ANIMS[a.name]?.(cat, u);
    if (u >= 1) {
      cat.anim = null;
      cat.rig.position.y = 0;
      cat.torso.rotation.y = 0;
      setPose(cat, cat.spec.found);
    }
    return;
  }
  if (!t) return;
  // Small idle life: breathing, an occasional ear flick via head tilt, kneading paws.
  const phase = t + cat.spec.id.length;
  cat.torso.position.y = cat.base.torsoY + Math.sin(phase * 2) * 0.012;
  if (cat.pose === 'knead') {
    cat.legs.fl.rotation.z = -0.9 + Math.max(0, Math.sin(phase * 5)) * 0.4;
    cat.legs.fr.rotation.z = -0.6 + Math.max(0, -Math.sin(phase * 5)) * 0.4;
  } else if (cat.pose === 'groom') {
    cat.head.rotation.z = -0.35 + Math.sin(phase * 6) * 0.08;
  } else if (cat.pose === 'tailUp') {
    cat.tails.up.rotation.z = Math.sin(phase * 3) * 0.12;
  } else {
    cat.head.rotation.z = cat.base.headRz + (Math.sin(phase * 0.7) > 0.97 ? 0.08 : 0);
  }
}
