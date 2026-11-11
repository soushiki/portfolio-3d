import { PROJECTS, DATA_SCIENCE, DATA_SCIENCE_HUB, CONTACT_ZONE, INTRO_ZONE } from '../data.js';

// The guided tour: planets left to right, in this order. Standing rule: the featured order matches
// the 2D site (sebherr.netlify.app): Minoscreto, Ingresos, Formato Médico, Data science. Whisker Gacha
// is an earlier build there; here it stays as a bonus planet (it carries two secret cats). Each planet has stops along its
// upper arc; the hero walks clockwise over the top (left = 150°, top = 90°, right = 30°).
// See docs/fable/PLAN.md "Project selection" for why these projects and this order.

const byId = (list, id) => list.find((p) => p.id === id);

// Angles in degrees on the planet rim. `launch` is where the hop to the next planet starts.
export const ROUTE = [
  {
    id: 'hello',
    number: '00',
    radius: 6,
    color: '#FFF1C9',
    accent: '#FFD23F',
    style: 'moon',
    stops: [{ angle: 90, landmark: 'welcome', item: INTRO_ZONE }],
    launch: 35,
  },
  {
    id: 'minoscreto',
    number: '01',
    radius: 7,
    color: '#3FD0B6',
    accent: '#0F8F7E',
    style: 'facet',
    stops: [{ angle: 92, landmark: 'vault', item: byId(PROJECTS, 'minoscreto') }],
    launch: 35,
  },
  {
    id: 'ingresos',
    number: '02',
    radius: 7.5,
    color: '#8EDB5A',
    accent: '#3C8D2F',
    style: 'banded',
    stops: [{ angle: 92, landmark: 'bank', item: byId(PROJECTS, 'ingresos') }],
    launch: 35,
  },
  {
    id: 'formato',
    number: '03',
    radius: 7,
    color: '#FF7A6B',
    accent: '#C8102E',
    style: 'pill',
    stops: [{ angle: 92, landmark: 'hospital', item: byId(PROJECTS, 'formato') }],
    launch: 35,
  },
  {
    id: 'data',
    number: '04',
    radius: 11,
    color: '#5AA9FF',
    accent: '#2456C9',
    style: 'cratered',
    stops: [
      { angle: 128, landmark: 'dataTower', item: DATA_SCIENCE_HUB },
      { angle: 104, landmark: 'mailbox', item: byId(DATA_SCIENCE, 'ds-email') },
      { angle: 80, landmark: 'windTurbine', item: byId(DATA_SCIENCE, 'ds-grid') },
      { angle: 56, landmark: 'streetClock', item: byId(DATA_SCIENCE, 'ds-311') },
    ],
    launch: 30,
  },
  {
    id: 'gacha',
    number: '05',
    radius: 7,
    color: '#FF8FC7',
    accent: '#A23C8E',
    style: 'capsule',
    stops: [{ angle: 92, landmark: 'gachaMachine', item: byId(PROJECTS, 'gacha') }],
    launch: 35,
  },
  {
    id: 'contact',
    number: '06',
    radius: 6.5,
    color: '#FFD23F',
    accent: '#E0A100',
    style: 'moon',
    stops: [{ angle: 90, landmark: 'beacon', item: CONTACT_ZONE }],
    launch: null,
  },
];

// Planets sit on a gentle wave in the z = 0 plane, spaced by their radii.
let x = 0;
ROUTE.forEach((p, i) => {
  if (i > 0) x += ROUTE[i - 1].radius + p.radius + 13;
  p.x = x;
  p.y = Math.sin(i * 1.3) * 5;
  p.index = i;
});

// Secret cats (Sebastian's 13 cats, see cats.js) per planet, on the underside, off the route.
const CAT_PLACES = {
  hello: ['skipper'],
  minoscreto: ['ash', 'hazel'],
  ingresos: ['java', 'orange'],
  data: ['collie', 'duly', 'rosie'],
  formato: ['nara', 'pelusa'],
  gacha: ['charlie', 'panda'],
  contact: ['oreo'],
};
const CAT_ANGLES = { 1: [270], 2: [242, 298], 3: [232, 270, 308] };
for (const p of ROUTE) {
  const ids = CAT_PLACES[p.id] ?? [];
  p.cats = ids.map((id, i) => ({ id, angle: CAT_ANGLES[ids.length][i] }));
}

// Projects that are only in the plain list ("Earlier builds"), with the reason they're not on a planet.
export const LIST_ONLY = ['gacha', 'brasa', 'davinci', 'apod', 'gym', 'todo', 'reddit', 'jammming'];

// Where the hero stands for each stop: about 2.6 units left of the landmark, facing it,
// so it never hides the landmark.
for (const p of ROUTE) for (const s of p.stops) s.stand = s.angle + ((2.6 / p.radius) * 180) / Math.PI;

// Back star pad on the left shoulder of every planet except the first, clear of the arrival point.
for (const p of ROUTE) p.back = p.index > 0 ? p.stops[0].stand + 40 : null;

// Flat list of every stop, in tour order (used by Next / Back and the planet strip).
export const STOPS = ROUTE.flatMap((planet) => planet.stops.map((s) => ({ ...s, planet })));
