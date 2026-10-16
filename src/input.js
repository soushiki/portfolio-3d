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

// Keyboard + on-screen buttons merged into one state object (values 0 or 1).
export function createInput({ touchRoot, onReset }) {
  const state = { forward: 0, back: 0, left: 0, right: 0, brake: 0 };
  const keyboard = new Set();
  const touches = new Map(); // pointerId -> action

  const refresh = () => {
    for (const k of Object.keys(state)) state[k] = 0;
    for (const code of keyboard) state[KEYS[code]] = 1;
    for (const action of touches.values()) state[action] = 1;
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
    refresh();
  });

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
