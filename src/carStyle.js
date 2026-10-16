import * as THREE from 'three';

// Kenney models colour themselves by pointing UVs at swatches in a shared
// 512x512 palette (16 columns x 4 rows of 32x128 px cells). Recolouring a
// part means moving its UVs from one cell to another.
const COLS = 16;
const ROWS = 4;

const cellOf = (u, v) => [Math.floor(u * COLS), Math.floor(v * ROWS)];

function remapCell(mesh, from, to) {
  const uv = mesh.geometry.attributes.uv;
  const du = (to[0] - from[0]) / COLS;
  const dv = (to[1] - from[1]) / ROWS;
  for (let i = 0; i < uv.count; i++) {
    const [c, r] = cellOf(uv.getX(i), uv.getY(i));
    if (c === from[0] && r === from[1]) uv.setXY(i, uv.getX(i) + du, uv.getY(i) + dv);
  }
  uv.needsUpdate = true;
}

// Thin ribbons laid over the top of `body`, found by casting rays straight
// down. Only hits on the paint swatch get stripe, so glass is left clear.
function addStripes(body, paintCell, { offsets, width, step = 0.04, lift = 0.008 }) {
  body.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(body);
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const local = new THREE.Vector3();
  const positions = [];

  const sample = (x, z) => {
    ray.set(new THREE.Vector3(x, box.max.y + 1, z), down);
    const hit = ray.intersectObject(body, false)[0];
    if (!hit || !hit.uv) return null;
    const [c, r] = cellOf(hit.uv.x, hit.uv.y);
    if (c !== paintCell[0] || r !== paintCell[1]) return null;
    return body.worldToLocal(local.copy(hit.point)).clone().add(new THREE.Vector3(0, lift, 0));
  };

  for (const cx of offsets) {
    let prev = null;
    for (let z = box.min.z; z <= box.max.z; z += step) {
      const left = sample(cx - width / 2, z);
      const right = sample(cx + width / 2, z);
      const cur = left && right ? [left, right] : null;
      if (cur && prev) {
        const [a, b] = prev;
        const [c, d] = cur;
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        positions.push(b.x, b.y, b.z, d.x, d.y, d.z, c.x, c.y, c.z);
      }
      prev = cur;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  const stripes = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: '#141418',
      roughness: 0.45,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  );
  body.add(stripes);
}

// Yellow muscle car with twin black stripes, built from Kenney's sedan-sports.
const RED = [13, 1];
const YELLOW = [3, 3];
const DARK = [5, 2];

export function styleSportsCar(model) {
  model.updateMatrixWorld(true);
  const body = model.getObjectByName('body');
  const spoiler = model.getObjectByName('spoiler');
  remapCell(body, RED, YELLOW);
  if (spoiler) remapCell(spoiler, RED, DARK);
  addStripes(body, YELLOW, { offsets: [-0.1, 0.1], width: 0.1 });
  return model;
}
