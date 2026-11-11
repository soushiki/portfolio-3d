# Planets of Code: state

Owner: Fable 5.2 (since 2026-11-10). Branch `fable-redesign` (not pushed, not deployed; Sebastian pushes and deploys). Last pass: 2026-11-10.

- Design: [ART-BIBLE.md](ART-BIBLE.md) · Tasks: [PLAN.md](PLAN.md) · Research: [research-2026-11-10.md](research-2026-11-10.md)
- Review page (private artifact, Fable updates it each pass): https://claude.ai/artifact/1YWqA9Av7PJVXP2WHfpBBF · local copy [review.html](review.html) with [shots/](shots/)
- Palette check preview: [palette-preview.html](palette-preview.html) (realtimecolors: https://www.realtimecolors.com/?colors=16122e-fff6e5-c41e3a-ffe7a8-2456c9&fonts=Inter-Inter)
- Dev server: `.claude/launch.json` → http://127.0.0.1:5071

## Verified working (browser, 2026-11-10)

- `npm run build` passes; the game chunk is about 157 KB gzipped and no longer contains Rapier.
- Cover loads with no console errors; Start, "Just show me the projects", Resume, Contact and Simple portfolio work before the 3D has loaded.
- Tour order by `__game.next(1)`: Hello → Minoscreto → Ingresos → Data hub → Email → GB Demand → NYC 311 → Formato Médico → Whisker Gacha → Say hi. Cards open on arrival, close on leaving, respect ×.
- Hops between planets (arc, flip, speed lines, landing ring) and `travelTo` jumps across several planets.
- Hero stops left of each landmark and faces it (doesn't hide the landmark).
- Camera fits the planet into the space left by the HUD, the card and the controls: desktop 800 × 600 and 1000 × 640, phone 375 × 812, phone landscape 812 × 375, tablet 768 × 1024.
- List dialog: tour and "Earlier builds" sections, tag pills, Fly there. `?webgl=0&lang=es` shows the Spanish fallback list.
- `?motion=reduce&quality=low`: Next cuts straight to the next planet with a fade.
- Palette: all WCAG 2.1 AA checks pass in light and dark; ink on every planet colour ≥ 7.1:1.

## Tried and failed (and why)

- **Testing in the hidden browser pane with real time:** `requestAnimationFrame` barely runs while the pane is hidden, so waits showed stale frames. Fixed for testing with the dev-only `__game.advance(seconds)`, which steps the simulation and renders. Screenshots can still show the frame before the last render; take a second screenshot.
- **First version of the frame loop:** a negative first-frame `dt` (rAF time earlier than `performance.now()` at Start) sent the camera to NaN and the screen went flat orange. `dt` is now clamped to 0–0.05 s.
- **Hero on the stop angle:** it stood in front of the landmark and hid it. Stops now have a `stand` angle 2.6 units to the left.
- **Big ringed planet in the backdrop:** read as a stop on the route. Now small, dimmed and in the top-left.

## Not tried yet / next

1. PLAN.md tasks 1–13 for Haiku/Sonnet (start with 1: remove the old driving files and Rapier).
2. Fable F1–F5: hero polish (blink, wave, crouch, dust), data planet layout on a real phone, hop polish, real-device performance on a mid-range Android, update the review page.
3. Not checked yet: keyboard-only pass through the whole tour in a visible tab, screen reader announcements, real touch input on a phone, frame rate on a phone, the hero close-up image for the review page (the pane was too small).
4. Answers from Sebastian (PLAN.md "Questions for Sebastian"): job-target copy, hero name, resume PDF vs HTML.
5. The old driving files (`src/game.js`, `world.js`, `car.js`, …) and `public/models/` are still in the repo, unused.

## Questions for Fable

(Other models: write questions about the design here instead of changing it.)
