import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { buildWorld, RING_RADIUS } from './world.js';
import { createCar } from './car.js';
import { createInput } from './input.js';

const STEP = 1 / 60;

export async function startGame({ canvas, quality, isTouch, ui, projects, contact }) {
  await RAPIER.init();
  ui.progress(0.6, 'Building the world…');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias, powerPreference: 'high-performance' });
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const sky = new THREE.Color('#F2E9E4');
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 50, 120);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 260);

  scene.add(new THREE.HemisphereLight('#ffffff', '#C9ADA7', 1.7));
  const sun = new THREE.DirectionalLight('#fff4ec', 2.2);
  sun.castShadow = quality.shadows;
  if (quality.shadows) {
    sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    const s = sun.shadow.camera;
    s.left = s.bottom = -32;
    s.right = s.top = 32;
    s.near = 1;
    s.far = 90;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.03;
  }
  scene.add(sun, sun.target);
  const sunOffset = new THREE.Vector3(18, 34, 12);

  const physics = new RAPIER.World({ x: 0, y: -25, z: 0 });
  physics.timestep = STEP;

  const world = buildWorld({ scene, physics, RAPIER, renderer, quality, projects, contact });
  const car = createCar({ scene, physics, RAPIER, quality, spawn: world.spawn });
  const input = createInput({ touchRoot: document.getElementById('touch'), onReset: () => car.reset() });

  // Chase camera: trails behind the car's heading with some lag.
  let camYaw = world.spawn.yaw;
  const camTarget = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const updateCamera = (dt, snap) => {
    const p = car.group.position;
    // Don't swing the camera round when reversing.
    if (car.speed > -1) {
      let d = car.yaw - camYaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      camYaw += d * (snap ? 1 : 1 - Math.exp(-dt * 3));
    }
    const portrait = camera.aspect < 1;
    const dist = portrait ? 14 : 11;
    const height = portrait ? 9 : 6.5;
    camTarget.set(p.x - Math.sin(camYaw) * dist, p.y + height, p.z - Math.cos(camYaw) * dist);
    if (snap) camera.position.copy(camTarget);
    else camera.position.lerp(camTarget, 1 - Math.exp(-dt * 5));
    camLook.set(p.x + Math.sin(camYaw) * 3, p.y + 0.8, p.z + Math.cos(camYaw) * 3);
    camera.lookAt(camLook);
  };

  // Zone handling: open the card on entry, close it on exit, respect a manual close.
  let activeId = null;
  let dismissedId = null;
  const allZones = world.zones;
  ui.onCardClosed(() => (dismissedId = activeId));
  const updateZones = () => {
    const p = car.group.position;
    const zone = allZones.find((z) => Math.hypot(p.x - z.x, p.z - z.z) < z.radius);
    const id = zone ? zone.data.id : null;
    if (id === activeId) return;
    activeId = id;
    if (zone) {
      if (dismissedId !== id) ui.openCard(zone.data);
    } else {
      dismissedId = null;
      ui.closeCard();
    }
  };

  const goTo = (id) => {
    const zone = allZones.find((z) => z.data.id === id);
    if (!zone) return;
    // Park a few metres before the pad, facing it, so a tap on the gas drives in.
    const len = Math.hypot(zone.x, zone.z) || 1;
    const back = 7;
    const x = zone.x - (zone.x / len) * back;
    const z = zone.z - (zone.z / len) * back;
    const yaw = Math.atan2(zone.x - x, zone.z - z);
    car.reset(x, z, yaw);
    camYaw = yaw;
    car.sync(0);
    updateCamera(0, true);
  };
  ui.onGoTo(goTo);

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  window.addEventListener('resize', resize);

  // Warm up: settle props and compile shaders behind the loader.
  for (let i = 0; i < 30; i++) physics.step();
  for (const d of world.dynamics) syncMesh(d, true);
  car.sync(0);
  updateCamera(0, true);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  let running = false;
  let last = performance.now();
  let acc = 0;
  let hintShown = false;
  const t0 = performance.now();

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (running) {
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 5) {
        car.step(input, STEP);
        physics.step();
        acc -= STEP;
        steps++;
      }
      if (steps === 5) acc = 0;
    }
    for (const d of world.dynamics) syncMesh(d);
    car.sync(dt);
    if (car.group.position.y < -10) car.reset();
    updateCamera(dt, false);
    updateZones();
    world.update((now - t0) / 1000, activeId);

    if (quality.shadows) {
      sun.target.position.copy(car.group.position);
      sun.position.copy(car.group.position).add(sunOffset);
    }
    if (!hintShown && running && Math.abs(car.speed) > 3) {
      hintShown = true;
      ui.showHint(true);
      setTimeout(() => ui.showHint(false), 5000);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  ui.ready(() => {
    running = true;
    last = performance.now();
    if (isTouch) document.getElementById('touch').hidden = false;
  });

  return {
    car,
    goTo,
    zones: allZones.map((z) => ({ id: z.data.id, x: z.x, z: z.z })),
    get activeId() {
      return activeId;
    },
    ringRadius: RING_RADIUS,
  };
}

function syncMesh({ mesh, body }, force = false) {
  if (!force && body.isSleeping()) return;
  const p = body.translation();
  const r = body.rotation();
  mesh.position.set(p.x, p.y, p.z);
  mesh.quaternion.set(r.x, r.y, r.z, r.w);
}
