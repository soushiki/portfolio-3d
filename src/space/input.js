// Keyboard and touch input for the guided tour.
// ← → / A D walk · ↑ W Space jump (on the star pad: hop to the next planet)
// Enter / N next stop · B / Backspace previous stop · 0–6 fly to a planet.
const WALK = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const JUMP = new Set(['ArrowUp', 'KeyW', 'Space']);

export function createInput({ touchRoot, onNext, onBack, onJump, onPlanet }) {
  const state = { left: 0, right: 0 };
  const held = new Set();
  const touches = new Map();
  let jumpQueued = false;

  const refresh = () => {
    state.left = state.right = 0;
    for (const code of held) state[WALK[code]] = 1;
    for (const action of touches.values()) state[action] = 1;
  };

  // Keys never act while a link, button or field has focus: there Enter/Space belong to it.
  const isInteractive = (el) => el instanceof HTMLElement && el.closest('a, button, input, textarea, select, [role="dialog"]:not(#card)');
  const inDialog = () => !document.getElementById('list').hidden;

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || inDialog()) return;
    const focusOnControl = isInteractive(document.activeElement);
    if (WALK[e.code]) {
      held.add(e.code);
      refresh();
      e.preventDefault();
      return;
    }
    if (focusOnControl) return;
    if (JUMP.has(e.code)) {
      if (!e.repeat) jumpQueued = true;
      e.preventDefault();
    } else if ((e.code === 'Enter' || e.code === 'KeyN') && !e.repeat) {
      onNext();
      e.preventDefault();
    } else if ((e.code === 'KeyB' || e.code === 'Backspace') && !e.repeat) {
      onBack();
      e.preventDefault();
    } else if (/^Digit[0-6]$/.test(e.code) && !e.repeat) {
      onPlanet(Number(e.code.slice(5)));
    }
  });
  window.addEventListener('keyup', (e) => {
    held.delete(e.code);
    refresh();
  });
  window.addEventListener('blur', () => {
    held.clear();
    touches.clear();
    refresh();
  });

  // Touch: hold ◀ ▶ to walk, tap Jump. Next/Back are ordinary HUD buttons.
  if (touchRoot) {
    for (const btn of touchRoot.querySelectorAll('[data-action]')) {
      const action = btn.dataset.action;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        if (action === 'jump') onJump();
        else {
          touches.set(e.pointerId, action);
          refresh();
        }
        btn.classList.add('is-down');
      });
      const up = (e) => {
        touches.delete(e.pointerId);
        refresh();
        btn.classList.remove('is-down');
      };
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  return {
    state,
    consumeJump() {
      const j = jumpQueued;
      jumpQueued = false;
      return j;
    },
  };
}
