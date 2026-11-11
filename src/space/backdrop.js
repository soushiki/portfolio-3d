import * as THREE from 'three';

// One full-screen shader draws all of space: a violet gradient, halftone nebula blobs,
// four-point ink stars, and a distant ringed planet. It reads the camera position for a
// slow parallax, so the 2D layers slide behind the planets. Cost: one triangle.

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uCam;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uStars;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // Four-point star: two thin crossed diamonds.
  float star(vec2 p, float size) {
    p = abs(p) / size;
    float a = 1.0 - smoothstep(0.0, 0.08, p.x * 0.18 + p.y);
    float b = 1.0 - smoothstep(0.0, 0.08, p.y * 0.18 + p.x);
    return max(a, b);
  }

  vec3 starLayer(vec2 uv, float scale, float seed, vec3 col, float twinkle) {
    vec2 g = uv * scale;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + seed);
    if (h > uStars) return vec3(0.0);
    vec2 off = vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5;
    float size = mix(0.18, 0.42, hash(id + seed + 1.3));
    float tw = 1.0 + twinkle * 0.25 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
    return col * star(f - off * 0.5, size * tw);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy / uPixelRatio;
    float aspect = uRes.x / uRes.y;
    vec2 uv = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

    // Base gradient: deep violet at the top to ink-blue at the bottom.
    vec3 top = vec3(0.17, 0.10, 0.36);
    vec3 bottom = vec3(0.06, 0.05, 0.16);
    vec3 col = mix(bottom, top, smoothstep(-0.6, 0.6, uv.y));

    // Halftone nebulae: soft blobs drawn as dots on a rotated grid (slowest parallax layer).
    vec2 nebUv = uv + uCam * 0.006;
    float neb = 0.0;
    neb += 0.9 * exp(-dot(nebUv - vec2(-0.55, 0.25), nebUv - vec2(-0.55, 0.25)) * 5.0);
    neb += 0.7 * exp(-dot(nebUv - vec2(0.75, -0.2), nebUv - vec2(0.75, -0.2)) * 4.0);
    neb += 0.6 * exp(-dot(nebUv - vec2(2.2, 0.3), nebUv - vec2(2.2, 0.3)) * 3.0);
    neb += 0.6 * exp(-dot(nebUv - vec2(-1.9, -0.25), nebUv - vec2(-1.9, -0.25)) * 3.0);
    vec2 cell = mat2(0.7071, -0.7071, 0.7071, 0.7071) * frag / 9.0;
    float r = length(fract(cell) - 0.5);
    float dots = 1.0 - smoothstep(neb * 0.5 - 0.03, neb * 0.5 + 0.03, r);
    vec3 nebCol = mix(vec3(0.85, 0.25, 0.55), vec3(0.2, 0.75, 0.9), smoothstep(-1.0, 1.0, nebUv.x));
    col = mix(col, nebCol, dots * 0.35);

    // Distant ringed planet, small and dimmed so it never reads as a stop on the route.
    vec2 pp = uv + uCam * 0.002 - vec2(-0.62, 0.33);
    float pr = length(pp);
    float planet = 1.0 - smoothstep(0.052, 0.056, pr);
    vec3 pcol = mix(vec3(0.62, 0.36, 0.42), vec3(0.42, 0.24, 0.42), step(0.01, pp.x - pp.y * 0.6));
    vec2 rp = mat2(0.94, -0.34, 0.34, 0.94) * pp;
    float ring = smoothstep(0.007, 0.0, abs(length(rp * vec2(1.0, 3.6)) - 0.085));
    float ringFront = ring * step(0.0, -rp.y);
    col = mix(col, pcol, planet);
    col = mix(col, vec3(0.72, 0.6, 0.42), max(ring * (1.0 - planet), ringFront) * 0.8);

    // Stars: three parallax layers.
    float tw = 1.0;
    col += starLayer(uv + uCam * 0.004, 9.0, 1.0, vec3(0.75, 0.7, 1.0), tw);
    col += starLayer(uv + uCam * 0.008, 6.0, 4.0, vec3(1.0, 0.95, 0.8), tw);
    col += starLayer(uv + uCam * 0.014, 3.5, 9.0, vec3(1.0, 0.85, 0.35), tw);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createBackdrop({ low }) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uCam: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uStars: { value: low ? 0.18 : 0.26 },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, depthWrite: false, depthTest: false }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return {
    mesh,
    resize(w, h, pr) {
      uniforms.uRes.value.set(w, h);
      uniforms.uPixelRatio.value = pr;
    },
    update(camX, camY, time) {
      uniforms.uCam.value.set(camX, camY);
      uniforms.uTime.value = time;
    },
  };
}
