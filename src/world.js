import * as THREE from 'three';
import { makeSignTexture } from './signs.js';

export const RING_RADIUS = 34;
const WORLD_RADIUS = 88;
const PAD_RADIUS = 3.2;
const PLAZA_RADIUS = 11;

const COLORS = {
  ground: '#E2D3CC',
  road: '#4A4E69',
  plaza: '#C9ADA7',
  dash: '#F2E9E4',
  trunk: '#22223B',
  leaves: ['#4A4E69', '#9A8C98', '#6B6880'],
  rock: '#9A8C98',
  crate: '#C9ADA7',
  crateAlt: '#9A8C98',
  cone: '#22223B',
  post: '#22223B',
  pad: '#F2E9E4',
  accents: ['#22223B', '#4A4E69', '#9A8C98', '#C9ADA7'],
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

export function buildWorld({ scene, physics, RAPIER, renderer, quality, projects, contact }) {
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
    new THREE.Mesh(new THREE.CylinderGeometry(WORLD_RADIUS, WORLD_RADIUS - 2, 4, 72), material(COLORS.ground)),
    false,
  );
  ground.position.y = -2;
  scene.add(ground);
  addFixed(RAPIER.ColliderDesc.cuboid(WORLD_RADIUS + 10, 2, WORLD_RADIUS + 10).setFriction(0.6), 0, -2, 0);

  const wallSegments = 36;
  for (let i = 0; i < wallSegments; i++) {
    const a = (i / wallSegments) * Math.PI * 2;
    const r = WORLD_RADIUS - 1;
    const half = (Math.PI * r) / wallSegments + 0.5;
    addFixed(RAPIER.ColliderDesc.cuboid(half, 4, 0.5), Math.sin(a) * r, 3, Math.cos(a) * r, a);
  }

  // Roads: plaza, ring road, spokes and dashed centre line
  const roadMat = material(COLORS.road, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const ring = shadow(new THREE.Mesh(new THREE.RingGeometry(RING_RADIUS - 3, RING_RADIUS + 3, 128), roadMat), false);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  scene.add(ring);

  const spokeAngles = [];
  for (let i = 0; i < projects.length; i += 2) spokeAngles.push((i / projects.length) * Math.PI * 2);
  for (const a of spokeAngles) {
    const len = RING_RADIUS - PLAZA_RADIUS;
    const spoke = shadow(new THREE.Mesh(new THREE.PlaneGeometry(5, len), roadMat), false);
    spoke.rotation.set(-Math.PI / 2, 0, a);
    const mid = PLAZA_RADIUS + len / 2;
    spoke.position.set(Math.sin(a) * mid, 0.02, Math.cos(a) * mid);
    scene.add(spoke);
  }

  const plaza = shadow(
    new THREE.Mesh(
      new THREE.CircleGeometry(PLAZA_RADIUS, 64),
      material(COLORS.plaza, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
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
  const addZone = (data, x, z, accent) => {
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

  // Trees and rocks, kept off roads, pads and signs
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
    if (Math.abs(r - RING_RADIUS) < 3 + margin + 1) return false;
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
    leaves.setColorAt(i, leafColor.set(COLORS.leaves[i % COLORS.leaves.length]));
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
