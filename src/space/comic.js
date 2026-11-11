import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Comic shading for everything in the space world (see docs/fable/ART-BIBLE.md).
// - Two flat colour bands (lit / shadow), the shadow hue-shifted toward violet.
// - Screen-space halftone dots inside the shadow band: the always-on signature.
// - A thin lit highlight band and no smooth gradients.
// - Inverted-hull ink outlines, width roughly constant on screen.
// Lighting is a fixed key light in view space, so no scene lights are needed.

export const INK = new THREE.Color('#16122E');
const LIGHT_DIR = new THREE.Vector3(-0.45, 0.75, 0.5).normalize();
const SHADOW_TINT = new THREE.Color(0.58, 0.5, 0.86);

const shared = {
  uLight: { value: LIGHT_DIR },
  uInk: { value: INK },
  uDot: { value: 7.0 }, // halftone cell size in CSS pixels
  uPixelRatio: { value: 1 },
  uOutline: { value: 0.0045 },
};

export function setPixelRatio(pr) {
  shared.uPixelRatio.value = pr;
}

const comicVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const comicFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShadow;
  uniform vec3 uInk;
  uniform vec3 uLight;
  uniform float uDot;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uFlash;
  uniform float uSoft;
  uniform vec3 uRim;
  uniform float uRimAmt;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float d = dot(n, uLight);
    // uSoft widens the band edge into a short ramp (fur); 0 keeps the hard comic step.
    float lit = smoothstep(0.08 - uSoft, 0.08 + uSoft + 0.0001, d);
    vec3 col = mix(uShadow, uColor, lit);
    // Highlight band
    col = mix(col, mix(uColor, vec3(1.0), 0.35), step(0.86, d));
    // Halftone dots grow as the surface turns away from the light.
    vec2 p = gl_FragCoord.xy / (uDot * uPixelRatio);
    p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
    float r = length(fract(p) - 0.5);
    float amount = clamp((0.08 - d) * 0.9, 0.0, 0.55);
    float dots = 1.0 - smoothstep(amount - 0.04, amount + 0.02, r);
    col = mix(col, uInk, dots * 0.45 * (1.0 - lit));
    // Ink rim on the dark side edge, so silhouettes stay crisp against space.
    float rim = 1.0 - abs(dot(n, normalize(vView)));
    col = mix(col, uInk, smoothstep(0.82, 0.95, rim) * (1.0 - lit) * 0.6);
    // Rim light tinted to the coat on the lit side: reads as a soft, fluffy edge.
    col = mix(col, uRim, smoothstep(0.55, 0.9, rim) * lit * uRimAmt);
    col = mix(col, vec3(1.0), uFlash);
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;

const outlineVertex = /* glsl */ `
  uniform float uOutline;
  uniform float uScale;
  uniform float uBias;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    // Push along the view-space normal, scaled by depth so the line width stays steady on screen.
    mv.xyz += n * uOutline * uScale * max(-mv.z, 1.0);
    // Push the hull away from the camera: where it crosses another part of the same model it
    // falls behind that part's surface, so only the outer silhouette keeps its line.
    mv.z -= uBias;
    gl_Position = projectionMatrix * mv;
  }
`;

const outlineFragment = /* glsl */ `
  uniform vec3 uInk;
  void main() {
    gl_FragColor = vec4(uInk, 1.0);
    #include <colorspace_fragment>
  }
`;

const materialCache = new Map();

// Comic material for one flat colour. `extra` mirrors the few MeshStandard options the
// landmark builders pass: transparent/opacity, emissive (treated as "no shadow band").
export function comicMaterial(color, extra = {}) {
  const key = `${color}|${extra.transparent ? extra.opacity : ''}|${extra.emissive ? 'e' : ''}|${extra.side ?? ''}|${extra.soft ?? ''}|${extra.rim ?? ''}`;
  if (materialCache.has(key)) return materialCache.get(key);
  const base = new THREE.Color(color);
  const shadow = extra.emissive ? base.clone().multiplyScalar(0.92) : base.clone().multiply(SHADOW_TINT);
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: base },
      uShadow: { value: shadow },
      uOpacity: { value: extra.transparent ? extra.opacity ?? 0.4 : 1 },
      uFlash: { value: 0 },
      uSoft: { value: extra.soft ?? 0 },
      uRim: { value: new THREE.Color(extra.rim ?? '#FFFFFF') },
      uRimAmt: { value: extra.rim ? 0.55 : 0 },
      uInk: shared.uInk,
      uLight: shared.uLight,
      uDot: shared.uDot,
      uPixelRatio: shared.uPixelRatio,
    },
    vertexShader: comicVertex,
    fragmentShader: comicFragment,
    transparent: Boolean(extra.transparent),
    depthWrite: extra.depthWrite ?? !extra.transparent,
    side: extra.side ?? THREE.FrontSide,
  });
  m.userData.noOutline = Boolean(extra.transparent) || extra.side === THREE.DoubleSide;
  materialCache.set(key, m);
  return m;
}

const outlineMaterials = new Map();
function outlineMaterial(scale, bias = 0) {
  const k = `${scale.toFixed(2)}|${bias.toFixed(2)}`;
  if (!outlineMaterials.has(k)) {
    outlineMaterials.set(
      k,
      new THREE.ShaderMaterial({
        uniforms: { uInk: shared.uInk, uOutline: shared.uOutline, uScale: { value: scale }, uBias: { value: bias } },
        vertexShader: outlineVertex,
        fragmentShader: outlineFragment,
        side: THREE.BackSide,
      }),
    );
  }
  return outlineMaterials.get(k);
}

// Hard-edged geometry (boxes, cones) has split normals, which would tear the hull at corners.
// The outline copy gets welded vertices and smooth normals instead.
const hullCache = new WeakMap();
function hullGeometry(geo) {
  if (hullCache.has(geo)) return hullCache.get(geo);
  const g = geo.clone();
  for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name);
  const welded = mergeVertices(g, 1e-4);
  welded.computeVertexNormals();
  hullCache.set(geo, welded);
  return welded;
}

// Adds an ink outline mesh to every opaque mesh under `root`.
// `scale` thickens (1.6) or thins (0.6) the line for hero vs background pieces.
// Options: `bias` pushes hulls back so inner crossings vanish (multi-part characters);
// meshes with userData.outline === 0 get no hull, and userData.outline = k scales its width.
export function addOutlines(root, scale = 1, { bias = 0 } = {}) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline && !o.material.userData?.noOutline && o.userData.outline !== 0) meshes.push(o);
  });
  for (const mesh of meshes) {
    const k = mesh.userData.outline ?? 1;
    const hull = new THREE.Mesh(hullGeometry(mesh.geometry), outlineMaterial(scale * k, bias));
    hull.userData.isOutline = true;
    hull.renderOrder = -1;
    mesh.add(hull);
  }
  return root;
}

// Canvas sprite for short in-world labels (planet banners). Real text lives in the HTML card.
export function bannerSprite(text, { color = '#FFD23F', number = '' } = {}) {
  const font = '"Bangers", "Outfit", system-ui, sans-serif';
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `64px ${font}`;
  const label = number ? `${number}  ${text}` : text;
  const w = Math.ceil(ctx.measureText(label).width) + 80;
  c.width = w;
  c.height = 112;
  ctx.font = `64px ${font}`;
  ctx.textBaseline = 'middle';
  // Offset ink shadow, then the panel, then the label.
  ctx.fillStyle = '#16122E';
  roundRect(ctx, 10, 14, w - 14, 92, 14);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, 4, 6, w - 14, 92, 14);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#16122E';
  ctx.stroke();
  ctx.fillStyle = '#16122E';
  ctx.fillText(label, 40, 56);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const h = 1.5;
  sprite.scale.set((h * w) / c.height, h, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
