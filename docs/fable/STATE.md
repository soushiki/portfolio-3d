# Planets of Code: state

Owner: Fable 5.2 (since 2026-11-10; Sebastian: "the portfolio is its own", Fable oversees its evolution). Branch `fable-redesign` (not pushed, not deployed; Sebastian pushes and deploys). Last pass: 2026-11-10.

- Design: [ART-BIBLE.md](ART-BIBLE.md) · Tasks: [PLAN.md](PLAN.md) · Research: [research-2026-11-10.md](research-2026-11-10.md), [research-projects-2026-11-10.md](research-projects-2026-11-10.md)
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

- 2026-11-11 (Fable, browser checks at 375 × 812 with touch emulation, `?motion=reduce`, desktop in Chrome): touch Jump lifts Tinta; holding Jump/Space on the right star hops forward, on the left star hops back, a short hold cancels; B goes back a stop; reduced motion does a small hop then the cut; phone controls sit 72 px above the bottom and desktop Next ends left of the badge corner. 13 secret cats render on the planets; finding Charlie plays the collect animation, sets the found pose and shows "Charlie found! 1 of 13 cats".

- 2026-11-11: PLAN task 5 (Sonnet) merged and checked: found cats saved in `p3d-cats`, list section "Secret cats" with found count and names, reset button. Cat reactions checked: Orange hops, runs a zoomies lap (moved about 15 units) and ends tail-up; mid-sequence frames in Chrome show the greeting trot with tail up and the dazed wobble.

- 2026-11-11, phone "teleport" report: reproduced mobile conditions (375 × 812, touch, `?quality=low`, 15 fps stepping). The hop runs: 1.73 s in flight, at most 29 px per frame, hero about 22 px tall. Low preset, dt clamping, the Next button path and the camera were ruled out. Most likely cause on his phone: the browser reports `prefers-reduced-motion: reduce` (Android "Remove animations" or a battery saver), which correctly swaps the hop for a cut. Not confirmed on his device yet: ask him to open the live site with `?debug=1` after the next deploy. Added: an "Animations: full / reduced" toggle (cover and list dialog, saved as `p3d-motion`) that overrides the OS setting; a trailing camera during hops (hero travel on a phone 120 → 163 px); `?selftest=hop` (passes the flight, fails the cut with `&motion=reduce&assert=flight`).

- 2026-11-11, fur and outlines: silhouette-only hulls with a depth push (no inner lines on cats or hero), soft ramp + coat rim light, jagged tuft cards on the silhouette. Checked on the lineup in a visible Chrome tab. Hop selftest still passes (1.73 s). Cost: 830 cat meshes in total incl. hulls on the low preset (168 tufts); desktop low preset 83 fps. Not yet measured on a real phone.

## Tried and failed (and why)

- **Testing in the hidden browser pane with real time:** `requestAnimationFrame` barely runs while the pane is hidden, so waits showed stale frames. Fixed for testing with the dev-only `__game.advance(seconds)`, which steps the simulation and renders. Screenshots can still show the frame before the last render; take a second screenshot.
- **First version of the frame loop:** a negative first-frame `dt` (rAF time earlier than `performance.now()` at Start) sent the camera to NaN and the screen went flat orange. `dt` is now clamped to 0–0.05 s.
- **Hero on the stop angle:** it stood in front of the landmark and hid it. Stops now have a `stand` angle 2.6 units to the left.
- **Big ringed planet in the backdrop:** read as a stop on the route. Now small, dimmed and in the top-left.

- **Touch Jump did nothing in a test:** `setPointerCapture` threw for the pointer and aborted the handler before the jump. Now wrapped in try/catch. On a real phone the other likely cause is the OS "remove animations" setting (reported as reduced motion), which used to skip the hop entirely; it now shows a small hop.
- **Judging cat poses in the built-in pane:** the pane was about 418 px wide; use Claude in Chrome on localhost for model checks.

- **GIF motion study:** GIPHY in the hidden built-in pane showed static thumbnails behind a cookie banner; nothing to study. Use a visible Chrome tab next time.

- **Phone checks that only read `state.mode`:** they said "flight" while the user saw a teleport. Visual checks must measure on screen (hero pixel size, per-frame jump); `?selftest=hop` does that now.

- **Tufts as camera-facing sprites:** they sat inside the head and showed as white "teeth" on the cheeks. Replaced with flat cards on each part's side-view edge, spikes outward.

## Not tried yet / next

0. Cat reactions follow Sebastian's clarification (looks from photos only, dynamic caught → greeting → end pose; zoomies and dazed wobble for chaotic cats). Next: study the GIF references in a visible Chrome tab and tune the `STEPS` durations; add the trill sound with PLAN task 3.
0b. Profile the cats on a real phone (`?debug=1` shows fps). If under 50 fps: merge each cat's static meshes and tufts into one geometry per part, or drop tufts on cats off screen.
1. PLAN.md tasks 3–14 for Haiku/Sonnet (start with 3 or 6). Tasks 1–2 done 2026-11-10 by Haiku (old driving files, Rapier and Kenney models removed; README rewritten), checked by Fable: build passes, full tour runs with no console errors.
2. Fable F1–F5: hero polish (blink, wave, crouch, dust), data planet layout on a real phone, hop polish, real-device performance on a mid-range Android, update the review page.
3. Not checked yet: keyboard-only pass through the whole tour in a visible tab, screen reader announcements, real touch input on a phone, frame rate on a phone, the hero close-up image for the review page (the pane was too small).
4. Sebastian answered all three questions (PLAN.md "Answers from Sebastian"); the resume links now serve the PDFs in `public/resume/` (checked: EN/ES links, HTTP 200, application/pdf).
6. Project research and a scan of his other repos: [research-projects-2026-11-10.md](research-projects-2026-11-10.md). Top item for Sebastian: the public `ingresos-app` repo shows a real receipt number and amount in its README.

## Questions for Fable

(Other models: write questions about the design here instead of changing it.)
