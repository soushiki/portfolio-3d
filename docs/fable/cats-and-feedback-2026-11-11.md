# Owner feedback and cat brief (2026-11-11)

## Bugs and changes he asked for

1. **No way back by keyboard.** You can't return to the previous planet with the keyboard. Add a back control (for example ← / A / Backspace, plus a visible "Back" button) and make every move reachable without a mouse.
2. **Jump by holding Space.** Each planet gets a launch side, a marked spot on the planet's edge facing the next (and previous) planet. Standing there and holding Space charges and launches the jump to that planet. Keep the Next/Back buttons for anyone who doesn't want to hold a key, and for touch and accessibility.
3. **The jump animation doesn't work on phones.** Find out why (the low preset, reduced motion, the touch path or the frame loop) and fix it. Check it at phone size in a visible tab or with `__game.advance`, and say how you checked.
4. **Netlify badge.** Every Netlify deploy shows a "Powered by Netlify" badge fixed to the bottom right (about 210 × 50 px, plus a margin). His screenshot shows it covering the red button next to "Back". Keep the bottom-right corner clear on every screen size (safe area about 230 × 70 px from the bottom-right edge), or move the controls. Note it as a standing rule in PLAN.md for every Netlify site.

## Secret cats: his 13 real cats

Reference photos are in `D:\cats` (read them as images; don't copy them into the repo or publish them):
`ash`, `charlie`, `collie` (+ `collie2`), `duly`, `hazel`, `java`, `nara`, `orange`, `oreo`, `panda` (+ `panda1`), `pelusa`, `rosie`, `skipper` (+ `panda and skipper`). `reunion.jpg` is a group photo.

What he wants:
- Redesign each secret cat to look like his real cat: coat colour and pattern, eye colour, face markings, ear and tail shape, body size and fur length. Keep the comic style and simple low-poly shapes; the likeness comes from the markings and colours.
- Before a cat is collected it uses its idle pose. When collected, it plays a short animation, then stays in a different pose that shows it was found.
- Give each cat its own pose, matching its personality in the photo where you can tell.

Real cat poses to pick from (common cat body language, a starting list):

| Pose | What it looks like | Good as |
| --- | --- | --- |
| Loaf | Sitting with paws tucked under the body, a compact rectangle | Idle |
| Sit with tail wrap | Upright, tail curled around the front paws | Idle |
| Peek | Only head and ears showing from behind a rock or crater | Idle (hidden) |
| Curled sleep | A ring, nose tucked into the tail | Idle |
| Sploot | Belly down, back legs stretched straight behind | Collected |
| Big stretch | Front legs forward, rear up, tail high | Collect animation |
| Belly up | On its back, paws loose in the air | Collected |
| Tail-up greeting | Standing, tail straight up with a hooked tip (a friendly hello) | Collected |
| Slow blink | Eyes close slowly halfway, then open (cat "I trust you") | Collect animation |
| Pounce wiggle | Crouched, rear wiggling, then a hop | Collect animation |
| Kneading | Front paws pushing alternately ("making biscuits") | Collected |
| Grooming | Licking a raised paw | Collected |
| Head bump | Leans in and bumps the camera or Tinta | Collect animation |

### Update: dynamic poses, checked against sources (2026-11-11)

His photos are random moments, mostly lying down: use them **only for each cat's looks**. The poses must be dynamic reactions that match real cats: a "you caught me!" moment, then an "I'm happy" greeting. What the sources confirm:

- **Happy greeting (confirmed):** tail straight up with a quivering tip means happiness and excitement. A trill or chirrup is a friendly greeting call (International Cat Care). Use this as the main "found" reaction: trot toward Tinta with the tail up, the tip quivering, and a trill sound. https://info.pangovet.com/pet-behavior/cats/cat-tail-language · https://icatcare.org/?p=1069
- **The "Halloween" arch is fear, not fun (confirmed):** an arched back with raised fur and a puffed tail means fear or defence. Don't use it as a cute "caught" pose. For a playful "caught!" use a short freeze with wide eyes and ears forward, or a little startle hop, and then go straight into the greeting. https://www.vetstreet.com/our-pet-experts/why-does-my-cat-arch-her-back · https://www.kinship.com/cat-behavior/why-do-cats-tails-puff-up
- **Belly-up roll (myth checked):** it shows comfort and trust, not an invitation to touch the belly. Fine as a "found and relaxed" end pose. https://www.torontohumanesociety.com/the-cat-tummy-trap-explained
- **Pictures to check yourself:** the Cats Protection body-language visual guide (PDF with drawings): https://www.cats.org.uk/media/12456/acb_7562-cat-body-language-visual-guide-print-final.pdf
- **Motion reference (public domain):** Muybridge plate 716, "Cat; walking; change to galloping" (https://www.nga.gov/artworks/220470-plate-number-716-cat-walking-change-galloping), and the Dover book "Animals in Motion" (https://ia601401.us.archive.org/35/items/animalsmotion00muyb/animalsmotion00muyb.pdf). The plates show poses but not timing, so pair them with video.
- **Not verified:** exact ear, whisker and pupil details, and sources for zoomies, the pounce wiggle, head-bunting and kneading. They are well known from cat behaviour, but check the visual guide before relying on fine details.

Suggested sequence per cat: idle hiding pose (peeking, loaf, tail flick) → caught: a 0.2 s freeze, wide eyes, ears forward, a small hop → greeting: tail up with quivering tip, trot or head bump toward Tinta, trill → found pose: its own happy end pose (tail-up sit, sploot, belly-up, kneading, grooming). Vary the end pose per cat.

Collect feedback: 2–3 channels (pose change, a small sound like a chirp or purr, and a counter tick or name label such as "Oreo found 4/13"), shorter and calmer under `prefers-reduced-motion`. The cat list in the plain-list path can show which ones were found.
