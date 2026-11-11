// Keyboard and touch input for the guided tour.
// ← → / A D walk · ↑ W Space jump (on the star pad: hop to the next planet)
// Enter / N next stop · B / P / Backspace / Shift+Enter previous stop · 0–6 fly to a planet.
// Holding Space (or the Jump button) on a star pad charges a hop to the next/previous planet.
const WALK = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const JUMP = new Set(['ArrowUp', 'KeyW', 'Space']);

export function createInput({ touchRoot, onNext, onBack, onPlanet }) {
  const state = { left: 0, right: 0, jumpHeld: false };
  const jumpKeys = new Set();
  let touchJump = false;
  const refreshJump = () => (state.jumpHeld = jumpKeys.size > 0 || touchJump);
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
      jumpKeys.add(e.code);
      refreshJump();
      e.preventDefault();
    } else if (e.code === 'Enter' && e.shiftKey && !e.repeat) {
      onBack();
      e.preventDefault();
    } else if ((e.code === 'Enter' || e.code === 'KeyN') && !e.repeat) {
      onNext();
      e.preventDefault();
    } else if ((e.code === 'KeyB' || e.code === 'KeyP' || e.code === 'Backspace') && !e.repeat) {
      onBack();
      e.preventDefault();
    } else if (/^Digit[0-6]$/.test(e.code) && !e.repeat) {
      onPlanet(Number(e.code.slice(5)));
    }
  });
  window.addEventListener('keyup', (e) => {
    held.delete(e.code);
    jumpKeys.delete(e.code);
    refresh();
    refreshJump();
  });
  window.addEventListener('blur', () => {
    held.clear();
    touches.clear();
    jumpKeys.clear();
    touchJump = false;
    refresh();
    refreshJump();
  });

  // Touch: hold ◀ ▶ to walk, tap Jump. Next/Back are ordinary HUD buttons.
  if (touchRoot) {
    for (const btn of touchRoot.querySelectorAll('[data-action]')) {
      const action = btn.dataset.action;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        // Capture can throw (e.g. a pointer the browser already released); never let it block the action.
        try {
          btn.setPointerCapture(e.pointerId);
        } catch {}
        if (action === 'jump') {
          jumpQueued = true;
          touchJump = true;
          refreshJump();
        } else {
          touches.set(e.pointerId, action);
          refresh();
        }
        btn.classList.add('is-down');
      });
      const up = (e) => {
        touches.delete(e.pointerId);
        if (action === 'jump') {
          touchJump = false;
          refreshJump();
        }
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
