# Portfolio 3D: Planets of Code

[![CI](https://github.com/soushiki/portfolio-3d/actions/workflows/ci.yml/badge.svg)](https://github.com/soushiki/portfolio-3d/actions/workflows/ci.yml)

A guided comic tour of my portfolio. Tinta, a tuxedo cat courier, walks between planets that sit in one line in space. Press Next to go from stop to stop; each planet opens a card with a short description, tags and links to the project. The list, Resume and Contact are always one click away on the cover and in the HUD, so the 3D tour is never the only way in.

The main portfolio stays at [sebherr.netlify.app](https://sebherr.netlify.app). This one links back to it from the cover.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes a static site to `dist/` (works on Netlify as-is).

## How this site is tested

Every push and pull request runs `npm ci`, `npm run build` and `npm test` on GitHub Actions (`.github/workflows/ci.yml`). The tests use Playwright (Chromium, software WebGL) against the Vite dev server on port 5071:

- **Smoke tests** (`tests/tour.spec.js`): the cover shows Start, the list button, Resume, Contact and this testing link; the guided tour opens each card in tour order; `?webgl=0` shows the plain list (tour items and earlier builds); `?lang=es` shows the Spanish labels.
- **Accessibility** (`tests/a11y.spec.js`): axe-core checks the cover, the plain list and the tour HUD with an open card, and fails on serious or critical violations.

Run them locally:

```bash
npm install
npx playwright install chromium
npm test
```

## Controls

| Action | Keyboard | Touch | Mouse |
| --- | --- | --- | --- |
| Walk | ← → or A D | Hold ◀ ▶ | — |
| Jump (on the star: fly to next planet) | Space, ↑, W | Jump | — |
| Next stop | Enter or N | Next ▶▶ | Next ▶▶ |
| Previous stop | B or Backspace | Back | Back |
| Fly to a planet | 0–6 | Strip dots | Strip dots |
| Project list | L | List | List |
| Close card / list | Esc | × | × |

## URL switches

- `?quality=low` forces the low-cost rendering preset.
- `?webgl=0` skips the 3D scene and shows the plain project list.
- `?lang=es` opens the Spanish version (the EN/ES toggle does the same).
- `?motion=reduce` turns off the flight arc, camera shake and idle animation, as if the system asked for reduced motion.

## Stack

Pinned exact versions: Vite 8.3.4, Three.js 0.186.1. All geometry is procedural; there are no model files.

| File | What it does |
| --- | --- |
| `src/space/game.js` | Scene loop, tour state, walking, jumping, flights and the camera. |
| `src/space/planets.js` | Builds the planets and their stops and hidden cats. |
| `src/space/hero.js` | Builds Tinta, the cat courier, and her animation state. |
| `src/space/route.js` | The order of stops on the tour. |
| `src/space/comic.js` | The comic shading: flat bands, halftone shadow, ink outlines. |
| `src/space/backdrop.js` | Sky, stars and the space background. |
| `src/space/input.js` | Keyboard and touch input for the tour. |
| `src/landmarks.js` | Procedural landmark models placed on the planets. |
| `src/ui.js` | Cover, HUD, cards, the project list and the no-WebGL fallback. |
| `src/i18n.js` | English and Spanish strings. |
| `src/data.js` | Project and contact content. Edit this to add or change projects. |
| `src/main.js` | WebGL check, quality settings, loading cover, lazy-loads the tour. |

## More

The design notes, art bible and build plan are in [docs/fable/](docs/fable/).
