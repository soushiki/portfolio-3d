import * as THREE from 'three';

const NAVY = '#22223B';
const SLATE = '#4A4E69';
const CREAM = '#F2E9E4';
const ROSE = '#C9ADA7';

// Wraps text into lines that fit maxWidth with the context's current font.
function wrap(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
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

// Board texture: title, optional subtitle and tag chips.
export function makeSignTexture({ title, subtitle, tags = [], accent = SLATE }, renderer) {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 28);

  ctx.fillStyle = NAVY;
  ctx.textBaseline = 'top';
  let size = 140;
  ctx.font = `600 ${size}px "Mozilla Headline", "Outfit", sans-serif`;
  let lines = wrap(ctx, title, W - 120);
  while (lines.length > 2 && size > 70) {
    size -= 10;
    ctx.font = `600 ${size}px "Mozilla Headline", "Outfit", sans-serif`;
    lines = wrap(ctx, title, W - 120);
  }
  let y = 70;
  for (const line of lines) {
    ctx.fillText(line, 60, y);
    y += size * 1.05;
  }

  if (subtitle) {
    ctx.fillStyle = SLATE;
    ctx.font = '500 46px "Outfit", sans-serif';
    for (const line of wrap(ctx, subtitle, W - 120).slice(0, 2)) {
      y += 6;
      ctx.fillText(line, 60, y);
      y += 52;
    }
  }

  if (tags.length) {
    // Shrink the chips until every tag fits on one row.
    let chipFont = 50;
    const rowWidth = () => tags.reduce((sum, t) => sum + ctx.measureText(t).width + 52 + 16, -16);
    ctx.font = `600 ${chipFont}px "Outfit", sans-serif`;
    while (rowWidth() > W - 120 && chipFont > 30) {
      chipFont -= 4;
      ctx.font = `600 ${chipFont}px "Outfit", sans-serif`;
    }
    let x = 60;
    const chipY = H - 112;
    for (const tag of tags) {
      const w = ctx.measureText(tag).width + 52;
      if (x + w > W - 60) break;
      ctx.fillStyle = ROSE;
      roundRect(ctx, x, chipY, w, 76, 38);
      ctx.fill();
      ctx.fillStyle = NAVY;
      ctx.textBaseline = 'middle';
      ctx.fillText(tag, x + 26, chipY + 40);
      x += w + 16;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}
