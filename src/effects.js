export const effects = {
  invert(ctx, polygon) {
    const { x, y, w, h } = bboxOf(polygon);
    if (w <= 0 || h <= 0) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    temp.getContext("2d").putImageData(imageData, 0, 0);

    ctx.save();
    tracePolygon(ctx, polygon);
    ctx.clip();
    ctx.drawImage(temp, x, y);
    ctx.restore();
  },

  grayscale(ctx, polygon) {
    const { x, y, w, h } = bboxOf(polygon);
    if (w <= 0 || h <= 0) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    temp.getContext("2d").putImageData(imageData, 0, 0);

    ctx.save();
    tracePolygon(ctx, polygon);
    ctx.clip();
    ctx.drawImage(temp, x, y);
    ctx.restore();
  },

  pixelate(ctx, polygon) {
    const { x, y, w, h } = bboxOf(polygon);
    if (w <= 0 || h <= 0) return;

    const block = 10;
    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    const out = ctx.createImageData(w, h);
    const outData = out.data;

    for (let by = 0; by < h; by += block) {
      for (let bx = 0; bx < w; bx += block) {
        const cx = Math.min(bx + (block >> 1), w - 1);
        const cy = Math.min(by + (block >> 1), h - 1);
        const idx = (cy * w + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const yMax = Math.min(by + block, h);
        const xMax = Math.min(bx + block, w);
        for (let py = by; py < yMax; py++) {
          for (let px = bx; px < xMax; px++) {
            const oi = (py * w + px) * 4;
            outData[oi] = r;
            outData[oi + 1] = g;
            outData[oi + 2] = b;
            outData[oi + 3] = 255;
          }
        }
      }
    }

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    temp.getContext("2d").putImageData(out, 0, 0);

    ctx.save();
    tracePolygon(ctx, polygon);
    ctx.clip();
    ctx.drawImage(temp, x, y);
    ctx.restore();
  },

  glitch(ctx, polygon) {
    const { x, y, w, h } = bboxOf(polygon);
    if (w <= 0 || h <= 0) return;

    const snapshot = document.createElement("canvas");
    snapshot.width = w;
    snapshot.height = h;
    snapshot.getContext("2d").drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);

    const sliceCount = 12;
    const sliceHeight = Math.ceil(h / sliceCount);
    const maxShift = Math.max(8, Math.round(w * 0.06));

    ctx.save();
    tracePolygon(ctx, polygon);
    ctx.clip();
    ctx.clearRect(x, y, w, h);
    for (let i = 0; i < sliceCount; i++) {
      const sy = i * sliceHeight;
      const sh = Math.min(sliceHeight, h - sy);
      const shift = ((Math.random() * 2) - 1) * maxShift;
      ctx.drawImage(snapshot, 0, sy, w, sh, x + shift, y + sy, w, sh);
    }
    ctx.restore();
  },

  hueRotate(ctx, polygon) {
    const { x, y, w, h } = bboxOf(polygon);
    if (w <= 0 || h <= 0) return;

    const angle = ((Date.now() / 20) % 360) / 360;

    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const [hh, ss, ll] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      const [nr, ng, nb] = hslToRgb((hh + angle) % 1, ss, ll);
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    temp.getContext("2d").putImageData(imageData, 0, 0);

    ctx.save();
    tracePolygon(ctx, polygon);
    ctx.clip();
    ctx.drawImage(temp, x, y);
    ctx.restore();
  },
};

function bboxOf(polygon) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const x = Math.max(0, Math.floor(minX));
  const y = Math.max(0, Math.floor(minY));
  const w = Math.ceil(maxX) - x;
  const h = Math.ceil(maxY) - y;
  return { x, y, w, h };
}

function tracePolygon(ctx, polygon) {
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h, s;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return (p + (q - p) * 6 * t) * 255;
  if (t < 1 / 2) return q * 255;
  if (t < 2 / 3) return (p + (q - p) * (2 / 3 - t) * 6) * 255;
  return p * 255;
}
