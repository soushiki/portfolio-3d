// ?selftest=hop: checks that a hop between neighbouring planets is a visible flight on the
// current device settings. Outside reduced motion it fails when the hero spends under 0.4 s in
// flight, jumps more than a quarter of the screen in one frame (a teleport or cut), stays under
// 14 px tall, or barely moves. Add &assert=flight to demand a flight even under reduced motion
// (proves the test catches the cut). Steps the game at
// 15 fps to imitate a slow phone. Result: an on-page banner, the console, and window.__selftest.
// Use with ?quality=low and a phone-sized viewport to reproduce mobile conditions.
import * as THREE from 'three';

export function runHopTest(game, { reducedMotion }) {
  const FPS = 15;
  const { camera } = game;
  const toPx = (v) => {
    const p = v.clone().project(camera);
    return new THREE.Vector2(((p.x + 1) / 2) * innerWidth, ((1 - p.y) / 2) * innerHeight);
  };
  const heroHeightPx = () => {
    const h = game.debug().hero.clone();
    return toPx(h).distanceTo(toPx(h.add(new THREE.Vector3(0, 1.9, 0))));
  };

  document.getElementById('start-btn')?.click();
  game.advance(2.5, FPS);
  game.next(1); // Hello stop -> Minoscreto: neighbouring planets
  let seconds = 0;
  let flightSeconds = 0;
  let minPx = Infinity;
  let maxStep = 0;
  const start = toPx(game.debug().hero);
  let prev = start.clone();
  let maxTravel = 0;
  while ((game.state.mode === 'flight' || game.state.mode === 'cut') && seconds < 6) {
    const inFlight = game.state.mode === 'flight';
    game.advance(1 / FPS, FPS);
    seconds += 1 / FPS;
    if (inFlight) flightSeconds += 1 / FPS;
    const now = toPx(game.debug().hero);
    maxStep = Math.max(maxStep, now.distanceTo(prev));
    prev = now;
    minPx = Math.min(minPx, heroHeightPx());
    maxTravel = Math.max(maxTravel, now.distanceTo(start));
  }
  const demandFlight = !reducedMotion || new URLSearchParams(location.search).get('assert') === 'flight';
  const jumpLimit = 0.25 * Math.min(innerWidth, innerHeight);

  const failures = [];
  if (!demandFlight) {
    if (game.state.planet !== 1) failures.push(`did not arrive (planet ${game.state.planet})`);
  } else {
    if (flightSeconds < 0.4) failures.push(`flight lasted ${flightSeconds.toFixed(2)} s (< 0.4 s)`);
    if (maxStep > jumpLimit) failures.push(`hero jumped ${maxStep.toFixed(0)} px in one frame (teleport)`);
    if (minPx < 14) failures.push(`hero only ${minPx.toFixed(0)} px tall during the hop`);
    if (maxTravel < 60) failures.push(`hero moved only ${maxTravel.toFixed(0)} px on screen`);
    if (game.state.planet !== 1) failures.push(`did not land on planet 1 (planet ${game.state.planet})`);
  }
  const result = {
    pass: failures.length === 0,
    reducedMotion,
    seconds: +seconds.toFixed(2),
    flightSeconds: +flightSeconds.toFixed(2),
    maxStepPx: Math.round(maxStep),
    heroMinPx: Math.round(minPx),
    heroTravelPx: Math.round(maxTravel),
    failures,
  };
  window.__selftest = result;
  console[result.pass ? 'log' : 'error']('selftest hop', result);
  const box = Object.assign(document.createElement('p'), { className: 'debug-readout' });
  box.style.top = '8px';
  box.textContent = `${result.pass ? 'PASS' : 'FAIL'} hop selftest\n${JSON.stringify(result, null, 1)}`;
  document.body.append(box);
  return result;
}
