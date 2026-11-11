# Planets of Code: plan

Owner: Fable 5.2. Branch: `fable-redesign`. Design: [ART-BIBLE.md](ART-BIBLE.md). State: [STATE.md](STATE.md).

## Design decisions (short)

1. **A guided comic tour, not a free island.** Planets in one plane, read left to right; the visitor presses Next. The 3D world is never the only path: the list, resume and contact are on the cover and the HUD.
2. **Hero: Tinta**, an original tuxedo cat courier. 12 more cats hide on the planets.
3. **Comic shading in one place** (`src/space/comic.js`): two flat bands, halftone in the shadow, ink outlines, a fixed light. No scene lights, no textures, no post-processing.
4. **Seven planets**: Hello, Minoscreto, Ingresos, Data science (4 stops), Formato Médico, Whisker Gacha, Contact. Seven course projects go to "Earlier builds" in the list only.
5. **No physics engine.** Movement is an angle on a circle plus a radial jump; hops are a fixed arc. Rapier is dropped (task 1 removes the package).
6. **Accessibility first**: keyboard for everything, focus never stolen, live-region announcements, reduced-motion cuts, AA palette, the list as a real dialog and as the fallback.
7. **Procedural models only**, no model files: the hero, planets and landmarks are built in code and cost no download.

## How to run and check

```bash
npm install
npm run dev
```

The preview config `.claude/launch.json` serves on http://127.0.0.1:5071. Useful URLs: `?quality=low`, `?webgl=0` (fallback list), `?lang=es`, `?motion=reduce`. In dev, `window.__game.advance(seconds)` steps the simulation without animation frames (a hidden browser tab barely runs them), and `__game.next(1)` / `__game.travelTo(i)` drive the tour.

Every task ends with `npm run build` passing and a browser check at desktop, phone (375 × 812), phone landscape (812 × 375) and tablet (768 × 1024).

## Build tasks for other models

Rules for every task: work on `fable-redesign`, pin exact versions, don't change the design (colours, layout, route, shading). If something in the design looks wrong, write it under "Questions for Fable" in STATE.md instead of changing it. Commit each task separately; never push or deploy.

### 1. Remove the old driving game
- **model:** Haiku · **difficulty:** easy · **time:** 15 min
- **Files:** delete `src/game.js`, `src/world.js`, `src/car.js`, `src/carStyle.js`, `src/input.js`, `src/signs.js`, `src/textures.js` and `public/models/`. Keep `src/landmarks.js` (the planets use it). Remove `@dimforge/rapier3d-compat` from `package.json`, then run `npm install`.
- **Steps:** 1) Run `grep -rn "rapier\|world.js\|car.js\|signs.js\|textures.js" src` to confirm only the files above use them. 2) Delete them. 3) Edit `package.json`. 4) `npm install`. 5) `npm run build`.
- **Accept:** build passes; `grep -rn rapier src package.json` finds nothing; the tour still works in the browser.

### 2. Rewrite the README for the tour
- **model:** Haiku · **difficulty:** easy · **time:** 20 min
- **Files:** `README.md`.
- **Steps:** Replace the driving text with: one paragraph on the tour; run commands; the controls table from ART-BIBLE.md §9; the URL switches from "How to run and check" above; a file table for `src/space/*`, `src/landmarks.js`, `src/ui.js`, `src/i18n.js`, `src/data.js`; link to `docs/fable/`.
- **Accept:** no mention of driving, cars, Rapier or Kenney models; every file in the table exists.

### 3. Sound effects, off by default
- **model:** Sonnet · **difficulty:** medium · **time:** 60 min
- **Files:** new `src/space/sound.js`; `src/space/game.js`, `src/ui.js`, `index.html`, `src/i18n.js`, `src/style.css`.
- **Spec:** Web Audio synth only (no audio files). Sounds: card pop (short square blip, 660→880 Hz, 80 ms), jump (sine slide up, 120 ms), hop whoosh (filtered noise, 400 ms), landing thud (sine 90 Hz, 120 ms), hidden-cat meow (two sine glides). A HUD toggle button "Sound: off/on" (`aria-pressed`) next to EN/ES; the choice is saved in `localStorage` (wrapped in try/catch). Create the AudioContext only on the first toggle-on click.
- **Accept:** silent until switched on; each event plays its sound once; no console errors when `localStorage` throws; reduced motion doesn't change sound.

### 4. Haptics on touch devices
- **model:** Haiku · **difficulty:** easy · **time:** 10 min
- **Files:** `src/space/game.js`.
- **Spec:** `navigator.vibrate?.(12)` on jump, `navigator.vibrate?.(25)` on landing after a hop, only when `isTouch` and not `reducedMotion`.
- **Accept:** no errors on desktop browsers that lack `navigator.vibrate`.

### 5. Hidden cats: 12, with a reaction and a counter
- **model:** Sonnet · **difficulty:** medium · **time:** 45 min
- **Files:** `src/space/planets.js`, `src/space/game.js`, `src/ui.js`, `src/i18n.js`, `index.html`.
- **Spec:** 1) Exactly 12 hidden cats: one on Hello and one on Contact (angle 270°), two on each other planet (245°, 300°). 2) On find: the cat stretches up (`cat.anim.squash = -0.6`, already there), then three small heart sprites (canvas texture, `#FF8FA3` with ink outline) float up 1.5 units over 0.8 s and fade; under reduced motion show the hearts without movement for 0.8 s. 3) The list dialog shows "Cats found: n of 12" under its title. 4) Found cats persist in `localStorage` key `p3d-cats` (array of ids `planetId:angle`), wrapped in try/catch.
- **Accept:** walking under every planet finds 12 cats; reload keeps the count; the route and the cards are unaffected.

### 6. Recolour the reused landmarks to the comic palette
- **model:** Sonnet · **difficulty:** easy · **time:** 30 min
- **Files:** `src/landmarks.js` (only the builders used on planets: `vault`, `bank`, `hospital`, `gachaMachine`, `mailbox`, `windTurbine`, `streetClock`).
- **Spec:** replace these hex values everywhere in those builders: `#F4F1EA`→`#FFF6E5`, `#F2E9E4`→`#FFF6E5`, `#FBF7F5`→`#FFFFFF`, `#D9D4CC`→`#E8D9BE`, `#5C6B7A`→`#3A3557`, `#22223B`→`#16122E`, `#2F3542`→`#16122E`, `#3B3F55`→`#3A3557`, `#9AA3AF`→`#B8B3D9`, `#C9CED6`→`#DCD8F0`, `#6B7280`→`#7B74A6`, `#9A8C98`→`#7B74A6`, `#7FB3D5`→`#5AA9FF`, `#D64545`→`#E63946`, `#E05A6B`→`#FF5D8F`, `#3E6A8A`→`#2456C9`, `#2F5C73`→`#1D4A9E`, `#2F6F5E`→`#0F8F7E`, `#E0B54A`→`#FFD23F`, `#E8743B`→`#FF8A3D`, `#5A4636`→`#6B4A3A`.
- **Accept:** screenshots of planets 01–05 show no grey-blue suburb colours; the old builders not used on planets are untouched.

### 7. Tap to walk on touch
- **model:** Sonnet · **difficulty:** medium · **time:** 40 min
- **Files:** `src/space/game.js`.
- **Spec:** a `pointerup` on the canvas (no drag beyond 10 px, not on a button) casts a ray from the camera to the plane z = 0; if the point is within `radius + 3` of the current planet's centre, set `state.mode = 'auto'` and `state.autoTarget` to the angle of that point (degrees, 0–360). Ignore taps during a flight.
- **Accept:** tapping a landmark walks Tinta there and opens its card; tapping empty space does nothing.

### 8. First-visit controls caption
- **model:** Haiku · **difficulty:** easy · **time:** 20 min
- **Files:** `index.html`, `src/ui.js`, `src/i18n.js`, `src/style.css`.
- **Spec:** after Start, show a `.caption` at the bottom left (above the controls) with `hintKeys` or `hintTouch` (by `is-touch`). Hide it on the first walk, jump or Next, or after 8 s. Show it only once per browser (`localStorage` key `p3d-hint`, try/catch).
- **Accept:** shows on the first visit only; never covers the Next button at 375 px wide.

### 9. Keyboard help dialog
- **model:** Haiku · **difficulty:** easy · **time:** 25 min
- **Files:** `index.html`, `src/ui.js`, `src/i18n.js`, `src/style.css`.
- **Spec:** `?` key or a small "?" HUD button opens a dialog styled like the list (same focus trap and Esc) with the controls table from ART-BIBLE.md §9, in both languages.
- **Accept:** opens and closes by keyboard; focus returns to where it was.

### 10. Accessibility audit with axe
- **model:** Sonnet · **difficulty:** medium · **time:** 45 min
- **Files:** any UI file the audit points to; a short report in `docs/fable/a11y-2026-11.md`.
- **Steps:** run `npx -y @axe-core/cli@4.10.2 http://127.0.0.1:5071/?webgl=0` and on the tour after Start (use the browser's axe if the CLI can't drive it). Fix serious and critical issues that don't change the design; list the rest.
- **Accept:** 0 serious/critical issues on the list page and the tour HUD; report written.

### 11. Smoke test with Playwright
- **model:** Sonnet · **difficulty:** medium · **time:** 60 min
- **Files:** new `tests/tour.spec.js`, `playwright.config.js`, `package.json` (devDependency `@playwright/test` pinned to an exact version, script `"test": "playwright test"`).
- **Spec:** start the dev server from the config; tests: 1) cover shows Start, list button, resume and contact links; 2) after Start, calling `__game.advance` and `__game.next(1)` in order shows the card titles in tour order (Hello → Minoscreto → Ingresos App → Data Science Portfolio → Email Uplift Test → GB Demand Forecast → NYC 311 Delays → Formato Médico → Whisker Gacha → Say hi); 3) `?webgl=0` shows the list with 10 tour items and 7 earlier builds; 4) `?lang=es` shows "Empezar el recorrido".
- **Accept:** `npm test` passes twice in a row.

### 12. Netlify cache headers and social image
- **model:** Haiku · **difficulty:** easy · **time:** 20 min
- **Files:** `netlify.toml`, `index.html`, `public/og.png`.
- **Spec:** add `[[headers]]` for `/assets/*` with `Cache-Control = "public, max-age=31536000, immutable"`. Take a 1200 × 630 screenshot of the Data science planet with its card closed, save it as `public/og.png`, and add `og:title`, `og:description`, `og:image` meta tags (English text from `docTitle`/`docDesc`).
- **Accept:** `npm run build` copies `og.png` to `dist/`; the headers block is valid TOML.

### 13. Card tilt toward the pointer
- **model:** Sonnet · **difficulty:** medium · **time:** 30 min
- **Files:** `src/ui.js`, `src/style.css`.
- **Spec:** on desktop only (`(hover: hover) and (pointer: fine)`), the open card tilts up to 4° toward the pointer with `transform: perspective(800px) rotateX() rotateY()`, easing back on leave. Off under reduced motion. Text must stay crisp (no tilt while a link is focused).
- **Accept:** no tilt on touch or reduced motion; links remain clickable.

### 14. CI for this repo and a "How this site is tested" link
- **model:** Sonnet · **difficulty:** medium · **time:** 45 min (after tasks 10 and 11)
- **Files:** new `.github/workflows/ci.yml`, `README.md`, `index.html`, `src/i18n.js`.
- **Spec:** on push and pull request: `npm ci`, `npm run build`, install Playwright browsers, `npm test` (task 11 tests plus an `@axe-core/playwright` check of the cover and the list, pinned exact versions). Add the workflow badge to the README. On the cover, add a small link "How this site is tested" / "Cómo se prueba este sitio" to the README's testing section on GitHub.
- **Accept:** the workflow passes on a push to `fable-redesign` (Sebastian pushes); the link opens the README section.
- **Why:** research-projects-2026-11-10.md §2: tested accessibility on a 3D site is QA evidence in itself.

## Tasks Fable keeps (design-heavy)

- **F1. Hero polish:** blink, ear twitch, a wave when a card opens, anticipation crouch before a hop, landing dust puffs.
- **F2. Data planet layout:** check the four stops on a real phone; adjust angles, landmark scale or planet radius so all four read clearly.
- **F3. Hop polish:** a short trail of ink marks behind Tinta, a stronger landing on the last planet.
- **F4. Real-device performance pass:** measure on a mid-range Android with `?quality=low`; if under 50 fps, merge static landmark meshes per planet and drop hidden-cat outlines first.
- **F5. Review page:** update the review artifact and its local copy after each pass.

## Answers from Sebastian (2026-11-10)

1. The copy "junior QA, data and developer roles" stays.
2. The hero stays *Tinta*.
3. Resume: a direct PDF. `public/resume/Sebastian-Herrera-resume-en.pdf` and `-es.pdf` are copies of `D:\Claude\job-applications\Sebastian-Herrera-developer-en.pdf` / `-es.pdf`. When he updates his resume, copy the new PDFs over these two files.

## Ownership

Sebastian (2026-11-10): the portfolio is Fable's own, and Fable oversees its evolution from now on. Each pass: read STATE.md, pick the next work, update STATE.md and the review page.
