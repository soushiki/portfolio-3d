import * as THREE from 'three';

// Finds leftover or doubled parts in a model: two meshes with the same geometry (type and
// parameters, or the very same geometry object) at the same world transform. Outline hulls are
// ignored. Returns a list of { a, b, key } pairs; an empty list means the model is clean.
export function findDuplicateMeshes(root) {
  root.updateWorldMatrix(true, true);
  const seen = new Map();
  const dupes = [];
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const r = (v) => (Math.round(v * 1000) / 1000).toFixed(3);
  root.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline) return;
    o.matrixWorld.decompose(p, q, s);
    const geo = o.geometry;
    const geoKey = `${geo.type}:${JSON.stringify(geo.parameters ?? geo.uuid)}`;
    const key = [geoKey, r(p.x), r(p.y), r(p.z), r(q.x), r(q.y), r(q.z), r(q.w), r(s.x), r(s.y), r(s.z)].join('|');
    if (seen.has(key)) dupes.push({ a: seen.get(key), b: o, key });
    else seen.set(key, o);
  });
  return dupes;
}

// Meshes with more than one outline hull (addOutlines called twice on the same part).
export function findDoubleOutlines(root) {
  const bad = [];
  root.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline) return;
    const hulls = o.children.filter((c) => c.userData?.isOutline).length;
    if (hulls > 1) bad.push({ mesh: o, hulls });
  });
  return bad;
}
