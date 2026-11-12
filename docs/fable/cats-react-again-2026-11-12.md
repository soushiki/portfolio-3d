# Found cats react again (Fable design, 2026-11-12)

Goal (Sebastian, 2026-11-12): found cats react every time the hero walks past them. He reported the game as "turned off everywhere": a browser that had found cats before showed nothing on later passes.

## Behaviour
- Each time the hero enters a found cat's range, the cat says hello again: full motion `['greet','headBump']` (1.8 s), then its found pose; reduced motion `['slowBlink']`. Freeze, hop and zoomies stay for the first find.
- Toast, new key `catHello`: EN `{x} says hi again! {n} of {total} found`; ES `¡{x} te saluda otra vez! Llevas {n} de {total} gatos`.
- No sound. Fires once per entry; re-arms only after the hero is more than `HIDDEN_RANGE + 4`° away or changes planet. Count, `p3d-cats` and Reset unchanged.

## Build (Sonnet)
1. `src/space/cats.js`: add `export function greetAgain(cat, { reducedMotion = false } = {})`: if `!cat.found || cat.anim` return false; else `cat.anim = { steps: reducedMotion ? ['slowBlink'] : ['greet','headBump'], i: -1, t: 0 }`, `nextStep(cat)`, return true. `collect` unchanged.
2. `src/space/game.js` `updateStops`: replace the hidden loop with a loop over all planets `q` and each `h` of `q.hidden`: `d = Math.abs(angDiff(state.angle, h.angle))`; `inside = q === p && d < HIDDEN_RANGE`; if `q !== p || d > HIDDEN_RANGE + 4` set `h.near = false`; if `inside && !h.found` run the existing first-find block and set `h.near = true`; else if `inside && !h.near` set `h.near = true` and, if `greetAgain(h.cat, { reducedMotion })`, call `ui.helloCat(h.cat.spec.name, state.found, total)`.
3. `src/ui.js`: `helloCat(name, n, total) { toast(t('catHello', { x: name, n, total })); }`.
4. `src/i18n.js`: both `catHello` strings.

## Test
Find one cat, reload, hold ArrowLeft and `window.__game.advance(0.1)` until past it: one `catHello` toast, `cat.anim` non-null, counter unchanged, `p3d-cats` length 1. Stand in range and `advance(5)`: no second toast. Walk out and back: fires again. An unfound cat still gives `catFound` n+1 with no hello after. Reduced motion: `['slowBlink']`. Reset still clears.

## Could break
Next/Back auto-walk passes cats (hello toasts may overlap a card opening); a hero spawning inside a found cat's range greets at load; chatty live region for screen readers; `greet` snaps to `tailUp` and back.
