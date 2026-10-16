import * as THREE from 'three';

// Ground textures drawn on a canvas at startup, so they cost no download.
function canvasTexture(size, draw, renderer, repeat) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  draw(ctx, size, mulberry(size));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function mulberry(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Draws `fn(x, y)` at every wrapped offset so marks near an edge tile seamlessly.
function wrapped(size, x, y, fn) {
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) fn(x + dx, y + dy);
}

export function grassTexture(renderer, repeat = [24, 24]) {
  return canvasTexture(
    256,
    (ctx, s, rand) => {
      ctx.fillStyle = '#6c9a4a';
      ctx.fillRect(0, 0, s, s);
      // Soft patches of lighter and darker lawn
      for (let i = 0; i < 40; i++) {
        const x = rand() * s;
        const y = rand() * s;
        const r = 12 + rand() * 30;
        ctx.fillStyle = rand() > 0.5 ? 'rgba(130,170,85,0.25)' : 'rgba(70,110,50,0.22)';
        wrapped(s, x, y, (px, py) => {
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // Blades
      const blades = ['#5d8a3f', '#7fae58', '#8fbc63', '#4f7a36'];
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2600; i++) {
        const x = rand() * s;
        const y = rand() * s;
        const len = 2 + rand() * 4;
        const lean = (rand() - 0.5) * 2;
        ctx.strokeStyle = blades[(rand() * blades.length) | 0];
        wrapped(s, x, y, (px, py) => {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + lean, py - len);
          ctx.stroke();
        });
      }
    },
    renderer,
    repeat,
  );
}

export function asphaltTexture(renderer, repeat) {
  return canvasTexture(
    256,
    (ctx, s, rand) => {
      ctx.fillStyle = '#53555c';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 9000; i++) {
        const v = 60 + rand() * 60;
        ctx.fillStyle = `rgba(${v},${v},${v + 6},${0.35 + rand() * 0.4})`;
        ctx.fillRect(rand() * s, rand() * s, 1 + rand() * 1.5, 1 + rand() * 1.5);
      }
      // A few darker patches and cracks
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = 'rgba(30,30,36,0.18)';
        const x = rand() * s;
        const y = rand() * s;
        const r = 10 + rand() * 25;
        wrapped(s, x, y, (px, py) => {
          ctx.beginPath();
          ctx.ellipse(px, py, r, r * 0.6, rand() * 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },
    renderer,
    repeat,
  );
}

export function pavingTexture(renderer, repeat) {
  return canvasTexture(
    256,
    (ctx, s, rand) => {
      const tiles = 4;
      const t = s / tiles;
      ctx.fillStyle = '#9d978f';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < tiles; i++) {
        for (let j = 0; j < tiles; j++) {
          const v = 196 + rand() * 22;
          ctx.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
          ctx.fillRect(i * t + 3, j * t + 3, t - 6, t - 6);
        }
      }
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(120,115,108,${rand() * 0.25})`;
        ctx.fillRect(rand() * s, rand() * s, 1.5, 1.5);
      }
    },
    renderer,
    repeat,
  );
}
