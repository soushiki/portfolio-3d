const KEYS = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'brake',
};

const DEAD_ZONE = 0.15; // ignore tiny thumb wobble around the centre
const REVERSE_FROM = 0.35; // pull clearly down before the car reverses

// Keyboard + on-screen joystick merged into one state object.
// Keys give 0 or 1; the joystick gives analog values between 0 and 1.
export function createInput({ touchRoot, onReset }) {
  const state = { forward: 0, back: 0, left: 0, right: 0, brake: 0 };
  const keyboard = new Set();
  const touches = new Map(); // pointerId -> action
  const joy = { x: 0, y: 0 }; // -1..1, y negative = up

  const refresh = () => {
    for (const k of Object.keys(state)) state[k] = 0;
    for (const code of keyboard) state[KEYS[code]] = 1;
    for (const action of touches.values()) state[action] = 1;
    const ax = Math.abs(joy.x) < DEAD_ZONE ? 0 : joy.x;
    const ay = Math.abs(joy.y) < DEAD_ZONE ? 0 : joy.y;
    state.forward = Math.max(state.forward, Math.max(0, -ay));
    state.back = Math.max(state.back, ay > REVERSE_FROM ? ay : 0);
    state.left = Math.max(state.left, Math.max(0, -ax));
    state.right = Math.max(state.right, Math.max(0, ax));
  };

  const isInteractive = (el) => el instanceof HTMLElement && el.closest('a, button, input, textarea, select');

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR' && !e.repeat && !e.ctrlKey && !e.metaKey) {
      onReset();
      return;
    }
    if (!(e.code in KEYS)) return;
    // Let Space/arrows keep working on focused links and buttons.
    if (isInteractive(e.target) && (e.code === 'Space' || e.code === 'Enter')) return;
    e.preventDefault();
    keyboard.add(e.code);
    refresh();
  });
  window.addEventListener('keyup', (e) => {
    if (keyboard.delete(e.code)) refresh();
  });
  window.addEventListener('blur', () => {
    keyboard.clear();
    touches.clear();
    joy.x = 0;
    joy.y = 0;
    refresh();
  });

  // Joystick: the knob follows the thumb inside the base and springs back on release.
  const stick = touchRoot.querySelector('.joystick');
  const knob = stick?.querySelector('.joy-knob');
  if (stick && knob) {
    let activePointer = null;
    const move = (e) => {
      const r = stick.getBoundingClientRect();
      const radius = r.width / 2;
      let dx = e.clientX - (r.left + radius);
      let dy = e.clientY - (r.top + radius);
      const dist = Math.hypot(dx, dy);
      const max = radius * 0.62; // how far the knob travels from the centre
      if (dist > max) {
        dx = (dx / dist) * max;
        dy = (dy / dist) * max;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      joy.x = dx / max;
      joy.y = dy / max;
      refresh();
    };
    const release = (e) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      joy.x = 0;
      joy.y = 0;
      knob.style.transform = '';
      stick.classList.remove('is-down');
      refresh();
    };
    stick.addEventListener('pointerdown', (e) => {
      if (activePointer !== null) return;
      e.preventDefault();
      activePointer = e.pointerId;
      try {
        stick.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointers can't be captured; moves still arrive on the stick.
      }
      stick.classList.add('is-down');
      move(e);
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId === activePointer) move(e);
    });
    stick.addEventListener('pointerup', release);
    stick.addEventListener('pointercancel', release);
    stick.addEventListener('lostpointercapture', release);
    stick.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  for (const btn of touchRoot.querySelectorAll('[data-key]')) {
    const action = btn.dataset.key;
    const release = (e) => {
      if (touches.get(e.pointerId) !== action) return;
      touches.delete(e.pointerId);
      btn.classList.remove('is-down');
      refresh();
    };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic or already-released pointers can't be captured; the button still works.
      }
      touches.set(e.pointerId, action);
      btn.classList.add('is-down');
      refresh();
    });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('lostpointercapture', release);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  return state;
}
