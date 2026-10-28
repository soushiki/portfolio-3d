import * as THREE from 'three';

// Themed low-poly buildings that stand behind a project's sign. Each builder returns
// { group, w, d, h, update? }: footprint w × d centred on the origin, front facing +z.

const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (rt, rb, h, m, seg = 18) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
const at = (mesh, x, y, z) => {
  mesh.position.set(x, y, z);
  return mesh;
};

function hospital(M) {
  const g = new THREE.Group();
  const white = M('#F4F1EA');
  const red = M('#D64545');
  const glass = M('#7FB3D5');
  g.add(at(box(8, 7, 6, white), 0, 3.5, 0));
  g.add(at(box(8.3, 0.35, 6.3, M('#D9D4CC')), 0, 7.15, 0));
  for (const y of [2.2, 4.4]) {
    for (const x of [-2.8, -1.4, 1.4, 2.8]) g.add(at(box(1.0, 0.9, 0.1, glass), x, y, 3.03));
  }
  g.add(at(box(1.6, 2.1, 0.1, M('#5C6B7A')), 0, 1.05, 3.04));
  g.add(at(box(3.2, 0.2, 1.6, white), 0, 2.35, 3.8));
  for (const x of [-1.4, 1.4]) g.add(at(box(0.15, 2.3, 0.15, M('#9A8C98')), x, 1.15, 4.5));
  // Red cross on the facade and on the roof
  g.add(at(box(1.9, 0.55, 0.15, red), 0, 5.6, 3.06), at(box(0.55, 1.9, 0.15, red), 0, 5.6, 3.06));
  g.add(at(box(2.4, 0.12, 0.7, red), 0, 7.4, 0), at(box(0.7, 0.12, 2.4, red), 0, 7.4, 0));
  return { group: g, w: 8.3, d: 6.3, h: 7.5 };
}

function observatory(M) {
  const g = new THREE.Group();
  g.add(at(cyl(3.2, 3.4, 4, M('#E8E2D6'), 24), 0, 2, 0));
  g.add(at(box(1.4, 2, 0.3, M('#5C6B7A')), 0, 1, 3.25));
  const turret = new THREE.Group();
  turret.position.y = 4;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.3, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#C9CED6'));
  turret.add(dome);
  turret.add(at(box(0.9, 0.12, 3.4, M('#2F3542')), 0, 3.25, 0.4)); // the slit
  const scope = cyl(0.42, 0.6, 4.6, M('#2F3542'), 12);
  scope.rotation.x = -0.75;
  scope.position.set(0, 2.9, 1.4);
  turret.add(scope);
  g.add(turret);
  // A small dish on the ground beside it
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), M('#F4F1EA', { side: THREE.DoubleSide }));
  dish.rotation.x = Math.PI * 0.8;
  dish.position.set(3.9, 1.5, 1.6);
  g.add(dish, at(cyl(0.12, 0.12, 1.4, M('#9A8C98'), 6), 3.9, 0.7, 1.6));
  return {
    group: g, w: 9, d: 7, h: 8,
    update: (t) => {
      turret.rotation.y = Math.sin(t * 0.25) * 0.9;
    },
  };
}

function gym(M) {
  const g = new THREE.Group();
  g.add(at(box(8, 4.5, 6, M('#4A4E69')), 0, 2.25, 0));
  g.add(at(box(6, 2.6, 0.12, M('#9FC3D9')), 0, 1.6, 3.04));
  g.add(at(box(8.3, 0.3, 6.3, M('#22223B')), 0, 4.65, 0));
  for (const x of [-1.2, 1.2]) g.add(at(box(0.3, 1.2, 0.3, M('#22223B')), x, 5.4, 0));
  const bell = new THREE.Group();
  bell.position.y = 6.2;
  const bar = cyl(0.18, 0.18, 6.4, M('#9AA3AF'), 10);
  bar.rotation.z = Math.PI / 2;
  bell.add(bar);
  for (const s of [-1, 1]) {
    const outer = cyl(1.15, 1.15, 0.55, M('#22223B'), 20);
    outer.rotation.z = Math.PI / 2;
    outer.position.x = s * 2.6;
    const inner = cyl(0.9, 0.9, 0.45, M('#E8743B'), 20);
    inner.rotation.z = Math.PI / 2;
    inner.position.x = s * 2.05;
    bell.add(outer, inner);
  }
  g.add(bell);
  return {
    group: g, w: 8.3, d: 6.3, h: 7.5,
    update: (t) => {
      bell.position.y = 6.2 + Math.max(0, Math.sin(t * 1.6)) * 0.5;
    },
  };
}

function restaurant(M) {
  const g = new THREE.Group();
  g.add(at(box(8, 4.5, 6, M('#B5653A')), 0, 2.25, 0));
  g.add(at(box(8.3, 0.3, 6.3, M('#4A2F2A')), 0, 4.65, 0));
  for (const x of [-2.4, 2.4]) g.add(at(box(1.8, 1.4, 0.1, M('#F2D07A')), x, 2.2, 3.03));
  g.add(at(box(1.4, 2.2, 0.1, M('#4A2F2A')), 0, 1.1, 3.03));
  // Striped awning
  const awning = new THREE.Group();
  const stripes = 8;
  for (let i = 0; i < stripes; i++) {
    awning.add(at(box(7.6 / stripes, 0.12, 1.8, M(i % 2 ? '#F4F1EA' : '#D64545')), -3.8 + (i + 0.5) * (7.6 / stripes), 0, 0));
  }
  awning.rotation.x = 0.4;
  awning.position.set(0, 3.5, 3.75);
  g.add(awning);
  g.add(at(box(0.9, 2.2, 0.9, M('#6B4A3A')), 2.8, 5.8, -1.6));
  // Burger on the roof
  const burger = new THREE.Group();
  burger.position.set(-0.5, 4.8, 0);
  const bun = M('#D9A05B');
  burger.add(at(cyl(1.3, 1.2, 0.45, bun), 0, 0.25, 0));
  burger.add(at(cyl(1.4, 1.4, 0.38, M('#5A3A2A')), 0, 0.65, 0));
  const cheese = box(2.3, 0.1, 2.3, M('#F2C14E'));
  cheese.rotation.y = Math.PI / 4;
  burger.add(at(cheese, 0, 0.88, 0));
  burger.add(at(cyl(1.45, 1.45, 0.14, M('#6A9A45')), 0, 0.98, 0));
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), bun);
  burger.add(at(top, 0, 1.05, 0));
  g.add(burger);
  return {
    group: g, w: 8.3, d: 7.5, h: 7.2,
    update: (t) => {
      burger.rotation.y = t * 0.6;
    },
  };
}

function bank(M) {
  const g = new THREE.Group();
  const stone = M('#F4F1EA');
  g.add(at(box(8.4, 0.6, 6.8, M('#D9D4CC')), 0, 0.3, 0));
  g.add(at(box(7, 4, 5, stone), 0, 2.6, -0.4));
  for (const x of [-2.6, -0.9, 0.9, 2.6]) g.add(at(cyl(0.35, 0.4, 3.8, stone, 10), x, 2.5, 2.7));
  g.add(at(box(7.8, 0.5, 6.4, M('#D9D4CC')), 0, 4.85, 0));
  const shape = new THREE.Shape();
  shape.moveTo(-3.9, 0);
  shape.lineTo(3.9, 0);
  shape.lineTo(0, 1.6);
  shape.closePath();
  const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 6.4, bevelEnabled: false }), stone);
  pediment.position.set(0, 5.1, -3.2);
  g.add(pediment);
  g.add(at(box(1.4, 2.4, 0.1, M('#5C6B7A')), 0, 1.8, 2.12));
  // A stack of gold coins beside the steps
  const gold = M('#E0B54A', { emissive: new THREE.Color('#E0B54A'), emissiveIntensity: 0.15 });
  for (let i = 0; i < 6; i++) g.add(at(cyl(0.8, 0.8, 0.22, gold, 16), 5 + (i % 2) * 0.08, 0.11 + i * 0.24, 2.2));
  return { group: g, w: 10.5, d: 6.8, h: 6.7 };
}

function vault(M) {
  const g = new THREE.Group();
  g.add(at(box(7, 5, 6, M('#3B3F55')), 0, 2.5, 0));
  g.add(at(box(7.3, 0.35, 6.3, M('#22223B')), 0, 5.15, 0));
  const door = cyl(2.1, 2.1, 0.45, M('#9AA3AF'), 28);
  door.rotation.x = Math.PI / 2;
  g.add(at(door, 0, 2.5, 3.2));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.18, 6, 28), M('#6B7280'));
  g.add(at(rim, 0, 2.5, 3.43));
  const wheel = new THREE.Group();
  wheel.position.set(0, 2.5, 3.6);
  for (let i = 0; i < 3; i++) {
    const spoke = box(0.2, 2.6, 0.2, M('#C9CED6'));
    spoke.rotation.z = (i * Math.PI) / 3;
    wheel.add(spoke);
  }
  const hub = cyl(0.35, 0.35, 0.3, M('#C9CED6'), 12);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  g.add(wheel);
  return {
    group: g, w: 7.3, d: 6.6, h: 5.4,
    update: (t) => {
      wheel.rotation.z = t * 0.5;
    },
  };
}

function bookStack(M) {
  const g = new THREE.Group();
  const pages = M('#F4EEDC');
  const book = (w, h, d, color, y, yaw) => {
    const b = new THREE.Group();
    const cover = M(color);
    b.add(at(box(w, 0.2, d, cover), 0, -h / 2 + 0.1, 0), at(box(w, 0.2, d, cover), 0, h / 2 - 0.1, 0));
    b.add(at(box(0.25, h, d, cover), -w / 2 + 0.125, 0, 0));
    b.add(at(box(w - 0.35, h - 0.4, d - 0.25, pages), 0.05, 0, 0));
    b.position.y = y;
    b.rotation.y = yaw;
    g.add(b);
  };
  book(7, 1.6, 5.2, '#8A5A51', 0.8, 0);
  book(6.4, 1.5, 4.8, '#3E6A8A', 2.35, 0.14);
  book(6.8, 1.4, 5, '#2F6F5E', 3.8, -0.08);
  const quill = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.4, 6), M('#F4F1EA'));
  quill.rotation.z = -0.45;
  quill.position.set(1.4, 6.0, 0.4);
  g.add(quill, at(cyl(0.06, 0.06, 1.2, M('#22223B'), 6), 0.65, 4.6, 0.4));
  return { group: g, w: 7.2, d: 5.6, h: 7.6 };
}

function clipboard(M) {
  const g = new THREE.Group();
  g.add(at(box(7, 0.5, 3.2, M('#9A8C98')), 0, 0.25, 0));
  g.add(at(box(6, 8, 0.6, M('#B5865A')), 0, 4.5, 0));
  const strut = box(0.5, 7, 0.4, M('#8A6A4A'));
  strut.rotation.x = 0.35;
  g.add(at(strut, 0, 3.8, -1.2));
  g.add(at(box(5, 6.6, 0.1, M('#FBF7F5')), 0, 4.2, 0.35));
  g.add(at(box(2.2, 0.9, 0.5, M('#9AA3AF')), 0, 8.3, 0.3));
  const green = M('#4E9A5B');
  const line = M('#C9C3BD');
  for (let i = 0; i < 4; i++) {
    const y = 6.4 - i * 1.45;
    const shortArm = box(0.18, 0.55, 0.12, green);
    shortArm.rotation.z = 0.7;
    const longArm = box(0.18, 1.0, 0.12, green);
    longArm.rotation.z = -0.6;
    g.add(at(shortArm, -1.95, y - 0.05, 0.42), at(longArm, -1.55, y + 0.12, 0.42));
    g.add(at(box(2.6, 0.18, 0.08, line), 0.5, y, 0.42));
  }
  return { group: g, w: 7, d: 3.6, h: 8.8 };
}

function gachaMachine(M) {
  const g = new THREE.Group();
  const red = M('#E05A6B');
  g.add(at(box(4.2, 3.6, 4.2, red), 0, 1.8, 0));
  g.add(at(box(1.4, 1.2, 0.2, M('#22223B')), 0, 1.0, 2.1));
  g.add(at(cyl(0.45, 0.45, 0.3, M('#F2C14E'), 14).rotateX(Math.PI / 2), 1.2, 2.6, 2.15));
  g.add(at(cyl(2.4, 2.1, 0.5, red), 0, 3.85, 0));
  const glass = M('#DDEFFF', { transparent: true, opacity: 0.32, depthWrite: false });
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(2.6, 22, 14), glass), 0, 6.3, 0));
  const capsules = new THREE.Group();
  capsules.position.y = 6.0;
  const colors = ['#FF6FA3', '#8A4FD8', '#F2C14E', '#4FB3D8', '#6A9A45', '#E8743B'];
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = 0.6 + (i % 4) * 0.42;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), M(colors[i % colors.length]));
    capsules.add(at(ball, Math.cos(a) * r, -1.3 + (i % 5) * 0.55, Math.sin(a) * r));
  }
  g.add(capsules);
  g.add(at(cyl(1.0, 1.25, 0.5, red), 0, 8.95, 0));
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 4), red);
    ear.position.set(s * 0.6, 9.65, 0);
    g.add(ear);
  }
  return {
    group: g, w: 5.4, d: 5.4, h: 10.2,
    update: (t) => {
      capsules.rotation.y = t * 0.4;
    },
  };
}

function forumHall(M) {
  const g = new THREE.Group();
  g.add(at(cyl(3.5, 3.6, 4.5, M('#F2E9E4'), 22), 0, 2.25, 0));
  g.add(at(new THREE.Mesh(new THREE.ConeGeometry(3.95, 2.2, 22), M('#E8743B')), 0, 5.6, 0));
  g.add(at(box(1.4, 2.2, 0.3, M('#5C6B7A')), 0, 1.1, 3.45));
  const bubble = new THREE.Group();
  bubble.position.set(0, 8.4, 0);
  bubble.add(box(3.8, 2.2, 0.6, M('#FBF7F5')));
  const tail = box(0.8, 0.8, 0.6, M('#FBF7F5'));
  tail.rotation.z = Math.PI / 4;
  bubble.add(at(tail, -0.8, -1.1, 0));
  for (const x of [-0.9, 0, 0.9]) bubble.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), M('#E8743B')), x, 0, 0.32));
  g.add(bubble);
  return {
    group: g, w: 7.2, d: 7.2, h: 9.6,
    update: (t) => {
      bubble.position.y = 8.4 + Math.sin(t * 1.4) * 0.25;
    },
  };
}

function speakers(M) {
  const g = new THREE.Group();
  const cab = M('#22223B');
  const coneMat = M('#4A4E69');
  const addSpeaker = (w, h, d, x, cones) => {
    g.add(at(box(w, h, d, cab), x, h / 2, 0));
    const pulsing = [];
    for (const [y, r] of cones) {
      const ring = cyl(r, r, 0.2, M('#9AA3AF'), 22);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y, d / 2 + 0.05);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 0.85, r * 0.5, 22), coneMat);
      cone.rotation.x = -Math.PI / 2;
      cone.position.set(x, y, d / 2 + 0.2);
      g.add(ring, cone);
      pulsing.push(cone);
    }
    return pulsing;
  };
  const cones = [
    ...addSpeaker(5, 6, 4, -1.2, [[2.0, 1.6], [4.6, 0.8]]),
    ...addSpeaker(2.6, 3.6, 2.8, 2.9, [[1.8, 0.9]]),
  ];
  const note = new THREE.Group();
  note.position.set(-1.2, 8.2, 0);
  const green = M('#6A9A45');
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), green);
  head.scale.set(1.2, 0.85, 0.85);
  note.add(head, at(box(0.16, 2.3, 0.16, green), 0.6, 1.1, 0), at(box(0.9, 0.3, 0.16, green), 1.0, 2.1, 0));
  g.add(note);
  return {
    group: g, w: 8, d: 4.4, h: 10,
    update: (t) => {
      const s = 1 + Math.max(0, Math.sin(t * 6)) * 0.25;
      for (const c of cones) c.scale.set(1, s, 1);
      note.position.y = 8.2 + Math.sin(t * 1.3) * 0.3;
      note.rotation.y = Math.sin(t * 0.7) * 0.6;
    },
  };
}

const BUILDERS = {
  hospital, observatory, gym, restaurant, bank, vault, bookStack, clipboard, gachaMachine, forumHall, speakers,
};

// `material(color, extra)` comes from the world so landmarks share its shading and quality settings.
export function makeLandmark(kind, material) {
  const build = BUILDERS[kind];
  if (!build) return null;
  const cache = new Map();
  const M = (color, extra) => {
    const key = extra ? null : color;
    if (key && cache.has(key)) return cache.get(key);
    const m = material(color, extra);
    if (key) cache.set(key, m);
    return m;
  };
  return build(M);
}
