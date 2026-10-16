# Portfolio 3D

A driving-game version of my portfolio, inspired by [bruno-simon.com](https://bruno-simon.com/). Drive a small car around a low-poly world; each glowing pad on the ring road is a project, and driving onto one opens a card with a description, tech tags and Live/Code links.

The main portfolio stays at [sebherr.netlify.app](https://sebherr.netlify.app). This one links back to it from the loading screen and the HUD.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes a static site to `dist/` (works on Netlify as-is).

## Controls

- **Keyboard:** WASD or arrow keys to drive, Space to brake, R to reset the car.
- **Touch:** on-screen buttons (shown on touch devices).
- **All projects** (top right) lists every project, with a "Drive there" shortcut.

## Stack

Pinned exact versions: Vite 8.3.4, Three.js 0.186.1, Rapier (`@dimforge/rapier3d-compat` 0.21.0). All geometry is procedural; there are no model files.

| File | What it does |
| --- | --- |
| `src/data.js` | Project and contact content. Edit this to add or change projects. |
| `src/main.js` | WebGL check, quality settings, loading screen, lazy-loads the game. |
| `src/game.js` | Renderer, lights, physics loop, chase camera, zone detection. |
| `src/world.js` | Ground, roads, pads, signs, trees, rocks and knockable crates/cones. |
| `src/car.js` | Arcade car: a Y-only dynamic body driven by velocity. |
| `src/input.js` | Keyboard and touch buttons. |
| `src/ui.js` | Overlay card, project list and fallback. |
| `src/signs.js` | Canvas textures for the signboards. |

## Quality and fallbacks

- Touch devices, small screens and machines with 4 or fewer CPU cores get the low preset: no shadows, no antialiasing, capped pixel ratio, fewer trees and props.
- `?quality=low` or `?quality=high` forces a preset.
- Without WebGL (or with `?webgl=0`) the page shows a plain list of every project and link instead.
- Without JavaScript, a `<noscript>` message links to the simple portfolio.
