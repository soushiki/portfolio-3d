import * as THREE from 'three';
import { setPixelRatio } from './comic.js';
import { createBackdrop } from './backdrop.js';
import { buildPlanets, rimPoint } from './planets.js';
import { makeCat } from './hero.js';
import { CATS, collect, setPose, updateCat } from './cats.js';
import { ROUTE, STOPS } from './route.js';
import { createInput } from './input.js';

// The guided 2.5D tour. Everything lives in the z = 0 plane; the camera looks down -z.
// The hero walks along a planet's rim (one number: its angle), hops along a fixed arc
// between planets, and the cards open when it reaches a stop. No physics engine needed.

const DEG = Math.PI / 180;
const WALK_SPEED = 7.5; // units per second along the rim
const JUMP_SPEED = 7;
const GRAVITY = 22;
const STOP_RANGE = 7; // degrees: inside this the stop's card opens
const LEAVE_RANGE = 11;
const HIDDEN_RANGE = 8;
const PAD_RANGE = 6; // degrees around a star pad
const CHARGE_TIME = 0.6; // seconds of holding Space / Jump on a pad before the hop

export async function startGame({ canvas, quality, isTouch, ui, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias, powerPreference: 'high-performance' });
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  setPixelRatio(renderer.getPixelRatio());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 1, 400);
  const backdrop = createBackdrop({ low: quality.low });
  scene.add(backdrop.mesh);

  ui.progress(0.6, null);
  const world = buildPlanets({ scene, route: ROUTE, low: quality.low });
  const planets = world.planets;

  // Hero: outer group stands on the rim, inner group turns to face the walk direction.
  const hero = makeCat({ coat: 'tuxedo', gear: true, outline: 1.5 });
  const heroOuter = new THREE.Group();
  const heroInner = new THREE.Group();
  heroInner.add(hero.group);
  heroOuter.add(heroInner);
  heroInner.scale.setScalar(1.2);
  scene.add(heroOuter);

  // Landing ring: a flat ink circle that expands and fades.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 1, 24),
    new THREE.MeshBasicMaterial({ color: '#FFF6E5', transparent: true, opacity: 0, depthWrite: false }),
  );
  scene.add(ring);
  let ringT = 1;

  const state = {
    planet: 0,
    angle: 140,
    height: 0,
    vy: 0,
    facing: 1, // 1 = clockwise (screen right over the top)
    mode: 'walk', // walk | auto | flight
    autoTarget: null,
    flight: null,
    activeStop: null,
    dismissed: null,
    shake: 0,
    found: 0,
    charge: null, // { dir, t } while Space / Jump is held on a star pad
    cut: null, // reduced motion: { t, toPlanet, walkTo } short hop before the panel cut
  };

  // Cats found on earlier visits go straight to their found pose, with no toast.
  const catInfo = CATS.map((c) => ({ id: c.id, name: c.name }));
  const foundIds = [];
  try {
    const saved = JSON.parse(localStorage.getItem('p3d-cats') ?? '[]');
    if (Array.isArray(saved)) {
      for (const p of planets) {
        for (const h of p.hidden) {
          if (saved.includes(h.cat.spec.id)) {
            setPose(h.cat, h.cat.spec.found);
            h.cat.found = true;
            h.found = true;
            state.found++;
            foundIds.push(h.cat.spec.id);
          }
        }
      }
    }
  } catch {}
  ui.setCats(foundIds, catInfo);

  const input = createInput({
    touchRoot: document.getElementById('touch'),
    onNext: () => next(1),
    onBack: () => next(-1),
    onPlanet: (i) => travelTo(STOPS.findIndex((s) => s.planet.index === i)),
  });

  const planetOf = (i = state.planet) => planets[i];
  const angDiff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;

  // Index in STOPS of the stop the hero is at or has most recently passed.
  const currentStopIndex = () => {
    let best = -1;
    STOPS.forEach((s, i) => {
      if (s.planet.index !== state.planet) return;
      if (angDiff(state.angle, s.stand) <= STOP_RANGE) best = i; // clockwise = decreasing angle
    });
    if (best === -1) best = STOPS.findIndex((s) => s.planet.index === state.planet) - 1;
    return best;
  };

  const busy = () => state.mode === 'flight' || state.mode === 'cut';

  function next(dir) {
    if (busy()) return;
    const cur = currentStopIndex();
    const atStop = state.activeStop != null && STOPS[cur] === state.activeStop;
    let target = dir > 0 ? cur + 1 : atStop ? cur - 1 : cur;
    target = Math.max(0, Math.min(STOPS.length - 1, target));
    travelTo(target);
  }

  function travelTo(index) {
    const stop = STOPS[index];
    if (!stop || busy()) return;
    if (stop.planet.index === state.planet) {
      state.mode = 'auto';
      state.autoTarget = stop.stand;
    } else {
      // Land on the side facing where the hero came from, then walk to the stop.
      const back = stop.planet.index < state.planet;
      launch(stop.planet.index, stop.stand + (back ? -18 : 22), stop.stand);
    }
  }

  // The star pad under the hero: +1 hops to the next planet, -1 to the previous one.
  function padUnderHero() {
    if (state.height > 0.01) return 0;
    const p = planetOf();
    if (p.launch != null && Math.abs(angDiff(state.angle, p.launch)) < PAD_RANGE) return 1;
    if (p.back != null && Math.abs(angDiff(state.angle, p.back)) < PAD_RANGE) return -1;
    return 0;
  }

  function hopFromPad(dir) {
    if (dir > 0) {
      const s = STOPS.find((x) => x.planet.index === state.planet + 1);
      if (s) launch(s.planet.index, s.stand + 22, s.stand);
    } else {
      const prev = STOPS.filter((x) => x.planet.index === state.planet - 1);
      const s = prev[prev.length - 1];
      if (s) launch(s.planet.index, s.stand - 18, s.stand);
    }
  }

  function jump() {
    if (busy()) return;
    if (state.height > 0.01) return;
    state.vy = JUMP_SPEED;
    hero.anim.squash = -0.5;
  }

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  function launch(toPlanet, landAngle, walkTo) {
    ui.closeCard();
    state.activeStop = null;
    const from = rimPoint(planetOf(), state.angle, state.height, new THREE.Vector3());
    const to = rimPoint(planets[toPlanet], landAngle, 0, new THREE.Vector3());
    if (reducedMotion) {
      // No arc and no camera travel: a small hop in place, then a comic panel cut.
      state.vy = JUMP_SPEED * 0.7;
      hero.anim.squash = -0.4;
      hero.anim.air = 1;
      state.cut = { t: 0, toPlanet, walkTo };
      state.mode = 'cut';
      return;
    }
    const dist = from.distanceTo(to);
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.y += Math.max(6, dist * 0.35);
    state.flight = {
      from, to, mid, t: 0, duration: Math.min(1.7, 0.75 + dist / 45),
      toPlanet, landAngle, walkTo, spin: toPlanet > state.planet ? -1 : 1,
      startTilt: (state.angle - 90) * DEG, endTilt: (landAngle - 90) * DEG,
    };
    state.mode = 'flight';
    state.facing = toPlanet > state.planet ? 1 : -1;
    hero.anim.squash = 0.6;
    hero.anim.air = 1;
    document.body.classList.add('is-flying');
    ui.setPlanet(toPlanet);
  }

  function land() {
    const f = state.flight;
    state.planet = f.toPlanet;
    state.angle = f.landAngle;
    state.height = 0;
    state.vy = 0;
    state.flight = null;
    state.mode = 'auto';
    state.autoTarget = f.walkTo;
    hero.anim.squash = 0.7;
    hero.anim.air = 0;
    state.shake = 0.3;
    document.body.classList.remove('is-flying');
    rimPoint(planetOf(), state.angle, 0.05, ring.position);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tmpA.copy(ring.position).sub(tmpB.set(planetOf().x, planetOf().y, 0)).normalize());
    ringT = 0;
  }

  // Stops: open the card on arrival, close it on leaving, respect a manual close.
  ui.onCardClosed(() => (state.dismissed = state.activeStop));
  const updateStops = () => {
    if (busy()) return;
    const p = planetOf();
    let stop = state.activeStop;
    if (stop && (stop.planet.index !== state.planet || Math.abs(angDiff(state.angle, stop.stand)) > LEAVE_RANGE)) {
      state.activeStop = null;
      if (state.dismissed === stop) state.dismissed = null;
      ui.closeCard();
      stop = null;
    }
    if (!stop) {
      const s = STOPS.find((x) => x.planet.index === state.planet && Math.abs(angDiff(state.angle, x.stand)) < STOP_RANGE);
      if (s) {
        state.activeStop = s;
        if (state.dismissed !== s) ui.openCard(s.item, s.planet);
      }
    }
    for (const h of p.hidden) {
      if (!h.found && Math.abs(angDiff(state.angle, h.angle)) < HIDDEN_RANGE) {
        h.found = true;
        state.found++;
        collect(h.cat, { reducedMotion });
        foundIds.push(h.cat.spec.id);
        try {
          localStorage.setItem('p3d-cats', JSON.stringify(foundIds));
        } catch {}
        ui.setCats(foundIds, catInfo);
        ui.foundCat(h.cat.spec.name, state.found, planets.reduce((n, q) => n + q.hidden.length, 0));
      }
    }
    // Next/Back labels follow the hero.
    const cur = currentStopIndex();
    const nextStop = STOPS[Math.min(STOPS.length - 1, cur + 1)];
    ui.setNav({ next: cur + 1 < STOPS.length ? nextStop.item.title : null, back: cur > 0 || (cur === 0 && !state.activeStop) });
  };

  // Camera: frame the planet and the hero, leaving room for the open card.
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const focus = new THREE.Vector3();
  let roll = 0;
  const tanHalf = Math.tan((camera.fov * DEG) / 2);
  const updateCamera = (dt, snap) => {
    const heroPos = heroOuter.position;
    let R;
    if (state.mode === 'flight') {
      const f = state.flight;
      R = 12 + f.from.distanceTo(f.to) * 0.35;
      focus.copy(heroPos);
    } else {
      const p = planetOf();
      R = p.radius;
      focus.set(p.x, p.y, 0).lerp(heroPos, 0.35);
      focus.y += 2.2; // landmarks and banner sit above the planet
    }
    // Room for the planet, its landmarks and banner; short screens may crop the banner.
    const short = window.innerHeight <= 500;
    const needH = 2 * R + (short ? 7 : 12);
    const needW = 2 * R + 8;
    const inset = ui.viewInset(); // fraction of the screen the card covers: { right, bottom }
    const aspect = camera.aspect;
    const usableW = 1 - inset.right;
    const usableH = 1 - inset.bottom - inset.top;
    let D = Math.max(needH / usableH, needW / (aspect * usableW)) / (2 * tanHalf);
    D = Math.min(Math.max(D, 24), 120);
    const visH = 2 * D * tanHalf;
    const visW = visH * aspect;
    // Shift so the planet sits in the uncovered part of the screen.
    const tx = focus.x + (inset.right * visW) / 2;
    const ty = focus.y - ((inset.bottom - inset.top) * visH) / 2;
    const k = snap ? 1 : 1 - Math.exp(-dt * (state.mode === 'flight' ? 4 : 3));
    camLook.x += (tx - camLook.x) * k;
    camLook.y += (ty - camLook.y) * k;
    camPos.set(camLook.x, camLook.y, camPos.z + (D - camPos.z) * k);
    const targetRoll = reducedMotion || state.mode === 'flight' ? 0 : THREE.MathUtils.clamp(-angDiff(state.angle, 90) * 0.25, -18, 18) * DEG;
    roll += (targetRoll - roll) * k;
    camera.position.copy(camPos);
    if (state.shake > 0 && !reducedMotion) {
      const s = state.shake * 0.6;
      camera.position.x += (Math.random() - 0.5) * s;
      camera.position.y += (Math.random() - 0.5) * s;
      state.shake = Math.max(0, state.shake - dt);
    }
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(camLook.x, camLook.y, 0);
  };

  const placeHero = (dt, t) => {
    if (state.mode === 'flight') {
      const f = state.flight;
      const u = f.t;
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; // ease in-out
      // Quadratic Bezier along the arc.
      const a = 1 - e;
      heroOuter.position.set(
        a * a * f.from.x + 2 * a * e * f.mid.x + e * e * f.to.x,
        a * a * f.from.y + 2 * a * e * f.mid.y + e * e * f.to.y,
        0,
      );
      heroOuter.rotation.set(0, 0, f.startTilt + (f.endTilt - f.startTilt) * e + f.spin * Math.PI * 2 * e);
    } else {
      rimPoint(planetOf(), state.angle, state.height, heroOuter.position);
      heroOuter.rotation.set(0, 0, (state.angle - 90) * DEG);
    }
    const yaw = state.facing > 0 ? -0.55 : Math.PI + 0.55;
    heroInner.rotation.y += (yaw - heroInner.rotation.y) * (1 - Math.exp(-dt * 12));
    hero.update(dt, t);
  };

  const step = (dt) => {
    if (state.mode === 'flight') {
      const f = state.flight;
      f.t = Math.min(1, f.t + dt / f.duration);
      if (f.t >= 1) land();
      return;
    }
    if (state.mode === 'cut') {
      const c = state.cut;
      c.t += dt;
      state.vy -= GRAVITY * dt;
      state.height = Math.max(0, state.height + state.vy * dt);
      if (c.t >= 0.35) {
        ui.panelCut();
        state.planet = c.toPlanet;
        state.angle = c.walkTo;
        state.height = 0;
        state.vy = 0;
        state.cut = null;
        state.mode = 'walk';
        state.facing = 1;
        hero.anim.air = 0;
        hero.anim.squash = 0.4;
        ui.setPlanet(c.toPlanet);
      }
      return;
    }
    const p = planetOf();
    // Space / Jump: on a star pad it starts a charge, elsewhere it is a plain jump.
    if (input.consumeJump()) {
      const padDir = padUnderHero();
      if (padDir) state.charge = { dir: padDir, t: 0 };
      else jump();
    }
    if (state.charge) {
      if (!input.state.jumpHeld || padUnderHero() !== state.charge.dir) {
        state.charge = null; // let go early or walked off: cancel
      } else {
        state.charge.t = Math.min(1, state.charge.t + dt / CHARGE_TIME);
        hero.anim.squash = Math.max(hero.anim.squash, 0.45 * state.charge.t);
        if (state.charge.t >= 1) {
          const d = state.charge.dir;
          state.charge = null;
          hopFromPad(d);
          return;
        }
      }
    }
    let dir = state.charge ? 0 : input.state.right - input.state.left; // +1 = clockwise
    if (dir !== 0) state.mode = 'walk';
    if (state.mode === 'auto') {
      const d = angDiff(state.angle, state.autoTarget);
      if (Math.abs(d) < 0.8) {
        state.angle = state.autoTarget;
        state.mode = 'walk';
        state.facing = 1; // stops sit to the hero's right: face the landmark
        dir = 0;
      } else dir = Math.sign(d);
    }
    const degPerSec = (WALK_SPEED / p.radius) / DEG;
    state.angle -= dir * degPerSec * dt;
    state.angle = ((state.angle % 360) + 360) % 360;
    if (dir) state.facing = dir;
    hero.anim.walk += ((dir ? 1 : 0) - hero.anim.walk) * (1 - Math.exp(-dt * 10));
    // Jump: radial height with gravity toward the planet's centre.
    if (state.height > 0 || state.vy > 0) {
      state.vy -= GRAVITY * dt;
      state.height += state.vy * dt;
      hero.anim.air = 0;
      if (state.height <= 0) {
        state.height = 0;
        state.vy = 0;
        hero.anim.squash = 0.45;
      }
    }
    // Star pads pulse when the hero is close and grow while charging.
    const padDir = padUnderHero();
    for (const [pad, d] of [[p.pad, 1], [p.backPad, -1]]) {
      if (!pad) continue;
      const near = padDir === d;
      const charge = state.charge && state.charge.dir === d ? state.charge.t : 0;
      const pulse = near && !reducedMotion ? Math.sin(performance.now() / 120) * 0.08 : 0;
      pad.star.scale.setScalar(near ? 1.15 + pulse + charge * 0.5 : 1);
    }
    ui.showLaunchHint(padDir);
  };

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    backdrop.resize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
  };
  window.addEventListener('resize', resize);
  resize();

  // Warm up behind the loader.
  placeHero(0, 0);
  updateCamera(0, true);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  let running = false;
  let last = performance.now();
  const t0 = last;
  const tick = (dt, now) => {
    const t = reducedMotion ? 0 : (now - t0) / 1000;
    if (running) step(dt);
    placeHero(dt, t);
    if (running) updateStops();
    world.update(t);
    for (const p of planets) for (const h of p.hidden) updateCat(h.cat, dt, t);
    if (ringT < 1) {
      ringT = Math.min(1, ringT + dt * 2.5);
      ring.scale.setScalar(1 + ringT * 2.5);
      ring.material.opacity = 0.9 * (1 - ringT);
    }
    updateCamera(dt, false);
    backdrop.update(camLook.x, camLook.y, t);
  };
  const frame = (now) => {
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    tick(dt, now);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  ui.ready(() => {
    running = true;
    last = performance.now();
    if (isTouch) document.getElementById('touch').hidden = false;
    ui.setPlanet(0);
    // Walk to the first stop so the visitor sees how it works.
    state.mode = 'auto';
    state.autoTarget = STOPS[0].stand;
  });

  ui.onNav(() => next(1), () => next(-1));
  ui.onGoTo((id) => {
    const i = STOPS.findIndex((s) => s.item.id === id);
    if (i >= 0) travelTo(i);
  });

  return { state, travelTo, next, planets, camera, debug: () => ({ camPos, camLook, focus, roll, hero: heroOuter.position }),
    // Dev/test helper: advance the simulation without animation frames (hidden tabs, tests).
    advance(seconds) {
      let now = performance.now();
      for (let i = 0; i < Math.round(seconds * 60); i++) tick(1 / 60, (now += 1000 / 60));
      renderer.render(scene, camera);
    },
  };
}
