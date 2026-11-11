# Planets of Code: art and world bible

Owner: Fable 5.2 (since 2026-11-10). Direction set by Sebastian: comic art in the spirit of Marvel Rivals' "2D mindset", planet-islands in space (concept only, borrowed from planetoid platformers), guided 2.5D movement, WCAG 2.1 AA over exploration. Everything below is original.

## 1. The one idea

**A comic book you walk through.** Each planet is one panel of an issue called *Planets of Code*. The cover is the loading screen, the cards are panels, and the visitor turns the page with **Next**. Bruno Simon's site is a free-roaming toy island seen from a chase camera; this is a side-on, left-to-right reading order in space.

## 2. Hero: Tinta

- An original tuxedo cat (black coat, white chest, muzzle and socks) in a space-courier kit: yellow scarf, red jet pack with two nozzles and an orange flame while airborne. Name: *Tinta* ("ink"), because the whole world is inked.
- Chibi proportions: the head is about 40% of the height, so it reads at 60 px tall on a phone. Big white comic eyes with ink pupils and a white glint; pink nose; cone ears with pink insides; curled tail with a white tip.
- Silhouette rule: ears, tail curl and jet pack must read as a black shape alone. No thin parts under 0.08 units.
- Poses: walk cycle (diagonal leg pairs), squash on landing, stretch on take-off, scarf flaps faster when walking. Facing: 3/4 toward the camera (yaw ±0.55 rad), never a pure profile.
- The **13 secret cats** are Sebastian's own cats (see §2b). They never block the route.
- Built in `src/space/hero.js` (`makeCat({ coat, gear })`).
- **Always on top:** Tinta is drawn in a second render pass after the world, on a cleared depth buffer (`heroScene` in `game.js`), so no landmark, planet or cat ever covers him; his own parts still sort by depth.

**Why a character and not a rocket or ship** (Sebastian left this choice to Fable, 2026-11-10): the guided movement has two halves, walking a planet's rim to each stop and hopping between planets. A walking character reads clearly on a curved rim (it stands upright, faces the landmark, stops beside it), while a rocket or ship would have to hover or orbit, which reads less clearly next to a landmark and hides it more. The jet pack already covers the flight half, so one model does both. It is cheap to animate: the walk is four leg rotations, take-off and landing are a squash/stretch of one group, and flight is the flame toggling on. A cat also ties the portfolio to its owner (13 cats, Whisker Gacha) and gives the 12 hidden cats a reason to exist. Cost: about 40 small meshes with outlines, fine on the low preset; if a phone pass shows otherwise, merge the hero's static meshes before changing the concept.

## 2b. The 13 secret cats

Modelled on Sebastian's cats from his photos (the photos stay in `D:\cats`; they are never copied into the repo or published). Likeness comes from coat colour, patches, tabby stripes, the white blaze, eye colour, size and fur length; shapes stay simple and comic. All in `src/space/cats.js`; model sheet at `?lineup=cats` (`&only=ash,oreo`, `&play=1` loops the collect animations).

| Cat | Coat | Idle (hiding) | Found reaction | End pose | Planet |
| --- | --- | --- | --- | --- | --- |
| Skipper | Sleek black tuxedo, long tail, yellow eyes | Sit | Freeze → greeting | Tail-up | 00 Hello |
| Ash | Solid blue-grey, soft fur | Loaf | Freeze → greeting → slow blink | Sit | 01 Minoscreto |
| Hazel | Warm grey-brown tabby (shared with Duly), brown bridge above the nose, white muzzle | Peek | Startle hop → greeting | Sit | 01 Minoscreto |
| Java | Brown mackerel tabby, green eyes | Loaf | Freeze → big stretch → greeting | Grooming | 02 Ingresos |
| Orange | Orange tabby and white, slim | Curled | Startle hop → zoomies lap | Tail-up | 02 Ingresos |
| Collie | Dark tortoiseshell, yellow eyes | Belly up | Freeze → greeting | Belly up (trust) | 03 Data |
| Duly | Small warm grey-brown tabby (shared with Hazel), white face | Sit | Startle hop → zoomies lap | Tail-up | 03 Data |
| Rosie | Dark tabby | Curled | Freeze → greeting | Kneading | 03 Data |
| Nara | White with a calico cap | Sit | Startle hop → greeting | Kneading | 04 Formato |
| Pelusa | Fluffy white and grey, grey eye patch | Loaf | Freeze → greeting → slow blink | Sit | 04 Formato |
| Charlie | Calico, mostly black, white blaze and paws | On its side | Freeze → dazed wobble → greeting | Sit | 05 Gacha |
| Panda | Chunky, white with Skipper's layout of black on the back, head and far eye; big white belly to the chin | Loaf | Freeze → greeting → head bump | Belly up (trust) | 05 Gacha |
| Oreo | White with Skipper's layout of black on the back, head and one eye; big white belly to the chin; black bracelet on her left front leg | On its side | Startle hop → dazed wobble | Sploot | 06 Contact |

Rules (updated 2026-11-11 from Sebastian's clarification): his photos give **only the looks**. Lying poses are for hiding (idle) at most. A found reaction is always caught → happy: a 0.3 s freeze (eyes wide, ears forward, head up) or a 0.45 s startle hop, then the **greeting** (1.1 s trot in place, tail straight up with a quivering tip, head tilt), the main "I'm happy" signal. Chaotic cats add **zoomies** (1.6 s sprint once around the planet, ears back, tail streaming) or a **dazed wobble** (1.4 s head circles, half-closed eyes). Never the arched "Halloween" back: that means fear. Belly up only as a relaxed end pose (trust). Under reduced motion every cat does a 0.8 s slow blink, then its end pose. Feedback: reaction + named toast ("Oreo found! 4 of 13 cats") + the list's "Secret cats" section; a trill sound is part of PLAN task 3. Real eye colours with slit pupils (the hero keeps comic white eyes, so he stays the lead).

### Cat fur and lines (2026-11-11)

- **Silhouette lines only.** Each silhouette part (body, head, muzzle, ears, legs, paws, tails) gets a hull; patches, stripes, chest, blaze, nose and pupils get none (`userData.outline = 0`). All cat and hero hulls are pushed 0.22–0.25 units away from the camera (`addOutlines(root, scale, { bias })`), so where two parts cross, the line hides behind the front part and only the outer silhouette is inked. The irises keep a thin feature line (`userData.outline = 0.5`). Chosen over one merged hull because the rig animates its parts; the depth push is the Guilty Gear Xrd "push inner backfaces away" idea applied per part.
- **Tufts carry no ink inside the body.** Each tuft is a fill-only card in the coat colour plus a slightly larger ink card pushed 0.22 units away from the camera, so the ink only shows past the silhouette (Sebastian's 2026-11-11 screenshot of Nara showed scribbles from inked tufts over the body).
- **Markings are painted, never raised.** Patches, caps, saddles, face masks and bracelets are painted onto the coat surface in the shader (`paint` in `cats.js`: blobs, half-spaces and bands, each with a ragged fur edge). Tufts on a painted area take its colour; the rim light follows the painted colour and is weaker on dark fur so black stays black. Coat fills keep at least 3:1 against the ink outline (grey-brown `#7A6E62` 3.65:1).
- **Every end pose must read as a whole cat from the camera** (head, body, legs and tail visible). Belly-up is on its back seen from the side; the head turns over with the body (upside down like the body, ears toward the floor, face forward), and pink toe-bean pads face up. A head that doesn't match the body's orientation looks wrong (Sebastian, 2026-11-11).
- **Fur.** Fur materials use a short soft ramp (`soft: 0.14`) and a rim light 55% toward paper in the coat's own colour. Jagged tuft cards (a five-spike clump with an ink edge, alpha-tested, no blending) sit on each part's side-view edge with the spikes pointing out: cheek ruff, back of the head, chest bib, back ridge and rump, ear tips, tail tip. Short-haired cats get about 20, long-haired cats (fluffy > 1.05: Ash, Pelusa) about 30 and 30% bigger; the low preset keeps every second tuft. Shell fur is not used; try it only after profiling on a real phone.

## 3. Palette

UI tokens (checked with `palette-check`, all WCAG 2.1 AA pairs pass in light and dark, preview in `docs/fable/palette-preview.html`):

| Role | Light (UI panels) | Dark (space) |
| --- | --- | --- |
| Text / ink | `#16122E` | `#FFF6E5` |
| Background / paper | `#FFF6E5` | `#1B1340` |
| Primary (buttons, links) | `#C41E3A` comic red | `#FF8FA3` |
| Secondary (tags, panels) | `#FFE7A8` | `#2A2060` |
| Accent | `#2456C9` | `#FFD23F` |

Contrast highlights: ink on paper 16.9:1, red link on paper 5.4:1, white on red 5.8:1. Links are always underlined.

Planet colours (fills only; text on them is always ink, 7.1:1 or better):

| Planet | Fill | Deep accent |
| --- | --- | --- |
| 00 Hello | `#FFF1C9` cream moon | `#FFD23F` |
| 01 Minoscreto | `#3FD0B6` teal | `#0F8F7E` |
| 02 Ingresos | `#8EDB5A` green | `#3C8D2F` |
| 03 Data science | `#5AA9FF` blue | `#2456C9` |
| 04 Formato Médico | `#FF7A6B` coral | `#C8102E` |
| 05 Whisker Gacha | `#FF8FC7` pink | `#A23C8E` |
| 06 Contact | `#FFD23F` yellow | `#E0A100` |

Rule: **planet colour is the label** (colour = project), repeated on the strip dot, the card's top band and the list card's top border. Never rely on colour alone: every place also shows the number and name.

## 4. Outline and shading rules

- **Two flat bands**: lit colour and a shadow colour made by multiplying the base by a cool violet `(0.58, 0.50, 0.86)`. No gradients, no PBR, no scene lights. One fixed key light from the upper left, in view space, so every frame reads the same.
- **Highlight band**: a thin, lighter band where the surface faces the light most.
- **Halftone**: screen-space dots (7 CSS px cell, 45°) inside the shadow band, growing as the surface turns away. This is the always-on visual signature.
- **Ink outlines**: inverted hull, constant on-screen width. Hero 1.5×, planets 1.3×, landmarks 1×, hidden cats 1.1×. Hard-edged meshes get welded, smoothed hull normals so corners don't tear.
- **Ink rim**: a darker rim on the shadow side so silhouettes stay crisp against space.
- Transparent and double-sided parts (glass, dishes) get no outline.
- All of this is `src/space/comic.js`. New models use `comicMaterial(hex)` and `addOutlines(group, scale)`; nothing else.

## 5. Planets

Planets sit left to right on a gentle wave, all in the z = 0 plane. Each has: a shape that names it, one landmark on top, a star launch pad on its right shoulder (30–35°), a banner with number and name, and two sleeping cats underneath.

| # | Planet | Shape language | Landmark | Why it fits |
| --- | --- | --- | --- | --- |
| 00 | Hello | Cream moon with craters | Rocket-shaped cat tree with a round window and a pennant | Tinta's home base and the tour's start |
| 01 | Minoscreto | Cut gem (faceted icosahedron) | Bank vault door with a spinning wheel | Privacy: a locked crystal |
| 02 | Ingresos App | Smooth green world wrapped in a receipt-paper ribbon | Bank with columns and a coin stack | Bookkeeping, receipts, money |
| 03 | Data science | Big blue cratered world (radius 11, others 6–7.5) | Hub: live bar chart with a trend arrow; then mailbox (A/B email), wind turbine (grid demand), street clock (311 delays) | One group, four stops, so it is bigger |
| 04 | Formato Médico | Two-tone capsule pill (coral and white), tilted | Clinic with a red cross | Medical paperwork |
| 05 | Whisker Gacha | Gacha capsule (pink top, white bottom, seam band) | Cat-eared capsule machine | His cat gacha game |
| 06 | Contact | Yellow moon | Radio beacon with a dish and a speech bubble | "Say hi" |

## 6. Space backdrop

One full-screen shader (`src/space/backdrop.js`): violet-to-ink gradient, halftone nebula blobs in pink and cyan, three parallax layers of four-point ink stars, and one small dimmed ringed planet far away (kept small so it never reads as a stop). Parallax follows the camera slowly; twinkle stops under reduced motion.

## 7. Type

- Display: **Bangers** (Google Fonts, OFL) for titles, the cover, buttons that act like sound effects (Next, Jump), planet banners. Never for body text.
- Body: **Outfit** 400–700 at 16 px minimum, line height 1.5.

## 8. Project selection

Aim: junior QA, data and developer roles in Colombia, written/async work. The tour shows real problems solved with real users or real data; course projects go to the plain list.

**Tour order** (strongest first, ending on contact):

| Stop | Project | Reason |
| --- | --- | --- |
| 00 | Hello (intro card) | Who he is, resume and LinkedIn before any project. |
| 01 | Minoscreto | Live demo, tests (Vitest), privacy by design: shows dev and QA thinking in one click. |
| 02 | Ingresos App | Real business problem, Python + OCR + local AI to Excel: data and automation. |
| 03 | Data science hub + 3 projects | Strongest material for data roles: honest evaluation, decisions with numbers. |
| 03a | Email Uplift Test | A/B testing and a clear business decision. |
| 03b | GB Demand Forecast | Time series against an official benchmark, honest about where it lost. |
| 03c | NYC 311 Delays | Reframed a misleading target: careful, QA-minded data work. |
| 04 | Formato Médico | Real user (a physician), web + Android from one codebase, exact PDF output. |
| 05 | Whisker Gacha | Personality and game logic (pity, rates); a fun last stop that matches the theme. |
| 06 | Contact | LinkedIn, resume, GitHub. |

**Plain list only ("Earlier builds")**:

| Project | Reason |
| --- | --- |
| Brasa Food & Drinks | Static landing prototype; less depth than the tour projects. |
| Da Vinci Diary | Course-style notes app; auth + Firebase is common at junior level. |
| NASA APOD | Small API demo. |
| Gym Routine Generator | Course project based on someone else's data. |
| Todo App | Tutorial-level CRUD. |
| Reddit Plus | Course project (Redux client), no live demo. |
| Jammming | Course project, no live demo. |

## 9. UX and UI

### Loading and onboarding
- The loader is the **comic cover**: issue badge, title, one-line promise, an ink progress bar with real steps (fonts, engine, planets), then **Start the tour**.
- The skip paths are on the cover from the first paint, before WebGL loads: **Just show me the projects**, **Resume**, **Contact**, **Simple portfolio**, plus a skip link as the first Tab stop.
- After Start, Tinta walks by itself to the Hello stop and its card opens; the card says "press Next". The controls hint is on the cover; a first-visit caption is task 8 in PLAN.md.

### Controls
| Action | Keyboard | Touch | Mouse |
| --- | --- | --- | --- |
| Walk | ← → or A D | Hold ◀ ▶ | — |
| Jump | Space, ↑, W | Jump | — |
| Hop to the next / previous planet | Hold Space for 0.6 s on the right / left star | Hold Jump on a star | — |
| Next stop | Enter or N | Next ▶▶ | Next ▶▶ |
| Previous stop | B, P, Backspace or Shift+Enter | Back | Back |
| Fly to a planet | 0–6 | Strip dots | Strip dots |
| Project list | L | List | List |
| Close card / list | Esc | × | × |

Keys never fire while a link or button has focus (Enter and Space belong to it). After Start, focus moves to the scene so Space jumps and Enter goes on.

### HUD and cards
- Top: name, the **planet strip** (numbered dots in planet colours, current one ringed and marked `aria-current`), then List, Resume, Contact, EN/ES.
- Bottom right: **Back** and **Next: <stop name>** (phones show "Next" and keep the full name as the accessible label). Bottom left on touch: ◀ ▶ and Jump.
- Card = comic panel: thick ink border, ink top bar with the planet colour band, offset shadow, title in Bangers, tags as pills, first link (Live or Case study) as the red primary button. It pops in (scale + slight rotate) and is announced in a polite live region; it never steals focus.
- Desktop: card on the right, camera shifts so the planet sits in the free space. Phones and tablet portrait: bottom sheet above the controls. Short screens: card on the right, slim HUD.

### Skip-the-game path
The list dialog (also the no-WebGL fallback) has Resume, LinkedIn, GitHub and Simple portfolio at the top, then "On the tour" (with **Fly there**) and "Earlier builds". Focus is trapped while it is open, Esc closes it and returns focus.

### Language, fallbacks, motion
- EN/ES toggle unchanged (reloads with `?lang=`). All new strings are in `src/i18n.js`.
- No WebGL or a start error: the list is the page.
- `prefers-reduced-motion` (or `?motion=reduce`): no flight arc (a short fade "panel cut" instead), no camera roll or shake, no twinkle or idle animation, no speed lines, no card pop.

### Responsive
Phone ≤ 600 px, tablet 601–1024 px (portrait gets the bottom sheet), short screens `max-height: 500px`, sizes in `dvh`/`svh`, safe-area insets. The camera reads the real HUD, card and control rectangles every frame and fits the planet into what is left.

## 10. Playability

- **Core loop**: arrive → walk (or auto-walk) to the stop → card pops → read, click Live/Code → Next → hop → land. A recruiter can press Enter ten times and see every project, or click a strip dot or a list item to fly straight there.
- **Gravity**: the hero's position is one number (angle on the rim) plus a height; jumping is a radial jump with gravity toward the centre. No physics engine.
- **Hops**: a fixed Bezier arc between planets, 0.8–1.7 s with ease-in-out and one flip; the camera follows and zooms out. Every planet has two star pads: the right one hops forward, the left one back. Holding Space or Jump on a star for 0.6 s crouches Tinta and grows the star, then hops; letting go early cancels. Under reduced motion a hop is a small jump in place, then a panel cut.
- **Camera**: side-on, field of view 32°, distance fitted to the planet and the free screen area, slight roll toward the hero on the upper arc (never under reduced motion).
- **Juice (2–3 channels, scaled to the event)**: jump = stretch + squash; card = panel pop + live-region announcement; hop = speed lines + flame + flip; landing = squash + ink ring + 0.3 s shake; hidden cat = toast + cat bounce. Sound and vibration are tasks 3 and 4.
- **Easter eggs**: 12 sleeping cats on the planet undersides, counted in a toast. Never needed for anything.

## 11. Performance budget

- One draw pass, no post-processing, no shadows, no textures except the banner canvases. The game chunk is about 157 KB gzipped (Three.js); Rapier is no longer imported.
- Low preset (touch, small screen, ≤ 4 cores, or `?quality=low`): pixel ratio ≤ 1.5, no antialiasing, fewer stars, fewer sphere segments.
