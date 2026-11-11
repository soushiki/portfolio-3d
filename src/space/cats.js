import * as THREE from 'three';
import { comicMaterial, addOutlines, bindPaint } from './comic.js';

// Fur materials: a short soft ramp and a rim light a little lighter than the coat.
const M = (color, paint) => comicMaterial(color, { soft: 0.14, rim: rimOf(color), paint });
function rimOf(hex) {
  const c = new THREE.Color(hex);
  return '#' + c.lerp(new THREE.Color('#FFF6E5'), 0.55).getHexString();
}
const noLine = (mesh) => ((mesh.userData.outline = 0), mesh);

// The 13 secret cats, modelled on Sebastian's own cats (likeness from coat, markings, eyes and size;
// shapes stay simple and comic). His photos give only the looks; the motion follows real cat body
// language: idle hiding pose -> caught (freeze or startle hop) -> greeting (tail up, quivering tip)
// -> the cat's own happy end pose. Chaotic cats add zoomies or a dazed wobble.
// See docs/fable/ART-BIBLE.md §2b. The cat faces +x, +y is up, about 1 unit tall sitting.

const DEG = Math.PI / 180;

// Coat specs. patches: [part, x, y, z, radius, colour, squashY]; part = 'head' | 'body'.
export const CATS = [
  {
    id: 'ash', name: 'Ash', fur: '#8E95A8', belly: '#A9AFC0', socks: '#8E95A8', eyes: '#C8D45A', nose: '#E8A0AE',
    fluffy: 1.08, idle: 'loaf', react: ['freeze', 'greet', 'slowBlink'], found: 'sit',
  },
  {
    id: 'charlie', name: 'Charlie', fur: '#24202E', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    blaze: true, patches: [['body', -0.1, 0.25, 0.22, 0.2, '#D9792E', 0.7], ['body', 0.2, 0.3, -0.2, 0.17, '#D9792E', 0.7], ['head', -0.15, 0.25, 0.2, 0.14, '#D9792E', 0.8]],
    idle: 'side', react: ['freeze', 'zooted', 'greet'], found: 'sit',
  },
  {
    id: 'collie', name: 'Collie', fur: '#2A2230', belly: '#4A3A40', socks: '#3A2E36', eyes: '#E2C23A', nose: '#4A3A44',
    patches: [['body', 0, 0.25, 0.24, 0.16, '#8A4A22', 0.6], ['body', -0.25, 0.2, -0.22, 0.14, '#A35A26', 0.6], ['body', 0.25, 0.15, 0.25, 0.1, '#8A4A22', 0.6], ['head', 0.1, 0.3, -0.18, 0.12, '#8A4A22', 0.8]],
    chin: '#E8E2D8', idle: 'bellyUp', react: ['freeze', 'greet'], found: 'bellyUp',
  },
  {
    // Same warm grey-brown tabby as Hazel; white face, chest and socks.
    id: 'duly', name: 'Duly', fur: '#7A6E62', belly: '#F7F3EA', socks: '#F7F3EA', eyes: '#3A2E2A', nose: '#E8A0AE',
    stripes: '#4C4239', blaze: true, size: 0.82,
    paint: {
      body: [{ kind: 'blob', at: [0.2, 0.2, 0.22], size: 0.13, color: '#8A7660' }, { kind: 'blob', at: [0.45, 0.22, -0.2], size: 0.12, color: '#85838A' }],
      head: [{ kind: 'half', at: [0, -1, 0], size: -0.02, color: '#F7F3EA' }, { kind: 'blob', at: [0.22, 0.05, 0], size: 0.15, color: '#F7F3EA' }],
    },
    react: ['hop', 'zoomies'], found: 'tailUp',
  },
  {
    // Same warm grey-brown tabby as Duly; white chest and muzzle, brown bridge above the nose.
    id: 'hazel', name: 'Hazel', fur: '#7A6E62', belly: '#F7F3EA', socks: '#F7F3EA', eyes: '#B8B04A', nose: '#F0A8B4',
    stripes: '#4C4239',
    paint: {
      body: [{ kind: 'blob', at: [0.15, 0.22, -0.2], size: 0.14, color: '#85838A' }, { kind: 'blob', at: [0.5, 0.2, 0.2], size: 0.12, color: '#8A7660' }],
      head: [{ kind: 'blob', at: [0.27, 0.2, 0], size: 0.12, color: '#5E4A38' }, { kind: 'blob', at: [0.31, 0.08, 0], size: 0.06, color: '#5E4A38' }, { kind: 'blob', at: [-0.05, 0.2, 0.15], size: 0.12, color: '#85838A' }],
    },
    react: ['hop', 'greet'], found: 'sit',
  },
  {
    id: 'java', name: 'Java', fur: '#7C6A55', belly: '#A8977E', socks: '#7C6A55', eyes: '#B9C64A', nose: '#B07A6A',
    stripes: '#3E3328', idle: 'loaf', react: ['freeze', 'stretch', 'greet'], found: 'groom',
  },
  {
    id: 'nara', name: 'Nara', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#A9C25A', nose: '#F0A8B4',
    patches: [['head', -0.1, 0.3, 0.16, 0.17, '#D9792E', 0.7], ['head', -0.12, 0.3, -0.16, 0.15, '#2E2A34', 0.7], ['body', -0.3, 0.3, 0, 0.14, '#8A7A66', 0.6]],
    idle: 'sit', react: ['hop', 'greet'], found: 'knead',
  },
  {
    id: 'orange', name: 'Orange', fur: '#E39A45', belly: '#FBF2E2', socks: '#FBF2E2', eyes: '#A9BE6A', nose: '#E8A0AE',
    stripes: '#C26E22', size: 0.95, slim: true, idle: 'curled', react: ['hop', 'zoomies'], found: 'tailUp',
  },
  {
    // White with Skipper's layout of black on top: black back, tail and cap over the head and one eye;
    // big white belly and chest up to the chin. A black bracelet on her left front leg.
    id: 'oreo', name: 'Oreo', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    tail: '#24202E',
    paint: {
      body: [{ kind: 'half', at: [0, 1, 0], size: -0.03, color: '#24202E' }, { kind: 'blob', at: [0.05, -0.05, 0.27], size: 0.12, color: '#24202E' }],
      head: [{ kind: 'half', at: [-0.3, 0.95, 0], size: -0.02, color: '#24202E' }, { kind: 'blob', at: [0.22, 0.08, -0.13], size: 0.11, color: '#24202E' }],
      legFr: [{ kind: 'band', at: [0, -0.24, 0], size: 0.035, color: '#24202E' }],
    },
    idle: 'side', react: ['hop', 'zooted'], found: 'sploot',
  },
  {
    // Chunky, white with Skipper's layout of black on top: black back and tail, black over the head
    // and the far eye and ear; big white belly and chest up to the chin.
    id: 'panda', name: 'Panda', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#C8D45A', nose: '#E8A0AE',
    tail: '#24202E', size: 1.12, chunky: true,
    paint: {
      body: [{ kind: 'half', at: [-0.15, 1, 0], size: 0.0, color: '#24202E' }, { kind: 'blob', at: [0.5, 0.05, -0.26], size: 0.13, color: '#24202E' }],
      head: [{ kind: 'half', at: [-0.25, 0.9, -0.25], size: -0.04, color: '#24202E' }, { kind: 'blob', at: [0.2, 0.06, -0.14], size: 0.14, color: '#24202E' }],
    },
    idle: 'loaf', react: ['freeze', 'greet', 'headBump'], found: 'bellyUp',
  },
  {
    id: 'pelusa', name: 'Pelusa', fur: '#FBF7EE', belly: '#FBF7EE', socks: '#FBF7EE', eyes: '#A9C25A', nose: '#E8A0AE',
    patches: [['head', -0.1, 0.25, 0.1, 0.25, '#6E7384', 0.75], ['head', 0.32, 0.1, 0.16, 0.08, '#6E7384', 1], ['body', -0.2, 0.32, 0, 0.2, '#6E7384', 0.6]],
    tail: '#6E7384', fluffy: 1.12, idle: 'loaf', react: ['freeze', 'greet', 'slowBlink'], found: 'sit',
  },
  {
    id: 'rosie', name: 'Rosie', fur: '#5C5450', belly: '#7A706A', socks: '#5C5450', eyes: '#C9B14A', nose: '#8A6A60',
    stripes: '#2E2826', idle: 'curled', react: ['freeze', 'greet'], found: 'knead',
  },
  {
    id: 'skipper', name: 'Skipper', fur: '#1F1C28', belly: '#FBF7EE', socks: '#1F1C28', eyes: '#E2C23A', nose: '#E8A0AE',
    longTail: true, slim: true, idle: 'sit', react: ['freeze', 'greet'], found: 'tailUp',
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

// --- Fur tufts ---------------------------------------------------------------------------------
// Small alpha-tested cards with a jagged, clumped tuft drawn in white and tinted per coat,
// placed on each part's side-view edge so the spikes break the silhouette.
let tuftTexture = null;
function getTuftTexture() {
  if (tuftTexture) return tuftTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.beginPath();
  // A fan of 5 spikes rising from a rounded base.
  const spikes = [[8, 30], [18, 6], [26, 26], [34, 2], [40, 24], [50, 8], [56, 30]];
  g.moveTo(4, 60);
  g.quadraticCurveTo(2, 40, spikes[0][0], spikes[0][1]);
  for (let i = 1; i < spikes.length; i++) g.lineTo(spikes[i][0], spikes[i][1]);
  g.quadraticCurveTo(62, 40, 60, 60);
  g.closePath();
  g.fillStyle = '#FFFFFF';
  g.fill(); // fill only: the ink comes from a second card pushed back in depth (inkMat)
  tuftTexture = new THREE.CanvasTexture(c);
  tuftTexture.colorSpace = THREE.SRGBColorSpace;
  return tuftTexture;
}
const tuftMats = new Map();
function tuftMat(hex) {
  if (!tuftMats.has(hex)) {
    const m = new THREE.MeshBasicMaterial({ map: getTuftTexture(), color: hex, alphaTest: 0.5, side: THREE.DoubleSide });
    m.userData.noOutline = true;
    tuftMats.set(hex, m);
  }
  return tuftMats.get(hex);
}
// Ink card: the same tuft, a little larger, pushed away from the camera like the outline hulls,
// so its ink only shows past the silhouette (never as scribbles over the body).
let inkMat = null;
function getInkMat() {
  if (inkMat) return inkMat;
  inkMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: getTuftTexture() }, uInk: { value: new THREE.Color('#16122E') } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        mv.z -= 0.22;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uInk;
      varying vec2 vUv;
      void main() {
        if (texture2D(uMap, vUv).a < 0.5) discard;
        gl_FragColor = vec4(uInk, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
  });
  inkMat.userData.noOutline = true;
  return inkMat;
}
const tuftGeo = new THREE.PlaneGeometry(1, 1).translate(0, 0.35, 0); // base near the bottom edge

// One tuft on the edge of a round part seen from the side: centre (cx, cy), radius r,
// at `deg` degrees around it, spikes pointing outward. Cards sit in the part's z = 0 plane,
// so the inner half hides inside the body and the spikes break the silhouette.
function edgeTuft(parent, hex, cx, cy, r, deg, size, z = 0) {
  const a = (deg * Math.PI) / 180;
  const m = new THREE.Mesh(tuftGeo, tuftMat(hex));
  m.position.set(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, z);
  m.rotation.z = a - Math.PI / 2;
  m.scale.set(size, size, 1);
  m.userData.outline = 0;
  const ink = new THREE.Mesh(tuftGeo, getInkMat());
  ink.scale.set(1.18, 1.14, 1);
  ink.position.y = -0.03;
  ink.userData.outline = 0;
  m.add(ink);
  parent.add(m);
  return m;
}

// 20-40 tufts on the silhouette: cheek ruffs, chest bib, back and rump, ear tips, tail tip.
// Long-haired cats (fluffy > 1.05) get more and bigger tufts; the low preset gets half.
function addTufts({ spec, torso, head, tails, ears }) {
  const long = (spec.fluffy ?? 1) > 1.05;
  const keep = spec.low ? 2 : 1; // keep every n-th tuft
  const big = long ? 1.3 : 1;
  const fur = spec.fur;
  const bib = spec.belly;
  // Back and head-top tufts take the colour of a painted cap/saddle when there is one.
  const topOf = (list) => list?.find((p) => p.kind === 'half' && p.at[1] > 0)?.color;
  const backHex = topOf(spec.paint?.body) ?? fur;
  const headTopHex = topOf(spec.paint?.head) ?? fur;
  const s = 0.24 * big;
  const headR = 0.33 * (spec.fluffy ?? 1);
  const bodyW = (spec.chunky ? 1.15 : spec.slim ? 0.88 : 1) * (spec.fluffy ?? 1);
  let i = 0;
  const add = (...args) => (i++ % keep === 0 ? edgeTuft(...args) : null);
  // Cheek ruff: lower back of the head, plus the jowl under the chin.
  const cheek = long ? [195, 212, 229, 246, 263, 282] : [205, 228, 252, 276];
  for (const d of cheek) add(head, d > 240 ? bib : fur, 0, 0, headR, d, s);
  // Back of the head.
  for (const d of long ? [150, 168] : [160]) add(head, headTopHex, 0, 0, headR, d, s * 0.8);
  // Chest bib (front-bottom of the chest sphere).
  const chest = long ? [250, 268, 286, 304, 322] : [262, 290, 318];
  for (const d of chest) add(torso, bib, 0.55, -0.06, 0.22 * bodyW, d, s * 0.95);
  // Back ridge and rump (top and back of the trunk).
  const back = long ? [70, 90, 110, 130, 150, 170] : [80, 105, 135, 160];
  for (const [k, d] of back.entries()) add(torso, d < 165 ? backHex : fur, 0.18 + (k % 2) * 0.08, 0, 0.27 * bodyW + 0.02, d, s * 0.8);
  // Ear tips.
  for (const ear of ears) add(ear, headTopHex, 0, 0.06, 0.07, 90, s * 0.45);
  // Tail tip on every tail shape, pointing along the tail.
  const tipHex = spec.tail ?? fur;
  for (const g of Object.values(tails)) {
    const path = g.children[0].geometry.parameters.path;
    const end = path.getPoint(1);
    const tan = path.getTangent(1);
    const deg = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
    for (let k = 0; k < (long ? 3 : 2); k++) add(g, tipHex, end.x, end.y, 0.02, deg + (k - 0.5) * 40, s * 0.7, end.z);
  }
}

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
  // Coat markings are painted on the surface (spec.paint, plus legacy spec.patches as blobs).
  const bodyPaint = [
    ...(spec.paint?.body ?? []),
    ...(spec.patches ?? []).filter((p) => p[0] === 'body').map(([, x, y, z, r, c]) => ({ kind: 'blob', at: [0.32 + x, y * bodyW * 0.9, z * bodyW], size: r * 1.1, color: c })),
  ];
  const trunk = capsule(0.27 * bodyW, 0.42, bodyPaint.length ? M(spec.fur, bodyPaint) : fur);
  trunk.rotation.z = Math.PI / 2;
  torso.add(bindPaint(put(trunk, 0.32, 0, 0, 1, 1, bodyW > 1 ? 1.1 : 1)));
  torso.add(noLine(put(sphere(0.24 * bodyW, belly), 0.55, -0.06, 0, 0.8, 0.9, 0.95))); // chest
  if (spec.stripes) {
    for (const x of [0.12, 0.3, 0.48]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.27 * bodyW + 0.005, 0.03, 5, 16, Math.PI * 1.1), M(spec.stripes));
      band.rotation.y = Math.PI / 2;
      band.rotation.x = -Math.PI * 0.05;
      torso.add(noLine(put(band, x, 0, 0)));
    }
  }

  // Haunches: hidden inside the trunk in most poses, they round out the rump when sitting.
  for (const z of [-0.13, 0.13]) torso.add(noLine(put(sphere(0.19 * bodyW, fur, 10, 8), 0.1, -0.06, z)));

  // Legs: shoulder/hip pivots inside the torso so they follow it.
  const leg = (x, z, front, key) => {
    const g = new THREE.Group();
    g.position.set(x, -0.08, z);
    const legPaint = spec.paint?.[key];
    g.add(bindPaint(put(capsule(0.085 * bodyW, 0.2, legPaint ? M(spec.socks, legPaint) : front ? fur : fur), 0, -0.16, 0)));
    g.add(put(sphere(0.1 * bodyW, socks, 8, 6), 0.03, -0.32, 0, 1.25, 0.7, 1));
    // Toe-bean pad under the paw: shows when the paws are in the air (belly up).
    const dark = new THREE.Color(spec.socks).getHSL({}).l < 0.3;
    g.add(noLine(put(sphere(0.06 * bodyW, M(dark ? '#9C6A86' : '#F29BB0'), 8, 6), 0.03, -0.39, 0, 1.3, 0.45, 1)));
    torso.add(g);
    return g;
  };
  const legs = {
    fl: leg(0.6, 0.13, true, 'legFl'),
    fr: leg(0.6, -0.13, true, 'legFr'), // the cat's left (it faces +x)
    bl: leg(0.06, 0.14, false, 'legBl'),
    br: leg(0.06, -0.14, false, 'legBr'),
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
  const headPaint = [
    ...(spec.paint?.head ?? []),
    ...(spec.patches ?? []).filter((p) => p[0] === 'head').map(([, x, y, z, r, c]) => ({ kind: 'blob', at: [x, y * 0.9, z], size: r * 1.05, color: c })),
  ];
  head.add(bindPaint(sphere(0.33 * fluffy, headPaint.length ? M(spec.fur, headPaint) : fur, 18, 12)));
  head.add(put(sphere(0.17, belly, 12, 8), 0.2, -0.1, 0, 0.8, 0.65, 1.2)); // muzzle
  if (spec.chin) head.add(noLine(put(sphere(0.07, M(spec.chin), 8, 6), 0.27, -0.18, 0)));
  if (spec.blaze) head.add(noLine(put(sphere(0.07, belly, 8, 6), 0.27, 0.06, 0, 0.5, 1.8, 0.8))); // white stripe up the nose
  head.add(noLine(put(sphere(0.045, M(spec.nose), 8, 6), 0.33, -0.03, 0)));
  const eyes = [];
  const ears = [];
  for (const z of [-0.12, 0.12]) {
    const eye = new THREE.Group();
    eye.position.set(0.25, 0.06, z);
    // Eyes are a hand-picked feature line: a thin hull around the iris only.
    const iris = put(sphere(0.085, M(spec.eyes), 10, 8), 0, 0, 0, 0.55, 1, 1);
    iris.userData.outline = 0.5;
    eye.add(iris);
    eye.add(noLine(put(sphere(0.06, M('#16122E'), 8, 6), 0.03, 0, 0, 0.5, 1, 0.35))); // vertical slit
    eye.add(noLine(put(sphere(0.018, M('#FFFFFF'), 6, 4), 0.05, 0.035, 0)));
    head.add(eye);
    eyes.push(eye);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), z > 0 ? earMat(spec, 'L') : earMat(spec, 'R'));
    head.add(put(ear, 0.0, 0.28, z * 1.45));
    ear.rotation.x = z > 0 ? 0.3 : -0.3;
    ear.userData.baseX = ear.rotation.x;
    ears.push(ear);
  }

  addTufts({ spec, torso, head, tails, ears, fur, belly, tailMat, low: spec.low });

  // Silhouette-only ink: hulls pushed back so crossings between parts disappear.
  addOutlines(root, 1.1, { bias: 0.22 });

  const cat = { spec, root, rig, torso, legs, tails, head, eyes, ears, pose: null, anim: null, time: 0, found: false, place: null };
  setPose(cat, spec.idle);
  return cat;
}

// Ear colour: patched cats get the patch colour on the side the patch covers.
function earMat(spec, side) {
  if (spec.paint?.head?.some((p) => p.kind === 'half' && p.at[1] > 0 && p.color === '#24202E')) return M('#24202E');
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
    // On its back, seen from the side: body flat and low, light belly on top, four paws in the
    // air, head upright at the front, tail out behind. Nothing hides behind the head.
    c.torso.position.set(-0.32, 0.3, 0);
    c.torso.rotation.set(Math.PI, 0, 0);
    resetLegs(c);
    c.legs.fl.rotation.z = -0.35; // front paws curled up toward the chest
    c.legs.fr.rotation.z = -0.75;
    c.legs.fl.scale.set(1, 0.85, 1);
    c.legs.fr.scale.set(1, 0.85, 1);
    c.legs.bl.rotation.z = 0.25; // back paws up and a little behind
    c.legs.br.rotation.z = 0.55;
    c.legs.bl.scale.set(1, 1.15, 1);
    c.legs.br.scale.set(1, 1.15, 1);
    // Head stays upright (ears up, face to the camera side) resting at the front of the body:
    // tipping it back read as upside down from the fixed camera (Sebastian, 2026-11-11).
    c.head.position.set(0.52, 0.34, 0);
    c.head.rotation.set(0, 0, 0.12);
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

// --- Found reactions ---------------------------------------------------------------------------
// Each step: { duration (s), enter(c) once, run(c, u) with u in 0..1, exit(c) }. Timings follow real
// cat motion: a startle freeze is a fraction of a second, a greeting trot about a second, a zoomies
// burst one to two seconds (docs/fable/cats-and-feedback-2026-11-11.md, "Timings used").
const STEPS = {
  // "You caught me!": a short freeze, eyes wide, ears forward, head up.
  freeze: {
    duration: 0.3,
    run(c, u) {
      const k = Math.sin(Math.min(1, u * 3) * Math.PI * 0.5);
      for (const e of c.eyes) e.scale.set(1 + 0.25 * k, 1 + 0.3 * k, 1 + 0.25 * k);
      for (const ear of c.ears) ear.rotation.x = ear.userData.baseX * (1 - 0.8 * k);
      c.head.position.y = c.base.headY + 0.06 * k;
    },
  },
  // A small startle hop straight up out of the hiding pose.
  hop: {
    duration: 0.45,
    enter(c) {
      setPose(c, 'sit');
    },
    run(c, u) {
      const h = Math.sin(u * Math.PI);
      c.rig.position.y = h * 0.45;
      c.rig.scale.y = (c.spec.size ?? 1) * (u < 0.15 ? 1 - u * 1.5 : 1 + h * 0.1);
      for (const e of c.eyes) e.scale.set(1.2, 1.3, 1.2);
    },
  },
  // Happy greeting: trot in place toward the hero, tail up with a quivering tip, head tilt.
  greet: {
    duration: 1.1,
    enter(c) {
      setPose(c, 'tailUp');
    },
    run(c, u) {
      const trot = Math.sin(u * Math.PI * 8);
      c.legs.fl.rotation.z = c.legs.br.rotation.z = trot * 0.45;
      c.legs.fr.rotation.z = c.legs.bl.rotation.z = -trot * 0.45;
      c.rig.position.y = Math.abs(trot) * 0.04;
      c.tails.up.rotation.z = Math.sin(u * 60) * 0.05; // quivering tip
      c.head.rotation.z = 0.1 + Math.sin(u * Math.PI) * 0.25; // head tilt
    },
  },
  headBump: {
    duration: 0.7,
    run(c, u) {
      const s = Math.max(0, Math.sin(u * Math.PI * 2) * (1 - u));
      c.head.position.x = c.base.headX + 0.18 * s;
      c.head.rotation.z = c.base.headRz - 0.3 * s;
      closeEyes(c, 1 - 0.7 * s);
    },
  },
  slowBlink: {
    duration: 0.8,
    run(c, u) {
      const k = u < 0.5 ? 1 - u * 1.6 : 0.2 + (u - 0.5) * 1.6;
      closeEyes(c, Math.max(0.15, Math.min(1, k)));
    },
  },
  stretch: {
    duration: 0.9,
    enter(c) {
      setPose(c, 'tailUp');
    },
    run(c, u) {
      const s = Math.sin(u * Math.PI);
      c.torso.rotation.z = -0.35 * s; // front down, rear up
      c.legs.fl.rotation.z = c.legs.fr.rotation.z = -1.2 * s;
      c.head.position.y = c.base.headY - 0.25 * s;
      c.head.position.x = c.base.headX + 0.2 * s;
      closeEyes(c, 1 - 0.6 * s);
    },
  },
  // Zoomies: a full sprint around the planet and back to the spot, ears back, tail streaming.
  zoomies: {
    duration: 1.6,
    enter(c) {
      setPose(c, 'tailUp');
      showTail(c, 'back');
    },
    run(c, u) {
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      c.place?.(-360 * e);
      const gallop = Math.sin(u * Math.PI * 22);
      c.legs.fl.rotation.z = c.legs.fr.rotation.z = -0.9 * gallop;
      c.legs.bl.rotation.z = c.legs.br.rotation.z = 0.9 * gallop;
      c.torso.rotation.z = gallop * 0.12;
      for (const ear of c.ears) ear.rotation.x = ear.userData.baseX * 2.2; // ears back
      c.head.rotation.z = -0.15;
    },
    exit(c) {
      c.place?.(0);
    },
  },
  // Dazed "zooted" wobble: head circles, body sways, eyes half closed.
  zooted: {
    duration: 1.4,
    enter(c) {
      setPose(c, 'sit');
    },
    run(c, u) {
      const a = u * Math.PI * 4;
      c.head.position.x = c.base.headX + Math.cos(a) * 0.06;
      c.head.position.y = c.base.headY + Math.sin(a) * 0.04;
      c.head.rotation.z = Math.sin(a) * 0.3;
      c.rig.rotation.x = Math.sin(a * 0.5) * 0.15;
      closeEyes(c, 0.45);
    },
    exit(c) {
      c.rig.rotation.x = 0;
    },
  },
};

export function collect(cat, { reducedMotion = false } = {}) {
  if (cat.found) return;
  cat.found = true;
  // Reduced motion: a calm slow blink only, then the end pose.
  const steps = reducedMotion ? ['slowBlink'] : cat.spec.react ?? ['freeze', 'greet'];
  cat.anim = { steps, i: -1, t: 0 };
  nextStep(cat);
}

function nextStep(cat) {
  const a = cat.anim;
  STEPS[a.steps[a.i]]?.exit?.(cat);
  a.i++;
  a.t = 0;
  if (a.i >= a.steps.length) {
    cat.anim = null;
    cat.rig.position.y = 0;
    cat.rig.scale.setScalar(cat.spec.size ?? 1);
    for (const ear of cat.ears) ear.rotation.x = ear.userData.baseX;
    setPose(cat, cat.spec.found);
    return;
  }
  STEPS[a.steps[a.i]].enter?.(cat);
  cat.base = { torsoY: cat.torso.position.y, headY: cat.head.position.y, headX: cat.head.position.x, headRz: cat.head.rotation.z };
}

// Call every frame. `t` is seconds (0 under reduced motion), dt the frame time.
export function updateCat(cat, dt, t) {
  if (cat.anim) {
    const a = cat.anim;
    const step = STEPS[a.steps[a.i]];
    a.t += dt;
    const u = Math.min(1, a.t / step.duration);
    step.run(cat, u);
    if (u >= 1) nextStep(cat);
    return;
  }
  if (!t) return;
  // Idle life: breathing, a tail flick now and then, kneading paws, tail-tip quiver.
  const phase = t + cat.spec.id.length;
  cat.torso.position.y = cat.base.torsoY + Math.sin(phase * 2) * 0.012;
  if (cat.pose === 'knead') {
    cat.legs.fl.rotation.z = -0.9 + Math.max(0, Math.sin(phase * 5)) * 0.4;
    cat.legs.fr.rotation.z = -0.6 + Math.max(0, -Math.sin(phase * 5)) * 0.4;
  } else if (cat.pose === 'groom') {
    cat.head.rotation.z = -0.35 + Math.sin(phase * 6) * 0.08;
  } else if (cat.pose === 'tailUp') {
    cat.tails.up.rotation.z = Math.sin(phase * 20) * 0.03 + Math.sin(phase * 2) * 0.08;
  } else {
    const flick = Math.max(0, Math.sin(phase * 1.3) - 0.9) * 4; // short flick every few seconds
    for (const g of Object.values(cat.tails)) g.rotation.z = flick * 0.2;
  }
}
