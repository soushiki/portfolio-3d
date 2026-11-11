// Run with: node tests/modelcheck.mjs
// Fails (exit 1) when any landmark, planet piece, the hero or a secret cat has duplicate meshes
// (same geometry at the same transform) or a part with more than one outline hull.
import { makeLandmark } from '../src/landmarks.js';
import { comicMaterial, addOutlines } from '../src/space/comic.js';
import { makeCat } from '../src/space/hero.js';
import { CATS, makeSecretCat } from '../src/space/cats.js';
import { findDuplicateMeshes, findDoubleOutlines } from '../src/space/modelcheck.js';
import * as THREE from 'three';

// Node has no canvas: give the tuft texture a stub so the cats can be built.
globalThis.document = {
  createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => {} }), width: 0, height: 0 }),
};

const KINDS = ['welcome', 'vault', 'bank', 'dataTower', 'mailbox', 'windTurbine', 'streetClock', 'hospital', 'gachaMachine', 'beacon',
  'observatory', 'gym', 'restaurant', 'bookStack', 'clipboard', 'forumHall', 'speakers'];

let failures = 0;
const report = (name, root) => {
  const d = findDuplicateMeshes(root);
  const o = findDoubleOutlines(root);
  if (d.length || o.length) {
    failures++;
    console.log(`FAIL ${name}: ${d.length} duplicate mesh pair(s), ${o.length} part(s) with extra outline hulls`);
    for (const { key } of d.slice(0, 5)) console.log('   dup', key.slice(0, 120));
  } else console.log(`ok   ${name}`);
};

for (const kind of KINDS) {
  const lm = makeLandmark(kind, comicMaterial);
  const holder = new THREE.Group();
  holder.add(lm.group);
  addOutlines(holder, 1, { bias: 0.22 });
  report(`landmark ${kind}`, holder);
}
report('hero Tinta', makeCat({ coat: 'tuxedo', gear: true }).group);
for (const spec of CATS) report(`cat ${spec.id}`, makeSecretCat(spec).root);

console.log(failures ? `\n${failures} model(s) failed` : '\nall models clean');
process.exit(failures ? 1 : 0);
