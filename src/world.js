import * as THREE from 'three';
import { makeSignTexture } from './signs.js';
import { grassTexture, asphaltTexture, pavingTexture } from './textures.js';

export const RING_RADIUS = 34;
const WORLD_RADIUS = 88;
const PAD_RADIUS = 3.2;
const PLAZA_RADIUS = 11;

const HOUSE_SCALE = 7; // Kenney suburban houses are ~1.3 units wide

// Data science island, east of the main island and joined to it by a bridge along z = 0.
const ISLET = { x: 136, z: 0, radius: 30, ring: 16, plaza: 7 };
const BRIDGE = { from: 86, to: ISLET.x - ISLET.radius + 2, halfWidth: 3.4 };
// "← Data Science" sign beside the causeway, just past the ring road. Houses keep clear of it.
const CAUSEWAY_SIGN = { x: RING_RADIUS + 7, z: 6, clearance: 9 };

const COLORS = {
  dash: '#F4F1EA',
  curb: '#D9D4CC',
  trunk: '#5A4636',
  leaves: ['#4E7D3A', '#6A9A45', '#3F6B35'],
  rock: '#9A8C98',
  crate: '#C9ADA7',
  crateAlt: '#9A8C98',
  cone: '#E8743B',
  post: '#22223B',
  pad: '#F2E9E4',
  accents: ['#22223B', '#4A4E69', '#9A8C98', '#C9ADA7'],
  isletGrass: '#B9D3E6',
  isletLeaves: ['#3E6A8A', '#4F8A7A', '#2F5C73'],
  dsAccents: ['#3E6A8A', '#2F6F5E', '#5B6FA8'],
  bridge: '#8B6B4A',
};

// Small seeded RNG so the world layout is the same on every visit.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function yawQuat(yaw) {
  return { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) };
}

export function buildWorld({ scene, physics, RAPIER, renderer, quality, projects, contact, dataScience = null, houses = [] }) {
  const rand = mulberry32(7);
  const dynamics = [];
  const zones = [];
  const blockers = []; // {x, z, r}: keep trees away from these spots

  const material = (color, extra = {}) =>
    quality.low
      ? new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra })
      : new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...extra });

  const shadow = (mesh, cast = true, receive = true) => {
    mesh.castShadow = cast && quality.shadows;
    mesh.receiveShadow = receive && quality.shadows;
    return mesh;
  };

  const addFixed = (colliderDesc, x, y, z, yaw = 0) => {
    const body = physics.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z).setRotation(yawQuat(yaw)),
    );
    physics.createCollider(colliderDesc, body);
    return body;
  };

  // Ground + invisible boundary wall
  const ground = shadow(
    new THREE.Mesh(
      new THREE.CylinderGeometry(WORLD_RADIUS, WORLD_RADIUS - 2, 4, 72),
      material('#ffffff', { map: grassTexture(renderer) }),
    ),
    false,
  );
  ground.position.y = -2;
  scene.add(ground);
  // One floor collider under everything: seams between touching colliders snag the car.
  // With the island it stretches east under the bridge; walls and rails keep the car off the gap.
  const floorMinX = -(WORLD_RADIUS + 10);
  const floorMaxX = dataScience ? ISLET.x + ISLET.radius + 2 : WORLD_RADIUS + 10;
  addFixed(
    RAPIER.ColliderDesc.cuboid((floorMaxX - floorMinX) / 2, 2, WORLD_RADIUS + 10).setFriction(0.6),
    (floorMinX + floorMaxX) / 2, -2, 0,
  );

  // Ring of wall segments around (cx, cz); `gapAt` leaves one segment open for the bridge
  // and plugs what the bridge rails don't cover.
  const addRimWall = (cx, cz, radius, segments, gapAt = null) => {
    const r = radius - 1;
    const half = (Math.PI * r) / segments + 0.5;
    for (let i = 0; i < segments; i++) {
      if (i === gapAt) {
        const a = (i / segments) * Math.PI * 2;
        const plugHalf = (half - BRIDGE.halfWidth) / 2 + 0.3;
        const along = BRIDGE.halfWidth + plugHalf - 0.3;
        for (const side of [-1, 1]) {
          addFixed(RAPIER.ColliderDesc.cuboid(plugHalf, 4, 0.5),
            cx + Math.sin(a) * r + Math.cos(a) * along * side, 3, cz + Math.cos(a) * r - Math.sin(a) * along * side, a);
        }
        continue;
      }
      const a = (i / segments) * Math.PI * 2;
      addFixed(RAPIER.ColliderDesc.cuboid(half, 4, 0.5), cx + Math.sin(a) * r, 3, cz + Math.cos(a) * r, a);
    }
  };
  // Segment 9 of 36 faces +x, where the bridge leaves.
  addRimWall(0, 0, WORLD_RADIUS, 36, dataScience ? 9 : null);

  // Strip of road from the ring road to the bridge, kept clear of houses, trees and rocks.
  const inCauseway = (x, z, margin) => x > RING_RADIUS + 3 && x < WORLD_RADIUS + 2 && Math.abs(z) < margin;

  // Roads: plaza, ring road with sidewalks, spokes and dashed centre line
  const offset = (n) => ({ polygonOffset: true, polygonOffsetFactor: n, polygonOffsetUnits: n });
  const roadMat = material('#ffffff', { map: asphaltTexture(renderer, [18, 18]), ...offset(-1) });
  const ring = shadow(new THREE.Mesh(new THREE.RingGeometry(RING_RADIUS - 3, RING_RADIUS + 3, 128), roadMat), false);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  scene.add(ring);

  const walkMat = material('#ffffff', { map: pavingTexture(renderer, [26, 26]), ...offset(-1) });
  for (const [inner, outer] of [[RING_RADIUS - 4.4, RING_RADIUS - 3], [RING_RADIUS + 3, RING_RADIUS + 4.4]]) {
    const walk = shadow(new THREE.Mesh(new THREE.RingGeometry(inner, outer, 128), walkMat), false);
    walk.rotation.x = -Math.PI / 2;
    walk.position.y = 0.05;
    scene.add(walk);
  }

  const spokeAngles = [];
  for (let i = 0; i < projects.length; i += 2) spokeAngles.push((i / projects.length) * Math.PI * 2);
  for (const a of spokeAngles) {
    const len = RING_RADIUS - PLAZA_RADIUS;
    const spokeMat = material('#ffffff', { map: asphaltTexture(renderer, [1.2, 5.5]), ...offset(-1) });
    const spoke = shadow(new THREE.Mesh(new THREE.PlaneGeometry(5, len), spokeMat), false);
    spoke.rotation.set(-Math.PI / 2, 0, a);
    const mid = PLAZA_RADIUS + len / 2;
    spoke.position.set(Math.sin(a) * mid, 0.02, Math.cos(a) * mid);
    scene.add(spoke);
  }

  const plaza = shadow(
    new THREE.Mesh(
      new THREE.CircleGeometry(PLAZA_RADIUS, 64),
      material('#ffffff', { map: pavingTexture(renderer, [5.5, 5.5]), ...offset(-2) }),
    ),
    false,
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.03;
  scene.add(plaza);

  const dashCount = 72;
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.02, 1.4), material(COLORS.dash), dashCount);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < dashCount; i++) {
    const a = (i / dashCount) * Math.PI * 2;
    q.setFromAxisAngle(up, a + Math.PI / 2);
    m4.compose(new THREE.Vector3(Math.sin(a) * RING_RADIUS, 0.04, Math.cos(a) * RING_RADIUS), q, new THREE.Vector3(1, 1, 1));
    dashes.setMatrixAt(i, m4);
  }
  scene.add(dashes);

  // Signs
  const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 6);
  const postMat = material(COLORS.post);
  const boardSideMat = material(COLORS.post);
  const addSign = ({ x, z, yaw, width = 5, height = 2.5, texture }) => {
    const group = new THREE.Group();
    const faceMat = new THREE.MeshBasicMaterial({ map: texture });
    // Box face order: +x, -x, +y, -y, +z, -z. +z is the readable side.
    const board = shadow(
      new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.2), [
        boardSideMat, boardSideMat, boardSideMat, boardSideMat, faceMat, boardSideMat,
      ]),
    );
    board.position.y = 1.4 + height / 2;
    group.add(board);
    for (const side of [-1, 1]) {
      const post = shadow(new THREE.Mesh(postGeo, postMat));
      post.position.set(side * (width / 2 - 0.3), 1.9, -0.15);
      group.add(post);
    }
    group.position.set(x, 0, z);
    group.rotation.y = yaw;
    scene.add(group);
    addFixed(RAPIER.ColliderDesc.cuboid(width / 2, 1.9, 0.25), x, 1.9, z, yaw);
    blockers.push({ x, z, r: width / 2 + 3 });
  };

  // Pads (the trigger zones)
  const padGeo = new THREE.CylinderGeometry(PAD_RADIUS, PAD_RADIUS, 0.1, 40);
  const rimGeo = new THREE.TorusGeometry(PAD_RADIUS, 0.14, 6, 48);
  const gemGeo = new THREE.OctahedronGeometry(0.7, 0);
  const addZone = (data, x, z, accent, cx = 0, cz = 0) => {
    const padMat = material(COLORS.pad, { emissive: new THREE.Color(COLORS.pad), emissiveIntensity: 0.15 });
    const pad = shadow(new THREE.Mesh(padGeo, padMat), false);
    pad.position.set(x, 0.08, z);
    const rim = new THREE.Mesh(rimGeo, material(accent));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 0.14, z);
    const gem = shadow(new THREE.Mesh(gemGeo, material(accent, { emissive: new THREE.Color(accent), emissiveIntensity: 0.2 })), true, false);
    gem.position.set(x, 2.2, z);
    scene.add(pad, rim, gem);
    const phase = rand() * Math.PI * 2;
    zones.push({
      data,
      x,
      z,
      cx,
      cz,
      radius: PAD_RADIUS,
      update(t, active) {
        gem.rotation.y = t * 1.2 + phase;
        gem.position.y = 2.2 + Math.sin(t * 2 + phase) * 0.25 + (active ? 0.6 : 0);
        const s = active ? 1.35 : 1;
        gem.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
        padMat.emissiveIntensity = active ? 0.6 : 0.15 + (Math.sin(t * 2.5 + phase) + 1) * 0.1;
      },
    });
    blockers.push({ x, z, r: PAD_RADIUS + 3 });
  };

  // Knockable props
  const crateGeo = new THREE.BoxGeometry(1, 1, 1);
  const crateMats = [material(COLORS.crate), material(COLORS.crateAlt)];
  const addCrate = (x, y, z, yaw = 0) => {
    const mesh = shadow(new THREE.Mesh(crateGeo, crateMats[dynamics.length % 2]));
    const body = physics.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setRotation(yawQuat(yaw)).setLinearDamping(0.2).setAngularDamping(0.3),
    );
    physics.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setDensity(0.6).setFriction(0.7).setRestitution(0.15), body);
    scene.add(mesh);
    dynamics.push({ mesh, body });
  };

  const coneGeo = new THREE.ConeGeometry(0.35, 0.9, 10);
  const coneMat = material(COLORS.cone);
  const addCone = (x, z) => {
    const mesh = shadow(new THREE.Mesh(coneGeo, coneMat));
    const body = physics.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, 0.46, z).setAngularDamping(0.4));
    physics.createCollider(RAPIER.ColliderDesc.cone(0.45, 0.35).setDensity(0.4).setFriction(0.8).setRestitution(0.2), body);
    scene.add(mesh);
    dynamics.push({ mesh, body });
  };

  // Pyramid of crates centred at (x, z), facing yaw.
  const addPyramid = (x, z, yaw, base) => {
    const dir = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    for (let row = 0; row < base; row++) {
      const count = base - row;
      for (let i = 0; i < count; i++) {
        const off = (i - (count - 1) / 2) * 1.05;
        addCrate(x + dir.x * off, 0.5 + row * 1.0, z + dir.z * off, yaw);
      }
    }
    blockers.push({ x, z, r: base + 1.5 });
  };

  // Projects around the ring road
  projects.forEach((project, i) => {
    const a = (i / projects.length) * Math.PI * 2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const accent = COLORS.accents[i % COLORS.accents.length];
    addZone(project, dx * RING_RADIUS, dz * RING_RADIUS, accent);

    const signR = RING_RADIUS + 6.5;
    addSign({
      x: dx * signR,
      z: dz * signR,
      yaw: Math.atan2(-dx, -dz),
      texture: makeSignTexture({ title: project.title, tags: project.tags, accent }, renderer),
    });

    // Tangent direction, so the pyramid sits beside the sign
    const tx = Math.cos(a);
    const tz = -Math.sin(a);
    const pr = RING_RADIUS + 5;
    addPyramid(dx * pr + tx * 6, dz * pr + tz * 6, a, quality.low ? 2 : 3);
  });

  // Contact zone on the plaza, left of the spawn point (out of the camera's way)
  addZone(contact, -7, -3, COLORS.accents[0]);
  addSign({
    x: -12.5,
    z: -3,
    yaw: Math.PI / 2,
    texture: makeSignTexture({ title: 'Say hi', subtitle: 'LinkedIn · GitHub', tags: ['Open to work'] }, renderer),
  });

  // Welcome board
  addSign({
    x: -6.5,
    z: 6,
    yaw: Math.PI * 0.8,
    width: 6,
    height: 3,
    texture: makeSignTexture(
      { title: "Hi, I'm Sebastian Herrera", subtitle: 'Drive onto the glowing pads to see my projects.' },
      renderer,
    ),
  });

  // A crate wall across the first spoke and a cone slalom in the plaza
  const wallRows = quality.low ? 2 : 3;
  for (let row = 0; row < wallRows; row++) {
    for (let i = 0; i < 5; i++) addCrate(-2.1 + i * 1.05 + (row % 2) * 0.5, 0.5 + row, 20);
  }
  blockers.push({ x: 0, z: 20, r: 4 });
  for (let i = 0; i < (quality.low ? 4 : 6); i++) addCone(5 + (i % 2) * 1.2, -4 + i * 2.2);

  // Suburban houses in two rows around the ring road, fronts facing the centre
  const houseSize = new Map();
  const sizeOf = (proto) => {
    if (!houseSize.has(proto)) houseSize.set(proto, new THREE.Box3().setFromObject(proto).getSize(new THREE.Vector3()));
    return houseSize.get(proto);
  };
  const addHouse = (proto, x, z, yaw) => {
    const size = sizeOf(proto).clone().multiplyScalar(HOUSE_SCALE);
    const house = proto.clone();
    house.scale.setScalar(HOUSE_SCALE);
    house.position.set(x, 0, z);
    house.rotation.y = yaw;
    house.traverse((o) => {
      if (o.isMesh) shadow(o);
    });
    scene.add(house);
    addFixed(RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2), x, size.y / 2, z, yaw);
    blockers.push({ x, z, r: Math.hypot(size.x, size.z) / 2 + 1 });
  };
  if (houses.length) {
    const rows = quality.low ? [{ r: 54, n: 14 }] : [{ r: 54, n: 16 }, { r: 72, n: 20 }];
    rows.forEach(({ r, n }, row) => {
      for (let i = 0; i < n; i++) {
        const a = ((i + 0.5 + row * 0.5) / n) * Math.PI * 2;
        const rr = r + (rand() - 0.5) * 3;
        const x = Math.sin(a) * rr;
        const z = Math.cos(a) * rr;
        if (dataScience && inCauseway(x, z, 9)) continue;
        if (dataScience && Math.hypot(x - CAUSEWAY_SIGN.x, z - CAUSEWAY_SIGN.z) < CAUSEWAY_SIGN.clearance) continue;
        addHouse(houses[(i * 7 + row * 3) % houses.length], x, z, Math.atan2(-x, -z));
      }
    });
  }

  // Data science island: causeway, bridge, island ground and wall, ring road, pads and signs.
  if (dataScience) {
    const flat = (geometry, mat, x, y, z, rotZ = 0) => {
      const mesh = shadow(new THREE.Mesh(geometry, mat), false);
      mesh.rotation.set(-Math.PI / 2, 0, rotZ);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    // Causeway from the ring road to the bridge, and a sign where it starts
    const causeLen = WORLD_RADIUS - (RING_RADIUS + 3);
    flat(
      new THREE.PlaneGeometry(causeLen, 6),
      material('#ffffff', { map: asphaltTexture(renderer, [causeLen / 5, 1.2]), ...offset(-1) }),
      RING_RADIUS + 3 + causeLen / 2, 0.02, 0,
    );
    // Parallel to the causeway on the driver's right, facing the road: its left points to the bridge
    addSign({
      x: CAUSEWAY_SIGN.x,
      z: CAUSEWAY_SIGN.z,
      yaw: Math.PI,
      texture: makeSignTexture({ title: '← Data Science', subtitle: 'Cross the bridge', accent: COLORS.dsAccents[0] }, renderer),
    });

    // Bridge: wooden deck, asphalt top, rails with posts
    const bridgeLen = BRIDGE.to - BRIDGE.from;
    const bridgeMid = (BRIDGE.from + BRIDGE.to) / 2;
    const deck = shadow(new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, 0.8, BRIDGE.halfWidth * 2 + 0.6), material(COLORS.bridge)));
    deck.position.set(bridgeMid, -0.42, 0);
    scene.add(deck);
    flat(
      new THREE.PlaneGeometry(bridgeLen, BRIDGE.halfWidth * 2),
      material('#ffffff', { map: asphaltTexture(renderer, [bridgeLen / 5, 1.2]), ...offset(-1) }),
      bridgeMid, 0.0, 0,
    );
    const railMat = material(COLORS.post);
    const railStart = RING_RADIUS + 46; // rails begin on the main island to funnel the car in
    const railEnd = ISLET.x - ISLET.radius + 7;
    for (const side of [-1, 1]) {
      const z = side * BRIDGE.halfWidth;
      const rail = shadow(new THREE.Mesh(new THREE.BoxGeometry(bridgeLen + 2, 0.18, 0.18), railMat));
      rail.position.set(bridgeMid, 0.95, z);
      scene.add(rail);
      for (let x = BRIDGE.from; x <= BRIDGE.to + 0.01; x += bridgeLen / 6) {
        const post = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.0, 0.22), railMat));
        post.position.set(x, 0.5, z);
        scene.add(post);
      }
      addFixed(RAPIER.ColliderDesc.cuboid((railEnd - railStart) / 2, 1.5, 0.25), (railStart + railEnd) / 2, 1.5, z);
    }

    // Island ground and wall (segment 18 of 24 faces -x, toward the bridge); the shared floor collider covers it
    const isletGround = shadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(ISLET.radius, ISLET.radius - 2, 4, 56),
        material(COLORS.isletGrass, { map: grassTexture(renderer) }),
      ),
      false,
    );
    isletGround.position.set(ISLET.x, -2, ISLET.z);
    scene.add(isletGround);
    addRimWall(ISLET.x, ISLET.z, ISLET.radius, 24, 18);

    // Ring road, entrance road from the bridge to the plaza, and the plaza
    flat(new THREE.RingGeometry(ISLET.ring - 3, ISLET.ring + 3, 96), roadMat, ISLET.x, 0.02, ISLET.z);
    const entranceFrom = ISLET.x - ISLET.radius;
    const entranceTo = ISLET.x - ISLET.plaza;
    flat(
      new THREE.PlaneGeometry(entranceTo - entranceFrom, 6),
      material('#ffffff', { map: asphaltTexture(renderer, [(entranceTo - entranceFrom) / 5, 1.2]), ...offset(-1) }),
      (entranceFrom + entranceTo) / 2, 0.02, ISLET.z,
    );
    flat(
      new THREE.CircleGeometry(ISLET.plaza, 48),
      material('#ffffff', { map: pavingTexture(renderer, [3.5, 3.5]), ...offset(-2) }),
      ISLET.x, 0.03, ISLET.z,
    );

    // Hub pad on the plaza, project pads around the ring, signs facing the centre
    addZone(dataScience.hub, ISLET.x, ISLET.z, COLORS.dsAccents[0], ISLET.x, ISLET.z);
    // Welcome board beside the entrance road, facing drivers coming off the bridge
    addSign({
      x: ISLET.x - ISLET.radius + 5.5,
      z: ISLET.z + 8,
      yaw: -Math.PI / 2,
      width: 6,
      height: 3,
      texture: makeSignTexture(
        { title: 'Data Science', subtitle: 'Forecasting · A/B testing · ML', accent: COLORS.dsAccents[0] },
        renderer,
      ),
    });
    const n = dataScience.projects.length;
    dataScience.projects.forEach((project, i) => {
      // Spread evenly around the pad facing the bridge (+x), so none sits on the entrance road (-x)
      const a = Math.PI / 2 + ((i - (n - 1) / 2) / n) * Math.PI * 2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const accent = COLORS.dsAccents[i % COLORS.dsAccents.length];
      addZone(project, ISLET.x + dx * ISLET.ring, ISLET.z + dz * ISLET.ring, accent, ISLET.x, ISLET.z);
      const signR = ISLET.ring + 6.5;
      addSign({
        x: ISLET.x + dx * signR,
        z: ISLET.z + dz * signR,
        yaw: Math.atan2(-dx, -dz),
        texture: makeSignTexture({ title: project.title, tags: project.tags, accent }, renderer),
      });
    });
  }

  // Trees and rocks, kept off roads, pads, signs and houses
  const nearSpoke = (x, z, margin) =>
    spokeAngles.some((a) => {
      const sx = Math.sin(a);
      const sz = Math.cos(a);
      const t = x * sx + z * sz;
      if (t < 0 || t > RING_RADIUS) return false;
      return Math.hypot(x - sx * t, z - sz * t) < margin;
    });
  const freeSpot = (x, z, margin) => {
    const r = Math.hypot(x, z);
    if (r < PLAZA_RADIUS + margin) return false;
    if (dataScience && inCauseway(x, z, 4 + margin)) return false;
    if (Math.abs(r - RING_RADIUS) < 4.4 + margin + 1) return false;
    if (nearSpoke(x, z, 2.5 + margin)) return false;
    return !blockers.some((b) => Math.hypot(x - b.x, z - b.z) < b.r + margin);
  };

  const treeSpots = [];
  let attempts = 0;
  while (treeSpots.length < quality.trees && attempts++ < 4000) {
    const a = rand() * Math.PI * 2;
    const r = 13 + rand() * (WORLD_RADIUS - 16);
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!freeSpot(x, z, 1.5)) continue;
    if (treeSpots.some((t) => Math.hypot(t.x - x, t.z - z) < 3.2)) continue;
    treeSpots.push({ x, z, s: 0.8 + rand() * 0.7 });
  }

  // Island trees between the ring road and the shore, away from the entrance and signs
  const isletTreeStart = treeSpots.length;
  if (dataScience) {
    const want = quality.low ? 10 : 20;
    attempts = 0;
    while (treeSpots.length - isletTreeStart < want && attempts++ < 1500) {
      const a = rand() * Math.PI * 2;
      const r = ISLET.ring + 4.5 + rand() * (ISLET.radius - ISLET.ring - 7);
      const x = ISLET.x + Math.sin(a) * r;
      const z = ISLET.z + Math.cos(a) * r;
      if (x < ISLET.x && Math.abs(z - ISLET.z) < 6) continue;
      if (blockers.some((b) => Math.hypot(x - b.x, z - b.z) < b.r + 1)) continue;
      if (treeSpots.some((t) => Math.hypot(t.x - x, t.z - z) < 3.2)) continue;
      treeSpots.push({ x, z, s: 0.7 + rand() * 0.6 });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.4, 6);
  const leafGeo = new THREE.ConeGeometry(1.4, 3.2, 7);
  const trunks = shadow(new THREE.InstancedMesh(trunkGeo, material(COLORS.trunk), treeSpots.length));
  const leaves = shadow(new THREE.InstancedMesh(leafGeo, material('#ffffff'), treeSpots.length));
  const leafColor = new THREE.Color();
  treeSpots.forEach((t, i) => {
    const s = new THREE.Vector3(t.s, t.s, t.s);
    q.setFromAxisAngle(up, rand() * Math.PI * 2);
    m4.compose(new THREE.Vector3(t.x, 0.7 * t.s, t.z), q, s);
    trunks.setMatrixAt(i, m4);
    m4.compose(new THREE.Vector3(t.x, (1.4 + 1.6) * t.s, t.z), q, s);
    leaves.setMatrixAt(i, m4);
    const palette = i >= isletTreeStart ? COLORS.isletLeaves : COLORS.leaves;
    leaves.setColorAt(i, leafColor.set(palette[i % palette.length]));
    addFixed(RAPIER.ColliderDesc.cylinder(1.5, 0.35 * t.s), t.x, 1.5, t.z);
  });
  scene.add(trunks, leaves);

  const rockCount = quality.low ? 14 : 28;
  const rockSpots = [];
  attempts = 0;
  while (rockSpots.length < rockCount && attempts++ < 2000) {
    const a = rand() * Math.PI * 2;
    const r = 13 + rand() * (WORLD_RADIUS - 15);
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!freeSpot(x, z, 1)) continue;
    if (treeSpots.some((t) => Math.hypot(t.x - x, t.z - z) < 2.5)) continue;
    rockSpots.push({ x, z, s: 0.5 + rand() * 0.9 });
  }
  const rocks = shadow(new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), material(COLORS.rock), rockSpots.length));
  rockSpots.forEach((rk, i) => {
    q.setFromEuler(new THREE.Euler(rand(), rand() * 6, rand()));
    m4.compose(new THREE.Vector3(rk.x, rk.s * 0.35, rk.z), q, new THREE.Vector3(rk.s, rk.s * 0.75, rk.s));
    rocks.setMatrixAt(i, m4);
    addFixed(RAPIER.ColliderDesc.ball(rk.s * 0.85), rk.x, rk.s * 0.2, rk.z);
  });
  scene.add(rocks);

  return {
    dynamics,
    zones,
    spawn: { x: 0, z: 0, yaw: 0 },
    update(t, activeId) {
      for (const zone of zones) zone.update(t, zone.data.id === activeId);
    },
  };
}
